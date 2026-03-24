"""Smoke tests for data sinks."""

import sys, os, tempfile, json, csv
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from core.reading import Reading
from core.csv_sink import CsvSink
from core.json_metadata_sink import JsonMetadataSink
from core.composite_sink import CompositeSink

def test_csv_sink():
    with tempfile.TemporaryDirectory() as tmpdir:
        sink = CsvSink(output_dir=tmpdir)
        sink.open({"test": True})
        r = Reading(value=23.5, unit="degC", channel="temperature")
        sink.write(r)
        sink.write(r)
        sink.close()
        files = [f for f in os.listdir(tmpdir) if f.endswith(".csv")]
        assert len(files) == 1
        with open(os.path.join(tmpdir, files[0])) as f:
            rows = list(csv.reader(f))
            assert len(rows) == 3  # header + 2 data rows
    print("[OK] CsvSink")

def test_json_metadata_sink():
    with tempfile.TemporaryDirectory() as tmpdir:
        sink = JsonMetadataSink(output_dir=tmpdir)
        sink.open({"experiment": "test"})
        r = Reading(value=23.5, unit="degC", channel="temperature")
        sink.write(r)
        sink.close()
        files = [f for f in os.listdir(tmpdir) if f.endswith(".json")]
        assert len(files) == 1
        with open(os.path.join(tmpdir, files[0])) as f:
            meta = json.load(f)
            assert meta["experiment"] == "test"
            assert meta["total_readings"] == 1
    print("[OK] JsonMetadataSink")

def test_composite_sink():
    with tempfile.TemporaryDirectory() as tmpdir:
        csv_sink = CsvSink(output_dir=tmpdir)
        json_sink = JsonMetadataSink(output_dir=tmpdir)
        composite = CompositeSink([csv_sink, json_sink])
        composite.open({"experiment": "composite_test"})
        r = Reading(value=3.3, unit="V", channel="voltage")
        composite.write(r)
        composite.close()
        files = os.listdir(tmpdir)
        assert any(f.endswith(".csv") for f in files)
        assert any(f.endswith(".json") for f in files)
    print("[OK] CompositeSink")

if __name__ == "__main__":
    test_csv_sink()
    test_json_metadata_sink()
    test_composite_sink()
    print("\nAll sink smoke tests passed.")
