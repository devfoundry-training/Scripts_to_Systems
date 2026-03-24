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
pptx.subject = "Day 1 - From Script to Architecture";

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
  if (opts.imageUrl) {
    slide.background = { fill: "0D1117" };
  }
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
  slide.addText("Day 1, From Script to Architecture", {
    x: 0.8, y: 3.0, w: 11.7, h: 0.7,
    fontSize: 24, fontFace: FONT_BODY, color: ACCENT,
  });
  slide.addText("Python Application Architecture for Instrument Control", {
    x: 0.8, y: 3.8, w: 11.7, h: 0.6,
    fontSize: 16, fontFace: FONT_BODY, color: "B0B0B0",
  });
  slide.addNotes("OPENING (2 min)\nWelcome delegates. Introduce yourself and the course theme.\nSet expectations: by end of Day 1, you'll understand why scripts break and have two powerful patterns (Adapter, Strategy) to fix that.\nIce-breaker: 'Who here has a Python script that started small and grew into something terrifying?'");
})();

// 2. ABOUT THIS COURSE
bulletSlide("About This Course", [
  "Who: engineers who write Python for instruments and want to write better software",
  "What: build a working instrument-control application over 3 days",
  "How: simulator-first, no real hardware required for any delegate",
  "Every pattern appears first in simple form, then in a realistic context",
  "Day 1: Architecture foundations | Day 2: GUI application | Day 3: Data and performance",
]).addNotes("COURSE OVERVIEW (3 min)\nWalk through each bullet. Emphasise 'simulator-first' so nobody worries about missing hardware.\nAsk: 'What instruments or devices do you work with day to day?' This helps you gauge the room.\nMention the 3-day arc: foundations, application, data and performance.");

// 3. THE TRAINING RIG
bulletSlide("The Training Rig", [
  "SimulatedInstrument generates temperature and voltage readings",
  "Accepts commands (READ:TEMP, SET:INTERVAL, *IDN?), returns realistic data",
  "Can simulate errors: timeouts, garbage responses, intermittent disconnects, drift",
  "Optional: one real Arduino/instrument rig on the instructor desk",
  "All delegates work entirely with the simulator, no hardware dependency",
]).addNotes("SIMULATOR INTRO (3 min)\nDemo: run the simulator briefly in a terminal. Show it returning temperature and voltage values.\nExplain the commands: READ:TEMP, READ:VOLT, SET:INTERVAL:200, *IDN?, SET:ERROR_MODE:TIMEOUT.\nKey point: 'This simulator behaves exactly like a real instrument from your code\\'s perspective.'\nDon't deep-dive the simulator yet. Students explore it in Lab 3.");

// 4. A SCRIPT THAT WORKS
bulletSlide("A Script That Works", [
  "200-line Python script: open serial port, read values, print them, write to CSV",
  "It runs, it produces output, it does the job",
  "For a one-off measurement task, this is absolutely fine",
  "But what happens when the requirements change?",
]).addNotes("MOTIVATION (3 min)\nShow examples/messy_script.py on screen (or a snippet). Don't read through it line by line.\nSay: 'This works. For a one-off job, it\\'s fine.'\nPause. Then: 'So when does it stop being fine?'\nValidate that scripts aren't bad, they're just limited.");

// 5. A SCRIPT THAT BREAKS
bulletSlide("A Script That Breaks", [
  "The boss wants a GUI",
  "The instrument changes (new model, new protocol)",
  "A second engineer has to maintain it",
  "The data format needs to change (CSV to HDF5, add metadata)",
  "Now add error handling, retries, timeouts...",
  "Discussion: what has broken YOUR scripts?",
]).addNotes("DISCUSSION (5 min)\nRead each bullet, then STOP and ask: 'Has this happened to you?'\nGive 2-3 minutes for open discussion. Write keywords on whiteboard if available.\nThis is the emotional hook: students should feel 'yes, this IS my problem' before you offer solutions.");

// 6. WHY SCRIPTS BREAK
bulletSlide("Why Scripts Break", [
  "Everything in one place, no separation of concerns",
  "State scattered across global variables",
  "Hardware details wired directly into application logic",
  "No way to test without plugging in real hardware",
  "One change ripples through the entire file",
  "These are structural problems that patterns solve",
]).addNotes("ANALYSIS (3 min)\nNow formalise what they just described. Map their stories to these structural issues.\nKey misconception to address: 'My script is too small to need architecture.' Counter: 'It\\'s not about size, it\\'s about how many reasons it has to change.'\nAsk: 'If the serial port changes, how many lines do you edit?'");

