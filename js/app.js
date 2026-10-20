/**
 * VitaGuard Supervisor Command Center 2.0
 * Fully interactive application controller with:
 * - Tab navigation for all sidebar pages
 * - Real Leaflet/OpenStreetMap maps
 * - Real-time telemetry simulation
 * - Worker search & switching
 * - Report modals
 */

document.addEventListener('DOMContentLoaded', () => {
  // ──────────────────────────────────────────────────────────────────
  // DOM Elements
  // ──────────────────────────────────────────────────────────────────
  const globalSearchInput = document.getElementById('globalSearchInput');
  const headerRssi = document.getElementById('headerRssi');
  const bellNotifTrigger = document.getElementById('bellNotifTrigger');
  const telemetryTimeStr = document.getElementById('telemetryTimeStr');
  const streamRateSelect = document.getElementById('streamRateSelect');

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

  const trendFilterChips = document.querySelectorAll('.chip-btn');
  const yMax = document.getElementById('yMax');
  const yMid = document.getElementById('yMid');
  const yMin = document.getElementById('yMin');
  const trendSvgLine = document.getElementById('trendSvgLine');
  const trendSvgArea = document.getElementById('trendSvgArea');

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

  const btnQuickPdf = document.getElementById('btnQuickPdf');
  const btnQuickEmail = document.getElementById('btnQuickEmail');
  const btnQuickSchedule = document.getElementById('btnQuickSchedule');
  const sidebarLinks = document.querySelectorAll('.sidebar-link');

  // ──────────────────────────────────────────────────────────────────
  // State
  // ──────────────────────────────────────────────────────────────────
  let currentWorkerId = 'VG-014';
  let activeMetric = 'hr';
  let isStreamActive = true;
  let timerLoop = null;
  const HERO_CIRCUMFERENCE = 282.74;

  // Worker location coordinates (industrial plant area in India)
  const WORKER_LOCATIONS = {
    'VG-014': { lat: 19.0760, lng: 72.8777, label: 'R. Kumar — Plant Area 1' },
    'VG-007': { lat: 19.0765, lng: 72.8790, label: 'A. Sharma — Control Tower' },
    'VG-023': { lat: 19.0752, lng: 72.8765, label: 'S. Patel — Boiler Foundry' },
    'VG-042': { lat: 19.0758, lng: 72.8800, label: 'M. Singh — Chemical Vault' }
  };

  // Trend Datasets
  const TREND_DATA = {
    hr: {
      yMax: '140', yMid: '100', yMin: '60',
      line: 'M28,95 Q70,82 110,90 T190,78 T260,86 T330,60 T375,48',
      area: 'M28,95 Q70,82 110,90 T190,78 T260,86 T330,60 T375,48 L375,100 L28,100 Z',
      stroke: '#ef4444'
    },
    spo2: {
      yMax: '100', yMid: '95', yMin: '90',
      line: 'M28,40 Q70,44 110,40 T190,38 T260,42 T330,36 T375,38',
      area: 'M28,40 Q70,44 110,40 T190,38 T260,42 T330,36 T375,38 L375,100 L28,100 Z',
      stroke: '#10b981'
    },
    temp: {
      yMax: '39.0', yMid: '37.0', yMin: '35.0',
      line: 'M28,65 Q70,60 110,65 T190,55 T260,60 T330,53 T375,50',
      area: 'M28,65 Q70,60 110,65 T190,55 T260,60 T330,53 T375,50 L375,100 L28,100 Z',
      stroke: '#10b981'
    },
    co: {
      yMax: '300', yMid: '150', yMin: '0',
      line: 'M28,80 Q70,75 110,80 T190,70 T260,75 T330,65 T375,60',
      area: 'M28,80 Q70,75 110,80 T190,70 T260,75 T330,65 T375,60 L375,100 L28,100 Z',
      stroke: '#10b981'
    },
    motion: {
      yMax: '20.0', yMid: '10.0', yMin: '0.0',
      line: 'M28,85 Q70,70 110,80 T190,60 T260,75 T330,70 T375,75',
      area: 'M28,85 Q70,70 110,80 T190,60 T260,75 T330,70 T375,75 L375,100 L28,100 Z',
      stroke: '#0284c7'
    },
    battery: {
      yMax: '100', yMid: '60', yMin: '20',
      line: 'M28,25 Q90,28 160,32 T260,36 T375,40',
      area: 'M28,25 Q90,28 160,32 T260,36 T375,40 L375,100 L28,100 Z',
      stroke: '#10b981'
    }
  };

  // ──────────────────────────────────────────────────────────────────
  // Tab Navigation — ALL SIDEBAR PAGES
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
  let miniMapInstance = null;
  let miniMapMarker = null;

  function switchTab(tabName) {
    // Update sidebar active state
    sidebarLinks.forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar-link[data-tab="${tabName}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Switch page views
    document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(TAB_MAP[tabName]);
    if (targetPage) targetPage.classList.add('active');

    // Special initialization for pages
    if (tabName === 'workers') populateWorkersTable();
    if (tabName === 'livemap') initFullMap();
    if (tabName === 'devices') populateDeviceTable();
    if (tabName === 'dashboard') {
      // Re-invalidate mini map size after tab switch
      setTimeout(() => { if (miniMapInstance) miniMapInstance.invalidateSize(); }, 100);
    }
  }

  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      const tab = link.dataset.tab;
      switchTab(tab);
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // Satellite Map Interaction (Worker Location — Dashboard)
  // ──────────────────────────────────────────────────────────────────
  let satelliteZoom = 1.0;
  const satelliteImgElem = document.getElementById('satelliteImgElem');
  const satelliteMapBox = document.getElementById('satelliteMapBox');

  if (satelliteMapBox) {
    satelliteMapBox.style.cursor = 'pointer';
    satelliteMapBox.addEventListener('click', () => {
      satelliteZoom = satelliteZoom === 1.0 ? 1.35 : 1.0;
      if (satelliteImgElem) {
        satelliteImgElem.style.transform = `scale(${satelliteZoom})`;
      }
    });
  }

  // View Full Map click handler
  const btnViewFullMap = document.getElementById('btnViewFullMap');
  if (btnViewFullMap) {
    btnViewFullMap.addEventListener('click', () => {
      switchTab('livemap');
    });
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

    // Add all worker markers
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
              ⚡ Risk: <strong style="color:${w.drs > 70 ? '#ef4444' : w.drs > 40 ? '#f59e0b' : '#10b981'}">${w.drs}/100 ${w.drsTag}</strong>
            </div>
          </div>
        `);
    });

    setTimeout(() => fullMapInstance.invalidateSize(), 200);
  }

  // ──────────────────────────────────────────────────────────────────
  // Workers Table Population
  // ──────────────────────────────────────────────────────────────────
  function populateWorkersTable() {
    const tbody = document.getElementById('workersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    Object.keys(window.WORKER_DATASETS).forEach(id => {
      const w = window.WORKER_DATASETS[id];
      const riskClass = w.drs > 70 ? 'pill-critical-status' : (w.drs > 40 ? 'pill-elevated-status' : 'pill-safe');
      const riskLabel = w.drs > 70 ? 'CRITICAL' : (w.drs > 40 ? 'ELEVATED' : 'SAFE');

      tbody.innerHTML += `
        <tr>
          <td style="font-family:var(--font-mono);font-weight:700;">${id}</td>
          <td style="font-weight:700;">${w.name}</td>
          <td>${w.sector}</td>
          <td style="font-weight:700;${w.vitals.hr > 100 ? 'color:#ef4444;' : ''}">${w.vitals.hr} BPM</td>
          <td>${w.vitals.spo2}%</td>
          <td>${w.vitals.gas} PPM</td>
          <td><span class="${riskClass}">${w.drs}/100 ${riskLabel}</span></td>
          <td style="font-weight:700;color:#10b981;">● Online</td>
          <td><button class="worker-row-btn" onclick="window.__selectWorker('${id}')">View</button></td>
        </tr>
      `;
    });
  }

  // Global worker selection function
  window.__selectWorker = function(id) {
    currentWorkerId = id;
    renderDashboard(window.WORKER_DATASETS[id], false);
    updateWorkerLocation(id);
    switchTab('dashboard');
  };

  function updateWorkerLocation(id) {
    const loc = WORKER_LOCATIONS[id];
    const locTag = document.querySelector('.map-location-tag');
    if (locTag && loc) {
      const areaName = loc.label.split('—')[1] ? loc.label.split('—')[1].trim() : loc.label;
      locTag.innerHTML = `
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path></svg>
        ${areaName} <span style="font-weight:normal; color:#94a3b8;">• Last updated: Just now</span>
      `;
    }
  }

  // ──────────────────────────────────────────────────────────────────
  // Device Table Population
  // ──────────────────────────────────────────────────────────────────
  function populateDeviceTable() {
    const tbody = document.getElementById('deviceTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const firmwares = ['v2.4.1', 'v2.4.1', 'v2.3.8', 'v2.4.0'];
    let i = 0;
    Object.keys(window.WORKER_DATASETS).forEach(id => {
      const w = window.WORKER_DATASETS[id];
      tbody.innerHTML += `
        <tr>
          <td style="font-family:var(--font-mono);font-weight:700;">${id}</td>
          <td style="font-weight:600;">${w.name}</td>
          <td style="font-family:var(--font-mono);">${firmwares[i]}</td>
          <td style="font-weight:700;${w.vitals.battery < 60 ? 'color:#f59e0b;' : 'color:#10b981;'}">${w.vitals.battery}%</td>
          <td style="font-family:var(--font-mono);">${w.rssi}</td>
          <td>Just now</td>
          <td><span class="pill-safe">● Online</span></td>
        </tr>
      `;
      i++;
    });

    // Add placeholder devices
    for (let j = 1; j <= 8; j++) {
      const devId = `VG-0${String(50 + j).padStart(2, '0')}`;
      tbody.innerHTML += `
        <tr>
          <td style="font-family:var(--font-mono);font-weight:700;">${devId}</td>
          <td style="font-weight:600;">Worker ${j + 4}</td>
          <td style="font-family:var(--font-mono);">v2.4.1</td>
          <td style="font-weight:700;color:#10b981;">${85 + Math.floor(Math.random() * 10)}%</td>
          <td style="font-family:var(--font-mono);">-${55 + Math.floor(Math.random() * 25)} dBm</td>
          <td>Just now</td>
          <td><span class="pill-safe">● Online</span></td>
        </tr>
      `;
    }
  }

  // ──────────────────────────────────────────────────────────────────
  // Settings Toggle Switches
  // ──────────────────────────────────────────────────────────────────
  document.querySelectorAll('.toggle-switch').forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // Live Clock Updater
  // ──────────────────────────────────────────────────────────────────
  function updateTimestamp() {
    const now = new Date();
    if (telemetryTimeStr) telemetryTimeStr.textContent = now.toLocaleTimeString();
  }
  setInterval(updateTimestamp, 1000);
  updateTimestamp();

  // ──────────────────────────────────────────────────────────────────
  // Render Worker Dashboard
  // ──────────────────────────────────────────────────────────────────
  function renderDashboard(worker, jitter) {
    if (!worker) return;

    let v = { ...worker.vitals };
    if (jitter) {
      v.hr += Math.floor(Math.random() * 3) - 1;
      v.temp = +(v.temp + (Math.random() * 0.1 - 0.05)).toFixed(1);
      v.gas += Math.floor(Math.random() * 5) - 2;
    }

    heroWorkerName.textContent = worker.name;
    heroWorkerMeta.textContent = `${worker.id} • ${worker.sector}`;
    heroDrsVal.textContent = worker.drs;
    heroDrsBadge.textContent = worker.drsTag;

    const offset = HERO_CIRCUMFERENCE * (1 - worker.drs / 100);
    heroGaugeRing.style.strokeDashoffset = offset;
    heroGaugeRing.style.stroke = worker.drs > 70 ? '#ef4444' : (worker.drs > 40 ? '#f59e0b' : '#10b981');
    heroDrsBadge.style.color = worker.drs > 70 ? '#ef4444' : (worker.drs > 40 ? '#f59e0b' : '#34d399');

    vHR.textContent = v.hr;
    vSpO2.textContent = v.spo2;
    vTemp.textContent = v.temp;
    vCO.textContent = v.gas;
    vMotion.textContent = v.motion;
    vBattery.textContent = v.battery;

    cardValHR.textContent = v.hr;
    cardBadgeHR.textContent = v.hrBadge;
    cardBadgeHR.className = `sensor-pill-status ${v.hrClass === 'badge-elevated-red' ? 'pill-status-elevated' : 'pill-status-normal'}`;

    cardValSpO2.textContent = v.spo2;
    cardBadgeSpO2.textContent = v.spo2Badge;
    cardValTemp.textContent = v.temp;
    cardBadgeTemp.textContent = v.tempBadge;
    cardValCO.textContent = v.gas;
    cardBadgeCO.textContent = v.gasBadge;
    cardValMotion.textContent = v.motion;
    cardBadgeMotion.textContent = v.motionBadge;
    cardValBattery.textContent = v.battery;
    cardBadgeBattery.textContent = v.batteryBadge;

    headerRssi.textContent = worker.rssi;

    wHR.textContent = `+${worker.weights.hr}`;
    barHR.style.width = `${Math.min(100, worker.weights.hr * 5)}%`;
    wSpO2.textContent = `+${worker.weights.spo2}`;
    barSpO2.style.width = `${Math.min(100, worker.weights.spo2 * 5)}%`;
    wCO.textContent = `+${worker.weights.gas}`;
    barCO.style.width = `${Math.min(100, worker.weights.gas * 5)}%`;
    wTemp.textContent = `+${worker.weights.temp}`;
    barTemp.style.width = `${Math.min(100, worker.weights.temp * 6)}%`;
    wMotion.textContent = `+${worker.weights.motion}`;
    barMotion.style.width = `${Math.min(100, worker.weights.motion * 5)}%`;

    fatigueHeadline.textContent = worker.fatigueTitle;
    fatigueDetail.textContent = worker.fatigueDesc;

    modalWorkerName.textContent = worker.name;
    modalDeviceId.textContent = worker.id;
    modalRiskScore.textContent = `${worker.drs} / 100 (${worker.drsTag})`;
    modalCOExposure.textContent = `${v.gas} PPM (Safe Limit)`;
  }

  // ──────────────────────────────────────────────────────────────────
  // Live Simulation Tick
  // ──────────────────────────────────────────────────────────────────
  function startSimulation() {
    if (timerLoop) clearInterval(timerLoop);
    timerLoop = setInterval(() => {
      if (!isStreamActive) return;
      const worker = window.WORKER_DATASETS[currentWorkerId];
      renderDashboard(worker, true);
    }, 2500);
  }

  streamRateSelect.addEventListener('change', (e) => {
    isStreamActive = e.target.value !== 'pause';
  });

  // ──────────────────────────────────────────────────────────────────
  // 24-Hour Trend Filters
  // ──────────────────────────────────────────────────────────────────
  trendFilterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      trendFilterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeMetric = chip.dataset.metric;
      const d = TREND_DATA[activeMetric];
      yMax.textContent = d.yMax;
      yMid.textContent = d.yMid;
      yMin.textContent = d.yMin;
      trendSvgLine.setAttribute('d', d.line);
      trendSvgLine.setAttribute('stroke', d.stroke);
      trendSvgArea.setAttribute('d', d.area);
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // Modal Handlers
  // ──────────────────────────────────────────────────────────────────
  function openWorkerReport() { reportPreviewModal.classList.add('open'); }
  function openInsuranceModal() { insurancePreviewModal.classList.add('open'); }

  btnPreviewWorkerReport.addEventListener('click', openWorkerReport);
  btnSubmitWorkerReport.addEventListener('click', () => {
    alert(`Safety report for ${currentWorkerId} compiled and dispatched to Safety Operations.`);
  });
  closeReportModalBtn.addEventListener('click', () => reportPreviewModal.classList.remove('open'));
  btnDispatchReport.addEventListener('click', () => {
    reportPreviewModal.classList.remove('open');
    alert(`Report securely transmitted via encrypted LoRa Gateway endpoint.`);
  });

  btnPreviewInsurance.addEventListener('click', openInsuranceModal);
  btnSubmitInsurance.addEventListener('click', () => {
    alert(`Insurance compliance audit docket transmitted to carrier underwriting API.`);
  });
  closeInsuranceModalBtn.addEventListener('click', () => insurancePreviewModal.classList.remove('open'));
  btnConfirmSendInsurer.addEventListener('click', () => {
    insurancePreviewModal.classList.remove('open');
    alert(`Dossier signed with digital certificate and uploaded to Underwriter.`);
  });

  window.addEventListener('click', (e) => {
    if (e.target === reportPreviewModal) reportPreviewModal.classList.remove('open');
    if (e.target === insurancePreviewModal) insurancePreviewModal.classList.remove('open');
  });

  // Quick Actions
  btnQuickPdf.addEventListener('click', () => window.print());
  btnQuickEmail.addEventListener('click', () => {
    const email = prompt('Enter Safety Director / Recipient Email Address:', 'safety-officer@plant.com');
    if (email) alert(`Full shift telemetry PDF sent to ${email}`);
  });
  btnQuickSchedule.addEventListener('click', () => {
    alert('Automated Report Scheduler Active: Daily EOD Shift Audit configured for 06:00, 14:00, and 22:00 UTC.');
  });

  // Bell Notifications
  bellNotifTrigger.addEventListener('click', () => {
    alert('Active Safety Notifications (2):\n1. [10:20 PM] Heart rate reached 100 BPM (Sector B)\n2. [09:35 PM] Inactivity detected during high temperature exposure');
  });

  // Global Search
  globalSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = globalSearchInput.value.trim().toUpperCase();
      if (window.WORKER_DATASETS[q]) {
        window.__selectWorker(q);
      } else if (q.includes('KUMAR') || q.includes('VG-014') || q.includes('014')) {
        window.__selectWorker('VG-014');
      } else if (q.includes('SHARMA') || q.includes('VG-007') || q.includes('007')) {
        window.__selectWorker('VG-007');
      } else if (q.includes('PATEL') || q.includes('VG-023') || q.includes('023')) {
        window.__selectWorker('VG-023');
      } else if (q.includes('SINGH') || q.includes('VG-042') || q.includes('042')) {
        window.__selectWorker('VG-042');
      } else {
        alert(`No results for "${globalSearchInput.value}". Try: R. Kumar, VG-014, VG-023, etc.`);
      }
    }
  });

  // Recent Events View All
  document.getElementById('btnViewAllEvents').addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('alerts');
  });

  // ──────────────────────────────────────────────────────────────────
  // Initial Load
  // ──────────────────────────────────────────────────────────────────
  renderDashboard(window.WORKER_DATASETS['VG-014'], false);
  startSimulation();
});
