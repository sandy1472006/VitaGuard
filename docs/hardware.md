# Hardware and Bill of Materials

This document describes the VitaGuard 2.0 hardware stack. The final public repository should use the *as-built* part numbers and not merely the generic family names in this table.

## 1. Wearable components

| Ref. | Component | Intended role | Integration notes |
|---|---|---|---|
| U1 | ESP32-WROOM-32 development board | Main control, sensor acquisition, local logic and communications coordination | Verify exact dev board and its VIN/5V pin arrangement |
| U2 | MAX30102 module | Optical red/IR readings, heart-rate estimation and SpO₂-related output | Ensure skin contact and optical signal-quality handling |
| U3 | DS18B20, or actual final temperature module | Contact/skin-surface temperature | Confirm actual fitted model; older design discussion also mentioned MLX90614 |
| U4 | BMP280 module | Ambient temperature and barometric pressure | Does not measure oxygen concentration |
| U5 | MQ-9 gas-sensor module | Gas-responsive analogue/digital output according to module design | Confirm target gas, module variant, heater requirements, warm-up and calibration |
| U6 | ADXL345 module | Three-axis acceleration for movement/impact and fall-analysis input | Does not directly measure muscle force or muscle strain |
| U7 | SX1278 / RA-02 LoRa module | Direct sub-GHz radio | 3.3 V logic/supply as specified by module; use antenna during transmission |
| U8 | GPS receiver, when fitted | Location fix | Record exact manufacturer/model and behavior when indoor or no fix |
| U9 | GSM/SMS modem, when fitted | Secondary emergency notification path | Record exact model, SIM/network requirements and power peaks |
| Q1 | NPN driver / motor driver | Drive vibration motor where bare motor is used | Motor must not draw operating current directly from GPIO |
| Q2 | Buzzer driver or buzzer module | Audible alert | Verify whether the installed buzzer is active/passive and the actual driver |
| SW1 | Physical SOS push button | Manual emergency input | Record normal state, debounce and press logic |
| LED1/LED2 | Status LEDs | Normal/alert indication | Include actual GPIOs and series resistor values |
| BT1 | 3.7 V nominal rechargeable cell | Portable power | Record cell model, capacity, protection and measured runtime |
| U10 | TP4056 charging module (if fitted) | Single-cell charging | Confirm exact board; some variants include protection/load terminals, others differ |
| U11 | XL6009 boost converter (if fitted) | Boost supply for 5 V load rail | Verify measured output and connected loads |
| U12 | microSD module (if fitted) | Event-history storage | Check module voltage and level shifting; confirm CS pin |
| PCB1 | 5 × 7 cm protoboard / actual PCB | Mounting/interconnection | Measure actual dimensions and document board revision |

## 2. Reference pin map

The following mapping comes from the previously discussed VitaGuard prototype design. **Compare it with the exact release firmware and physical wiring before treating it as authoritative.**

| Signal/device | ESP32 pin | Electrical notes |
|---|---:|---|
| Shared I²C SDA | GPIO21 | MAX30102, BMP280 and ADXL345 on one bus where address compatibility permits |
| Shared I²C SCL | GPIO22 | Shared I²C bus |
| DS18B20 DATA | GPIO4 | Earlier design uses a 4.7 kΩ pull-up to 3.3 V |
| MQ-9 analogue reading | GPIO34 | ADC input only; protect from any voltage above the permitted range |
| SOS button | GPIO27 | Earlier code uses `INPUT_PULLUP`, button to GND |
| LoRa SCK | GPIO18 | SPI clock |
| LoRa MISO | GPIO19 | SPI MISO |
| LoRa MOSI | GPIO23 | SPI MOSI |
| LoRa NSS/CS | GPIO5 | Chip select |
| LoRa RESET | GPIO14 | Reset line |
| LoRa DIO0 | GPIO26 | Radio interrupt/status line, according to library/module use |
| microSD CS | GPIO13 | Optional SD CS; shared SPI bus |
| Vibration driver control | GPIO25 | Verify firmware assignment and driver polarity |
| Buzzer driver control | GPIO33 | Verify actual driver and firmware assignment |
| Status LEDs | Must be confirmed | Insert the final GPIO assignments and resistor values from the release schematic |

## 3. MQ-9 analogue input

The earlier reference circuit uses a divider with:

- Rtop = 15 kΩ from module AO to the ADC node.
- Rbottom = 10 kΩ from the ADC node to ground.
- ADC node to ESP32 GPIO34.

For a 5.0 V AO, the ideal divider output is approximately:

`VADC = 5.0 V × 10 kΩ / (15 kΩ + 10 kΩ) = 2.0 V`

This example assumes those exact resistors and a maximum 5 V AO. Measure the actual module output, verify the ADC's permitted range and confirm the divider is present on the built device. The raw ADC result is not a gas concentration without calibration.

## 4. I²C, SPI and ground

- I²C devices share SDA/SCL only when addresses and pull-ups are compatible.
- LoRa and microSD can share SPI signals if each has a separate chip-select and the exact modules support the same bus voltage.
- All interconnected modules require a compatible signal reference and common ground, subject to the designed power isolation arrangement.
- RA-02 must not be powered from 5 V unless a separate, correctly rated regulator is present; its module supply requirements are 3.3 V.
- Do not connect a 5 V analogue output directly to ESP32 GPIO34.

## 5. Final BOM fields to publish

Add a complete inventory with manufacturer, module name, part number, quantity, supplier/source if useful, supply voltage, interface, mounting location and replacement part. Record the actual battery chemistry/capacity and the precise charger/boost board variant. Photographs cannot prove the internal wiring or board revision.
