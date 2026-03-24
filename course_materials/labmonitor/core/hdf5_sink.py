"""Optional HDF5 data sink for high-rate data."""

import logging
import os
from datetime import datetime
from core.data_sink import DataSink
from core.reading import Reading

logger = logging.getLogger(__name__)


class Hdf5Sink(DataSink):
    """Writes readings to an HDF5 file using h5py.

    Optional — requires `pip install h5py`.
    Much faster than CSV for high-rate data.
    """

    def __init__(self, output_dir: str = "./data", chunk_size: int = 1000):
        self._output_dir = output_dir
        self._chunk_size = chunk_size
        self._file = None
        self._dataset = None
        self._index = 0

    def open(self, metadata: dict) -> None:
        try:
            import h5py
        except ImportError:
            raise ImportError("h5py is required for Hdf5Sink. Install with: pip install h5py")

        import numpy as np

        os.makedirs(self._output_dir, exist_ok=True)
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        filepath = os.path.join(self._output_dir, f"data_{ts}.h5")
        self._file = h5py.File(filepath, "w")

        # Store metadata as HDF5 attributes
        for key, value in metadata.items():
            if value is not None:
                self._file.attrs[key] = str(value)

        # Create an extensible dataset
        dt = np.dtype([
            ("timestamp", "S26"),
            ("channel", "S32"),
            ("value", "f8"),
            ("unit", "S16"),
        ])
        self._dataset = self._file.create_dataset(
            "readings", shape=(0,), maxshape=(None,), dtype=dt, chunks=(self._chunk_size,)
        )
        self._index = 0
        logger.info("Hdf5Sink opened: %s", filepath)

    def write(self, reading: Reading) -> None:
        if self._dataset is None:
            raise RuntimeError("Hdf5Sink is not open.")

        self._dataset.resize((self._index + 1,))
        self._dataset[self._index] = (
            reading.timestamp.isoformat().encode(),
            reading.channel.encode(),
            reading.value,
            reading.unit.encode(),
        )
        self._index += 1

    def close(self) -> None:
        if self._file:
            self._file.close()
            self._file = None
            self._dataset = None
            logger.info("Hdf5Sink closed.")
