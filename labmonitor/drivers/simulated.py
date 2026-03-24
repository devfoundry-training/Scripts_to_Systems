"""Simulated instrument adapter — no hardware required."""

import math
import random
import time
import logging
from datetime import datetime
from core.adapter_interface import InstrumentAdapter
from core.reading import Reading

logger = logging.getLogger(__name__)


class SimulatedInstrumentAdapter(InstrumentAdapter):
    """Generates realistic synthetic instrument data.

    Supports configurable error modes for teaching error handling.
    """

    ERROR_MODES = {"timeout", "garbage", "intermittent", "drift", "disconnect", None}

    def __init__(self, noise: float = 0.15, frequency: float = 0.1):
        self._connected = False
        self._noise = noise
        self._frequency = frequency
        self._start_time = time.time()
        self._read_count = 0

        # Error simulation
        self._error_mode = None
        self._error_probability = 0.1
        self._drift_rate = 0.0
        self._disconnect_after = None

    # ---- Error mode control (instructor / config) ----

    def set_error_mode(self, mode, **kwargs):
        """Set an error simulation mode.

        Modes:
            None          - normal operation
            'timeout'     - read_value sleeps 5s then raises TimeoutError
            'garbage'     - read_value returns unparseable data
            'intermittent'- random ConnectionError (probability kwarg, default 0.1)
            'drift'       - values drift upward (rate kwarg, default 0.5)
            'disconnect'  - disconnects after N reads (after kwarg, default 20)
        """
        if mode not in self.ERROR_MODES:
            raise ValueError(f"Unknown error mode: {mode}")
        self._error_mode = mode
        self._error_probability = kwargs.get("probability", 0.1)
        self._drift_rate = kwargs.get("rate", 0.5)
        self._disconnect_after = kwargs.get("after", 20)
        self._read_count = 0
        logger.info("Simulator error mode set to: %s", mode)

    # ---- InstrumentAdapter interface ----

    def connect(self) -> None:
        logger.info("Simulated instrument connecting...")
        time.sleep(0.3)  # Simulate connection delay
        self._connected = True
        self._start_time = time.time()
        self._read_count = 0
        logger.info("Simulated instrument connected.")

    def disconnect(self) -> None:
        self._connected = False
        logger.info("Simulated instrument disconnected.")

    @property
    def is_connected(self) -> bool:
        return self._connected

    @property
    def device_id(self) -> str:
        return "SimInstrument-v1.0-SN0001"

    def read_value(self, channel: str = "temperature") -> Reading:
        if not self._connected:
            raise ConnectionError("Instrument is not connected.")

        self._read_count += 1
        self._apply_error_mode()

        t = time.time() - self._start_time
        drift = self._drift_rate * t if self._error_mode == "drift" else 0.0

        if channel == "temperature":
            base, amplitude = 22.0, 3.0
            value = base + amplitude * math.sin(2 * math.pi * self._frequency * t)
        elif channel == "voltage":
            base, amplitude = 3.3, 0.2
            # Sawtooth wave
            value = base + amplitude * (2 * (t * self._frequency % 1) - 1)
        else:
            base, amplitude = 0.0, 1.0
            value = base + amplitude * math.sin(2 * math.pi * self._frequency * t)

        value += random.gauss(0, self._noise) + drift
        unit = {"temperature": "degC", "voltage": "V"}.get(channel, "AU")
        return Reading(value=value, unit=unit, channel=channel)

    def send_command(self, command: str) -> str:
        if not self._connected:
            raise ConnectionError("Instrument is not connected.")
        cmd = command.strip().upper()
        if cmd == "*IDN?":
            return self.device_id
        if cmd == "STATUS":
            return "STATUS:OK"
        if cmd.startswith("SET:"):
            return "OK"
        return f"UNKNOWN:{cmd}"

    # ---- Internal ----

    def _apply_error_mode(self):
        if self._error_mode == "timeout":
            time.sleep(5)
            raise TimeoutError("Simulated timeout on read.")
        elif self._error_mode == "garbage":
            raise ValueError("Simulated garbage response: TEMP:X#@!")
        elif self._error_mode == "intermittent":
            if random.random() < self._error_probability:
                raise ConnectionError("Simulated intermittent connection error.")
        elif self._error_mode == "disconnect":
            if self._disconnect_after and self._read_count > self._disconnect_after:
                self._connected = False
                raise ConnectionError("Simulated disconnect after %d reads." % self._disconnect_after)
