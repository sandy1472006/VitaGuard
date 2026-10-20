# Firmware

Place the actual release firmware source here. Keep the wearable transmitter firmware separate from the base-station receiver firmware if they are built independently.

## Recommended contents

- `wearable/` — ESP32 firmware for sensors, local logic, outputs and radio.
- `base-station/` — ESP32 receiver, packet parser and dashboard endpoint.
- `models/` — model assets or download instructions, with version/hash and license.
- `config/` — thresholds, timing values and module options (no secrets).
- `tests/` — packet parser tests, model tests and unit tests.
- `platformio.ini` or Arduino build notes — exact toolchain and library versions.

## Release information

Each release should record the board package, library versions, firmware commit, model version, configuration revision, build date and tested hardware revision. Do not leave multiple contradictory pin maps in public documentation.
