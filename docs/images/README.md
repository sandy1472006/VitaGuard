# VitaGuard 2.0 Visual Gallery & Engineering Asset Library

This directory contains verified engineering photographs, 3D CAD renders, hardware wiring views, and UI telemetry screenshots for the VitaGuard 2.0 wearable worker-safety platform.

---

## 📸 Prototype Photographs & Field Wearability

### 1. Upper-Arm Field Deployment (Front View)
**Filename:** [`prototype-worn-front.jpg`](prototype-worn-front.jpg)  
**Description:** As-built prototype secured to worker's upper arm with dual heavy-duty velcro straps. Shows tactile red mushroom emergency SOS button, active emerald LED indicator (illuminated), protruding MQ-9 gas sampling chamber, side rocker power switch, and acoustic siren/ventilation louvers.  
<div align="center">
  <img src="prototype-worn-front.jpg" width="480" alt="VitaGuard Wearable Prototype Worn on Arm (Front View)">
</div>

---

### 2. Side Elevation & High-Gain RF Antenna Mounting
**Filename:** [`prototype-worn-side-antenna.jpg`](prototype-worn-side-antenna.jpg)  
**Description:** Side-profile of the wearable unit showing the recessed SMA antenna integration for the SX1278 LoRa transceiver (433MHz). The low-profile antenna orientation prevents snagging hazards in tight mining shafts and industrial scaffolding.  
<div align="center">
  <img src="prototype-worn-side-antenna.jpg" width="480" alt="VitaGuard Wearable Prototype Worn on Arm (Side Profile)">
</div>

---

## 🔬 CAD Design & Mechanical Enclosure

### 3. SolidWorks 3D Parametric Enclosure Model
**Filename:** [`cad-3d-enclosure.jpg`](cad-3d-enclosure.jpg)  
**Description:** Parametric CAD model (`Boss-Extrude1`) of the upper shell showing precision tolerances: 19.5mm circular MQ-9 gas sensor port, 12mm SOS button collar, twin 5mm LED light-pipes, speaker/buzzer grill pattern (16-hole honeycomb), and lateral strap routing slots. Outer dimensions: $115 \times 70 \times 40\text{ mm}$.  
<div align="center">
  <img src="cad-3d-enclosure.jpg" width="540" alt="SolidWorks CAD 3D Enclosure Model">
</div>

---

## ⚡ Internal Electronics & Hardware Assembly

### 4. Controller, Power Management & Sensor Interconnects
**Filename:** [`hardware-internal-wiring.jpg`](hardware-internal-wiring.jpg)  
**Description:** High-density electronics bay inside the 3D-printed enclosure. Features the central ESP32-WROOM-32 MCU board, dedicated power distribution rails (3.3V / 5.0V), 18650 Li-ion rechargeable cell (3.7V 2600mAh), DC-DC boost-buck regulator module with multi-turn potentiometer, shielded wiring harnesses, and SMA pigtail connector.  
<div align="center">
  <img src="hardware-internal-wiring.jpg" width="480" alt="Internal Hardware Wiring and Electronics Bay">
</div>

---

## 🖥️ Live Supervisor Dashboard & Telemetry Monitor

### 5. Central Safety Operations Console
**Filename:** [`dashboard-live-view.png`](dashboard-live-view.png)  
**Description:** Live supervisory view displaying real-time telemetry from worker `VG-014 (R. Kumar)`. Illustrates Dynamic Risk Score (30/100 SAFE), multi-sensor real-time telemetry (Heart Rate, SpO2, Temperature, CO Exposure, Motion, Battery), personal AI sensor fusion breakdown bar chart, and predictive fatigue analysis.  
<div align="center">
  <img src="dashboard-live-view.png" width="900" alt="VitaGuard Live Supervisor Dashboard">
</div>
