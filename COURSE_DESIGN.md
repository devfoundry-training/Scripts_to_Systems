# From Scripts to Systems: Python Application Architecture for Instrument Control

## Commercial Course Design Document

---

# 1. COURSE OVERVIEW

## Course Title

**From Scripts to Systems: Python Application Architecture for Instrument Control, Data Acquisition, and Monitoring**

## Audience

Engineers and technical professionals who write Python scripts for instrument control, data acquisition, test automation, or monitoring — and who need to move toward maintainable, structured applications.

Typical attendee profiles:
- Test and measurement engineers
- Instrument / Modbus / embedded engineers
- Automation engineers
- Lab software developers
- R&D engineers who build internal tools

## Prerequisites

| Requirement | Level |
|---|---|
| Python scripting | Can write functions, use loops, read/write files, install packages with pip |
| Command-line familiarity | Can navigate directories, run Python scripts |
| Hardware awareness | Understands serial ports, sensors, or instruments conceptually |
| OOP experience | Not required — covered from scratch on Day 1 |
| GUI experience | Not required — introduced on Day 2 |
| Git | Helpful but not required |

## Learning Outcomes

By the end of this course, delegates will be able to:

1. Refactor monolithic scripts into modular, testable components
2. Design device drivers using the Adapter pattern with interchangeable real/simulated backends
3. Apply the Strategy pattern to change measurement behaviour without rewriting code
4. Build a PySide6 desktop application using MVC-style separation
5. Run background acquisition on a worker thread without freezing the GUI
6. Design a DataSink abstraction to write CSV, JSON metadata, and optionally HDF5 without coupling format to logic
7. Plot live data efficiently using PyQtGraph with rate-limiting
8. Use configuration files to change application behaviour without editing code
9. Identify and fix common performance problems in real-time acquisition applications
10. Structure a Python project for maintainability and team collaboration

## Why This Course Matters

Most instrument-control Python starts as a script. Scripts work — until they don't. When the hardware changes, the boss wants a GUI, the data format needs to change, or a second engineer has to maintain it, scripts collapse under their own weight.

This course teaches the architectural thinking that turns fragile scripts into applications that survive contact with reality: new instruments, new requirements, new team members, and the messy truth of lab environments.

## Delivery Assumptions

| Assumption | Detail |
|---|---|
| Class size | Up to 20 delegates |
| Duration | 3 days, approximately 6.5 teaching hours per day |
| Hardware | One instructor demo rig (Arduino or similar) — optional |
| Delegate machines | Each delegate has a laptop with Python 3.10+, VS Code or PyCharm, and pip |
| Connectivity | Internet for pip installs; offline fallback with pre-downloaded wheels |
| Simulator | All labs run against a software simulator — no real hardware required for delegates |
| Operating systems | Windows (primary), macOS/Linux supported with minor path adjustments |

## Simulator-First Rationale

Real hardware in training creates four problems:
1. **Logistics** — sourcing, shipping, powering, and recovering 20 identical devices
2. **Fragility** — broken USB cables, dead boards, driver issues consume teaching time
3. **Debugging ambiguity** — "is it my code or my wiring?" blocks learning
4. **Architectural dependency** — if the code only works with real hardware, you have not learned abstraction

The simulator-first approach solves all four. Delegates work against a simulated instrument that behaves identically to the real one (including errors, timeouts, and noise). The architecture makes real and simulated backends interchangeable — which is itself one of the most important lessons in the course.

One real rig on the instructor desk demonstrates that the same code controls real hardware. This is powerful and sufficient.

---

# 2. THREE-DAY AGENDA

## Day 1 — From Script to Architecture

**Theme:** Why scripts break and how to think in objects, responsibilities, and patterns.

| Time | Session | Duration |
|---|---|---|
| 09:00–09:30 | Welcome, introductions, setup verification | 30 min |
| 09:30–10:30 | **Session 1.1: Why Scripts Break** | 60 min |
| 10:30–10:45 | Break | 15 min |
| 10:45–12:00 | **Session 1.2: OOP from Scratch — State, Responsibilities, Objects** | 75 min |
| 12:00–13:00 | Lunch | 60 min |
| 13:00–14:15 | **Session 1.3: The Messy Driver — Seam Identification and Refactoring** | 75 min |
| 14:15–14:30 | Break | 15 min |
| 14:30–15:45 | **Session 1.4: Adapter Pattern — Hardware Abstraction** | 75 min |
| 15:45–16:00 | Break | 15 min |
| 16:00–16:45 | **Session 1.5: Strategy Pattern — Changing Behaviour Without Rewriting** | 45 min |
| 16:45–17:00 | Day 1 recap and checkpoint | 15 min |

### Day 1 Learning Objectives
- Explain why monolithic scripts become unmaintainable
- Define classes with clear state and responsibilities
- Choose composition over inheritance for most instrument code
- Identify seams in messy code and refactor toward clarity
- Implement the Adapter pattern to abstract hardware
- Implement the Strategy pattern to swap measurement behaviour

### Day 1 Key Concepts
- Functions vs classes vs objects
- State and responsibility
- Composition over inheritance
- Seam identification
- Port–Adapter pattern
- Strategy pattern
- Simulator as an adapter

### Day 1 Practical Outcomes
- Refactored a messy 200-line script into modular classes
- Built an InstrumentAdapter interface with Real and Simulated implementations
- Implemented a swappable measurement strategy
- Ran the same application logic against both simulated and (optionally) real backends

---

## Day 2 — Application Programming: SOLID, MVC, and Asynchronous Work

**Theme:** Building a real desktop application with clean separation, error handling, and background threads.

| Time | Session | Duration |
|---|---|---|
| 09:00–09:15 | Day 1 recap / questions | 15 min |
| 09:15–10:15 | **Session 2.1: SOLID Violations in Instrument Code** | 60 min |
| 10:15–10:30 | Break | 15 min |
| 10:30–11:30 | **Session 2.2: MVC for Instrument Applications** | 60 min |
| 11:30–12:00 | **Session 2.3: Error Handling — Timeouts, Retries, "The Controller Does Not Care"** | 30 min |
| 12:00–13:00 | Lunch | 60 min |
| 13:00–14:15 | **Session 2.4: QThread + Worker — Background Acquisition** | 75 min |
| 14:15–14:30 | Break | 15 min |
| 14:30–15:45 | **Session 2.5: Mini-App Build — Putting It Together** | 75 min |
| 15:45–16:00 | Break | 15 min |
| 16:00–16:45 | **Session 2.6: Mini-App Build continued — Simulator Swap and Status** | 45 min |
| 16:45–17:00 | Day 2 recap and checkpoint | 15 min |

### Day 2 Learning Objectives
- Identify SOLID violations in typical instrument code
- Separate model, view, and controller concerns in a PySide6 application
- Implement error handling that keeps the application alive when the instrument fails
- Run acquisition on a QThread worker without freezing the GUI
- Connect signals and slots across threads safely
- Build a working mini-app with live status updates

### Day 2 Key Concepts
- SOLID principles (applied, not academic)
- Hardcoding as a coupling problem
- MVC separation of concerns
- "The controller does not care" architecture
- QThread + QObject worker pattern
- Signal/slot communication
- Safe start/stop lifecycle
- Error propagation across threads

### Day 2 Practical Outcomes
- Built a PySide6 application with MVC structure
- Connected a background worker thread to the GUI via signals
- Implemented start/stop/error handling for acquisition
- Swapped between simulated and real backends without changing GUI code
- Displayed live status and readings in the GUI

---

## Day 3 — Data Architecture, Metadata, and Performance

**Theme:** Where data goes, how to write it without blocking, and how to keep the application responsive at speed.

| Time | Session | Duration |
|---|---|---|
| 09:00–09:15 | Day 2 recap / questions | 15 min |
| 09:15–10:15 | **Session 3.1: DataSink Abstraction — CSV, JSON, HDF5** | 60 min |
| 10:15–10:30 | Break | 15 min |
| 10:30–11:15 | **Session 3.2: Writer Thread and Non-Blocking I/O** | 45 min |
| 11:15–12:00 | **Session 3.3: Units, Metadata, and Configuration** | 45 min |
| 12:00–13:00 | Lunch | 60 min |
| 13:00–14:00 | **Session 3.4: Performance Engineering** | 60 min |
| 14:00–14:15 | Break | 15 min |
| 14:15–15:15 | **Session 3.5: Real-Time Plotting with PyQtGraph** | 60 min |
| 15:15–15:30 | Break | 15 min |
| 15:30–16:30 | **Session 3.6: Capstone Integration and Demonstration** | 60 min |
| 16:30–17:00 | Course recap, assessment, next steps | 30 min |

### Day 3 Learning Objectives
- Design a DataSink interface and implement CSV, JSON metadata, and optional HDF5 writers
- Run file I/O on a dedicated writer thread with a data queue
- Use Pint for unit-aware values at model boundaries
- Write metadata files for reproducibility
- Use configuration files to change behaviour without editing code
- Identify and fix the six most common performance problems
- Plot real-time data efficiently with PyQtGraph
- Integrate all components into a working instrument-control application

### Day 3 Key Concepts
- DataSink interface
- Writer thread and queue decoupling
- Pint units at model boundaries
- Metadata for reproducibility
- YAML/JSON configuration
- Event loop blocking
- GUI update throttling
- PyQtGraph rendering
- ASCII vs binary protocols
- Buffering and batching

### Day 3 Practical Outcomes
- Implemented CSV and JSON metadata sinks behind a common interface
- Ran a writer thread with a queue to avoid blocking acquisition
- Added unit annotations and metadata to recorded data
- Loaded configuration from file
- Built a real-time plot with rate-limiting
- Completed a working instrument-control application

---

# 3. SLIDE DECK OUTLINE

## Conventions

- **[DIAGRAM]** — indicates a diagram should be created
- **[DEMO]** — indicates a live demonstration
- **[DISCUSSION]** — instructor-led discussion with delegates
- Speaker notes are written as guidance for the instructor

---

## Day 1 Slides

### Session 1.1: Why Scripts Break

**Slide 1 — Title Slide**
- Title: From Scripts to Systems
- Subtitle: Python Application Architecture for Instrument Control
- Course dates, instructor name, organisation
- Speaker notes: Welcome delegates. Explain the 3-day arc: Day 1 is foundations, Day 2 is building a real app, Day 3 is data and performance.

**Slide 2 — About This Course**
- Who it's for: engineers who write Python for instruments and want to write better software
- What you'll build: a working instrument-control application
- How we work: simulator-first, real hardware optional
- Every pattern is introduced simply, then applied realistically
- Speaker notes: Emphasise that this is not academic OOP. Every concept connects to a real instrument-control problem. Mention that the simulator means nobody is blocked by hardware.

**Slide 3 — The Training Rig**
- [DIAGRAM] Show the simulated instrument: what it measures, what commands it accepts
- SimulatedInstrument: generates temperature + voltage readings, accepts commands, can simulate errors
- Optional: one real Arduino rig on the instructor desk
- Speaker notes: Briefly show the simulator running in a terminal. Explain that delegates will never need real hardware, but the architecture lets them plug it in.

**Slide 4 — A Script That Works**
- Show a real-looking 200-line script that reads from a serial port, prints values, writes to CSV
- It works. Ship it.
- Speaker notes: "This is where most instrument code starts. And for a one-off task, it's fine."

