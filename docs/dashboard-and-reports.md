# Base Station, Dashboard and Reports

## 1. Overview

The base station is intended to receive worker messages over LoRa, parse telemetry, maintain worker state and present events to supervisors. The dashboard presents worker-specific information and organization-level safety summaries. Internet/cloud services can extend the system but are not required for the local wearable-to-receiver radio hop.

## 2. Base-station path

The previously discussed ESP32 SoftAP setup uses a network name such as `VitaGuard_Base` and a local telemetry endpoint such as:

`http://192.168.4.1/telemetry`

Treat these as integration examples. Confirm the final AP name, endpoint, JSON schema and web server behavior from the release code. Do **not** publish an AP password in the README or hard-code credentials into a public repository.

## 3. Dashboard functions

The consolidated VitaGuard 2.0 design includes:
- worker identity and last-seen status;
- latest vital and environmental readings;
- gas-sensor response and sensor-quality state;
- acceleration/fall-related events;
- Dynamic Risk Score and state;
- personal-baseline and shift-readiness information;
- local and remote SOS events;
- link status and packet freshness;
- recent incident history, including the rolling pre-event record;
- individual worker safety summary;
- aggregate organization-level report.

Every dashboard value should show its source and freshness where possible. A stale or unavailable sensor reading should not look like a healthy current reading.

## 4. Example JSON schema

This is a sample shape, not a guaranteed serialization of the current server:

```json
{
  "device_id": "WORKER001",
  "message_type": "telemetry",
  "timestamp": "2026-01-01T12:00:00Z",
  "vitals": {
    "heart_rate_bpm": null,
    "spo2_percent": null,
    "quality": "unknown"
  },
  "temperature": {
    "contact_c": null,
    "ambient_c": null
  },
  "environment": {
    "pressure_hpa": null,
    "gas_adc_raw": null,
    "gas_concentration_ppm": null,
    "gas_calibration_status": "unknown"
  },
  "motion": {
    "ax": null,
    "ay": null,
    "az": null,
    "acceleration_magnitude": null,
    "fall_state": "unknown"
  },
  "risk": {
    "score_0_100": null,
    "state": "DATA_UNAVAILABLE",
    "reason_codes": []
  },
  "sos": false,
  "last_packet_age_ms": null
}
```

Use `null` for missing data, not a realistic-looking fake value. Include units and quality flags.

## 5. Individual and organizational reports

### Individual worker report
A worker's timeline may include status transitions, sensor faults, risk score trend, caution/alert periods, SOS attempts, receipt/acknowledgment timestamps, and recent event context.

### Organization report
Aggregate data may include counts of warnings and emergencies, sensor uptime, communication performance, response timing, battery status, recurring high-risk periods, and sensor maintenance events. Avoid exposing personally identifiable worker medical data to managers who do not require it.

## 6. Deployment and browser considerations

A locally served page is usually more reliable than opening a local HTML file and attempting cross-origin requests to the ESP32. If the dashboard uses `fetch`, document the actual origin, CORS behavior, HTTP/WebSocket transport and authentication model. Keep cloud sync optional and do not make essential local SOS operation dependent on the cloud.

## 7. Secrets and privacy

Use environment/configuration files ignored by Git. Do not commit AP passwords, API keys, database passwords, tokens, worker names linked to health data, or unredacted production logs.
