# Lab 9: Configuration and Metadata

**Duration:** 20 minutes | **Day 3, Session 3.3**

## Objective
Load application config from YAML and write experiment metadata.

## Setup

Your script needs to import from the `labmonitor/` package. Add this at the top:

```python
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "labmonitor"))
```

## Provided Code
- `labmonitor/core/config_loader.py` — YAML config loader with defaults
- `labmonitor/core/factory.py` — creates adapters/sinks from config
- `labmonitor/configs/default_config.yaml` — sample config

## Your Task

1. Review `default_config.yaml` — understand the structure.
2. Review `config_loader.py` — see how it merges user config with defaults.
3. Review `factory.py` — see how `create_adapter()` and `create_sink()` use config.
4. Write a script that:
   - Loads `default_config.yaml`
   - Creates adapter and sink using factory functions
   - Connects, reads 5 values, prints them
   - Prints the full config dict
5. **Experiment:** change `device.type` to `serial` in the YAML and observe the error (no hardware). Change it back to `simulated`.

## Key Insight
Changing behaviour = editing a YAML file, not Python code.

## Extension
- Add a new config option: `acquisition.noise_level` and pass it to the simulator
- Add config validation: check that `device.type` is either "simulated" or "serial"

## Solution
See `solutions/lab09_solution/config_demo.py`
