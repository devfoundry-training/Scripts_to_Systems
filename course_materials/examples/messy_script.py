"""
MESSY SCRIPT — Lab 1 Starter Code
==================================
This script reads temperature from a simulated instrument,
prints it, and writes it to a CSV file.

IT WORKS. But it is unmaintainable.

YOUR TASK (Lab 1):
  1. Read through this script and identify at least 3 responsibilities.
  2. Create a class for each responsibility.
  3. Refactor so that main() creates instances and calls methods.
  4. The refactored version should produce the same output.
"""

import time
import math
import random
import csv
import os
from datetime import datetime

# ---- "Hardware" simulation (pretend this is serial) ----
connected = False
start_time = None
noise = 0.15
frequency = 0.1

# ---- Globals ----
csv_file = None
csv_writer = None
reading_count = 0
output_dir = "./data"


def connect_instrument():
    global connected, start_time
    print("Connecting to instrument...")
    time.sleep(0.3)
    connected = True
    start_time = time.time()
    print("Connected!")


def disconnect_instrument():
    global connected
    connected = False
    print("Disconnected.")


def read_raw_temperature():
    if not connected:
        print("ERROR: Not connected!")
        return None
    t = time.time() - start_time
    value = 22.0 + 3.0 * math.sin(2 * math.pi * frequency * t)
    value += random.gauss(0, noise)
    # Simulate the raw string response from the instrument
    return f"TEMP:{value:.4f}"


def parse_temperature(raw):
    try:
        parts = raw.split(":")
        return float(parts[1])
    except (IndexError, ValueError):
        print(f"ERROR: Cannot parse '{raw}'")
        return None


def format_for_display(temp, unit="°C"):
    if temp is None:
        return "--- °C"
    return f"{temp:.2f} {unit}"


def format_timestamp():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]


def open_csv():
    global csv_file, csv_writer
    os.makedirs(output_dir, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = os.path.join(output_dir, f"temps_{ts}.csv")
    csv_file = open(filepath, "w", newline="")
    csv_writer = csv.writer(csv_file)
    csv_writer.writerow(["timestamp", "temperature_degC"])
    print(f"Recording to {filepath}")


def write_csv_row(timestamp, value):
    if csv_writer is None:
        print("ERROR: CSV not open!")
        return
    csv_writer.writerow([timestamp, f"{value:.4f}"])
    csv_file.flush()


def close_csv():
    global csv_file, csv_writer
    if csv_file:
        csv_file.close()
        csv_file = None
        csv_writer = None
        print("CSV file closed.")


def main():
    global reading_count

    connect_instrument()
    open_csv()

    print("\nStarting acquisition... (Ctrl+C to stop)\n")
    try:
        while True:
            raw = read_raw_temperature()
            if raw is None:
                print("Skipping bad read...")
                time.sleep(0.5)
                continue

            temp = parse_temperature(raw)
            if temp is None:
                print("Skipping unparseable response...")
                time.sleep(0.5)
                continue

            reading_count += 1
            ts = format_timestamp()
            display = format_for_display(temp)

            print(f"  [{ts}]  {display}  (reading #{reading_count})")
            write_csv_row(ts, temp)

            time.sleep(0.1)

    except KeyboardInterrupt:
        print(f"\n\nStopped after {reading_count} readings.")

    close_csv()
    disconnect_instrument()
    print("Done.")


if __name__ == "__main__":
    main()