**Slide 5 — A Script That Breaks**
- The boss wants a GUI
- The instrument changes
- A second engineer has to maintain it
- The data format needs to change
- Now add error handling
- [DISCUSSION] "What has broken your scripts?"
- Speaker notes: Ask delegates to share their own experiences. Collect 3–4 war stories. This sets the emotional context for the whole course.

**Slide 6 — Why Scripts Break — Root Causes**
- Everything in one place (no separation of concerns)
- State scattered across global variables
- Hardware details wired into logic
- No way to test without real hardware
- One change ripples through everything
- Speaker notes: These are not character flaws. They are structural problems that patterns solve.

**Slide 7 — The Goal: Architecture That Survives Change**
- [DIAGRAM] Layered architecture: UI → Controller → Model → Adapter → Hardware/Simulator
- Swap the instrument? Change one file.
- Swap the data format? Change one file.
- Add a GUI? The model doesn't know or care.
- Speaker notes: This is the destination. We'll build toward it over three days. Don't explain every layer now — just show the direction.

### Session 1.2: OOP from Scratch — State, Responsibilities, Objects

**Slide 8 — Functions vs Classes: When to Upgrade**
- Functions are fine for stateless transformations: parse_reading(), format_timestamp()
- Classes are for things with state and behaviour: an instrument connection, a data recorder
- Rule of thumb: if you're passing the same 3–4 values between functions, you might want an object
- Speaker notes: Don't oversell OOP. Functions are great. Classes are for managing state.

**Slide 9 — What Is an Object?**
- An object = state + behaviour + identity
- Example: a TemperatureReading has a value, a unit, a timestamp
- Example: a SerialConnection has a port, a baud rate, an open/closed state
- [DEMO] Simple class with __init__, a method, and a property
- Speaker notes: Live-code a small class. Show how state lives inside the object.

**Slide 10 — State and Responsibility**
- Every class should have one clear reason to exist
- TemperatureSensor: reads temperature from the instrument
- DataRecorder: writes readings to a file
- If a class is doing two unrelated things, split it
- Speaker notes: Use the "describe it in one sentence" test. If you need "and", it's two classes.

**Slide 11 — Composition vs Inheritance**
- Inheritance: "is a" — use sparingly
- Composition: "has a" — use by default
- A DataAcquisitionSystem HAS a sensor, HAS a recorder, HAS a display
- It is NOT a sensor, NOT a recorder, NOT a display
- [DIAGRAM] Composition tree: system contains sensor + recorder + display
- Speaker notes: In instrument code, composition wins almost always. Inheritance makes sense for the adapter interface and not much else.

**Slide 12 — How to Slice Logic into Small Units**
- Find the nouns: instrument, reading, recorder, config, display
- Find the verbs: connect, read, record, display, configure
- Assign each verb to the right noun
- If a noun has too many verbs, split it
- Speaker notes: Walk through the messy script from Slide 4 and identify the nouns and verbs.

**Slide 13 — Lab 1 Preview: From Script to Classes**
- You'll receive a messy 200-line script
- Your job: identify the responsibilities and split into classes
- Target: at least 3 classes with clear boundaries
- We'll review together afterward
- Speaker notes: Hand out the lab sheet. Give delegates 25–30 minutes. Walk the room.

---

**[LAB 1 happens here — 25–30 minutes]**

---

**Slide 14 — Lab 1 Debrief**
- [DISCUSSION] What classes did you create?
- Common good answers: InstrumentReader, DataRecorder, ReadingFormatter
- Common mistakes: too many tiny classes, or just moving code into a class without thinking about responsibility
- Speaker notes: Show the suggested solution. Emphasise that there's no single right answer, but some splits are clearly better.

### Session 1.3: The Messy Driver — Seam Identification and Refactoring

**Slide 15 — The Messy Driver**
- Show a realistic 150-line instrument driver
- Mixed concerns: serial setup, command formatting, response parsing, error handling, data conversion
- Hard-coded port, baud rate, command strings
- Speaker notes: "This is based on real drivers I've seen. It works, but it's fragile."

**Slide 16 — What Is a Seam?**
- A seam is a point where you can change behaviour without editing the surrounding code
- Michael Feathers' concept: "a place where you can alter behaviour without editing in that place"
- In instrument code, seams are: the transport layer, the command format, the response parser, the error handler
- [DIAGRAM] Annotated driver with seams marked in colour
- Speaker notes: Draw the seams on the whiteboard over the messy driver code.

**Slide 17 — Finding Seams in Real Code**
- Look for: hardcoded values, mixed abstraction levels, "if device_type ==" branches
- Look for: the same serial.write/serial.read pattern with different commands
- Look for: error handling scattered everywhere
- The seams tell you where to cut
- Speaker notes: This is pattern recognition. The more messy code you see, the faster you spot seams.

**Slide 18 — Refactoring Toward Clarity**
- Step 1: Extract the transport (serial read/write) into its own class
- Step 2: Extract command formatting into methods or a protocol class
- Step 3: Extract response parsing into pure functions
- Step 4: Extract error handling into a retry wrapper or strategy
- [DEMO] Refactor one section of the messy driver live
- Speaker notes: Do ONE extraction live. Then set delegates loose on the rest.

**Slide 19 — Lab 2 Preview: Refactor the Messy Driver**
- You'll receive the messy driver
- Identify seams, then extract at least the transport layer and the parsing logic
- Goal: the driver should be testable without a real serial port
- Speaker notes: 30 minutes. Walk the room. Hint at the adapter pattern if delegates are stuck.

---

**[LAB 2 happens here — 30 minutes]**

---

**Slide 20 — Lab 2 Debrief**
- Show the refactored driver
- Key insight: separating transport from protocol makes everything testable
- This is the foundation for the Adapter pattern
- Speaker notes: Bridge to the next session.

### Session 1.4: Adapter Pattern — Hardware Abstraction

**Slide 21 — The Problem: Your Code Is Married to Your Hardware**
- serial.Serial('/dev/ttyUSB0', 9600) appears 47 times
- Change the instrument? Rewrite everything
- Test without hardware? Impossible
- Speaker notes: "If your code can only run when the hardware is plugged in, your code owns you."

**Slide 22 — The Adapter Pattern**
- [DIAGRAM] Port–Adapter diagram
- Define an interface (the port): connect(), read_value(), send_command(), disconnect()
- Implement it twice: RealInstrumentAdapter, SimulatedInstrumentAdapter
- The rest of your code only talks to the interface
- Speaker notes: The interface is the contract. The adapter is the implementation. This is the single most important pattern in the course.

**Slide 23 — The Interface (Abstract Base Class)**
- Show the ABC: InstrumentAdapter with abstract methods
- connect() -> None
- read_value() -> Reading
- send_command(cmd: str) -> str
- disconnect() -> None
- is_connected property
- Speaker notes: Explain ABC briefly. The point is not the Python mechanism — it's the contract.

**Slide 24 — The Simulated Adapter**
- SimulatedInstrumentAdapter implements the same interface
- Returns synthetic data: sine wave with noise, configurable rate
- Can simulate: connection failure, timeout, garbage response, drift
- No serial port needed
- Speaker notes: [DEMO] Show the simulator running in a terminal. Toggle error modes.

**Slide 25 — The Real Adapter**
- RealInstrumentAdapter wraps pyserial
- Same interface, real hardware
- The calling code cannot tell the difference
- Speaker notes: Show this on the instructor rig if available. If not, show the code and explain.

**Slide 26 — Swapping at Startup**
- Factory function or config-driven selection:
  ```python
  adapter = create_adapter(config['device']['type'])
  ```
- "simulated" → SimulatedInstrumentAdapter
- "serial" → RealInstrumentAdapter
- The rest of the application does not change
- Speaker notes: This is the payoff. One line changes the entire backend.

**Slide 27 — Lab 3 Preview: Build the Adapter**
- Implement InstrumentAdapter ABC
- Implement SimulatedInstrumentAdapter
- Implement a stub RealInstrumentAdapter (or real one if you have hardware)
- Write a small script that uses both interchangeably
- Speaker notes: 30 minutes. Provide the ABC as starter code. Delegates implement the simulator.

---

**[LAB 3 happens here — 30 minutes]**

---

**Slide 28 — Lab 3 Debrief**
- [DEMO] Run the same script with both adapters
- Key insight: the calling code is identical
- This is what "the controller does not care" means
- Speaker notes: Celebrate this moment. This is the core architectural idea of the whole course.

### Session 1.5: Strategy Pattern — Changing Behaviour Without Rewriting

**Slide 29 — The Problem: Measurement Modes**
- Your instrument supports: single reading, continuous reading, burst mode, averaging mode
- Without Strategy: massive if/elif chain
- Adding a new mode means editing the core logic
- Speaker notes: "Every time you see a big if/elif for different modes, you're looking at a Strategy opportunity."

**Slide 30 — The Strategy Pattern**
- [DIAGRAM] Strategy pattern: context holds a reference to a strategy object
- Define MeasurementStrategy ABC: execute(adapter) -> list[Reading]
- SingleReadStrategy, ContinuousReadStrategy, AveragingStrategy
- Swap the strategy object to change behaviour
- Speaker notes: Same shape as Adapter — an interface with multiple implementations. The difference is intent: Adapter abstracts hardware, Strategy abstracts behaviour.

**Slide 31 — Combining Adapter + Strategy**
- [DIAGRAM] Controller → Strategy → Adapter → Hardware/Simulator
- The controller picks a strategy. The strategy uses the adapter. Neither knows the details of the other.
- Speaker notes: Draw this on the whiteboard. Emphasise the clean chain of responsibility.

**Slide 32 — Lab 4 Preview: Implement Strategies**
- Implement at least two measurement strategies
- Connect them to your adapter from Lab 3
- Show that you can swap strategies without changing the adapter or calling code
- Speaker notes: 20 minutes. Simpler lab — the concept builds on Lab 3.

---

**[LAB 4 happens here — 20 minutes]**

---

**Slide 33 — Lab 4 Debrief and Day 1 Recap**
- You started with a messy script
- You identified seams and refactored
- You built an Adapter to abstract hardware
- You built Strategies to abstract behaviour
- Tomorrow: we wrap this in a real GUI application
- Speaker notes: Quick recap. Ask "what was the most useful idea today?" Go around the room.

---

## Day 2 Slides

### Session 2.1: SOLID Violations in Instrument Code

**Slide 34 — Day 2 Welcome**
- Yesterday: script → objects → patterns
- Today: patterns → application → threads
- By end of today: a working desktop application
- Speaker notes: Quick energy check. Answer overnight questions.

**Slide 35 — Hardcoding Is a SOLID Violation**
- serial.Serial('/dev/ttyUSB0', 9600) — Single Responsibility violation (the class knows about deployment)
- if format == 'csv': ... elif format == 'json': — Open/Closed violation (adding a format means editing this code)
- gui_label.setText(str(reading)) inside the driver — Dependency Inversion violation (low-level module depends on high-level GUI)
- Speaker notes: Don't lecture SOLID as theory. Show each violation in real instrument code and explain why it hurts.

**Slide 36 — What SOLID Means in Practice**
- S: each class does one job (sensor reads, recorder writes, UI displays)
- O: add new formats/modes/devices by adding classes, not editing existing ones
- L: any adapter that implements the interface can be used without surprises
- I: don't force a simple sensor to implement 20 methods it doesn't need
- D: depend on abstractions (InstrumentAdapter), not concretions (serial.Serial)
- Speaker notes: One slide, five bullets. This is the pragmatic summary. Don't go deeper unless asked.

