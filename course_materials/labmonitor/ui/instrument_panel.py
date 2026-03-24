"""Simulated Instrument Panel — a visual "bench instrument" window.

Opens as a separate window alongside the main LabMonitor app.
Gives students something that looks like a real instrument display,
making the simulation tangible.
"""

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QComboBox, QFrame,
)
from PySide6.QtCore import Qt, Signal, QTimer
from PySide6.QtGui import QFont


# ---- Styling constants ----
PANEL_BG = "#1a1a2e"
LCD_BG = "#0f0f1a"
LCD_GREEN = "#39ff14"
LCD_DIM = "#0a3a00"
LABEL_COLOR = "#8888aa"
LED_OFF = "#333333"
LED_GREEN = "#00e676"
LED_RED = "#ff1744"
LED_AMBER = "#ffab00"
BORDER_COLOR = "#2a2a4a"


class LedIndicator(QLabel):
    """A small coloured dot that acts as an LED indicator."""

    def __init__(self, label_text: str, parent=None):
        super().__init__(parent)
        self._label_text = label_text
        self._on = False
        self._on_color = LED_GREEN
        self.setFixedHeight(20)
        self._update_style()

    def set_color(self, color: str):
        self._on_color = color
        if self._on:
            self._update_style()

    def turn_on(self):
        self._on = True
        self._update_style()

    def turn_off(self):
        self._on = False
        self._update_style()

    def _update_style(self):
        color = self._on_color if self._on else LED_OFF
        self.setText(f"  ●  {self._label_text}")
        self.setStyleSheet(
            f"color: {color}; font-size: 12px; font-family: Consolas, monospace; "
            f"background: transparent;"
        )


class LcdReadout(QFrame):
    """A single LCD-style numeric readout with label."""

    def __init__(self, channel_label: str, unit: str, parent=None):
        super().__init__(parent)
        self._unit = unit
        self.setStyleSheet(
            f"QFrame {{ background: {LCD_BG}; border: 1px solid {BORDER_COLOR}; "
            f"border-radius: 4px; }}"
        )
        self.setFixedHeight(70)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(12, 4, 12, 4)
        layout.setSpacing(0)

        # Channel label
        self._channel_label = QLabel(channel_label)
        self._channel_label.setStyleSheet(
            f"color: {LABEL_COLOR}; font-size: 10px; font-family: Consolas; "
            f"background: transparent; border: none;"
        )
        self._channel_label.setAlignment(Qt.AlignLeft)
        layout.addWidget(self._channel_label)

        # Value display
        self._value_label = QLabel("---.--.--")
        lcd_font = QFont("Consolas", 28)
        lcd_font.setStyleHint(QFont.Monospace)
        self._value_label.setFont(lcd_font)
        self._value_label.setStyleSheet(
            f"color: {LCD_DIM}; background: transparent; border: none;"
        )
        self._value_label.setAlignment(Qt.AlignRight | Qt.AlignVCenter)
        layout.addWidget(self._value_label)

    def set_value(self, value: float):
        self._value_label.setText(f"{value:8.3f} {self._unit}")
        self._value_label.setStyleSheet(
            f"color: {LCD_GREEN}; background: transparent; border: none;"
        )

    def clear_value(self):
        self._value_label.setText("---.--.--")
        self._value_label.setStyleSheet(
            f"color: {LCD_DIM}; background: transparent; border: none;"
        )


