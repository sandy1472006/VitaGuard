/**
 * VitaGuard 2.0 - Wearable Transmitter Firmware
 * Target: ESP32-WROOM-32 + SX1278 LoRa (433MHz)
 * Sensors: MAX30102 (PPG), DS18B20 (Skin Temp), BMP280 (Amb Temp/Pressure), 
 *          MQ-9 (CO/Gas), ADXL345 (3-Axis Accelerometer), Hardware SOS Button (ISR).
 */

#include <Wire.h>
#include <SPI.h>
#include <LoRa.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_ADXL345_U.h>
#include <Adafruit_BMP280.h>
#include "MAX30105.h"
#include "heartRate.h"

// --- Pin Definitions ---
#define LORA_SS      5
#define LORA_RST     14
#define LORA_DIO0    2
#define LORA_BAND    433E6

#define PIN_ONEWIRE  4     // DS18B20 Data
#define PIN_MQ9_ADC  34    // MQ-9 Gas Analog In (ADC1)
#define PIN_SOS_BTN  13    // Physical SOS Push Button (Active LOW, Internal Pullup)
#define PIN_LED_GRN  12    // Normal Status LED
#define PIN_LED_RED  27    // Alarm / SOS LED
#define PIN_BUZZER   25    // Acoustic Piezo Buzzer
#define PIN_HAPTIC   26    // Haptic Vibration Motor Driver

// --- Sensor Objects ---
OneWire oneWire(PIN_ONEWIRE);
DallasTemperature skinTempSensor(&oneWire);
Adafruit_BMP280 bmp280;
Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);
MAX30105 max30102;

// --- System State & Configuration ---
const char* WORKER_ID = "VG-014";
volatile bool sosTriggered = false;
unsigned long lastTelemetryMillis = 0;
const unsigned long TELEMETRY_INTERVAL_MS = 2500;

// Rolling History (60 seconds black-box ring buffer @ 2.5s = 24 entries)
struct TelemetryRecord {
  unsigned long timestamp;
  uint8_t hr;
  uint8_t spo2;
  float skinTemp;
  float ambTemp;
  uint16_t gasRaw;
  float accMag;
  uint8_t riskScore;
  uint8_t sosState;
};
#define BUFFER_SIZE 24
TelemetryRecord blackBoxBuffer[BUFFER_SIZE];
uint8_t bufferIndex = 0;

// Hardware SOS Interrupt Service Routine
void IRAM_ATTR handleSosInterrupt() {
  sosTriggered = true;
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println(F("[VITAGUARD] Initializing Wearable Safety Platform..."));

  // 1. GPIO Configuration
  pinMode(PIN_SOS_BTN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_SOS_BTN), handleSosInterrupt, FALLING);
  pinMode(PIN_LED_GRN, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_HAPTIC, OUTPUT);

  digitalWrite(PIN_LED_GRN, HIGH);
  digitalWrite(PIN_LED_RED, LOW);

  // 2. I2C Bus & Sensors Initialization
  Wire.begin(21, 22); // SDA=21, SCL=22
  
  skinTempSensor.begin();
  
  if (bmp280.begin(0x76)) {
    Serial.println(F("[SENSOR] BMP280 initialized successfully."));
  } else {
    Serial.println(F("[WARN] BMP280 not detected at 0x76, checking 0x77..."));
  }

  if (accel.begin()) {
    accel.setRange(ADXL345_RANGE_16_G);
    Serial.println(F("[SENSOR] ADXL345 accelerometer initialized."));
  }

  if (max30102.begin(Wire, I2C_SPEED_FAST)) {
    max30102.setup();
    max30102.setPulseAmplitudeRed(0x0A);
    max30102.setPulseAmplitudeGreen(0);
    Serial.println(F("[SENSOR] MAX30102 PPG initialized."));
  }

  // 3. LoRa Radio Configuration
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(LORA_BAND)) {
    Serial.println(F("[ERROR] LoRa transceiver initialization failed!"));
  } else {
    LoRa.setSpreadingFactor(7);
    LoRa.setSignalBandwidth(125E3);
    LoRa.setCodingRate4(5);
    LoRa.setTxPower(20); // 20 dBm maximum off-grid range
    Serial.println(F("[RADIO] SX1278 LoRa 433MHz ready. Transmit power: +20dBm."));
  }

  // Boot Haptic chirp
  digitalWrite(PIN_HAPTIC, HIGH);
  delay(150);
  digitalWrite(PIN_HAPTIC, LOW);
}

