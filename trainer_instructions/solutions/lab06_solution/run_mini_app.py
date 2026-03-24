"""Lab 6 Solution: Run the full LabMonitor mini-app.

The labmonitor package itself IS the Lab 6 solution.
This launcher script adds the labmonitor directory to sys.path
and calls its main() entry point.

Run:
    python run_mini_app.py
"""

import sys
import os

# Add the labmonitor package root to sys.path so its internal
# imports (e.g. "from core.reading import Reading") resolve correctly.
_project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
_labmonitor_root = os.path.join(_project_root, "labmonitor")
sys.path.insert(0, _labmonitor_root)

from main import main

if __name__ == "__main__":
    main()
