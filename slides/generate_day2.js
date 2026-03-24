const PptxGenJS = require("pptxgenjs");

const pptx = new PptxGenJS();

// ── Theme constants ──────────────────────────────────────────────────
const BG       = "1E1E2E";
const WHITE    = "FFFFFF";
const ACCENT   = "4FC3F7";
const CODE_BG  = "0D1117";
const RED      = "FF6B6B";
const GREEN    = "66BB6A";
const CODE_TXT = "E6E6E6";

// syntax colours
const KW    = "569CD6";   // keywords
const STR   = "CE9178";   // strings
const CMT   = "6A9955";   // comments
const DECO  = "DCDCAA";   // decorators / func names
const PARAM = "9CDCFE";   // parameter names
const TYPE  = "4EC9B0";   // type hints
const NUM   = "B5CEA8";   // numbers

const FONT_BODY  = "Calibri";
const FONT_TITLE = "Calibri Light";
const FONT_CODE  = "Consolas";

pptx.layout  = "LAYOUT_WIDE";     // 13.33 x 7.5
pptx.author  = "National Labs Training";
pptx.subject = "Day 2 - Application Programming: SOLID, MVC and Threads";

// ── Helper: add dark background to every slide ──────────────────────
function darkSlide() {
  const slide = pptx.addSlide();
  slide.background = { fill: BG };
  return slide;
}

// ── Helper: section title with full-bleed image ─────────────────────
function sectionTitle(title, subtitle) {
  const slide = darkSlide();
  slide.background = { fill: "0D1117" };
  slide.addText(title, {
    x: 0.8, y: 2.2, w: 11.7, h: 1.4,
    fontSize: 44, fontFace: FONT_TITLE, color: WHITE,
    bold: true, align: "left",
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.8, y: 3.6, w: 11.7, h: 0.7,
      fontSize: 20, fontFace: FONT_BODY, color: ACCENT,
      align: "left",
    });
  }
  return slide;
}

// ── Helper: bullet slide ────────────────────────────────────────────
function bulletSlide(title, bullets, opts = {}) {
  const slide = darkSlide();
  slide.addText(title, {
    x: 0.7, y: 0.3, w: 12, h: 0.8,
    fontSize: 36, fontFace: FONT_TITLE, color: WHITE, bold: true,
  });
  const bulletObjs = bullets.map(b => ({
    text: b, options: {
      bullet: { code: "2022" },
      fontSize: 15, fontFace: FONT_BODY, color: WHITE,
      paraSpaceAfter: 6, lineSpacingMultiple: 1.15,
    },
  }));
  slide.addText(bulletObjs, {
    x: 0.9, y: 1.3, w: 11.4, h: 5.5,
    valign: "top",
  });
  return slide;
}

// ── Helper: lab slide (with blue accent bar) ────────────────────────
function labSlide(title, bullets) {
  const slide = darkSlide();
  // blue accent bar at top
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.08,
    fill: { color: ACCENT },
  });
  slide.addText(title, {
    x: 0.7, y: 0.3, w: 12, h: 0.8,
    fontSize: 36, fontFace: FONT_TITLE, color: ACCENT, bold: true,
  });
  const bulletObjs = bullets.map(b => ({
    text: b, options: {
      bullet: { code: "2022" },
      fontSize: 15, fontFace: FONT_BODY, color: WHITE,
      paraSpaceAfter: 6, lineSpacingMultiple: 1.15,
    },
  }));
  slide.addText(bulletObjs, {
    x: 0.9, y: 1.3, w: 11.4, h: 5.5,
    valign: "top",
  });
  return slide;
}

