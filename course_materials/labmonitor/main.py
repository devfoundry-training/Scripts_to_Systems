"""LabMonitor — main entry point."""

import sys
import os
import logging

# Add project root to path so imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from PySide6.QtWidgets import QApplication
from core.config_loader import load_config
from core.factory import create_adapter, create_sink
from core.app_model import AppModel
from core.controller import AppController
from ui.main_window import MainWindow


def main():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(name)s %(levelname)s %(message)s",
    )
    logger = logging.getLogger(__name__)

    # Load configuration
    config_path = os.path.join(os.path.dirname(__file__), "configs", "default_config.yaml")
    if len(sys.argv) > 1:
        config_path = sys.argv[1]
    config = load_config(config_path)
    logger.info("Using config: %s", config_path)

    # Create application components
    adapter = create_adapter(config)
    sink = create_sink(config)
    model = AppModel()

    # Create Qt application and window
    app = QApplication(sys.argv)
    window = MainWindow()

    # Create controller (wires everything together)
    controller = AppController(
        model=model,
        view=window,
        adapter=adapter,
        sink=sink,
        interval_ms=config["acquisition"]["interval_ms"],
        channel=config["acquisition"]["channel"],
    )

    # Clean shutdown on window close
    def on_close(event):
        controller.shutdown()
        event.accept()

    window.closeEvent = on_close
    window.show()

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
