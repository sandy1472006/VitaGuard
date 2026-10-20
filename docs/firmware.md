# Firmware Architecture

## 1. Firmware responsibilities

The wearable firmware is responsible for:

1. Initializing sensors, controller peripherals, storage and radio modules.
2. Acquiring sensor data on their configured schedules.
3. Applying validity, freshness and signal-quality checks.
4. Generating derived features and domain-specific assessments.
5. Updating worker status and the Dynamic Risk Score.
6. Driving local visual, audible and haptic alerts.
7. Building periodic telemetry and priority emergency messages.
8. Maintaining the rolling incident-history buffer.
9. Receiving and handling acknowledgements or commands where implemented.
10. Entering a defined degraded state when data, a sensor, storage, or a communication path is unavailable.

## 2. Sampling schedule

The earlier integration firmware sent routine telemetry approximately every five seconds. That interval is not necessarily the sampling rate of every sensor. The released implementation should define each interval separately.

| Task | Schedule field to document | Required release value |
|---|---|---|
| MAX30102 optical sample acquisition | `PPG_SAMPLE_PERIOD_MS` or equivalent | Copy from firmware |
| Heart-rate/SpO₂ feature update | `VITAL_UPDATE_PERIOD_MS` | Copy from firmware |
| DS18B20 conversion/read | `SKIN_TEMP_PERIOD_MS` | Copy from firmware |
| BMP280 update | `ENV_SAMPLE_PERIOD_MS` | Copy from firmware |
| MQ-9 ADC reading | `GAS_SAMPLE_PERIOD_MS` | Copy from firmware |
| ADXL345 acquisition | `ACCEL_SAMPLE_PERIOD_MS` | Copy from firmware |
| Risk-score update | `RISK_UPDATE_PERIOD_MS` | Copy from firmware |
| Routine radio telemetry | `TELEMETRY_PERIOD_MS` | Earlier integration example: about 5000 ms; verify release |
| Receiver stale-data timeout | `WORKER_STALE_TIMEOUT_MS` | Copy from receiver configuration |
| SOS retransmit timeout | `SOS_RETRY_PERIOD_MS` | Copy from release firmware, if retries implemented |

**Do not claim all sensors are sampled at the telemetry interval.** Optical and motion processing may need a higher internal rate than network reporting.

## 3. Sensor validity model

Every measurement should be represented internally with a value, timestamp and quality/state flag. The implementation should distinguish:

- **VALID:** sample is fresh and passes the module-specific checks.
- **INVALID:** reading failed or is outside a documented sensor-valid range.
- **STALE:** no sufficiently recent valid sample is available.
- **WARMING / NOT_READY:** sensor requires warm-up or has not completed initialization.
- **FAULT:** a persistent communication, self-test or hardware fault has been detected.

Invalid or stale data should not silently become a safe value. The risk engine should either exclude the value with a clear quality flag or apply a defined conservative response.

## 4. Risk state machine

The system uses normal/caution/alert/emergency response levels. The precise transition conditions, persistence counts, hysteresis, reset procedure and threshold values must be taken from the deployed rules/model configuration.

Recommended state meanings:

- **NORMAL:** valid readings and no configured condition requiring warning.
- **CAUTION:** elevated but not critical risk or a persistent trend requiring worker attention.
- **ALERT:** configured high-risk condition; strong local indication and receiver notification.
- **EMERGENCY/SOS:** manual SOS or a configured validated emergency condition; priority packet and emergency response.
- **DATA/SENSOR FAULT:** important measurement is unavailable or unreliable. This is separate from NORMAL.

A manual SOS should not depend on the AI score reaching a threshold.

## 5. Fall and movement processing

The ADXL345 provides three-axis acceleration. A fall classifier can use acceleration magnitude, impact detection, orientation change (depending on the fitted configuration), followed by a low-motion interval and decision confirmation. The current release's real sequence, sampling rate, filter, threshold and model file must be documented.

If the deployed model is an 8-bit quantized CNN/BiLSTM-family model, include:
- model filename and version/hash;
- input tensor shape and sample window;
- sample rate and preprocessing;
- output classes and confidence interpretation;
- training/evaluation data provenance;
- validation protocol and observed metrics;
- MCU inference latency and memory footprint measured on the actual device.

## 6. SOS logic

The release documentation must include the exact:
- GPIO and electrical polarity;
- debounce interval;
- press/hold rule;
- latching and cancellation method;
- local buzzer, vibration and LED pattern;
- immediate packet format;
- retry and ACK behavior;
- receiver-side duplicate suppression;
- radio-failure indication and fallback behavior.

The previously discussed pin map uses GPIO27 with `INPUT_PULLUP`, with the button between the input and GND. Confirm the actual build before publication.

## 7. Event capture

VitaGuard's black-box incident feature keeps a rolling 60-second history of selected recent measurements and preserves/associates it with an SOS event. The repository should state whether the buffer resides in RAM, local storage, or both, and explain how samples are timestamped, frozen, persisted and transmitted without blocking the emergency path.

## 8. Build information

Add the release firmware tag, compiler/board package version, library versions, configuration file, model version and build date. Do not include Wi-Fi passwords, API secrets, private keys or SIM credentials.
