"""Acquisition worker — runs on a QThread, reads from adapter, emits signals."""

import time
import logging
import queue as queue_module
from PySide6.QtCore import QObject, Signal
from core.adapter_interface import InstrumentAdapter
from core.reading import Reading

logger = logging.getLogger(__name__)


class AcquisitionWorker(QObject):
    """Background worker that reads from an instrument adapter.

    Runs on a QThread. Communicates with the GUI via signals only.
    Never touches Qt widgets directly.
    """

    reading_ready = Signal(object)    # Emits a Reading
    error_occurred = Signal(str)      # Emits error message
    finished = Signal()               # Emits when loop exits

    def __init__(self, adapter: InstrumentAdapter, interval_ms: int = 100,
                 data_queue: queue_module.Queue = None, channel: str = "temperature"):
        super().__init__()
        self._adapter = adapter
        self._interval_s = interval_ms / 1000.0
        self._data_queue = data_queue
        self._channel = channel
        self._running = False

    def start_acquisition(self) -> None:
        """Main acquisition loop — call this from the thread."""
        self._running = True
        # Read both channels when configured for dual-channel
        channels = ["temperature", "voltage"] if self._channel == "temperature" else [self._channel]
        logger.info("Acquisition started (interval=%.3fs, channels=%s)", self._interval_s, channels)

        while self._running:
            for ch in channels:
                if not self._running:
                    break
                try:
                    reading = self._adapter.read_value(ch)
                    self.reading_ready.emit(reading)
                    if self._data_queue is not None:
                        self._data_queue.put(reading)
                except Exception as e:
                    logger.error("Acquisition error (%s): %s", ch, e)
                    self.error_occurred.emit(str(e))

            time.sleep(self._interval_s)

        logger.info("Acquisition stopped.")
        self.finished.emit()

    def stop(self) -> None:
        """Request the acquisition loop to stop."""
        self._running = False
