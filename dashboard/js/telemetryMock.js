/**
 * VitaGuard Supervisor - Telemetry Mock Data & Multi-Worker Profiles
 */

const WORKER_PROFILES = {
  'VG-014': {
    id: 'VG-014',
    name: 'R. Kumar',
    sector: 'Sector B - Day Shift',
    baselineHR: 'HR 72-92 BPM',
    connection: 'Wi-Fi / LoRa • -63 dBm',
    drs: 30,
    status: 'SAFE',
    headline: 'Safety indicators are within the current watch range.',
    sub: 'Score combines multiple validated signals—not one sensor.',
    predictiveTitle: 'Stable risk trend',
    predictiveDesc: 'No immediate escalation predicted from the current trend.',
    predictiveStatus: 'Monitor closely',
    predictiveClass: 'orange-status',
    fatigueTitle: 'Requires attention',
    fatigueDesc: "Heart rate remains above the worker's normal range with lower movement recovery.",
    fatigueBadge: 'ELEVATED',
    fatiguePos: 72,
    vitals: {
      hr: 99,
      spo2: 96,
      temp: 37.1,
      co: 171,
      motion: 'Low activity',
      battery: 84
    },
    weights: {
      hr: 4,
      spo2: 0,
      co: 5,
      temp: 1,
      motion: 12
    }
  },
  'VG-007': {
    id: 'VG-007',
    name: 'A. Sharma',
    sector: 'Sector A - Control Room',
    baselineHR: 'HR 68-84 BPM',
    connection: 'Wi-Fi / LoRa • -54 dBm',
    drs: 12,
    status: 'SAFE',
    headline: 'All physiological and atmospheric metrics nominal.',
    sub: 'Baseline alignment score: 98.4% confidence.',
    predictiveTitle: 'Optimal physiological status',
    predictiveDesc: 'Predictive model forecasts stable shift completion with zero fatigue buildup.',
    predictiveStatus: 'Nominal condition',
    predictiveClass: 'status-safe',
    fatigueTitle: 'Normal recovery',
    fatigueDesc: 'Resting heart rate in baseline range; active motion balance is optimal.',
    fatigueBadge: 'NORMAL',
    fatiguePos: 18,
    vitals: {
      hr: 74,
      spo2: 99,
      temp: 36.6,
      co: 24,
      motion: 'Moderate active',
      battery: 92
    },
    weights: {
      hr: 0,
      spo2: 0,
      co: 1,
      temp: 0,
      motion: 2
    }
  },
  'VG-023': {
    id: 'VG-023',
    name: 'S. Patel',
    sector: 'Sector D - Boiler Foundry',
    baselineHR: 'HR 75-90 BPM',
    connection: 'Wi-Fi / LoRa • -78 dBm',
    drs: 68,
    status: 'WARNING',
    headline: 'Thermal strain warning: elevated skin temperature & persistent tachycardia.',
    sub: 'Early warning alert triggered: worker advised to seek cooling zone.',
    predictiveTitle: 'Escalating heat stress',
    predictiveDesc: 'High risk of heat exhaustion within 12 minutes if ambient exposure continues.',
    predictiveStatus: 'Immediate Rest Advised',
    predictiveClass: 'status-warning',
    fatigueTitle: 'High strain observed',
    fatigueDesc: 'Elevated cardiac workload combined with severe thermal heat accumulation.',
    fatigueBadge: 'HIGH STRAIN',
    fatiguePos: 85,
    vitals: {
      hr: 122,
      spo2: 95,
      temp: 38.6,
      co: 215,
      motion: 'High exertion',
      battery: 64
    },
    weights: {
      hr: 18,
      spo2: 4,
      co: 8,
      temp: 24,
      motion: 14
    }
  },
  'VG-042': {
    id: 'VG-042',
    name: 'M. Singh',
    sector: 'Sector C - Chemical Processing',
    baselineHR: 'HR 70-88 BPM',
    connection: 'LoRa P2P • -82 dBm',
    drs: 92,
    status: 'CRITICAL',
    headline: 'CRITICAL HAZARD: Toxic carbon monoxide spike & erratic gait detected.',
    sub: 'Emergency alarm broadcasted. Base-station acoustic sirens engaged.',
    predictiveTitle: 'Acute toxic asphyxiation risk',
    predictiveDesc: 'CO threshold exceeded (840 PPM). Inactivity sequence indicates potential collapse.',
    predictiveStatus: 'EVACUATE IMMEDIATELY',
    predictiveClass: 'status-critical',
    fatigueTitle: 'Severe distress',
    fatigueDesc: 'Critical oxygen desaturation with acute toxic atmospheric displacement.',
    fatigueBadge: 'DANGER',
    fatiguePos: 98,
    vitals: {
      hr: 110,
      spo2: 91,
      temp: 37.4,
      co: 840,
      motion: 'Erratic / stumble',
      battery: 51
    },
    weights: {
      hr: 15,
      spo2: 22,
      co: 40,
      temp: 3,
      motion: 20
    }
  }
};

window.WORKER_PROFILES = WORKER_PROFILES;
