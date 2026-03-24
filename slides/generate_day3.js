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
pptx.subject = "Day 3 - Data Architecture, Metadata and Performance";

// ── Helper: add dark background to every slide ──────────────────────
function darkSlide() {
  const slide = pptx.addSlide();
  slide.background = { fill: BG };
  return slide;
}

// ── Helper: section title with solid dark background ─────────────────
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
  slide.addText("Day 3, Data Architecture, Metadata and Performance", {
    x: 0.8, y: 3.0, w: 11.7, h: 0.7,
    fontSize: 24, fontFace: FONT_BODY, color: ACCENT,
  });
  slide.addText("Where the data goes, how to keep it fast", {
    x: 0.8, y: 3.8, w: 11.7, h: 0.6,
    fontSize: 16, fontFace: FONT_BODY, color: "B0B0B0",
  });
  slide.addNotes("OPENING (2 min)\nWelcome to Day 3. Final day.\n'Yesterday you had a working app. Today we answer: where does the data go? And how do we keep it fast?'");
})();

// 2. DAY 3 WELCOME
bulletSlide("Day 3 Welcome", [
  "Yesterday: a working PySide6 application with MVC and worker threads",
  "Today: where does the data go? How do we keep it fast?",
  "By end of today: a complete instrument-control system with data logging and live plotting",
]).addNotes("RECAP + PREVIEW (3 min)\nAsk: 'What's the mantra?' Students should say: 'The controller does not care.'\n'Today we apply that same principle to data output.'\nPreview: DataSink, writer thread, config, units, performance, live plotting.");

// 3. SECTION TITLE: DataSink Abstraction
sectionTitle(
  "DataSink Abstraction",
  "Decoupling data output from data production"
).addNotes("SECTION TRANSITION (30 sec)\n'Same idea as Adapter, but for output instead of input.'\nIf students are confident with Adapter by now, this section will go quickly.");

// 4. THE CONTROLLER DOES NOT CARE ABOUT DATA FORMATS
bulletSlide("The Controller Does Not Care About Data Formats", [
  "The controller produces readings",
  "It does not know whether they are written to CSV, JSON, HDF5, or /dev/null",
  "Same architectural idea as the Adapter pattern, but for output",
  "Controller sends to DataSink interface, implementations fan out",
]).addNotes("CONCEPT (3 min)\nDraw the parallel: Adapter abstracts input (hardware). DataSink abstracts output (files).\nAsk: 'Where have we seen this pattern before?' (Adapter, Strategy, same idea, different context.)\n'This is deliberate repetition. The same architectural idea solves the same structural problem everywhere.'");

// 5. [CODE] THE DATASINK INTERFACE
codeSlide("The DataSink Interface",
`from abc import ABC, abstractmethod

class DataSink(ABC):
    """The contract for all data outputs.
    Same idea as InstrumentAdapter, but for writing."""

    @abstractmethod
    def open(self, metadata: dict) -> None:
        """Prepare the output (open file, write headers)."""
        ...

    @abstractmethod
    def write(self, reading: 'Reading') -> None:
        """Write a single reading."""
        ...

    @abstractmethod
    def close(self) -> None:
        """Flush and close the output."""
        ...

# Three methods. That's the entire contract.
# Adding a new format = adding one class.`).addNotes("CODE WALKTHROUGH (4 min)\nWalk through the ABC. Three methods: open, write, close.\n'That\\'s it. Adding a new output format means adding one class.'\nAsk: 'What does open() receive?' (Metadata dict.) 'What does write() receive?' (A Reading object.)\nContrast with the messy approach: open + write header + write row + close all mixed into the acquisition loop.");