// ── Helper: tokenise Python for syntax highlighting ─────────────────
function tokenize(code) {
  // Returns array of { text, color } for a single line (or whole block)
  const keywords = new Set([
    "def","class","return","if","elif","else","for","while","import","from",
    "as","with","try","except","finally","raise","yield","lambda","pass",
    "break","continue","and","or","not","in","is","True","False","None",
    "self","super","async","await","nonlocal","global","del","assert",
  ]);
  const builtins = new Set([
    "print","len","range","int","float","str","list","dict","set","tuple",
    "isinstance","type","property","staticmethod","classmethod","sum",
    "open","time","math","random","serial","datetime",
  ]);

  const tokens = [];
  let i = 0;
  while (i < code.length) {
    // comments
    if (code[i] === "#") {
      tokens.push({ text: code.slice(i), color: CMT });
      break;
    }
    // decorator
    if (code[i] === "@" && (i === 0 || /\s/.test(code[i-1]))) {
      let end = i + 1;
      while (end < code.length && /[\w.]/.test(code[end])) end++;
      tokens.push({ text: code.slice(i, end), color: DECO });
      i = end;
      continue;
    }
    // strings (triple-quoted and single/double)
    if (code[i] === '"' || code[i] === "'") {
      const q = code[i];
      let end;
      if (code.slice(i, i+3) === q+q+q) {
        end = code.indexOf(q+q+q, i+3);
        end = end === -1 ? code.length : end + 3;
      } else {
        end = i + 1;
        while (end < code.length && code[end] !== q) {
          if (code[end] === "\\") end++;
          end++;
        }
        if (end < code.length) end++;
      }
      tokens.push({ text: code.slice(i, end), color: STR });
      i = end;
      continue;
    }
    // f-strings
    if ((code[i] === "f" || code[i] === "F") && i+1 < code.length && (code[i+1] === '"' || code[i+1] === "'")) {
      const q = code[i+1];
      let end = i + 2;
      while (end < code.length && code[end] !== q) {
        if (code[end] === "\\") end++;
        end++;
      }
      if (end < code.length) end++;
      tokens.push({ text: code.slice(i, end), color: STR });
      i = end;
      continue;
    }
    // numbers
    if (/\d/.test(code[i]) && (i === 0 || !/\w/.test(code[i-1]))) {
      let end = i;
      while (end < code.length && /[\d._eE+\-xXabcdefABCDEF]/.test(code[end])) end++;
      tokens.push({ text: code.slice(i, end), color: NUM });
      i = end;
      continue;
    }
    // identifiers / keywords
    if (/[a-zA-Z_]/.test(code[i])) {
      let end = i;
      while (end < code.length && /\w/.test(code[end])) end++;
      const word = code.slice(i, end);
      if (keywords.has(word)) {
        tokens.push({ text: word, color: KW });
      } else if (builtins.has(word)) {
        tokens.push({ text: word, color: DECO });
      } else if (end < code.length && code[end] === "(") {
        tokens.push({ text: word, color: DECO });
      } else if (word === word.charAt(0).toUpperCase() + word.slice(1) && /^[A-Z]/.test(word)) {
        tokens.push({ text: word, color: TYPE });
      } else {
        tokens.push({ text: word, color: CODE_TXT });
      }
      i = end;
      continue;
    }
    // everything else (operators, punctuation, whitespace)
    tokens.push({ text: code[i], color: CODE_TXT });
    i++;
  }
  return tokens;
}

function highlightCode(code) {
  // Returns an array of pptxgenjs text objects with syntax highlighting
  const lines = code.split("\n");
  const result = [];
  lines.forEach((line, idx) => {
    const toks = tokenize(line);
    toks.forEach(t => {
      result.push({
        text: t.text,
        options: { fontSize: 11, fontFace: FONT_CODE, color: t.color, breakType: undefined },
      });
    });
    if (idx < lines.length - 1) {
      result.push({
        text: "\n",
        options: { fontSize: 11, fontFace: FONT_CODE, color: CODE_TXT },
      });
    }
  });
  return result;
}

// ── Helper: full-width code slide ───────────────────────────────────
function codeSlide(title, code, bottomNote) {
  const slide = darkSlide();
  slide.addText(title, {
    x: 0.7, y: 0.2, w: 12, h: 0.7,
    fontSize: 32, fontFace: FONT_TITLE, color: WHITE, bold: true,
  });
  // code background
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.05, w: 12.33, h: 5.3,
    fill: { color: CODE_BG }, rectRadius: 0.1,
  });
  slide.addText(highlightCode(code), {
    x: 0.7, y: 1.15, w: 11.9, h: 5.1,
    valign: "top", lineSpacingMultiple: 1.08,
  });
  if (bottomNote) {
    slide.addText(bottomNote, {
      x: 0.7, y: 6.55, w: 12, h: 0.6,
      fontSize: 13, fontFace: FONT_BODY, color: ACCENT, italic: true,
      align: "center",
    });
  }
  return slide;
}

