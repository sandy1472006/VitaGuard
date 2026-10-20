# Validation Plan and Evidence

The repository should make it possible for another engineer to understand how the system was tested and to distinguish measured results from design targets.

## 1. Validation matrix

Fill in the status and attach logs/results from the actual release build.

| Test | Method | Metrics to record | Evidence file |
|---|---|---|---|
| Sensor initialization | Power-cycle and reconnect each module | Pass rate, boot time, failure indication | `results/sensor-init.csv` |
| HR estimate | Compare against suitable reference under rest and motion | Mean absolute error, sample count, signal-quality effects | `results/hr-comparison.csv` |
| SpO₂ estimate | Compare only using suitable reference conditions and validated method | Bias/error, limits and exclusions | `results/spo2-comparison.csv` |
| Temperature | Compare to reference instrument at defined contact/ambient conditions | Error, settling time, placement | `results/temperature.csv` |
| Gas response | Calibrated reference-gas procedure performed by qualified personnel | Calibration curve, response/recovery, cross-sensitivity | `results/gas-calibration.csv` |
| Motion/fall classifier | Safe, scripted trials with labels | Sensitivity, specificity, confusion matrix, false alarms | `results/fall-tests.csv` |
| Dynamic risk score | Replay labelled scenarios | Event-level precision/recall and calibration | `results/risk-tests.csv` |
| Predictive warning | Held-out evaluation with well-defined event labels | Lead time distribution, missed events, false alerts | `results/prediction-tests.csv` |
| LoRa range | Line-of-sight and representative obstacle/site tests | Distance, RSSI/SNR, packet delivery rate | `results/lora-range.csv` |
| Emergency latency | Timestamp physical button event and receiver event | Median, p95, max latency; packet delivery | `results/sos-latency.csv` |
| Retry and ACK | Inject packet loss and receiver outages | Retry count, eventual delivery, duplicates | `results/radio-reliability.csv` |
| Black-box history | Trigger SOS during controlled data sequence | History duration, missing samples, timestamp integrity | `results/event-history.csv` |
| Battery runtime | Operate full release build continuously | Runtime, current profile, shutdown condition | `results/battery-runtime.csv` |
| Thermal behavior | Operate all modules in representative configuration | Surface temperature, sensor cross-effect, ambient conditions | `results/thermal-tests.csv` |
| User fit | Wearability/strap and button-use trial | Comfort, slippage, false button presses | `results/wearability.csv` |

## 2. Minimum result record

For each test, write down:
- hardware revision and component/module models;
- firmware tag and commit hash;
- model/configuration version;
- date, site and environmental conditions;
- reference equipment and calibration status;
- procedure and test sample count;
- raw data, processing script and metric calculation;
- failures, excluded trials and uncertainty;
- observed result versus intended criterion.

## 3. Performance claim discipline

The project materials describe a 7–15 minute predictive warning horizon, sub-1.2-second emergency broadcast target and 14+ hour battery life. These are system claims that need reproducible evidence. State the conditions under which each result was measured and do not extrapolate a bench test to every real-world setting.

## 4. Privacy

Remove worker names and sensitive health data from public test files. Use anonymized IDs, consented data and a documented retention process.