// 7. THE GOAL
bulletSlide("The Goal \u2014 Architecture That Survives Change", [
  "Layered architecture: UI, Controller, Model, Adapter, Hardware/Simulator",
  "Swap the instrument? Change one adapter file",
  "Swap the data format? Change one sink file",
  "Add a GUI? The model doesn't know or care",
  "This is where we're heading over 3 days",
]).addNotes("ARCHITECTURE PREVIEW (3 min)\nShow the layered diagram. This is a preview, don't explain every layer yet.\nSay: 'By end of Day 3, your project will look like this.'\nIntroduce the phrase casually: 'The controller does not care.'\nDon't over-explain. Students will build each layer themselves.");

// 8. SECTION TITLE: OOP from Scratch
sectionTitle(
  "OOP from Scratch",
  "Classes, objects, state, and responsibility"
).addNotes("SECTION TRANSITION (30 sec)\n'Let\\'s start building. We need objects before we can build patterns.'\nGauge the room: 'How comfortable are you with Python classes? Show of hands.'\nAdjust depth based on the response.");

// 9. FUNCTIONS VS CLASSES
bulletSlide("Functions vs Classes \u2014 When to Upgrade", [
  "Functions are great for stateless transformations: parse_reading(), format_timestamp()",
  "Classes are for things with state and behaviour: a connection, a recorder, a sensor",
  "Rule of thumb: if you pass the same 3 or 4 values between functions, you want an object",
  "Don't oversell OOP, functions are fine when they're enough",
]).addNotes("CONCEPT (3 min)\nStress the key distinction: functions for stateless transformations, classes for things with state.\nAsk: 'Would you pass port, baud_rate, and the serial handle to every function?'\nCommon misconception: 'Classes are always better than functions.' Push back on this.");

// 10. [CODE] FUNCTIONS VS CLASSES — CODE
compareSlide(
  "Functions vs Classes \u2014 Code Example",
  "Function (stateless)",
`def parse_reading(raw: str) -> float:
    """No state needed, just transform."""
    parts = raw.strip().split(',')
    return float(parts[1])

result = parse_reading("TEMP,23.5,C")`,
  "Class (stateful)",
`class SerialConnection:
    """Has state: port, baud rate, open/closed."""
    def __init__(self, port, baud_rate=9600):
        self.port = port
        self.baud_rate = baud_rate
        self._serial = None

    def open(self):
        self._serial = serial.Serial(
            self.port, self.baud_rate
        )

    def read(self) -> str:
        return self._serial.readline().decode()`,
  "Functions for transformations, classes for things with state and identity",
  ACCENT, ACCENT
).addNotes("CODE WALKTHROUGH (4 min)\nWalk through both columns.\nLeft: 'parse_reading takes a string, returns a float. No state needed. Perfect as a function.'\nRight: 'SerialConnection has a port, a baud rate, a serial handle. That\\'s state. It belongs in a class.'\nAsk: 'What happens if you try to do the right-hand side with just functions?'\nThis slide is the visual anchor for the concept. Point back to it during labs.");

// 11. WHAT IS AN OBJECT
bulletSlide("What Is an Object", [
  "An object combines state, behaviour, and identity",
  "Example: TemperatureReading has a value, a unit, a timestamp",
  "Example: SerialConnection has a port, a baud rate, an open/closed state",
]).addNotes("CONCEPT (2 min)\nKeep this brief. The next slide has the code that makes it concrete.\nAvoid jargon like 'encapsulation', just say 'the data and the functions that work on it live together.'");

// 12. [CODE] WHAT IS AN OBJECT — CODE
codeSlide("What Is an Object \u2014 Code Example",
`class TemperatureReading:
    """State: value, unit, timestamp. Behaviour: format, convert."""

    def __init__(self, value: float, unit: str, timestamp: datetime):
        self.value = value
        self.unit = unit
        self.timestamp = timestamp

    def format(self) -> str:
        return f"{self.value:.2f} {self.unit}"

    def to_celsius(self) -> float:
        if self.unit == "F":
            return (self.value - 32) * 5 / 9
        return self.value

# Create an instance — a specific reading with its own identity
reading = TemperatureReading(23.5, "C", datetime.now())
print(reading.format())  # "23.50 C"`)
.addNotes("CODE WALKTHROUGH (4 min)\nLive demo: type this class in the REPL or editor alongside the slide.\nShow: creating an instance, accessing attributes, calling methods.\nAsk: 'What\\'s the difference between the class and an instance?' (blueprint vs actual thing)\nPoint out the type hints, they document intent without heavy tooling.");