// ── Helper: two-column compare slide ────────────────────────────────
function compareSlide(title, leftHeader, leftCode, rightHeader, rightCode, bottomNote, leftColor, rightColor) {
  leftColor  = leftColor  || RED;
  rightColor = rightColor || GREEN;
  const slide = darkSlide();
  slide.addText(title, {
    x: 0.7, y: 0.2, w: 12, h: 0.65,
    fontSize: 32, fontFace: FONT_TITLE, color: WHITE, bold: true,
  });
  // left header
  slide.addText(leftHeader, {
    x: 0.5, y: 0.95, w: 5.9, h: 0.45,
    fontSize: 14, fontFace: FONT_BODY, color: leftColor, bold: true,
  });
  // right header
  slide.addText(rightHeader, {
    x: 6.93, y: 0.95, w: 5.9, h: 0.45,
    fontSize: 14, fontFace: FONT_BODY, color: rightColor, bold: true,
  });
  // left code bg
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.4, w: 5.9, h: 5.0,
    fill: { color: CODE_BG }, rectRadius: 0.1,
  });
  // right code bg
  slide.addShape(pptx.ShapeType.rect, {
    x: 6.93, y: 1.4, w: 5.9, h: 5.0,
    fill: { color: CODE_BG }, rectRadius: 0.1,
  });
  // divider line
  slide.addShape(pptx.ShapeType.line, {
    x: 6.665, y: 1.0, w: 0, h: 5.6,
    line: { color: "444466", width: 1 },
  });
  // left code
  slide.addText(highlightCode(leftCode), {
    x: 0.65, y: 1.5, w: 5.6, h: 4.8,
    valign: "top", lineSpacingMultiple: 1.05,
  });
  // right code
  slide.addText(highlightCode(rightCode), {
    x: 7.08, y: 1.5, w: 5.6, h: 4.8,
    valign: "top", lineSpacingMultiple: 1.05,
  });
  if (bottomNote) {
    slide.addText(bottomNote, {
      x: 0.7, y: 6.55, w: 12, h: 0.6,
      fontSize: 13, fontFace: FONT_BODY, color: ACCENT, italic: true,
      align: "center",
    });
  }
  return slide;
}


// =====================================================================
//  SLIDES
// =====================================================================

// 1. TITLE SLIDE
(() => {
  const slide = darkSlide();
  slide.background = { fill: "0D1117" };
  slide.addText("From Scripts to Systems", {
    x: 0.8, y: 1.6, w: 11.7, h: 1.4,
    fontSize: 44, fontFace: FONT_TITLE, color: WHITE, bold: true,
  });
  slide.addText("Day 2, Application Programming: SOLID, MVC and Threads", {
    x: 0.8, y: 3.0, w: 11.7, h: 0.7,
    fontSize: 24, fontFace: FONT_BODY, color: ACCENT,
  });
  slide.addText("Building a real desktop application with PySide6", {
    x: 0.8, y: 3.8, w: 11.7, h: 0.6,
    fontSize: 16, fontFace: FONT_BODY, color: "B0B0B0",
  });
  slide.addNotes("OPENING (2 min)\nWelcome back. Quick energy check.\nToday's arc: SOLID -> MVC -> error handling -> QThread workers -> a working desktop app.\nBy end of today, you will have a running PySide6 application with live data from the simulator.");
})();

// 2. DAY 2 WELCOME
bulletSlide("Day 2 Welcome", [
  "Yesterday: script to objects to Adapter pattern to Strategy pattern",
  "Today: SOLID principles, MVC, error handling, QThread workers, mini-app",
  "By end of today: a working PySide6 desktop application",
]).addNotes("RECAP + PREVIEW (3 min)\nQuick recap: 'Yesterday we built Adapter (swap hardware) and Strategy (swap behaviour).'\nAsk volunteers to explain each pattern in one sentence.\nTransition: 'Let's start with why coupling hardware to the GUI is a terrible idea.'");

// 3. SECTION TITLE: SOLID in Instrument Code
sectionTitle(
  "SOLID in Instrument Code",
  "Principles that prevent real problems"
).addNotes("SECTION TRANSITION (30 sec)\n'SOLID isn't academic theory. These are the names for problems you already have.'\nAdjust depth by audience: experienced rooms breeze through in 10 min, junior rooms need 20 min with examples.");

// 4. HARDCODING IS A SOLID VIOLATION
bulletSlide("Hardcoding Is a SOLID Violation", [
  "serial.Serial('/dev/ttyUSB0', 9600) \u2014 the class knows about deployment (SRP violation)",
  "if format == 'csv': ... elif ... \u2014 adding a format means editing code (OCP violation)",
  "gui_label.setText(reading) inside the driver \u2014 low-level depends on high-level (DIP violation)",
  "These are not theory \u2014 they are real problems in real instrument code",
]).addNotes("CONCEPT (3 min)\nBriefly name each violation. Don't dwell, the next slide shows the code.\nAsk: 'Which pattern from yesterday fixes the DIP violation?' (Answer: Adapter.)\nKey point: SOLID names the disease, patterns are the treatment.");