// 6. [COMPARE] CSVSINK VS JSONMETADATASINK
compareSlide(
  "CsvSink vs JsonMetadataSink",
  "CsvSink",
`class CsvSink(DataSink):
    def open(self, metadata):
        self._file = open(self._path, 'w')
        self._writer = csv.writer(self._file)
        self._writer.writerow(
            ['timestamp', 'channel', 'value', 'unit']
        )

    def write(self, reading):
        self._writer.writerow([
            reading.timestamp.isoformat(),
            reading.channel,
            f"{reading.value:.4f}",
            str(reading.unit)
        ])

    def close(self):
        self._file.close()`,
  "JsonMetadataSink",
`class JsonMetadataSink(DataSink):
    def open(self, metadata):
        self._path = self._generate_path()
        self._metadata = {
            'experiment': metadata.get('name'),
            'operator': metadata.get('operator'),
            'instrument': metadata.get('instrument_id'),
            'started': datetime.now().isoformat(),
            'config': metadata.get('config', {})
        }

    def write(self, reading):
        pass  # metadata only, not per-reading

    def close(self):
        self._metadata['stopped'] = (
            datetime.now().isoformat()
        )
        with open(self._path, 'w') as f:
            json.dump(self._metadata, f, indent=2)`,
  "Same interface, completely different purpose. CsvSink writes data rows. JsonMetadataSink writes experiment context.",
  ACCENT, ACCENT
).addNotes("CODE WALKTHROUGH (5 min)\nLeft: 'CsvSink opens a file, writes headers, appends rows. Simple and universally readable.'\nRight: 'JsonMetadataSink writes experiment context: who, what, when, which instrument, which config.'\nKey point: 'Every dataset should have a metadata file. Six months from now, you\\'ll look at data_20260324.csv and ask: what was this?'\nAsk: 'What metadata do you wish your current data files had?'");

// 7. [CODE] COMPOSITESINK — WRITING TO MULTIPLE OUTPUTS
codeSlide("CompositeSink \u2014 Writing to Multiple Outputs",
`class CompositeSink(DataSink):
    """The tee pattern: write to multiple sinks simultaneously."""

    def __init__(self, sinks: list[DataSink]):
        self.sinks = sinks

    def open(self, metadata):
        for sink in self.sinks:
            sink.open(metadata)

    def write(self, reading):
        for sink in self.sinks:
            sink.write(reading)

    def close(self):
        for sink in self.sinks:
            sink.close()

# Usage: write to CSV AND JSON metadata simultaneously
sink = CompositeSink([
    CsvSink("data/readings.csv"),
    JsonMetadataSink("data/"),
    # Add Hdf5Sink here later — no other code changes
])`).addNotes("CODE WALKTHROUGH (4 min)\nShow CompositeSink: holds a list of sinks, delegates write() to all.\nAnalogy: 'Like the Unix tee command.'\nAsk: 'What if one sink fails?' (CompositeSink should catch the exception and continue with others.)\nBottom: 'Add Hdf5Sink later, no other code changes.' Same extensibility as Adapter.");

// 8. LAB 7 — IMPLEMENT DATASINKS
labSlide("Lab 7 \u2014 Implement DataSinks", [
  "Review DataSink ABC, CsvSink, JsonMetadataSink, CompositeSink",
  "Write a test script that creates a CompositeSink (CSV + JSON metadata)",
  "Generate 20 readings using SimulatedInstrumentAdapter",
  "Write each reading to the composite sink",
  "Verify: CSV file has 20 rows, JSON file has metadata",
  "Extension: add Hdf5Sink",
  "Time: 30 minutes",
]).addNotes("LAB SETUP (2 min then 30 min lab)\nKey instruction: 'Create a CompositeSink with CSV + JSON metadata. Generate 20 readings. Verify both files.'\nCommon issues: forgetting to call open() or close(), confused about metadata dict.\nExtension: implement Hdf5Sink using h5py.");

// 9. SECTION TITLE: Writer Thread and Non-Blocking I/O
sectionTitle(
  "Writer Thread and Non-Blocking I/O",
  "Decoupling acquisition speed from disk speed"
).addNotes("SECTION TRANSITION (30 sec)\n'What happens when file I/O is too slow for the acquisition rate?'\nAsk: 'Has anyone had a data acquisition system that missed readings because it was busy writing to disk?'");

