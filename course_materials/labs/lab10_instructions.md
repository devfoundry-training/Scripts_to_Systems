# Lab 10: Real-Time Plot

**Duration:** 30 minutes | **Day 3, Session 3.5**

## Objective
Add a real-time scrolling plot to the instrument application using PyQtGraph.

## Setup

Use the starter skeleton: `labs/lab10_starter.py`. It has the window, plot widget, and buttons ready. You fill in the TODOs.

Alternatively, build from scratch. Either way, add this at the top for imports:

```python
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "labmonitor"))
```

## Provided Code
- `labs/lab10_starter.py` — starter skeleton with TODOs marked
- `labmonitor/ui/plot_widget.py` — `LivePlotWidget` with ring buffer

## Your Task

1. Review `LivePlotWidget`:
   - Dual-channel: temperature (blue, top) and voltage (orange, bottom)
   - Ring buffers using numpy — one per channel
   - `add_value(value, channel)` adds data points to the correct buffer
   - QTimer at 30 Hz calls `_update_plot()` to redraw both curves
   - X axes are linked so they scroll together
2. Write a standalone PySide6 app that:
   - Creates a `SimulatedInstrumentAdapter`
   - Shows a dual-channel plot in a QMainWindow
   - Uses a QTimer to read temperature AND voltage and feed both traces
   - Has Start/Stop buttons
   - Shows smooth scrolling data on both channels

## Key Points
- Update the plot at **display rate** (30 Hz), not data rate
- Use `setData()` (replaces all data) — it's fast
- Use numpy arrays, not Python lists
- Ring buffer prevents memory growth
- Read both channels each cycle so both traces update together

## Expected Output
Two smoothly scrolling real-time plots — temperature on top, voltage on bottom.

## Extension
- Add a "Clear" button that resets both buffers
- Try different buffer sizes and update rates
- Add min/max lines or a rolling average overlay

## Solution
See `solutions/lab10_solution/plot_demo.py`
