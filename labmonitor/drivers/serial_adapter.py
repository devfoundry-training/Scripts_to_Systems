"""Real instrument adapter using pyserial."""

import logging
import time
from datetime import datetime

import serial

from core.adapter_interface import InstrumentAdapter
from core.reading import Reading

logger = logging.getLogger(__name__)


class SerialInstrumentAdapter(InstrumentAdapter):
    """Adapter for a real serial instrument (e.g. Arduino).

    Implements the same InstrumentAdapter interface as the simulator,
    so the application cannot tell the difference.
    """

    def __init__(self, port: str = "COM3", baud_rate: int = 9600, timeout: float = 2.0):
        self._port = port
        self._baud_rate = baud_rate
        self._timeout = timeout
        self._serial: serial.Serial | None = None

    def connect(self) -> None:
        logger.info("Connecting to %s at %d baud...", self._port, self._baud_rate)
        self._serial = serial.Serial(
            port=self._port,
            baudrate=self._baud_rate,
            timeout=self._timeout,
        )
        time.sleep(2)  # Wait for Arduino reset
        self._serial.reset_input_buffer()
        logger.info("Connected to %s.", self._port)

    def disconnect(self) -> None:
        if self._serial and self._serial.is_open:
            self._serial.close()
            logger.info("Disconnected from %s.", self._port)
        self._serial = None

    @property
    def is_connected(self) -> bool:
        return self._serial is not None and self._serial.is_open

    @property
    def device_id(self) -> str:
        return self.send_command("*IDN?")

    def read_value(self, channel: str = "temperature") -> Reading:
        if not self.is_connected:
            raise ConnectionError("Serial instrument is not connected.")

        cmd = f"READ:{channel.upper()}"
        response = self.send_command(cmd)
        value = self._parse_response(response, channel)
        unit = {"temperature": "degC", "voltage": "V"}.get(channel, "AU")
        return Reading(value=value, unit=unit, channel=channel)

    def send_command(self, command: str) -> str:
        if not self.is_connected:
            raise ConnectionError("Serial instrument is not connected.")
        self._serial.write((command + "\n").encode("ascii"))
        line = self._serial.readline().decode("ascii").strip()
        if not line:
            raise TimeoutError(f"No response to command: {command}")
        return line

    @staticmethod
    def _parse_response(response: str, channel: str) -> float:
        """Parse 'TEMP:23.45' or 'VOLT:3.301' into a float."""
        try:
            _, value_str = response.split(":", 1)
            return float(value_str)
        except (ValueError, IndexError) as e:
            raise ValueError(f"Cannot parse response '{response}' for channel '{channel}': {e}")
