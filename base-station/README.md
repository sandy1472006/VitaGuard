# Base Station

The base station receives LoRa telemetry and emergency messages, validates packet format, maintains last-seen state and exposes the data to the dashboard/reporting interface.

## Required documented behavior

- Radio configuration identical to the wearable.
- Packet type and schema validation.
- Worker/device ID association.
- Last-seen time and stale/disconnected state.
- SOS event prioritization and event log.
- RSSI/SNR display where available.
- Duplicate suppression and ACK behavior where implemented.
- Clear failure handling for malformed or missing packets.
- Dashboard API/transport and versioned data schema.
- Optional local access point and web endpoint.
- No publicly committed AP passwords, API keys or secrets.

Previously discussed development setup used an ESP32 access point and an endpoint like `http://192.168.4.1/telemetry`. Verify this against the current receiver source before using it as the deployed configuration.
