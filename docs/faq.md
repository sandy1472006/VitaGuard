# FAQ

### Does VitaGuard require internet to send SOS?
The direct wearable-to-base-station LoRa hop is designed not to require internet. Reception still depends on a working compatible receiver within radio coverage. Optional GSM/SMS, BLE and cloud paths have their own dependencies.

### Does the MQ-9 output directly provide CO ppm?
No. The raw ADC value must not be called ppm without an appropriate calibration and conversion method validated for the actual module and environment.

### Does the BMP280 measure oxygen percentage?
No. It reports pressure and temperature. It cannot directly measure oxygen concentration.

### Is the MAX30102 output automatically medical-grade?
No. Signal contact, motion, fit, algorithm choice and validation all affect its output.

### Does the ADXL345 measure muscle strain?
No. It measures acceleration. Movement features may be used as an indirect proxy, but that is not a direct strain measurement.

### What radio range should be claimed?
Publish the measured range and packet delivery rate from a defined test. Range depends on the antenna, radio configuration, terrain, structures and installation.

### Should the GitHub repository be public while a patent is being prepared?
Keep it private until a registered patent agent advises that disclosure is appropriate. Public technical detail can affect filing strategy.
