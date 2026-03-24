"""MeasurementStrategy — interface for different measurement behaviours."""

from abc import ABC, abstractmethod
from typing import List
from core.adapter_interface import InstrumentAdapter
from core.reading import Reading


class MeasurementStrategy(ABC):
    """Abstract interface for measurement strategies.

    A strategy defines HOW measurements are taken (single, continuous, averaging)
    while the adapter defines WHERE they come from (simulated, serial, etc).
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable name of this strategy."""
        ...

    @abstractmethod
    def execute(self, adapter: InstrumentAdapter, channel: str = "temperature") -> List[Reading]:
        """Execute the measurement strategy and return readings."""
        ...