**Slide 37 — Why Coupling Hardware to GUI Breaks Everything**
- [DIAGRAM] Tightly coupled: GUI → serial.read() → blocks UI → frozen app
- Testing: impossible without hardware
- Reuse: impossible in a different UI
- Error handling: one serial timeout crashes the GUI
- Speaker notes: "If your button click handler calls serial.read(), your application is one cable pull away from freezing."

**Slide 38 — "The Controller Does Not Care" Architecture**
- The controller orchestrates. It does not know about:
  - Serial ports (that's the adapter's job)
  - CSV files (that's the data sink's job)
  - Qt widgets (that's the view's job)
  - Retry logic (that's the error handler's job)
- [DIAGRAM] Clean layered architecture with the controller in the middle
- Speaker notes: This phrase is the mantra of the course. Repeat it every time you decouple something.

### Session 2.2: MVC for Instrument Applications

**Slide 39 — MVC: What It Actually Means Here**
- Model: the data and state (current reading, connection status, recording state)
- View: the PySide6 GUI (labels, buttons, plots)
- Controller: the orchestrator (connects model events to view updates, handles user actions)
- Speaker notes: MVC in instrument apps is looser than textbook MVC. The goal is separation, not purity.

**Slide 40 — The Model**
- Pure Python class, no Qt dependency
- Holds: current_reading, is_connected, is_recording, error_state
- Emits events (or uses Qt signals if pragmatic)
- Can be tested without a GUI
- Speaker notes: Show a simple model class. Emphasise: if your model imports PySide6, something is wrong.

**Slide 41 — The View**
- PySide6 widgets: QMainWindow, QLabel, QPushButton, QStatusBar
- [DIAGRAM] Annotated GUI mockup showing: connection status, current reading, start/stop button, status bar
- The view does not call serial.read(). The view does not write files. The view displays and collects input.
- Speaker notes: Show a simple PySide6 window. If time permits, show Qt Designer briefly.

**Slide 42 — The Controller**
- Connects the model to the view
- Handles: user clicks → model actions → view updates
- Example: user clicks "Connect" → controller calls adapter.connect() → updates model → view shows "Connected"
- Speaker notes: The controller is the thinnest layer. It's mostly wiring.

**Slide 43 — PySide6 Crash Course**
- QApplication, QMainWindow, QWidget
- Layouts: QVBoxLayout, QHBoxLayout, QGridLayout
- Widgets: QLabel, QPushButton, QComboBox, QStatusBar
- Signal/slot: button.clicked.connect(self.on_connect)
- [DEMO] Build a minimal PySide6 window with a button and label
- Speaker notes: 10-minute live demo. Don't go deep into Qt — just enough to build the mini-app.

**Slide 44 — Qt Designer vs Hand-Coded UI**
- Qt Designer: drag and drop, generates .ui files, load with QUiLoader
- Hand-coded: more control, easier to version control, better for small UIs
- Recommendation: hand-code for this course; use Designer for complex layouts later
- Speaker notes: Show Designer briefly if installed. Don't spend more than 5 minutes on it.

### Session 2.3: Error Handling — Timeouts, Retries, "The Controller Does Not Care"

**Slide 45 — Error Handling in Instrument Code**
- Instruments fail. Cables unplug. Serial buffers corrupt. Timeouts happen.
- The question is not whether errors occur, but where and how you handle them
- Speaker notes: "Every instrument engineer has a war story about a cable that came loose at 2 AM."

**Slide 46 — Error Handling Patterns**
- Timeout with default: try to read, return None or a sentinel after timeout
- Retry with backoff: try N times, wait between attempts
- Error propagation: adapter raises, controller catches, view shows status
- "The controller does not care": the controller does not handle serial exceptions — the adapter does
- [DIAGRAM] Error propagation path: adapter → controller → view
- Speaker notes: Show a retry decorator. Show how the controller only sees "connected" or "error", never SerialException.

**Slide 47 — Safe Error Architecture**
- The adapter catches hardware exceptions and translates them to application-level states
- The controller receives clean status: Connected, Disconnected, Error(message)
- The view displays status without knowing why
- Never let a serial exception crash the GUI
- Speaker notes: Live-code an example of wrapping serial.read() with timeout and error translation.

### Session 2.4: QThread + Worker — Background Acquisition

**Slide 48 — Why You Need a Worker Thread**
- [DEMO] Show a GUI that calls serial.read() in the button handler → GUI freezes
- The GUI runs on the main thread (the event loop)
- Blocking the main thread = frozen application
- Solution: run acquisition on a separate thread
- Speaker notes: This demo is dramatic. Let the GUI freeze. Let delegates see it.

**Slide 49 — QThread + Worker Object Pattern**
- [DIAGRAM] Main thread ↔ Worker thread, connected by signals
- Create a QObject-based Worker class
- Move it to a QThread
- Connect signals: worker.reading_ready → controller.on_reading
- Connect signals: worker.error_occurred → controller.on_error
- Speaker notes: This is the correct Qt pattern. Do NOT subclass QThread. Create a worker and move it.

**Slide 50 — The Worker Class**
- ```python
  class AcquisitionWorker(QObject):
      reading_ready = Signal(object)
      error_occurred = Signal(str)
      finished = Signal()
  ```
- run() method: loop, read from adapter, emit reading_ready
- Must check for stop flag: while self._running
- Speaker notes: Show the complete worker class. Emphasise the stop flag pattern.

**Slide 51 — Starting and Stopping Cleanly**
- Start: create thread, create worker, move worker to thread, connect signals, start thread
- Stop: set worker._running = False, wait for thread to finish, clean up
- [DEMO] Live demo of start/stop cycle with simulated adapter
- Speaker notes: Show the start and stop methods in the controller. Emphasise cleanup.

**Slide 52 — Signal/Slot Communication**
- Signals are thread-safe in Qt
- worker.reading_ready.emit(reading) → controller.on_reading(reading) runs on main thread
- This is how data crosses the thread boundary safely
- Never update GUI widgets from the worker thread directly
- Speaker notes: "Signals are your only safe bridge between threads. Everything else is a race condition waiting to happen."

**Slide 53 — Error Propagation Across Threads**
- Worker catches exceptions in its loop
- Emits error_occurred signal with message
- Controller receives on main thread, updates model and view
- Worker can continue, retry, or stop depending on error severity
- Speaker notes: Show the try/except inside the worker loop.

**Slide 54 — Lab 5 Preview: Worker Thread**
- Build an AcquisitionWorker that reads from SimulatedInstrumentAdapter
- Connect it to a simple PySide6 GUI with start/stop buttons
- Display readings in a QLabel
- Handle errors gracefully
- Speaker notes: 35 minutes. Provide the GUI skeleton. Delegates implement the worker and wiring.

---

**[LAB 5 happens here — 35 minutes]**

---

**Slide 55 — Lab 5 Debrief**
- [DEMO] Show working app with start/stop and live readings
- Key question: "What happens if you unplug the simulator?" (Answer: the error signal fires, the GUI shows an error, the app stays alive)
- Speaker notes: If time, show the same code running against the real Arduino.

### Sessions 2.5 & 2.6: Mini-App Build

**Slide 56 — Mini-App: Putting It All Together**
- You will build a small instrument-control application with:
  - PySide6 GUI
  - MVC structure
  - SimulatedInstrumentAdapter (or real, if you have one)
  - Worker thread for acquisition
  - Start/Stop controls
  - Live reading display
  - Connection status indicator
  - Error handling
- Speaker notes: This is the big build session. Provide the project skeleton. Let delegates work.

**Slide 57 — Mini-App Architecture**
- [DIAGRAM] Full architecture diagram:
  - View (PySide6) ↔ Controller ↔ Model
  - Controller → Worker → Adapter → Simulator
  - Worker --signal--> Controller --update--> View
- Speaker notes: Put this diagram on the projector and leave it up during the build session.

**Slide 58 — Lab 6 Preview: Build the Mini-App**
- Phase 1: Set up the project structure (10 min)
- Phase 2: Build the GUI shell (15 min)
- Phase 3: Wire up the controller and adapter (15 min)
- Phase 4: Add the worker thread (15 min)
- Phase 5: Add status indicators and error handling (15 min)
- Phase 6 (extension): Swap to real adapter if hardware available
- Speaker notes: 70 minutes total. Walk the room constantly. Pair up slower delegates with faster ones.

---

**[LAB 6 happens here — 70 minutes]**

---

**Slide 59 — Mini-App Debrief and Day 2 Recap**
- [DEMO] Show a working mini-app
- Show simulator swap: change config, restart, same GUI, different backend
- Tomorrow: data architecture, real-time plotting, performance
- Day 2 checkpoint questions:
  - "Can you explain what the controller does?"
  - "Why is the worker on a separate thread?"
  - "What happens if the adapter raises an exception?"
- Speaker notes: Celebrate working apps. Note common problems for tomorrow morning.

---

## Day 3 Slides

### Session 3.1: DataSink Abstraction — CSV, JSON, HDF5

**Slide 60 — Day 3 Welcome**
- Yesterday: a working application
- Today: where does the data go? How do we keep it fast?
- By end of today: a complete instrument-control system with data logging and real-time plotting
- Speaker notes: Quick energy check.

**Slide 61 — "The Controller Does Not Care" About Data Formats**
- The controller produces readings
- It does not know whether they are written to CSV, JSON, HDF5, a database, or /dev/null
- [DIAGRAM] Controller → DataSink interface → multiple implementations
- Speaker notes: Same pattern as the adapter. Same architectural idea. Different context.

**Slide 62 — The DataSink Interface**
- ```python
  class DataSink(ABC):
      @abstractmethod
      def open(self, metadata: dict) -> None: ...
      @abstractmethod
      def write(self, reading: Reading) -> None: ...
      @abstractmethod
      def close(self) -> None: ...
  ```
- Speaker notes: Three methods. That's all. Open, write, close.

**Slide 63 — CsvSink**
- Opens a CSV file, writes header, writes readings as rows
- Simple, universally readable, good for moderate data rates
- Limitation: no metadata, no hierarchical data
- [DEMO] Show CsvSink in action
- Speaker notes: Live-code this. It's short and satisfying.

**Slide 64 — JsonMetadataSink**
- Writes a companion .json file alongside the data file
- Contains: experiment name, operator, instrument ID, start time, configuration, units
- Not for high-rate data — for reproducibility metadata
- Speaker notes: "Every dataset should have a metadata file. Future-you will thank present-you."

**Slide 65 — Optional: HDF5 Sink**
- h5py for high-rate, structured, binary data
- Stores data + metadata in one file
- Much faster than CSV for large datasets
- Speaker notes: Brief introduction. Optional for the lab. Show it working if time permits.

**Slide 66 — CompositeSink: Writing to Multiple Sinks**
- CompositeSink holds a list of DataSinks
- Delegates write() to all of them
- Example: write readings to CSV AND emit them to the GUI AND log metadata to JSON
- Speaker notes: This is the "tee" pattern. Simple and powerful.

**Slide 67 — Lab 7 Preview: Implement DataSinks**
- Implement CsvSink
- Implement JsonMetadataSink
- Implement CompositeSink
- Extension: implement Hdf5Sink
- Wire them into your mini-app from Day 2
- Speaker notes: 30 minutes. Provide the ABC. Delegates implement sinks.

---

