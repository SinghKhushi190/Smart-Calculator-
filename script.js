const modes = {
  projectile: {
    title: "Dynamic Projectile Range",
    fields: [
      {
        id: "v0",
        label: "Launch Velocity",
        unit: "m/s",
        min: 10,
        max: 100,
        step: 1,
        val: 45,
      },
      {
        id: "angle",
        label: "Launch Angle",
        unit: "°",
        min: 5,
        max: 85,
        step: 1,
        val: 45,
      },
      {
        id: "g",
        label: "Gravitational Pull",
        unit: "m/s²",
        min: 1.6,
        max: 25,
        step: 0.1,
        val: 9.8,
      },
      {
        id: "h0",
        label: "Alt. Elevation",
        unit: "m",
        min: 0,
        max: 150,
        step: 1,
        val: 20,
      },
    ],
  },
  circular: {
    title: "Orbital & Centripetal Rotations",
    fields: [
      {
        id: "r",
        label: "Orbit Radius",
        unit: "m",
        min: 1,
        max: 40,
        step: 0.5,
        val: 20,
      },
      {
        id: "rpm",
        label: "Angular Velocity",
        unit: "RPM",
        min: 5,
        max: 120,
        step: 1,
        val: 30,
      },
      {
        id: "m",
        label: "Object Mass",
        unit: "kg",
        min: 0.5,
        max: 50,
        step: 0.5,
        val: 5,
      },
    ],
  },
  spring: {
    title: "Damped Spring Oscillation",
    fields: [
      {
        id: "k",
        label: "Stiffness Elasticity (k)",
        unit: "N/m",
        min: 5,
        max: 150,
        step: 1,
        val: 40,
      },
      {
        id: "m",
        label: "Suspended Mass",
        unit: "kg",
        min: 0.5,
        max: 20,
        step: 0.1,
        val: 4,
      },
      {
        id: "A",
        label: "Offset Displacement",
        unit: "m",
        min: 1,
        max: 15,
        step: 0.2,
        val: 10,
      },
      {
        id: "b",
        label: "Viscous Damping",
        unit: "N·s/m",
        min: 0,
        max: 5,
        step: 0.05,
        val: 0.3,
      },
    ],
  },
};

let currentMode = "projectile";
let isPlaying = true;
let simTime = 0;
let lastTimestamp = 0;
let animationFrameId = null;
let trailPoints = [];

function buildFields(mode) {
  const container = document.getElementById("inputFields");
  container.innerHTML = "";
  modes[mode].fields.forEach((f) => {
    const div = document.createElement("div");
    div.className = "field";
    div.innerHTML = `<label>${f.label} <span id="lbl_${f.id}">${f.val} ${f.unit}</span></label>
      <input type="range" id="rng_${f.id}" min="${f.min}" max="${f.max}" step="${f.step}" value="${f.val}" />`;
    container.appendChild(div);
    const rng = div.querySelector("input");
    rng.addEventListener("input", () => {
      document.getElementById("lbl_" + f.id).textContent =
        rng.value + " " + f.unit;
      resetSimulation();
    });
  });
}

function getParams() {
  const p = {};
  modes[currentMode].fields.forEach((f) => {
    const el = document.getElementById("rng_" + f.id);
    p[f.id] = el ? parseFloat(el.value) : f.val;
  });
  return p;
}

function resetSimulation() {
  simTime = 0;
  trailPoints = [];
}

