"""InstrumentAdapter — the port/interface that all device adapters must implement."""

from abc import ABC, abstractmethod
from core.reading import Reading


class InstrumentAdapter(ABC):
    """Abstract interface for any instrument (real or simulated).

    The rest of the application depends ONLY on this interface,
    never on a specific hardware implementation.
    """

    @abstractmethod
    def connect(self) -> None:
        """Establish a connection to the instrument."""
        ...

    @abstractmethod
    def disconnect(self) -> None:
        """Disconnect from the instrument."""
        ...

    @abstractmethod
    def read_value(self, channel: str = "temperature") -> Reading:
        """Read a single value from the specified channel."""
        ...

    @abstractmethod
    def send_command(self, command: str) -> str:
        """Send a command string and return the response."""
        ...

    @property
    @abstractmethod
    def is_connected(self) -> bool:
        """Return True if the instrument is currently connected."""
        ...

    @property
    @abstractmethod
    def device_id(self) -> str:
        """Return an identifier for this instrument."""
        ...
