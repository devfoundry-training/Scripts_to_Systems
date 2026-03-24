# Lab 3: Build the Adapter

**Duration:** 30 minutes | **Day 1, Session 1.4**

## Objective
Implement the Adapter pattern with a simulated instrument backend.

## Setup

Your test script needs to import from the `labmonitor/` package. Add this at the top of your script:

```python
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "labmonitor"))
```

For full simulator reference (commands, error modes, channels), see `docs/simulator_guide.md`.

## Provided Code
- `labmonitor/core/adapter_interface.py` — the `InstrumentAdapter` ABC
- `labmonitor/core/reading.py` — the `Reading` dataclass

## Your Task

1. Open `labmonitor/drivers/simulated.py` and review the `SimulatedInstrumentAdapter`.
2. Write a **test script** that:
   - Creates a `SimulatedInstrumentAdapter`
   - Calls `connect()`
   - Reads 10 temperature values and 10 voltage values
   - Prints each reading
   - Calls `disconnect()`
3. Verify that `isinstance(adapter, InstrumentAdapter)` is `True`.

## Key Points
- The adapter implements the **exact same interface** as a real adapter would
- Your test script should work identically with `SerialInstrumentAdapter` (if you had hardware)
- The application code **only references `InstrumentAdapter`**, never the concrete class

## Extension
- Try toggling error modes: `adapter.set_error_mode('intermittent', probability=0.2)`
- Handle the errors in your test script with try/except
- If you have real hardware: implement `SerialInstrumentAdapter` for your device

## Solution
See `solutions/lab03_solution/adapter_demo.py`