// 13. STATE AND RESPONSIBILITY
bulletSlide("State and Responsibility", [
  "Every class should have one clear reason to exist",
  "TemperatureSensor: reads temperature from the instrument",
  "DataRecorder: writes readings to a file",
  "If a class is doing two unrelated things, split it",
  'Test: describe the class in one sentence. If you need "and", it\'s two classes',
]).addNotes("CONCEPT (3 min)\nThis is the most important OOP idea in the course. Spend time here.\nAsk: 'Describe DataRecorder in one sentence.' If someone says 'It reads data AND writes it,' say: 'That\\'s two things.'\nKey phrase: 'If you need AND to describe what it does, it\\'s two classes.'");

// 14. [COMPARE] STATE AND RESPONSIBILITY
compareSlide(
  "State and Responsibility \u2014 Bad vs Good",
  "Too many responsibilities",
`class InstrumentManager:
    """Reads AND records AND displays."""
    def __init__(self, port):
        self.serial = serial.Serial(port)
        self.csv_file = open("data.csv", "w")
        self.label = QLabel()

    def do_everything(self):
        raw = self.serial.readline()
        value = float(raw.split(b",")[1])
        self.csv_file.write(f"{value}\\n")
        self.label.setText(f"{value:.2f}")`,
  "One job each",
`class Sensor:
    """Reads from instrument."""
    def read(self) -> float: ...

class Recorder:
    """Writes to file."""
    def write(self, value: float): ...

class Display:
    """Shows to user."""
    def update(self, value: float): ...

# Each can change independently`,
  undefined, RED, GREEN
).addNotes("CODE WALKTHROUGH (5 min)\nLeft column: 'InstrumentManager reads AND records AND displays. Three reasons to change.'\nRight column: 'Each class has one job. Sensor reads. Recorder writes. Display shows.'\nAsk: 'What happens if you need to change the display format?' Left: edit InstrumentManager (risky). Right: edit Display only (safe).\nThis is the slide students will remember. Spend the time here.");

// 15. COMPOSITION VS INHERITANCE
bulletSlide("Composition vs Inheritance", [
  'Inheritance ("is a"): use sparingly, mainly for the adapter interface',
  'Composition ("has a"): use by default, most instrument code benefits from this',
  "DataAcquisitionSystem HAS a sensor, HAS a recorder, HAS a display",
  "It is NOT a sensor, NOT a recorder, NOT a display",
  "In instrument code, composition wins almost always",
]).addNotes("CONCEPT (3 min)\nIn this course, inheritance appears once: the Adapter interface (ABC). Everything else is composition.\nAsk: 'Can anyone think of an is-a relationship in instrument code?' (Answer: rarely.)");

// 16. [COMPARE] COMPOSITION VS INHERITANCE
compareSlide(
  "Composition vs Inheritance \u2014 Code",
  "Inheritance (fragile)",
`# Inheriting from the sensor? Really?
class DataSystem(TemperatureSensor):
    """IS a sensor... but also records
    and displays?"""
    def record(self): ...
    def display(self): ...

# What if we need two sensors?
# What if we swap the sensor type?
# Inheritance locks us in.`,
  "Composition (flexible)",
`class DataSystem:
    """HAS a sensor, HAS a recorder."""
    def __init__(self, sensor, recorder):
        self.sensor = sensor    # injected
        self.recorder = recorder  # injected

    def acquire(self):
        reading = self.sensor.read()
        self.recorder.write(reading)

# Swap sensor? Pass a different one.
# Add a second sensor? Add another field.
# Composition keeps options open.`,
  undefined, RED, GREEN
).addNotes("CODE WALKTHROUGH (4 min)\nLeft: 'DataSystem IS a sensor? That makes no sense. What if we need two sensors?'\nRight: 'DataSystem HAS a sensor, HAS a recorder. Swap either one independently.'\nKey insight: 'Composition keeps options open. Inheritance locks you in.'");