// 5. [CODE] SOLID VIOLATIONS IN CODE
codeSlide("SOLID Violations in Code",
`class InstrumentDriver:
    def __init__(self):
        # SRP VIOLATION: knows about deployment details
        self.ser = serial.Serial('/dev/ttyUSB0', 9600)
        self.gui_label = QLabel()  # and about the GUI!

    def read_and_save(self):
        raw = self.ser.readline()
        value = float(raw.split(b',')[1])

        # OCP VIOLATION: adding JSON means editing here
        if self.format == 'csv':
            self.file.write(f"{value}\\n")
        elif self.format == 'json':
            json.dump({"value": value}, self.file)

        # DIP VIOLATION: driver depends on Qt widget
        self.gui_label.setText(f"{value:.2f}")`,
  "Three violations, one class. Each makes the code harder to change, test, and reuse."
).addNotes("CODE WALKTHROUGH (5 min)\nWalk through each annotated violation.\n'SRP: this class knows about serial ports AND CSV formatting AND the GUI. Three reasons to change.'\n'OCP: to add JSON output, I have to edit the existing CSV code path.'\n'DIP: the driver directly depends on QLabel, a concrete GUI widget.'\nAsk: 'How would you fix each one?' Students should recognise the patterns from yesterday.");

// 6. SOLID IN PRACTICE
bulletSlide("SOLID in Practice", [
  "S \u2014 Single Responsibility: sensor reads, recorder writes, UI displays",
  "O \u2014 Open/Closed: add new formats or devices by adding classes, not editing",
  "L \u2014 Liskov Substitution: any adapter implementing the interface works",
  "I \u2014 Interface Segregation: don't force a simple sensor to implement 20 methods",
  "D \u2014 Dependency Inversion: depend on InstrumentAdapter, not serial.Serial",
]).addNotes("CONCEPT (4 min)\nWalk through each letter with the instrument-code example.\nDon't belabour L (Liskov). Just say: 'Any adapter implementing the interface must work correctly when substituted.'\nI (Interface Segregation): 'Don't make a simple temperature sensor implement 20 methods for a multi-channel analyser.'");

// 7. WHY COUPLING HARDWARE TO GUI BREAKS EVERYTHING
bulletSlide("Why Coupling Hardware to GUI Breaks Everything", [
  "Tightly coupled: button click calls serial.read(), blocks UI, frozen app",
  "Testing: impossible without hardware plugged in",
  "Reuse: impossible in a different UI or command-line tool",
  "Error handling: one serial timeout crashes the entire application",
  "If your button click handler calls serial.read(), you're one cable pull from freezing",
]).addNotes("MOTIVATION (4 min)\nThis is the emotional hook for MVC.\nDemo if possible: describe a GUI that calls serial.read() in the button handler. Click. Freeze.\nAsk: 'How do you test this GUI without the instrument?' (You can't.)");

// 8. [COMPARE] COUPLED VS DECOUPLED
compareSlide(
  "Coupled vs Decoupled",
  "Coupled: GUI calls hardware",
`class MainWindow(QMainWindow):
    def on_read_clicked(self):
        # GUI thread blocked until read completes
        ser = serial.Serial('/dev/ttyUSB0')
        ser.write(b'READ:TEMP\\n')
        raw = ser.readline()  # BLOCKS!
        value = float(raw.split(b',')[1])
        self.label.setText(f"{value:.2f}")
        # Can't test without hardware
        # GUI freezes during read
        # Serial error crashes everything`,
  "Decoupled: layers separated",
`class MainWindow(QMainWindow):
    def on_read_clicked(self):
        self.controller.start_reading()

class Controller:
    def start_reading(self):
        reading = self.adapter.read_value('temp')
        self.view.display(reading)

# Adapter is injected (real or simulated)
# View only displays, never reads hardware
# Controller orchestrates, owns nothing`,
  undefined, RED, GREEN
).addNotes("CODE WALKTHROUGH (5 min)\nLeft: 'Button click calls serial.read() directly. GUI freezes. Can't test. Serial error crashes everything.'\nRight: 'Button click calls controller.start_reading(). Controller uses adapter. View only displays.'\nAsk: 'In the right-hand version, what changes if I swap the instrument?' (Answer: nothing in MainWindow or Controller. Only the adapter.)\nThis slide is the bridge from SOLID theory to MVC practice.");

// 9. "THE CONTROLLER DOES NOT CARE" ARCHITECTURE
bulletSlide('"The Controller Does Not Care" Architecture', [
  "The controller orchestrates \u2014 it does not know about:",
  "    serial ports (that's the adapter's job)",
  "    CSV files (that's the data sink's job)",
  "    Qt widgets (that's the view's job)",
  "    retry logic (that's the error handler's job)",
  "This is the mantra of the course",
]).addNotes("CORE CONCEPT (3 min)\nRepeat the mantra. By now students should recognise it.\nDraw the diagram: Controller sits in the middle. It doesn't know about serial ports, CSV files, Qt widgets, or retry logic.\nAsk: 'If I remove PySide6 entirely and replace it with a CLI, what changes?' (Only the View.)");

// 10. SECTION TITLE: MVC for Instrument Applications
sectionTitle(
  "MVC for Instrument Applications",
  "Model, View, Controller \u2014 separation that scales"
).addNotes("SECTION TRANSITION (30 sec)\nMVC in instrument apps is looser than web MVC. Don't over-formalise it. The goal is separation, not textbook compliance.");

