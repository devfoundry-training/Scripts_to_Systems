"""Lab 8 Solution: Queue-based writer thread demo.

Demonstrates decoupling data acquisition from disk I/O using a WriterThread:
1. Creates a SimulatedInstrumentAdapter and connects.
2. Builds a CompositeSink (CsvSink + JsonMetadataSink).
3. Creates a WriterThread that consumes readings from a queue.
4. Reads 50 values from the adapter, putting each on the queue.
5. Sends a None sentinel to signal shutdown.
6. Joins the writer thread and closes sinks.
7. Prints a summary and the contents of the generated files.

All output goes into a temporary directory that is cleaned up automatically.

Run:
    python writer_thread_demo.py
"""

import sys
import os
import time
import tempfile
import glob
import queue

# Add the labmonitor package root to sys.path.
_project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
_labmonitor_root = os.path.join(_project_root, "labmonitor")
sys.path.insert(0, _labmonitor_root)

from core.csv_sink import CsvSink
from core.json_metadata_sink import JsonMetadataSink
from core.composite_sink import CompositeSink
from core.writer_thread import WriterThread
from drivers.simulated import SimulatedInstrumentAdapter


def main():
    with tempfile.TemporaryDirectory() as tmpdir:
        print(f"Output directory: {tmpdir}\n")

        # ---- Create the instrument adapter ----
        adapter = SimulatedInstrumentAdapter(noise=0.15, frequency=0.1)
        adapter.connect()

        # ---- Build the composite sink ----
        csv_sink = CsvSink(output_dir=tmpdir)
        json_sink = JsonMetadataSink(output_dir=tmpdir)
        composite_sink = CompositeSink([csv_sink, json_sink])

        # ---- Open sinks with session metadata ----
        metadata = {
            "operator": "Lab Student",
            "instrument": adapter.device_id,
            "channel": "temperature",
            "description": "Lab 8 writer-thread demo run",
        }
        composite_sink.open(metadata)

        # ---- Create and start the writer thread ----
        data_queue = queue.Queue()
        writer = WriterThread(data_queue=data_queue, sink=composite_sink)
        writer.start()
        print("WriterThread started.\n")

        # ---- Acquire 50 readings, putting each on the queue ----
        num_readings = 50
        for i in range(num_readings):
            reading = adapter.read_value("temperature")
            data_queue.put(reading)
            print(f"  Enqueued reading {i + 1:2d}: {reading}")
            time.sleep(0.05)

        # ---- Signal the writer thread to shut down ----
        print("\nSending sentinel (None) to writer thread...")
        data_queue.put(None)
        writer.join()
        print("WriterThread joined.\n")

        # ---- Close sinks and disconnect ----
        composite_sink.close()
        adapter.disconnect()

        # ---- Display the generated files ----
        csv_files = glob.glob(os.path.join(tmpdir, "*.csv"))
        json_files = glob.glob(os.path.join(tmpdir, "*.json"))

        print(f"Files generated: {len(csv_files)} CSV, {len(json_files)} JSON")

        for path in csv_files:
            print(f"\n{'=' * 60}")
            print(f"CSV file: {os.path.basename(path)}")
            print("=" * 60)
            with open(path) as f:
                lines = f.readlines()
                # Print header + first 5 and last 5 data lines for brevity
                print(lines[0], end="")
                if len(lines) <= 12:
                    for line in lines[1:]:
                        print(line, end="")
                else:
                    for line in lines[1:6]:
                        print(line, end="")
                    print(f"  ... ({len(lines) - 11} more rows) ...")
                    for line in lines[-5:]:
                        print(line, end="")
                print(f"\nTotal data rows: {len(lines) - 1}")

        for path in json_files:
            print(f"\n{'=' * 60}")
            print(f"JSON file: {os.path.basename(path)}")
            print("=" * 60)
            with open(path) as f:
                print(f.read())

        print("\nDone. Temporary files will be cleaned up automatically.")


if __name__ == "__main__":
    main()