// 17. HOW TO SLICE LOGIC
bulletSlide("How to Slice Logic into Small Units", [
  "Find the nouns: instrument, reading, recorder, config, display",
  "Find the verbs: connect, read, record, display, configure",
  "Assign each verb to the right noun",
  "If a noun has too many verbs, split it into two nouns",
]).addNotes("PRACTICAL METHOD (3 min)\nDo this exercise live with the class.\n'What are the nouns? What are the verbs? Now assign each verb to the right noun.'\nThis is a design heuristic, not a formal method.");

// 18. LAB 1
labSlide("Lab 1 \u2014 From Script to Classes", [
  "You will receive a messy 200-line script (examples/messy_script.py)",
  "Read through it and identify at least 3 distinct responsibilities",
  "Create a class for each responsibility",
  "Refactor main() so it creates instances and calls methods, no globals",
  "The refactored version should produce the same output",
  "Time: 25 to 30 minutes",
]).addNotes("LAB SETUP (2 min then 25-30 min lab)\nPoint students to examples/messy_script.py.\nSay: 'Don\\'t try to make it perfect. Just find 3 responsibilities and give each one a class.'\nWalk the room. Common issues: students who freeze (suggest nouns), too many classes, where main() goes.");

// 19. LAB 1 DEBRIEF
bulletSlide("Lab 1 Debrief", [
  "What classes did you create?",
  "Good answers: InstrumentReader, DataRecorder, ReadingFormatter",
  "Common mistake: creating classes that are just namespaces (no state)",
  "Common mistake: making one giant class that does everything",
  "There's no single right answer, but some splits are clearly better",
]).addNotes("DEBRIEF (5 min)\nAsk 2-3 students to share their class names. Write them on the board.\nCommon good answers: InstrumentReader, DataRecorder, ReadingFormatter.\nBridge to afternoon: 'Now let\\'s look at real instrument code and find the patterns.'");

// 20. SECTION TITLE: Patterns in Instrument Programming
sectionTitle(
  "Patterns in Instrument Programming",
  "Seams, adapters, and strategies"
).addNotes("SECTION TRANSITION (30 sec)\nPost-lunch is low energy. Start with the messy driver demo.\nSay: 'We\\'re going to look at some truly awful code.'");

// 21. THE MESSY DRIVER
bulletSlide("The Messy Driver", [
  "150-line instrument driver (examples/messy_driver.py)",
  "Mixed concerns: serial setup, command formatting, response parsing, error handling",
  "Hardcoded port, baud rate, command strings",
  "It works, but changing anything is risky",
]).addNotes("DEMO (5 min)\nShow examples/messy_driver.py on screen. Scroll through slowly.\nPoint out: hardcoded port, serial setup mixed with formatting, scattered error handling.\nAsk: 'Where would you start cleaning this up?'");

// 22. WHAT IS A SEAM
bulletSlide("What Is a Seam", [
  "A seam is a point where you can change behaviour without editing surrounding code",
  "In instrument code, seams are at: the transport layer, the command format, the response parser, and the error handler",
  "The seams tell you where to cut",
]).addNotes("CONCEPT (3 min)\nDefine seam: 'A point where you can change behaviour without editing surrounding code.'\nAnalogy: 'Like a seam in clothing.'\nList the four seams. Ask students to identify which seam each problem belongs to.");

// 23. [CODE] FINDING SEAMS
codeSlide("Finding Seams \u2014 Code Example",
`def read_temperature(self):
    # SEAM 1: Transport — hardcoded serial setup
    ser = serial.Serial('/dev/ttyUSB0', 9600)

    # SEAM 2: Protocol — hardcoded command format
    ser.write(b'READ:TEMP\\n')

    # SEAM 3: Parsing — coupled to response format
    response = ser.readline().decode()
    value = float(response.split(',')[1])

    # SEAM 4: Error handling — scattered
    if value < -50 or value > 150:
        print("WARNING: suspect reading")

    return value`,
  "Four seams in one function. Each is a reason to change. Each should be its own concern."
).addNotes("CODE WALKTHROUGH (5 min)\nWalk through each SEAM annotation.\nSEAM 1: hardcoded serial. SEAM 2: hardcoded command. SEAM 3: parsing coupled to format. SEAM 4: scattered error handling.\nAsk: 'If I change the instrument model, which seams do I cut?' (Potentially all, which is the problem.)\nThis is the key teaching slide for seams.");

