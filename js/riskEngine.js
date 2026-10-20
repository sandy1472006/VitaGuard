/**
 * VitaGuard Dynamic Risk Engine & Sensor Fusion Model
 * Implements real-time fusion for physiological, atmospheric, and kinetic parameters.
 */

class RiskEngine {
  constructor() {
    this.CIRCUMFERENCE = 414.69; // 2 * PI * 66
  }

  /**
   * Validates raw telemetry inputs against physiologically feasible bounds.
   */
  validateSensorInputs(vitals) {
    const validHR = vitals.hr >= 40 && vitals.hr <= 220;
    const validSpO2 = vitals.spo2 >= 70 && vitals.spo2 <= 100;
    const validTemp = vitals.temp >= 30.0 && vitals.temp <= 44.0;
    const validCO = vitals.co >= 0 && vitals.co <= 2000;
    return validHR && validSpO2 && validTemp && validCO;
  }

  /**
   * Computes the Dynamic Risk Score (0 - 100) and contribution breakdown weights.
   */
  computeScore(vitals, baselineHR = 80) {
    if (!this.validateSensorInputs(vitals)) {
      return { score: 99, status: 'SENSOR_FAULT', breakdown: { hr: 20, spo2: 20, co: 20, temp: 20, motion: 19 } };
    }

    // 1. Heart Rate Elevation above personal baseline
    let hrDiff = Math.max(0, vitals.hr - baselineHR);
    let hrWeight = Math.min(25, Math.round(hrDiff * 0.35));

    // 2. SpO2 Desaturation below 98%
    let spo2Drop = Math.max(0, 98 - vitals.spo2);
    let spo2Weight = Math.min(30, Math.round(spo2Drop * 3.5));

    // 3. Thermal Strain (Contact Temperature above 37.0°C)
    let tempExcess = Math.max(0, vitals.temp - 37.0);
    let tempWeight = Math.min(25, Math.round(tempExcess * 12.0));

    // 4. Toxic Gas (CO PPM)
    let coWeight = 0;
    if (vitals.co > 50) {
      coWeight = Math.min(40, Math.round((vitals.co - 50) * 0.05));
    }
    if (vitals.co > 400) {
      coWeight = Math.min(40, 20 + Math.round((vitals.co - 400) * 0.05));
    }

    // 5. Motion / Fatigue Workload
    let motionWeight = 5;
    if (typeof vitals.motion === 'string') {
      if (vitals.motion.includes('Low')) motionWeight = 12;
      else if (vitals.motion.includes('exertion') || vitals.motion.includes('High')) motionWeight = 15;
      else if (vitals.motion.includes('stumble') || vitals.motion.includes('Erratic')) motionWeight = 22;
      else motionWeight = 2;
    }

    const totalRaw = hrWeight + spo2Weight + tempWeight + coWeight + motionWeight;
    const score = Math.max(0, Math.min(100, totalRaw));

    let status = 'SAFE';
    if (score >= 75) status = 'CRITICAL';
    else if (score >= 45) status = 'WARNING';

    return {
      score,
      status,
      breakdown: {
        hr: hrWeight,
        spo2: spo2Weight,
        co: coWeight,
        temp: tempWeight,
        motion: motionWeight
      }
    };
  }

  /**
   * Helper to compute SVG gauge dash offset
   */
  getGaugeOffset(score) {
    const clamped = Math.max(0, Math.min(100, score));
    return this.CIRCUMFERENCE * (1 - clamped / 100);
  }
}

window.RiskEngine = new RiskEngine();
