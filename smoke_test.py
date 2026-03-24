#!/usr/bin/env python3
"""
Pre-course Smoke Test
=====================
Run this script BEFORE the course starts to verify your environment.

Usage:
    python smoke_test.py

Expected output:
    All checks should show [OK]. Any [FAIL] must be resolved before Day 1.
"""

import sys
import importlib

REQUIRED_PYTHON = (3, 10)

REQUIRED_PACKAGES = [
    ("PySide6", "PySide6.QtWidgets", "PySide6 (Qt for Python GUI framework)"),
    ("pyqtgraph", "pyqtgraph", "pyqtgraph (real-time plotting)"),
    ("pyserial", "serial", "pyserial (serial port communication)"),
    ("pint", "pint", "Pint (physical units)"),
    ("PyYAML", "yaml", "PyYAML (configuration files)"),
    ("numpy", "numpy", "NumPy (numerical arrays)"),
]

OPTIONAL_PACKAGES = [
    ("h5py", "h5py", "h5py (HDF5 data files) — optional"),
]


def check_python_version():
    major, minor = sys.version_info[:2]
    if (major, minor) >= REQUIRED_PYTHON:
        print(f"  [OK]   Python {major}.{minor}.{sys.version_info[2]}")
        return True
    else:
        print(f"  [FAIL] Python {major}.{minor} — need {REQUIRED_PYTHON[0]}.{REQUIRED_PYTHON[1]}+")
        return False


def check_package(pip_name, import_name, description):
    try:
        mod = importlib.import_module(import_name)
        version = getattr(mod, "__version__", getattr(mod, "VERSION", "unknown"))
        print(f"  [OK]   {description} — version {version}")
        return True
    except ImportError:
        print(f"  [FAIL] {description} — not installed (pip install {pip_name})")
        return False


def check_pyside6_gui():
    """Quick check that PySide6 can create a QApplication (display server works)."""
    try:
        from PySide6.QtWidgets import QApplication
        app = QApplication.instance() or QApplication(sys.argv)
        print("  [OK]   PySide6 QApplication — display server accessible")
        return True
    except Exception as e:
        print(f"  [FAIL] PySide6 QApplication — {e}")
        print("         (This may fail over SSH or headless environments)")
        return False


def check_pyqtgraph_plot():
    """Quick check that pyqtgraph can create a plot widget."""
    try:
        import pyqtgraph as pg
        from PySide6.QtWidgets import QApplication
        app = QApplication.instance() or QApplication(sys.argv)
        pw = pg.PlotWidget()
        pw.plot([1, 2, 3], [4, 5, 6])
        print("  [OK]   PyQtGraph PlotWidget — renders correctly")
        return True
    except Exception as e:
        print(f"  [FAIL] PyQtGraph PlotWidget — {e}")
        return False


def main():
    print("=" * 60)
    print("  From Scripts to Systems — Pre-Course Smoke Test")
    print("=" * 60)
    print()

    all_ok = True

    print("1. Python version")
    if not check_python_version():
        all_ok = False
    print()

    print("2. Required packages")
    for pip_name, import_name, description in REQUIRED_PACKAGES:
        if not check_package(pip_name, import_name, description):
            all_ok = False
    print()

    print("3. Optional packages")
    for pip_name, import_name, description in OPTIONAL_PACKAGES:
        check_package(pip_name, import_name, description)  # Don't fail on optional
    print()

    print("4. GUI subsystem")
    if not check_pyside6_gui():
        all_ok = False
    if not check_pyqtgraph_plot():
        all_ok = False
    print()

    print("=" * 60)
    if all_ok:
        print("  ALL CHECKS PASSED — you are ready for the course.")
    else:
        print("  SOME CHECKS FAILED — please resolve before Day 1.")
        print("  Ask the instructor or training centre for help.")
    print("=" * 60)

    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
