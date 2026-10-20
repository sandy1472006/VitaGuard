# Release Checklist

## Technical consistency
- [ ] The BOM matches the physical prototype.
- [ ] The temperature sensor model is confirmed.
- [ ] The pin map matches source code and schematic.
- [ ] Firmware sampling intervals and all thresholds are copied from release configuration.
- [ ] Packet format/length/message IDs are identical in transmitter and receiver docs.
- [ ] LoRa SF/BW/CR/frequency/TX power are recorded accurately.
- [ ] GPS and GSM module models are identified where fitted.
- [ ] The enclosure figures match the final CAD.
- [ ] AI model names, versions and model hashes are recorded.
- [ ] Risk score and alert-state transitions match the deployed code.
- [ ] Test reports support any performance numbers.

## Media and publication
- [ ] All images are project-owned or properly licensed.
- [ ] Personal information is removed from photos/logs.
- [ ] Generated concept images are marked as concepts.
- [ ] As-built photos are captioned.
- [ ] IP and disclosure timing has been reviewed before public release.
- [ ] No secrets/credentials are committed.
- [ ] License terms are selected and applied deliberately.
- [ ] Team, institution and acknowledgments are accurate.

## Safety-critical review
- [ ] Sensor failure behavior has been tested.
- [ ] SOS is not gated solely by risk score.
- [ ] Receiver handles stale/malformed data.
- [ ] Battery, charger, boost and thermal behavior have been checked.
- [ ] Gas sensor limitations and calibration are explained.
- [ ] No certification or medical claim is made without evidence.
