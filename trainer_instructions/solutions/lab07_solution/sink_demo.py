"""Lab 7 Solution: Data sink demo.

Demonstrates CsvSink, JsonMetadataSink, and CompositeSink by:
1. Creating a CompositeSink that wraps both a CsvSink and a JsonMetadataSink.
2. Opening the sink with session metadata.
3. Generating 20 readings from a SimulatedInstrumentAdapter.
4. Closing the sink.
5. Printing the contents of the generated CSV and JSON files.

All output goes into a temporary directory that is cleaned up automatically.

Run:
    python sink_demo.py
"""

import sys
import os
import time
import tempfile
import glob

# Add the labmonitor package root to sys.path.
_project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
_labmonitor_root = os.path.join(_project_root, "labmonitor")
sys.path.insert(0, _labmonitor_root)

from core.csv_sink import CsvSink
from core.json_metadata_sink import JsonMetadataSink
from core.composite_sink import CompositeSink
from drivers.simulated import SimulatedInstrumentAdapter


def main():
    with tempfile.TemporaryDirectory() as tmpdir:
        print(f"Output directory: {tmpdir}\n")

        # ---- Build the composite sink ----
        csv_sink = CsvSink(output_dir=tmpdir)
        json_sink = JsonMetadataSink(output_dir=tmpdir)
        sink = CompositeSink([csv_sink, json_sink])

        # ---- Session metadata ----
        metadata = {
            "operator": "Lab Student",
            "instrument": "SimInstrument-v1.0-SN0001",
            "channel": "temperature",
            "description": "Lab 7 sink demo run",
        }

        # ---- Open, write 20 readings, close ----
        adapter = SimulatedInstrumentAdapter(noise=0.15, frequency=0.1)
        adapter.connect()

        sink.open(metadata)

        for i in range(20):
            reading = adapter.read_value("temperature")
            sink.write(reading)
            print(f"  Reading {i + 1:2d}: {reading}")
            time.sleep(0.1)

        sink.close()
        adapter.disconnect()

        # ---- Display the generated files ----
        csv_files = glob.glob(os.path.join(tmpdir, "*.csv"))
        json_files = glob.glob(os.path.join(tmpdir, "*.json"))

        for path in csv_files:
            print(f"\n{'=' * 60}")
            print(f"CSV file: {os.path.basename(path)}")
            print("=" * 60)
            with open(path) as f:
                print(f.read())

        for path in json_files:
            print(f"\n{'=' * 60}")
            print(f"JSON file: {os.path.basename(path)}")
            print("=" * 60)
            with open(path) as f:
                print(f.read())


if __name__ == "__main__":
    main()