**[LAB 7 happens here — 30 minutes]**

---

**Slide 68 — Lab 7 Debrief**
- Show CSV output, JSON metadata file
- Key insight: adding a new format means adding one class. Nothing else changes.
- Speaker notes: Bridge to the writer thread.

### Session 3.2: Writer Thread and Non-Blocking I/O

**Slide 69 — The Problem: File I/O Blocks Acquisition**
- Writing to disk is slow (especially CSV with flush)
- If the writer blocks the acquisition loop, you miss readings
- Solution: decouple with a queue and a writer thread
- [DIAGRAM] Acquisition thread → Queue → Writer thread → Disk
- Speaker notes: "The acquisition thread should never wait for disk. That's what the queue is for."

**Slide 70 — Queue-Based Decoupling**
- queue.Queue is thread-safe
- Acquisition worker puts readings on the queue
- Writer thread gets readings from the queue and writes to sinks
- The queue absorbs bursts: if writing is temporarily slow, readings buffer
- Speaker notes: Show the Queue API: put(), get(), qsize(), join().

**Slide 71 — The Writer Thread**
- Simple loop: get from queue, write to sinks, repeat
- Sentinel value (None) to signal shutdown
- Clean shutdown: drain the queue, close all sinks
- Speaker notes: Live-code the writer thread. Emphasise the sentinel pattern.

**Slide 72 — Lab 8 Preview: Writer Thread**
- Add a data queue between your acquisition worker and your data sinks
- Implement a writer thread that consumes the queue
- Verify that acquisition is not blocked by file I/O
- Speaker notes: 20 minutes. Shorter lab — the pattern is straightforward.

---

**[LAB 8 happens here — 20 minutes]**

---

### Session 3.3: Units, Metadata, and Configuration

**Slide 73 — Units with Pint**
- Pint: Python library for physical units
- ```python
  import pint
  ureg = pint.UnitRegistry()
  temp = 23.5 * ureg.degC
  print(temp.to(ureg.degF))  # 74.3 degF
  ```
- Where units belong: in the model, at the boundary between raw values and application logic
- Speaker notes: Show unit conversion, unit checking, and unit errors. Keep it brief — 10 minutes max.

**Slide 74 — Where Units Belong in the Architecture**
- [DIAGRAM] Raw bytes → Adapter (parses) → Reading with units (model) → Sink (writes) → GUI (displays)
- The adapter converts raw serial data to unit-aware values
- The model carries units
- The sink writes units to the file
- The GUI formats units for display
- Speaker notes: Units flow through the model. They are not a GUI concern and not a driver concern.

**Slide 75 — Metadata for Reproducibility**
- Every data file should be traceable to:
  - Who ran the experiment
  - What instrument was used
  - When it started and stopped
  - What configuration was active
  - What software version was running
- Speaker notes: "If you can't reproduce the experiment from the metadata, the data is an orphan."

**Slide 76 — Configuration Files**
- YAML or JSON for configuration
- ```yaml
  device:
    type: simulated
    port: COM3
    baud_rate: 9600
  acquisition:
    interval_ms: 100
    strategy: continuous
  output:
    formats: [csv, json_metadata]
    directory: ./data
  ```
- Load at startup, change behaviour without editing code
- Speaker notes: [DEMO] Show how changing the config file from "simulated" to "serial" changes the backend.

**Slide 77 — Lab 9 Preview: Configuration and Metadata**
- Add a YAML config file to your application
- Load device type, acquisition settings, and output format from config
- Write a JSON metadata file with each acquisition session
- Speaker notes: 20 minutes. Provide a sample config file. Delegates wire it in.

---

**[LAB 9 happens here — 20 minutes]**

---

### Session 3.4: Performance Engineering

**Slide 78 — The Six Most Common Performance Problems**
- 1. Event loop blocking (serial.read on main thread)
- 2. Too many GUI updates (updating a label at 1000 Hz)
- 3. Wrong-thread updates (writing to QLabel from worker thread)
- 4. Slow file I/O in the acquisition loop
- 5. Slow parsing (regex on every reading, string formatting in hot loops)
- 6. No buffering (one-byte serial reads, one-row CSV writes)
- Speaker notes: Walk through each with a concrete example. Show the symptom, the diagnosis, and the fix.

**Slide 79 — Diagnosis: How to Find the Bottleneck**
- time.perf_counter() around suspected hot spots
- qsize() on the data queue: if it grows, the writer is too slow
- GUI responsiveness: if the window feels sticky, the main thread is blocked
- cProfile for offline analysis (not in production)
- Speaker notes: "Don't optimise by guessing. Measure first."

**Slide 80 — Fixes**
- Worker thread for acquisition ✓ (you already did this)
- Data queue for decoupling ✓ (you already did this)
- Writer thread for disk I/O ✓ (you already did this)
- Throttled GUI updates: update at 10–30 Hz, not at data rate
- Batch serial reads: read a buffer, parse multiple readings
- Binary protocols: struct.pack/unpack instead of ASCII parsing
- Buffered writes: write N readings at once, not one at a time
- HDF5 for high-rate data: much faster than CSV for large datasets
- Speaker notes: Most of these have been addressed architecturally. The remaining ones are specific optimisations.

**Slide 81 — GUI Update Throttling**
- QTimer at 30 Hz: timer fires, controller reads latest value from model, updates view
- Do NOT update the view on every signal from the worker
- [DEMO] Show the difference: 1000 Hz updates (jerky) vs 30 Hz throttled updates (smooth)
- Speaker notes: This is one of the most impactful performance fixes. Live-demo it.

**Slide 82 — ASCII vs Binary Protocols**
- ASCII: "TEMP:23.5\r\n" — human-readable, easy to debug, slow to parse
- Binary: struct.pack('<f', 23.5) — 4 bytes, fast to parse, hard to debug
- For classroom: use ASCII (easier to understand and debug)
- For production: consider binary for high-rate data
- Speaker notes: Brief comparison. Don't require binary in the labs.

### Session 3.5: Real-Time Plotting with PyQtGraph

**Slide 83 — Why Not Matplotlib?**
- Matplotlib: excellent for static plots, too slow for real-time
- PyQtGraph: designed for real-time, Qt-native, updates at 60+ FPS
- Speaker notes: "If your plot flickers or lags, you're using the wrong library."

**Slide 84 — PyQtGraph Basics**
- ```python
  import pyqtgraph as pg
  plot_widget = pg.PlotWidget()
  curve = plot_widget.plot(pen='y')
  curve.setData(x_data, y_data)
  ```
- Embed in PySide6: just add plot_widget to a layout
- Speaker notes: [DEMO] Live-code a simple real-time plot with a timer.

**Slide 85 — Efficient Real-Time Plotting**
- Ring buffer: fixed-size array, overwrite oldest values
- Update at display rate (30 Hz), not data rate
- setData() replaces all data, not append — this is fast
- Use downsampling for very long traces
- [DEMO] Show ring buffer plot with simulated data
- Speaker notes: Show the ring buffer implementation. Numpy arrays are fastest.

**Slide 86 — Rate Limiters and "Performance Mode"**
- Rate limiter: only update the plot if enough time has passed since last update
- "Performance mode": reduce plot update rate, increase batch size, disable animations
- Architecture: the model holds data, the view pulls at its own rate
- Speaker notes: This is the final architectural insight: the view consumes data on its own schedule.

**Slide 87 — Lab 10 Preview: Real-Time Plot**
- Add a PyQtGraph plot to your mini-app
- Display live temperature readings from the simulated instrument
- Implement a ring buffer for the plot data
- Use a QTimer to throttle plot updates to 30 Hz
- Extension: add a second trace for voltage
- Speaker notes: 30 minutes. Provide the PyQtGraph boilerplate. Delegates integrate it.

---

**[LAB 10 happens here — 30 minutes]**

---

**Slide 88 — Lab 10 Debrief**
- [DEMO] Show the complete application with live plot
- Show smooth scrolling, rate-limited updates
- Compare with simulated vs real data (if hardware available)
- Speaker notes: This is the "wow" moment. The app looks real.

### Session 3.6: Capstone Integration and Demonstration

**Slide 89 — Capstone: Everything Connected**
- Your application now has:
  - MVC architecture
  - Simulated + real adapters
  - Measurement strategies
  - Background acquisition worker
  - Data queue
  - CSV + JSON metadata sinks
  - Writer thread
  - Configuration file
  - Real-time plot
  - Error handling and status display
- [DIAGRAM] Complete architecture diagram with all components
- Speaker notes: Put the full diagram on screen. Walk through each component.

**Slide 90 — Capstone Demonstration Checklist**
- Can you start and stop acquisition?
- Does the plot update smoothly?
- Does the CSV file contain valid data?
- Does the metadata file contain experiment information?
- Can you change the device type in config and restart with a different backend?
- Does the app handle errors gracefully?
- Speaker notes: Have delegates run through this checklist on their own apps.

**Slide 91 — Extension Challenges**
- Add a new measurement strategy (e.g., averaging mode)
- Add a new data sink (e.g., SQLite)
- Add a new UI feature (e.g., configurable sample rate dropdown)
- Add a "performance mode" toggle
- Add a second instrument adapter
- Speaker notes: For fast learners who finish early. These are optional.

**Slide 92 — Cross-Course Themes: What You Learned**
- Add a new measurement mode → Strategy pattern
- Add a new device → Adapter pattern
- Add new configuration → config file
- Change data formats → DataSink interface
- Add new UI features → without touching the model
- Debug real-time applications → threads, queues, throttling
- Speaker notes: Tie everything together. Each pattern solves a specific type of change.

**Slide 93 — What Comes Next**
- Testing: start with smoke tests, grow from there
- Packaging: PyInstaller, cx_Freeze for distributable apps
- Version control: Git for team collaboration
- CI/CD: automated testing on commit
- Documentation: docstrings where they matter, not everywhere
- Speaker notes: Brief pointers. Don't go deep — these are future learning paths.

**Slide 94 — Thank You / Feedback**
- Course feedback form
- Instructor contact
- Resources and references
- Speaker notes: Hand out feedback forms. Thank the delegates.

---

# 4. LABS / EXERCISES

## Lab 1: From Script to Classes

| Field | Detail |
|---|---|
| **Title** | Refactoring a Monolithic Script |
| **Objective** | Identify responsibilities in a messy script and split them into classes |
| **Duration** | 25–30 minutes |
| **Session** | Day 1, Session 1.2 |
| **Starter code** | `examples/messy_script.py` — a 200-line script that reads from a simulated serial port, parses responses, prints values, writes to CSV, and handles basic errors, all in one file |
| **Instructions** | 1. Read through the script and identify at least 3 distinct responsibilities. 2. Create a class for each responsibility. 3. Refactor the script so that the main() function creates instances and calls methods. 4. Ensure the refactored version produces the same output. |
| **Expected output** | A refactored script with 3+ classes (e.g., InstrumentReader, DataRecorder, ReadingFormatter) and a clean main() function |
| **Solution outline** | InstrumentReader: connect(), read_raw(), parse_response(). DataRecorder: open(), write_reading(), close(). ReadingFormatter: format_for_display(), format_for_csv(). Main: creates instances, loops, coordinates. |
| **Common mistakes** | Creating classes that are just namespaces for functions (no state). Moving code into a class but keeping global state. Making one giant class that does everything. |
| **Instructor hints** | Walk the room after 10 minutes. If delegates are stuck, ask: "What nouns do you see in this script?" Then: "What does each noun do?" |