// 24. [COMPARE] REFACTORING TOWARD CLARITY
compareSlide(
  "Refactoring Toward Clarity",
  "Before: everything tangled",
`def read_temperature(self):
    ser = serial.Serial('/dev/ttyUSB0', 9600)
    ser.write(b'READ:TEMP\\n')
    raw = ser.readline().decode()
    value = float(raw.split(',')[1])
    return value`,
  "After: seams separated",
`def read_temperature(self):
    raw = self.transport.send('READ:TEMP')
    return self.parser.extract_value(raw)

# Transport is injectable (real or fake)
# Parser is a pure function (testable)
# read_temperature() just orchestrates`,
  undefined, RED, GREEN
).addNotes("CODE WALKTHROUGH (4 min)\nLeft: 'Everything tangled. Hardcoded port, inline command, inline parsing.'\nRight: 'Transport is injectable. Parser is pure. read_temperature() just orchestrates.'\nSay: 'I didn\\'t change what the code does. I changed how it\\'s organised.'");

// 25. LAB 2
labSlide("Lab 2 \u2014 Refactor the Messy Driver", [
  "Receive the messy driver (examples/messy_driver.py)",
  "Identify the seams (transitions between concerns)",
  "Extract at least the transport layer and parsing logic",
  "Goal: the driver should be testable without a real serial port",
  "Keep the FakeSerial class unchanged, it simulates the port",
  "Time: 30 minutes",
]).addNotes("LAB SETUP (2 min then 30 min lab)\nKey instruction: 'Keep the FakeSerial class unchanged.'\nThis lab is harder than Lab 1. Allow full 30 minutes.\nIf students struggle, pair them up.");

// 26. LAB 2 DEBRIEF
bulletSlide("Lab 2 Debrief", [
  "Key insight: separating transport from protocol makes everything testable",
  "The Transport class can accept any serial-like object (real or fake)",
  "Pure parsing functions can be tested with simple string inputs",
  "This separation is the foundation for the Adapter pattern, up next",
]).addNotes("DEBRIEF (5 min)\nKey insight: 'Separating transport from protocol makes everything testable.'\nBridge: 'What you just did informally has a name. It\\'s called the Adapter pattern.'");

// 27. CODE MARRIED TO HARDWARE
bulletSlide("Code Married to Hardware", [
  "serial.Serial('/dev/ttyUSB0', 9600) appears in 47 places",
  "Change the instrument? Rewrite everything",
  "Test without hardware? Impossible",
  "One serial timeout crashes the entire GUI",
  "If your code can only run when the hardware is plugged in, your code owns you",
]).addNotes("MOTIVATION (3 min)\nPause after: 'If your code can only run when the hardware is plugged in, your code owns you.'\nAsk: 'Who has code that can only be tested with the real instrument?'\nSay: 'By the end of this session, that will never be true again.'");

// 28. THE ADAPTER PATTERN
bulletSlide("The Adapter Pattern", [
  "Define an interface (the port): connect(), read_value(), send_command(), disconnect()",
  "Implement it twice: RealInstrumentAdapter and SimulatedInstrumentAdapter",
  "The rest of your code talks only to the interface, never to serial.Serial directly",
  "This is the single most important pattern in the course",
]).addNotes("CORE CONCEPT (4 min)\nThis is the single most important slide in the course.\nDraw the diagram: Application -> InstrumentAdapter (interface) -> Real OR Simulated.\nKey phrase: 'The controller does not care whether the instrument is real or simulated.'");

// 29. [CODE] THE ADAPTER INTERFACE — ABC
codeSlide("The Adapter Interface \u2014 ABC",
`from abc import ABC, abstractmethod

class InstrumentAdapter(ABC):
    """The contract. Any instrument must implement these."""

    @abstractmethod
    def connect(self) -> None: ...

    @abstractmethod
    def disconnect(self) -> None: ...

    @abstractmethod
    def read_value(self, channel: str) -> 'Reading': ...

    @abstractmethod
    def send_command(self, command: str) -> str: ...

    @property
    @abstractmethod
    def is_connected(self) -> bool: ...`,
  "Five methods. That's the entire contract. Any class implementing these can be used as an instrument."
).addNotes("CODE WALKTHROUGH (5 min)\nWalk through each method of the ABC.\nAsk: 'Why does read_value() take a channel parameter?' (Multiple channels.)\nAsk: 'Why is is_connected a property?' (State, not action.)\nThis is the contract everything else depends on.");

