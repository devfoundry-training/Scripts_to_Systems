# From Scripts to Systems

**Python Application Architecture for Instrument Control**

A 3-day instructor-led training course for engineers moving from script-level Python toward maintainable desktop applications for instrument control, data acquisition, and monitoring.

## Course Summary

| | |
|---|---|
| **Duration** | 3 days |
| **Delivery** | Instructor-led, simulator-first |
| **Audience** | Instrument, test, automation, and embedded engineers |
| **Toolchain** | Python 3.x, PySide6, pyserial, PyQtGraph, Pint |
| **Hardware** | Not required. One optional demo rig. |

**Day 1** — From Script to Architecture (OOP, Seams, Adapter, Strategy)
**Day 2** — Application Programming (SOLID, MVC, Error Handling, QThread, Mini-App)
**Day 3** — Data Architecture and Performance (DataSink, Writer Thread, Config, PyQtGraph)

## Repository Structure

```
course_materials/           Shared materials (trainer + students)
  labmonitor/               Complete project codebase
  examples/                 Messy starter scripts (Labs 1-2)
  labs/                     Lab instructions + starter skeletons
  docs/                     Simulator guide

trainer_instructions/       Trainer only
  slides/                   PowerPoint decks with speaker notes
  solutions/                Reference solutions for all 10 labs
  Trainer_Guide.docx        Timed schedule and session delivery notes
  How_to_Teach_This_Course.md  Nightly revision guide

student_instructions/       Students only
  slides/                   PowerPoint decks without speaker notes

slides/                     Slide generator scripts (pptxgenjs)
smoke_test.py               Pre-course environment check
```

## Quick Start

```bash
# Install dependencies
pip install PySide6 pyqtgraph pyserial pint PyYAML numpy

# Verify setup
python smoke_test.py

# Run the application
cd course_materials/labmonitor
python main.py
```

## Key Architectural Principle

> The controller does not care whether the instrument is real or simulated, whether the data goes to CSV or HDF5, or whether the UI is a desktop app or a command line.

Every pattern in the course reinforces this: Adapter for hardware, Strategy for measurement modes, DataSink for output formats, MVC for separation, config files for behaviour changes without code changes.

## 10 Progressive Labs

| Lab | Title | Day | Duration |
|-----|-------|-----|----------|
| 1 | From Script to Classes | 1 | 30 min |
| 2 | Refactor the Messy Driver | 1 | 30 min |
| 3 | Build the Adapter | 1 | 30 min |
| 4 | Implement Strategies | 1 | 20 min |
| 5 | Worker Thread | 2 | 35 min |
| 6 | Mini-App Build | 2 | 70 min |
| 7 | Implement DataSinks | 3 | 30 min |
| 8 | Writer Thread | 3 | 20 min |
| 9 | Configuration and Metadata | 3 | 20 min |
| 10 | Real-Time Plot | 3 | 30 min |

## Simulator

No hardware required. The `SimulatedInstrumentAdapter` generates realistic temperature and voltage data with configurable noise, and supports 5 error modes (timeout, garbage, intermittent, drift, disconnect) for teaching error handling. See `course_materials/docs/simulator_guide.md`.

## License

Internal training material. Not for redistribution.
