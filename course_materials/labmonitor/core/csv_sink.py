"""CSV data sink implementation."""

import csv
import logging
import os
from datetime import datetime
from core.data_sink import DataSink
from core.reading import Reading

logger = logging.getLogger(__name__)


class CsvSink(DataSink):
    """Writes readings to a CSV file."""

    def __init__(self, output_dir: str = "./data"):
        self._output_dir = output_dir
        self._file = None
        self._writer = None

    def open(self, metadata: dict) -> None:
        os.makedirs(self._output_dir, exist_ok=True)
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        filepath = os.path.join(self._output_dir, f"data_{ts}.csv")
        self._file = open(filepath, "w", newline="")
        self._writer = csv.writer(self._file)
        self._writer.writerow(["timestamp", "channel", "value", "unit"])
        logger.info("CsvSink opened: %s", filepath)

    def write(self, reading: Reading) -> None:
        if self._writer is None:
            raise RuntimeError("CsvSink is not open.")
        self._writer.writerow([
            reading.timestamp.isoformat(),
            reading.channel,
            f"{reading.value:.6f}",
            reading.unit,
        ])
        self._file.flush()

    def close(self) -> None:
        if self._file:
            self._file.close()
            self._file = None
            self._writer = None
            logger.info("CsvSink closed.")
