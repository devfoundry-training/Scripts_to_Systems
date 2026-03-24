"""Lab 9 Solution: Config-driven behaviour demo.

Demonstrates how the config loader and factory functions work together:
1. Loads default_config.yaml using the config_loader module.
2. Creates an adapter and sink via factory functions (driven by config).
3. Connects the adapter, reads 5 values, and prints them.
4. Shows that the loaded config dict controls which backends are used.

Run:
    python config_demo.py
"""

import sys
import os
import pprint

# Add the labmonitor package root to sys.path.
_project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
_labmonitor_root = os.path.join(_project_root, "labmonitor")
sys.path.insert(0, _labmonitor_root)

from core.config_loader import load_config
from core.factory import create_adapter, create_sink


def main():
    # ---- Load the default configuration ----
    config_path = os.path.join(_labmonitor_root, "configs", "default_config.yaml")
    config = load_config(config_path)

    print("=" * 60)
    print("Loaded configuration")
    print("=" * 60)
    pprint.pprint(config)
    print()

    # ---- Create adapter from config ----
    adapter = create_adapter(config)
    print(f"Adapter type: {type(adapter).__name__}")
    print(f"  (config device.type = '{config['device']['type']}')")
    print()

    # ---- Create sink from config ----
    sink = create_sink(config)
    print(f"Sink type:    {type(sink).__name__}")
    print(f"  (config output.formats = {config['output']['formats']})")
    print()

    # ---- Connect and read 5 values ----
    adapter.connect()
    channel = config["acquisition"]["channel"]
    print(f"Reading 5 values from channel '{channel}':\n")

    for i in range(5):
        reading = adapter.read_value(channel)
        print(f"  Reading {i + 1}: {reading}")

    adapter.disconnect()

    # ---- Show how changing config would change the backend ----
    print()
    print("=" * 60)
    print("How config drives behaviour")
    print("=" * 60)
    print()
    print("Current config uses:")
    print(f"  device.type      = '{config['device']['type']}'")
    print(f"    -> creates {type(adapter).__name__}")
    print()
    print("If you changed default_config.yaml to:")
    print("  device.type      = 'serial'")
    print("    -> factory would create SerialInstrumentAdapter instead")
    print()
    print("Similarly for output formats:")
    print(f"  output.formats   = {config['output']['formats']}")
    print("    -> factory creates a CompositeSink wrapping CsvSink + JsonMetadataSink")
    print()
    print("Adding 'hdf5' to the list would include an Hdf5Sink automatically.")
    print()
    print("Done.")


if __name__ == "__main__":
    main()
