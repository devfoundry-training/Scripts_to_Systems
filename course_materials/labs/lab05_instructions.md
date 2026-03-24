# Lab 5: Worker Thread

**Duration:** 35 minutes | **Day 2, Session 2.4**

## Objective
Run acquisition on a background QThread so the GUI does not freeze.

## Setup

Use the starter skeleton: `labs/lab05_starter.py`. It has the window, buttons, and imports ready. You fill in the TODOs.

Alternatively, build from scratch. Either way, add this at the top for imports:

```python
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "labmonitor"))
```

For simulator reference, see `docs/simulator_guide.md`.

## Provided Code
- `labs/lab05_starter.py` — starter skeleton with TODOs marked
- `labmonitor/ui/worker.py` — `AcquisitionWorker` reference

## Your Task

1. Build a **minimal PySide6 window** with:
   - A `QLabel` to show the current reading
   - A `QPushButton` "Start"
   - A `QPushButton` "Stop"
2. Create an `AcquisitionWorker` (QObject) with:
   - `reading_ready = Signal(object)`
   - `error_occurred = Signal(str)`
   - `finished = Signal()`
   - `start_acquisition()` method: loops reading from `SimulatedInstrumentAdapter`, emitting `reading_ready`
   - `stop()` method: sets `_running = False`
3. On Start click:
   - Create a `QThread`
   - Create the worker, call `worker.moveToThread(thread)`
   - Connect `thread.started` → `worker.start_acquisition`
   - Connect `worker.reading_ready` → update the QLabel
   - Start the thread
4. On Stop click:
   - Call `worker.stop()`
   - Quit and wait on the thread

## Critical Rules
- **Never** subclass QThread — use QObject + moveToThread
- **Never** update QLabel from the worker thread — use signals
- **Always** stop the thread cleanly on window close

## Expected Output
A GUI that shows live readings, stays responsive, and stops cleanly.

## Solution
See `solutions/lab05_solution/worker_demo.py`
