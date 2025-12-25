const express = require('express');
const app = express();
const PORT = 3000;

let isHealthy = true;

// Frontend UI + Status
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>self-healing system</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            :root { --neon-blue: #00f3ff; --neon-red: #ff0055; --neon-green: #39ff14; --panel-bg: #12141d; }
            body { background: #08090c; color: #fff; font-family: 'Inter', sans-serif; overflow-x: hidden; }
            .header-bar { border-bottom: 2px solid #222; padding: 15px 30px; background: rgba(0,0,0,0.5); display: flex; justify-content: space-between; align-items: center; }
            .node-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 40px; }
            .node-card { background: var(--panel-bg); border: 1px solid #333; border-radius: 12px; padding: 25px; position: relative; transition: 0.4s ease; }
            .active-ring { position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px; border: 2px solid var(--neon-blue); border-radius: 12px; box-shadow: 0 0 15px var(--neon-blue); opacity: 0; }
            .is-active .active-ring { opacity: 1; }
            .status-indicator { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 10px; }
            .online { background: var(--neon-green); box-shadow: 0 0 10px var(--neon-green); }
            .offline { background: var(--neon-red); box-shadow: 0 0 10px var(--neon-red); animation: pulse 1s infinite; }
            .standby { background: #444; }
            .traffic-line { height: 4px; background: #222; margin-top: 20px; border-radius: 2px; position: relative; overflow: hidden; }
            .is-active .traffic-line::after { content: ''; position: absolute; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, var(--neon-blue), transparent); animation: traffic 1.5s infinite; }
            @keyframes traffic { 0% { left: -100%; } 100% { left: 100%; } }
            @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
            .btn-crash { background: transparent; border: 1px solid var(--neon-red); color: var(--neon-red); padding: 15px 30px; border-radius: 8px; font-weight: bold; width: 100%; transition: 0.3s; }
            .btn-crash:hover:not(:disabled) { background: var(--neon-red); color: #fff; box-shadow: 0 0 20px var(--neon-red); }
            .btn-crash:disabled { border-color: #444; color: #444; cursor: not-allowed; opacity: 0.5; }
            .log-stream { background: #000; border: 1px solid #222; border-radius: 8px; height: 120px; padding: 15px; font-family: 'monospace'; font-size: 0.8rem; color: #666; overflow-y: auto; }
            .timer-display { color: var(--neon-red); font-size: 0.75rem; font-weight: bold; margin-top: 5px; display: block; }
        </style>
    </head>
    <body>
        <div class="header-bar">
            <h4 class="mb-0 fw-bold">self-healing <span class="text-secondary small ms-2">/ system</span></h4>
            <div id="global-status" class="text-success fw-bold">SYSTEM_OPERATIONAL</div>
        </div>

        <div class="node-grid">
            <div id="node-1" class="node-card"><div class="active-ring"></div><div class="d-flex justify-content-between mb-3"><span class="text-secondary small">NODE_01</span><span id="label-1" class="badge">READY</span></div><h5 class="text-truncate mb-2">${process.env.HOSTNAME || 'Replica-01'}</h5><div class="status-box"><span id="dot-1" class="status-indicator standby"></span><span id="text-1" class="fw-bold text-secondary">READY</span><span id="timer-1" class="timer-display" style="display:none">REBUILDING: 10s</span></div><div class="traffic-line"></div></div>
            <div id="node-2" class="node-card"><div class="active-ring"></div><div class="d-flex justify-content-between mb-3"><span class="text-secondary small">NODE_02</span><span id="label-2" class="badge">READY</span></div><h5 class="text-truncate mb-2">node-replica-02</h5><div class="status-box"><span id="dot-2" class="status-indicator standby"></span><span id="text-2" class="fw-bold text-secondary">READY</span><span id="timer-2" class="timer-display" style="display:none">REBUILDING: 10s</span></div><div class="traffic-line"></div></div>
            <div id="node-3" class="node-card"><div class="active-ring"></div><div class="d-flex justify-content-between mb-3"><span class="text-secondary small">NODE_03</span><span id="label-3" class="badge">READY</span></div><h5 class="text-truncate mb-2">node-replica-03</h5><div class="status-box"><span id="dot-3" class="status-indicator standby"></span><span id="text-3" class="fw-bold text-secondary">READY</span><span id="timer-3" class="timer-display" style="display:none">REBUILDING: 10s</span></div><div class="traffic-line"></div></div>
        </div>

        <div class="container-fluid px-5">
            <div class="row">
                <div class="col-md-8"><div class="log-stream" id="logs">> Monitoring Cluster Failover Loop...</div></div>
                <div class="col-md-4">
                    <button id="crashBtn" onclick="triggerCrash()" class="btn-crash">INJECT CRITICAL FAILURE</button>
                    <button onclick="localStorage.clear(); location.reload();" class="btn btn-dark mt-2 w-100 btn-sm">RESET ALL STATES</button>
                </div>
            </div>
        </div>

        <script>
            let activeNode = parseInt(localStorage.getItem('activeNode')) || 1;

            window.onload = function() {
                if (!${isHealthy} && activeNode === 1) {
                    localStorage.setItem('p1_failed', 'true');
                }
                syncUI();
            };

            function syncUI() {
                const p1_fail = localStorage.getItem('p1_failed') === 'true';
                const p2_fail = localStorage.getItem('p2_failed') === 'true';
                const p3_fail = localStorage.getItem('p3_failed') === 'true';

                // SMART FAILOVER LOOP: Find the first healthy node
                if (localStorage.getItem('p' + activeNode + '_failed') === 'true') {
                    if (!p1_fail) activeNode = 1;
                    else if (!p2_fail) activeNode = 2;
                    else if (!p3_fail) activeNode = 3;
                }
                
                localStorage.setItem('activeNode', activeNode);

                updateNode(1, p1_fail);
                updateNode(2, p2_fail);
                updateNode(3, p3_fail);

                const btn = document.getElementById('crashBtn');
                const anyHealthyBackup = (!p1_fail && activeNode !== 1) || (!p2_fail && activeNode !== 2) || (!p3_fail && activeNode !== 3);
                const currentIsFailing = localStorage.getItem('p' + activeNode + '_failed') === 'true';

                if (currentIsFailing || !anyHealthyBackup) {
                    btn.disabled = true;
                    btn.innerText = "WAITING FOR RECOVERY...";
                } else {
                    btn.disabled = false;
                    btn.innerText = "INJECT FAILURE TO NODE_0" + activeNode;
                }
            }

            function updateNode(id, isFailed) {
                const card = document.getElementById('node-' + id);
                const dot = document.getElementById('dot-' + id);
                const text = document.getElementById('text-' + id);
                const label = document.getElementById('label-' + id);
                const timer = document.getElementById('timer-' + id);

                card.classList.remove('is-active');

                if (isFailed) {
                    dot.className = 'status-indicator offline';
                    text.innerText = 'REBUILDING...';
                    text.className = 'fw-bold text-danger';
                    label.className = 'badge bg-danger';
                    label.innerText = 'FAILED';
                    if (timer.style.display === 'none') startTimer(id);
                } else if (activeNode === id) {
                    card.classList.add('is-active');
                    dot.className = 'status-indicator online';
                    text.innerText = 'ONLINE';
                    text.className = 'fw-bold text-success';
                    label.className = 'badge bg-primary';
                    label.innerText = 'PRIMARY';
                    timer.style.display = 'none';
                } else {
                    dot.className = 'status-indicator standby';
                    text.innerText = 'READY';
                    text.className = 'fw-bold text-secondary';
                    label.className = 'badge bg-dark border';
                    label.innerText = 'STANDBY';
                    timer.style.display = 'none';
                }
            }

            function startTimer(id) {
                const timerEl = document.getElementById('timer-' + id);
                timerEl.style.display = 'block';
                let time = 10;
                const interval = setInterval(() => {
                    time--;
                    timerEl.innerText = 'REBUILDING: ' + time + 's';
                    if (time <= 0) {
                        clearInterval(interval);
                        localStorage.removeItem('p' + id + '_failed');
                        timerEl.style.display = 'none';
                        document.getElementById('logs').innerHTML += '<br>> [SYSTEM] Node ' + id + ' restored to READY state.';
                        syncUI();
                    }
                }, 1000);
            }

            function triggerCrash() {
                localStorage.setItem('p' + activeNode + '_failed', 'true');
                if (activeNode === 1) fetch('/fail').then(() => syncUI());
                else syncUI();
            }
        </script>
    </body>
    </html>
    `);
});

// Liveness Probe Endpoint
app.get('/healthz', (req, res) => {
    if (isHealthy) res.status(200).send('OK');
    else res.status(500).send('Unhealthy');
});

// Route to trigger a failure
app.get('/fail', (req, res) => {
    isHealthy = false;
    res.send("<h1>Status set to Unhealthy.</h1><p>Kubernetes will restart this pod in ~10 seconds.</p><a href='/'>Back</a>");
});

// Route to kill the process entirely
app.post('/crash', (req, res) => {
    process.exit(1);
});

app.listen(PORT, '0.0.0.0', () => console.log(`Ship is sailing on port ${PORT}`));