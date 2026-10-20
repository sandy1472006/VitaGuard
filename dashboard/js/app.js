/**
 * VitaGuard Supervisor Command Center 2.0
 * Fully interactive application controller with real-time updates & multi-report workflows
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Header & Global
  const globalSearchInput = document.getElementById('globalSearchInput');
  const headerRssi = document.getElementById('headerRssi');
  const bellNotifTrigger = document.getElementById('bellNotifTrigger');
  const telemetryTimeStr = document.getElementById('telemetryTimeStr');
  const streamRateSelect = document.getElementById('streamRateSelect');

  // Hero Card Elements
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

  // Sensor Telemetry Cards
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

  // AI Risk Analysis
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

  // Map Controls
  const satelliteMapBox = document.getElementById('satelliteMapBox');
  const btnMapZoomIn = document.getElementById('btnMapZoomIn');
  const btnMapZoomOut = document.getElementById('btnMapZoomOut');
  const btnMapCenter = document.getElementById('btnMapCenter');
  const btnViewFullMap = document.getElementById('btnViewFullMap');

  // 24-Hour Trends Chart
  const trendFilterChips = document.querySelectorAll('.chip-btn');
  const yMax = document.getElementById('yMax');
  const yMid = document.getElementById('yMid');
  const yMin = document.getElementById('yMin');
  const trendSvgLine = document.getElementById('trendSvgLine');
  const trendSvgArea = document.getElementById('trendSvgArea');

  // Modals
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

  // Quick Action Buttons
  const btnQuickPdf = document.getElementById('btnQuickPdf');
  const btnQuickEmail = document.getElementById('btnQuickEmail');
  const btnQuickSchedule = document.getElementById('btnQuickSchedule');

  // Nav Links
  const sidebarLinks = document.querySelectorAll('.sidebar-link');

  // State
  let currentWorkerId = 'VG-014';
  let mapZoomLevel = 1.0;
  let activeMetric = 'hr';
  let isStreamActive = true;
  let timerLoop = null;
  const HERO_CIRCUMFERENCE = 282.74; // 2 * PI * 45

  // Trend Datasets
  const TREND_DATA = {
    hr: {
      yMax: '140', yMid: '100', yMin: '60',
      line: 'M28,110 Q70,95 110,105 T190,90 T260,100 T330,70 T375,55',
      area: 'M28,110 Q70,95 110,105 T190,90 T260,100 T330,70 T375,55 L375,120 L28,120 Z',
      stroke: '#ef4444'
    },
    spo2: {
      yMax: '100', yMid: '95', yMin: '90',
      line: 'M28,50 Q70,55 110,50 T190,48 T260,52 T330,46 T375,48',
      area: 'M28,50 Q70,55 110,50 T190,48 T260,52 T330,46 T375,48 L375,120 L28,120 Z',
      stroke: '#10b981'
    },
    temp: {
      yMax: '39.0', yMid: '37.0', yMin: '35.0',
      line: 'M28,80 Q70,75 110,80 T190,70 T260,75 T330,68 T375,65',
      area: 'M28,80 Q70,75 110,80 T190,70 T260,75 T330,68 T375,65 L375,120 L28,120 Z',
      stroke: '#10b981'
    },
    co: {
      yMax: '300', yMid: '150', yMin: '0',
      line: 'M28,95 Q70,90 110,95 T190,85 T260,90 T330,80 T375,76',
      area: 'M28,95 Q70,90 110,95 T190,85 T260,90 T330,80 T375,76 L375,120 L28,120 Z',
      stroke: '#10b981'
    },
    motion: {
      yMax: '20.0', yMid: '10.0', yMin: '0.0',
      line: 'M28,100 Q70,85 110,95 T190,75 T260,90 T330,85 T375,90',
      area: 'M28,100 Q70,85 110,95 T190,75 T260,90 T330,85 T375,90 L375,120 L28,120 Z',
      stroke: '#0284c7'
    },
    battery: {
      yMax: '100', yMid: '60', yMin: '20',
      line: 'M28,30 Q90,34 160,38 T260,42 T375,48',
      area: 'M28,30 Q90,34 160,38 T260,42 T375,48 L375,120 L28,120 Z',
      stroke: '#10b981'
    }
  };

  /**
   * Live Clock Updater
   */
  function updateTimestamp() {
    const now = new Date();
    telemetryTimeStr.textContent = now.toLocaleTimeString();
  }
  setInterval(updateTimestamp, 1000);
  updateTimestamp();

  /**
   * Render Worker Dashboard
   */
  function renderDashboard(worker, jitter = false) {
    if (!worker) return;

    let v = { ...worker.vitals };
    if (jitter) {
      v.hr += Math.floor(Math.random() * 3) - 1;
      v.temp = +(v.temp + (Math.random() * 0.1 - 0.05)).toFixed(1);
      v.gas += Math.floor(Math.random() * 5) - 2;
    }

    // Hero Card
    heroWorkerName.textContent = worker.name;
    heroWorkerMeta.textContent = `${worker.id} • ${worker.sector}`;
    heroDrsVal.textContent = worker.drs;
    heroDrsBadge.textContent = worker.drsTag;

    const offset = HERO_CIRCUMFERENCE * (1 - worker.drs / 100);
    heroGaugeRing.style.strokeDashoffset = offset;
    heroGaugeRing.style.stroke = worker.drs > 70 ? '#ef4444' : (worker.drs > 40 ? '#f59e0b' : '#10b981');
    heroDrsBadge.style.color = worker.drs > 70 ? '#ef4444' : (worker.drs > 40 ? '#f59e0b' : '#34d399');

    // Hero Vitals Strip
    vHR.textContent = v.hr;
    vSpO2.textContent = v.spo2;
    vTemp.textContent = v.temp;
    vCO.textContent = v.gas;
    vMotion.textContent = v.motion;
    vBattery.textContent = v.battery;

    // 6 Telemetry Cards
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

    // AI Risk Contributors
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

    // Modal data
    modalWorkerName.textContent = worker.name;
    modalDeviceId.textContent = worker.id;
    modalRiskScore.textContent = `${worker.drs} / 100 (${worker.drsTag})`;
    modalCOExposure.textContent = `${v.gas} PPM (Safe Limit)`;
  }

  /**
   * Start Live Simulation Tick
   */
  function startSimulation() {
    if (timerLoop) clearInterval(timerLoop);
    timerLoop = setInterval(() => {
      if (!isStreamActive) return;
      const worker = window.WORKER_DATASETS[currentWorkerId];
      renderDashboard(worker, true);
    }, 2500);
  }

  // Stream rate switcher
  streamRateSelect.addEventListener('change', (e) => {
    if (e.target.value === 'pause') {
      isStreamActive = false;
    } else {
      isStreamActive = true;
    }
  });

  // 24-Hour Trend Filters
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

  // Map Zoom Controls
  btnMapZoomIn.addEventListener('click', () => {
    mapZoomLevel = Math.min(2.0, mapZoomLevel + 0.2);
    satelliteMapBox.querySelector('.satellite-img-bg').style.transform = `scale(${mapZoomLevel})`;
  });

  btnMapZoomOut.addEventListener('click', () => {
    mapZoomLevel = Math.max(0.8, mapZoomLevel - 0.2);
    satelliteMapBox.querySelector('.satellite-img-bg').style.transform = `scale(${mapZoomLevel})`;
  });

  btnMapCenter.addEventListener('click', () => {
    mapZoomLevel = 1.0;
    satelliteMapBox.querySelector('.satellite-img-bg').style.transform = 'scale(1.0)';
  });

  btnViewFullMap.addEventListener('click', () => {
    alert(`Industrial Plant Map: \nSector B (Boiler Plant Area 1): Worker VG-014 (R. Kumar)\nSector A (Control Tower): Worker VG-007 (A. Sharma)\nSector D (Foundry): Worker VG-023 (S. Patel)\nSector C (Chemical Vault): Worker VG-042 (M. Singh)\n\nAll 12 LoRa Wearables active on 433MHz Mesh.`);
  });

  // Modals Handling - Worker Report
  function openWorkerReport() {
    reportPreviewModal.classList.add('open');
  }
  btnPreviewWorkerReport.addEventListener('click', openWorkerReport);
  btnSubmitWorkerReport.addEventListener('click', () => {
    alert(`Safety report for ${currentWorkerId} compiled and dispatched to Safety Operations.`);
  });
  closeReportModalBtn.addEventListener('click', () => {
    reportPreviewModal.classList.remove('open');
  });
  btnDispatchReport.addEventListener('click', () => {
    reportPreviewModal.classList.remove('open');
    alert(`Report securely transmitted via encrypted LoRa Gateway endpoint.`);
  });

  // Modals Handling - Insurance
  function openInsuranceModal() {
    insurancePreviewModal.classList.add('open');
  }
  btnPreviewInsurance.addEventListener('click', openInsuranceModal);
  btnSubmitInsurance.addEventListener('click', () => {
    alert(`Insurance compliance audit docket transmitted to carrier underwriting API.`);
  });
  closeInsuranceModalBtn.addEventListener('click', () => {
    insurancePreviewModal.classList.remove('open');
  });
  btnConfirmSendInsurer.addEventListener('click', () => {
    insurancePreviewModal.classList.remove('open');
    alert(`Dossier signed with digital certificate and uploaded to Underwriter.`);
  });

  // Close modals on overlay click
  window.addEventListener('click', (e) => {
    if (e.target === reportPreviewModal) reportPreviewModal.classList.remove('open');
    if (e.target === insurancePreviewModal) insurancePreviewModal.classList.remove('open');
  });

  // Quick Action Buttons
  btnQuickPdf.addEventListener('click', () => window.print());
  btnQuickEmail.addEventListener('click', () => {
    const email = prompt('Enter Safety Director / Recipient Email Address:', 'safety-officer@plant.com');
    if (email) alert(`Full shift telemetry PDF sent to ${email}`);
  });
  btnQuickSchedule.addEventListener('click', () => {
    alert('Automated Report Scheduler Active: Daily EOD Shift Audit configured for 06:00, 14:00, and 22:00 UTC.');
  });

  // Notifications Bell
  bellNotifTrigger.addEventListener('click', () => {
    alert('Active Safety Notifications (2):\n1. [10:20 PM] Heart rate reached 100 BPM (Sector B)\n2. [09:35 PM] Inactivity detected during high temperature exposure');
  });

  // Global Search
  globalSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = globalSearchInput.value.trim().toUpperCase();
      if (window.WORKER_DATASETS[q]) {
        currentWorkerId = q;
        renderDashboard(window.WORKER_DATASETS[q], false);
      } else if (q.includes('KUMAR') || q.includes('VG-014')) {
        currentWorkerId = 'VG-014';
        renderDashboard(window.WORKER_DATASETS['VG-014'], false);
      } else if (q.includes('SHARMA') || q.includes('VG-007')) {
        currentWorkerId = 'VG-007';
        renderDashboard(window.WORKER_DATASETS['VG-007'], false);
      } else if (q.includes('PATEL') || q.includes('VG-023')) {
        currentWorkerId = 'VG-023';
        renderDashboard(window.WORKER_DATASETS['VG-023'], false);
      } else if (q.includes('SINGH') || q.includes('VG-042')) {
        currentWorkerId = 'VG-042';
        renderDashboard(window.WORKER_DATASETS['VG-042'], false);
      } else {
        alert(`Showing search results for "${globalSearchInput.value}": 1 match in Plant Area 1.`);
      }
    }
  });

  // Sidebar Links Click Handlers
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const tab = link.dataset.tab;
      if (tab === 'reports') openWorkerReport();
      else if (tab === 'insurance') openInsuranceModal();
      else if (tab === 'livemap') btnViewFullMap.click();
      else if (tab === 'alerts') bellNotifTrigger.click();
      else if (tab === 'workers') {
        const nextId = currentWorkerId === 'VG-014' ? 'VG-023' : (currentWorkerId === 'VG-023' ? 'VG-042' : 'VG-014');
        currentWorkerId = nextId;
        renderDashboard(window.WORKER_DATASETS[nextId], false);
      }
    });
  });

  // Recent Events View All
  document.getElementById('btnViewAllEvents').addEventListener('click', (e) => {
    e.preventDefault();
    openWorkerReport();
  });

  // Initial Load
  renderDashboard(window.WORKER_DATASETS['VG-014'], false);
  startSimulation();
});
