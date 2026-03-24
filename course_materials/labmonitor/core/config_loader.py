"""Configuration loader — reads YAML config files."""

import logging
import yaml

logger = logging.getLogger(__name__)

DEFAULTS = {
    "device": {"type": "simulated", "port": "COM3", "baud_rate": 9600},
    "acquisition": {"interval_ms": 100, "strategy": "continuous", "channel": "temperature"},
    "output": {"formats": ["csv", "json_metadata"], "directory": "./data"},
    "gui": {"plot_update_hz": 30, "plot_buffer_size": 500},
}


def load_config(path: str) -> dict:
    """Load config from YAML file, merging with defaults."""
    try:
        with open(path, "r") as f:
            user_config = yaml.safe_load(f) or {}
    except FileNotFoundError:
        logger.warning("Config file not found: %s — using defaults.", path)
        user_config = {}

    config = {}
    for section, defaults in DEFAULTS.items():
        config[section] = {**defaults, **user_config.get(section, {})}

    logger.info("Config loaded from %s", path)
    return config