## Lab 2: Refactor the Messy Driver

| Field | Detail |
|---|---|
| **Title** | Seam Identification and Driver Refactoring |
| **Objective** | Find seams in a messy instrument driver and extract the transport layer |
| **Duration** | 30 minutes |
| **Session** | Day 1, Session 1.3 |
| **Starter code** | `examples/messy_driver.py` — a 150-line driver that mixes serial setup, command formatting, response parsing, error handling, and data conversion |
| **Instructions** | 1. Read the driver and mark the seams (transitions between concerns). 2. Extract the serial transport (read/write) into a Transport class. 3. Extract response parsing into pure functions. 4. Ensure the driver still works with the simulated serial backend. |
| **Expected output** | A driver that delegates transport to a Transport class and uses pure functions for parsing. The main logic reads cleanly. |
| **Solution outline** | Transport class: send(cmd) -> str, receive() -> str. Pure functions: parse_temperature(raw: str) -> float, parse_status(raw: str) -> dict. Driver: uses Transport and parse functions. |
| **Common mistakes** | Extracting too little (just moving one line). Extracting too much (creating 10 tiny classes). Not making the transport substitutable. |
| **Instructor hints** | If delegates don't see the seams, highlight the serial.write / serial.read calls. These are the transport seam. The string parsing is the protocol seam. |

## Lab 3: Build the Adapter

| Field | Detail |
|---|---|
| **Title** | Instrument Adapter with Simulated Backend |
| **Objective** | Implement the Adapter pattern with a simulated instrument |
| **Duration** | 30 minutes |
| **Session** | Day 1, Session 1.4 |
| **Starter code** | `core/adapter_interface.py` — the InstrumentAdapter ABC with method signatures. `drivers/simulated.py` — skeleton with TODOs |
| **Instructions** | 1. Review the InstrumentAdapter ABC. 2. Implement SimulatedInstrumentAdapter: connect() sets a flag, read_value() returns a Reading with sine-wave + noise, disconnect() clears the flag. 3. Write a small test script that creates the adapter, connects, reads 10 values, disconnects. 4. Extension: implement RealInstrumentAdapter using pyserial if you have hardware. |
| **Expected output** | A working SimulatedInstrumentAdapter that produces realistic readings. A test script that prints 10 readings. |
| **Solution outline** | SimulatedInstrumentAdapter: uses time.time() for sine wave, random.gauss() for noise. Reading dataclass with value, unit, timestamp. |
| **Common mistakes** | Forgetting to check is_connected before reading. Returning raw floats instead of Reading objects. Not implementing all abstract methods. |
| **Instructor hints** | Provide the Reading dataclass. Suggest sine wave: math.sin(time.time() * frequency) * amplitude + offset + random.gauss(0, noise). |

## Lab 4: Implement Strategies

| Field | Detail |
|---|---|
| **Title** | Measurement Strategy Pattern |
| **Objective** | Implement swappable measurement strategies |
| **Duration** | 20 minutes |
| **Session** | Day 1, Session 1.5 |
| **Starter code** | `core/strategy_interface.py` — MeasurementStrategy ABC |
| **Instructions** | 1. Implement SingleReadStrategy: calls adapter.read_value() once, returns one Reading. 2. Implement ContinuousReadStrategy: calls adapter.read_value() N times at interval, returns list of Readings. 3. Write a script that uses both strategies with the same adapter. 4. Extension: implement AveragingStrategy that reads N times and returns the mean. |
| **Expected output** | Two working strategies that produce different outputs from the same adapter. |
| **Solution outline** | SingleReadStrategy.execute(adapter) → [adapter.read_value()]. ContinuousReadStrategy.execute(adapter, count=5, interval=0.1) → list of readings. |
| **Common mistakes** | Putting adapter creation inside the strategy. Hardcoding the adapter type. |
| **Instructor hints** | If delegates finish fast, challenge them to add a strategy that changes sample rate dynamically. |

## Lab 5: Worker Thread

| Field | Detail |
|---|---|
| **Title** | Background Acquisition with QThread |
| **Objective** | Run instrument acquisition on a worker thread and display results in PySide6 |
| **Duration** | 35 minutes |
| **Session** | Day 2, Session 2.4 |
| **Starter code** | `ui/worker_template.py` — skeleton AcquisitionWorker with signal definitions. `ui/simple_gui.py` — minimal PySide6 window with QLabel and two buttons |
| **Instructions** | 1. Complete the AcquisitionWorker: implement run() with a loop that reads from the adapter and emits reading_ready. 2. Add a stop flag and respond to it. 3. In the GUI, wire up Start button to create and start the worker. 4. Wire up Stop button to stop the worker cleanly. 5. Connect reading_ready signal to update the QLabel. 6. Test with the simulated adapter. |
| **Expected output** | A GUI that starts/stops acquisition and displays live readings without freezing. |
| **Solution outline** | Worker.run(): while self._running: reading = self.adapter.read_value(); self.reading_ready.emit(reading); time.sleep(interval). Controller: creates QThread, moves worker, connects signals, starts. |
| **Common mistakes** | Subclassing QThread instead of using QObject + moveToThread. Updating QLabel directly from the worker. Forgetting to stop the thread on window close. |
| **Instructor hints** | Show the freeze demo first (Slide 48). Provide the signal definitions. Emphasise the moveToThread pattern. |

## Lab 6: Mini-App Build

| Field | Detail |
|---|---|
| **Title** | Instrument Control Mini-App |
| **Objective** | Build a complete PySide6 application with MVC, worker thread, and adapter swap |
| **Duration** | 70 minutes |
| **Session** | Day 2, Sessions 2.5–2.6 |
| **Starter code** | Project skeleton with folder structure, adapter implementations from Day 1, empty UI and controller files |
| **Instructions** | Phase 1 (10 min): Set up the project structure. Create app_model.py with state fields. Phase 2 (15 min): Build the GUI — QMainWindow with connect/disconnect, start/stop, reading label, status bar. Phase 3 (15 min): Build the controller — wire buttons to adapter operations, update model and view. Phase 4 (15 min): Add the acquisition worker from Lab 5. Phase 5 (15 min): Add status indicators (connected/disconnected icon, error messages). Phase 6 (extension): Change config to use real adapter and demo with hardware. |
| **Expected output** | A working desktop application that connects to a simulated instrument, acquires data in background, displays readings, and handles errors. |
| **Solution outline** | Model: current_reading, is_connected, is_acquiring, error_message. View: QMainWindow with widgets, update methods. Controller: on_connect, on_start, on_stop, on_reading, on_error. Worker: AcquisitionWorker on QThread. |
| **Common mistakes** | Putting business logic in the view. Forgetting to disable buttons when already connected. Not cleaning up the thread on close. Race conditions on start/stop. |
| **Instructor hints** | Walk the room every 5 minutes. Pair slower delegates with faster ones. Have a working solution ready to show at each phase. |

## Lab 7: Implement DataSinks

| Field | Detail |
|---|---|
| **Title** | DataSink Abstraction |
| **Objective** | Implement CSV and JSON metadata sinks behind a common interface |
| **Duration** | 30 minutes |
| **Session** | Day 3, Session 3.1 |
| **Starter code** | `core/data_sink.py` — DataSink ABC. `core/reading.py` — Reading dataclass |
| **Instructions** | 1. Implement CsvSink: opens a .csv file, writes header row, writes each reading as a row. 2. Implement JsonMetadataSink: writes a .json file with experiment metadata (name, start time, instrument, config). 3. Implement CompositeSink: holds a list of sinks, delegates write() to all. 4. Wire into mini-app: controller creates a CompositeSink and passes readings to it. 5. Extension: Implement Hdf5Sink using h5py. |
| **Expected output** | A CSV file with timestamped readings and a JSON file with experiment metadata, both generated during acquisition. |
| **Solution outline** | CsvSink: csv.writer, writerow([reading.timestamp, reading.value, reading.unit]). JsonMetadataSink: json.dump(metadata, f, indent=2) on open(); close() adds end_time. CompositeSink: for sink in self.sinks: sink.write(reading). |
| **Common mistakes** | Not flushing the CSV file (data lost on crash). Not closing files properly. Putting the sink logic in the controller. |
| **Instructor hints** | Provide the Reading dataclass. Suggest using a context manager pattern for sinks. |

## Lab 8: Writer Thread

