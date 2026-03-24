"""Lab 5 Solution: QThread + Worker pattern demo.

A minimal PySide6 application that uses a background QThread
to read from a SimulatedInstrumentAdapter and display readings
in the GUI via signals.

Run:
    python worker_demo.py
"""

import sys
import os
import time

# Add the labmonitor package to sys.path so we can import its modules.
_project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
_labmonitor_root = os.path.join(_project_root, "labmonitor")
sys.path.insert(0, _labmonitor_root)

from PySide6.QtCore import QObject, QThread, Signal
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget,
    QVBoxLayout, QLabel, QPushButton, QHBoxLayout,
)

from drivers.simulated import SimulatedInstrumentAdapter
from core.reading import Reading


# ---------------------------------------------------------------------------
# Worker
# ---------------------------------------------------------------------------

class AcquisitionWorker(QObject):
    """Background worker that reads from an instrument adapter.

    Signals:
        reading_ready(object)  -- emits a Reading each cycle
        error_occurred(str)    -- emits an error message string
        finished()             -- emits when the acquisition loop exits
    """

    reading_ready = Signal(object)
    error_occurred = Signal(str)
    finished = Signal()

    def __init__(self, adapter, interval_ms=500, channel="temperature"):
        super().__init__()
        self._adapter = adapter
        self._interval_s = interval_ms / 1000.0
        self._channel = channel
        self._running = False

    def start_acquisition(self):
        """Main loop -- invoked on the QThread."""
        self._running = True
        while self._running:
            try:
                reading = self._adapter.read_value(self._channel)
                self.reading_ready.emit(reading)
            except Exception as exc:
                self.error_occurred.emit(str(exc))
            time.sleep(self._interval_s)
        self.finished.emit()

    def stop(self):
        self._running = False


# ---------------------------------------------------------------------------
# Main Window
# ---------------------------------------------------------------------------

class DemoWindow(QMainWindow):
    """Simple window with a reading label, Start button, and Stop button."""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("Lab 5 -- Worker Demo")
        self.resize(400, 150)

        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)

        self.reading_label = QLabel("Press Start to begin acquisition")
        self.reading_label.setStyleSheet("font-size: 18px; padding: 10px;")
        layout.addWidget(self.reading_label)

        btn_layout = QHBoxLayout()
        self.start_btn = QPushButton("Start")
        self.stop_btn = QPushButton("Stop")
        self.stop_btn.setEnabled(False)
        btn_layout.addWidget(self.start_btn)
        btn_layout.addWidget(self.stop_btn)
        layout.addLayout(btn_layout)

        # Instrument adapter (created once, reused across start/stop cycles)
        self._adapter = SimulatedInstrumentAdapter(noise=0.15, frequency=0.1)
        self._adapter.connect()

        self._thread = None
        self._worker = None

        # Connect button signals
        self.start_btn.clicked.connect(self._on_start)
        self.stop_btn.clicked.connect(self._on_stop)

    # -- Controller logic ---------------------------------------------------

    def _on_start(self):
        self._thread = QThread()
        self._worker = AcquisitionWorker(self._adapter, interval_ms=500)

        self._worker.moveToThread(self._thread)

        # Wire signals
        self._thread.started.connect(self._worker.start_acquisition)
        self._worker.reading_ready.connect(self._on_reading)
        self._worker.error_occurred.connect(self._on_error)
        self._worker.finished.connect(self._thread.quit)

        self._thread.start()
        self.start_btn.setEnabled(False)
        self.stop_btn.setEnabled(True)

    def _on_stop(self):
        if self._worker:
            self._worker.stop()
        if self._thread:
            self._thread.quit()
            self._thread.wait()
        self.start_btn.setEnabled(True)
        self.stop_btn.setEnabled(False)
        self.reading_label.setText("Stopped")

    # -- Slot callbacks -----------------------------------------------------

    def _on_reading(self, reading):
        self.reading_label.setText(str(reading))

    def _on_error(self, message):
        self.reading_label.setText(f"ERROR: {message}")

    # -- Clean shutdown on close -------------------------------------------

    def closeEvent(self, event):
        self._on_stop()
        self._adapter.disconnect()
        event.accept()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = DemoWindow()
    window.show()
    sys.exit(app.exec())
