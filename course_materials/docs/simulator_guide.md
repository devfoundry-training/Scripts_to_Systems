# Simulator Guide

## What Is the Simulator?

The `SimulatedInstrumentAdapter` generates realistic synthetic instrument data without any hardware. It implements the same `InstrumentAdapter` interface as a real serial instrument, so your code cannot tell the difference.

**Device ID:** `SimInstrument-v1.0-SN0001`

---

## Quick Start

```python
from drivers.simulated import SimulatedInstrumentAdapter

adapter = SimulatedInstrumentAdapter()
adapter.connect()

reading = adapter.read_value("temperature")
print(reading)  # e.g. 23.47 degC [temperature] @ 09:15:32

adapter.disconnect()
```

---

## Available Channels

| Channel       | Base Value | Waveform   | Unit  | Noise |
|---------------|-----------|------------|-------|-------|
| `temperature` | 22.0      | Sine wave  | degC  | +/- 0.15 |
| `voltage`     | 3.3       | Sawtooth   | V     | +/- 0.02 |
| Any other     | 0.0       | Sine wave  | AU    | +/- 0.15 |

### Reading Both Channels

```python
temp = adapter.read_value("temperature")
volt = adapter.read_value("voltage")
print(f"Temp: {temp.value:.2f} {temp.unit}")
print(f"Volt: {volt.value:.3f} {volt.unit}")
```

---

## Commands (send_command)

| Command              | Response                          | Purpose                    |
|----------------------|-----------------------------------|----------------------------|
| `*IDN?`              | `SimInstrument-v1.0-SN0001`       | Identify the instrument    |
| `STATUS`             | `STATUS:OK`                       | Check instrument status    |
| `SET:INTERVAL:200`   | `OK`                              | Set sampling interval (ms) |
| `SET:anything`       | `OK`                              | Any SET command returns OK |
| Anything else        | `UNKNOWN:<your command>`          | Unrecognised command       |

### Example

```python
print(adapter.send_command("*IDN?"))     # SimInstrument-v1.0-SN0001
print(adapter.send_command("STATUS"))    # STATUS:OK
print(adapter.send_command("HELLO"))     # UNKNOWN:HELLO
```

---

## Error Modes

The simulator can deliberately misbehave to help you practise error handling. Set an error mode, then try reading values.

### Setting Error Modes

```python
adapter.set_error_mode("timeout")               # every read times out
adapter.set_error_mode("intermittent", probability=0.3)  # 30% chance of error
adapter.set_error_mode(None)                     # back to normal
```

### Available Modes

| Mode            | What Happens                                | Exception Raised     | Use This to Practise       |
|-----------------|---------------------------------------------|----------------------|----------------------------|
| `None`          | Normal operation                            | (none)               | Default behaviour          |
| `"timeout"`     | Sleeps 5 seconds, then raises               | `TimeoutError`       | Timeout handling, retries  |
| `"garbage"`     | Raises immediately with bad data message     | `ValueError`         | Response parsing, validation |
| `"intermittent"`| Random failures at given probability         | `ConnectionError`    | Retry logic, resilience    |
| `"drift"`       | Values drift upward over time                | (none, values wrong) | Data validation, alarms    |
| `"disconnect"`  | Disconnects after N reads                    | `ConnectionError`    | Reconnection logic         |

### Error Mode Parameters

| Mode            | Parameter       | Default | Meaning                         |
|-----------------|-----------------|---------|----------------------------------|
| `intermittent`  | `probability`   | 0.1     | Chance of error per read (0-1)  |
| `drift`         | `rate`          | 0.5     | How fast values drift upward    |
| `disconnect`    | `after`         | 20      | Disconnect after this many reads |

### Example: Intermittent Errors

```python
adapter.set_error_mode("intermittent", probability=0.2)

for i in range(20):
    try:
        reading = adapter.read_value("temperature")
        print(f"  {reading.value:.2f} degC")
    except ConnectionError as e:
        print(f"  ERROR: {e}")
```

Expected output: roughly 16 successful reads and 4 errors (at 20% probability).

### Example: Disconnect After N Reads

```python
adapter.set_error_mode("disconnect", after=5)

for i in range(10):
    try:
        reading = adapter.read_value("temperature")
        print(f"  Read {i+1}: {reading.value:.2f}")
    except ConnectionError as e:
        print(f"  Read {i+1}: DISCONNECTED - {e}")
        break
```

Expected output: 5 successful reads, then a disconnect error.

### Resetting to Normal

```python
adapter.set_error_mode(None)  # clears all error modes
```

---

## Constructor Parameters

| Parameter   | Default | Meaning                              |
|-------------|---------|--------------------------------------|
| `noise`     | 0.15    | Standard deviation of random noise   |
| `frequency` | 0.1     | Frequency of the sine/sawtooth wave  |

```python
# Noisy, fast-changing signal
adapter = SimulatedInstrumentAdapter(noise=0.5, frequency=0.5)

# Clean, slow signal
adapter = SimulatedInstrumentAdapter(noise=0.01, frequency=0.02)
```

---

## Properties

| Property       | Type   | Meaning                                   |
|----------------|--------|-------------------------------------------|
| `is_connected` | `bool` | Whether the simulator is currently active |
| `device_id`    | `str`  | Always `SimInstrument-v1.0-SN0001`        |

---

## The Reading Object

Every call to `read_value()` returns a `Reading`:

```python
reading = adapter.read_value("temperature")

reading.value      # float, e.g. 23.47
reading.unit       # str, e.g. "degC"
reading.channel    # str, e.g. "temperature"
reading.timestamp  # datetime, when the reading was taken
```

---

## Why a Simulator?

- No hardware dependency: every delegate can complete every lab
- Deterministic enough to teach, noisy enough to be realistic
- Error modes let you practise timeout handling, retries, and reconnection
- Same interface as real hardware: swap by changing one config line
- No risk of frying a rig during a training exercise

---

## Classroom Tips

**For delegates:**
- Start every lab with the simulator. Get your code working first.
- Use error modes to stress-test your error handling before touching real hardware.

**For instructors:**
- Demo real hardware from the instructor rig if available.
- Use `set_error_mode("timeout")` live during demos to show what happens.
- Toggle `set_error_mode(None)` to recover, showing resilience in action.