// 10. THE PROBLEM — FILE I/O BLOCKS ACQUISITION
bulletSlide("The Problem \u2014 File I/O Blocks Acquisition", [
  "Writing to disk is slow (especially CSV with flush)",
  "If the writer blocks the acquisition loop, you miss readings",
  "Solution: decouple with a queue and a dedicated writer thread",
  "Acquisition thread puts on queue, writer thread takes from queue and writes to disk",
]).addNotes("CONCEPT (3 min)\nExplain the problem: acquisition waits for disk write, misses readings.\nDraw the timeline: [read][write....][read][write....] with gaps.\nSolution: decouple with a queue. Next slide shows the code.");

// 11. [COMPARE] COUPLED VS DECOUPLED I/O
compareSlide(
  "Coupled vs Decoupled I/O",
  "Coupled: acquisition waits for disk",
`def acquisition_loop(self):
    while self.running:
        reading = self.adapter.read_value('temp')

        # BLOCKS: disk write stalls acquisition
        self.csv_file.write(reading.to_csv())
        self.csv_file.flush()
        # If disk is slow, we MISS the next reading

        time.sleep(self.interval)`,
  "Decoupled: queue absorbs bursts",
`def acquisition_loop(self):
    while self.running:
        reading = self.adapter.read_value('temp')
        self.queue.put(reading)  # instant, non-blocking
        time.sleep(self.interval)

def writer_loop(self):
    while True:
        reading = self.queue.get()  # blocks until data
        if reading is None:         # sentinel: stop
            break
        self.sink.write(reading)    # disk I/O here`,
  "The queue decouples speed: acquisition runs at instrument rate, writer runs at disk rate.",
  RED, GREEN
).addNotes("CODE WALKTHROUGH (5 min)\nLeft: 'Acquisition writes to disk in the loop. If disk is slow, we miss readings.'\nRight: 'queue.put(reading) is instant. Writer runs independently at its own pace.'\nBottom note: 'The queue absorbs bursts. If disk is temporarily slow, readings buffer in the queue.'\nAsk: 'What\\'s the advantage of a queue over direct writing?' (Acquisition never waits for disk.)");

// 12. [CODE] QUEUE-BASED ARCHITECTURE
codeSlide("Queue-Based Architecture",
`import queue
import threading

class WriterThread(threading.Thread):
    """Consumes readings from queue, writes to data sinks."""

    def __init__(self, data_queue: queue.Queue, sink: DataSink):
        super().__init__(daemon=True)
        self.queue = data_queue
        self.sink = sink

    def run(self):
        while True:
            reading = self.queue.get()
            if reading is None:    # sentinel value
                break
            self.sink.write(reading)
        self.sink.close()          # clean shutdown

# Setup
data_queue = queue.Queue()
writer = WriterThread(data_queue, composite_sink)
writer.start()

# Acquisition puts readings on queue (fast)
data_queue.put(reading)

# Shutdown: send sentinel, wait for writer to finish
data_queue.put(None)
writer.join()`).addNotes("CODE WALKTHROUGH (5 min)\nWalk through WriterThread. Key points:\n'queue.get() blocks until data arrives, so the writer sleeps when idle.'\n'None is the sentinel: put None on queue to signal shutdown.'\n'writer.join() waits for the writer to finish, so no data is lost.'\nCommon misconception: 'I need a lock.' No, queue.Queue handles locking internally.");

// 13. LAB 8 — WRITER THREAD
labSlide("Lab 8 \u2014 Writer Thread", [
  "Add a queue.Queue between acquisition worker and data sinks",
  "Create a WriterThread that consumes the queue",
  "Read 50 values, put on queue, verify CSV output",
  "Sentinel (None) for clean shutdown",
  "Time: 20 minutes",
]).addNotes("LAB SETUP (2 min then 20 min lab)\nShorter lab, the concept is simple after Lab 5.\nKey instruction: 'Use None as a sentinel for shutdown.'\nCommon issues: forgetting the sentinel, not joining the writer thread.\nTiming: 15-20 minutes. Reinforcement of the threading pattern from Day 2.");

// 14. SECTION TITLE: Units, Metadata and Configuration
sectionTitle(
  "Units, Metadata and Configuration",
  "Making data self-describing and experiments reproducible"
).addNotes("SECTION TRANSITION (30 sec)\n'Three topics that separately seem small, but together make the difference between a script and a professional tool.'\nThese three topics can be brisk, 15-20 minutes total.");

