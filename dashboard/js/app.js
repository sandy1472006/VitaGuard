/**
 * VitaGuard Supervisor - Main Application Logic
 * Integrates Real-time Telemetry, Sensor Fusion Engine, and Supervisor Controls
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const workerSelect = document.getElementById('workerSelect');
  const demoToggleBtn = document.getElementById('demoToggleBtn');
  const sosTriggerBtn = document.getElementById('sosTriggerBtn');
  const emergencyBanner = document.getElementById('emergencyBanner');
  const dismissSosBtn = document.getElementById('dismissSosBtn');
  const sosWorkerTag = document.getElementById('sosWorkerTag');

  // Gauge & DRS Elements
  const gaugeProgressRing = document.getElementById('gaugeProgressRing');
  const drsValue = document.getElementById('drsValue');
  const drsBadge = document.getElementById('drsBadge');
  const drsHeadline = document.getElementById('drsHeadline');
  const fusionScoreHighlight = document.getElementById('fusionScoreHighlight');

  // Worker Profile Elements
  const workerName = document.getElementById('workerName');
  const workerSub = document.getElementById('workerSub');
  const profileBaseline = document.getElementById('profileBaseline');
  const profileLastPacket = document.getElementById('profileLastPacket');
  const profileConnection = document.getElementById('profileConnection');
  const openReportBtn = document.getElementById('openReportBtn');

  // Predictive Analytics
  const predTitle = document.getElementById('predTitle');
  const predDesc = document.getElementById('predDesc');
  const predTrendStatus = document.getElementById('predTrendStatus');
  const predTrendText = document.getElementById('predTrendText');

  // Metrics
  const valHeartRate = document.getElementById('valHeartRate');
  const badgeHeartRate = document.getElementById('badgeHeartRate');
  const valSpO2 = document.getElementById('valSpO2');
  const badgeSpO2 = document.getElementById('badgeSpO2');
  const valTemp = document.getElementById('valTemp');
  const badgeTemp = document.getElementById('badgeTemp');
  const valCO = document.getElementById('valCO');
  const badgeCO = document.getElementById('badgeCO');
  const valMotion = document.getElementById('valMotion');
  const badgeMotion = document.getElementById('badgeMotion');
  const valBattery = document.getElementById('valBattery');
  const badgeBattery = document.getElementById('badgeBattery');
  const updateStamp = document.getElementById('updateStamp');

  // AI Breakdown Bars
  const barHR = document.getElementById('barHR');
  const weightHR = document.getElementById('weightHR');
  const barSpO2 = document.getElementById('barSpO2');
  const weightSpO2 = document.getElementById('weightSpO2');
  const barCO = document.getElementById('barCO');
  const weightCO = document.getElementById('weightCO');
  const barTemp = document.getElementById('barTemp');
  const weightTemp = document.getElementById('weightTemp');
  const barMotion = document.getElementById('barMotion');
  const weightMotion = document.getElementById('weightMotion');

  // Fatigue
  const fatigueBadge = document.getElementById('fatigueBadge');
  const fatigueTitle = document.getElementById('fatigueTitle');
  const fatigueDesc = document.getElementById('fatigueDesc');
  const fatiguePointer = document.getElementById('fatiguePointer');

  // Terminal & Base Station
  const toggleLogBtn = document.getElementById('toggleLogBtn');
  const telemetryDrawer = document.getElementById('telemetryDrawer');
  const rawLogTerminal = document.getElementById('rawLogTerminal');
  const clearLogBtn = document.getElementById('clearLogBtn');
  const baseStationIp = document.getElementById('baseStationIp');
  const connectBtn = document.getElementById('connectBtn');

  // Modal
  const reportModal = document.getElementById('reportModal');
  const closeReportBtn = document.getElementById('closeReportBtn');
  const confirmReportBtn = document.getElementById('confirmReportBtn');
  const printReportBtn = document.getElementById('printReportBtn');
  const auditTableBody = document.getElementById('auditTableBody');

  // State
  let currentWorkerId = 'VG-014';
  let isDemoRunning = true;
  let isSosActive = false;
  let timerInterval = null;
  let packetCounter = 1042;
  let auditHistory = [];

  // Audio Context for SOS Alert (Gentle web audio beep)
  let audioCtx = null;
  function playAlertBeep() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      // Audio autoplay might be blocked
    }
  }

  /**
   * Log an incoming packet to the terminal drawer
   */
  function logPacket(type, payload, rssi = '-63dBm') {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const logLine = `[${timeStr}] ${type}: ${payload},RSSI=${rssi}\n`;
    rawLogTerminal.textContent += logLine;
    rawLogTerminal.scrollTop = rawLogTerminal.scrollHeight;
  }

  /**
   * Render the Worker Profile & Telemetry to the UI
   */
  function renderWorker(workerData, jitter = false) {
    if (!workerData) return;

    let vitals = { ...workerData.vitals };
    if (jitter && !isSosActive) {
      // Add subtle real-time natural oscillation
      vitals.hr += Math.floor(Math.random() * 3) - 1;
      vitals.temp = +(vitals.temp + (Math.random() * 0.1 - 0.05)).toFixed(1);
      vitals.co += Math.floor(Math.random() * 5) - 2;
    }

    // Dynamic Risk Score calculation
    let currentScore = workerData.drs;
    let breakdown = workerData.weights;
    let status = workerData.status;

    if (isSosActive) {
      currentScore = 95;
      status = 'CRITICAL';
      breakdown = { hr: 25, spo2: 15, co: 10, temp: 5, motion: 40 };
    }

    // Update Donut Gauge
    drsValue.textContent = currentScore;
    fusionScoreHighlight.textContent = currentScore;
    const offset = window.RiskEngine.getGaugeOffset(currentScore);
    gaugeProgressRing.style.strokeDashoffset = offset;

    // Gauge Colors & Status
    drsBadge.className = 'score-status-badge';
    if (currentScore >= 75) {
      drsBadge.textContent = 'CRITICAL';
      drsBadge.classList.add('status-critical');
      gaugeProgressRing.style.stroke = 'var(--accent-red)';
    } else if (currentScore >= 45) {
      drsBadge.textContent = 'WARNING';
      drsBadge.classList.add('status-warning');
      gaugeProgressRing.style.stroke = '#f59e0b';
    } else {
      drsBadge.textContent = 'SAFE';
      drsBadge.classList.add('status-safe');
      gaugeProgressRing.style.stroke = 'var(--accent-mint)';
    }

    drsHeadline.textContent = isSosActive
      ? 'EMERGENCY: Immediate SOS triggered. Evacuate worker now!'
      : workerData.headline;

    // Update Worker Profile Card
    workerName.textContent = workerData.name;
    workerSub.textContent = `${workerData.id} • ${workerData.sector}`;
    profileBaseline.textContent = workerData.baselineHR;
    profileConnection.textContent = workerData.connection;
    profileLastPacket.textContent = 'Just now';

    // Update Predictive Card
    predTitle.textContent = isSosActive ? 'Emergency event active' : workerData.predictiveTitle;
    predDesc.textContent = isSosActive ? 'Priority rescue packet 152 in progress.' : workerData.predictiveDesc;
    predTrendText.textContent = isSosActive ? 'Critical Intervention Required' : workerData.predictiveStatus;
    predTrendStatus.className = `trend-status ${isSosActive ? 'status-critical' : workerData.predictiveClass}`;

    // Update Metrics
    valHeartRate.textContent = vitals.hr;
    badgeHeartRate.className = 'metric-badge ' + (vitals.hr > 95 ? 'badge-elevated' : 'badge-normal');
    badgeHeartRate.textContent = vitals.hr > 95 ? 'ELEVATED' : 'NORMAL';

    valSpO2.textContent = vitals.spo2;
    badgeSpO2.className = 'metric-badge ' + (vitals.spo2 < 95 ? 'badge-critical' : 'badge-normal');
    badgeSpO2.textContent = vitals.spo2 < 95 ? 'LOW' : 'NORMAL';

    valTemp.textContent = vitals.temp;
    badgeTemp.className = 'metric-badge ' + (vitals.temp > 37.5 ? 'badge-elevated' : 'badge-normal');
    badgeTemp.textContent = vitals.temp > 37.5 ? 'ELEVATED' : 'NORMAL';

    valCO.textContent = vitals.co;
    badgeCO.className = 'metric-badge ' + (vitals.co > 400 ? 'badge-critical' : (vitals.co > 50 ? 'badge-normal' : 'badge-normal'));
    badgeCO.textContent = vitals.co > 400 ? 'DANGER' : 'NORMAL';

    valMotion.textContent = vitals.motion;
    badgeMotion.className = 'metric-badge ' + (vitals.motion.includes('Erratic') ? 'badge-critical' : 'badge-normal');

    valBattery.textContent = vitals.battery;
    badgeBattery.className = 'metric-badge ' + (vitals.battery < 20 ? 'badge-critical' : 'badge-normal');
    badgeBattery.textContent = vitals.battery < 20 ? 'LOW' : 'GOOD';

    // Update Breakdown Bars
    weightHR.textContent = `+${breakdown.hr}`;
    barHR.style.width = `${Math.min(100, breakdown.hr * 3.5)}%`;

    weightSpO2.textContent = `+${breakdown.spo2}`;
    barSpO2.style.width = `${Math.min(100, breakdown.spo2 * 3.5)}%`;

    weightCO.textContent = `+${breakdown.co}`;
    barCO.style.width = `${Math.min(100, breakdown.co * 2.2)}%`;

    weightTemp.textContent = `+${breakdown.temp}`;
    barTemp.style.width = `${Math.min(100, breakdown.temp * 4.0)}%`;

    weightMotion.textContent = `+${breakdown.motion}`;
    barMotion.style.width = `${Math.min(100, breakdown.motion * 3.5)}%`;

    // Fatigue Analysis Card
    fatigueTitle.textContent = isSosActive ? 'Critical exhaustion' : workerData.fatigueTitle;
    fatigueDesc.textContent = isSosActive ? 'Worker reported manual emergency distress.' : workerData.fatigueDesc;
    fatigueBadge.textContent = isSosActive ? 'DANGER' : workerData.fatigueBadge;
    fatigueBadge.className = isSosActive ? 'badge-pill-live bg-red' : (workerData.fatigueBadge === 'NORMAL' ? 'badge-pill-live' : 'badge-elevated-pill');
    fatiguePointer.style.left = `${isSosActive ? 95 : workerData.fatiguePos}%`;

    // Audit History Entry
    auditHistory.unshift({
      time: new Date().toLocaleTimeString(),
      hr: vitals.hr,
      spo2: vitals.spo2,
      temp: vitals.temp,
      co: vitals.co,
      score: currentScore,
      sos: isSosActive ? 1 : 0
    });
    if (auditHistory.length > 10) auditHistory.pop();

    updateStamp.textContent = `DEMO UPDATE ${new Date().toLocaleTimeString()}`;
  }

  /**
   * Run Live Simulation Loop
   */
  function startSimulation() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (!isDemoRunning) return;
      const worker = window.WORKER_PROFILES[currentWorkerId];
      renderWorker(worker, true);

      // Log mock LoRa packet
      packetCounter++;
      const v = worker.vitals;
      const pktType = isSosActive ? 'RX_PKT_152_PRIORITY' : 'RX_PKT_151_ROUTINE';
      const pktPayload = `VITAGUARD,${worker.id},HR=${v.hr},SPO2=${v.spo2},SKINTEMP=${v.temp},CO_PPM=${v.co},SOS=${isSosActive ? 1 : 0}`;
      logPacket(pktType, pktPayload);
    }, 2500);
  }

  // Worker Dropdown Switch
  workerSelect.addEventListener('change', (e) => {
    currentWorkerId = e.target.value;
    isSosActive = false;
    emergencyBanner.classList.remove('show');
    const worker = window.WORKER_PROFILES[currentWorkerId];
    renderWorker(worker, false);
    logPacket('WORKER_SWITCH', `Switched active monitor to ${worker.id} (${worker.name})`);
  });

  // Toggle Demo Simulation
  demoToggleBtn.addEventListener('click', () => {
    isDemoRunning = !isDemoRunning;
    demoToggleBtn.classList.toggle('active', isDemoRunning);
    demoToggleBtn.querySelector('span:last-child').textContent = isDemoRunning ? 'DEMO SIMULATION' : 'SIMULATION PAUSED';
  });

  // Trigger Hardware SOS Simulation
  sosTriggerBtn.addEventListener('click', () => {
    isSosActive = true;
    playAlertBeep();
    const worker = window.WORKER_PROFILES[currentWorkerId];
    sosWorkerTag.textContent = `${worker.id} (${worker.name})`;
    emergencyBanner.classList.add('show');
    renderWorker(worker, false);
    logPacket('RX_PRIORITY_SOS', `VITAGUARD,SOS,${worker.id},EVENT_ID=${packetCounter},SOS=1`, '-58dBm');
  });

  // Dismiss SOS Alert
  dismissSosBtn.addEventListener('click', () => {
    isSosActive = false;
    emergencyBanner.classList.remove('show');
    const worker = window.WORKER_PROFILES[currentWorkerId];
    renderWorker(worker, false);
    logPacket('SYS_EVENT', `Supervisor acknowledged and reset SOS for ${worker.id}`);
  });

  // Toggle Packet Drawer
  toggleLogBtn.addEventListener('click', () => {
    telemetryDrawer.classList.toggle('open');
  });

  // Clear Packet Log
  clearLogBtn.addEventListener('click', () => {
    rawLogTerminal.textContent = '[00:00:00] Terminal cleared by supervisor.\n';
  });

  // Connect Button (ESP32 Live Fetch)
  connectBtn.addEventListener('click', async () => {
    const url = baseStationIp.value.trim();
    connectBtn.textContent = 'CONNECTING...';
    try {
      const resp = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (resp.ok) {
        const data = await resp.json();
        logPacket('ESP32_LINK_OK', `Connected to base station at ${url}. Live stream active.`);
        connectBtn.textContent = 'CONNECTED';
      } else {
        throw new Error('Endpoint returned HTTP ' + resp.status);
      }
    } catch (err) {
      logPacket('ESP32_FALLBACK', `Endpoint ${url} unreachable (${err.message}). Maintaining LoRa demo simulator.`);
      connectBtn.textContent = 'DEMO MODE';
      setTimeout(() => { connectBtn.textContent = 'CONNECT'; }, 2000);
    }
  });

  // Report Modal Open / Close
  openReportBtn.addEventListener('click', () => {
    const worker = window.WORKER_PROFILES[currentWorkerId];
    document.getElementById('repWorkerName').textContent = worker.name;
    document.getElementById('repWorkerID').textContent = worker.id;
    document.getElementById('repScore').textContent = `${drsValue.textContent} / 100 (${drsBadge.textContent})`;
    document.getElementById('repCO').textContent = `${valCO.textContent} PPM`;
    document.getElementById('reportTimestamp').textContent = `Generated: ${new Date().toLocaleTimeString()} • Audit ID: VG-REP-${Date.now().toString().slice(-6)}`;

    // Populate audit table
    auditTableBody.innerHTML = auditHistory.map((row, idx) => `
      <tr>
        <td>T-${idx * 2.5}s</td>
        <td>${row.hr} BPM</td>
        <td>${row.spo2}%</td>
        <td>${row.temp}°C</td>
        <td>${row.co}</td>
        <td><span class="${row.score > 70 ? 'badge-critical' : 'tag-safe'}">${row.score}</span></td>
        <td>${row.sos ? '<strong style="color:red">SOS (1)</strong>' : 'Normal (0)'}</td>
      </tr>
    `).join('') || `<tr><td colspan="7">No records in rolling buffer yet.</td></tr>`;

    reportModal.classList.add('show');
  });

  closeReportBtn.addEventListener('click', () => reportModal.classList.remove('show'));
  confirmReportBtn.addEventListener('click', () => reportModal.classList.remove('show'));
  printReportBtn.addEventListener('click', () => window.print());

  // Initial Boot
  renderWorker(window.WORKER_PROFILES['VG-014']);
  startSimulation();
});
