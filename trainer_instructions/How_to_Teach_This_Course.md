# How to Teach This Course

## Trainer Preparation Guide — From Scripts to Systems

This document tells you what to revise, practise, and prepare before and during the course. Read the Trainer Guide (Trainer_Guide.docx) for timings and session-by-session delivery notes. This document covers what YOU need to know, not what the students need to learn.

---

## Before the Course

### Week Before

1. **Run the smoke test**: `python smoke_test.py` on the classroom machines (or your own). Fix any install issues before delegates arrive.
2. **Run the LabMonitor app**: `cd course_materials/labmonitor && python main.py`. Connect, Start, watch readings, Stop, Disconnect. Verify the plot works.
3. **Read the simulator guide**: `course_materials/docs/simulator_guide.md`. Know the commands, channels, and all 5 error modes by heart.
4. **Walk through every lab solution** in `trainer_instructions/solutions/`. You should be able to explain every line.
5. **Run each solution** to verify it works on the classroom image.
6. **Open the trainer slides** and read the speaker notes. They contain what to say, what to ask, what to demo, and timing guidance.

### Night Before Day 1

**Revise:**
- OOP: functions vs classes, state vs stateless, single responsibility, composition vs inheritance
- What a "seam" is and how to find one
- The Adapter pattern: ABC, concrete implementations, factory function
- The Strategy pattern: ABC, swappable behaviour

**Practise:**
- Open `examples/messy_script.py`. Identify 3 responsibilities in under 2 minutes. You'll do this live.
- Open `examples/messy_driver.py`. Mark the 4 seams. You'll walk through this on screen.
- Run the simulator, toggle error modes, recover. Do this until it's muscle memory.

**Prepare:**
- Have `examples/messy_script.py` open in your IDE, ready to show
- Have `examples/messy_driver.py` open in a second tab
- Have a terminal ready to run quick Python snippets (REPL or script)

---

### Night Before Day 2

**Revise:**
- SOLID principles mapped to instrument code (SRP, OCP, DIP especially)
- MVC: what belongs in Model, View, Controller. Key rule: "Model knows nothing about Qt"
- PySide6 basics: QApplication, QMainWindow, QVBoxLayout, QLabel, QPushButton, signal/slot
- QThread + Worker pattern: moveToThread, signals across threads, clean shutdown
- Error handling: timeout with default, retry with backoff, error propagation

**Practise:**
- Live-code the PySide6 minimal window from memory (Day 2 slide 14). You MUST be able to type this without looking at notes. It's the only live-coding section.
- Run `solutions/lab05_solution/worker_demo.py`. Start, stop, start again. Set error mode mid-run. Recover. You'll demo this.
- Trace the LabMonitor controller: button click → controller method → worker signal → view update. Know this flow cold.

**Prepare:**
- Have an empty Python file ready for the live-coding demo
- Have `solutions/lab05_solution/worker_demo.py` ready to run as a backup
- Have `labmonitor/main.py` ready to run for the mini-app lab

---

### Night Before Day 3

**Revise:**
- DataSink interface: open, write, close. CsvSink, JsonMetadataSink, CompositeSink.
- Writer thread: queue.Queue, sentinel pattern (None), producer-consumer
- Pint: basic unit attachment and conversion
- YAML config loading: how the factory uses config to create adapters and sinks
- Performance: the 6 common problems, GUI throttling with QTimer at 30 Hz
- PyQtGraph: LivePlotWidget, ring buffer, setData(), display-rate vs data-rate

**Practise:**
- Run `solutions/lab07_solution/sink_demo.py`. Check the CSV and JSON output files.
- Run `solutions/lab10_solution/plot_demo.py`. Verify smooth dual-channel scrolling.
- Change `default_config.yaml` device.type from "simulated" to "serial". Run the app. See the error. Change it back. You'll demo this.

**Prepare:**
- Have a `data/` folder visible so students can see CSV and JSON output files after Lab 7
- Have the LabMonitor app ready for the capstone demo

---

## During the Course — Key Moments

### Things to Demo (Not Lecture)

| When | What to Demo | Why |
|------|-------------|-----|
| Day 1, 10:00 | Scroll through messy_script.py | Students see the mess before you name the problems |
| Day 1, 13:00 | Scroll through messy_driver.py | Same — show before explaining |
| Day 1, 14:30 | Same script, two adapters | The "aha" moment for Adapter |
| Day 2, 11:00 | Live-code PySide6 minimal window | Only live-coding section. Type it. |
| Day 2, 12:45 | GUI that freezes (time.sleep in handler) | Visceral — they FEEL the problem |
| Day 3, 11:35 | Change YAML, re-run, different behaviour | Config-driven architecture |
| Day 3, 13:30 | LabMonitor with live plot running | The payoff moment |

