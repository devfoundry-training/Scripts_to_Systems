# Lab 7: Implement DataSinks

**Duration:** 30 minutes | **Day 3, Session 3.1**

## Objective
Implement CSV and JSON metadata sinks behind a common DataSink interface.

## Setup

Your script needs to import from the `labmonitor/` package. Add this at the top:

```python
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "labmonitor"))
```

## Provided Code
- `labmonitor/core/data_sink.py` — `DataSink` ABC
- `labmonitor/core/csv_sink.py` — `CsvSink` implementation
- `labmonitor/core/json_metadata_sink.py` — `JsonMetadataSink`
- `labmonitor/core/composite_sink.py` — `CompositeSink`

## Your Task

1. Review the `DataSink` ABC: `open(metadata)`, `write(reading)`, `close()`.
2. Review `CsvSink` — understand how it writes CSV rows.
3. Review `JsonMetadataSink` — understand how it records metadata.
4. Write a test script that:
   - Creates a `CompositeSink` wrapping `CsvSink` + `JsonMetadataSink`
   - Opens with metadata: `{"experiment": "lab7", "operator": "your_name"}`
   - Generates 20 readings using `SimulatedInstrumentAdapter`
   - Writes each reading to the composite sink
   - Closes
   - Prints the CSV file contents and JSON metadata

## Key Insight
Adding a new output format = adding one class. Nothing else changes.

## Extension
- Implement `Hdf5Sink` using `h5py` (see `labmonitor/core/hdf5_sink.py`)
- Add it to the `CompositeSink` so data writes to CSV AND HDF5 simultaneously

## Solution
See `solutions/lab07_solution/sink_demo.py`
