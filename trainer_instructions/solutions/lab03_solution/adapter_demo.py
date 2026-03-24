"""
Lab 3 Solution — Adapter Demo
===============================
Demonstrates the InstrumentAdapter interface and the
SimulatedInstrumentAdapter concrete implementation.

This script:
  1. Imports the ABC and the simulated adapter from the labmonitor project.
  2. Creates a SimulatedInstrumentAdapter, connects, reads 10 pairs of
     temperature + voltage values, and disconnects.
  3. Shows that the adapter satisfies the InstrumentAdapter interface.
"""

import sys
import os
import time

# ---------------------------------------------------------------------------
# Make the labmonitor package importable from this solution directory.
# ---------------------------------------------------------------------------
_project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, os.path.join(_project_root, "labmonitor"))

from core.adapter_interface import InstrumentAdapter
from drivers.simulated import SimulatedInstrumentAdapter


def main():
    # Create the adapter
    adapter = SimulatedInstrumentAdapter(noise=0.15, frequency=0.1)

    # Verify it satisfies the interface
    print(f"Is InstrumentAdapter subclass? {issubclass(SimulatedInstrumentAdapter, InstrumentAdapter)}")
    print(f"Is InstrumentAdapter instance?  {isinstance(adapter, InstrumentAdapter)}")
    print()

    # Connect
    adapter.connect()
    print(f"Device ID : {adapter.device_id}")
    print(f"Connected : {adapter.is_connected}")
    print()

    # Read 10 values — temperature and voltage
    print("Reading 10 temperature + voltage pairs...\n")
    for i in range(1, 11):
        temp = adapter.read_value("temperature")
        volt = adapter.read_value("voltage")
        print(f"  #{i:>2d}  {temp}  |  {volt}")
        time.sleep(0.1)

    # Disconnect
    print()
    adapter.disconnect()
    print(f"Connected : {adapter.is_connected}")
    print("\nDone.")


if __name__ == "__main__":
    main()
