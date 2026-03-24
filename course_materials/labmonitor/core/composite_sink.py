"""Composite sink — fan-out to multiple data sinks."""

import logging
from typing import List
from core.data_sink import DataSink
from core.reading import Reading

logger = logging.getLogger(__name__)


class CompositeSink(DataSink):
    """Delegates write() to all child sinks.

    Example: write to CSV AND JSON metadata at the same time.
    """

    def __init__(self, sinks: List[DataSink]):
        self._sinks = sinks

    def open(self, metadata: dict) -> None:
        for sink in self._sinks:
            sink.open(metadata)

    def write(self, reading: Reading) -> None:
        for sink in self._sinks:
            sink.write(reading)

    def close(self) -> None:
        for sink in self._sinks:
            sink.close()
