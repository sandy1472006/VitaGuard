/**
 * VitaGuard 2.0 - Base Station Receiver Firmware
 * Target: ESP32 + SX1278 LoRa Receiver (433MHz)
 * Features: LoRa packet decoder, SoftAP / Wi-Fi Web Server exposing /telemetry REST API.
 */

#include <SPI.h>
#include <LoRa.h>
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

#define LORA_SS      5
#define LORA_RST     14
#define LORA_DIO0    2
#define LORA_BAND    433E6

// Wi-Fi Access Point Credentials
const char* AP_SSID = "VitaGuard-BaseStation";
const char* AP_PASS = "WorkerSafety2026";

WebServer server(80);

// Global latest telemetry cache
struct LatestTelemetry {
  String workerId = "VG-014";
  int hr = 99;
  int spo2 = 96;
  float skinTemp = 37.1;
  float ambTemp = 31.2;
  int coPpm = 171;
  String motion = "Low activity";
  int battery = 84;
  int drs = 30;
  int sos = 0;
  int rssi = -63;
  unsigned long lastSeen = 0;
} telemetry;

void handleTelemetryEndpoint() {
  StaticJsonDocument<512> doc;
  doc["workerId"] = telemetry.workerId;
  doc["hr"] = telemetry.hr;
  doc["spo2"] = telemetry.spo2;
  doc["skinTemp"] = telemetry.skinTemp;
  doc["ambTemp"] = telemetry.ambTemp;
  doc["coPpm"] = telemetry.coPpm;
  doc["motion"] = telemetry.motion;
  doc["battery"] = telemetry.battery;
  doc["drs"] = telemetry.drs;
  doc["sos"] = telemetry.sos;
  doc["rssi"] = telemetry.rssi;
  doc["lastSeenMs"] = millis() - telemetry.lastSeen;

  String response;
  serializeJson(doc, response);
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", response);
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println(F("[BASE_STATION] Starting VitaGuard Receiver Node..."));

  // 1. SoftAP Setup
  WiFi.softAP(AP_SSID, AP_PASS);
  IPAddress IP = WiFi.softAPIP();
  Serial.print(F("[WIFI] Access Point active. SSID: "));
  Serial.print(AP_SSID);
  Serial.print(F(" | IP: "));
  Serial.println(IP);

  // 2. HTTP Server Endpoints
  server.on("/telemetry", HTTP_GET, handleTelemetryEndpoint);
  server.begin();
  Serial.println(F("[HTTP] Telemetry REST server listening on port 80"));

  // 3. LoRa Radio Receiver Setup
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(LORA_BAND)) {
    Serial.println(F("[ERROR] LoRa transceiver initialization failed!"));
  } else {
    LoRa.setSpreadingFactor(7);
    LoRa.setSignalBandwidth(125E3);
    LoRa.setCodingRate4(5);
    Serial.println(F("[RADIO] LoRa receiver active at 433MHz."));
  }
}

void loop() {
  server.handleClient();

  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    String incoming = "";
    while (LoRa.available()) {
      incoming += (char)LoRa.read();
    }
    telemetry.rssi = LoRa.packetRssi();
    telemetry.lastSeen = millis();

    Serial.print(F("[RX PKT] "));
    Serial.print(incoming);
    Serial.print(F(" | RSSI: "));
    Serial.println(telemetry.rssi);

    // Basic CSV Tokenizer for Protocol 151 / 152
    if (incoming.startsWith("VITAGUARD")) {
      if (incoming.indexOf(",SOS,") > 0) {
        telemetry.sos = 1;
        telemetry.drs = 95;
      } else {
        telemetry.sos = 0;
        // Parse individual fields if present
        if (incoming.indexOf("HR=") > 0) {
          int idx = incoming.indexOf("HR=");
          telemetry.hr = incoming.substring(idx + 3, incoming.indexOf(",", idx)).toInt();
        }
        if (incoming.indexOf("SPO2=") > 0) {
          int idx = incoming.indexOf("SPO2=");
          telemetry.spo2 = incoming.substring(idx + 5, incoming.indexOf(",", idx)).toInt();
        }
        if (incoming.indexOf("CO_PPM=") > 0) {
          int idx = incoming.indexOf("CO_PPM=");
          telemetry.coPpm = incoming.substring(idx + 7, incoming.indexOf(",", idx)).toInt();
        }
      }
    }
  }
}
