# Lab 1: From Script to Classes

**Duration:** 25–30 minutes | **Day 1, Session 1.2**

## Objective
Identify responsibilities in a messy script and split them into classes.

## Starter Code
Open `examples/messy_script.py`. Read through it — it works, but everything is in one file with global state.

## Your Task

1. Identify at least **3 distinct responsibilities** in the script (hint: look for the nouns).
2. Create a **class for each responsibility** with appropriate `__init__`, methods, and state.
3. Refactor `main()` so it creates instances and calls methods — no global variables.
4. Run your refactored version. It should produce the **same output**.

## Suggested Classes

| Class | Responsibility |
|---|---|
| `InstrumentReader` | Connect, disconnect, read raw data, parse response |
| `DataRecorder` | Open CSV, write rows, close file |
| `ReadingFormatter` | Format values for display, format timestamps |

## Expected Output
A refactored script with 3+ classes and a clean `main()` that coordinates them.

## Common Mistakes
- Creating classes that are just namespaces (no `__init__`, no state)
- Moving code into a class but keeping global variables
- Making one giant "God class" that does everything

## Extension
If you finish early: add a `Reading` dataclass to hold value + unit + timestamp together.

## Solution
See `solutions/lab01_solution/refactored_script.py`
