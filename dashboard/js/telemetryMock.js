/**
 * VitaGuard Supervisor 2.0 - Multi-Worker Fleet Dynamic Dataset
 * Meticulously calibrated for industrial occupational safety standards.
 * Regulatory limits: OSHA PEL 50 PPM (TWA-8h), NIOSH REL 35 PPM (TWA), 200 PPM ceiling.
 * Unified risk bands: SAFE (0–44), WARNING (45–74), CRITICAL (75–100).
 */

const WORKER_DATASETS = {
  'VG-014': {
    id: 'VG-014',
    name: 'R. Kumar',
    initials: 'RK',
    sector: 'Sector B • Boiler Plant 1',
    baselineHR: 'HR 72 – 92 BPM',
    restingHR: 78,
    connection: 'LoRa • -63 dBm',
    rssi: '-63 dBm',
    battery: 84,
    drs: 30,
    drsTag: 'SAFE',
    fsmState: 'NormalMonitoring',
    riskCallout: 'Heart rate slightly elevated above personal baseline (92 BPM); all atmospheric markers safe.',
    predictiveTitle: 'Stable risk trend',
    predictiveDesc: 'Minor cardiac acceleration detected. Ergonomic rest recommended before next thermal cycle.',
    fatigueTitle: 'Elevated attention',
    fatigueDesc: 'Heart rate remains above resting baseline while motion recovery is low.',
    fatigueBadge: '● ELEVATED',
    fatigueBadgeClass: 'badge-monitor-amber',
    fatiguePos: 72,
    vitals: {
      hr: 100,
      hrBadge: 'CAUTION',
      hrClass: 'badge-monitor-amber',
      hrNote: 'Baseline max 92 BPM',
      spo2: 96,
      spo2Badge: 'NORMAL',
      spo2Class: 'badge-normal-green',
      temp: 37.1,
      tempBadge: 'NORMAL',
      tempClass: 'badge-normal-green',
      gas: 16,
      gasBadge: 'SAFE (16 PPM)',
      gasClass: 'badge-normal-green',
      gasNote: 'Below 35 PPM NIOSH REL',
      motion: 'Low activity',
      motionBadge: 'LIVE',
      motionClass: 'badge-live-teal',
      battery: 84,
      batteryBadge: 'GOOD',
      batteryClass: 'badge-normal-green'
    },
    weights: {
      hr: 4,
      spo2: 0,
      gas: 5,
      temp: 1,
      motion: 20
    },
    baselineShift: {
      establishedAt: '06:05 (120s calibration complete)',
      restingHR: 76,
      maxSafeHR: 92,
      restingSpO2: 98,
      ambientTemp: 28.4,
      ambientCO: 12
    },
    events: [
      { time: '10:20', text: 'Heart rate reached 100 BPM (above personal baseline max 92 BPM)', type: 'yellow', severity: 'Caution' },
      { time: '09:38', text: 'Routine telemetry handshake verified (RSSI -63 dBm)', type: 'green', severity: 'Normal' },
      { time: '09:30', text: 'Sensor integrity and atmospheric checks passed', type: 'green', severity: 'Normal' },
      { time: '06:05', text: 'Shift start baseline established (120s ring buffer locked)', type: 'green', severity: 'Normal' }
    ],
    trendPath: "M25,60 C50,55 70,65 95,58 C120,52 145,68 170,55 C195,48 220,60 245,50 C270,45 295,55 335,48",
    trendArea: "M25,60 C50,55 70,65 95,58 C120,52 145,68 170,55 C195,48 220,60 245,50 C270,45 295,55 335,48 L335,85 L25,85 Z"
  },
  'VG-007': {
    id: 'VG-007',
    name: 'A. Sharma',
    initials: 'AS',
    sector: 'Sector A • Control Room',
    baselineHR: 'HR 68 – 84 BPM',
    restingHR: 72,
    connection: 'LoRa • -52 dBm',
    rssi: '-52 dBm',
    battery: 92,
    drs: 14,
    drsTag: 'SAFE',
    fsmState: 'NormalMonitoring',
    riskCallout: 'All physiological indicators fully aligned with resting baseline.',
    predictiveTitle: 'Optimal physiological status',
    predictiveDesc: 'Predictive algorithm forecasts nominal shift with zero acute fatigue.',
    fatigueTitle: 'Normal recovery',
    fatigueDesc: 'Resting pulse in normal distribution; steady ergonomic activity.',
    fatigueBadge: '● NORMAL',
    fatigueBadgeClass: 'badge-normal-green',
    fatiguePos: 20,
    vitals: {
      hr: 74,
      hrBadge: 'NORMAL',
      hrClass: 'badge-normal-green',
      spo2: 99,
      spo2Badge: 'NORMAL',
      spo2Class: 'badge-normal-green',
      temp: 36.6,
      tempBadge: 'NORMAL',
      tempClass: 'badge-normal-green',
      gas: 12,
      gasBadge: 'SAFE (12 PPM)',
      gasClass: 'badge-normal-green',
      gasNote: 'Nominal clean ambient',
      motion: 'Active walking',
      motionBadge: 'LIVE',
      motionClass: 'badge-live-teal',
      battery: 92,
      batteryBadge: 'EXCELLENT',
      batteryClass: 'badge-normal-green'
    },
    weights: {
      hr: 1,
      spo2: 0,
      gas: 0,
      temp: 1,
      motion: 12
    },
    baselineShift: {
      establishedAt: '06:02 (120s calibration complete)',
      restingHR: 70,
      maxSafeHR: 84,
      restingSpO2: 99,
      ambientTemp: 24.2,
      ambientCO: 9
    },
    events: [
      { time: '10:15', text: 'Shift telemetry check confirmed', type: 'green', severity: 'Normal' },
      { time: '09:50', text: 'Telemetry received (RSSI -52 dBm)', type: 'green', severity: 'Normal' },
      { time: '06:02', text: '120s shift baseline locked', type: 'green', severity: 'Normal' }
    ],
    trendPath: "M25,75 C50,72 80,78 120,70 C160,74 200,68 250,72 C290,70 320,68 335,66",
    trendArea: "M25,75 C50,72 80,78 120,70 C160,74 200,68 250,72 C290,70 320,68 335,66 L335,85 L25,85 Z"
  },
  'VG-023': {
    id: 'VG-023',
    name: 'S. Patel',
    initials: 'SP',
    sector: 'Sector D • Boiler Foundry',
    baselineHR: 'HR 75 – 90 BPM',
    restingHR: 80,
    connection: 'LoRa • -78 dBm',
    rssi: '-78 dBm',
    battery: 64,
    drs: 68,
    drsTag: 'WARNING',
    fsmState: 'ElevatedWatch',
    riskCallout: 'Thermal heat strain warning (38.6°C). Worker advised to enter cool zone.',
    predictiveTitle: 'Escalating heat stress',
    predictiveDesc: 'Risk of heat exhaustion within 12 minutes if foundry exposure continues.',
    fatigueTitle: 'High strain observed',
    fatigueDesc: 'Cardiac workload elevated while core body heat accumulates.',
    fatigueBadge: '● HIGH STRAIN',
    fatigueBadgeClass: 'badge-elevated-red',
    fatiguePos: 86,
    vitals: {
      hr: 122,
      hrBadge: 'DANGER (>120)',
      hrClass: 'badge-elevated-red',
      hrNote: 'Tachycardia alert',
      spo2: 95,
      spo2Badge: 'WATCH',
      spo2Class: 'badge-monitor-amber',
      temp: 38.6,
      tempBadge: 'HEAT STRAIN',
      tempClass: 'badge-elevated-red',
      gas: 48,
      gasBadge: 'CAUTION (48 PPM)',
      gasClass: 'badge-monitor-amber',
      gasNote: 'Above 35 PPM NIOSH REL',
      motion: 'Heavy exertion',
      motionBadge: 'LIVE',
      motionClass: 'badge-live-teal',
      battery: 64,
      batteryBadge: 'FAIR',
      batteryClass: 'badge-normal-green'
    },
    weights: {
      hr: 18,
      spo2: 4,
      gas: 8,
      temp: 24,
      motion: 14
    },
    baselineShift: {
      establishedAt: '06:10 (120s calibration complete)',
      restingHR: 78,
      maxSafeHR: 90,
      restingSpO2: 97,
      ambientTemp: 31.0,
      ambientCO: 15
    },
    events: [
      { time: '10:14', text: 'Thermal strain warning issued (Skin Temp 38.6°C)', type: 'red', severity: 'Warning' },
      { time: '10:02', text: 'Tachycardia alert (>120 BPM sustained for 60s)', type: 'red', severity: 'Warning' },
      { time: '09:45', text: 'Foundry perimeter entered', type: 'green', severity: 'Normal' }
    ],
    trendPath: "M25,65 C50,58 90,48 140,42 C180,36 230,30 270,25 C300,22 320,18 335,16",
    trendArea: "M25,65 C50,58 90,48 140,42 C180,36 230,30 270,25 C300,22 320,18 335,16 L335,85 L25,85 Z"
  },
  'VG-042': {
    id: 'VG-042',
    name: 'M. Singh',
    initials: 'MS',
    sector: 'Sector C • Chemical Processing',
    baselineHR: 'HR 70 – 88 BPM',
    restingHR: 74,
    connection: 'LoRa • -84 dBm',
    rssi: '-84 dBm',
    battery: 51,
    drs: 92,
    drsTag: 'CRITICAL',
    fsmState: 'CriticalAlarm',
    riskCallout: 'CRITICAL HAZARD: Toxic CO spike (840 PPM) + stumbling gait. Evacuation underway.',
    predictiveTitle: 'Acute toxic asphyxiation risk',
    predictiveDesc: 'Dangerous gas concentration detected. Acoustic siren active.',
    fatigueTitle: 'Severe distress',
    fatigueDesc: 'Critical oxygen desaturation with acute toxic atmospheric displacement.',
    fatigueBadge: '● DANGER',
    fatigueBadgeClass: 'badge-elevated-red',
    fatiguePos: 98,
    vitals: {
      hr: 112,
      hrBadge: 'HIGH',
      hrClass: 'badge-elevated-red',
      hrNote: 'Above baseline max 88 BPM',
      spo2: 91,
      spo2Badge: 'CRITICAL (<92%)',
      spo2Class: 'badge-elevated-red',
      temp: 37.4,
      tempBadge: 'NORMAL',
      tempClass: 'badge-normal-green',
      gas: 840,
      gasBadge: 'DANGER (840 PPM)',
      gasClass: 'badge-elevated-red',
      gasNote: 'Exceeds 200 PPM ceiling!',
      motion: 'Stumbling / erratic',
      motionBadge: 'LIVE',
      motionClass: 'badge-elevated-red',
      battery: 51,
      batteryBadge: 'FAIR',
      batteryClass: 'badge-normal-green'
    },
    weights: {
      hr: 15,
      spo2: 15,
      gas: 40,
      temp: 2,
      motion: 20
    },
    baselineShift: {
      establishedAt: '06:12 (120s calibration complete)',
      restingHR: 74,
      maxSafeHR: 88,
      restingSpO2: 98,
      ambientTemp: 26.5,
      ambientCO: 14
    },
    events: [
      { time: '10:18', text: 'CRITICAL ALARM: CO 840 PPM (exceeds 200 PPM ceiling)', type: 'red', severity: 'Critical' },
      { time: '10:16', text: 'Gait anomaly: Impact shock / stumble detected (ADXL345 dynamic vector spike)', type: 'red', severity: 'Critical' },
      { time: '10:10', text: 'Toxic gas gradient rise warning (>50 PPM/min)', type: 'red', severity: 'Warning' }
    ],
    trendPath: "M25,55 C60,50 110,40 160,30 C200,22 250,15 290,10 C310,8 325,5 335,5",
    trendArea: "M25,55 C60,50 110,40 160,30 C200,22 250,15 290,10 C310,8 325,5 335,5 L335,85 L25,85 Z"
  },
  // Additional fleet workers completing full 12-worker industrial shift
  'VG-001': {
    id: 'VG-001', name: 'V. Mehta', initials: 'VM', sector: 'Sector A • Assembly 1',
    baselineHR: 'HR 70 – 86 BPM', connection: 'LoRa • -58 dBm', rssi: '-58 dBm', battery: 89,
    drs: 18, drsTag: 'SAFE', fsmState: 'NormalMonitoring', vitals: { hr: 76, spo2: 98, temp: 36.7, gas: 14, motion: 'Normal active', battery: 89 },
    weights: { hr: 2, spo2: 0, gas: 1, temp: 1, motion: 14 }
  },
  'VG-002': {
    id: 'VG-002', name: 'K. Yadav', initials: 'KY', sector: 'Sector A • Assembly 2',
    baselineHR: 'HR 68 – 85 BPM', connection: 'LoRa • -61 dBm', rssi: '-61 dBm', battery: 88,
    drs: 22, drsTag: 'SAFE', fsmState: 'NormalMonitoring', vitals: { hr: 80, spo2: 97, temp: 36.9, gas: 15, motion: 'Normal active', battery: 88 },
    weights: { hr: 3, spo2: 1, gas: 1, temp: 1, motion: 16 }
  },
  'VG-003': {
    id: 'VG-003', name: 'D. Rao', initials: 'DR', sector: 'Sector B • Conveyor Line',
    baselineHR: 'HR 72 – 88 BPM', connection: 'LoRa • -66 dBm', rssi: '-66 dBm', battery: 82,
    drs: 16, drsTag: 'SAFE', fsmState: 'NormalMonitoring', vitals: { hr: 75, spo2: 99, temp: 36.8, gas: 13, motion: 'Normal active', battery: 82 },
    weights: { hr: 1, spo2: 0, gas: 1, temp: 1, motion: 13 }
  },
  'VG-005': {
    id: 'VG-005', name: 'P. Joshi', initials: 'PJ', sector: 'Sector B • Maintenance',
    baselineHR: 'HR 74 – 90 BPM', connection: 'LoRa • -69 dBm', rssi: '-69 dBm', battery: 78,
    drs: 25, drsTag: 'SAFE', fsmState: 'NormalMonitoring', vitals: { hr: 82, spo2: 98, temp: 37.0, gas: 18, motion: 'Active climbing', battery: 78 },
    weights: { hr: 4, spo2: 0, gas: 2, temp: 1, motion: 18 }
  },
  'VG-009': {
    id: 'VG-009', name: 'N. Verma', initials: 'NV', sector: 'Sector C • Storage Bay',
    baselineHR: 'HR 69 – 86 BPM', connection: 'LoRa • -72 dBm', rssi: '-72 dBm', battery: 94,
    drs: 28, drsTag: 'SAFE', fsmState: 'NormalMonitoring', vitals: { hr: 84, spo2: 97, temp: 36.9, gas: 20, motion: 'Moderate lifting', battery: 94 },
    weights: { hr: 5, spo2: 1, gas: 2, temp: 1, motion: 19 }
  },
  'VG-011': {
    id: 'VG-011', name: 'T. Das', initials: 'TD', sector: 'Sector C • Packaging',
    baselineHR: 'HR 71 – 87 BPM', connection: 'LoRa • -64 dBm', rssi: '-64 dBm', battery: 86,
    drs: 19, drsTag: 'SAFE', fsmState: 'NormalMonitoring', vitals: { hr: 77, spo2: 98, temp: 36.8, gas: 14, motion: 'Normal active', battery: 86 },
    weights: { hr: 2, spo2: 0, gas: 1, temp: 1, motion: 15 }
  },
  'VG-018': {
    id: 'VG-018', name: 'B. Reddy', initials: 'BR', sector: 'Sector D • Logistics',
    baselineHR: 'HR 75 – 92 BPM', connection: 'LoRa • -70 dBm', rssi: '-70 dBm', battery: 80,
    drs: 32, drsTag: 'SAFE', fsmState: 'NormalMonitoring', vitals: { hr: 88, spo2: 96, temp: 37.2, gas: 22, motion: 'Heavy walking', battery: 80 },
    weights: { hr: 6, spo2: 2, gas: 2, temp: 2, motion: 20 }
  },
  'VG-027': {
    id: 'VG-027', name: 'J. Pillai', initials: 'JP', sector: 'Sector D • Electrical Substation',
    baselineHR: 'HR 70 – 86 BPM', connection: 'LoRa • -74 dBm', rssi: '-74 dBm', battery: 75,
    drs: 24, drsTag: 'SAFE', fsmState: 'NormalMonitoring', vitals: { hr: 81, spo2: 98, temp: 36.9, gas: 16, motion: 'Normal active', battery: 75 },
    weights: { hr: 3, spo2: 1, gas: 1, temp: 1, motion: 18 }
  }
};

window.WORKER_DATASETS = WORKER_DATASETS;