// 30. [COMPARE] SIMULATED VS REAL ADAPTER
compareSlide(
  "Simulated vs Real Adapter",
  "SimulatedInstrumentAdapter",
`class SimulatedInstrumentAdapter(InstrumentAdapter):
    def connect(self):
        self._connected = True  # instant

    def read_value(self, channel):
        # Sine wave + noise, no hardware
        t = time.time()
        value = 22 + 3 * math.sin(t / 10)
        value += random.gauss(0, 0.1)
        return Reading(value, "degC", channel)

    def disconnect(self):
        self._connected = False`,
  "RealInstrumentAdapter",
`class RealInstrumentAdapter(InstrumentAdapter):
    def connect(self):
        self._serial = serial.Serial(
            self._port, self._baud_rate
        )

    def read_value(self, channel):
        self._serial.write(
            f"READ:{channel}\\n".encode()
        )
        raw = self._serial.readline().decode()
        return self._parse(raw)

    def disconnect(self):
        self._serial.close()`,
  "Same interface, completely different internals. The calling code cannot tell the difference.",
  ACCENT, ACCENT
).addNotes("CODE WALKTHROUGH (5 min)\nWalk both columns. Left: simulator. Right: real hardware. Same interface.\nBottom note: 'The calling code cannot tell the difference.'\nIf you have a demo rig, this is the moment to show the same script on both.");

// 31. [CODE] SWAPPING AT STARTUP
codeSlide("Swapping at Startup",
`def create_adapter(config: dict) -> InstrumentAdapter:
    """Factory: config chooses the adapter, app doesn't care."""
    device_type = config['device']['type']

    if device_type == 'simulated':
        return SimulatedInstrumentAdapter()
    elif device_type == 'serial':
        return RealInstrumentAdapter(
            port=config['device']['port'],
            baud_rate=config['device']['baud_rate']
        )
    else:
        raise ValueError(f"Unknown device type: {device_type}")

# In main.py — ONE line decides real vs simulated
adapter = create_adapter(config)

# Everything below this line is identical
# regardless of which adapter was created
adapter.connect()
reading = adapter.read_value("temperature")`)
.addNotes("CODE WALKTHROUGH (4 min)\nShow the factory function. 'ONE line decides real vs simulated.'\nKey point: 'Architecture makes the swap possible. Configuration makes it easy.'\nPreview: on Day 3, this comes from a YAML file.");

// 32. LAB 3
labSlide("Lab 3 \u2014 Build the Adapter", [
  "Review the InstrumentAdapter ABC in labmonitor/core/adapter_interface.py",
  "Review SimulatedInstrumentAdapter in labmonitor/drivers/simulated.py",
  "Write a test script that creates the adapter, connects, reads 10 values, disconnects",
  "Verify: isinstance(adapter, InstrumentAdapter) is True",
  "Extension: try toggling error modes",
  "Time: 30 minutes",
]).addNotes("LAB SETUP (2 min then 30 min lab)\nStudents work with the labmonitor project for the first time.\nKey instruction: 'Use the adapter through the interface only.'\nExtension: try toggling error modes.");

// 33. LAB 3 DEBRIEF
bulletSlide("Lab 3 Debrief", [
  "Demo: same script, two different adapters, identical calling code",
  "The key insight: the calling code does not know or care which adapter is behind it",
  '"The controller does not care."',
  "This phrase is the architectural mantra of the entire course",
]).addNotes("DEBRIEF (4 min)\nDemo: same script, two adapters, identical code.\nSay the mantra: 'The controller does not care.'\nAsk: 'To add a third adapter for a network instrument?' (One new class. Nothing else changes.)");

// 34. THE PROBLEM — MEASUREMENT MODES
bulletSlide("The Problem \u2014 Measurement Modes", [
  "Your instrument supports: single reading, continuous, burst, averaging",
  "Without the Strategy pattern: massive if/elif chain",
  "Adding a new mode means editing the core logic, risky and ugly",
  "Every time you see a big if/elif for different modes, you're looking at a Strategy opportunity",
]).addNotes("MOTIVATION (3 min)\nShow the concept of the big if/elif chain.\nAsk: 'What happens when the boss asks for a new mode?'\nSame structural problem as hardcoded hardware, but for behaviour.");

