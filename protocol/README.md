# VitaGuard Protocol Directory

This folder documents the messages exchanged between the wearable and receiving station. The exact released packet builder/parser is authoritative.

## Message categories

- **151 / routine telemetry:** sensor fields, worker/device identity, movement fields, device status, and SOS state.
- **152 / emergency event:** priority event message caused by manual SOS or a configured emergency state.

The 151/152 labels should be used consistently if these numeric IDs are present in the actual released protocol. Earlier development messages used the string identifiers `VITAGUARD` and `VITAGUARD,SOS`. Confirm the final encoding and exact message-type values before labeling a wire-level protocol.

## Compatibility rules

1. Keep transmitter and receiver field order and encoding in sync.
2. Add a protocol version when possible.
3. Reject malformed packets without crashing the receiver.
4. Use a sequence number and timestamp if implemented.
5. Handle duplicate and stale packets explicitly.
6. Treat raw gas ADC data differently from calibrated concentration.
7. Never treat missing values as safe defaults.
8. Document the maximum packet length and radio payload budget.