// 15. [CODE] UNITS WITH PINT
codeSlide("Units with Pint",
`from pint import UnitRegistry
ureg = UnitRegistry()

# Attach units to values — no more "is this Celsius or Fahrenheit?"
temp = 23.5 * ureg.degC
print(temp)                    # 23.5 degC
print(temp.to(ureg.degF))      # 74.3 degF
print(temp.to(ureg.kelvin))    # 296.65 kelvin

# Where units belong in the architecture:
# Adapter:  attaches units to raw values
# Model:    stores unit-aware values
# Sink:     writes units to file
# View:     formats for display

# In the adapter:
def read_value(self, channel) -> Reading:
    raw = self._parse_response(self._serial.readline())
    return Reading(
        value=raw * ureg.degC,    # unit attached here
        channel=channel,
        timestamp=datetime.now()
    )`).addNotes("CODE WALKTHROUGH (4 min)\nLive demo in REPL alongside the slide.\n'Attach units to values. No more guessing whether it\\'s Celsius or Fahrenheit.'\nAsk: 'Where should unit conversion happen?' (At the boundary. Adapter attaches. Sink writes. View formats.)\nCommon misconception: 'I\\'ll just use floats and remember.' Counter: 'Mars Climate Orbiter.'\nKeep practical: Pint is optional in labs but valuable in production.");

// 16. METADATA FOR REPRODUCIBILITY
bulletSlide("Metadata for Reproducibility", [
  "Every data file should be traceable to:",
  "who ran the experiment",
  "what instrument was used",
  "when it started and stopped",
  "what configuration was active",
  "what software version was running",
  "If you can't reproduce the experiment from the metadata, the data is an orphan",
]).addNotes("CONCEPT (3 min)\nAsk: 'Have you ever found a data file and couldn\\'t figure out what instrument produced it?'\nKey point: 'If you can\\'t reproduce the experiment from the metadata, the data is an orphan.'\nThis is professional discipline, especially important in regulated environments.");

// 17. [CODE] CONFIGURATION FILES — YAML
compareSlide(
  "Configuration Files \u2014 YAML",
  "default_config.yaml",
`device:
  type: simulated          # or "serial"
  port: COM3               # ignored if simulated
  baud_rate: 9600

acquisition:
  interval_ms: 100
  channels:
    - temperature
    - voltage

output:
  directory: ./data
  formats:
    - csv
    - json_metadata

experiment:
  name: "thermal_test_001"
  operator: "J. Smith"`,
  "Loading in Python",
`import yaml

def load_config(path: str) -> dict:
    with open(path) as f:
        return yaml.safe_load(f)

config = load_config("configs/default.yaml")

# Config drives behaviour, no code changes
adapter = create_adapter(config)
sink = create_sinks(config)
interval = config['acquisition']['interval_ms']

# Change the instrument? Edit YAML.
# Change the sample rate? Edit YAML.
# Change the output format? Edit YAML.
# The code doesn't change.`,
  undefined,
  ACCENT, ACCENT
).addNotes("CODE WALKTHROUGH (5 min)\nLeft column: walk through the YAML structure. Point out each configurable parameter.\nRight column: show how Python loads and uses it.\nDemo: change device.type from simulated to serial. 'No code changes.'\nKey point: 'Configuration turns code changes into settings changes. Safer, faster, auditable.'");

// 18. LAB 9 — CONFIGURATION AND METADATA
labSlide("Lab 9 \u2014 Configuration and Metadata", [
  "Load default_config.yaml using config_loader",
  "Create adapter and sink using factory functions",
  "Connect, read 5 values, print them",
  "Experiment: change device.type in YAML, observe the effect",
  "Time: 20 minutes",
]).addNotes("LAB SETUP (2 min then 20 min lab)\nThe real learning is experimentation: 'Change device.type in YAML. Re-run. What changed?'\nCommon issue: students who edit Python code instead of YAML. Redirect: 'The whole point is that you DON\\'T edit code.'\nQuick lab, mostly experimentation.");