class InstrumentPanel(QWidget):
    """Simulated instrument front panel — digital multimeter style.

    Displays live temperature and voltage readings with LED status
    indicators and an error mode selector.
    """

    error_mode_changed = Signal(str)  # Emits the selected error mode name

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("SimInstrument v1.0 — SN0001")
        self.setFixedSize(360, 340)
        self.setStyleSheet(f"background: {PANEL_BG};")

        layout = QVBoxLayout(self)
        layout.setContentsMargins(16, 12, 16, 12)
        layout.setSpacing(8)

        # ---- Title bar ----
        title = QLabel("SIMULATED INSTRUMENT")
        title.setAlignment(Qt.AlignCenter)
        title.setStyleSheet(
            f"color: {LABEL_COLOR}; font-size: 11px; font-family: Consolas; "
            f"letter-spacing: 3px; background: transparent; padding: 2px;"
        )
        layout.addWidget(title)

        # ---- Separator ----
        sep = QFrame()
        sep.setFrameShape(QFrame.HLine)
        sep.setStyleSheet(f"color: {BORDER_COLOR};")
        layout.addWidget(sep)

        # ---- LCD readouts ----
        self._temp_readout = LcdReadout("TEMP", "°C")
        self._volt_readout = LcdReadout("VOLT", "V")
        layout.addWidget(self._temp_readout)
        layout.addWidget(self._volt_readout)

        # ---- LED indicators ----
        led_layout = QHBoxLayout()
        led_layout.setSpacing(4)

        self._led_power = LedIndicator("PWR")
        self._led_power.set_color(LED_GREEN)
        self._led_power.turn_on()  # Always on when the panel is open

        self._led_connected = LedIndicator("CONN")
        self._led_connected.set_color(LED_GREEN)

        self._led_acquiring = LedIndicator("ACQ")
        self._led_acquiring.set_color(LED_AMBER)

        self._led_error = LedIndicator("ERR")
        self._led_error.set_color(LED_RED)

        led_layout.addWidget(self._led_power)
        led_layout.addWidget(self._led_connected)
        led_layout.addWidget(self._led_acquiring)
        led_layout.addWidget(self._led_error)
        layout.addLayout(led_layout)

        # ---- Reading counter ----
        self._count_label = QLabel("Readings: 0")
        self._count_label.setStyleSheet(
            f"color: {LABEL_COLOR}; font-size: 10px; font-family: Consolas; "
            f"background: transparent;"
        )
        self._count_label.setAlignment(Qt.AlignRight)
        layout.addWidget(self._count_label)

        # ---- Error mode selector ----
        err_layout = QHBoxLayout()
        err_label = QLabel("Error Mode:")
        err_label.setStyleSheet(
            f"color: {LABEL_COLOR}; font-size: 11px; font-family: Consolas; "
            f"background: transparent;"
        )
        self._error_combo = QComboBox()
        self._error_combo.addItems([
            "None", "Timeout", "Garbage", "Intermittent", "Drift", "Disconnect",
        ])
        self._error_combo.setStyleSheet(
            f"QComboBox {{ background: {LCD_BG}; color: {LCD_GREEN}; "
            f"border: 1px solid {BORDER_COLOR}; font-family: Consolas; "
            f"font-size: 11px; padding: 2px 8px; }}"
            f"QComboBox::drop-down {{ border: none; }}"
            f"QComboBox QAbstractItemView {{ background: {LCD_BG}; "
            f"color: {LCD_GREEN}; selection-background-color: {BORDER_COLOR}; }}"
        )
        self._error_combo.currentTextChanged.connect(self._on_error_mode_changed)

        err_layout.addWidget(err_label)
        err_layout.addWidget(self._error_combo, stretch=1)
        layout.addLayout(err_layout)

        # Internal state
        self._reading_count = 0

    # ---- Public methods (called by controller) ----

    def update_reading(self, reading) -> None:
        """Update the appropriate readout based on the reading's channel."""
        self._reading_count += 1
        self._count_label.setText(f"Readings: {self._reading_count}")

        if reading.channel == "temperature":
            self._temp_readout.set_value(reading.value)
        elif reading.channel == "voltage":
            self._volt_readout.set_value(reading.value)

    def show_connected(self) -> None:
        self._led_connected.turn_on()
        self._led_error.turn_off()

    def show_disconnected(self) -> None:
        self._led_connected.turn_off()
        self._led_acquiring.turn_off()
        self._led_error.turn_off()
        self._temp_readout.clear_value()
        self._volt_readout.clear_value()
        self._reading_count = 0
        self._count_label.setText("Readings: 0")

    def show_acquiring(self) -> None:
        self._led_acquiring.turn_on()

    def show_stopped(self) -> None:
        self._led_acquiring.turn_off()

    def show_error(self) -> None:
        self._led_error.turn_on()

    def clear_error(self) -> None:
        self._led_error.turn_off()

    # ---- Internal ----

    def _on_error_mode_changed(self, text: str) -> None:
        mode = text.lower() if text != "None" else None
        if mode == "none":
            mode = None
        self.error_mode_changed.emit(text)
