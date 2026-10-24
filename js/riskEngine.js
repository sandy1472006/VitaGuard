/**
 * VitaGuard Dynamic Risk Engine & Sensor Fusion Model
 * Implements real-time fusion for physiological, atmospheric, and kinetic parameters.
 * Unified risk bands: SAFE (0–44), WARNING (45–74), CRITICAL (75–100)
 */

(function(global) {
  const band = function(s) {
    return s >= 75 ? 'CRITICAL' : s >= 45 ? 'WARNING' : 'SAFE';
  };

  /**
   * Computes 8-hour Time Weighted Average (TWA) for CO samples at 2.5s sample interval
   */
  const twa8 = function(samples) {
    if (!Array.isArray(samples) || samples.length === 0) return 0;
    return samples.reduce((a, s) => a + (s.co || s.gas || 0) * 2.5, 0) / (8 * 3600);
  };

  global.band = band;
  global.getRiskBand = band;
  global.twa8 = twa8;

  class RiskEngine {
    constructor() {
      this.CIRCUMFERENCE = 414.69; // 2 * PI * 66
    }

    /**
     * Validates raw telemetry inputs against physiologically feasible bounds.
     */
    validateSensorInputs(vitals) {
      if (!vitals) return false;
      const validHR = vitals.hr >= 40 && vitals.hr <= 220;
      const validSpO2 = vitals.spo2 >= 70 && vitals.spo2 <= 100;
      const validTemp = vitals.temp >= 30.0 && vitals.temp <= 44.0;
      const validCO = (vitals.co !== undefined ? vitals.co : vitals.gas) >= 0 && (vitals.co !== undefined ? vitals.co : vitals.gas) <= 2000;
      return validHR && validSpO2 && validTemp && validCO;
    }

    /**
     * Computes the Dynamic Risk Score (0 - 100) and contribution breakdown weights.
     */
    computeScore(vitals, baselineHR = 80) {
      if (!this.validateSensorInputs(vitals)) {
        return { score: 99, status: 'SENSOR_FAULT', breakdown: { hr: 20, spo2: 20, co: 20, temp: 20, motion: 19 } };
      }

      const coVal = vitals.co !== undefined ? vitals.co : (vitals.gas || 0);

      // 1. Heart Rate Elevation above personal baseline
      let hrDiff = Math.max(0, vitals.hr - baselineHR);
      let hrWeight = Math.min(25, Math.round(hrDiff * 0.35));

      // 2. SpO2 Desaturation below 98%
      let spo2Drop = Math.max(0, 98 - vitals.spo2);
      let spo2Weight = Math.min(30, Math.round(spo2Drop * 3.5));

      // 3. Thermal Strain (Contact Temperature above 37.0°C)
      let tempExcess = Math.max(0, vitals.temp - 37.0);
      let tempWeight = Math.min(25, Math.round(tempExcess * 12.0));

      // 4. Toxic Gas (CO PPM) - NIOSH REL 35 PPM, OSHA PEL 50 PPM, Danger Ceiling 200 PPM
      let coWeight = 0;
      if (coVal > 35) {
        coWeight = Math.min(20, Math.round((coVal - 35) * 0.12));
      }
      if (coVal > 200) {
        coWeight = Math.min(40, 20 + Math.round((coVal - 200) * 0.04));
      }

      // 5. Motion / Fatigue Workload
      let motionWeight = 5;
      if (typeof vitals.motion === 'string') {
        if (vitals.motion.includes('Low')) motionWeight = 20; // Fatigued inactivity during shift
        else if (vitals.motion.includes('exertion') || vitals.motion.includes('High')) motionWeight = 15;
        else if (vitals.motion.includes('stumble') || vitals.motion.includes('Erratic')) motionWeight = 20;
        else motionWeight = 2; // Normal active
      }

      const totalRaw = hrWeight + spo2Weight + tempWeight + coWeight + motionWeight;
      const score = Math.max(0, Math.min(100, totalRaw));

      // Guarantee exact breakdown sum matches score
      const sumBreakdown = hrWeight + spo2Weight + tempWeight + coWeight + motionWeight;
      if (sumBreakdown !== score && score > 0) {
        motionWeight = Math.max(0, score - (hrWeight + spo2Weight + tempWeight + coWeight));
      }

      const status = band(score);

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

  const engineInstance = new RiskEngine();
  global.RiskEngine = engineInstance;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RiskEngine: engineInstance, band, twa8 };
  }
})(typeof window !== 'undefined' ? window : globalThis);