// 19. SECTION TITLE: Performance Engineering
sectionTitle(
  "Performance Engineering",
  "Finding and fixing the bottlenecks that matter"
).addNotes("SECTION TRANSITION (30 sec)\nAsk: 'Who\\'s had a GUI that froze, stuttered, or couldn\\'t keep up with data?'\n'We\\'re going to diagnose the six most common problems and fix them.'");

// 20. THE SIX MOST COMMON PERFORMANCE PROBLEMS
bulletSlide("The Six Most Common Performance Problems", [
  "1. Event loop blocking: serial.read() on main thread",
  "2. Too many GUI updates: updating a label at 1000 Hz",
  "3. Wrong-thread updates: writing to QLabel from worker thread",
  "4. Slow file I/O in the acquisition loop",
  "5. Slow parsing: regex in hot loops, string formatting per reading",
  "6. No buffering: one-byte serial reads, one-row CSV writes",
]).addNotes("CONCEPT (4 min)\nWalk through each. Ask: 'Have we already solved this one?'\n1. Event loop blocking: Solved, worker thread. 2. Too many GUI updates: Not yet. 3. Wrong-thread updates: Solved, signals. 4. Slow file I/O: Solved, writer thread. 5. Slow parsing: Not yet. 6. No buffering: Not yet.\nKey insight: 'Three of six are already solved by our architecture. Good architecture IS performance engineering.'");

// 21. [CODE] DIAGNOSIS AND FIXES
codeSlide("Diagnosis and Fixes",
`# DIAGNOSIS: timing suspected hot spots
import time

t0 = time.perf_counter()
reading = adapter.read_value('temperature')
t1 = time.perf_counter()
print(f"Read took {(t1-t0)*1000:.1f} ms")

# DIAGNOSIS: queue health
print(f"Queue depth: {data_queue.qsize()}")
# If this number grows, the writer can't keep up

# ALREADY SOLVED by our architecture:
# [+] Event loop blocking     -> worker thread
# [+] Wrong-thread updates    -> signals
# [+] Slow file I/O           -> writer thread + queue

# REMAINING FIXES:
# [ ] Too many GUI updates    -> throttled QTimer
# [ ] Slow parsing            -> pure functions, avoid regex
# [ ] No buffering            -> batch writes, binary protocols`).addNotes("CODE WALKTHROUGH (4 min)\nShow diagnostic techniques: time.perf_counter(), queue.qsize().\nWalk through the checklist: three already solved, three remaining.\n'We\\'ll focus on GUI throttling, it\\'s the most impactful fix.'");

// 22. [CODE] GUI UPDATE THROTTLING
codeSlide("GUI Update Throttling",
`# BAD: update view on every signal from the worker
# At 100 Hz, this means 100 label.setText() calls per second
def on_reading(self, reading):
    self.label.setText(reading.format())  # called 100x/sec!
    self.plot.add_point(reading.value)    # 100 redraws/sec!

# GOOD: throttle with QTimer at 30 Hz (smooth, efficient)
def __init__(self):
    self._latest_reading = None

    self.display_timer = QTimer()
    self.display_timer.setInterval(33)    # ~30 Hz
    self.display_timer.timeout.connect(self._refresh_display)
    self.display_timer.start()

def on_reading(self, reading):
    self._latest_reading = reading        # just store it (fast)

def _refresh_display(self):
    if self._latest_reading:
        self.label.setText(self._latest_reading.format())
        self.plot.update()                # one redraw at 30 Hz`,
  "One change: 100 redraws/sec drops to 30. GUI goes from jerky to silky smooth."
).addNotes("CODE WALKTHROUGH (5 min)\nThis is one of the most impactful performance fixes in the course.\nTop: 'BAD: update view on every signal. 100 setText() calls per second.'\nBottom: 'GOOD: QTimer at 30 Hz. Store latest reading. Refresh at display rate.'\nAsk: 'Why 30 Hz?' (Human perception. Can\\'t see updates faster than ~25 Hz. 30 Hz is smooth. 1000 Hz is wasteful.)\nBottom note: 'One change: 100 redraws/sec drops to 30. Jerky becomes silky smooth.'");