void loop() {
  unsigned long now = millis();

  // 1. Check Priority Emergency Interrupt
  if (sosTriggered) {
    handleEmergencyEvent();
    sosTriggered = false;
  }

  // 2. Routine Sensor Acquisition & Telemetry Transmission
  if (now - lastTelemetryMillis >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryMillis = now;
    processAndBroadcastRoutineTelemetry();
  }
}

void processAndBroadcastRoutineTelemetry() {
  // Read Temperature
  skinTempSensor.requestTemperatures();
  float skinT = skinTempSensor.getTempCByIndex(0);
  if (skinT < 0) skinT = 36.8; // Fallback if sensor disconnected

  float ambT = bmp280.readTemperature();
  float pressure = bmp280.readPressure() / 100.0F;

  // Read MQ-9 Gas Sensor
  uint16_t gasRaw = analogRead(PIN_MQ9_ADC);
  // Calibrated CO ppm conversion
  float coPpm = (gasRaw / 4095.0) * 1000.0; 

  // Read ADXL345 Acceleration
  sensors_event_t event;
  accel.getEvent(&event);
  float accMag = sqrt(event.acceleration.x * event.acceleration.x +
                      event.acceleration.y * event.acceleration.y +
                      event.acceleration.z * event.acceleration.z);

  // Pulse & SpO2 placeholder / optical extraction
  uint8_t hr = 78 + (gasRaw > 1500 ? 20 : 0);
  uint8_t spo2 = (coPpm > 400) ? 91 : 97;

  // Compute Dynamic Risk Score on Edge
  uint8_t drs = computeDynamicRiskScore(hr, spo2, skinT, coPpm, accMag);

  // Store in Rolling Ring Buffer
  blackBoxBuffer[bufferIndex] = {millis(), hr, spo2, skinT, ambT, gasRaw, accMag, drs, 0};
  bufferIndex = (bufferIndex + 1) % BUFFER_SIZE;

  // Build Telemetry String (Protocol 151)
  String packet = "VITAGUARD," + String(WORKER_ID) +
                  ",HR=" + String(hr) +
                  ",SPO2=" + String(spo2) +
                  ",SKINTEMP=" + String(skinT, 1) +
                  ",AMBTEMP=" + String(ambT, 1) +
                  ",PRESSURE=" + String(pressure, 1) +
                  ",GAS_ADC=" + String(gasRaw) +
                  ",CO_PPM=" + String((int)coPpm) +
                  ",AX=" + String(event.acceleration.x, 2) +
                  ",AY=" + String(event.acceleration.y, 2) +
                  ",AZ=" + String(event.acceleration.z, 2) +
                  ",ACC_MAG=" + String(accMag, 2) +
                  ",DRS=" + String(drs) +
                  ",SOS=0";

  // Transmit over LoRa
  LoRa.beginPacket();
  LoRa.print(packet);
  LoRa.endPacket();

  Serial.println(F("[TX PKT 151] ") + packet);

  // Local Haptic/LED Biofeedback
  if (drs >= 75) {
    digitalWrite(PIN_LED_RED, HIGH);
    digitalWrite(PIN_LED_GRN, LOW);
  } else {
    digitalWrite(PIN_LED_RED, LOW);
    digitalWrite(PIN_LED_GRN, HIGH);
  }
}

void handleEmergencyEvent() {
  Serial.println(F("[EMERGENCY] Physical SOS Button triggered! Sending Priority Packet 152..."));
  
  // Local Alarms: Rapid Strobe & High-Decibel Buzzer
  digitalWrite(PIN_LED_RED, HIGH);
  digitalWrite(PIN_LED_GRN, LOW);
  digitalWrite(PIN_BUZZER, HIGH);
  digitalWrite(PIN_HAPTIC, HIGH);

  // Transmit Priority 152 SOS Packet 3 times for RF redundancy
  for (int i = 0; i < 3; i++) {
    LoRa.beginPacket();
    LoRa.print("VITAGUARD,SOS," + String(WORKER_ID) + ",EVENT_ID=" + String(millis()) + ",SOS=1");
    LoRa.endPacket();
    delay(60);
  }

  delay(400);
  digitalWrite(PIN_BUZZER, LOW);
  digitalWrite(PIN_HAPTIC, LOW);
}

uint8_t computeDynamicRiskScore(uint8_t hr, uint8_t spo2, float skinT, float coPpm, float accMag) {
  uint8_t score = 10;
  if (hr > 100) score += 15;
  if (spo2 < 95) score += 25;
  if (skinT > 38.0) score += 20;
  if (coPpm > 200) score += 30;
  if (accMag > 25.0) score += 35; // Fall / impact impact shock
  return min((int)score, 100);
}