### Questions to Ask (Not Tell)

| When | Question | Expected Answer |
|------|----------|-----------------|
| Day 1, 10:00 | "Has this happened to you?" | Stories of scripts breaking |
| Day 1, 10:45 | "Would you pass port, baud_rate, and handle to every function?" | No — that's why we use classes |
| Day 1, 14:30 | "What changes if I swap the instrument?" | Nothing — only the adapter |
| Day 2, 09:45 | "Which pattern fixes the DIP violation?" | Adapter |
| Day 2, 12:45 | "What happens if you call serial.read() on the main thread?" | GUI freezes |
| Day 3, 09:45 | "Where have we seen this pattern before?" | Adapter — same idea for output |
| Day 3, 13:05 | "Have we already solved this one?" | Three of six — architecture IS performance |
| Every day | "The controller does not care about ___?" | Hardware / GUI / data formats |

### Where to Slow Down

- **Day 1, State and Responsibility** (slide 14): This is the most important OOP concept. "If you need AND to describe what it does, it's two classes."
- **Day 2, QThread + Worker**: Students find threading scary. Walk through every signal connection. Demo the freeze first.
- **Day 2, Lab 5**: Hardest lab. Walk the room. Pair students. Allow 40 minutes if needed.
- **Day 3, Writer Thread**: The sentinel pattern (None on queue) confuses some students. Draw the producer-consumer diagram.

### Where to Speed Up

- **Day 1, Composition vs Inheritance**: One slide, quick rule, move on. Don't go deep.
- **Day 2, SOLID letters L and I**: Brief definitions, instrument examples, move on.
- **Day 3, Labs 8 and 9**: Short labs (20 min each). Students are comfortable with the pattern by now.
- **Day 3, Pint**: Quick REPL demo. Don't belabour it.

---

## Exercises — What to Watch For

| Lab | Common Mistake | How to Help |
|-----|---------------|-------------|
| Lab 1 | Classes with no `__init__` (just namespaces) | "What state does this class hold?" |
| Lab 1 | One giant God class | "Describe it in one sentence. Did you use AND?" |
| Lab 2 | Only extracting one piece | "I need transport AND parsing separated" |
| Lab 3 | Importing SimulatedInstrumentAdapter directly | "Use the interface, not the concrete class" |
| Lab 5 | Signal not connected | "Check: thread.started → worker.start_acquisition" |
| Lab 5 | Forgot closeEvent | "Close the window. Does it hang? That's why." |
| Lab 5 | Worker updates QLabel directly | "Emit a signal. Let the main thread update the GUI." |
| Lab 6 | Trying to write code instead of reading | "Phase 1 is just reading. Trace the flow first." |
| Lab 7 | Forgetting open() or close() | "DataSink lifecycle: open → write → close" |
| Lab 8 | No sentinel on queue | "How does the writer know when to stop?" |
| Lab 9 | Editing Python instead of YAML | "The whole point is you DON'T edit code" |
| Lab 10 | QTimer not started | "Did you call self._timer.start()?" |

---

## The Mantra

Say "the controller does not care" at least once per session. By Day 3, students should be saying it back to you. It's the thread that ties Adapter, Strategy, MVC, DataSink, and config together.

---

## If Things Go Wrong

| Problem | Solution |
|---------|----------|
| PySide6 won't install | Pair with a neighbour. Teach MVC concepts with console examples. |
| Student is completely lost | Focus them on Labs 1-4. Those are the foundation. Labs 7-9 can be demo'd. |
| Student is way ahead | Every lab has extensions. Labs 3, 4, 7, 10 have good stretch goals. |
| Running behind schedule | Day 3 afternoon has flex. Cut "What Comes Next". Shorten Capstone to 5-min demo. |
| Running ahead of schedule | Use optional modules: testing, logging panel, config validation (20-45 min each). |
| Simulator feels "too fake" | Explain: "The architecture guarantees that code written against the simulator works identically with real hardware. That's the whole point of Adapter." |

---

## Post-Course

- Ensure every student has the full `course_materials/` folder (minus solutions)
- Collect feedback forms
- Note any content issues for the next revision
