"""
Lab 1 Solution — Refactored Script
====================================
The original messy_script.py has been split into three classes,
each with a single responsibility:

  1. InstrumentReader  — connects to and reads from the instrument
  2. DataRecorder      — opens, writes to, and closes a CSV file
  3. ReadingFormatter   — pure formatting helpers (display + timestamps)

main() creates instances and coordinates them in a loop.
"""

import time
import math
import random
import csv
import os
from datetime import datetime


# ---------------------------------------------------------------------------
# 1. InstrumentReader — hardware / acquisition responsibility
# ---------------------------------------------------------------------------

class InstrumentReader:
    """Simulates connecting to an instrument and reading raw values."""

    def __init__(self, noise: float = 0.15, frequency: float = 0.1):
        self._noise = noise
        self._frequency = frequency
        self._connected = False
        self._start_time = None

    def connect(self):
        """Establish a connection to the instrument."""
        print("Connecting to instrument...")
        time.sleep(0.3)
        self._connected = True
        self._start_time = time.time()
        print("Connected!")

    def disconnect(self):
        """Release the connection."""
        self._connected = False
        print("Disconnected.")

    @property
    def is_connected(self) -> bool:
        return self._connected

    def read_raw(self) -> float | None:
        """Read a temperature value from the instrument.

        Returns the parsed float value, or None on failure.
        """
        if not self._connected:
            print("ERROR: Not connected!")
            return None

        t = time.time() - self._start_time
        value = 22.0 + 3.0 * math.sin(2 * math.pi * self._frequency * t)
        value += random.gauss(0, self._noise)

        # Simulate the raw string the instrument would send
        raw = f"TEMP:{value:.4f}"

        # Parse
        try:
            return float(raw.split(":")[1])
        except (IndexError, ValueError):
            print(f"ERROR: Cannot parse '{raw}'")
            return None


# ---------------------------------------------------------------------------
# 2. DataRecorder — file I/O responsibility
# ---------------------------------------------------------------------------

class DataRecorder:
    """Manages a CSV file for recording timestamped values."""

    def __init__(self):
        self._file = None
        self._writer = None

    def open(self, output_dir: str = "./data"):
        """Create a new CSV file in *output_dir*."""
        os.makedirs(output_dir, exist_ok=True)
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        filepath = os.path.join(output_dir, f"temps_{ts}.csv")
        self._file = open(filepath, "w", newline="")
        self._writer = csv.writer(self._file)
        self._writer.writerow(["timestamp", "temperature_degC"])
        print(f"Recording to {filepath}")

    def write(self, timestamp: str, value: float):
        """Append a single row to the CSV."""
        if self._writer is None:
            print("ERROR: CSV not open!")
            return
        self._writer.writerow([timestamp, f"{value:.4f}"])
        self._file.flush()

    def close(self):
        """Close the CSV file."""
        if self._file:
            self._file.close()
            self._file = None
            self._writer = None
            print("CSV file closed.")


# ---------------------------------------------------------------------------
# 3. ReadingFormatter — display / formatting responsibility
# ---------------------------------------------------------------------------

class ReadingFormatter:
    """Pure (static) helpers for formatting readings and timestamps."""

    @staticmethod
    def format_for_display(value: float | None, unit: str = "\u00b0C") -> str:
        if value is None:
            return "--- \u00b0C"
        return f"{value:.2f} {unit}"

    @staticmethod
    def format_timestamp() -> str:
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]


# ---------------------------------------------------------------------------
# main — coordinator
# ---------------------------------------------------------------------------

def main():
    reader = InstrumentReader()
    recorder = DataRecorder()
    formatter = ReadingFormatter()

    reader.connect()
    recorder.open()

    reading_count = 0
    print("\nStarting acquisition... (Ctrl+C to stop)\n")

    try:
        while True:
            value = reader.read_raw()
            if value is None:
                print("Skipping bad read...")
                time.sleep(0.5)
                continue

            reading_count += 1
            ts = formatter.format_timestamp()
            display = formatter.format_for_display(value)

            print(f"  [{ts}]  {display}  (reading #{reading_count})")
            recorder.write(ts, value)

            time.sleep(0.1)

    except KeyboardInterrupt:
        print(f"\n\nStopped after {reading_count} readings.")

    recorder.close()
    reader.disconnect()
    print("Done.")


if __name__ == "__main__":
    main()
