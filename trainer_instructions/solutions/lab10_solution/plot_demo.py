"""Lab 10 Solution: Standalone PySide6 dual-channel live-plot application.

A self-contained GUI that plots live temperature AND voltage data from a
SimulatedInstrumentAdapter:
- QMainWindow with dual pyqtgraph plots (temp top, voltage bottom).
- Numpy ring buffers (500 samples each) for smooth scrolling.
- QTimer at ~33 ms (30 Hz) drives acquisition and plot updates.

Run:
    python plot_demo.py
"""

import sys
import os

# Add the labmonitor package root to sys.path.
_project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
_labmonitor_root = os.path.join(_project_root, "labmonitor")
sys.path.insert(0, _labmonitor_root)

import numpy as np
import pyqtgraph as pg
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel,
)
from PySide6.QtCore import QTimer

from drivers.simulated import SimulatedInstrumentAdapter


BUFFER_SIZE = 500
UPDATE_INTERVAL_MS = 33  # ~30 Hz


class LivePlotWindow(QMainWindow):
    """Main window with dual live-scrolling plots and Start/Stop controls."""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("Lab 10 — Dual-Channel Live Plot Demo")
        self.setMinimumSize(800, 600)

        # ---- Instrument adapter ----
        self._adapter = SimulatedInstrumentAdapter(noise=0.15, frequency=0.1)
        self._adapter.connect()

        # ---- Ring buffers ----
        self._temp_buffer = np.full(BUFFER_SIZE, np.nan)
        self._volt_buffer = np.full(BUFFER_SIZE, np.nan)
        self._temp_index = 0
        self._volt_index = 0

        # ---- Build UI ----
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)

        # Controls
        controls = QHBoxLayout()
        self._btn_start = QPushButton("Start")
        self._btn_stop = QPushButton("Stop")
        self._btn_stop.setEnabled(False)
        self._lbl_reading = QLabel("---")
        font = self._lbl_reading.font()
        font.setPointSize(14)
        font.setBold(True)
        self._lbl_reading.setFont(font)
        self._lbl_count = QLabel("Samples: 0")

        controls.addWidget(self._btn_start)
        controls.addWidget(self._btn_stop)
        controls.addWidget(self._lbl_reading)
        controls.addStretch()
        controls.addWidget(self._lbl_count)
        layout.addLayout(controls)

        # Dual plot
        self._plot_layout = pg.GraphicsLayoutWidget()
        self._plot_layout.setBackground("w")

        # Temperature (top)
        self._temp_plot = self._plot_layout.addPlot(row=0, col=0)
        self._temp_plot.setLabel("left", "Temperature", units="°C")
        self._temp_plot.showGrid(x=True, y=True, alpha=0.3)
        self._temp_plot.hideAxis("bottom")
        self._temp_curve = self._temp_plot.plot(pen=pg.mkPen("#1565C0", width=2))

        # Voltage (bottom)
        self._volt_plot = self._plot_layout.addPlot(row=1, col=0)
        self._volt_plot.setLabel("left", "Voltage", units="V")
        self._volt_plot.setLabel("bottom", "Sample")
        self._volt_plot.showGrid(x=True, y=True, alpha=0.3)
        self._volt_curve = self._volt_plot.plot(pen=pg.mkPen("#E65100", width=2))
        self._volt_plot.setXLink(self._temp_plot)

        layout.addWidget(self._plot_layout, stretch=1)

        # ---- Timer ----
        self._timer = QTimer()
        self._timer.setInterval(UPDATE_INTERVAL_MS)
        self._timer.timeout.connect(self._on_timer)

        # ---- Signals ----
        self._btn_start.clicked.connect(self._start)
        self._btn_stop.clicked.connect(self._stop)

    # ---- Slots ----

    def _start(self):
        self._btn_start.setEnabled(False)
        self._btn_stop.setEnabled(True)
        self._timer.start()

    def _stop(self):
        self._timer.stop()
        self._btn_start.setEnabled(True)
        self._btn_stop.setEnabled(False)

    def _on_timer(self):
        """Read both channels and update the plots (called at ~30 Hz)."""
        # Temperature
        temp = self._adapter.read_value("temperature")
        self._temp_buffer[self._temp_index % BUFFER_SIZE] = temp.value
        self._temp_index += 1

        # Voltage
        volt = self._adapter.read_value("voltage")
        self._volt_buffer[self._volt_index % BUFFER_SIZE] = volt.value
        self._volt_index += 1

        # Update label
        self._lbl_reading.setText(f"{temp.value:.2f} °C  |  {volt.value:.2f} V")
        self._lbl_count.setText(f"Samples: {self._temp_index}")

        # Update plots
        self._temp_curve.setData(self._get_ordered(self._temp_buffer, self._temp_index))
        self._volt_curve.setData(self._get_ordered(self._volt_buffer, self._volt_index))

    def _get_ordered(self, buf, idx):
        if idx < BUFFER_SIZE:
            return buf[:idx]
        start = idx % BUFFER_SIZE
        return np.concatenate([buf[start:], buf[:start]])

    # ---- Cleanup ----

    def closeEvent(self, event):
        self._timer.stop()
        self._adapter.disconnect()
        super().closeEvent(event)


def main():
    app = QApplication(sys.argv)
    window = LivePlotWindow()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
