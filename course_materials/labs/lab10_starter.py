"""
Lab 10 Starter: Real-Time Plot
================================
This skeleton gives you a PySide6 window with Start/Stop buttons
and a LivePlotWidget ready to receive data.

YOUR TASK:
  1. Set up a QTimer that fires at ~30 Hz
  2. On each timer tick, read temperature AND voltage from the adapter
  3. Feed both values into the plot widget
  4. Wire Start/Stop to control the timer

HINT: The LivePlotWidget is already complete. You just need to
      call plot.add_value(value, channel) and plot._update_plot().
"""

import sys
import os

# -- Path setup so we can import from labmonitor/ --
_project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
_labmonitor_root = os.path.join(_project_root, "labmonitor")
sys.path.insert(0, _labmonitor_root)

from PySide6.QtCore import QTimer
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget,
    QVBoxLayout, QPushButton, QHBoxLayout, QLabel,
)

from drivers.simulated import SimulatedInstrumentAdapter
from ui.plot_widget import LivePlotWidget


class PlotDemoWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Lab 10 -- Real-Time Plot")
        self.resize(800, 500)

        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)

        # Status label
        self.status_label = QLabel("Press Start to begin")
        layout.addWidget(self.status_label)

        # Plot widget (already complete, dual-channel with ring buffer)
        self.plot = LivePlotWidget(buffer_size=500)
        layout.addWidget(self.plot)

        # Buttons
        btn_layout = QHBoxLayout()
        self.start_btn = QPushButton("Start")
        self.stop_btn = QPushButton("Stop")
        self.stop_btn.setEnabled(False)
        btn_layout.addWidget(self.start_btn)
        btn_layout.addWidget(self.stop_btn)
        layout.addLayout(btn_layout)

        # Adapter
        self._adapter = SimulatedInstrumentAdapter(noise=0.15, frequency=0.1)
        self._adapter.connect()

        # TODO 1: Create a QTimer
        #   self._timer = QTimer()
        #   self._timer.setInterval(33)  # ~30 Hz
        #   self._timer.timeout.connect(self._on_timer_tick)

        # Connect buttons
        self.start_btn.clicked.connect(self._on_start)
        self.stop_btn.clicked.connect(self._on_stop)

    def _on_start(self):
        """Start the acquisition timer."""
        # TODO 2: Start the timer and toggle buttons
        #   self._timer.start()
        #   self.start_btn.setEnabled(False)
        #   self.stop_btn.setEnabled(True)
        #   self.status_label.setText("Acquiring...")
        pass

    def _on_stop(self):
        """Stop the acquisition timer."""
        # TODO 3: Stop the timer and toggle buttons
        #   self._timer.stop()
        #   self.start_btn.setEnabled(True)
        #   self.stop_btn.setEnabled(False)
        #   self.status_label.setText("Stopped")
        pass

    def _on_timer_tick(self):
        """Called ~30 times per second. Read both channels and update plot."""
        # TODO 4: Read from adapter and feed to plot
        #   temp = self._adapter.read_value("temperature")
        #   volt = self._adapter.read_value("voltage")
        #   self.plot.add_value(temp.value, "temperature")
        #   self.plot.add_value(volt.value, "voltage")
        #   self.status_label.setText(
        #       f"Temp: {temp.value:.2f} {temp.unit}  |  "
        #       f"Volt: {volt.value:.3f} {volt.unit}"
        #   )
        pass

    def closeEvent(self, event):
        """Clean shutdown."""
        if hasattr(self, '_timer'):
            self._timer.stop()
        self._adapter.disconnect()
        event.accept()


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = PlotDemoWindow()
    window.show()
    sys.exit(app.exec())
