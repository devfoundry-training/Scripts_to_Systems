"""Smoke tests for measurement strategies."""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from drivers.simulated import SimulatedInstrumentAdapter
from core.strategies import SingleReadStrategy, ContinuousReadStrategy, AveragingStrategy

def test_single():
    adapter = SimulatedInstrumentAdapter()
    adapter.connect()
    strategy = SingleReadStrategy()
    readings = strategy.execute(adapter)
    assert len(readings) == 1
    adapter.disconnect()
    print("[OK] SingleReadStrategy")

def test_continuous():
    adapter = SimulatedInstrumentAdapter()
    adapter.connect()
    strategy = ContinuousReadStrategy(count=3, interval_s=0.01)
    readings = strategy.execute(adapter)
    assert len(readings) == 3
    adapter.disconnect()
    print("[OK] ContinuousReadStrategy")

def test_averaging():
    adapter = SimulatedInstrumentAdapter()
    adapter.connect()
    strategy = AveragingStrategy(sample_count=5, interval_s=0.01)
    readings = strategy.execute(adapter)
    assert len(readings) == 1  # Averaged to one reading
    adapter.disconnect()
    print("[OK] AveragingStrategy")

if __name__ == "__main__":
    test_single()
    test_continuous()
    test_averaging()
    print("\nAll strategy smoke tests passed.")
