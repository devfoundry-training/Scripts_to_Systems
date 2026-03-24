"""DataSink — abstract interface for data output (CSV, JSON, HDF5, etc)."""

from abc import ABC, abstractmethod
from core.reading import Reading


class DataSink(ABC):
    """Interface for writing readings to a storage backend.

    Implementations: CsvSink, JsonMetadataSink, Hdf5Sink, CompositeSink.
    The controller does not care which sink is in use.
    """

    @abstractmethod
    def open(self, metadata: dict) -> None:
        """Open/initialise the sink with session metadata."""
        ...

    @abstractmethod
    def write(self, reading: Reading) -> None:
        """Write a single reading."""
        ...

    @abstractmethod
    def close(self) -> None:
        """Flush and close the sink."""
        ...
