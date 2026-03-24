# Lab 2: Refactor the Messy Driver

**Duration:** 30 minutes | **Day 1, Session 1.3**

## Objective
Find seams in a messy instrument driver and extract the transport layer and parsing logic.

## Starter Code
Open `examples/messy_driver.py`. Notice how it mixes serial I/O, command formatting, response parsing, error handling, and display output.

## Your Task

1. **Mark the seams** — where does one concern end and another begin?
2. **Extract a `Transport` class** that handles send/receive with retry logic.
3. **Extract pure parsing functions**: `parse_temperature(raw) -> float`, `parse_voltage(raw) -> float`.
4. **Clean up the driver** so it uses `Transport` and the parse functions.
5. Keep the `FakeSerial` class unchanged — it simulates the serial port.
6. Run your refactored driver. It should produce the **same output**.

## Key Seams to Look For
- Serial write/read calls (transport)
- `"TEMP:"` / `"VOLT:"` string parsing (protocol)
- Retry logic (error handling)
- `print()` statements inside the driver (display — shouldn't be here)

## Expected Output
A driver with clear separation: `Transport` handles I/O, pure functions handle parsing, `CleanDriver` coordinates.

## Common Mistakes
- Only extracting one tiny piece (extract at least transport AND parsing)
- Not making the transport substitutable (it should accept any serial-like object)
- Leaving `print()` calls in the driver (move them to the caller)

## Solution
See `solutions/lab02_solution/refactored_driver.py`
