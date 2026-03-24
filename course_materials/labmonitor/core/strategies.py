"""Concrete measurement strategies."""

import time
from typing import List
from core.adapter_interface import InstrumentAdapter
from core.reading import Reading
from core.strategy_interface import MeasurementStrategy


class SingleReadStrategy(MeasurementStrategy):
    """Take a single reading and return it."""

    @property
    def name(self) -> str:
        return "Single Read"

    def execute(self, adapter: InstrumentAdapter, channel: str = "temperature") -> List[Reading]:
        return [adapter.read_value(channel)]


class ContinuousReadStrategy(MeasurementStrategy):
    """Take N readings at a fixed interval."""

    def __init__(self, count: int = 10, interval_s: float = 0.1):
        self._count = count
        self._interval_s = interval_s

    @property
    def name(self) -> str:
        return f"Continuous ({self._count} @ {self._interval_s}s)"

    def execute(self, adapter: InstrumentAdapter, channel: str = "temperature") -> List[Reading]:
        readings = []
        for _ in range(self._count):
            readings.append(adapter.read_value(channel))
            time.sleep(self._interval_s)
        return readings


class AveragingStrategy(MeasurementStrategy):
    """Take N readings and return a single averaged reading."""

    def __init__(self, sample_count: int = 10, interval_s: float = 0.05):
        self._sample_count = sample_count
        self._interval_s = interval_s

    @property
    def name(self) -> str:
        return f"Averaging ({self._sample_count} samples)"

    def execute(self, adapter: InstrumentAdapter, channel: str = "temperature") -> List[Reading]:
        values = []
        unit = ""
        for _ in range(self._sample_count):
            r = adapter.read_value(channel)
            values.append(r.value)
            unit = r.unit
            time.sleep(self._interval_s)
        avg = sum(values) / len(values)
        return [Reading(value=avg, unit=unit, channel=channel)]
