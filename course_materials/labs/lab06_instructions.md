# Lab 6: Mini-App Build

**Duration:** 70 minutes | **Day 2, Sessions 2.5–2.6**

## Objective
Build a complete PySide6 instrument-control application with MVC structure.

## Setup

Run from inside the `labmonitor/` folder: `cd labmonitor && python main.py`

No `sys.path` hacking needed — `main.py` runs from the project root.

For simulator reference (commands, error modes, channels), see `docs/simulator_guide.md`.

## Project Structure
Use the `labmonitor/` project. Key files:
- `core/app_model.py` — application state
- `core/controller.py` — orchestration
- `ui/main_window.py` — PySide6 GUI
- `ui/worker.py` — acquisition worker
- `drivers/simulated.py` — simulated backend
- `configs/default_config.yaml` — configuration
- `main.py` — entry point

## Build Phases

### Phase 1 (10 min): Review the project structure
Explore the `labmonitor/` folder. Read `main.py` and trace the flow.

### Phase 2 (15 min): Understand the GUI
Open `ui/main_window.py`. Identify the widgets, buttons, and update methods.

### Phase 3 (15 min): Understand the Controller
Open `core/controller.py`. Trace what happens when you click Connect → Start → Stop → Disconnect.

### Phase 4 (15 min): Run the application
```
cd labmonitor
python main.py
```
Try: Connect → Start → watch readings → Stop → Disconnect.

### Phase 5 (15 min): Modify something
Pick one:
- Change the reading display format
- Add a reading counter to the status bar
- Change the plot colour
- Add your name to the window title

### Phase 6 (extension): Swap the backend
Edit `configs/default_config.yaml`: change `device.type` to `serial` (if you have hardware).

## Acceptance Criteria
- App launches and shows the GUI
- Connect/disconnect works
- Start/stop acquisition works
- Readings display live
- GUI does not freeze
- Clean shutdown on close

## Solution
The `labmonitor/` project itself is the solution. See `solutions/lab06_solution/run_mini_app.py`.
