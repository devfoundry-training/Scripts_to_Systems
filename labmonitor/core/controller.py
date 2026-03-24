"""Application controller — orchestrates model, view, adapter, worker, sinks."""

import logging
import queue
from PySide6.QtCore import QThread
from core.app_model import AppModel
from core.adapter_interface import InstrumentAdapter
from core.data_sink import DataSink
from core.writer_thread import WriterThread
from ui.worker import AcquisitionWorker
from ui.main_window import MainWindow

logger = logging.getLogger(__name__)


class AppController:
    """Wires the model to the view and manages the acquisition lifecycle.

    The controller does not care whether the adapter is real or simulated,
    or whether the sink writes CSV, JSON, or HDF5.
    """

    def __init__(self, model: AppModel, view: MainWindow,
                 adapter: InstrumentAdapter, sink: DataSink,
                 interval_ms: int = 100, channel: str = "temperature",
                 instrument_panel=None):
        self._model = model
        self._view = view
        self._adapter = adapter
        self._sink = sink
        self._interval_ms = interval_ms
        self._channel = channel
        self._panel = instrument_panel

        self._worker = None
        self._worker_thread = None
        self._data_queue = None
        self._writer_thread = None
        self._latest = {}  # Track latest value per channel for display

        # Wire view buttons to controller actions
        self._view.btn_connect.clicked.connect(self.on_connect)
        self._view.btn_disconnect.clicked.connect(self.on_disconnect)
        self._view.btn_start.clicked.connect(self.on_start)
        self._view.btn_stop.clicked.connect(self.on_stop)

        # Wire instrument panel error mode selector (if panel and simulated adapter)
        if self._panel is not None:
            self._panel.error_mode_changed.connect(self._on_panel_error_mode)

    def on_connect(self) -> None:
        try:
            self._adapter.connect()
            self._model.set_connected(True, self._adapter.device_id)
            self._model.clear_error()
            self._view.show_connected(self._adapter.device_id)
            if self._panel:
                self._panel.show_connected()
            logger.info("Connected to %s", self._adapter.device_id)
        except Exception as e:
            self._model.set_error(str(e))
            self._view.show_error(str(e))
            logger.error("Connection failed: %s", e)

    def on_disconnect(self) -> None:
        if self._model.is_acquiring:
            self.on_stop()
        try:
            self._adapter.disconnect()
        except Exception as e:
            logger.warning("Error during disconnect: %s", e)
        self._model.set_connected(False)
        self._view.show_disconnected()
        self._view.plot_widget.clear_data()
        if self._panel:
            self._panel.show_disconnected()

    def on_start(self) -> None:
        if not self._model.is_connected or self._model.is_acquiring:
            return

        # Set up data queue and writer thread
        self._data_queue = queue.Queue()
        metadata = {
            "device_id": self._model.device_id,
            "channel": self._channel,
            "interval_ms": self._interval_ms,
        }
        self._sink.open(metadata)
        self._writer_thread = WriterThread(self._data_queue, self._sink)
        self._writer_thread.start()

        # Set up acquisition worker on QThread
        self._worker_thread = QThread()
        self._worker = AcquisitionWorker(
            adapter=self._adapter,
            interval_ms=self._interval_ms,
            data_queue=self._data_queue,
            channel=self._channel,
        )
        self._worker.moveToThread(self._worker_thread)

        # Connect signals
        self._worker.reading_ready.connect(self._on_reading)
        self._worker.error_occurred.connect(self._on_error)
        self._worker.finished.connect(self._worker_thread.quit)
        self._worker_thread.started.connect(self._worker.start_acquisition)

        # Start
        self._worker_thread.start()
        self._model.set_acquiring(True)
        self._model.clear_error()
        self._latest.clear()
        self._view.show_acquiring()
        self._view.plot_widget.clear_data()
        if self._panel:
            self._panel.show_acquiring()
        logger.info("Acquisition started.")

    def on_stop(self) -> None:
        if not self._model.is_acquiring:
            return

        # Stop worker
        if self._worker:
            self._worker.stop()
        if self._worker_thread:
            self._worker_thread.quit()
            self._worker_thread.wait(3000)

        # Stop writer
        if self._data_queue:
            self._data_queue.put(None)  # Sentinel
        if self._writer_thread:
            self._writer_thread.join(timeout=3)

        # Close sinks
        self._sink.close()

        self._model.set_acquiring(False)
        self._view.show_stopped()
        if self._panel:
            self._panel.show_stopped()
        logger.info("Acquisition stopped.")

    def _on_reading(self, reading) -> None:
        """Slot: called when the worker emits a new reading."""
        self._model.update_reading(reading)
        self._latest[reading.channel] = reading
        temp = self._latest.get("temperature")
        volt = self._latest.get("voltage")
        temp_str = f"{temp.value:.2f} °C" if temp else "--- °C"
        volt_str = f"{volt.value:.2f} V" if volt else "--- V"
        self._view.update_reading(f"{temp_str}  |  {volt_str}", self._model.reading_count)
        self._view.plot_widget.add_value(reading.value, reading.channel)
        self._view.clear_error()
        if self._panel:
            self._panel.update_reading(reading)
            self._panel.clear_error()

    def _on_error(self, message: str) -> None:
        """Slot: called when the worker emits an error."""
        self._model.set_error(message)
        self._view.show_error(message)
        if self._panel:
            self._panel.show_error()

    def _on_panel_error_mode(self, mode_text: str) -> None:
        """Slot: called when the instrument panel error mode dropdown changes."""
        from drivers.simulated import SimulatedInstrumentAdapter
        if not isinstance(self._adapter, SimulatedInstrumentAdapter):
            return
        mode = mode_text.lower() if mode_text != "None" else None
        if mode == "none":
            mode = None
        try:
            self._adapter.set_error_mode(mode)
            logger.info("Error mode set to: %s", mode)
        except ValueError as e:
            logger.warning("Invalid error mode: %s", e)

    def shutdown(self) -> None:
        """Clean shutdown — call from QMainWindow.closeEvent."""
        logger.info("Shutting down...")
        if self._model.is_acquiring:
            self.on_stop()
        if self._model.is_connected:
            self.on_disconnect()
        logger.info("Shutdown complete.")
