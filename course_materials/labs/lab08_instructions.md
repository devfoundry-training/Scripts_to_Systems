# Lab 8: Writer Thread

**Duration:** 20 minutes | **Day 3, Session 3.2**

## Objective
Decouple data writing from acquisition using a queue and writer thread.

## Setup

Your script needs to import from the `labmonitor/` package. Add this at the top:

```python
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "labmonitor"))
```

## Provided Code
- `labmonitor/core/writer_thread.py` — `WriterThread`

## Your Task

1. Review `WriterThread`: it consumes a `queue.Queue` and writes to a `DataSink`.
2. Write a script that:
   - Creates a `SimulatedInstrumentAdapter` and connects
   - Creates a `queue.Queue`
   - Creates a `CompositeSink` (CSV + JSON metadata)
   - Opens the sinks
   - Starts a `WriterThread`
   - Reads 50 values from the adapter, putting each on the queue
   - Puts `None` on the queue (sentinel to signal shutdown)
   - Joins the writer thread
   - Closes the sinks
   - Prints summary

## Key Insight
The acquisition loop never waits for disk I/O. The queue absorbs bursts.

## How to Verify
- The CSV file should have 50 data rows
- `queue.qsize()` should be 0 after the writer finishes

## Solution
See `solutions/lab08_solution/writer_thread_demo.py`