// 23. SECTION TITLE: Real-Time Plotting with PyQtGraph
sectionTitle(
  "Real-Time Plotting with PyQtGraph",
  "Fast, Qt-native, designed for live data"
).addNotes("SECTION TRANSITION (30 sec)\nAsk: 'Who\\'s tried real-time plotting with Matplotlib?' (Groans.) 'There\\'s a better way.'");

// 24. WHY PYQTGRAPH NOT MATPLOTLIB
bulletSlide("Why PyQtGraph, Not Matplotlib", [
  "Matplotlib: excellent for static plots, too slow for real-time updates",
  "PyQtGraph: designed for real-time, Qt-native, 60+ FPS updates",
  "Embeds directly in PySide6 layouts, just add to a QVBoxLayout",
  "If your plot flickers or lags, you're using the wrong library",
]).addNotes("CONCEPT (3 min)\n'Matplotlib: excellent for static plots. Too slow for real-time.'\n'PyQtGraph: designed for real-time, Qt-native, 60+ FPS.'\nDemo: show the LabMonitor app with the plot running. Smooth scrolling, no flicker.");

// 25. [CODE] EFFICIENT REAL-TIME PLOTTING
codeSlide("Efficient Real-Time Plotting",
`import numpy as np
import pyqtgraph as pg

class LivePlotWidget(pg.GraphicsLayoutWidget):
    """Dual-channel real-time plot with ring buffer."""

    def __init__(self, buffer_size=500):
        super().__init__()
        self.buffer_size = buffer_size
        self.buffers = {
            'temperature': np.full(buffer_size, np.nan),
            'voltage': np.full(buffer_size, np.nan),
        }
        self.index = 0

        # Two plots, linked X axes
        self.temp_plot = self.addPlot(row=0, col=0, title="Temperature")
        self.volt_plot = self.addPlot(row=1, col=0, title="Voltage (V)")
        self.volt_plot.setXLink(self.temp_plot)

        self.temp_curve = self.temp_plot.plot(pen='#4FC3F7')
        self.volt_curve = self.volt_plot.plot(pen='#FFB74D')

    def add_value(self, value, channel):
        buf = self.buffers[channel]
        buf[self.index % self.buffer_size] = value
        self.index += 1

    def refresh(self):
        """Call at 30 Hz from QTimer, NOT per-reading."""
        for channel, curve in [('temperature', self.temp_curve),
                                ('voltage', self.volt_curve)]:
            curve.setData(self.buffers[channel])`).addNotes("CODE WALKTHROUGH (5 min)\nWalk through the LivePlotWidget class.\nThree key techniques: ring buffer (fixed-size numpy array), update at display rate (30 Hz), setData() replaces all data.\nAsk: 'Why two separate plots instead of one with two Y axes?' (Different scales. Temperature in C and voltage in V don\\'t share a meaningful Y axis.)\nThis is the code students will use in Lab 10.");

// 26. LAB 10 — REAL-TIME PLOT
labSlide("Lab 10 \u2014 Real-Time Plot", [
  "Add a dual-channel PyQtGraph plot to a PySide6 window",
  "Use SimulatedInstrumentAdapter to generate temperature and voltage data",
  "Ring buffer (numpy array, 500 points per channel)",
  "QTimer at 30 Hz reads from adapter and updates both traces",
  "Start/Stop buttons, smooth scrolling traces",
  "Time: 30 minutes",
]).addNotes("LAB SETUP (2 min then 30 min lab)\nThis is the most rewarding lab. Students see a live scrolling chart.\nCommon issues: QTimer not started, ring buffer not wrapping, only one channel showing.\nExtension: add a 'Performance mode' that reduces update rate.");

// 27. SECTION TITLE: Capstone Integration
sectionTitle(
  "Capstone Integration",
  "Putting every piece together"
).addNotes("SECTION TRANSITION (30 sec)\n'Let\\'s step back and see what we\\'ve built.' This is the synthesis moment.");

