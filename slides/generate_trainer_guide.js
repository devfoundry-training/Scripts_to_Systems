const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat,
} = require("docx");

// ── Helpers ──────────────────────────────────────────────────────────────

const border = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorders = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };
const headerShading = { fill: "2E3440", type: ShadingType.CLEAR };
const altShading = { fill: "F5F5F5", type: ShadingType.CLEAR };
const labShading = { fill: "E8F5E9", type: ShadingType.CLEAR };

function cell(text, opts = {}) {
  const runs = Array.isArray(text)
    ? text
    : [new TextRun({ text, size: opts.size || 20, bold: !!opts.bold, font: "Calibri", color: opts.color || "000000" })];
  return new TableCell({
    borders,
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts.shading,
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({ alignment: opts.align || AlignmentType.LEFT, children: runs })],
  });
}

function headerCell(text, width) {
  return cell(text, { bold: true, color: "FFFFFF", shading: headerShading, width, size: 20 });
}

function timingRow(time, length, topic, shading) {
  const isLab = topic.startsWith("Lab ");
  const sh = isLab ? labShading : shading;
  return new TableRow({
    children: [
      cell(time, { width: 1200, shading: sh }),
      cell(length, { width: 1200, shading: sh }),
      cell(topic, { width: 6960, shading: sh, bold: isLab }),
    ],
  });
}

function scheduleRow(time, details, resource, shading) {
  return new TableRow({
    children: [
      cell(time, { width: 1400, shading }),
      cell(details, { width: 6560, shading }),
      cell(resource, { width: 1400, shading }),
    ],
  });
}

function scheduleHeaderRow() {
  return new TableRow({
    children: [
      headerCell("Time", 1400),
      headerCell("Details", 6560),
      headerCell("Resource", 1400),
    ],
  });
}

function heading(text, level) {
  return new Paragraph({ heading: level, spacing: { before: 300, after: 150 }, children: [new TextRun({ text, font: "Calibri" })] });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, size: 22, font: "Calibri", bold: !!opts.bold, italics: !!opts.italics })],
  });
}

function spacer() {
  return new Paragraph({ spacing: { after: 80 }, children: [] });
}

// ── Agenda tables ────────────────────────────────────────────────────────

function agendaTable(rows) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1200, 1200, 6960],
    rows: [
      new TableRow({ children: [headerCell("Time", 1200), headerCell("Length", 1200), headerCell("Topic", 6960)] }),
      ...rows.map((r, i) => timingRow(r[0], r[1], r[2], i % 2 === 1 ? altShading : undefined)),
    ],
  });
}

// ── Schedule detail tables ───────────────────────────────────────────────

function scheduleTable(rows) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1400, 6560, 1400],
    rows: [
      scheduleHeaderRow(),
      ...rows.map((r, i) => scheduleRow(r[0], r[1], r[2], i % 2 === 1 ? altShading : undefined)),
    ],
  });
}