| Field | Detail |
|---|---|
| **Title** | Queue-Based Writer Thread |
| **Objective** | Decouple data writing from acquisition using a queue and writer thread |
| **Duration** | 20 minutes |
| **Session** | Day 3, Session 3.2 |
| **Starter code** | Working mini-app from Lab 6 with DataSinks from Lab 7 |
| **Instructions** | 1. Add a queue.Queue between the acquisition worker and the data sinks. 2. Create a WriterThread that consumes the queue and writes to sinks. 3. Use a sentinel value (None) to signal shutdown. 4. Wire into mini-app: worker puts readings on queue, writer thread writes to sinks. 5. Verify: check CSV output while acquisition is running. |
| **Expected output** | Acquisition worker puts readings on queue. Writer thread writes to sinks from queue. CSV file grows during acquisition. No acquisition lag from disk I/O. |
| **Solution outline** | WriterThread: while True: item = queue.get(); if item is None: break; for sink in sinks: sink.write(item). Controller creates queue, passes to worker and writer. |
| **Common mistakes** | Not using a sentinel for shutdown (writer hangs). Blocking on queue.get() without timeout (can't shut down). |
| **Instructor hints** | Keep it simple. The queue pattern is the important thing, not thread subclassing. |

## Lab 9: Configuration and Metadata

| Field | Detail |
|---|---|
| **Title** | Config-Driven Behaviour and Metadata |
| **Objective** | Load application configuration from YAML and write experiment metadata |
| **Duration** | 20 minutes |
| **Session** | Day 3, Session 3.3 |
| **Starter code** | `configs/default_config.yaml` — sample configuration file |
| **Instructions** | 1. Add PyYAML to your project (pip install pyyaml). 2. Load configuration at startup: device type, acquisition interval, output formats. 3. Use config to select the adapter (simulated or real). 4. Write a metadata JSON file at the start of each acquisition session. 5. Include: config values, start timestamp, software version. |
| **Expected output** | Application reads config from YAML. Changing 'device.type' from 'simulated' to 'serial' changes the backend. Metadata file accompanies each data file. |
| **Solution outline** | Config loader: yaml.safe_load(open('config.yaml')). Factory: if config['device']['type'] == 'simulated': return SimulatedAdapter() else: return RealAdapter(**config['device']). Metadata written by JsonMetadataSink on open(). |
| **Common mistakes** | Hardcoding the config path. Not handling missing config keys gracefully. Overcomplicating the config structure. |
| **Instructor hints** | Provide the sample YAML. Keep the config structure simple — 3 sections max. |

## Lab 10: Real-Time Plot

| Field | Detail |
|---|---|
| **Title** | Live Data Plot with PyQtGraph |
| **Objective** | Add a real-time scrolling plot to the instrument application |
| **Duration** | 30 minutes |
| **Session** | Day 3, Session 3.5 |
| **Starter code** | `ui/plot_widget.py` — skeleton PlotWidget wrapping pg.PlotWidget. Working mini-app from previous labs |
| **Instructions** | 1. Add a pg.PlotWidget to the main window layout. 2. Create a ring buffer (numpy array) for plot data. 3. Add a QTimer that fires at 30 Hz to update the plot. 4. On each timer tick: read latest readings from model, update ring buffer, call curve.setData(). 5. Test with simulated adapter at different rates. 6. Extension: add a second trace for a second channel (e.g., voltage). |
| **Expected output** | A smoothly scrolling real-time plot showing temperature readings from the simulated instrument. Plot updates at ~30 FPS regardless of data rate. |
| **Solution outline** | Ring buffer: numpy.roll(buffer, -1); buffer[-1] = new_value. QTimer: timer = QTimer(); timer.timeout.connect(self.update_plot); timer.start(33). update_plot(): curve.setData(buffer). |
| **Common mistakes** | Updating the plot on every reading signal (too fast). Using a Python list instead of numpy array (slow). Forgetting to set axis labels. Appending to a growing list (memory leak). |
| **Instructor hints** | Provide the ring buffer implementation. Show the QTimer wiring. If PyQtGraph install fails, have a fallback with a text-based display. |

---

# 5. COURSE PROJECT

## Project Brief: LabMonitor — Instrument Control and Data Acquisition Application

### Overview

Delegates build **LabMonitor**, a desktop application for controlling a laboratory instrument, acquiring data, recording to file, and displaying results in real time. The application demonstrates every architectural pattern taught in the course.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PySide6 GUI (View)                    │
│   ┌──────────┐  ┌──────────┐  ┌───────────────────┐    │
│   │ Controls │  │  Status  │  │  PyQtGraph Plot   │    │
│   └──────────┘  └──────────┘  └───────────────────┘    │
└──────────────────────┬──────────────────────────────────┘
                       │ signals / slots
┌──────────────────────┴──────────────────────────────────┐
│                    Controller                            │
│   - Orchestrates model ↔ view                           │
│   - Creates adapter, strategy, sinks                    │
│   - Manages worker lifecycle                            │
└───────┬──────────────┬──────────────────────┬───────────┘
        │              │                      │
┌───────┴───────┐  ┌───┴──────────────┐  ┌────┴──────────┐
│ AcquisitionWorker│ │  Data Queue     │  │  Model        │
│ (QThread)       │→│  (thread-safe)  │→ │  (state)      │
│ uses Adapter    │ │                  │  │               │
│ uses Strategy   │ │                  │  │               │
└───────┬───────┘  └───┬──────────────┘  └───────────────┘
        │              │
┌───────┴───────┐  ┌───┴──────────────┐
│ Adapter       │  │ WriterThread     │
│ (Sim or Real) │  │ → CompositeSink  │
└───────────────┘  │   → CsvSink      │
                   │   → JsonMetadata  │
                   └──────────────────┘
```

### Phases by Day

**Day 1 — Foundation**
- Refactor the messy script (Lab 1)
- Build InstrumentAdapter with simulated backend (Lab 3)
- Implement measurement strategies (Lab 4)
- End of Day 1: command-line application that reads from a simulator using swappable strategies

**Day 2 — Application**
- Build PySide6 GUI with MVC structure (Lab 6)
- Add acquisition worker on QThread (Lab 5 → Lab 6)
- Wire signals for live updates
- Add error handling and status indicators
- End of Day 2: working desktop application with simulated instrument

**Day 3 — Data and Performance**
- Add DataSink abstraction with CSV and JSON metadata (Lab 7)
- Add writer thread with queue (Lab 8)
- Add configuration file (Lab 9)
- Add real-time plot with PyQtGraph (Lab 10)
- End of Day 3: complete LabMonitor application

### Acceptance Criteria

By end of Day 3, a successful LabMonitor application should:

| # | Criterion | Verified by |
|---|---|---|
| 1 | Connects to simulated instrument | Click Connect, see status change |
| 2 | Starts/stops acquisition | Click Start/Stop, readings appear/stop |
| 3 | Displays current reading in GUI | QLabel updates with values |
| 4 | Plots readings in real time | PyQtGraph shows scrolling trace |
| 5 | Writes readings to CSV file | Open CSV file, verify data |
| 6 | Writes metadata to JSON file | Open JSON file, verify fields |
| 7 | GUI does not freeze during acquisition | Window remains responsive |
| 8 | Handles simulated errors gracefully | Trigger error mode, see status update |
| 9 | Config file changes backend | Edit YAML, restart, see different adapter |
| 10 | Clean shutdown | Close window, no hung threads |

### Extension Ideas for Faster Learners

| Extension | Pattern Reinforced |
|---|---|
| Add AveragingStrategy | Strategy |
| Add a second simulated instrument (e.g., pressure sensor) | Adapter |
| Add SQLite DataSink | DataSink |
| Add HDF5 DataSink | DataSink |
| Add sample-rate dropdown to GUI | MVC, config |
| Add "performance mode" toggle | Strategy, throttling |
| Add alarm thresholds | Model, Observer |
| Add a dark theme | View-only change |
| Add a logging panel in the GUI | Logging, View |

---

# 6. PYTHON TASKS / CODE ARTEFACTS

| # | Artefact | Purpose | Complexity | Introduced | Delegate Role |
|---|---|---|---|---|---|
| 1 | `examples/messy_script.py` | Starting point for Lab 1 — monolithic script | Medium (200 lines) | Day 1, Session 1.2 | Receive, refactor |
| 2 | `examples/messy_driver.py` | Starting point for Lab 2 — tangled driver | Medium (150 lines) | Day 1, Session 1.3 | Receive, refactor |
| 3 | `core/adapter_interface.py` | InstrumentAdapter ABC | Simple (30 lines) | Day 1, Session 1.4 | Receive |
| 4 | `core/reading.py` | Reading dataclass | Simple (15 lines) | Day 1, Session 1.4 | Receive |
| 5 | `drivers/simulated.py` | SimulatedInstrumentAdapter | Medium (60 lines) | Day 1, Session 1.4 | Build (with skeleton) |
| 6 | `drivers/serial_adapter.py` | RealInstrumentAdapter (pyserial) | Medium (80 lines) | Day 1, Session 1.4 | Receive or build (extension) |
| 7 | `core/strategy_interface.py` | MeasurementStrategy ABC | Simple (20 lines) | Day 1, Session 1.5 | Receive |
| 8 | `core/strategies.py` | SingleRead, Continuous, Averaging strategies | Medium (60 lines) | Day 1, Session 1.5 | Build |
| 9 | `ui/main_window.py` | PySide6 main window | Medium (100 lines) | Day 2, Session 2.2 | Build (with guidance) |
| 10 | `core/app_model.py` | Application model (state) | Simple (40 lines) | Day 2, Session 2.2 | Build |
| 11 | `core/controller.py` | Application controller | Medium (120 lines) | Day 2, Session 2.2 | Build (with guidance) |
| 12 | `ui/worker.py` | AcquisitionWorker (QObject on QThread) | Medium (60 lines) | Day 2, Session 2.4 | Build (with skeleton) |
| 13 | `core/data_sink.py` | DataSink ABC | Simple (20 lines) | Day 3, Session 3.1 | Receive |
| 14 | `core/csv_sink.py` | CsvSink implementation | Simple (40 lines) | Day 3, Session 3.1 | Build |
| 15 | `core/json_metadata_sink.py` | JsonMetadataSink implementation | Simple (35 lines) | Day 3, Session 3.1 | Build |
| 16 | `core/composite_sink.py` | CompositeSink (fan-out) | Simple (25 lines) | Day 3, Session 3.1 | Build |
| 17 | `core/hdf5_sink.py` | Hdf5Sink (optional) | Medium (50 lines) | Day 3, Session 3.1 | Extension |
| 18 | `core/writer_thread.py` | Writer thread with queue | Medium (45 lines) | Day 3, Session 3.2 | Build |
| 19 | `configs/default_config.yaml` | Sample configuration file | Simple (20 lines) | Day 3, Session 3.3 | Receive, modify |
| 20 | `core/config_loader.py` | YAML config loader | Simple (25 lines) | Day 3, Session 3.3 | Build |
| 21 | `ui/plot_widget.py` | PyQtGraph real-time plot widget | Medium (70 lines) | Day 3, Session 3.5 | Build (with skeleton) |
| 22 | `smoke_test.py` | Pre-course setup verification | Simple (40 lines) | Pre-course | Receive, run |
| 23 | `examples/logging_example.py` | Logging configuration example | Simple (30 lines) | Optional module | Receive |
| 24 | `core/factory.py` | Adapter/sink factory from config | Simple (30 lines) | Day 3, Session 3.3 | Build |

---

# 7. RECOMMENDED PROJECT STRUCTURE

```
labmonitor/
├── main.py                    # Application entry point
├── smoke_test.py              # Pre-course setup verification
├── requirements.txt           # pip dependencies
├── configs/
│   ├── default_config.yaml    # Default configuration
│   └── hardware_config.yaml   # Config for real hardware (instructor)
├── core/
│   ├── __init__.py
│   ├── adapter_interface.py   # InstrumentAdapter ABC
│   ├── reading.py             # Reading dataclass
│   ├── strategy_interface.py  # MeasurementStrategy ABC
│   ├── strategies.py          # Concrete strategies
│   ├── app_model.py           # Application model (state)
│   ├── controller.py          # Application controller
│   ├── data_sink.py           # DataSink ABC
│   ├── csv_sink.py            # CSV file writer
│   ├── json_metadata_sink.py  # JSON metadata writer
│   ├── composite_sink.py      # Fan-out to multiple sinks
│   ├── hdf5_sink.py           # Optional HDF5 writer
│   ├── writer_thread.py       # Queue-consuming writer thread
│   ├── config_loader.py       # YAML config loader
│   └── factory.py             # Creates adapters/sinks from config
├── drivers/
│   ├── __init__.py
│   ├── simulated.py           # SimulatedInstrumentAdapter
│   └── serial_adapter.py      # RealInstrumentAdapter (pyserial)
├── ui/
│   ├── __init__.py
│   ├── main_window.py         # PySide6 main window
│   ├── worker.py              # AcquisitionWorker (QThread)
│   └── plot_widget.py         # PyQtGraph real-time plot
├── examples/
│   ├── messy_script.py        # Lab 1 starter (messy monolith)
│   ├── messy_driver.py        # Lab 2 starter (messy driver)
│   └── logging_example.py     # Logging configuration example
├── tests/
│   ├── __init__.py
│   ├── test_adapter.py        # Adapter smoke test
│   ├── test_strategies.py     # Strategy smoke test
│   └── test_sinks.py          # Sink smoke test
└── data/                      # Output directory for recorded data
    └── .gitkeep
```

### Why This Structure Works

| Aspect | How the structure supports it |
|---|---|
| **Separation of concerns** | `core/`, `drivers/`, `ui/` are independent layers. `core/` has no Qt imports. `drivers/` has no GUI imports. `ui/` doesn't import pyserial. |
| **Testability** | `core/` classes can be tested without hardware or GUI. `drivers/simulated.py` is a test double by design. |
| **Swappability** | Adapters live in `drivers/`, sinks live in `core/`. Adding a new one means adding a file, not editing existing files. |
| **Configuration** | `configs/` is separate from code. Changing behaviour means editing YAML, not Python. |
| **Classroom use** | `examples/` holds starter files for labs. Delegates copy and refactor into the main structure. |
| **Simplicity** | No deep nesting. No framework magic. Every file is small and focused. |

---

# 8. GOOD PRACTICE / ENGINEERING DISCIPLINE

This section covers pragmatic good practice that pays off in instrument-control projects. These are not rules for their own sake — they are habits that prevent real problems in real labs.

## Interfaces / Abstract Base Classes

Use ABCs sparingly but at key boundaries:
- `InstrumentAdapter` — the contract between your application and any hardware
- `DataSink` — the contract between your application and any storage format
- `MeasurementStrategy` — the contract between your application and any measurement mode

Why: ABCs make swappability explicit. When you define `InstrumentAdapter`, you're saying "any class that implements these methods can be used as an instrument." This is the foundation of simulator-first development.

Don't: create ABCs for everything. If there's only ever going to be one implementation, you don't need an interface. ABCs are for variation points.

## Type Hints at Key Boundaries

Add type hints to:
- ABC method signatures
- Factory function parameters and return types
- Signal payloads (document what type the signal carries)
- Configuration loaders (what shape the config dict has)

Don't: type-hint every local variable. Don't spend 30 minutes getting mypy to pass on a 20-line function. Type hints are documentation for humans, not bureaucracy.

```python
# Good: type hints at the boundary
def create_adapter(config: dict) -> InstrumentAdapter:
    ...

# Good: type hints on ABC methods
@abstractmethod
def read_value(self) -> Reading:
    ...

# Not necessary: obvious local variable
temperature = 23.5  # type: float  ← don't bother
```

## Config Files Instead of Hardcoded Values

Anything that might change between deployments should be in a config file:
- Device type (simulated vs real)
- Serial port and baud rate
- Acquisition interval
- Output directory and formats
- Plot update rate

Use YAML for human-editable config. Load once at startup. Pass values through constructors, not globals.

```yaml
device:
  type: simulated
  port: COM3
  baud_rate: 9600
acquisition:
  interval_ms: 100
  strategy: continuous
```

## Logging

Use Python's built-in `logging` module, not `print()`.

```python
import logging
logger = logging.getLogger(__name__)

logger.info("Connected to %s", port)
logger.warning("Timeout on read, retrying")
logger.error("Failed to connect: %s", e)
```

Configure logging once in `main.py`:
```python
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(name)s %(levelname)s %(message)s'
)
```

Why: logging has levels (DEBUG, INFO, WARNING, ERROR), can be directed to files, and can be filtered per-module. `print()` has none of this.

## Small Pure Functions for Parsing

Serial protocol parsing should be in pure functions — no state, no side effects, easy to test:

```python
def parse_temperature(raw: str) -> float:
    """Parse 'TEMP:23.5\\r\\n' to 23.5"""
    return float(raw.strip().split(':')[1])
