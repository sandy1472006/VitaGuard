# Power System and Electrical Safety

## 1. Power architecture

Project notes identify a rechargeable 3.7 V nominal Li-ion/LiPo cell (the earlier build notes mention 2500 mAh), a TP4056 charging module and an XL6009 boost converter in the power arrangement. The exact final topology depends on the fitted module variants and should be represented in the as-built schematic.

## 2. Supply domains

- **Battery domain:** single-cell rechargeable supply with correct charge and discharge protection.
- **5 V domain:** used only by components that are designed for 5 V, according to the verified circuit.
- **3.3 V logic domain:** ESP32 logic, RA-02 and compatible sensors, according to their board documentation.
- **High-current outputs:** vibration motor and some buzzer configurations require a driver stage. ESP32 GPIOs must not directly source motor current.
- **Gas-sensor heater:** confirm the MQ-9 module's required supply and operating cycle. Do not assume a module's AO or VCC requirements from the sensor name alone.

## 3. Checks before powering the wearable

1. Confirm cell polarity, chemistry, capacity and protection.
2. Confirm charger input/output terminals and whether the board supports load sharing.
3. Measure the boost-converter output with no load and under load before connecting it.
4. Verify the ESP32 VIN/5V pin on the exact development board.
5. Never apply 5 V to the ESP32 3V3 pin or directly to RA-02 VCC.
6. Measure the gas-module analogue output and validate the divider before connecting the ADC.
7. Confirm common ground and connector polarity.
8. Check motor/buzzer transistor pinout against the exact package datasheet.
9. Attach the required LoRa antenna before transmission.
10. Inspect for exposed conductors, short circuits and hot components.

## 4. Battery runtime

Nominal cell capacity does not prove operating time. Record:
- cell model and rated capacity;
- measured average current during the real duty cycle;
- peak current during radio transmissions and modem activity;
- sensor heater load and duty cycle;
- runtime test start/end voltage and shutdown behavior;
- ambient temperature and test conditions.

The project report describes a 14+ hour target. Publish that as an observed performance result only with repeatable runtime-test evidence.

## 5. Safety limits

The prototype does not become an intrinsically safe or certified hazardous-area device merely because it is battery-powered or worn by an industrial worker. Deployment near combustible gas or in explosive atmospheres requires the applicable certification and professional evaluation.
