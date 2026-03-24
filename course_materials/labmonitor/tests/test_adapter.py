"""Smoke tests for the instrument adapter."""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from drivers.simulated import SimulatedInstrumentAdapter

def test_connect_disconnect():
    adapter = SimulatedInstrumentAdapter()
    assert not adapter.is_connected
    adapter.connect()
    assert adapter.is_connected
    adapter.disconnect()
    assert not adapter.is_connected
    print("[OK] connect/disconnect")

def test_read_temperature():
    adapter = SimulatedInstrumentAdapter()
    adapter.connect()
    reading = adapter.read_value("temperature")
    assert reading.value is not None
    assert reading.unit == "degC"
    assert reading.channel == "temperature"
    adapter.disconnect()
    print("[OK] read temperature")

def test_read_voltage():
    adapter = SimulatedInstrumentAdapter()
    adapter.connect()
    reading = adapter.read_value("voltage")
    assert reading.unit == "V"
    adapter.disconnect()
    print("[OK] read voltage")

def test_send_command():
    adapter = SimulatedInstrumentAdapter()
    adapter.connect()
    idn = adapter.send_command("*IDN?")
    assert "SimInstrument" in idn
    adapter.disconnect()
    print("[OK] send command")

def test_read_while_disconnected():
    adapter = SimulatedInstrumentAdapter()
    try:
        adapter.read_value()
        assert False, "Should have raised ConnectionError"
    except ConnectionError:
        pass
    print("[OK] read while disconnected raises error")

if __name__ == "__main__":
    test_connect_disconnect()
    test_read_temperature()
    test_read_voltage()
    test_send_command()
    test_read_while_disconnected()
    print("\nAll adapter smoke tests passed.")