// 11. MVC — WHAT IT MEANS HERE
bulletSlide("MVC \u2014 What It Means Here", [
  "Model: the data and state (current reading, connection status, recording state)",
  "View: the PySide6 GUI (labels, buttons, plots)",
  "Controller: the orchestrator (connects model to view, handles user actions)",
  "MVC in instrument apps is looser than textbook MVC \u2014 the goal is separation",
]).addNotes("CONCEPT (3 min)\nDefine each part concretely. Keep it brief, the next slide has the code.\nAsk: 'In yesterday's code, where was the model?' (The Reading class, the adapter state.)\nCommon misconception: 'MVC means three files.' Clarify: it means three responsibilities.");

// 12. [CODE] MODEL, VIEW, CONTROLLER — CODE
codeSlide("Model, View, Controller \u2014 Code",
`# MODEL \u2014 pure Python, no Qt dependency
class InstrumentModel:
    def __init__(self):
        self.current_reading: Optional[Reading] = None
        self.is_connected: bool = False
        self.is_recording: bool = False
    # If this class imports PySide6, something is wrong

# VIEW \u2014 PySide6 widgets, displays only
class MainWindow(QMainWindow):
    def display_reading(self, text: str):
        self.reading_label.setText(text)
    def set_status(self, status: str):
        self.statusBar().showMessage(status)
    # Does NOT call serial.read() or write files

# CONTROLLER \u2014 wiring, the thinnest layer
class Controller:
    def __init__(self, model, view, adapter):
        self.model = model
        self.view = view
        self.adapter = adapter
    # Connects button clicks to model actions`,
  "Model knows nothing about Qt. View knows nothing about hardware. Controller connects them."
).addNotes("CODE WALKTHROUGH (5 min)\nThis is the most important MVC slide. Walk through all three sections.\nModel: 'Pure Python, no Qt. If this class imports PySide6, something is wrong.'\nView: 'PySide6 widgets. Displays data. Does NOT call serial.read() or write files.'\nController: 'Wiring. The thinnest layer. Connects button clicks to model actions.'\nBottom note reinforces the separation. Point back to this slide during Lab 6.");

// 13. PYSIDE6 CRASH COURSE
bulletSlide("PySide6 Crash Course", [
  "QApplication, QMainWindow, QWidget \u2014 the application shell",
  "Layouts: QVBoxLayout, QHBoxLayout, QGridLayout \u2014 arrange widgets",
  "Widgets: QLabel, QPushButton, QComboBox, QStatusBar \u2014 display and input",
  "Signal/slot: button.clicked.connect(self.on_connect) \u2014 event wiring",
]).addNotes("CONCEPT (3 min)\nBrief overview of the key Qt classes. The next slide is the code.\nAsk: 'Who has used Qt before? PyQt5? Tkinter?' Gauge the room.\nIf PySide6 setup fails for anyone: have them pair with a neighbour.");

// 14. [CODE] PYSIDE6 MINIMAL WINDOW
codeSlide("PySide6 Minimal Window",
`import sys
from PySide6.QtWidgets import (QApplication, QMainWindow,
                                QLabel, QPushButton, QVBoxLayout, QWidget)

class MinimalWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("My First PySide6 App")

        # Create widgets
        self.label = QLabel("No reading yet")
        self.button = QPushButton("Read")

        # Layout
        layout = QVBoxLayout()
        layout.addWidget(self.label)
        layout.addWidget(self.button)
        container = QWidget()
        container.setLayout(layout)
        self.setCentralWidget(container)

        # Connect signal to slot
        self.button.clicked.connect(self.on_read)

    def on_read(self):
        self.label.setText("23.50 \u00b0C")

app = QApplication(sys.argv)
window = MinimalWindow()
window.show()
sys.exit(app.exec())`).addNotes("LIVE DEMO (8 min)\nLive-code this alongside the slide. Type it out, don't just show it.\nRun it: a window appears with a label and a button.\nClick the button: label updates.\nAsk: 'What's the signal? What's the slot?' (Signal: button.clicked. Slot: on_read.)\nCommon confusion: QWidget vs QMainWindow. Explain: QMainWindow has menu bar, status bar, central widget.");

// 15. SECTION TITLE: Error Handling
sectionTitle(
  "Error Handling",
  "Keeping the application alive when hardware fails"
).addNotes("SECTION TRANSITION (30 sec)\n'Before we thread anything, let's talk about what happens when things go wrong.'\nAsk: 'What's the worst instrument failure you've experienced?' Quick war stories, keeps energy up.");

