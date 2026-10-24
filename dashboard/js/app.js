/**
 * VitaGuard Supervisor Command Center 2.0
 * Fully interactive industrial telemetry command center:
 * - Unified Risk Bands: SAFE (0–44), WARNING (45–74), CRITICAL (75–100)
 * - Real Web Serial API (navigator.serial) for live ESP32 hardware streaming over HTTPS
 * - Emergency SOS & Finite State Machine AwaitSupervisorAck loop
 * - Dynamic Fleet Analytics & Risk Distribution derivation
 * - Interactive Leaflet & Satellite Plant mapping
 */

// ──────────────────────────────────────────────────────────────────
// Shared Risk Band Function
// ──────────────────────────────────────────────────────────────────
(function() {
const band = window.band || (s => s >= 75 ? 'CRITICAL' : s >= 45 ? 'WARNING' : 'SAFE');
const twa8 = window.twa8 || (samples => samples.reduce((a, s) => a + (s.co || s.gas || 0) * 2.5, 0) / (8 * 3600));

if (typeof window !== 'undefined') {
  window.band = band;
  window.getRiskBand = band;
  window.twa8 = twa8;
}

document.addEventListener('DOMContentLoaded', () => {
  // ──────────────────────────────────────────────────────────────────
  // DOM Elements
  // ──────────────────────────────────────────────────────────────────
  const globalSearchInput = document.getElementById('globalSearchInput');
  const headerRssi = document.getElementById('headerRssi');
  const bellNotifTrigger = document.getElementById('bellNotifTrigger');
  const telemetryTimeStr = document.getElementById('telemetryTimeStr');
  const streamRateSelect = document.getElementById('streamRateSelect');
  const simulatedDataChip = document.getElementById('simulatedDataChip');
  const btnConnectSerial = document.getElementById('btnConnectSerial');

  const sosEmergencyBanner = document.getElementById('sosEmergencyBanner');
  const sosEventId = document.getElementById('sosEventId');
  const sosWorkerName = document.getElementById('sosWorkerName');
  const btnAcknowledgeSos = document.getElementById('btnAcknowledgeSos');

  const fsmStateChip = document.getElementById('fsmStateChip');
  const heroWorkerName = document.getElementById('heroWorkerName');
  const heroWorkerMeta = document.getElementById('heroWorkerMeta');
  const heroGaugeRing = document.getElementById('heroGaugeRing');
  const heroDrsVal = document.getElementById('heroDrsVal');
  const heroDrsBadge = document.getElementById('heroDrsBadge');
  const vHR = document.getElementById('vHR');
  const vSpO2 = document.getElementById('vSpO2');
  const vTemp = document.getElementById('vTemp');
  const vCO = document.getElementById('vCO');
  const vMotion = document.getElementById('vMotion');
  const vBattery = document.getElementById('vBattery');

  const lblRestingHR = document.getElementById('lblRestingHR');
  const lblMaxSafeHR = document.getElementById('lblMaxSafeHR');
  const lblAmbientCO = document.getElementById('lblAmbientCO');

  const cardValHR = document.getElementById('cardValHR');
  const cardBadgeHR = document.getElementById('cardBadgeHR');
  const cardValSpO2 = document.getElementById('cardValSpO2');
  const cardBadgeSpO2 = document.getElementById('cardBadgeSpO2');
  const cardValTemp = document.getElementById('cardValTemp');
  const cardBadgeTemp = document.getElementById('cardBadgeTemp');
  const cardValCO = document.getElementById('cardValCO');
  const cardBadgeCO = document.getElementById('cardBadgeCO');
  const cardValMotion = document.getElementById('cardValMotion');
  const cardBadgeMotion = document.getElementById('cardBadgeMotion');
  const cardValBattery = document.getElementById('cardValBattery');
  const cardBadgeBattery = document.getElementById('cardBadgeBattery');

  const barHR = document.getElementById('barHR');
  const wHR = document.getElementById('wHR');
  const barSpO2 = document.getElementById('barSpO2');
  const wSpO2 = document.getElementById('wSpO2');
  const barCO = document.getElementById('barCO');
  const wCO = document.getElementById('wCO');
  const barTemp = document.getElementById('barTemp');
  const wTemp = document.getElementById('wTemp');
  const barMotion = document.getElementById('barMotion');
  const wMotion = document.getElementById('wMotion');
  const fatigueHeadline = document.getElementById('fatigueHeadline');
  const fatigueDetail = document.getElementById('fatigueDetail');

  const reportPreviewModal = document.getElementById('reportPreviewModal');
  const closeReportModalBtn = document.getElementById('closeReportModalBtn');
  const btnPreviewWorkerReport = document.getElementById('btnPreviewWorkerReport');
  const btnSubmitWorkerReport = document.getElementById('btnSubmitWorkerReport');
  const btnDispatchReport = document.getElementById('btnDispatchReport');
  const modalWorkerName = document.getElementById('modalWorkerName');
  const modalDeviceId = document.getElementById('modalDeviceId');
  const modalRiskScore = document.getElementById('modalRiskScore');
  const modalCOExposure = document.getElementById('modalCOExposure');

  const insurancePreviewModal = document.getElementById('insurancePreviewModal');
  const closeInsuranceModalBtn = document.getElementById('closeInsuranceModalBtn');
  const btnPreviewInsurance = document.getElementById('btnPreviewInsurance');
  const btnSubmitInsurance = document.getElementById('btnSubmitInsurance');
  const btnConfirmSendInsurer = document.getElementById('btnConfirmSendInsurer');

  const sidebarLinks = document.querySelectorAll('.sidebar-link');

  // ──────────────────────────────────────────────────────────────────
  // State
  // ──────────────────────────────────────────────────────────────────
  let currentWorkerId = 'VG-014';
  let isStreamActive = true;
  let timerLoop = null;
  const HERO_CIRCUMFERENCE = 282.74;

  let serialPort = null;
  let isSerialMode = false;

  const WORKER_LOCATIONS = {
    'VG-014': { lat: 19.0760, lng: 72.8777, label: 'R. Kumar — Boiler Plant 1' },
    'VG-007': { lat: 19.0765, lng: 72.8790, label: 'A. Sharma — Control Tower' },
    'VG-023': { lat: 19.0752, lng: 72.8765, label: 'S. Patel — Boiler Foundry' },
    'VG-042': { lat: 19.0758, lng: 72.8800, label: 'M. Singh — Chemical Vault' }
  };

  // ──────────────────────────────────────────────────────────────────
  // Tab Navigation
  // ──────────────────────────────────────────────────────────────────
  const TAB_MAP = {
    'dashboard': 'page-dashboard',
    'workers': 'page-workers',
    'livemap': 'page-livemap',
    'alerts': 'page-alerts',
    'reports': 'page-reports',
    'analytics': 'page-analytics',
    'insurance': 'page-insurance',
    'devices': 'page-devices',
    'settings': 'page-settings'
  };

  let fullMapInstance = null;

  function switchTab(tabName) {
    sidebarLinks.forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar-link[data-tab="${tabName}"]`);
    if (activeLink) activeLink.classList.add('active');

    document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(TAB_MAP[tabName]);
    if (targetPage) targetPage.classList.add('active');

    if (tabName === 'workers') populateWorkersTable();
    if (tabName === 'livemap') initFullMap();
    if (tabName === 'devices') populateDeviceTable();
    if (tabName === 'analytics') renderAnalytics();
    if (tabName === 'reports') updateReportsView();
  }

  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => switchTab(link.dataset.tab));
  });

  // ──────────────────────────────────────────────────────────────────
  // Web Serial API — Real Hardware Stream from Base Station over HTTPS
  // ──────────────────────────────────────────────────────────────────
  if (btnConnectSerial) {
    btnConnectSerial.addEventListener('click', async () => {
      if (!('serial' in navigator)) {
        alert('Web Serial is supported on desktop Google Chrome and Microsoft Edge over HTTPS.\n\nPlease connect your ESP32 Base Station via USB to use this feature.');
        return;
      }

      try {
        serialPort = await navigator.serial.requestPort();
        await serialPort.open({ baudRate: 115200 });
        isSerialMode = true;

        if (simulatedDataChip) {
          simulatedDataChip.innerHTML = '<span class="chip-dot-green">●</span> Live Hardware (Serial)';
          simulatedDataChip.className = 'simulated-data-chip chip-hardware-active';
        }

        btnConnectSerial.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>Hardware Connected</span>';
        btnConnectSerial.classList.add('btn-serial-active');

        readSerialLoop();
      } catch (err) {
        console.warn('Serial connection skipped or denied:', err);
      }
    });
  }

  async function readSerialLoop() {
    const textDecoder = new TextDecoderStream();
    serialPort.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    let buffer = '';
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          parseSerialLine(line);
        }
      }
    } catch (e) {
      console.warn('Serial reader stopped:', e);
    }
  }

  function parseSerialLine(line) {
    const p = line.trim().split(',');
    if (p[0] !== 'VITAGUARD') return;

    if (p[1] === 'SOS') {
      // Packet 152 Emergency: VITAGUARD,SOS,VG-042,EVENT=152
      const workerId = p[2] || 'VG-042';
      triggerSosEmergency(workerId, '#VG-SOS-042-991');
      return;
    }

    // Packet 151 Routine: VITAGUARD,VG-014,HR=100,SPO2=96,SKINTEMP=37.1,CO_PPM=16,ACC_MAG=0.08,DRS=30
    const workerId = p[1];
    const kv = Object.fromEntries(p.slice(2).map(x => x.split('=')));
    if (window.WORKER_DATASETS[workerId]) {
      const w = window.WORKER_DATASETS[workerId];
      if (kv.HR) w.vitals.hr = +kv.HR;
      if (kv.SPO2) w.vitals.spo2 = +kv.SPO2;
      if (kv.SKINTEMP) w.vitals.temp = +kv.SKINTEMP;
      if (kv.CO_PPM) w.vitals.gas = +kv.CO_PPM;
      if (kv.DRS) w.drs = +kv.DRS;
      w.drsTag = band(w.drs);

      if (currentWorkerId === workerId) {
        renderDashboard(w, false);
      }
    }
  }

  // ──────────────────────────────────────────────────────────────────
  // Emergency SOS & Finite State Machine Loop
  // ──────────────────────────────────────────────────────────────────
  function triggerSosEmergency(workerId, eventId) {
    if (sosEmergencyBanner) sosEmergencyBanner.style.display = 'flex';
    if (sosEventId) sosEventId.textContent = eventId || '#VG-SOS-042-991';

    const w = window.WORKER_DATASETS[workerId];
    if (w) {
      if (sosWorkerName) sosWorkerName.textContent = `${w.name} (${workerId})`;
      w.fsmState = 'CriticalAlarm';
      window.__selectWorker(workerId);
    }
  }

  if (btnAcknowledgeSos) {
    btnAcknowledgeSos.addEventListener('click', () => {
      if (sosEmergencyBanner) sosEmergencyBanner.style.display = 'none';

      const w = window.WORKER_DATASETS[currentWorkerId];
      if (w) {
        // Finite State Machine: AwaitSupervisorAck -> NormalMonitoring transition
        w.fsmState = 'NormalMonitoring';
        w.drs = 28;
        w.drsTag = 'SAFE';
        if (w.vitals) {
          w.vitals.gas = 18;
          w.vitals.gasBadge = 'SAFE (18 PPM)';
          w.vitals.gasClass = 'badge-normal-green';
          w.vitals.motion = 'Normal active';
        }
        renderDashboard(w, false);
        populateWorkersTable();
        renderAnalytics();
      }
    });
  }

  // ──────────────────────────────────────────────────────────────────
  // Dynamic Shift and Time Updater
  // ──────────────────────────────────────────────────────────────────
  function getShiftContext() {
    const now = new Date();
    const hour = now.getHours();
    const isDay = hour >= 6 && hour < 18;
    const shiftName = isDay ? 'Day Shift (06:00 – 18:00)' : 'Night Shift (18:00 – 06:00)';
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return { now, hour, isDay, shiftName, timeStr };
  }

  function updateClock() {
    const ctx = getShiftContext();
    if (telemetryTimeStr) telemetryTimeStr.textContent = ctx.timeStr;
    const reportShiftTitle = document.getElementById('reportShiftTitle');
    if (reportShiftTitle) reportShiftTitle.textContent = ctx.shiftName;
  }
  setInterval(updateClock, 1000);
  updateClock();

  function updateReportsView() {
    const ctx = getShiftContext();
    const reportShiftTitle = document.getElementById('reportShiftTitle');
    if (reportShiftTitle) reportShiftTitle.textContent = ctx.shiftName;
  }

  // ──────────────────────────────────────────────────────────────────
  // Leaflet Full Map (Live Map Page)
  // ──────────────────────────────────────────────────────────────────
  function initFullMap() {
    if (fullMapInstance) {
      setTimeout(() => fullMapInstance.invalidateSize(), 100);
      return;
    }

    const mapEl = document.getElementById('fullLeafletMap');
    if (!mapEl) return;

    fullMapInstance = L.map('fullLeafletMap', { attributionControl: false })
      .setView([19.0760, 72.8777], 17);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(fullMapInstance);

    const colors = {
      'VG-014': '#10b981',
      'VG-007': '#0284c7',
      'VG-023': '#f59e0b',
      'VG-042': '#ef4444'
    };

    Object.keys(WORKER_LOCATIONS).forEach(id => {
      const loc = WORKER_LOCATIONS[id];
      const w = window.WORKER_DATASETS[id];
      const color = colors[id] || '#0284c7';

      const icon = L.divIcon({
        className: '',
        html: `<div style="width:16px;height:16px;background:${color};border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      L.marker([loc.lat, loc.lng], { icon })
        .addTo(fullMapInstance)
        .bindPopup(`
          <div style="min-width:180px;">
            <strong style="font-size:13px;">${w.name}</strong><br>
            <span style="color:#64748b;font-size:11px;">${id} • ${w.sector}</span><br>
            <div style="margin-top:6px;font-size:11px;">
              ❤️ HR: <strong>${w.vitals.hr}</strong> BPM<br>
              💧 SpO₂: <strong>${w.vitals.spo2}</strong>%<br>
              ☁️ CO: <strong>${w.vitals.gas}</strong> PPM<br>
              🔋 Battery: <strong>${w.vitals.battery}</strong>%<br>
              ⚡ Risk: <strong style="color:${w.drs >= 75 ? '#ef4444' : w.drs >= 45 ? '#f59e0b' : '#10b981'}">${w.drs}/100 ${band(w.drs)}</strong>
            </div>
          </div>
        `);
    });

    setTimeout(() => fullMapInstance.invalidateSize(), 200);
  }

  // ──────────────────────────────────────────────────────────────────
  // Workers Table Population (Derived from Fleet Array)
  // ──────────────────────────────────────────────────────────────────
  function populateWorkersTable() {
    const tbody = document.getElementById('workersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    Object.keys(window.WORKER_DATASETS).forEach(id => {
      const w = window.WORKER_DATASETS[id];
      const b = band(w.drs);
      const riskClass = b === 'CRITICAL' ? 'pill-critical-status' : (b === 'WARNING' ? 'pill-elevated-status' : 'pill-safe');

      tbody.innerHTML += `
        <tr>
          <td style="font-family:var(--font-mono);font-weight:700;">${id}</td>
          <td style="font-weight:700;">${w.name}</td>
          <td>${w.sector}</td>
          <td style="font-weight:700;${w.vitals.hr > 120 ? 'color:#ef4444;' : w.vitals.hr > 92 ? 'color:#f59e0b;' : ''}">${w.vitals.hr} BPM</td>
          <td>${w.vitals.spo2}%</td>
          <td style="${w.vitals.gas > 200 ? 'color:#ef4444;font-weight:700;' : w.vitals.gas > 35 ? 'color:#f59e0b;' : ''}">${w.vitals.gas} PPM</td>
          <td><span class="${riskClass}">${w.drs}/100 ${b}</span></td>
          <td style="font-weight:700;color:#10b981;">● Online</td>
          <td><button class="worker-row-btn" onclick="window.__selectWorker('${id}')">View</button></td>
        </tr>
      `;
    });
  }

  // ──────────────────────────────────────────────────────────────────
  // Dynamic Fleet Analytics & Risk Distribution
  // ──────────────────────────────────────────────────────────────────
  function renderAnalytics() {
    const counts = { SAFE: 0, WARNING: 0, CRITICAL: 0 };
    const workers = Object.values(window.WORKER_DATASETS);
    workers.forEach(w => {
      const b = band(w.drs);
      counts[b] = (counts[b] || 0) + 1;
    });

    const total = workers.length || 12;
    const elSafe = document.getElementById('distCountSafe');
    const elWarn = document.getElementById('distCountWarning');
    const elCrit = document.getElementById('distCountCritical');
    const barSafe = document.getElementById('distBarSafe');
    const barWarn = document.getElementById('distBarWarning');
    const barCrit = document.getElementById('distBarCritical');

    if (elSafe) elSafe.textContent = counts.SAFE;
    if (elWarn) elWarn.textContent = counts.WARNING;
    if (elCrit) elCrit.textContent = counts.CRITICAL;

    if (barSafe) barSafe.style.width = `${Math.round((counts.SAFE / total) * 100)}%`;
    if (barWarn) barWarn.style.width = `${Math.round((counts.WARNING / total) * 100)}%`;
    if (barCrit) barCrit.style.width = `${Math.max(counts.CRITICAL > 0 ? 8 : 0, Math.round((counts.CRITICAL / total) * 100))}%`;

    // Dynamic Worker Safety Score Ranking
    const rankGroup = document.getElementById('rankingBarGroup');
    if (rankGroup) {
      rankGroup.innerHTML = '';
      const sorted = [...workers].sort((a, b) => a.drs - b.drs);
      sorted.forEach(w => {
        const b = band(w.drs);
        const color = b === 'CRITICAL' ? '#ef4444' : b === 'WARNING' ? '#f59e0b' : '#10b981';
        rankGroup.innerHTML += `
          <div class="analytics-bar-row">
            <span style="font-weight:600; min-width:130px;">${w.name} (${w.id})</span>
            <div class="analytics-bar-track">
              <div class="analytics-bar-fill" style="width:${Math.max(6, w.drs)}%; background:${color};"></div>
            </div>
            <span style="font-weight:800; color:${color}; min-width:32px; text-align:right;">${w.drs}</span>
          </div>
        `;
      });
    }
  }

  // ──────────────────────────────────────────────────────────────────
  // Device Table Population
  // ──────────────────────────────────────────────────────────────────
  function populateDeviceTable() {
    const tbody = document.getElementById('deviceTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    Object.keys(window.WORKER_DATASETS).forEach((id, idx) => {
      const w = window.WORKER_DATASETS[id];
      tbody.innerHTML += `
        <tr>
          <td style="font-family:var(--font-mono);font-weight:700;">${id}</td>
          <td style="font-weight:600;">${w.name}</td>
          <td style="font-family:var(--font-mono);">v2.4.2</td>
          <td style="font-weight:700;${w.vitals.battery < 60 ? 'color:#f59e0b;' : 'color:#10b981;'}">${w.vitals.battery}%</td>
          <td style="font-family:var(--font-mono);">${w.rssi}</td>
          <td>2.5s ago</td>
          <td><span class="pill-safe">● Online</span></td>
        </tr>
      `;
    });
  }

  // ──────────────────────────────────────────────────────────────────
  // Worker Selection & Dashboard Rendering
  // ──────────────────────────────────────────────────────────────────
  window.__selectWorker = function(id) {
    if (window.WORKER_DATASETS[id]) {
      currentWorkerId = id;
      renderDashboard(window.WORKER_DATASETS[id], false);
      switchTab('dashboard');
    }
  };

  function renderDashboard(worker, jitter) {
    if (!worker) return;

    let v = { ...worker.vitals };
    if (jitter && !isSerialMode) {
      v.hr += Math.floor(Math.random() * 3) - 1;
      v.temp = +(v.temp + (Math.random() * 0.1 - 0.05)).toFixed(1);
    }

    heroWorkerName.textContent = worker.name;
    const ctx = getShiftContext();
    heroWorkerMeta.textContent = `${worker.id} • ${worker.sector} • ${ctx.shiftName}`;
    heroDrsVal.textContent = worker.drs;

    const b = band(worker.drs);
    heroDrsBadge.textContent = b;

    const offset = HERO_CIRCUMFERENCE * (1 - Math.min(100, worker.drs) / 100);
    heroGaugeRing.style.strokeDashoffset = offset;
    heroGaugeRing.style.stroke = b === 'CRITICAL' ? '#ef4444' : (b === 'WARNING' ? '#f59e0b' : '#10b981');
    heroDrsBadge.style.color = b === 'CRITICAL' ? '#ef4444' : (b === 'WARNING' ? '#f59e0b' : '#10b981');

    // Finite State Machine Chip
    if (fsmStateChip) {
      const stateName = worker.fsmState || (b === 'CRITICAL' ? 'CriticalAlarm' : (b === 'WARNING' ? 'ElevatedWatch' : 'NormalMonitoring'));
      fsmStateChip.textContent = stateName;
      fsmStateChip.className = 'fsm-state-chip ' + (stateName === 'CriticalAlarm' ? 'state-critical' : stateName === 'ElevatedWatch' ? 'state-elevated' : 'state-normal');
    }

    // Baseline strip
    if (lblRestingHR) lblRestingHR.textContent = worker.baselineShift?.restingHR || 76;
    if (lblMaxSafeHR) lblMaxSafeHR.textContent = worker.baselineShift?.maxSafeHR || 92;
    if (lblAmbientCO) lblAmbientCO.textContent = worker.baselineShift?.ambientCO || 12;

    // Emergency banner visibility
    if (sosEmergencyBanner) {
      if (b === 'CRITICAL' || worker.fsmState === 'CriticalAlarm') {
        sosEmergencyBanner.style.display = 'flex';
        if (sosEventId) sosEventId.textContent = '#VG-SOS-042-991';
        if (sosWorkerName) sosWorkerName.textContent = `${worker.name} (${worker.id})`;
      } else {
        sosEmergencyBanner.style.display = 'none';
      }
    }

    // Hero card container alert highlighting
    const heroCardElem = document.querySelector('.worker-hero-card');
    if (heroCardElem) {
      heroCardElem.classList.remove('hero-alert-critical', 'hero-alert-caution');
      if (b === 'CRITICAL') heroCardElem.classList.add('hero-alert-critical');
      else if (b === 'WARNING') heroCardElem.classList.add('hero-alert-caution');
    }

    vHR.textContent = v.hr;
    vSpO2.textContent = v.spo2;
    vTemp.textContent = v.temp;
    vCO.textContent = v.gas;
    vMotion.textContent = v.motion;
    vBattery.textContent = v.battery;

    cardValHR.textContent = v.hr;
    cardValSpO2.textContent = v.spo2;
    cardValTemp.textContent = v.temp;
    cardValCO.textContent = v.gas;
    cardValMotion.textContent = v.motion;
    cardValBattery.textContent = v.battery;

    // HR Thresholds: Caution above baseline max (92 BPM) sustained; Danger above 120 BPM
    const baselineMax = worker.baselineShift?.maxSafeHR || 92;
    const tagHR = document.getElementById('tagHR');
    const itemHR = document.getElementById('itemHR');
    const cardHR = document.getElementById('cardHR');
    if (v.hr > 120) {
      if (tagHR) { tagHR.textContent = 'DANGER (>120)'; tagHR.className = 'v-tag tag-danger-pill'; }
      if (itemHR) itemHR.className = 'hero-vital-item vital-highlight-danger';
      if (cardHR) cardHR.className = 'sensor-box sensor-alert-danger';
      cardBadgeHR.textContent = 'Danger';
      cardBadgeHR.className = 'sensor-pill-status pill-status-elevated';
    } else if (v.hr > baselineMax) {
      if (tagHR) { tagHR.textContent = 'CAUTION'; tagHR.className = 'v-tag tag-elevated-pill'; }
      if (itemHR) itemHR.className = 'hero-vital-item vital-highlight-elevated';
      if (cardHR) cardHR.className = 'sensor-box sensor-alert-elevated';
      cardBadgeHR.textContent = 'Caution';
      cardBadgeHR.className = 'sensor-pill-status pill-status-elevated';
    } else {
      if (tagHR) { tagHR.textContent = 'NORMAL'; tagHR.className = 'v-tag tag-normal-pill'; }
      if (itemHR) itemHR.className = 'hero-vital-item';
      if (cardHR) cardHR.className = 'sensor-box';
      cardBadgeHR.textContent = 'Normal';
      cardBadgeHR.className = 'sensor-pill-status pill-status-normal';
    }

    // CO Thresholds: Warning > 35 PPM (NIOSH REL); Danger > 200 PPM (Ceiling)
    const tagCO = document.getElementById('tagCO');
    const itemCO = document.getElementById('itemCO');
    const cardCO = document.getElementById('cardCO');
    if (v.gas > 200) {
      if (tagCO) { tagCO.textContent = 'DANGER (>200)'; tagCO.className = 'v-tag tag-danger-pill'; }
      if (itemCO) itemCO.className = 'hero-vital-item vital-highlight-danger';
      if (cardCO) cardCO.className = 'sensor-box sensor-alert-danger';
      cardBadgeCO.textContent = 'Danger';
      cardBadgeCO.className = 'sensor-pill-status pill-status-elevated';
    } else if (v.gas > 35) {
      if (tagCO) { tagCO.textContent = 'CAUTION (>35)'; tagCO.className = 'v-tag tag-elevated-pill'; }
      if (itemCO) itemCO.className = 'hero-vital-item vital-highlight-elevated';
      if (cardCO) cardCO.className = 'sensor-box sensor-alert-elevated';
      cardBadgeCO.textContent = 'Caution';
      cardBadgeCO.className = 'sensor-pill-status pill-status-elevated';
    } else {
      if (tagCO) { tagCO.textContent = 'SAFE'; tagCO.className = 'v-tag tag-normal-pill'; }
      if (itemCO) itemCO.className = 'hero-vital-item';
      if (cardCO) cardCO.className = 'sensor-box';
      cardBadgeCO.textContent = 'Safe';
      cardBadgeCO.className = 'sensor-pill-status pill-status-normal';
    }

    // Breakdown weights: Guarantee sum equals worker.drs exactly
    if (worker.weights) {
      let sum = worker.weights.hr + worker.weights.spo2 + worker.weights.gas + worker.weights.temp + worker.weights.motion;
      if (sum !== worker.drs && worker.drs > 0) {
        worker.weights.motion = Math.max(0, worker.drs - (worker.weights.hr + worker.weights.spo2 + worker.weights.gas + worker.weights.temp));
      }

      wHR.textContent = `+${worker.weights.hr}`;
      wSpO2.textContent = `+${worker.weights.spo2}`;
      wCO.textContent = `+${worker.weights.gas}`;
      wTemp.textContent = `+${worker.weights.temp}`;
      wMotion.textContent = `+${worker.weights.motion}`;

      barHR.style.width = `${Math.min(100, worker.weights.hr * 4)}%`;
      barSpO2.style.width = `${Math.min(100, worker.weights.spo2 * 4)}%`;
      barCO.style.width = `${Math.min(100, worker.weights.gas * 2.5)}%`;
      barTemp.style.width = `${Math.min(100, worker.weights.temp * 4)}%`;
      barMotion.style.width = `${Math.min(100, worker.weights.motion * 3.5)}%`;
    }
  }

  // ──────────────────────────────────────────────────────────────────
  // Search and Modals
  // ──────────────────────────────────────────────────────────────────
  if (globalSearchInput) {
    globalSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const match = Object.keys(window.WORKER_DATASETS).find(id => {
        const w = window.WORKER_DATASETS[id];
        return id.toLowerCase().includes(q) || w.name.toLowerCase().includes(q) || w.sector.toLowerCase().includes(q);
      });
      if (match) window.__selectWorker(match);
    });
  }

  if (btnPreviewWorkerReport) {
    btnPreviewWorkerReport.addEventListener('click', () => {
      window.open('worker-report.html', '_blank');
    });
  }

  if (btnSubmitWorkerReport) {
    btnSubmitWorkerReport.addEventListener('click', () => {
      window.open('worker-report.html', '_blank');
    });
  }

  if (closeReportModalBtn && reportPreviewModal) {
    closeReportModalBtn.addEventListener('click', () => reportPreviewModal.classList.remove('active'));
  }

  if (btnPreviewInsurance) {
    btnPreviewInsurance.addEventListener('click', () => {
      window.open('insurance-report.html', '_blank');
    });
  }

  if (btnSubmitInsurance) {
    btnSubmitInsurance.addEventListener('click', () => {
      window.open('insurance-report.html', '_blank');
    });
  }

  if (closeInsuranceModalBtn && insurancePreviewModal) {
    closeInsuranceModalBtn.addEventListener('click', () => insurancePreviewModal.classList.remove('active'));
  }

  const btnQuickPdf = document.getElementById('btnQuickPdf');
  if (btnQuickPdf) {
    btnQuickPdf.addEventListener('click', () => {
      window.open('worker-report.html', '_blank');
    });
  }

  const btnQuickEmail = document.getElementById('btnQuickEmail');
  if (btnQuickEmail) {
    btnQuickEmail.addEventListener('click', () => {
      window.open('email-report.html', '_blank');
    });
  }

  const btnQuickSchedule = document.getElementById('btnQuickSchedule');
  if (btnQuickSchedule) {
    btnQuickSchedule.addEventListener('click', () => {
      window.open('schedule-reports.html', '_blank');
    });
  }

  // ──────────────────────────────────────────────────────────────────
  // Initial Boot
  // ──────────────────────────────────────────────────────────────────
  renderDashboard(window.WORKER_DATASETS[currentWorkerId], false);
  populateWorkersTable();
  renderAnalytics();
  populateDeviceTable();

  // Subtle live pulse jitter every 3s
  setInterval(() => {
    if (isStreamActive && !isSerialMode) {
      renderDashboard(window.WORKER_DATASETS[currentWorkerId], true);
    }
  }, 3000);
});
})();
