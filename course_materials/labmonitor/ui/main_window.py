"""Main application window — the View in MVC."""

from PySide6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QStatusBar, QGroupBox,
)
from PySide6.QtCore import Qt
from PySide6.QtGui import QPalette, QColor
from ui.plot_widget import LivePlotWidget


class MainWindow(QMainWindow):
    """PySide6 main window for LabMonitor.

    The view only displays data and collects user input.
    It does NOT call serial.read(), write files, or manage threads.
    """

    def __init__(self):
        super().__init__()
        self.setWindowTitle("LabMonitor — Instrument Control")
        self.setMinimumSize(800, 600)

        # ---- Central widget ----
        central = QWidget()
        self.setCentralWidget(central)
        main_layout = QVBoxLayout(central)

        # ---- Connection controls ----
        conn_group = QGroupBox("Connection")
        conn_layout = QHBoxLayout(conn_group)

        self.btn_connect = QPushButton("Connect")
        self.btn_disconnect = QPushButton("Disconnect")
        self.btn_disconnect.setEnabled(False)
        self.lbl_connection_status = QLabel("Disconnected")
        self.lbl_device_id = QLabel("")

        conn_layout.addWidget(self.btn_connect)
        conn_layout.addWidget(self.btn_disconnect)
        conn_layout.addWidget(self.lbl_connection_status)
        conn_layout.addStretch()
        conn_layout.addWidget(self.lbl_device_id)
        main_layout.addWidget(conn_group)

        # ---- Acquisition controls ----
        acq_group = QGroupBox("Acquisition")
        acq_layout = QHBoxLayout(acq_group)

        self.btn_start = QPushButton("Start")
        self.btn_stop = QPushButton("Stop")
        self.btn_start.setEnabled(False)
        self.btn_stop.setEnabled(False)
        self.lbl_reading = QLabel("---")
        font = self.lbl_reading.font()
        font.setPointSize(16)
        font.setBold(True)
        self.lbl_reading.setFont(font)
        self.lbl_count = QLabel("Readings: 0")

        acq_layout.addWidget(self.btn_start)
        acq_layout.addWidget(self.btn_stop)
        acq_layout.addWidget(self.lbl_reading)
        acq_layout.addStretch()
        acq_layout.addWidget(self.lbl_count)
        main_layout.addWidget(acq_group)

        # ---- Plot ----
        self.plot_widget = LivePlotWidget()
        main_layout.addWidget(self.plot_widget, stretch=1)

        # ---- Status bar ----
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        self.status_bar.showMessage("Ready")

    # ---- View update methods (called by controller) ----

    def show_connected(self, device_id: str) -> None:
        self.lbl_connection_status.setText("Connected")
        self.lbl_connection_status.setStyleSheet("color: green; font-weight: bold;")
        self.lbl_device_id.setText(device_id)
        self.btn_connect.setEnabled(False)
        self.btn_disconnect.setEnabled(True)
        self.btn_start.setEnabled(True)
        self.status_bar.showMessage(f"Connected to {device_id}")

    def show_disconnected(self) -> None:
        self.lbl_connection_status.setText("Disconnected")
        self.lbl_connection_status.setStyleSheet("color: red;")
        self.lbl_device_id.setText("")
        self.btn_connect.setEnabled(True)
        self.btn_disconnect.setEnabled(False)
        self.btn_start.setEnabled(False)
        self.btn_stop.setEnabled(False)
        self.status_bar.showMessage("Disconnected")

    def show_acquiring(self) -> None:
        self.btn_start.setEnabled(False)
        self.btn_stop.setEnabled(True)
        self.btn_disconnect.setEnabled(False)
        self.status_bar.showMessage("Acquiring...")

    def show_stopped(self) -> None:
        self.btn_start.setEnabled(True)
        self.btn_stop.setEnabled(False)
        self.btn_disconnect.setEnabled(True)
        self.status_bar.showMessage("Stopped")

    def update_reading(self, text: str, count: int) -> None:
        self.lbl_reading.setText(text)
        self.lbl_count.setText(f"Readings: {count}")

    def show_error(self, message: str) -> None:
        self.status_bar.showMessage(f"ERROR: {message}")
        palette = self.lbl_reading.palette()
        palette.setColor(QPalette.ColorRole.WindowText, QColor("red"))
        self.lbl_reading.setPalette(palette)

    def clear_error(self) -> None:
        palette = self.lbl_reading.palette()
        palette.setColor(QPalette.ColorRole.WindowText, QColor("black"))
        self.lbl_reading.setPalette(palette)
