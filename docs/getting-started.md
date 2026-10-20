# Getting Started

This page is intended for engineers reproducing the project. Adapt it to the actual source tree and confirmed component revisions.

## Before powering on
- Inspect the device for shorts and exposed conductors.
- Verify battery polarity, charger variant and power rails.
- Confirm the MQ-9 supply/airflow/heater arrangement and protect the ESP32 ADC input.
- Confirm the RA-02 supply and attach an antenna before radio transmission.
- Confirm the sensor part numbers and the actual pin map.

## Wearable bring-up
1. Flash the tagged wearable firmware and the matching configuration.
2. Confirm serial startup logs identify each sensor.
3. Check that invalid/unavailable sensors are shown as faults, not normal values.
4. Confirm optical sensor contact and inspect its signal quality.
5. Confirm temperature and environmental readings against reference tools.
6. Verify gas-sensor warm-up and calibrated processing before evaluating hazard behavior.
7. Confirm movement axes and orientation in the actual mounting position.
8. Test local alert outputs with a controlled, non-hazardous procedure.
9. Test the SOS button and receiver path under controlled conditions.
10. Measure battery current and runtime.

## Base-station bring-up
1. Load receiver firmware with matching LoRa parameters.
2. Verify valid telemetry packets and the worker/device ID.
3. Inject malformed packets and confirm safe handling.
4. Verify missing telemetry causes a stale/disconnected indication.
5. Confirm SOS prioritization, event logging, ACK and retry behavior where supported.
6. Verify dashboard values carry timestamps and sensor-quality states.

## Reproducibility
Record the source commit, firmware build, module versions, radio configuration, model hash and test data for each test run.
