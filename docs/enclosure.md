# Enclosure, Wearability and Sensor Mounting

## 1. Prototype enclosure

The current photos show a compact black 3D-printed rectangular enclosure worn on the arm with straps. The front includes a red SOS button, a green status LED and a circular front-mounted element. A side panel carries a rocker-style power switch and ventilation openings. Internal photographs show the controller/protoboard, sensor modules, wires, connectors and power hardware.

## 2. Mechanical subsystems

- Front housing with button and status openings.
- Rear cover/back plate.
- Strap retention slots and hook-and-loop/Velcro straps.
- Skin-facing mounting region for optical sensing and temperature sensing.
- Ventilated region for the gas-sensing module.
- Internal PCB/protoboard supports and wiring clearance.
- Power switch and charging access.
- Screw bosses/standoffs and cover retention.
- Seal/gasket or spacer if included in the actual build.

## 3. Sensor placement

### MAX30102
Use the exact optical window and ensure stable skin contact. Record which side of the enclosure faces the wearer and how the sensor is prevented from light leakage and excessive motion.

### Contact temperature sensor
If DS18B20 is fitted, document where the sensing element touches the skin and how it is retained. If MLX90614 is fitted instead, document the non-contact target, field of view, optical opening and distance; do not describe it as a contact sensor.

### MQ-9
The gas sensor must access ambient air through suitable openings. Where the sensor or module includes a heated sensing element, its thermal output and air path must be kept suitably separated from the wearer and temperature/optical sensors. The actual airflow, housing and thermal separation should be shown in the as-built drawing.

### ADXL345
Document mounting orientation and axis direction relative to the user's arm. The sensor orientation should match the transform used by the firmware.

## 4. Images recommended

Place final, clearly captured images in `docs/images/prototype/`:
- `worn-front.jpg`
- `worn-side-switch.jpg`
- `worn-angle.jpg`
- `rear-skin-contact.jpg`
- `electronics-open.jpg`
- `controller-board.jpg`
- `sensor-layout.jpg`
- `strap-mounting.jpg`
- `exploded-assembly.png`
- `orthographic-views.png`
- `complete-schematic.png`

Use dimensions from the actual CAD and prototype, not generated concept renderings. Orthographic and exploded figures in a public GitHub repo should not be called manufacturing drawings until measured dimensions and connections are confirmed.