// ── Build Document ───────────────────────────────────────────────────────

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Calibri" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Calibri" },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Calibri" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [
    // ── TITLE PAGE ──
    {
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
      },
      children: [
        spacer(), spacer(), spacer(), spacer(), spacer(), spacer(), spacer(), spacer(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "FROM SCRIPTS TO SYSTEMS", size: 52, bold: true, font: "Calibri" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Python Application Architecture for Instrument Control", size: 28, font: "Calibri" })] }),
        spacer(), spacer(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "TRAINER GUIDE", size: 36, bold: true, font: "Calibri" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Course version 1.0", size: 24, font: "Calibri" })] }),
        spacer(), spacer(), spacer(), spacer(), spacer(), spacer(),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "3-Day Instructor-Led Course", size: 22, font: "Calibri", italics: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Simulator-First Delivery", size: 22, font: "Calibri", italics: true })] }),
      ],
    },

    // ── MAIN CONTENT ──
    {
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
      },
      headers: {
        default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "From Scripts to Systems \u2014 Trainer Guide", size: 18, font: "Calibri", color: "888888", italics: true })] })] }),
      },
      footers: {
        default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Page ", size: 18, font: "Calibri", color: "888888" }), new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Calibri", color: "888888" })] })] }),
      },
      children: [

        // ── Overview ──
        heading("Overview", HeadingLevel.HEADING_1),
        para("This three-day instructor-led course provides engineers who write Python for instrument control, data acquisition, and monitoring with the knowledge and skills to move from script-level programming toward maintainable desktop applications. The course is simulator-first \u2014 no real hardware is required for any delegate. One optional demonstration rig may be used by the instructor."),
        spacer(),
        para("The timings below are approximate depending on the experience level of your group, questions asked, and issues encountered.", { italics: true }),

        // ── Course Agenda ──
        heading("Course Agenda", HeadingLevel.HEADING_1),
        para("Day 1: From Script to Architecture (OOP, Seams, Adapter Pattern, Strategy Pattern)", { bold: true }),
        para("Day 2: Application Programming (SOLID, MVC, Error Handling, QThread Workers, Mini-App)", { bold: true }),
        para("Day 3: Data Architecture, Metadata and Performance (DataSink, Writer Thread, Config, Performance, PyQtGraph)", { bold: true }),

        // ── Resources ──
        heading("Resources", HeadingLevel.HEADING_1),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "examples/ \u2014 messy starter scripts for Labs 1 and 2", size: 22, font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "labmonitor/ \u2014 the complete project codebase", size: 22, font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "labs/ \u2014 lab instructions and starter skeletons (Labs 5 and 10)", size: 22, font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "solutions/ \u2014 reference solutions for all 10 labs", size: 22, font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "docs/simulator_guide.md \u2014 full simulator reference", size: 22, font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "trainer_slides/ \u2014 PowerPoint decks with speaker notes", size: 22, font: "Calibri" })] }),

        // ══════════════════════════════════════════════════════════════
        // DAY 1 AGENDA
        // ══════════════════════════════════════════════════════════════
        new Paragraph({ children: [new PageBreak()] }),
        heading("Agenda and Timings \u2014 Day 1", HeadingLevel.HEADING_1),
        para("From Script to Architecture", { bold: true }),
        agendaTable([
          ["09:30", "30 min", "Introductions and Welcome"],
          ["10:00", "30 min", "Why Scripts Break, The Goal"],
          ["10:30", "15 min", "Break"],
          ["10:45", "45 min", "OOP from Scratch (Functions vs Classes, Objects, State, Responsibility)"],
          ["11:30", "30 min", "Lab 1 \u2014 From Script to Classes"],
          ["12:00", "15 min", "Lab 1 Debrief, Composition vs Inheritance"],
          ["12:15", "45 min", "Lunch"],
          ["13:00", "30 min", "The Messy Driver, Seams, Refactoring Toward Clarity"],
          ["13:30", "30 min", "Lab 2 \u2014 Refactor the Messy Driver"],
          ["14:00", "15 min", "Lab 2 Debrief"],
          ["14:15", "15 min", "Break"],
          ["14:30", "30 min", "The Adapter Pattern (Interface, Simulated vs Real, Swapping)"],
          ["15:00", "30 min", "Lab 3 \u2014 Build the Adapter"],
          ["15:30", "15 min", "Lab 3 Debrief, Strategy Pattern Introduction"],
          ["15:45", "20 min", "Lab 4 \u2014 Implement Strategies"],
          ["16:05", "10 min", "Lab 4 Debrief"],
          ["16:15", "15 min", "Day 1 Recap and Wrap Up"],
        ]),

        // ── DAY 1 EXPECTED PROGRESS ──
        spacer(),
        heading("Expected Student Progress \u2014 End of Day 1", HeadingLevel.HEADING_2),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Can explain why monolithic scripts become unmaintainable", size: 22, font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Can identify responsibilities in messy code and split them into classes", size: 22, font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Can explain the Adapter pattern and why it matters for instrument code", size: 22, font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Can use the SimulatedInstrumentAdapter through the interface", size: 22, font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Can explain Strategy pattern and write a run_strategy() function that works with any strategy", size: 22, font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Understands \"the controller does not care\" as an architectural principle", size: 22, font: "Calibri" })] }),

        // ══════════════════════════════════════════════════════════════
        // DAY 1 DETAILED SCHEDULE
        // ══════════════════════════════════════════════════════════════
        new Paragraph({ children: [new PageBreak()] }),
        heading("Training Schedule \u2014 Day 1", HeadingLevel.HEADING_1),
        scheduleTable([
          ["09:30\n30 min",
           "Introduction and Welcome\nIntroduce yourself and welcome everyone. Ask learners to introduce themselves: name, company, what instruments they work with, what they hope to get from the course. Run through objectives using slides. Emphasise simulator-first delivery. Ice-breaker: \"Who here has a Python script that started small and grew into something terrifying?\"",
           "Day 1\nslides 1\u20133"],
          ["10:00\n30 min",
           "Why Scripts Break\nShow examples/messy_script.py on screen. Don\u2019t read it line by line. Say: \"This works. For a one-off job, it\u2019s fine. So when does it stop being fine?\" Read the \"A Script That Breaks\" slide, pause after each bullet: \"Has this happened to you?\" Give 2\u20133 minutes for open discussion. This is the emotional hook. Formalise the structural problems. Show architecture preview briefly. Introduce \"the controller does not care\" casually.",
           "Day 1\nslides 4\u20137"],
          ["10:30\n15 min", "Break", ""],
          ["10:45\n45 min",
           "OOP from Scratch\nFour concept slides, each followed by a code comparison. Walk both columns on each. Slide 10 (functions vs classes): \"Left: stateless transform, perfect as a function. Right: has state, belongs in a class.\" Slide 14 (responsibility): \"Left: three reasons to change. Right: each class has one job.\" This is the slide students remember. Spend the time. Slide 16 (composition): \"Inheritance appears once in this course: the Adapter interface. Everything else is composition.\" Close with nouns/verbs exercise live. Gauge the room: experienced groups move briskly, beginners slow down on responsibility.",
           "Day 1\nslides 8\u201317"],
          ["11:30\n30 min",
           "Lab 1 \u2014 From Script to Classes\nPoint to examples/messy_script.py and labs/lab01_instructions.md. Say: \"Find 3 responsibilities, give each a class.\" Walk the room. Common issues: students who freeze (suggest nouns), too many classes, where main() goes, classes that are just namespaces. Allow full 30 minutes. Pair struggling students.",
           "messy_script.py\nlab01"],
          ["12:00\n15 min",
           "Lab 1 Debrief\nAsk 2\u20133 students to share class names. Good answers: InstrumentReader, DataRecorder, ReadingFormatter. Bridge: \"Now let\u2019s look at real instrument code and find the patterns.\"",
           "Day 1\nslide 19"],
          ["12:15\n45 min", "Lunch", ""],
          ["13:00\n30 min",
           "The Messy Driver, Seams, Refactoring\nPost-lunch is low energy. Start with the messy driver demo. Scroll through slowly. Point out hardcoded port, mixed concerns, scattered error handling, print statements in the driver. Define seam: \"A point where you can change behaviour without editing surrounding code.\" Walk through seam annotation slide. Then before/after refactoring: \"I didn\u2019t change what the code does, I changed how it\u2019s organised.\"",
           "Day 1\nslides 20\u201324"],
          ["13:30\n30 min",
           "Lab 2 \u2014 Refactor the Messy Driver\nKey instruction: \"Keep the FakeSerial class unchanged.\" Harder than Lab 1 \u2014 allow full 30 minutes. Common issues: only extracting one piece (need transport AND parsing), not making transport substitutable, leaving print() in the driver. Pair students if needed.",
           "messy_driver.py\nlab02"],
          ["14:00\n15 min",
           "Lab 2 Debrief\nKey insight: \"Separating transport from protocol makes everything testable.\" Bridge: \"What you just did informally has a name. It\u2019s called the Adapter pattern.\"",
           "Day 1\nslides 25\u201326"],
          ["14:15\n15 min", "Break", ""],
          ["14:30\n30 min",
           "The Adapter Pattern\nThis is the single most important slide sequence in the course. Draw the diagram: Application \u2192 InstrumentAdapter (interface) \u2192 Real OR Simulated. Walk through the ABC \u2014 five methods. Walk both columns of simulated vs real comparison. Show factory function. Key phrases: \"The controller does not care.\" \"Architecture makes the swap possible, configuration makes it easy.\" If you have a demo rig, show the same script on both.",
           "Day 1\nslides 27\u201331"],
          ["15:00\n30 min",
           "Lab 3 \u2014 Build the Adapter\nStudents work with labmonitor/ for the first time. Point to docs/simulator_guide.md. Key instruction: \"Use the adapter through the interface only.\" Extension: toggle error modes.",
           "simulated.py\nlab03"],
          ["15:30\n15 min",
           "Lab 3 Debrief + Strategy Introduction\nDemo: same script, two adapters, identical code. Say the mantra. Then introduce Strategy (slides 34\u201336): if/elif sprawl vs Strategy objects. Show Adapter + Strategy combination.",
           "Day 1\nslides 33\u201336"],
          ["15:45\n20 min",
           "Lab 4 \u2014 Implement Strategies\nShorter lab, pattern should feel familiar. Key instruction: \"Write a run_strategy() that takes ANY strategy and ANY adapter.\" Extension: BurstReadStrategy.",
           "lab04"],
          ["16:05\n10 min",
           "Lab 4 Debrief\n\"How many files change for BurstReadStrategy?\" (One.) \"M strategies \u00d7 N adapters, all interchangeable.\"",
           "Day 1\nslide 37"],
          ["16:15\n15 min",
           "Day 1 Recap and Wrap Up\nRecap: messy script \u2192 objects \u2192 seams \u2192 Adapter \u2192 Strategy. Ask each table to name one thing they learned. Preview tomorrow: \"We wrap it all in a PySide6 desktop application.\"",
           "Day 1\nslide 38"],
        ]),

        // ══════════════════════════════════════════════════════════════
        // DAY 2 AGENDA
        // ══════════════════════════════════════════════════════════════
        new Paragraph({ children: [new PageBreak()] }),
        heading("Agenda and Timings \u2014 Day 2", HeadingLevel.HEADING_1),
        para("Application Programming: SOLID, MVC, and Asynchronous Work", { bold: true }),
        agendaTable([
          ["09:30", "15 min", "Welcome and Day 1 Recap"],
          ["09:45", "30 min", "SOLID in Instrument Code (Violations, Fixes, Coupling)"],
          ["10:15", "15 min", "Break"],
          ["10:30", "30 min", "MVC for Instrument Applications (Model, View, Controller)"],
          ["11:00", "30 min", "PySide6 Crash Course (Minimal Window, Layouts, Signals/Slots)"],
          ["11:30", "30 min", "Error Handling Patterns (Timeouts, Retries, Propagation)"],
          ["12:00", "45 min", "Lunch"],
          ["12:45", "30 min", "QThread + Worker Pattern (Why threads, blocking vs threaded)"],
          ["13:15", "20 min", "Starting and Stopping Cleanly, Signal/Slot Communication"],
          ["13:35", "35 min", "Lab 5 \u2014 Worker Thread"],
          ["14:10", "15 min", "Break"],
          ["14:25", "10 min", "Lab 5 Debrief"],
          ["14:35", "70 min", "Lab 6 \u2014 Mini-App Build (phased: review, understand, run, modify)"],
          ["15:45", "15 min", "Lab 6 Debrief"],
          ["16:00", "30 min", "Day 2 Recap and Wrap Up"],
        ]),

        spacer(),
        heading("Expected Student Progress \u2014 End of Day 2", HeadingLevel.HEADING_2),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Can identify SOLID violations in instrument code and explain fixes", size: 22, font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Can describe Model, View, Controller roles in an instrument application", size: 22, font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Can build a minimal PySide6 window with widgets, layouts, and signal/slot connections", size: 22, font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Can implement a QThread + Worker pattern for background acquisition", size: 22, font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Can run the LabMonitor application and trace data flow through the layers", size: 22, font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Understands why GUI-thread blocking is dangerous and how signals fix it", size: 22, font: "Calibri" })] }),

        // ── DAY 2 DETAILED SCHEDULE ──
        new Paragraph({ children: [new PageBreak()] }),
        heading("Training Schedule \u2014 Day 2", HeadingLevel.HEADING_1),
        scheduleTable([
          ["09:30\n15 min",
           "Welcome and Day 1 Recap\nAsk volunteers to explain Adapter and Strategy in one sentence each. Transition: \"Let\u2019s start with why coupling hardware to the GUI is a terrible idea.\"",
           "Day 2\nslides 1\u20132"],
          ["09:45\n30 min",
           "SOLID in Instrument Code\nWalk through annotated code (slide 5) with SRP, OCP, DIP violations marked. Ask: \"Which pattern from yesterday fixes DIP?\" (Adapter.) Map each SOLID letter to instrument examples. Show coupled vs decoupled comparison. Don\u2019t belabour Liskov.",
           "Day 2\nslides 3\u20139"],
          ["10:15\n15 min", "Break", ""],
          ["10:30\n30 min",
           "MVC for Instrument Applications\nModel = data/state, View = PySide6 GUI, Controller = orchestrator. Walk through MVC code slide \u2014 all three sections. Rules: \"Model knows nothing about Qt. View knows nothing about hardware. Controller connects them.\"",
           "Day 2\nslides 10\u201312"],
          ["11:00\n30 min",
           "PySide6 Crash Course\nLIVE-CODE the minimal window. Type it out, don\u2019t just show the slide. Run it: window appears, click button, label updates. Ask: \"What\u2019s the signal? What\u2019s the slot?\" This is the only section where live coding is essential. Spend the full time.",
           "Day 2\nslides 13\u201314"],
          ["11:30\n30 min",
           "Error Handling Patterns\nThree patterns: timeout with default, retry with backoff, error propagation. Walk through code for each. Ask: \"Which pattern for a jiggled cable?\" (Retry.) Demo simulator error modes live.",
           "Day 2\nslides 15\u201318"],
          ["12:00\n45 min", "Lunch", ""],
          ["12:45\n30 min",
           "QThread + Worker Pattern\nHardest section of Day 2. Slow down. Demo: GUI that calls time.sleep(3) in a button handler \u2014 window goes grey. Show blocking vs threaded comparison. Walk through Worker class: every part matters. \"NEVER update GUI widgets from this class.\"",
           "Day 2\nslides 19\u201322"],
          ["13:15\n20 min",
           "Starting/Stopping Cleanly, Signal/Slot\nShow start sequence: create thread, worker, moveToThread, connect signals, start. Show stop: worker.stop(), thread.quit(), thread.wait(). CRITICAL: \"Always stop threads in closeEvent().\" Common mistake: calling thread.terminate() \u2014 dangerous.",
           "Day 2\nslides 23\u201324"],
          ["13:35\n35 min",
           "Lab 5 \u2014 Worker Thread\nPoint to labs/lab05_starter.py. \"The window and buttons are done. You fill in the worker signals, the loop, and the threading wiring.\" Walk the room actively. Common issues: signal not connected, forgot closeEvent, uncaught exception. Most important lab of Day 2. If it takes 40 min, that\u2019s fine.",
           "lab05_starter.py\nlab05"],
          ["14:10\n15 min", "Break", ""],
          ["14:25\n10 min",
           "Lab 5 Debrief\nDemo: Start \u2192 readings flow \u2192 Stop \u2192 Start again. Set error mode on simulator: error signal fires, app stays alive. \"The pattern is always the same: create worker, moveToThread, connect signals, start.\"",
           "Day 2\nslides 25\u201326"],
          ["14:35\n70 min",
           "Lab 6 \u2014 Mini-App Build\nBreak into phases. Phase 1 (10 min): read project structure. Phase 2 (15 min): trace GUI code. Phase 3 (15 min): trace Controller. Phase 4 (15 min): run it. Phase 5 (15 min): modify something. Mostly reading and understanding, not writing. If behind, skip Phase 6 and demo it. Walk room at each phase transition.",
           "labmonitor/\nlab06"],
          ["15:45\n15 min",
           "Lab 6 Debrief\nShow running app. \"Where is the Model? View? Controller?\" Trace a reading from adapter through controller to view. \"What would you change to add voltage display?\" (Only the view.)",
           "Day 2\nslide 29"],
          ["16:00\n30 min",
           "Day 2 Recap and Wrap Up\nRecap: SOLID \u2192 MVC \u2192 Error handling \u2192 QThread \u2192 Working app. Preview tomorrow: data, config, performance, live plotting. \"The controller does not care about data formats either.\"",
           "Day 2\nslide 30"],
        ]),

        // ══════════════════════════════════════════════════════════════
        // DAY 3 AGENDA
        // ══════════════════════════════════════════════════════════════
        new Paragraph({ children: [new PageBreak()] }),
        heading("Agenda and Timings \u2014 Day 3", HeadingLevel.HEADING_1),
        para("Data Architecture, Metadata and Performance", { bold: true }),
        agendaTable([
          ["09:30", "15 min", "Welcome and Day 2 Recap"],
          ["09:45", "25 min", "DataSink Abstraction (Interface, CsvSink, JsonMetadataSink, CompositeSink)"],
          ["10:10", "30 min", "Lab 7 \u2014 Implement DataSinks"],
          ["10:40", "15 min", "Break"],
          ["10:55", "20 min", "Writer Thread and Non-Blocking I/O (Queue-Based Decoupling)"],
          ["11:15", "20 min", "Lab 8 \u2014 Writer Thread"],
          ["11:35", "25 min", "Units with Pint, Metadata for Reproducibility, Configuration Files"],
          ["12:00", "20 min", "Lab 9 \u2014 Configuration and Metadata"],
          ["12:20", "45 min", "Lunch"],
          ["13:05", "25 min", "Performance Engineering (Six Problems, Diagnosis, GUI Throttling)"],
          ["13:30", "15 min", "Real-Time Plotting with PyQtGraph"],
          ["13:45", "30 min", "Lab 10 \u2014 Real-Time Plot"],
          ["14:15", "15 min", "Break"],
          ["14:30", "10 min", "Lab 10 Debrief"],
          ["14:40", "20 min", "Capstone Integration (Everything Connected, Cross-Course Themes)"],
          ["15:00", "15 min", "What Comes Next"],
          ["15:15", "15 min", "Course Complete, Feedback"],
        ]),

        spacer(),
        heading("Expected Student Progress \u2014 End of Day 3", HeadingLevel.HEADING_2),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Can implement DataSink interface and write to multiple formats simultaneously", size: 22, font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Can decouple acquisition from disk I/O using a queue and writer thread", size: 22, font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Can load configuration from YAML and change behaviour without editing code", size: 22, font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Can diagnose common performance problems and apply GUI throttling", size: 22, font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Can build a real-time scrolling plot with PyQtGraph", size: 22, font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Can explain how to extend the system (new device, new format, new mode) by adding one class", size: 22, font: "Calibri" })] }),

        // ── DAY 3 DETAILED SCHEDULE ──
        new Paragraph({ children: [new PageBreak()] }),
        heading("Training Schedule \u2014 Day 3", HeadingLevel.HEADING_1),
        scheduleTable([
          ["09:30\n15 min",
           "Welcome and Day 2 Recap\nAsk: \"What\u2019s the mantra?\" Students should say: \"The controller does not care.\" Preview: DataSink, writer thread, config, performance, plotting.",
           "Day 3\nslides 1\u20132"],
          ["09:45\n25 min",
           "DataSink Abstraction\nDraw the parallel: Adapter abstracts input, DataSink abstracts output. Walk through ABC \u2014 three methods: open, write, close. Show CsvSink vs JsonMetadataSink side-by-side. \"Every dataset should have a metadata file.\" Show CompositeSink. If students are comfortable with Adapter, this goes quickly \u2014 same pattern, new context.",
           "Day 3\nslides 3\u20137"],
          ["10:10\n30 min",
           "Lab 7 \u2014 Implement DataSinks\n\"Create a CompositeSink with CSV + JSON metadata. Generate 20 readings. Verify both files.\" Common issues: forgetting open() or close(), confused about metadata dict. Extension: Hdf5Sink.",
           "lab07"],
          ["10:40\n15 min", "Break", ""],
          ["10:55\n20 min",
           "Writer Thread and Non-Blocking I/O\nExplain: acquisition waits for disk write, misses readings. Show coupled vs decoupled comparison. Walk through WriterThread. \"queue.get() blocks until data arrives.\" \"None is the sentinel.\" Common misconception: \"I need a lock.\" No, queue.Queue handles it.",
           "Day 3\nslides 9\u201312"],
          ["11:15\n20 min",
           "Lab 8 \u2014 Writer Thread\nShorter lab, simple after Lab 5. \"Use None as a sentinel for shutdown.\" Common issues: forgetting sentinel, not joining writer thread. 15\u201320 minutes.",
           "lab08"],
          ["11:35\n25 min",
           "Units, Metadata, Configuration\nThree topics, brisk pace. Pint: live demo in REPL. \"No more guessing Celsius vs Fahrenheit.\" Metadata: \"If you can\u2019t reproduce the experiment, the data is an orphan.\" Config YAML: demo changing device.type. \"No code changes.\"",
           "Day 3\nslides 14\u201317"],
          ["12:00\n20 min",
           "Lab 9 \u2014 Configuration and Metadata\nQuick lab, mostly experimentation. \"Change device.type in YAML. Re-run. What changed?\" Common issue: editing Python instead of YAML. Redirect: \"The whole point is you DON\u2019T edit code.\"",
           "lab09"],
          ["12:20\n45 min", "Lunch", ""],
          ["13:05\n25 min",
           "Performance Engineering\nSix problems. Ask: \"Have we already solved this one?\" Three of six are solved by the architecture. \"Good architecture IS performance engineering.\" Show diagnostics: perf_counter(), qsize(). Focus on GUI throttling \u2014 most impactful fix. \"Why 30 Hz? Can\u2019t see faster than 25 Hz.\"",
           "Day 3\nslides 19\u201322"],
          ["13:30\n15 min",
           "Real-Time Plotting with PyQtGraph\n\"Who\u2019s tried Matplotlib for real-time?\" Show LabMonitor plot running. Walk through LivePlotWidget: ring buffer, display-rate updates, setData(). \"Why two plots?\" (Different scales.)",
           "Day 3\nslides 23\u201325"],
          ["13:45\n30 min",
           "Lab 10 \u2014 Real-Time Plot\nPoint to labs/lab10_starter.py. Window and plot widget ready \u2014 fill in QTimer and data feed TODOs. Most rewarding lab: live scrolling chart. Common issues: QTimer not started, only one channel showing. Extension: Clear button.",
           "lab10_starter.py\nlab10"],
          ["14:15\n15 min", "Break", ""],
          ["14:30\n10 min",
           "Lab 10 Debrief\nShow running plot. \"Update rate?\" (30 Hz.) \"Data rate?\" (Could be 1000 Hz.) \"Where\u2019s the throttling?\" (QTimer.)",
           "Day 3\nslide 26"],
          ["14:40\n20 min",
           "Capstone Integration\nShow full LabMonitor with all components. Walk through \"Everything Connected\" list. \"How many files change to add a new mode?\" (One.) \"A new device?\" (One.) \"A new config option?\" (Zero code, one config.)",
           "Day 3\nslides 27\u201329"],
          ["15:00\n15 min",
           "What Comes Next\nBriefly: testing (smoke tests), packaging (PyInstaller), Git, CI/CD, documentation. Don\u2019t go deep \u2014 plant seeds.",
           "Day 3\nslide 30"],
          ["15:15\n15 min",
           "Course Complete and Feedback\nSay the mantra one last time. \"What\u2019s the one thing you\u2019ll do differently on Monday?\" \"Start with Adapter. Separate hardware from logic. Everything else follows.\" Full project code is theirs to keep. Feedback forms.",
           "Day 3\nslides 31\u201332"],
        ]),

        // ══════════════════════════════════════════════════════════════
        // FALLBACK PLANS
        // ══════════════════════════════════════════════════════════════
        new Paragraph({ children: [new PageBreak()] }),
        heading("Fallback Plans", HeadingLevel.HEADING_1),

        heading("If PySide6 setup fails", HeadingLevel.HEADING_2),
        para("Have students pair with a neighbour. As a last resort, teach MVC and threading concepts with console-only examples. The Adapter, Strategy, and DataSink patterns work without a GUI."),

        heading("If hardware is unavailable", HeadingLevel.HEADING_2),
        para("This is the default. The entire course runs on the simulator. Use the instructor rig for demos only if available."),

        heading("If a student is ahead", HeadingLevel.HEADING_2),
        para("Every lab has extension tasks. Labs 3, 4, 7, and 10 have good stretch goals (error modes, BurstReadStrategy, Hdf5Sink, Clear button)."),

        heading("If a student is behind", HeadingLevel.HEADING_2),
        para("Labs 1\u20134 are the foundation. If struggling, prioritise these. Labs 7\u20139 can be demonstrated instead of hands-on if time is tight."),

        heading("If the class is running slow", HeadingLevel.HEADING_2),
        para("Day 3 afternoon has the most flex. Capstone Integration can be a 5-minute demo. \"What Comes Next\" can be cut entirely."),

        heading("If the class is running fast", HeadingLevel.HEADING_2),
        para("Use optional modules: testing, logging panel, config validation, safe mode, micro code review habits. Each is 20\u201345 minutes."),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  const outPath = "../docs/Trainer_Guide.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("Trainer guide written to " + outPath);
});
