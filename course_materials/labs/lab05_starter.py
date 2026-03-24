"""
Lab 5 Starter: Worker Thread
==============================
This skeleton gives you a PySide6 window with Start/Stop buttons
and a label ready to display readings.

YOUR TASK:
  1. Complete the AcquisitionWorker class (see TODOs below)
  2. Wire up _on_start() to create a QThread and worker
  3. Wire up _on_stop() to stop the worker cleanly
  4. Make sure the app shuts down cleanly (closeEvent)

HINT: See the slides for the Worker + moveToThread pattern.
"""

import sys
import os
import time

# -- Path setup so we can import from labmonitor/ --
_project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
_labmonitor_root = os.path.join(_project_root, "labmonitor")
sys.path.insert(0, _labmonitor_root)

from PySide6.QtCore import QObject, QThread, Signal
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget,
    QVBoxLayout, QLabel, QPushButton, QHBoxLayout,
)

from drivers.simulated import SimulatedInstrumentAdapter


# ---------------------------------------------------------------------------
# TODO 1: Complete the Worker
# ---------------------------------------------------------------------------

class AcquisitionWorker(QObject):
    """Runs on a background thread. Reads from the adapter in a loop."""

    # TODO: Define three signals:
    #   reading_ready = Signal(object)   -- emits a Reading
    #   error_occurred = Signal(str)     -- emits an error message
    #   finished = Signal()              -- emits when the loop exits

    def __init__(self, adapter, interval_ms=500):
        super().__init__()
        self._adapter = adapter
        self._interval_s = interval_ms / 1000.0
        self._running = False

    def start_acquisition(self):
        """Main loop. Called when the thread starts."""
        self._running = True
        while self._running:
            # TODO: Try to read a value from self._adapter
            #       If successful, emit reading_ready
            #       If an exception occurs, emit error_occurred
            #       Sleep for self._interval_s between reads
            pass
        # TODO: Emit finished when the loop ends

    def stop(self):
        """Call from the main thread to stop the loop."""
        self._running = False


# ---------------------------------------------------------------------------
# Main Window (mostly complete, you wire up the threading)
# ---------------------------------------------------------------------------

class DemoWindow(QMainWindow):
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

        # Adapter (created once, reused)
        self._adapter = SimulatedInstrumentAdapter(noise=0.15, frequency=0.1)
        self._adapter.connect()

        self._thread = None
        self._worker = None

        # Connect button signals
        self.start_btn.clicked.connect(self._on_start)
        self.stop_btn.clicked.connect(self._on_stop)

    # -- TODO 2: Wire up the threading ----------------------------------------

    def _on_start(self):
        """Create a QThread, create a worker, move it, connect signals, start."""
        # TODO: Follow the pattern from the slides:
        #   1. self._thread = QThread()
        #   2. self._worker = AcquisitionWorker(self._adapter)
        #   3. self._worker.moveToThread(self._thread)
        #   4. Connect signals:
        #        self._thread.started -> self._worker.start_acquisition
        #        self._worker.reading_ready -> self._on_reading
        #        self._worker.error_occurred -> self._on_error
        #        self._worker.finished -> self._thread.quit
        #   5. self._thread.start()
        #   6. Toggle button enabled states
        pass

    def _on_stop(self):
        """Stop the worker and thread cleanly."""
        # TODO:
        #   1. Call self._worker.stop()
        #   2. self._thread.quit()
        #   3. self._thread.wait()
        #   4. Toggle button enabled states
        #   5. Update the label to "Stopped"
        pass

    # -- Slot callbacks (these are done for you) -------------------------------

    def _on_reading(self, reading):
        self.reading_label.setText(f"{reading.value:.2f} {reading.unit}")

    def _on_error(self, message):
        self.reading_label.setText(f"ERROR: {message}")

    # -- TODO 3: Clean shutdown ------------------------------------------------

    def closeEvent(self, event):
        """Stop threads before the window closes. Prevents hangs on exit."""
        # TODO: call self._on_stop() if a thread is running
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