// 28. EVERYTHING CONNECTED
bulletSlide("Everything Connected", [
  "Your LabMonitor application now has:",
  "MVC architecture with clean separation",
  "Simulated and real adapters (interchangeable)",
  "Measurement strategies (swappable)",
  "Background acquisition worker (QThread)",
  "Data queue plus writer thread (non-blocking I/O)",
  "CSV and JSON metadata sinks (extensible)",
  "Configuration-driven behaviour (YAML)",
  "Real-time PyQtGraph plotting",
]).addNotes("SYNTHESIS (5 min)\nShow the full LabMonitor application running with all components.\nWalk through the list: each feature maps to a pattern they built themselves.\n'You didn\\'t just learn patterns in theory. You built a working application that uses all of them.'");

// 29. [CODE] CROSS-COURSE THEMES — ADDING FEATURES
codeSlide("Cross-Course Themes \u2014 Adding Features",
`# NEW MEASUREMENT MODE? Add a Strategy class.
class BurstReadStrategy(MeasurementStrategy):
    def execute(self, adapter) -> list[Reading]: ...
# Files changed: 1. Everything else: untouched.

# NEW DEVICE? Add an Adapter class.
class ModbusAdapter(InstrumentAdapter):
    def connect(self): ...
    def read_value(self, channel): ...
# Files changed: 1. Everything else: untouched.

# NEW DATA FORMAT? Add a DataSink class.
class Hdf5Sink(DataSink):
    def open(self, metadata): ...
    def write(self, reading): ...
# Files changed: 1. Everything else: untouched.

# NEW CONFIG OPTION? Edit YAML.
# Files changed: 0 (code). 1 (config).`).addNotes("SYNTHESIS (5 min)\nWalk through each extension.\nAsk: 'How many files change to add a new measurement mode?' (One.) 'A new device?' (One.) 'A new config option?' (Zero code, one config.)\n'Every change is local. Nothing ripples. This is the architectural payoff of three days of work.'");

// 30. WHAT COMES NEXT
bulletSlide("What Comes Next", [
  "Testing: start with smoke tests, grow from there",
  "Packaging: PyInstaller for distributable applications",
  "Version control: Git for team collaboration",
  "CI/CD: automated testing on commit",
  "Documentation: docstrings where they matter, not everywhere",
]).addNotes("FORWARD-LOOKING (3 min)\nBriefly touch each topic. Don\\'t go deep.\nTesting: start with smoke tests. Packaging: PyInstaller. Version control: Git. CI/CD: automated testing. Documentation: docstrings where they matter.");

// 31. COURSE COMPLETE
bulletSlide("Course Complete", [
  "Day 1: Script to Objects to Adapter to Strategy",
  "Day 2: SOLID to MVC to Error Handling to QThread to Working Application",
  "Day 3: DataSink to Writer Thread to Config to Performance to Live Plotting",
  'Key mantra: the controller does not care',
  "Add new things by adding classes, not by editing existing code",
  "Architecture makes the swap possible, configuration makes it easy",
]).addNotes("CLOSING (5 min)\nRead the 3-day summary. Let it sink in.\nSay the mantra one last time: 'The controller does not care.'\nAsk: 'What\\'s the one thing you\\'ll do differently on Monday?'\nKey message: 'Start with one pattern, probably Adapter. Separate your hardware from your logic. Everything else follows.'");

// 32. THANK YOU
(() => {
  const slide = darkSlide();
  slide.addText("From Scripts to Systems", {
    x: 0.8, y: 2.4, w: 11.7, h: 1.2,
    fontSize: 44, fontFace: FONT_TITLE, color: WHITE, bold: true,
    align: "center",
  });
  slide.addText("Feedback and questions welcome", {
    x: 0.8, y: 3.8, w: 11.7, h: 0.7,
    fontSize: 20, fontFace: FONT_BODY, color: ACCENT,
    align: "center",
  });
  slide.addNotes("CLOSING (1 min)\nThank students. Remind them: the full project code is theirs to keep.\nHand out feedback forms. Pack up.");
})();

// ── Generate ─────────────────────────────────────────────────────────
const outPath = "C:/Users/edrz/Devfoundry/Courses/National_Labs/slides/Day3_Data_and_Performance.pptx";
pptx.writeFile({ fileName: outPath }).then(() => {
  console.log("Created: " + outPath);
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
