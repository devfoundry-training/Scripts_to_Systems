"""Application model — holds all application state, no Qt dependency."""

import logging
from datetime import datetime
from typing import Optional
from core.reading import Reading

logger = logging.getLogger(__name__)


class AppModel:
    """Central application state.

    The model is a plain Python object. It has no knowledge of Qt, the GUI,
    or any specific hardware. It can be tested without either.
    """

    def __init__(self):
        self.is_connected: bool = False
        self.is_acquiring: bool = False
        self.is_recording: bool = False
        self.current_reading: Optional[Reading] = None
        self.error_message: Optional[str] = None
        self.device_id: str = ""
        self.session_start: Optional[datetime] = None
        self.reading_count: int = 0

    def update_reading(self, reading: Reading) -> None:
        self.current_reading = reading
        self.reading_count += 1

    def set_connected(self, connected: bool, device_id: str = "") -> None:
        self.is_connected = connected
        self.device_id = device_id
        if not connected:
            self.is_acquiring = False
            self.is_recording = False

    def set_acquiring(self, acquiring: bool) -> None:
        self.is_acquiring = acquiring
        if acquiring:
            self.session_start = datetime.now()
            self.reading_count = 0
        else:
            self.session_start = None

    def set_error(self, message: Optional[str]) -> None:
        self.error_message = message

    def clear_error(self) -> None:
        self.error_message = None

    def get_metadata(self) -> dict:
        """Return current state as metadata dict for recording."""
        return {
            "device_id": self.device_id,
            "session_start": self.session_start.isoformat() if self.session_start else None,
            "reading_count": self.reading_count,
        }
