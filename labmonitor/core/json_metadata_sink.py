"""JSON metadata sink — writes session metadata alongside data files."""

import json
import logging
import os
from datetime import datetime
from core.data_sink import DataSink
from core.reading import Reading

logger = logging.getLogger(__name__)


class JsonMetadataSink(DataSink):
    """Writes a JSON metadata file for each acquisition session.

    This is NOT for high-rate data — it records who, what, when, and how
    for reproducibility.
    """

    def __init__(self, output_dir: str = "./data"):
        self._output_dir = output_dir
        self._filepath = None
        self._metadata = {}
        self._reading_count = 0

    def open(self, metadata: dict) -> None:
        os.makedirs(self._output_dir, exist_ok=True)
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        self._filepath = os.path.join(self._output_dir, f"metadata_{ts}.json")
        self._metadata = {
            "session_start": datetime.now().isoformat(),
            **metadata,
        }
        self._reading_count = 0
        logger.info("JsonMetadataSink opened: %s", self._filepath)

    def write(self, reading: Reading) -> None:
        self._reading_count += 1

    def close(self) -> None:
        if self._filepath:
            self._metadata["session_end"] = datetime.now().isoformat()
            self._metadata["total_readings"] = self._reading_count
            with open(self._filepath, "w") as f:
                json.dump(self._metadata, f, indent=2)
            logger.info("JsonMetadataSink closed: %s", self._filepath)
            self._filepath = None
