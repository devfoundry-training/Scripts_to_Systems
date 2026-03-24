"""Real-time plot widget using PyQtGraph — dual channel (temperature + voltage)."""

import numpy as np
import pyqtgraph as pg
from PySide6.QtCore import QTimer


class LivePlotWidget(pg.GraphicsLayoutWidget):
    """Scrolling real-time plot with ring buffers for two channels.

    Updates at a fixed display rate (default 30 Hz) regardless of data rate.
    """

    def __init__(self, buffer_size: int = 500, update_hz: int = 30, parent=None):
        super().__init__(parent=parent)
        self._buffer_size = buffer_size
        self.setBackground("w")

        # ---- Temperature plot (top) ----
        self._temp_plot = self.addPlot(row=0, col=0)
        self._temp_plot.setLabel("left", "Temperature", units="°C")
        self._temp_plot.showGrid(x=True, y=True, alpha=0.3)
        self._temp_plot.hideAxis("bottom")  # Hide x-axis on top plot to save space
        self._temp_curve = self._temp_plot.plot(pen=pg.mkPen("#1565C0", width=2))
        self._temp_buffer = np.full(buffer_size, np.nan)
        self._temp_index = 0

        # ---- Voltage plot (bottom) ----
        self._volt_plot = self.addPlot(row=1, col=0)
        self._volt_plot.setLabel("left", "Voltage", units="V")
        self._volt_plot.setLabel("bottom", "Sample")
        self._volt_plot.showGrid(x=True, y=True, alpha=0.3)
        self._volt_curve = self._volt_plot.plot(pen=pg.mkPen("#E65100", width=2))
        self._volt_buffer = np.full(buffer_size, np.nan)
        self._volt_index = 0

        # Link X axes so they scroll together
        self._volt_plot.setXLink(self._temp_plot)

        # Update timer
        self._timer = QTimer()
        self._timer.timeout.connect(self._update_plot)
        self._timer.start(int(1000 / update_hz))

    def add_value(self, value: float, channel: str = "temperature") -> None:
        """Add a new value to the appropriate ring buffer."""
        if channel == "temperature":
            self._temp_buffer[self._temp_index % self._buffer_size] = value
            self._temp_index += 1
        elif channel == "voltage":
            self._volt_buffer[self._volt_index % self._buffer_size] = value
            self._volt_index += 1

    def _get_ordered_data(self, buffer, index):
        """Return ring buffer contents in chronological order."""
        if index == 0:
            return None
        if index < self._buffer_size:
            return buffer[:index]
        start = index % self._buffer_size
        return np.concatenate([buffer[start:], buffer[:start]])

    def _update_plot(self) -> None:
        """Redraw both curves from ring buffers (called by timer)."""
        temp_data = self._get_ordered_data(self._temp_buffer, self._temp_index)
        if temp_data is not None:
            self._temp_curve.setData(temp_data)

        volt_data = self._get_ordered_data(self._volt_buffer, self._volt_index)
        if volt_data is not None:
            self._volt_curve.setData(volt_data)

    def clear_data(self) -> None:
        """Reset both ring buffers."""
        self._temp_buffer = np.full(self._buffer_size, np.nan)
        self._temp_index = 0
        self._volt_buffer = np.full(self._buffer_size, np.nan)
        self._volt_index = 0
