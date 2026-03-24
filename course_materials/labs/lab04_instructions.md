# Lab 4: Implement Strategies

**Duration:** 20 minutes | **Day 1, Session 1.5**

## Objective
Implement swappable measurement strategies using the Strategy pattern.

## Setup

Your script needs to import from the `labmonitor/` package. Add this at the top:

```python
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "labmonitor"))
```

## Provided Code
- `labmonitor/core/strategy_interface.py` — the `MeasurementStrategy` ABC
- `labmonitor/core/strategies.py` — `SingleReadStrategy`, `ContinuousReadStrategy`, `AveragingStrategy`

## Your Task

1. Review the strategy implementations in `labmonitor/core/strategies.py`.
2. Write a script that:
   - Creates a `SimulatedInstrumentAdapter` and connects
   - Creates all three strategies
   - Runs each strategy on the same adapter
   - Prints the results from each
   - Shows that strategies are **interchangeable** — write a function `run_strategy(strategy, adapter)` that works with any strategy

## Key Points
- The strategy defines **how** to measure (single, continuous, averaging)
- The adapter defines **where** to measure (simulated, real)
- Neither knows about the other's internals
- Adding a new strategy means adding a class, not editing existing code

## Extension
- Create a `BurstReadStrategy` that reads as fast as possible for N seconds
- Create a `FilteredStrategy` that discards outliers before averaging

## Solution
See `solutions/lab04_solution/strategy_demo.py`