// 35. [COMPARE] THE STRATEGY PATTERN
compareSlide(
  "The Strategy Pattern \u2014 Bad vs Good",
  "if/elif sprawl",
`def measure(self, mode, adapter):
    if mode == 'single':
        return [adapter.read_value('temp')]
    elif mode == 'continuous':
        results = []
        for _ in range(self.n_readings):
            results.append(
                adapter.read_value('temp')
            )
            time.sleep(self.interval)
        return results
    elif mode == 'averaging':
        values = [adapter.read_value('temp')
                  for _ in range(self.n_samples)]
        avg = sum(v.value for v in values)
        avg /= len(values)
        return [Reading(avg, 'degC', 'temp')]
    # Adding a new mode? Edit here.
    # Hope nothing breaks.`,
  "Strategy objects",
`class MeasurementStrategy(ABC):
    @abstractmethod
    def execute(self, adapter) -> list:
        ...

class SingleRead(MeasurementStrategy):
    def execute(self, adapter):
        return [adapter.read_value('temp')]

class Averaging(MeasurementStrategy):
    def execute(self, adapter):
        vals = [adapter.read_value('temp')
                for _ in range(self.n)]
        avg = sum(v.value for v in vals)
        avg /= len(vals)
        return [Reading(avg, 'degC', 'temp')]

# Adding a new mode? New class. Done.`,
  undefined, RED, GREEN
).addNotes("CODE WALKTHROUGH (5 min)\nLeft: 'if/elif sprawl. Adding a mode means editing core logic.'\nRight: 'Strategy objects. Each mode is its own class.'\nAsk: 'How many files change for BurstReadStrategy?' (One new file.)\nDraw the parallel to Adapter.");

// 36. [CODE] COMBINING ADAPTER + STRATEGY
codeSlide("Combining Adapter + Strategy",
`# The controller picks a strategy and an adapter.
# Neither knows the other's internals.

adapter = create_adapter(config)         # could be real or simulated
strategy = create_strategy(config)       # could be single, continuous, averaging

adapter.connect()
readings = strategy.execute(adapter)     # strategy uses adapter
adapter.disconnect()

# New device? New adapter class. Strategy unchanged.
# New mode?   New strategy class. Adapter unchanged.
# M strategies x N adapters, all interchangeable.`)
.addNotes("CODE WALKTHROUGH (4 min)\nThis is the synthesis slide.\n'Controller picks strategy and adapter. Neither knows the other\\'s internals.'\nM strategies x N adapters, all interchangeable.");

// 37. LAB 4
labSlide("Lab 4 \u2014 Implement Strategies", [
  "Review the strategy implementations in labmonitor/core/strategies.py",
  "Write a script that creates all three strategies",
  "Run each strategy on the same SimulatedInstrumentAdapter",
  "Show that strategies are interchangeable: write a run_strategy() function",
  "Extension: create a BurstReadStrategy or FilteredStrategy",
  "Time: 20 minutes",
]).addNotes("LAB SETUP (2 min then 20 min lab)\nShorter lab. Pattern should feel familiar.\nKey instruction: 'Write a run_strategy() that takes ANY strategy and ANY adapter.'\nExtension: create a BurstReadStrategy.");

// 38. DAY 1 RECAP
bulletSlide("Day 1 Recap", [
  "Started with a messy script, identified why it breaks",
  "Learned OOP: objects, state, responsibility, composition",
  "Identified seams in a messy driver and refactored toward clarity",
  "Built an Adapter to abstract hardware (real vs simulated)",
  "Built Strategies to abstract measurement behaviour",
  "Tomorrow: wrap all of this in a real PySide6 desktop application",
], {
  imageUrl: true,
}).addNotes("CLOSING (5 min)\nRecap: messy script, objects, seams, Adapter, Strategy.\nAsk each table to name one thing they learned.\nPreview tomorrow: 'We wrap it all in a PySide6 desktop application.'\nEnd on time.");

// ── Generate ─────────────────────────────────────────────────────────
const outPath = "C:/Users/edrz/Devfoundry/Courses/National_Labs/slides/Day1_Script_to_Architecture.pptx";
pptx.writeFile({ fileName: outPath }).then(() => {
  console.log("Created: " + outPath);
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
