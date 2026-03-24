"""
MESSY DRIVER — Lab 2 Starter Code
===================================
This is a tangled instrument driver. It mixes:
  - Serial setup / transport
  - Command formatting
  - Response parsing
  - Error handling
  - Data conversion
  - Hardcoded config

YOUR TASK (Lab 2):
  1. Read through and mark the seams (transitions between concerns).
  2. Extract the transport layer (read/write) into a Transport class.
  3. Extract response parsing into pure functions.
  4. The driver should still work with the simulated backend after refactoring.

NOTE: This uses a fake "serial" interface for classroom use.
      The FakeSerial class at the bottom simulates a serial port.
"""

import time
import math
import random


# ---- Hardcoded configuration (bad!) ----
PORT = "COM3"
BAUD = 9600
TIMEOUT = 2.0


class InstrumentDriver:
    """A messy driver that does everything in one class."""

    def __init__(self):
        self.serial = None
        self.connected = False
        self._start_time = None

    def connect(self):
        # Hardcoded serial setup — transport concern
        print(f"Opening {PORT} at {BAUD} baud...")
        self.serial = FakeSerial(PORT, BAUD, timeout=TIMEOUT)
        time.sleep(0.3)  # wait for device
        self.serial.reset_input_buffer()
        self.connected = True
        self._start_time = time.time()

        # Immediately ask for ID — protocol concern mixed with transport
        self.serial.write(b"*IDN?\n")
        response = self.serial.readline().decode("ascii").strip()
        if not response:
            print("WARNING: No IDN response!")
        else:
            print(f"Connected to: {response}")

    def read_temperature(self):
        if not self.connected:
            raise Exception("Not connected!")

        # Command formatting — protocol concern
        cmd = "READ:TEMP\n"
        self.serial.write(cmd.encode("ascii"))

        # Reading response — transport concern
        raw = self.serial.readline().decode("ascii").strip()
        if not raw:
            # Retry logic — error handling concern
            print("Timeout! Retrying...")
            time.sleep(0.5)
            self.serial.write(cmd.encode("ascii"))
            raw = self.serial.readline().decode("ascii").strip()
            if not raw:
                raise TimeoutError("No response after retry")

        # Parsing — data conversion concern
        if not raw.startswith("TEMP:"):
            raise ValueError(f"Unexpected response: {raw}")

        try:
            value_str = raw.split(":")[1]
            temp_c = float(value_str)
        except (IndexError, ValueError) as e:
            raise ValueError(f"Cannot parse '{raw}': {e}")

        # Unit conversion — data concern
        temp_f = temp_c * 9 / 5 + 32

        # Formatting — display concern (shouldn't be in a driver!)
        print(f"  Temp: {temp_c:.2f} °C / {temp_f:.2f} °F")

        return temp_c

    def read_voltage(self):
        if not self.connected:
            raise Exception("Not connected!")

        # Same pattern repeated (DRY violation)
        cmd = "READ:VOLT\n"
        self.serial.write(cmd.encode("ascii"))
        raw = self.serial.readline().decode("ascii").strip()

        if not raw:
            print("Timeout! Retrying...")
            time.sleep(0.5)
            self.serial.write(cmd.encode("ascii"))
            raw = self.serial.readline().decode("ascii").strip()
            if not raw:
                raise TimeoutError("No response after retry")

        if not raw.startswith("VOLT:"):
            raise ValueError(f"Unexpected response: {raw}")

        try:
            value_str = raw.split(":")[1]
            voltage = float(value_str)
        except (IndexError, ValueError) as e:
            raise ValueError(f"Cannot parse '{raw}': {e}")

        print(f"  Voltage: {voltage:.3f} V")
        return voltage

    def set_interval(self, ms):
        if not self.connected:
            raise Exception("Not connected!")
        cmd = f"SET:INTERVAL:{ms}\n"
        self.serial.write(cmd.encode("ascii"))
        raw = self.serial.readline().decode("ascii").strip()
        if raw != "OK":
            print(f"WARNING: unexpected response to SET: {raw}")

    def disconnect(self):
        if self.serial:
            self.serial.close()
        self.connected = False
        print("Disconnected.")


# ============================================================
# FAKE SERIAL — simulates a serial port for classroom use.
# DO NOT MODIFY THIS — it replaces a real serial.Serial object.
# ============================================================

class FakeSerial:
    """Simulates a serial instrument for classroom use."""

    def __init__(self, port, baudrate, timeout=1):
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout
        self._start = time.time()
        self._buffer = b""

    def write(self, data):
        cmd = data.decode("ascii").strip()
        t = time.time() - self._start
        if cmd == "*IDN?":
            self._buffer = b"FakeInstrument,v1.0,SN9999\n"
        elif cmd == "READ:TEMP":
            val = 22.0 + 3.0 * math.sin(0.2 * math.pi * t) + random.gauss(0, 0.1)
            self._buffer = f"TEMP:{val:.4f}\n".encode()
        elif cmd == "READ:VOLT":
            val = 3.3 + 0.2 * math.sin(0.1 * math.pi * t) + random.gauss(0, 0.02)
            self._buffer = f"VOLT:{val:.4f}\n".encode()
        elif cmd.startswith("SET:"):
            self._buffer = b"OK\n"
        else:
            self._buffer = b"UNKNOWN\n"

    def readline(self):
        data = self._buffer
        self._buffer = b""
        return data

    def reset_input_buffer(self):
        self._buffer = b""

    def close(self):
        pass


# ============================================================
# Main — runs the messy driver
# ============================================================

def main():
    driver = InstrumentDriver()
    driver.connect()
    driver.set_interval(100)

    print("\nReading 10 values...\n")
    for i in range(10):
        try:
            driver.read_temperature()
            driver.read_voltage()
        except Exception as e:
            print(f"Error on reading {i}: {e}")
        time.sleep(0.2)

    driver.disconnect()
    print("Done.")


if __name__ == "__main__":
    main()
