"""
Lab 2 Solution — Refactored Driver
====================================
The original messy_driver.py has been split into:

  1. Transport       — send/receive over a serial-like object, with retry logic
  2. parse_temperature / parse_voltage — pure functions for response parsing
  3. CleanDriver     — uses Transport + parse functions to provide a clean API
  4. FakeSerial       — unchanged from the original (simulates a serial port)

main() runs 10 reads of temperature and voltage.
"""

import time
import math
import random


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


# ---------------------------------------------------------------------------
# 1. Transport — serial read / write with retry
# ---------------------------------------------------------------------------

class Transport:
    """Thin wrapper around a serial-like object that handles encoding,
    decoding, and a single retry on empty responses.
    """

    def __init__(self, serial_like):
        self._serial = serial_like

    def send(self, cmd: str) -> str:
        """Send *cmd* to the device and return the stripped response string.

        Retries once if the first read returns empty.
        """
        self._serial.write(f"{cmd}\n".encode("ascii"))
        raw = self._serial.readline().decode("ascii").strip()

        if not raw:
            # One retry
            print("Timeout! Retrying...")
            time.sleep(0.5)
            self._serial.write(f"{cmd}\n".encode("ascii"))
            raw = self._serial.readline().decode("ascii").strip()
            if not raw:
                raise TimeoutError(f"No response after retry for command: {cmd}")

        return raw


# ---------------------------------------------------------------------------
# 2. Pure parsing functions
# ---------------------------------------------------------------------------

def parse_temperature(raw: str) -> float:
    """Parse a 'TEMP:<value>' response string into a float (degrees C)."""
    if not raw.startswith("TEMP:"):
        raise ValueError(f"Unexpected response: {raw}")
    try:
        return float(raw.split(":")[1])
    except (IndexError, ValueError) as e:
        raise ValueError(f"Cannot parse '{raw}': {e}")


def parse_voltage(raw: str) -> float:
    """Parse a 'VOLT:<value>' response string into a float (volts)."""
    if not raw.startswith("VOLT:"):
        raise ValueError(f"Unexpected response: {raw}")
    try:
        return float(raw.split(":")[1])
    except (IndexError, ValueError) as e:
        raise ValueError(f"Cannot parse '{raw}': {e}")


# ---------------------------------------------------------------------------
# 3. CleanDriver — high-level instrument API
# ---------------------------------------------------------------------------

class CleanDriver:
    """Instrument driver that delegates transport and parsing to helpers."""

    def __init__(self, port: str = "COM3", baudrate: int = 9600, timeout: float = 2.0):
        self._port = port
        self._baudrate = baudrate
        self._timeout = timeout
        self._transport = None
        self._connected = False

    def connect(self):
        """Open the serial connection and verify the device identity."""
        print(f"Opening {self._port} at {self._baudrate} baud...")
        serial = FakeSerial(self._port, self._baudrate, timeout=self._timeout)
        time.sleep(0.3)
        serial.reset_input_buffer()
        self._transport = Transport(serial)
        self._connected = True

        # Identify device
        idn = self._transport.send("*IDN?")
        if not idn:
            print("WARNING: No IDN response!")
        else:
            print(f"Connected to: {idn}")

    def read_temperature(self) -> float:
        """Read the current temperature in degrees C."""
        self._check_connected()
        raw = self._transport.send("READ:TEMP")
        temp_c = parse_temperature(raw)
        print(f"  Temp: {temp_c:.2f} \u00b0C")
        return temp_c

    def read_voltage(self) -> float:
        """Read the current voltage in volts."""
        self._check_connected()
        raw = self._transport.send("READ:VOLT")
        voltage = parse_voltage(raw)
        print(f"  Voltage: {voltage:.3f} V")
        return voltage

    def disconnect(self):
        """Close the serial connection."""
        self._connected = False
        print("Disconnected.")

    def _check_connected(self):
        if not self._connected:
            raise ConnectionError("Not connected!")


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------

def main():
    driver = CleanDriver()
    driver.connect()

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