// 16. ERROR HANDLING IN INSTRUMENT CODE
bulletSlide("Error Handling in Instrument Code", [
  "Instruments fail \u2014 cables unplug, serial buffers corrupt, timeouts happen",
  "The question is not whether errors occur, but where and how you handle them",
  "Timeout with default: try to read, return None after timeout",
  "Retry with backoff: try N times, wait between attempts",
  "Error propagation: adapter raises, controller catches, view shows status",
]).addNotes("CONCEPT (3 min)\nBriefly name the three patterns. The next slide has the code.\nDemo: show the simulator's error modes. SET:ERROR_MODE:TIMEOUT, then try to read.");

// 17. [CODE] ERROR HANDLING PATTERNS
codeSlide("Error Handling Patterns",
`# PATTERN 1: Timeout with default
def read_with_timeout(self, channel, timeout=2.0):
    self._serial.timeout = timeout
    try:
        raw = self._serial.readline()
        return self._parse(raw)
    except serial.SerialTimeoutException:
        return None  # caller decides what to do

# PATTERN 2: Retry with backoff
def read_with_retry(self, channel, retries=3):
    for attempt in range(retries):
        try:
            return self.read_value(channel)
        except InstrumentError:
            time.sleep(0.5 * (2 ** attempt))  # 0.5s, 1s, 2s
    raise InstrumentError(f"Failed after {retries} retries")

# PATTERN 3: Error propagation (adapter catches, controller receives state)
# In the adapter:
except serial.SerialException as e:
    self._connected = False
    raise InstrumentError(f"Connection lost: {e}")`).addNotes("CODE WALKTHROUGH (5 min)\nWalk through all three patterns.\nPattern 1: 'Timeout with default. Simple and safe. Caller decides what to do with None.'\nPattern 2: 'Retry with backoff. Good for flaky connections. Exponential backoff prevents hammering.'\nPattern 3: 'Error propagation. Adapter catches hardware exceptions, translates to application-level exceptions.'\nAsk: 'Which pattern is appropriate for a cable that's jiggled loose?' (Retry.) 'For a permanently dead instrument?' (Propagation.)");

// 18. [CODE] SAFE ERROR ARCHITECTURE
codeSlide("Safe Error Architecture",
`# LAYER 1: Adapter catches hardware exceptions
class RealInstrumentAdapter(InstrumentAdapter):
    def read_value(self, channel):
        try:
            raw = self._serial.readline()
            return self._parse(raw)
        except serial.SerialException as e:
            self._connected = False
            raise InstrumentError(str(e))  # translated exception

# LAYER 2: Controller receives application-level errors
class Controller:
    def on_reading(self, reading):
        self.view.display_reading(reading.format())
        self.view.clear_error()

    def on_error(self, message):
        self.view.show_error(message)    # view shows status
        # App stays alive. No crash. No traceback.

# The controller never sees SerialException.
# The view never sees InstrumentError.
# Each layer handles its own concern.`,
  "Each layer translates exceptions into its own vocabulary. No layer leaks implementation details."
).addNotes("CODE WALKTHROUGH (5 min)\nWalk through both layers.\nLayer 1: 'Adapter catches SerialException, translates to InstrumentError. The controller never sees SerialException.'\nLayer 2: 'Controller receives application-level errors. View shows status. App stays alive.'\nKey point: 'Each layer handles its own concern. Never let a hardware exception crash the GUI.'");

// 19. SECTION TITLE: QThread + Worker
sectionTitle(
  "QThread + Worker: Background Acquisition",
  "Keeping the GUI alive while reading hardware"
).addNotes("SECTION TRANSITION (30 sec)\n'Now the big one: threading. This is where most instrument GUIs go wrong.'\nReassure: 'Threading in Qt is well-designed. The Worker+QThread pattern is straightforward once you see it.'\nThis section is the hardest of Day 2. Slow down. Use demos heavily.");

// 20. WHY YOU NEED A WORKER THREAD
bulletSlide("Why You Need a Worker Thread", [
  "Demo: GUI that calls serial.read() in the button handler \u2014 GUI freezes!",
  "The GUI runs on the main thread (the Qt event loop)",
  "Blocking the main thread means a frozen application and angry users",
  "Solution: run acquisition on a separate worker thread",
]).addNotes("MOTIVATION (3 min)\nDemo: a GUI that calls time.sleep(3) in a button handler. Window goes grey.\n'That's what happens when you block the main thread.'\nExplain the event loop simply: Qt processes paint events, mouse clicks, keyboard input in a loop. Block it and everything stops.");