```

Keep these in a separate module (`core/parsers.py` or inside the adapter). Test them with simple assertions. They're the easiest code to test and the most likely to have subtle bugs.

## Safe Shutdown

Every thread must be stoppable. Every file must be closable. Every connection must be disconnectable.

Checklist for clean shutdown:
1. Set worker `_running = False`
2. Wait for worker thread to finish (with timeout)
3. Put sentinel on data queue
4. Wait for writer thread to finish (with timeout)
5. Close all data sinks
6. Disconnect adapter
7. Log shutdown complete

Implement this in the controller's `shutdown()` method and call it from `QMainWindow.closeEvent()`.

## Avoiding GUI-Thread Misuse

Rules:
- Never call `serial.read()` on the main thread
- Never call `file.write()` on the main thread (for data files — log files are fine)
- Never update widgets from a worker thread
- Use signals to cross thread boundaries
- Use `QTimer` for periodic GUI updates, not tight loops

If the GUI freezes, the main thread is blocked. Full stop.

## Simple Smoke Tests

You don't need pytest, coverage, or a CI pipeline on Day 1. You do need:

```python
# tests/test_adapter.py
from drivers.simulated import SimulatedInstrumentAdapter

adapter = SimulatedInstrumentAdapter()
adapter.connect()
reading = adapter.read_value()
assert reading.value is not None
assert reading.unit == "degC"
adapter.disconnect()
print("Adapter smoke test passed")
```

Run it manually. If it passes, the adapter works. That's enough to start.

## Team Habits That Pay Off

Even for a team of two:
- Use meaningful commit messages: "Add CSV sink with timestamp column" not "stuff"
- Keep a `KNOWN_ISSUES.md` file: one line per issue, date, and status
- Do 5-minute code reviews: "Does this class have one job? Can I test it without hardware?"
- Name things clearly: `temperature_celsius`, not `t` or `val`

---

# 9. SIMULATOR DESIGN

## Purpose

The simulator replaces physical hardware for all delegate labs. It must be:
- Easy to set up (no drivers, no cables, no USB)
- Deterministic enough to teach with
- Noisy enough to be realistic
- Controllable enough to simulate error conditions

## Simulator Contract

The `SimulatedInstrumentAdapter` implements the same `InstrumentAdapter` interface as the real adapter. From the application's perspective, they are identical.

### Commands Accepted

| Command | Response | Notes |
|---|---|---|
| `CONNECT` | `OK` | Sets internal state to connected |
| `READ:TEMP` | `TEMP:23.45` | Temperature in degrees C, sine wave + noise |
| `READ:VOLT` | `VOLT:3.301` | Voltage in volts, sawtooth + noise |
| `READ:ALL` | `TEMP:23.45,VOLT:3.301` | Both channels |
| `SET:INTERVAL:100` | `OK` | Set simulated sampling interval (ms) |
| `SET:MODE:SINGLE` | `OK` | Single-read mode |
| `SET:MODE:CONTINUOUS` | `OK` | Continuous mode |
| `SET:MODE:AVERAGING:10` | `OK` | Averaging mode, N samples |
| `STATUS` | `STATUS:OK` or `STATUS:ERROR:msg` | Current instrument status |
| `DISCONNECT` | `OK` | Sets internal state to disconnected |
| `*IDN?` | `SimInstrument,v1.0,SN0001` | Identification string |

### Data Generation

**Temperature channel:**
```
base = 22.0
amplitude = 3.0
frequency = 0.1  # Hz
noise_stddev = 0.15
value = base + amplitude * sin(2 * pi * frequency * t) + gauss(0, noise_stddev)
```

**Voltage channel:**
```
base = 3.3
amplitude = 0.2
frequency = 0.05
noise_stddev = 0.02
value = base + amplitude * sawtooth(2 * pi * frequency * t) + gauss(0, noise_stddev)
```

This produces realistic-looking data with visible trends and noise. The sine wave makes it obvious in plots whether the system is working.

### Error Modes

The simulator supports configurable error modes for teaching error handling:

| Error Mode | Trigger | Behaviour | Teaching Purpose |
|---|---|---|---|
| **Timeout** | `simulator.set_error_mode('timeout')` | `read_value()` sleeps for 5 seconds, then raises `TimeoutError` | Teach timeout handling, retries |
| **Garbage** | `simulator.set_error_mode('garbage')` | Returns malformed string: `"TEMP:X#@!"` | Teach parsing resilience |
| **Intermittent** | `simulator.set_error_mode('intermittent', probability=0.1)` | 10% of reads raise `ConnectionError` | Teach retry with backoff |
| **Drift** | `simulator.set_error_mode('drift', rate=0.5)` | Values gradually increase beyond normal range | Teach alarm thresholds |
| **Disconnect** | `simulator.set_error_mode('disconnect', after=20)` | After 20 reads, raises `ConnectionError` on every subsequent read | Teach reconnection logic |
| **None** | `simulator.set_error_mode(None)` | Normal behaviour | Reset to clean state |

### Why Simulator-First Is Better Than 40 Arduinos

| Factor | 40 Arduinos | 1 Simulator |
|---|---|---|
| Setup time | 2+ hours (USB, drivers, wiring) | 0 minutes (pip install) |
| Failure modes | "My cable is broken" — 30 min lost | Deterministic, controllable |
| Debugging | "Is it my code or my wiring?" | Always your code |
| Error simulation | Unplug the cable? Hope for the best? | Configurable, repeatable |
| Cost | £2,000+ for hardware | £0 |
| Shipping | Fragile, heavy | None |
| Consistency | 40 slightly different rigs | Identical everywhere |
| Architectural lesson | "It works with this Arduino" | "It works with anything that implements the interface" |

The simulator teaches abstraction by being the abstraction. If delegates can swap between simulated and real backends by changing one config value, they have learned the most important lesson in the course.

---

# 10. INSTRUCTOR NOTES

## Likely Learner Pain Points

| Pain Point | When | Mitigation |
|---|---|---|
| **"Why do I need classes?"** | Day 1 morning | Show the script that breaks. Make the pain real before offering the cure. |
| **ABC syntax** | Day 1, Lab 3 | Provide the ABC. Don't make delegates write it from scratch. Focus on implementing, not defining. |
| **PySide6 installation** | Day 2 morning | Have a fallback plan (see below). Pre-test all machines. |
| **QThread/Worker confusion** | Day 2 afternoon | Show the freeze demo first. Then show the pattern. Don't explain all of Qt's threading — just the one pattern they need. |
| **Signal/slot wiring** | Day 2 afternoon | Draw the signal flow on the whiteboard. Colour-code: blue = main thread, green = worker thread, red = signal crossing. |
| **"When do I use which pattern?"** | Throughout | Keep a running list on the whiteboard: Adapter = new device, Strategy = new mode, DataSink = new format. |
| **Thread cleanup** | Day 2–3 | Provide the cleanup code. Race conditions in shutdown are not a productive learning exercise. |
| **PyQtGraph axes and styling** | Day 3 afternoon | Provide the boilerplate. Focus on data flow, not plot aesthetics. |

## Where to Slow Down

- **Day 1, Session 1.2:** Give extra time for the OOP-from-scratch section. This is the foundation. If delegates don't understand objects, everything else is shaky.
- **Day 2, Session 2.4:** The worker thread pattern is the hardest concept. Demo it twice. Draw it on the whiteboard. Walk through the code line by line.
- **Day 2, Lab 6:** The mini-app build. Walk the room constantly. Some delegates will be 20 minutes behind. Pair them up.

## Where to Speed Up

- **SOLID principles (Day 2, Session 2.1):** One slide, five bullets, move on. Don't lecture SOLID as theory.
- **Qt Designer (Day 2, Session 2.2):** Brief mention, don't teach it. Hand-coded UI is better for this course.
- **HDF5 (Day 3, Session 3.1):** Brief demo, mark as optional extension. Most delegates won't need it in the classroom.
- **Binary protocols (Day 3, Session 3.4):** Mention, don't implement. ASCII is fine for teaching.

## Where to Demo Instead of Lecture

- **The frozen GUI** (Day 2, Slide 48): Must be a live demo. Let the GUI freeze. Let delegates see it.
- **Simulator swap** (Day 1, Slide 28 / Day 2, Slide 59): Show the same application running with both adapters.
- **Error modes** (Day 2, Slide 47): Toggle error modes in the simulator live. Show the error propagation.
- **Plot update rates** (Day 3, Slide 81): Show the difference between 1000 Hz and 30 Hz updates live.
- **Messy script tour** (Day 1, Slide 4): Walk through the messy script on screen. Ask delegates to spot problems.

## Fallback Plans

### If Hardware Is Unavailable
- No impact on delegates — all labs use the simulator
- Instructor demos of "real hardware" can use a second simulator configured to behave slightly differently (different noise, different data rate)
- Mention to delegates: "In a real deployment, you'd change one config value and plug in the instrument"

### If PySide6 Setup Fails
- **Primary fallback:** Use the text-based UI approach for Day 2 labs (command-line interface with the same controller/model architecture)
- **Secondary fallback:** Use Tkinter (built into Python, no install needed) for a minimal GUI. The MVC concepts transfer.
- **Worst case:** Focus on the architecture and patterns. Show the PySide6 GUI as instructor demo. Delegates build the model, controller, worker, and sinks without the view.

### If PyQtGraph Setup Fails
- Use `matplotlib` with `FuncAnimation` for a basic live plot. It will be slower, but functional.
- Or skip the live plot and display readings as text. The data pipeline (queue, writer thread, sinks) is more important architecturally.

## Advice for Mixed-Ability Groups

- **Fast learners:** Give them extension tasks (listed in each lab). Let them help slower neighbours. Challenge them with harder error modes.
- **Slow learners:** Pair them with someone slightly faster. Provide more complete starter code. Focus on understanding the pattern, not writing every line.
- **Experienced OOP developers:** Let them skip Lab 1 (or give them a harder version). Point them to the pattern labs immediately.
- **Non-programmers in the room:** Rare given prerequisites, but if present: pair them with a partner. Give them the working solution at each stage and ask them to modify one small thing. Focus on understanding, not typing speed.

---

# 11. PRE-COURSE SETUP REQUIREMENTS

## Technical Checklist for Training Centre

### Mandatory

| Item | Detail | Verification |
|---|---|---|
| Python 3.10+ | Installed and on PATH | `python --version` or `python3 --version` |
| pip | Installed and working | `pip --version` |
| VS Code or PyCharm | Installed with Python extension/plugin | Open IDE, create a .py file, run it |
| PySide6 | `pip install PySide6` | `python -c "from PySide6.QtWidgets import QApplication; print('OK')"` |
| pyqtgraph | `pip install pyqtgraph` | `python -c "import pyqtgraph; print('OK')"` |
| pyserial | `pip install pyserial` | `python -c "import serial; print('OK')"` |
| pint | `pip install pint` | `python -c "import pint; print('OK')"` |
| PyYAML | `pip install pyyaml` | `python -c "import yaml; print('OK')"` |
| numpy | `pip install numpy` | `python -c "import numpy; print('OK')"` |
| Course materials | Unzipped to a known directory | Folder structure matches specification |

### Optional

| Item | Detail | Verification |
|---|---|---|
| Git | Installed and on PATH | `git --version` |
| h5py | `pip install h5py` | `python -c "import h5py; print('OK')"` |
| Real Arduino rig | One per classroom, instructor desk only | `python -c "import serial; print(serial.tools.list_ports.comports())"` |

### Combined pip Install

```bash
pip install PySide6 pyqtgraph pyserial pint pyyaml numpy
# Optional:
pip install h5py
```

### Smoke Test Script

The `smoke_test.py` script (provided in course materials) verifies the entire setup in one run. Delegates should run it before the course starts. See the separate `smoke_test.py` file for details.

### Offline Fallback

If internet is unavailable during the course:
1. Pre-download all wheels using `pip download -d ./wheels PySide6 pyqtgraph pyserial pint pyyaml numpy`
2. Distribute the `wheels/` folder on USB
3. Delegates install with `pip install --no-index --find-links=./wheels PySide6 pyqtgraph pyserial pint pyyaml numpy`

---

# 12. ASSESSMENT / COMPLETION

## Assessment Philosophy

This is a commercial training course, not a university exam. Assessment should:
- Confirm delegates have understood and applied the key concepts
- Give the instructor early warning if someone is falling behind
- Provide a sense of accomplishment at the end
- Not create anxiety or competition

## End-of-Day Checkpoints

### Day 1 Checkpoint

Delegates should be able to answer:
1. "What is the difference between a function and a class, and when would you use each?"
2. "What does the Adapter pattern do, and why is it useful for instrument code?"
3. "What happens if you want to add a new measurement mode — what pattern do you use?"

Practical check: Delegates have a working `SimulatedInstrumentAdapter` that produces readings.

### Day 2 Checkpoint

Delegates should be able to answer:
1. "Why does the GUI freeze if you call serial.read() in the button handler?"
2. "What is the worker thread's job, and how does it communicate with the GUI?"
3. "If the adapter raises an exception, where should it be caught and how does the GUI find out?"

Practical check: Delegates have a working PySide6 application with start/stop and live reading display.

### Day 3 Checkpoint

Delegates should be able to answer:
1. "How do you add a new data format without editing existing code?"
2. "Why is a queue between the acquisition worker and the writer thread important?"
3. "What is the most common cause of a sluggish GUI in a data acquisition application?"

Practical check: Delegates have a working application with data logging and real-time plot.

## Successful Completion

A delegate has successfully completed the course if they:

1. **Have a working LabMonitor application** that meets at least 7 of the 10 acceptance criteria from Section 5
2. **Can explain the architecture** — specifically, why the controller does not depend on the adapter implementation
3. **Can describe how to add** a new instrument, a new data format, or a new measurement mode without editing existing classes

## Lightweight Assessment Methods

| Method | When | Purpose |
|---|---|---|
| **Walk-the-room check** | During every lab | Catch delegates who are stuck |
| **"Explain it to your neighbour"** | End of each session | Delegates explain the concept in their own words |
| **Show-of-hands** | Before moving on | "Who has their adapter returning readings?" Quick pulse check |
| **Debrief discussion** | After each lab | Collective review of approaches and common mistakes |
| **Acceptance criteria self-check** | End of Day 3 | Delegates verify their own app against the checklist |

## Suggested Recap Questions

Use these for quick verbal checks or end-of-day wrap-ups:

**Conceptual:**
- What are the three layers in our architecture?
- What does "the controller does not care" mean?
- Why is composition usually better than inheritance for instrument code?
- What's the difference between an Adapter and a Strategy?

**Practical:**
- How do you swap from simulated to real hardware?
- Where do you catch serial exceptions?
- What thread is the acquisition worker on? What thread is the GUI on?
- What happens if the writer thread is slower than the acquisition rate?

---

# 13. OPTIONAL EXTENSIONS

These are self-contained 20–45 minute inserts that can be added if time permits, if a delegate finishes early, or if the instructor wants to adjust for audience needs.

## Extension 1: Minimal, High-Value Testing (30 min)

**Insert after:** Day 2, Lab 6 or Day 3, Lab 7

**Content:**
- Why test at all? Because "it works on my machine" dies when someone else runs it
- Smoke tests: can the adapter connect and read? Can the sink write?
- Property tests for parsers: does `parse_temperature("TEMP:23.5\r\n")` return 23.5?
- No framework needed — plain `assert` statements and a script

**Lab:** Write 5 smoke tests for the adapter and sinks using plain assert statements. Run them as a script.

**What you skip:** pytest, fixtures, mocking, coverage, CI. Those are real and valuable, but not for Day 1.

## Extension 2: Logging Panel (30 min)

**Insert after:** Day 3, Lab 10

**Content:**
- Add a QTextEdit to the GUI for log output
- Create a custom logging handler that emits to a Qt signal
- Connect the signal to the QTextEdit
- Filter by log level with a dropdown

**Lab:** Add a logging panel to the LabMonitor application. Show INFO and WARNING messages in the panel. Add a dropdown to filter by level.

## Extension 3: Config Validation (20 min)

**Insert after:** Day 3, Lab 9

**Content:**
- What happens when the config file is missing a key?
- What happens when the value is the wrong type?
- Simple validation: check required keys exist, check types, provide defaults
- Don't use a schema library — just a `validate_config()` function with clear error messages

**Lab:** Add a `validate_config()` function that checks for required keys and valid values. Raise a clear error message if the config is invalid.

## Extension 4: Safe Mode / Operational Safety (30 min)

**Insert after:** Day 2, Session 2.3

**Content:**
- "Don't fry the rig" — defensive programming for real hardware
- Rate limiting commands to the instrument
- Sanity checking values before acting (e.g., don't set voltage to 10,000V)
- Command confirmation for dangerous operations
- Watchdog: if the application crashes, what state is the instrument left in?
- Safe shutdown sequence: always return instrument to safe state before disconnecting

**Discussion:** "What is the worst thing that could happen if your software sends the wrong command to your instrument?"

## Extension 5: Known Issues File (20 min)

**Insert after:** Any lab from Day 2 onwards

**Content:**
- `KNOWN_ISSUES.md`: one file, one line per issue
- Format: `[date] [status] [description]`
- Example: `2024-03-15 OPEN CSV sink doesn't flush on every write — data lost if app crashes`
- Why: the cheapest form of bug tracking. No tool needed. Lives in the repo.
- Update it when you find a bug you're not going to fix right now

