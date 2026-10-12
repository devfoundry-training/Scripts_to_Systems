# From Scripts to Systems: Advanced

**Python Application Architecture for Instrument Control**

A 3-day instructor-led course for engineers moving from script-level Python to maintainable desktop applications for instrument control, data acquisition and monitoring. You build one application, **LabMonitor**, across 10 progressive labs. No hardware is needed: every lab runs against a simulated instrument.

---

## Structure

```
course_materials/            Shared materials, for everyone
  labmonitor/                The LabMonitor application you build on
  examples/                  Messy starter scripts for Labs 1 and 2
  labs/                      Lab instructions (lab01 to lab10) and starter skeletons
  docs/simulator_guide.md    How the simulated instrument works
student_instructions/
  slides/                    The three day decks
trainer_instructions/        Trainer only
  slides/                    Decks with speaker notes
  solutions/                 Reference solutions for all 10 labs
  Trainer_Guide.docx         Timed schedule and session delivery notes
  How_to_Teach_This_Course.md
slides/                      Slide generator scripts
smoke_test.py                Pre-course environment check
```

---

## Prerequisites

- Python 3.10+
- VS Code or another IDE
- No hardware: all instrument examples use the simulator
- Install the packages and check your machine before Day 1:

```bash
pip install -r course_materials/labmonitor/requirements.txt
python smoke_test.py
```

Packages: PySide6, PyQtGraph, pyserial, Pint, PyYAML, NumPy (h5py optional).

---

## Day 1: From Script to Architecture

Why scripts break, and how objects, seams and two patterns fix them.

**Day 1 is the same in both tracks.** If you have already done Day 1 of the Beginner course, you can skip it.

| Topic | What You'll Learn |
|-------|-------------------|
| Why Scripts Break | Global state, tight coupling, mixed responsibilities |
| OOP from Scratch | Classes, `__init__`, `self`, state and responsibility |
| Seams and Refactoring | Finding the cut points in messy code; splitting transport from parsing |
| Adapter Pattern | One interface for real and simulated instruments |
| Strategy Pattern | Swappable measurement modes |

### Labs (Day 1)

| Lab | Title | Time | You will |
|-----|-------|------|----------|
| 1 | From Script to Classes | 30 min | Split `examples/messy_script.py` into classes with clear responsibilities |
| 2 | Refactor the Messy Driver | 30 min | Find the seams in `examples/messy_driver.py` and extract the transport and parsing |
| 3 | Build the Adapter | 30 min | Implement the Adapter pattern with a simulated instrument backend |
| 4 | Implement Strategies | 20 min | Add swappable measurement strategies |

---

## Day 2: Application Programming

From classes to a working desktop application.

| Topic | What You'll Learn |
|-------|-------------------|
| SOLID | Single responsibility, open/closed and dependency inversion in instrument code |
| MVC | What belongs in the Model, View and Controller. The Model knows nothing about Qt |
| PySide6 Basics | `QApplication`, `QMainWindow`, layouts, buttons, signals and slots |
| Worker Threads | `QThread` and the worker pattern: keep the GUI responsive, shut down cleanly |
| Error Handling | Timeouts with defaults, retry with backoff, passing errors up to the UI |

### Labs (Day 2)

| Lab | Title | Time | You will |
|-----|-------|------|----------|
| 5 | Worker Thread | 35 min | Move acquisition onto a background `QThread` (starter: `labs/lab05_starter.py`) |
| 6 | Mini-App Build | 70 min | Build the complete PySide6 instrument-control app with an MVC structure |

---

## Day 3: Data Architecture and Performance

Getting data out reliably, configuring behaviour without code changes, and plotting live.

| Topic | What You'll Learn |
|-------|-------------------|
| DataSink Pattern | One interface for output: CSV, JSON metadata, and a composite sink for both |
| Writer Thread | A queue and a writer thread so saving never slows acquisition |
| Configuration | YAML config that chooses adapters and sinks; experiment metadata; units with Pint |
| Performance | Common bottlenecks, and throttling GUI updates to display rate |
| Real-Time Plotting | A scrolling PyQtGraph plot with a ring buffer |

### Labs (Day 3)

| Lab | Title | Time | You will |
|-----|-------|------|----------|
| 7 | Implement DataSinks | 30 min | Write CSV and JSON metadata sinks behind a common DataSink interface |
| 8 | Writer Thread | 20 min | Decouple writing from acquisition with a queue and a writer thread |
| 9 | Configuration and Metadata | 20 min | Load config from YAML and record experiment metadata |
| 10 | Real-Time Plot | 30 min | Add a live scrolling plot (starter: `labs/lab10_starter.py`) |

---

## How the Labs Work

Every lab has an instruction file in `course_materials/labs/` with the objective, setup, steps and what you should see. Labs 3 onwards import from the `labmonitor/` package, so each lab adds to the same application. Start each lab from the instructions; your trainer has the reference solutions.

---

## Key Principle

> "The controller does not care whether the instrument is real or simulated, whether the data goes to CSV or HDF5, or whether the UI is a desktop app or a command line."

By the end of Day 3, every part of LabMonitor is swappable:
- **Adapter** abstracts the hardware: swap the simulated instrument for a serial one without changing the controller
- **Strategy** abstracts measurement modes: single-shot, averaging or max in one line
- **DataSink** abstracts output: CSV, JSON metadata, or both through a composite sink
- **MVC** keeps the UI separate from the logic
- **Config files** change behaviour without changing code

---

## The Simulator

The `SimulatedInstrumentAdapter` generates realistic temperature and voltage readings with configurable noise, and has five error modes (timeout, garbage, intermittent, drift and disconnect) for practising error handling. See `course_materials/docs/simulator_guide.md`.

---

## Before This Course

New to Python? Start with the beginner track first, **[From Scripts to Systems: Beginner](https://github.com/devfoundry-training/Scripts_to_Systems_BEGINNER)**: Python foundations, functions, abstract base classes and the same instrument patterns at a gentler pace.

---

## Need Help?

Ask your instructor, run `python smoke_test.py` to check your setup, or see `course_materials/docs/simulator_guide.md`.
