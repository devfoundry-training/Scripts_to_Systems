"""Reading dataclass — the fundamental data unit in the application."""

from dataclasses import dataclass, field
from datetime import datetime


@dataclass(frozen=True)
class Reading:
    """A single measurement reading from an instrument."""

    value: float
    unit: str
    timestamp: datetime = field(default_factory=datetime.now)
    channel: str = "default"

    def __str__(self) -> str:
        return f"{self.value:.3f} {self.unit} [{self.channel}] @ {self.timestamp:%H:%M:%S}"