**Exercise:** Review your LabMonitor application. Add at least 3 entries to `KNOWN_ISSUES.md` for things you know are imperfect.

## Extension 6: Micro Code Review Habits (25 min)

**Insert after:** Any lab from Day 2 onwards

**Content:**
- 5-minute code review checklist:
  1. Does each class have one job?
  2. Can I test this without hardware?
  3. Are there any hardcoded values that should be in config?
  4. Is there any GUI code in the model or driver?
  5. Are all threads stoppable?
- Pair review exercise: swap with a neighbour, review their code for 5 minutes, give one positive and one constructive comment

**Exercise:** Pair up. Review each other's LabMonitor controller. Give one "good" and one "could improve" comment.

---

# APPENDIX A: SCHEDULE SUMMARY

| Day | Morning | Afternoon |
|---|---|---|
| **Day 1** | OOP from scratch, messy script refactor | Messy driver, Adapter pattern, Strategy pattern |
| **Day 2** | SOLID violations, MVC, error handling | QThread worker, Mini-app build |
| **Day 3** | DataSinks, writer thread, config, metadata | Performance, PyQtGraph, capstone integration |

# APPENDIX B: PATTERN QUICK REFERENCE

| Pattern | Problem It Solves | Course Example |
|---|---|---|
| **Adapter** | "My code is married to my hardware" | InstrumentAdapter → SimulatedAdapter / RealAdapter |
| **Strategy** | "Adding a new mode means editing core logic" | MeasurementStrategy → SingleRead / Continuous / Averaging |
| **DataSink** | "Adding a new format means editing core logic" | DataSink → CsvSink / JsonMetadataSink / Hdf5Sink |
| **Composite** | "I need to write to multiple sinks" | CompositeSink wraps multiple DataSinks |
| **Factory** | "I need to create the right adapter/sink from config" | create_adapter(config) |
| **Observer** | "The view needs to know when the model changes" | Qt signals/slots between worker and GUI |
| **MVC** | "Everything is coupled to everything" | Model / View / Controller separation |

# APPENDIX C: KEY PHRASES TO REPEAT

These phrases should be repeated throughout the course. They are the architectural mantras that delegates should internalise:

1. **"The controller does not care."** — The controller does not care whether the backend is real or simulated, whether data goes to CSV or HDF5, or what the GUI looks like.

2. **"Add a new [thing] by adding a class, not by editing existing code."** — Open/Closed principle in practice.

3. **"If you can't test it without hardware, your architecture has a problem."** — The simulator exists because the architecture allows it.

4. **"Signals are your only safe bridge between threads."** — Don't update widgets from workers. Don't read serial from the GUI.

5. **"The architecture makes the swap possible. The config file makes it easy."** — Adapter + config = runtime flexibility.

---

*End of course design document.*