// 21. [COMPARE] BLOCKING VS THREADED
compareSlide(
  "Blocking vs Threaded",
  "Blocking: GUI freezes",
`class MainWindow(QMainWindow):
    def on_start(self):
        while self.running:
            # Runs on main thread!
            reading = self.adapter.read_value(
                'temp'
            )
            self.label.setText(reading.format())
            time.sleep(0.1)

            # GUI cannot repaint
            # Buttons don't respond
            # Window shows "Not Responding"
            # User has to kill the process`,
  "Threaded: GUI stays alive",
`class MainWindow(QMainWindow):
    def on_start(self):
        self.worker = AcquisitionWorker(
            self.adapter
        )
        self.thread = QThread()
        self.worker.moveToThread(self.thread)

        # Signals cross thread boundary safely
        self.worker.reading_ready.connect(
            self.on_reading  # runs on main thread
        )
        self.thread.started.connect(
            self.worker.run
        )
        self.thread.start()
        # GUI stays responsive!`,
  undefined, RED, GREEN
).addNotes("CODE WALKTHROUGH (5 min)\nLeft: 'While loop on main thread. GUI cannot repaint. Buttons don't respond. User sees Not Responding.'\nRight: 'Worker on a separate thread. Signals cross the thread boundary safely. GUI stays responsive.'\nAsk: 'Which side is your current instrument code on?' (Laughs, honest admissions.)\nThis is the motivation for the Worker pattern that follows.");

// 22. [CODE] THE WORKER CLASS
codeSlide("The Worker Class",
`from PySide6.QtCore import QObject, Signal

class AcquisitionWorker(QObject):
    """Runs on a background thread. Communicates via signals only."""
    reading_ready = Signal(object)    # emits Reading
    error_occurred = Signal(str)      # emits error message
    finished = Signal()               # emits when done

    def __init__(self, adapter, interval=0.1):
        super().__init__()
        self.adapter = adapter
        self.interval = interval
        self._running = False

    def run(self):
        """Main acquisition loop. Runs on worker thread."""
        self._running = True
        while self._running:
            try:
                reading = self.adapter.read_value('temperature')
                self.reading_ready.emit(reading)  # -> main thread
            except Exception as e:
                self.error_occurred.emit(str(e))   # -> main thread
            time.sleep(self.interval)
        self.finished.emit()

    def stop(self):
        self._running = False`,
  "NEVER update GUI widgets from this class. Emit a signal, let the main thread handle display."
).addNotes("CODE WALKTHROUGH (5 min)\nThis is critical. Walk through every part.\n'reading_ready = Signal(object): emits a Reading to the main thread.'\n'error_occurred = Signal(str): emits error messages safely.'\n'run() loops while self._running. Check the flag every iteration.'\n'NEVER update GUI widgets from this class. Emit a signal, let the main thread handle display.'\nAsk: 'What happens if you forget to check _running?' (The worker runs forever, app hangs on exit.)");

// 23. [CODE] STARTING AND STOPPING CLEANLY
codeSlide("Starting and Stopping Cleanly",
`class Controller:
    def start_acquisition(self):
        self.thread = QThread()
        self.worker = AcquisitionWorker(self.adapter)
        self.worker.moveToThread(self.thread)

        # Wire signals
        self.thread.started.connect(self.worker.run)
        self.worker.reading_ready.connect(self._on_reading)
        self.worker.error_occurred.connect(self._on_error)
        self.worker.finished.connect(self.thread.quit)

        self.thread.start()

    def stop_acquisition(self):
        self.worker.stop()          # set _running = False
        self.thread.quit()          # ask thread to exit
        self.thread.wait(5000)      # wait up to 5 seconds

    # CRITICAL: always stop threads on window close
    def cleanup(self):
        if self.thread and self.thread.isRunning():
            self.stop_acquisition()  # prevent hang on exit`).addNotes("CODE WALKTHROUGH (5 min)\nShow the start sequence: create thread, create worker, moveToThread, connect signals, start.\nShow the stop sequence: worker.stop(), thread.quit(), thread.wait(5000).\nCRITICAL: 'Always stop threads in closeEvent(). If you forget, the app hangs on exit.'\nCommon mistake: calling thread.terminate(). This is dangerous and can corrupt data. Always use the _running flag.");

// 24. SIGNAL/SLOT COMMUNICATION
bulletSlide("Signal/Slot Communication", [
  "Signals are thread-safe in Qt \u2014 they cross thread boundaries safely",
  "worker.reading_ready.emit(reading): controller runs on_reading on main thread",
  "This is how data flows from worker to GUI without race conditions",
  "Rule: NEVER update GUI widgets from the worker thread directly \u2014 always use signals",
]).addNotes("CONCEPT (3 min)\n'Signals cross thread boundaries safely. That's the magic.'\nRule: 'If you're in a worker thread and you want to update the GUI, emit a signal. Always.'\nAsk: 'What would happen if the worker called self.label.setText() directly?' (Crash, race condition, or silent corruption.)");

