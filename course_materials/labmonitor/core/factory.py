"""Factory functions — create adapters and sinks from config."""

import logging
from core.adapter_interface import InstrumentAdapter
from core.data_sink import DataSink
from core.composite_sink import CompositeSink
from core.csv_sink import CsvSink
from core.json_metadata_sink import JsonMetadataSink

logger = logging.getLogger(__name__)


def create_adapter(config: dict) -> InstrumentAdapter:
    """Create the right adapter based on config['device']['type']."""
    device_type = config["device"]["type"]

    if device_type == "simulated":
        from drivers.simulated import SimulatedInstrumentAdapter
        return SimulatedInstrumentAdapter()

    elif device_type == "serial":
        from drivers.serial_adapter import SerialInstrumentAdapter
        return SerialInstrumentAdapter(
            port=config["device"]["port"],
            baud_rate=config["device"]["baud_rate"],
        )

    else:
        raise ValueError(f"Unknown device type: {device_type}")


def create_sink(config: dict) -> DataSink:
    """Create a composite sink based on config['output']['formats']."""
    output_dir = config["output"]["directory"]
    formats = config["output"]["formats"]
    sinks = []

    for fmt in formats:
        if fmt == "csv":
            sinks.append(CsvSink(output_dir=output_dir))
        elif fmt == "json_metadata":
            sinks.append(JsonMetadataSink(output_dir=output_dir))
        elif fmt == "hdf5":
            from core.hdf5_sink import Hdf5Sink
            sinks.append(Hdf5Sink(output_dir=output_dir))
        else:
            logger.warning("Unknown output format: %s — skipping.", fmt)

    if len(sinks) == 1:
        return sinks[0]
    return CompositeSink(sinks)
