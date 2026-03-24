"""
Lab 4 Solution — Strategy Demo
================================
Demonstrates the Strategy pattern applied to instrument measurement.

This script:
  1. Imports the adapter and all three strategy classes from the
     labmonitor project.
  2. Creates a SimulatedInstrumentAdapter.
  3. Creates SingleReadStrategy, ContinuousReadStrategy(count=5),
     and AveragingStrategy(sample_count=10).
  4. Runs each strategy and prints the results.
  5. Shows that strategies are freely swappable.
"""

import sys
import os

# ---------------------------------------------------------------------------
# Make the labmonitor package importable from this solution directory.
# ---------------------------------------------------------------------------
_project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, os.path.join(_project_root, "labmonitor"))

from drivers.simulated import SimulatedInstrumentAdapter
from core.strategies import (
    SingleReadStrategy,
    ContinuousReadStrategy,
    AveragingStrategy,
)
from core.strategy_interface import MeasurementStrategy


def run_strategy(strategy: MeasurementStrategy, adapter, channel: str = "temperature"):
    """Execute a strategy and print its results."""
    print(f"--- {strategy.name} ---")
    readings = strategy.execute(adapter, channel)
    for r in readings:
        print(f"  {r}")
    print()


def main():
    # Create and connect the adapter
    adapter = SimulatedInstrumentAdapter(noise=0.15, frequency=0.1)
    adapter.connect()
    print()

    # Build the three strategies
    strategies = [
        SingleReadStrategy(),
        ContinuousReadStrategy(count=5, interval_s=0.1),
        AveragingStrategy(sample_count=10, interval_s=0.05),
    ]

    # Run each strategy for temperature
    print("=== Temperature channel ===\n")
    for strategy in strategies:
        run_strategy(strategy, adapter, channel="temperature")

    # Run each strategy for voltage to show channel-independence
    print("=== Voltage channel ===\n")
    for strategy in strategies:
        run_strategy(strategy, adapter, channel="voltage")

    # Demonstrate swappability: pick a strategy at runtime
    print("=== Swappable demo ===\n")
    chosen: MeasurementStrategy = strategies[2]  # AveragingStrategy
    print(f"Selected strategy: {chosen.name}")
    results = chosen.execute(adapter, "temperature")
    print(f"  Result: {results[0]}")
    print()

    adapter.disconnect()
    print("Done.")


if __name__ == "__main__":
    main()
