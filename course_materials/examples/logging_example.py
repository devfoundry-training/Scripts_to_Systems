"""
Logging Example — Optional Extension
======================================
Shows how to replace print() with proper logging.
"""

import logging
import sys

# Configure logging once at application startup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)-8s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("labmonitor.log"),
    ],
)

# Each module gets its own logger
logger = logging.getLogger(__name__)


def example_adapter_logging():
    """Shows how logging looks in an adapter module."""
    adapter_log = logging.getLogger("drivers.simulated")

    adapter_log.info("Connecting to simulated instrument...")
    adapter_log.info("Connected. Device ID: SimInstrument-v1.0")
    adapter_log.debug("Read raw: TEMP:23.4521")  # Won't show at INFO level
    adapter_log.warning("Timeout on read — retrying (attempt 2/3)")
    adapter_log.error("Connection lost after 50 reads")


def example_controller_logging():
    """Shows how logging looks in the controller."""
    ctrl_log = logging.getLogger("core.controller")

    ctrl_log.info("Acquisition started (interval=100ms, channel=temperature)")
    ctrl_log.info("Reading #1: 23.45 degC")
    ctrl_log.info("Acquisition stopped after 100 readings.")


def example_change_level():
    """Show how to change log level at runtime."""
    adapter_log = logging.getLogger("drivers.simulated")

    print("\n--- At INFO level (debug messages hidden) ---")
    adapter_log.info("This shows")
    adapter_log.debug("This is hidden")

    print("\n--- At DEBUG level (debug messages visible) ---")
    adapter_log.setLevel(logging.DEBUG)
    adapter_log.info("This shows")
    adapter_log.debug("This now shows too!")
    adapter_log.setLevel(logging.INFO)


if __name__ == "__main__":
    logger.info("=== Logging Example ===")
    example_adapter_logging()
    example_controller_logging()
    example_change_level()
    logger.info("=== Done ===")