// Global Core Loops & Live UI Syncing
function runPhysicsEngine(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  let dt = (timestamp - lastTimestamp) / 1000;
  if (dt > 0.1) dt = 0.1; // Caps extreme lag spikes
  lastTimestamp = timestamp;

  if (isPlaying) {
    simTime += dt;
  }

  const p = getParams();
  const canvas = document.getElementById("vizCanvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width,
    H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  // Structural UI Environmental Theme Configurations
  const gridColor = "rgba(255, 255, 255, 0.07)";
  const axisColor = "rgba(255, 255, 255, 0.25)";
  const groundColor = "#1f2937";

  let computedMetrics = [];
  let tableData = { headers: [], rows: [] };

  if (currentMode === "projectile") {
    const alpha = (p.angle * Math.PI) / 180;
    const vx = p.v0 * Math.cos(alpha);
    const vy0 = p.v0 * Math.sin(alpha);

    // Exact analytical ceiling profiles
    const discriminant = vy0 * vy0 + 2 * p.g * p.h0;
    const totalFlightTime = (vy0 + Math.sqrt(discriminant)) / p.g;
    const maxRange = vx * totalFlightTime;
    const maxHeight = p.h0 + (vy0 * vy0) / (2 * p.g);

    if (simTime > totalFlightTime) simTime = totalFlightTime; // Cap termination floor

    // Instantaneous Calculations
    const currentX = vx * simTime;
    const currentY = p.h0 + vy0 * simTime - 0.5 * p.g * simTime * simTime;
    const currentVy = vy0 - p.g * simTime;
    const currentV = Math.sqrt(vx * vx + currentVy * currentVy);

    if (isPlaying && simTime < totalFlightTime) {
      trailPoints.push({ x: currentX, y: currentY });
    }

    // Dynamic Matrix Scaling Aspect Bounds
    const scaleX = (W - 100) / Math.max(maxRange, 50);
    const scaleY = (H - 120) / Math.max(maxHeight, 50);
    const scale = Math.min(scaleX, scaleY); // Maintain un-warped uniform sizing

    const originX = 60;
    const originY = H - 60;

    // Drawing Grid Lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i < W; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, H);
      ctx.stroke();
    }
    for (let i = 0; i < H; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(W, i);
      ctx.stroke();
    }

    // Surface Base
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, originY, W, H - originY);
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, originY);
    ctx.lineTo(W, originY);
    ctx.stroke();

    // Render continuous vector trace
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    trailPoints.forEach((pt, idx) => {
      const cx = originX + pt.x * scale;
      const cy = originY - pt.y * scale;
      if (idx === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.stroke();

    // Moving Projectile Object
    const pX = originX + currentX * scale;
    const pY = originY - currentY * scale;
    ctx.fillStyle = "#f43f5e";
    ctx.beginPath();
    ctx.arc(pX, pY, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Dynamic Velocity Vector Line
    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pX, pY);
    ctx.lineTo(pX + (vx / p.v0) * 40, pY - (currentVy / p.v0) * 40);
    ctx.stroke();

    computedMetrics = [
      { label: "Live Velocity", val: currentV.toFixed(1), unit: "m/s" },
      { label: "Altitude Range", val: currentX.toFixed(1), unit: "m" },
      { label: "Peak Target Height", val: maxHeight.toFixed(1), unit: "m" },
      { label: "Terminal Boundary", val: maxRange.toFixed(1), unit: "m" },
    ];

    tableData.headers = [
      "Time (s)",
      "Position X (m)",
      "Position Y (m)",
      "Net Velocity (m/s)",
    ];
    const sampleSize = 5;
    for (let i = 0; i <= sampleSize; i++) {
      const tStep = (simTime * i) / sampleSize;
      const sx = vx * tStep;
      const sy = p.h0 + vy0 * tStep - 0.5 * p.g * tStep * tStep;
      const svy = vy0 - p.g * tStep;
      tableData.rows.push([
        tStep.toFixed(2),
        sx.toFixed(1),
        sy.toFixed(1),
        Math.sqrt(vx * vx + svy * svy).toFixed(1),
      ]);
    }
  } else if (currentMode === "circular") {
    const omega = (p.rpm * 2 * Math.PI) / 60;
    const v = omega * p.r;
    const ac = omega * omega * p.r;
    const Fc = p.m * ac;
    const theta = omega * simTime;

    const centerX = W / 2;
    const centerY = H / 2;
    const visualScale = (Math.min(W, H) - 100) / 80; // Fit system inside bounds cleanly

    // Track Ring Orbit
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, p.r * visualScale, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);

    // Live Coordinates
    const obX = centerX + p.r * Math.cos(theta) * visualScale;
    const obY = centerY - p.r * Math.sin(theta) * visualScale;

    // Anchor Pivot Center
    ctx.fillStyle = "#6b7280";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fill();
    // Leash String
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(obX, obY);
    ctx.stroke();

    // Mass Node Object
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(obX, obY, Math.max(6, Math.min(20, p.m * 0.4)), 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Centripetal Acceleration Directional Vector Line
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(obX, obY);
    ctx.lineTo(obX - Math.cos(theta) * 45, obY + Math.sin(theta) * 45);
    ctx.stroke();

    // Tangential Velocity Vector Line
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(obX, obY);
    ctx.lineTo(obX - Math.sin(theta) * 45, obY - Math.cos(theta) * 45);
    ctx.stroke();

    computedMetrics = [
      { label: "Tangential Velocity", val: v.toFixed(2), unit: "m/s" },
      { label: "Centripetal Force", val: Fc.toFixed(1), unit: "N" },
      { label: "Angular Speed", val: omega.toFixed(2), unit: "rad/s" },
      { label: "Centripetal Accel.", val: ac.toFixed(1), unit: "m/s²" },
    ];

    tableData.headers = [
      "Time (s)",
      "Theta (rad)",
      "X Coord (m)",
      "Y Coord (m)",
    ];
    for (let i = 0; i <= 5; i++) {
      const t = simTime - (5 - i) * 0.2;
      if (t < 0) continue;
      const th = omega * t;
      tableData.rows.unshift([
        t.toFixed(2),
        (th % (2 * Math.PI)).toFixed(2),
        (p.r * Math.cos(th)).toFixed(1),
        (p.r * Math.sin(th)).toFixed(1),
      ]);
    }
  } else if (currentMode === "spring") {
    const omega0 = Math.sqrt(p.k / p.m);
    const gamma = p.b / (2 * p.m);

    // Oscillatory state identification
    let currentDisp = 0;
    let currentVel = 0;
    if (gamma < omega0) {
      const omegaD = Math.sqrt(omega0 * omega0 - gamma * gamma);
      currentDisp =
        p.A * Math.exp(-gamma * simTime) * Math.cos(omegaD * simTime);
      currentVel =
        p.A *
        Math.exp(-gamma * simTime) *
        (-gamma * Math.cos(omegaD * simTime) -
          omegaD * Math.sin(omegaD * simTime));
    } else {
      // Overdamped/Critical fallbacks
      currentDisp = p.A * Math.exp(-gamma * simTime);
      currentVel = -gamma * p.A * Math.exp(-gamma * simTime);
    }

    const startX = 60;
    const centerY = H / 2;
    const restLength = W * 0.45;
    const visualScaleFactor = (W * 0.35) / p.A;
    const targetMassX = startX + restLength + currentDisp * visualScaleFactor;

    // Render Anchor Wall Base
    ctx.fillStyle = "#4b5563";
    ctx.fillRect(startX - 15, centerY - 60, 15, 120);

    // Generate Elastic Dynamic Spring Coil Loops
    ctx.strokeStyle = "#9ca3af";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(startX, centerY);
    const totalCoils = 16;
    const stepX = (targetMassX - startX) / totalCoils;
    for (let i = 1; i < totalCoils; i++) {
      const cx = startX + i * stepX;
      const cy = centerY + (i % 2 === 0 ? -25 : 25);
      ctx.lineTo(cx, cy);
    }
    ctx.lineTo(targetMassX, centerY);
    ctx.stroke();

    // Mass block body
    const blockWidth = Math.max(30, Math.min(70, p.m * 3.5));
    ctx.fillStyle = "#a855f7";
    ctx.fillRect(targetMassX, centerY - blockWidth / 2, blockWidth, blockWidth);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(
      targetMassX,
      centerY - blockWidth / 2,
      blockWidth,
      blockWidth,
    );

    // Equilateral resting center guide line
    ctx.strokeStyle = "rgba(234, 179, 8, 0.4)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(startX + restLength, 0);
    ctx.lineTo(startX + restLength, H);
    ctx.stroke();
    ctx.setLineDash([]);

    computedMetrics = [
      { label: "Displacement", val: currentDisp.toFixed(2), unit: "m" },
      { label: "Instant Velocity", val: currentVel.toFixed(2), unit: "m/s" },
      {
        label: "System Energy",
        val: (
          0.5 * p.m * currentVel * currentVel +
          0.5 * p.k * currentDisp * currentDisp
        ).toFixed(2),
        unit: "J",
      },
      { label: "Damping Ratio", val: (gamma / omega0).toFixed(3), unit: "ζ" },
    ];

    tableData.headers = ["Time (s)", "Displacement (m)", "Velocity (m/s)"];
    for (let i = 0; i <= 5; i++) {
      const t = Math.max(0, simTime - (5 - i) * 0.2);
      let d = 0,
        v_t = 0;
      if (gamma < omega0) {
        const oD = Math.sqrt(omega0 * omega0 - gamma * gamma);
        d = p.A * Math.exp(-gamma * t) * Math.cos(oD * t);
        v_t =
          p.A *
          Math.exp(-gamma * t) *
          (-gamma * Math.cos(oD * t) - oD * Math.sin(oD * t));
      } else {
        d = p.A * Math.exp(-gamma * t);
        v_t = -gamma * p.A * Math.exp(-gamma * t);
      }
      tableData.rows.unshift([t.toFixed(2), d.toFixed(3), v_t.toFixed(2)]);
    }
  }

  renderMetrics(computedMetrics);
  renderTable(tableData);

  animationFrameId = requestAnimationFrame(runPhysicsEngine);
}

function renderMetrics(metrics) {
  const g = document.getElementById("metricsGrid");
  g.innerHTML = metrics
    .map(
      (m) => `
    <div class="metric">
      <div class="metric-label">${m.label}</div>
      <div class="metric-value">${m.val} <span class="metric-unit">${m.unit}</span></div>
    </div>`,
    )
    .join("");
}

function renderTable(table) {
  document.getElementById("tableHead").innerHTML = table.headers
    .map((h) => `<th>${h}</th>`)
    .join("");
  document.getElementById("tableBody").innerHTML = table.rows
    .map((row) => `<tr>${row.map((v) => `<td>${v}</td>`).join("")}</tr>`)
    .join("");
}

function setupLegends() {
  const leg = document.getElementById("chartLegend");
  if (currentMode === "projectile") {
    leg.innerHTML = `<div class="legend-item"><div class="legend-dot" style="background:#38bdf8"></div>Trajectory</div>
                     <div class="legend-item"><div class="legend-dot" style="background:#eab308"></div>v-Vector</div>`;
  } else if (currentMode === "circular") {
    leg.innerHTML = `<div class="legend-item"><div class="legend-dot" style="background:#ef4444"></div>a-Centripetal</div>
                     <div class="legend-item"><div class="legend-dot" style="background:#3b82f6"></div>v-Tangential</div>`;
  } else {
    leg.innerHTML = `<div class="legend-item"><div class="legend-dot" style="background:#a855f7"></div>Oscillator</div>
                     <div class="legend-item"><div class="legend-dot" style="background:#ea580c"></div>Rest Position</div>`;
  }
  document.getElementById("chartTitle").textContent = modes[currentMode].title;
}

function resizeCanvas() {
  const wrap = document.getElementById("canvasWrap");
  const canvas = document.getElementById("vizCanvas");
  const dpr = window.devicePixelRatio || 1;
  canvas.width = wrap.clientWidth * dpr;
  canvas.height = wrap.clientHeight * dpr;
}

// System Event Controllers
document.querySelectorAll(".tab").forEach((t) => {
  t.addEventListener("click", () => {
    document
      .querySelectorAll(".tab")
      .forEach((x) => x.classList.remove("active"));
    t.classList.add("active");
    currentMode = t.dataset.mode;
    buildFields(currentMode);
    setupLegends();
    resetSimulation();
  });
});

const playPauseBtn = document.getElementById("btnPlayPause");
playPauseBtn.addEventListener("click", () => {
  isPlaying = !isPlaying;
  playPauseBtn.innerHTML = isPlaying
    ? `<i class="ti ti-player-pause"></i> Pause`
    : `<i class="ti ti-player-play"></i> Resume`;
});

document.getElementById("btnReset").addEventListener("click", resetSimulation);

// Init Configurations
window.addEventListener("resize", resizeCanvas);
buildFields(currentMode);
setupLegends();
resizeCanvas();
animationFrameId = requestAnimationFrame(runPhysicsEngine);
