# Communications and Packet Protocol

## 1. Network design

VitaGuard uses a direct point-to-point LoRa radio link between the wearable and a compatible receiving station. BLE and GSM/SMS provide additional paths when their corresponding hardware, phone, service and firmware are enabled. Local logging supports recovery or synchronization after a link returns.

The local LoRa hop does not require an internet connection. A radio signal can still be blocked or attenuated by rock, metal, distance, interference, antenna orientation and installation conditions.

## 2. LoRa pin reference

The previously discussed ESP32 mapping is:

| RA-02/SX1278 signal | ESP32 GPIO |
|---|---:|
| SCK | 18 |
| MISO | 19 |
| MOSI | 23 |
| NSS/CS | 5 |
| RESET | 14 |
| DIO0 | 26 |
| VCC | 3.3 V per module requirements |
| GND | Common ground |

Use an appropriate antenna and confirm that transmitter and receiver use the same regionally permitted frequency and compatible radio configuration. The previous firmware discussion used 433 MHz, but the deployed release settings and local regulatory requirements must be checked.

## 3. Telemetry message (message class 151)

The earlier text protocol was CSV-like, with key-value fields. Example only:

```text
VITAGUARD,WORKER001,HR=78,SPO2=97,IR=54321,RED=32145,SKINTEMP=36.7,AMBTEMP=28.4,PRESSURE=1008.3,GAS_ADC=1240,AX=0.2,AY=-0.3,AZ=9.7,ACC_MAG=9.71,SOS=0
```

Field meanings:
- `VITAGUARD`: family identifier.
- `WORKER001`: configured worker/device identifier.
- `HR`: heart-rate estimate.
- `SPO2`: estimate where valid.
- `IR`, `RED`: optical-channel values.
- `SKINTEMP`: contact temperature from the actual fitted sensor.
- `AMBTEMP`: ambient temperature.
- `PRESSURE`: ambient pressure.
- `GAS_ADC`: raw ADC unless calibrated conversion is explicitly implemented.
- `AX`, `AY`, `AZ`: acceleration axes.
- `ACC_MAG`: acceleration magnitude.
- `SOS`: current emergency flag.

The numbers above are illustrative and must not be used as real test data. Add exact field ordering, encoding, maximum packet length, numeric representation, protocol version and validation from the released transmitter code.

## 4. Emergency message (message class 152)

Earlier examples used a separate emergency form resembling:

```text
VITAGUARD,SOS,WORKER001,...,SOS=1
```

This packet is intended to identify a priority emergency event and is handled separately from routine telemetry.

The final protocol documentation should specify whether the actual release includes:
- message type and protocol version;
- worker/device ID;
- sequence number;
- event timestamp;
- SOS state and reason;
- latest valid sensor summary;
- battery/device status;
- acknowledgment correlation ID.

List only the fields that are actually in the released packet.

## 5. Send, retry and acknowledgment policy

Document the exact configuration:

| Setting | Required release value |
|---|---|
| Routine telemetry interval | Earlier integration example: ~5 seconds; confirm final |
| Radio frequency | Earlier code example: 433 MHz; confirm final and regulatory compliance |
| Spreading factor | Copy from code/configuration |
| Bandwidth | Copy from code/configuration |
| Coding rate | Copy from code/configuration |
| TX power | Copy from code/configuration and verify compliance |
| Maximum packet size | Determine from actual encoding |
| SOS first-send latency | Measure from physical button press to receiver log |
| Retry interval/count | Copy from code |
| ACK timeout/format | Copy from code |
| Duplicate suppression | Document actual sequence/timestamp logic |
| Receiver stale timeout | Copy from receiver code |
| Offline queue policy | Document capacity, overwrite strategy and recovery behavior |

Do not claim delivery is guaranteed merely because the radio library reports that a packet was sent. End-to-end evidence should cover packet receipt, acknowledgment, retransmission, receiver outage and radio loss.

## 6. Receiver validation

The receiver should:
1. Check that the packet is a supported type.
2. Validate required fields and parse numeric values safely.
3. Associate the message with a worker/device ID.
4. Discard or flag malformed values rather than crashing.
5. Detect duplicates if the protocol supports sequence identifiers.
6. Update last-seen time and mark stale/disconnected state after a defined timeout.
7. prioritize an SOS event in the user interface and event log.
8. expose receive quality information, such as RSSI/SNR, when supported.
9. avoid treating missing telemetry as a normal worker state.

## 7. Security

Do not assume that LoRa provides application-layer confidentiality. If worker data is sensitive, document the application authentication, encryption, replay protection, key provisioning and access controls actually used. Do not publish production keys, SIM PINs, passwords or private device identifiers.