// 25. LAB 5 — WORKER THREAD
labSlide("Lab 5 \u2014 Worker Thread", [
  "Build an AcquisitionWorker that reads from SimulatedInstrumentAdapter",
  "Connect it to a simple PySide6 GUI with Start/Stop buttons",
  "Display readings in a QLabel via signals",
  "Handle errors: show error in status bar, app stays alive",
  "Critical: use QObject + moveToThread, not QThread subclass",
  "Time: 35 minutes",
]).addNotes("LAB SETUP (2 min then 35 min lab)\nThis is the most challenging lab so far. Set expectations.\nKey instruction: 'Build a simple GUI with Start/Stop buttons. Start creates a worker, Stop sets _running = False.'\nWalk the room actively. Common issues: signal not connected, forgot closeEvent, exception in run() not caught.\nPair struggling students. If it takes 40 minutes, that's fine.");

// 26. LAB 5 DEBRIEF
bulletSlide("Lab 5 Debrief", [
  "Demo: working app with start/stop and live readings",
  "Key test: what happens if the adapter throws an error?",
  "Answer: error signal fires, GUI shows error, app stays alive",
  "The GUI never freezes because acquisition is on a separate thread",
]).addNotes("DEBRIEF (5 min)\nDemo: Start -> readings flow -> Stop -> readings stop -> Start again.\nTest: set error mode on simulator. Error signal fires, GUI shows error, app stays alive.\nAsk: 'What was the hardest part?' (Common: getting signals connected, stopping cleanly.)\nKey takeaway: 'The pattern is always the same: create worker, moveToThread, connect signals, start.'");

// 27. SECTION TITLE: Mini-App Build
sectionTitle(
  "Mini-App Build",
  "Putting it all together"
).addNotes("SECTION TRANSITION (30 sec)\n'Now let's put it all together. Everything from Day 1 and Day 2, in one application.'\nEnergy boost: 'By the end of this session, you'll have a working desktop application.'");

// 28. MINI-APP — PUTTING IT ALL TOGETHER
bulletSlide("Mini-App \u2014 Putting It All Together", [
  "Build a complete instrument-control application with:",
  "    PySide6 GUI with MVC structure",
  "    SimulatedInstrumentAdapter (or real if you have hardware)",
  "    Worker thread for background acquisition",
  "    Start/stop controls and live reading display",
  "    Connection status indicator",
  "    Error handling throughout",
]).addNotes("OVERVIEW (5 min)\nShow the LabMonitor application running. Give a tour.\nPoint out the project structure in the IDE. Show how it maps to the patterns.\ndrivers/ = Adapter, core/ = Model + Controller, ui/ = View, configs/ = Configuration.");

// 29. LAB 6 — BUILD THE MINI-APP
labSlide("Lab 6 \u2014 Build the Mini-App", [
  "Phase 1 (10 min): review the labmonitor/ project structure",
  "Phase 2 (15 min): understand the GUI, read ui/main_window.py",
  "Phase 3 (15 min): understand the Controller, trace the flow",
  "Phase 4 (15 min): run the application with python main.py",
  "Phase 5 (15 min): modify something (display format, colour, title)",
  "Phase 6 (extension): swap backend via config file",
  "Time: 70 minutes total",
]).addNotes("LAB SETUP (5 min then 70 min lab)\nBreak into phases. Don't let students try everything at once.\nPhase 1: just read the structure. Phase 2: trace the GUI. Phase 3: trace the Controller. Phase 4: run it. Phase 5: change something.\nThis lab is mostly reading and understanding, not writing from scratch.\nIf the class is behind, skip Phase 6 and do it as a demo.");

// 30. DAY 2 RECAP
bulletSlide("Day 2 Recap", [
  "Identified SOLID violations in real instrument code",
  "Separated Model, View, and Controller concerns",
  "Implemented error handling that keeps the application alive",
  "Built a worker thread for background acquisition",
  "Connected signals/slots across thread boundaries",
  "Built a working PySide6 mini-app with live readings",
  "Tomorrow: data architecture, file I/O, real-time plotting, performance",
]).addNotes("CLOSING (5 min)\nRecap: SOLID -> MVC -> Error handling -> QThread -> Working app.\nAsk: 'What was the most valuable thing you learned today?'\nPreview tomorrow: 'Tomorrow we add the data layer and real-time plotting.'\nKey callback: 'The controller does not care. It didn't care about hardware. It doesn't care about the GUI. Tomorrow it won't care about data formats either.'");

// ── Generate ─────────────────────────────────────────────────────────
const outPath = "C:/Users/edrz/Devfoundry/Courses/National_Labs/slides/Day2_Application_Programming.pptx";
pptx.writeFile({ fileName: outPath }).then(() => {
  console.log("Created: " + outPath);
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
