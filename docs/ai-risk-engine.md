# Edge AI, Sensor Fusion and Dynamic Risk Score

## 1. Purpose

The intelligence layer converts raw and derived measurements into actionable safety states. It combines sensor quality with physiological trends, environmental exposure information and movement events. It provides a risk score and a reasoned status for the wearer and receiving station.

## 2. Input domains

### Physiological domain
- Heart-rate-related features derived from MAX30102 optical channels.
- SpO₂-related output only when the signal and algorithm support a usable estimate.
- Pulse-rate variability or related optical features, if computed by the installed firmware.
- Worker-specific baseline deviation and trend information.

### Thermal/environment domain
- Contact/skin-surface temperature from the actual installed temperature sensor.
- Ambient temperature from the environmental sensor.
- Temperature difference/trend features used by the thermal risk model.
- Barometric pressure from BMP280 when relevant to the deployment. BMP280 does not directly report oxygen concentration.

### Gas domain
- MQ-9 response and calibration data.
- Warm-up/readiness status and sensor-health indicators.
- Calibrated concentration only where a valid calibration pipeline and supported test conditions exist.
- Gas-related risk state with the data quality shown explicitly.

### Motion/fall domain
- ADXL345 x/y/z time series.
- Acceleration magnitude and derived movement features.
- Candidate impact/fall event sequence.
- Inactivity after a candidate event and classification output.

## 3. Multi-level model architecture

The VitaGuard 2.0 architecture groups processing into domain-specific stages and a meta-decision stage:

1. **Data conditioning:** filtering, normalization, signal-quality checks and time alignment.
2. **Physiological/thermal analysis:** identifies deviations and trends across vital and thermal features.
3. **Gas analysis:** evaluates the calibrated gas response and sensor health.
4. **Motion classification:** detects candidate falls/impacts and movement patterns. The research design describes an 8-bit quantized CNN/BiLSTM-lineage approach; publish the exact deployed model and version.
5. **Personal baseline:** maintains a worker-specific reference profile so normal individual variation is not automatically treated as abnormal.
6. **Shift Readiness Check:** analyzes the initial shift period, described in the project design as the first five minutes, against the worker's baseline.
7. **Meta-decision fusion:** combines domain outputs, quality flags and severity into a Dynamic Risk Score and status.
8. **Action mapping:** selects worker feedback, supervisor alert, event capture and communication priority.

## 4. Dynamic Risk Score (0–100)

The public documentation can describe the score as a normalized indication of combined risk, with higher values representing greater assessed risk. The exact formula, domain weights, calibration, missing-data treatment and limits must be taken from the real deployed implementation.

Record these implementation details in `config/risk_engine.yaml` or an equivalent version-controlled settings file:
- feature names and units;
- normalization ranges;
- model versions and checksums;
- score component weights and aggregation formula;
- configured alert thresholds;
- persistence/hysteresis rules;
- validity and missing-data behavior;
- risk-state mapping;
- worker baseline update rules;
- model confidence and fallback behavior.

Do not put private worker profiles, live biometric logs, or sensitive personal data into the public repository.

## 5. Predictive analysis

The project's report describes a 7–15 minute early-warning window for supported physiological/thermal/fatigue trends. Document the deployed prediction task precisely: target event, prediction horizon, unit of analysis, dataset, label definition, evaluation split, precision/recall, false-alarm rate and calibration.

A prediction horizon does not itself prove useful prediction. The repository should include the experiment protocol and results that support it, including cases where the system did not provide an early warning.

## 6. Personal baseline and federated learning

The system design includes worker-specific baseline comparison and a federated-learning/privacy-oriented architecture. Document:
- what baseline values are stored;
- when a baseline is created and updated;
- how unusual data is prevented from corrupting the baseline;
- how a worker opts in or is enrolled;
- whether raw observations leave the device;
- what model updates are exchanged;
- update validation and rollback;
- encryption and access-control boundaries.

Only describe federated learning as active in the release if the model-update pipeline, not merely on-device inference, is actually deployed.

## 7. Risk-state transitions

The release configuration should define NORMAL, CAUTION, ALERT and EMERGENCY/SOS states. Every transition should specify the triggering condition, the required persistence, any hysteresis and the reset/acknowledgment behavior. Manual SOS should bypass ordinary risk-score gating.

## 8. Safety interpretation

The AI output is intended for safety decision support. It is not by itself a medical diagnosis, certified gas-exposure measurement, proof of fitness for work, or guarantee of preventing every incident. Clearly show sensor faults and uncertainty to users.
