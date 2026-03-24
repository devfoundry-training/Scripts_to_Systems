"""Writer thread — consumes a queue and writes to data sinks."""

import logging
import threading
import queue
from core.data_sink import DataSink

logger = logging.getLogger(__name__)


class WriterThread(threading.Thread):
    """Dedicated thread for writing data to sinks.

    Reads Reading objects from a queue and writes them to the provided sink.
    Decouples acquisition speed from disk I/O speed.

    Usage:
        q = queue.Queue()
        writer = WriterThread(data_queue=q, sink=my_composite_sink)
        writer.start()
        ...
        q.put(reading)     # from acquisition worker
        ...
        q.put(None)        # sentinel: signals shutdown
        writer.join()
    """

    def __init__(self, data_queue: queue.Queue, sink: DataSink):
        super().__init__(daemon=True, name="WriterThread")
        self._queue = data_queue
        self._sink = sink

    def run(self) -> None:
        logger.info("WriterThread started.")
        while True:
            item = self._queue.get()
            if item is None:
                # Sentinel received — drain remaining items and exit
                while not self._queue.empty():
                    remaining = self._queue.get()
                    if remaining is not None:
                        self._sink.write(remaining)
                break
            self._sink.write(item)
        logger.info("WriterThread finished.")
