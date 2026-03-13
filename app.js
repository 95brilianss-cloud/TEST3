// ============================================
// TURBINE LOGSHEET PRO - v1.2.0
// Mobile Optimized JavaScript
// ============================================

const APP_VERSION = '1.1.0';
const GAS_URL = "https://script.google.com/macros/s/AKfycbz30vHFmRl3MVX-kt8XiUxowhqX1rx0fTYCiGQoKo3e_w5DdblfyP6kU-UKbjMSx3_R/exec";

// ============================================
// CONFIGURATION
// ============================================

const INPUT_TYPES = {
    PUMP_STATUS: {
        patterns: ['(A/B)', '(ON/OFF)', '(On/Off)', '(Running/Stop)', '(Remote/Running/Stop)'],
        options: {
            '(A/B)': ['A', 'B'],
            '(ON/OFF)': ['ON', 'OFF'],
            '(On/Off)': ['On', 'Off'],
            '(Running/Stop)': ['Running', 'Stop'],
            '(Remote/Running/Stop)': ['Remote', 'Running', 'Stop']
        }
    }
};

const AREAS = {
    "Steam Inlet Turbine": [
        "MPS Inlet 30-TP-6101 PI-6114 (kg/cm2)", 
        "MPS Inlet 30-TP-6101 TI-6153 (°C)", 
        "MPS Inlet 30-TP-6101 PI-6116 (kg/cm2)", 
        "LPS Extrac 30-TP-6101 PI-6123 (kg/cm2)", 
        "Gland Steam TI-6156 (°C)", 
        "MPS Inlet 30-TP-6101 PI-6108 (Kg/cm2)", 
        "Exhaust Steam PI-6111 (kg/cm2)", 
        "Gland Steam PI-6118 (Kg/cm2)"
    ],
    "Low Pressure Steam": [
        "LPS from U-6101 PI-6104 (kg/cm2)", 
        "LPS from U-6101 TI-6102 (°C)", 
        "LPS Header PI-6106 (Kg/cm2)", 
        "LPS Header TI-6107 (°C)"
    ],
    "Lube Oil": [
        "Lube Oil 30-TK-6102 LI-6104 (%)", 
        "Lube Oil 30-TK-6102 TI-6125 (°C)", 
        "Lube Oil 30-C-6101 (On/Off)", 
        "Lube Oil 30-EH-6102 (On/Off)", 
        "Lube Oil Cartridge FI-6143 (%)", 
        "Lube Oil Cartridge PI-6148 (mmH2O)", 
        "Lube Oil Cartridge PI-6149 (mmH2O)", 
        "Lube Oil PI-6145 (kg/cm2)", 
        "Lube Oil E-6104 (A/B)", 
        "Lube Oil TI-6127 (°C)", 
        "Lube Oil FIL-6101 (A/B)", 
        "Lube Oil PDI-6146 (Kg/cm2)", 
        "Lube Oil PI-6143 (Kg/cm2)", 
        "Lube Oil TI-6144 (°C)", 
        "Lube Oil TI-6146 (°C)", 
        "Lube Oil TI-6145 (°C)", 
        "Lube Oil FG-6144 (%)", 
        "Lube Oil FG-6146 (%)", 
        "Lube Oil TI-6121 (°C)", 
        "Lube Oil TI-6116 (°C)", 
        "Lube Oil FG-6121 (%)", 
        "Lube Oil FG-6116 (%)"
    ],
    "Control Oil": [
        "Control Oil 30-TK-6103 LI-6106 (%)", 
        "Control Oil 30-TK-6103 TI-6128 (°C)", 
        "Control Oil P-6106 (A/B)", 
        "Control Oil FIL-6103 (A/B)", 
        "Control Oil PI-6152 (Bar)"
    ],
    "Shaft Line": [
        "Jacking Oil 30-P-6105 PI-6158 (Bar)", 
        "Jacking Oil 30-P-6105 PI-6161 (Bar)", 
        "Electrical Turning Gear U-6103 (Remote/Running/Stop)", 
        "EH-6101 (ON/OFF)"
    ],
    "Condenser 30-E-6102": [
        "LG-6102 (%)", 
        "30-P-6101 (A/B)", 
        "30-P-6101 Suction (kg/cm2)", 
        "30-P-6101 Discharge (kg/cm2)", 
        "30-P-6101 Load (Ampere)"
    ],
    "Ejector": [
        "J-6101 PI-6126 A (Kg/cm2)", 
        "J-6101 PI-6127 B (Kg/cm2)", 
        "J-6102 PI-6128 A (Kg/cm2)", 
        "J-6102 PI-6129 B (Kg/cm2)", 
        "J-6104 PI-6131 (Kg/cm2)", 
        "J-6104 PI-6138 (Kg/cm2)", 
        "PI-6172 (kg/cm2)", 
        "LPS Extrac 30-TP-6101 TI-6155 (°C)", 
        "from U-6102 TI-6104 (°C)"
    ],
    "Generator Cooling Water": [
        "Air Cooler PI-6124 A (Kg/cm2)", 
        "Air Cooler PI-6124 B (Kg/cm2)", 
        "Air Cooler TI-6113 A (°C)", 
        "Air Cooler TI-6113 B (°C)", 
        "Air Cooler PI-6125 A (Kg/cm2)", 
        "Air Cooler PI-6125 B (Kg/cm2)", 
        "Air Cooler TI-6114 A (°C)", 
        "Air Cooler TI-6114 B (°C)"
    ],
    "Condenser Cooling Water": [
        "Condenser PI-6135 A (Kg/cm2)", 
        "Condenser PI-6135 B (Kg/cm2)", 
        "Condenser TI-6118 A (°C)", 
        "Condenser TI-6118 B (°C)", 
        "Condenser PI-6136 A (Kg/cm2)", 
        "Condenser PI-6136 B (Kg/cm2)", 
        "Condenser TI-6119 A (°C)", 
        "Condenser TI-6119 B (°C)"
    ],
    "BFW System": [
        "Condensate Tank TK-6201 (%)", 
        "Condensate Tank TI-6216 (°C)", 
        "P-6202 (A/B)", 
        "P-6202 Suction (kg/cm2)", 
        "P-6202 Discharge (kg/cm2)", 
        "P-6202 Load (Ampere)", 
        "Deaerator LI-6202 (%)", 
        "Deaerator TI-6201 (°C)", 
        "30-P-6201 (A/B)", 
        "30-P-6201 Suction (kg/cm2)", 
        "30-P-6201 Discharge (kg/cm2)", 
        "30-P-6201 Load (Ampere)", 
        "30-C-6202 A (ON/OFF)", 
        "30-C-6202 A (Ampere)", 
        "30-C-6202 B (ON/OFF)", 
        "30-C-6202 B (Ampere)", 
        "30-C-6202 PCV-6216 (%)", 
        "30-C-6202 PI-6107 (kg/cm2)", 
        "Condensate Drum 30-D-6201 LI-6209 (%)", 
        "Condensate Drum 30-D-6201 PI-6218 (kg/cm2)", 
        "Condensate Drum 30-D-6201 TI-6215 (°C)"
    ],
    "Chemical Dosing": [
        "30-TK-6205 LI-6204 (%)", 
        "30-TK-6205 30-P-6205 (A/B)", 
        "30-TK-6205 Disch (kg/cm2)", 
        "30-TK-6205 Stroke (%)", 
        "30-TK-6206 LI-6206 (%)", 
        "30-TK-6206 30-P-6206 (A/B)", 
        "30-TK-6206 Disch (kg/cm2)", 
        "30-TK-6206 Stroke (%)", 
        "30-TK-6207 LI-6208 (%)", 
        "30-TK-6207 30-P-6207 (A/B)", 
        "30-TK-6207 Disch (kg/cm2)", 
        "30-TK-6207 Stroke (%)"
    ]
};

// ============================================
// STATE
// ============================================

let currentUser = localStorage.getItem('current_operator') || '';
let lastData = {};
let currentInput = JSON.parse(localStorage.getItem('draft_turbine')) || {};
let activeArea = "";
let activeIdx = 0;
let totalParams = 0;
let currentInputType = 'text';
let autoCloseTimer = null;

// TPM State
let activeTPMArea = '';
let currentTPMPhoto = null;
let currentTPMStatus = '';

// ============================================
// INITIALIZATION
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    totalParams = Object.values(AREAS).reduce((acc, arr) => acc + arr.length, 0);
    
    // Update version
    const versionDisplay = document.getElementById('versionDisplay');
    if (versionDisplay) versionDisplay.textContent = APP_VERSION;
    
    // Check login
    if (currentUser) {
        updateUserDisplay();
        simulateLoading(() => {
            showScreen('homeScreen');
            updateHomeStats();
        });
    } else {
        showScreen('loginScreen');
        hideLoader();
    }
    
    // Setup keyboard handlers
    setupKeyboardHandlers();
});

// ============================================
// LOADER
// ============================================

function simulateLoading(callback) {
    const loader = document.getElementById('loader');
    const progress = document.getElementById('loaderProgress');
    
    if (loader) loader.style.display = 'flex';
    
    let p = 0;
    const interval = setInterval(() => {
        p += Math.random() * 30;
        if (p >= 100) {
            p = 100;
            clearInterval(interval);
            if (progress) progress.style.width = '100%';
            setTimeout(() => {
                hideLoader();
                if (callback) callback();
            }, 400);
        } else {
            if (progress) progress.style.width = p + '%';
        }
    }, 150);
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 300);
    }
}

// ============================================
// LOGIN SYSTEM
// ============================================

function loginOperator() {
    const input = document.getElementById('operatorName');
    const error = document.getElementById('loginError');
    const name = input?.value.trim();
    
    if (!name) {
        if (error) error.style.display = 'block';
        input?.classList.add('error');
        setTimeout(() => input?.classList.remove('error'), 2000);
        return;
    }
    
    currentUser = name;
    localStorage.setItem('current_operator', name);
    updateUserDisplay();
    
    simulateLoading(() => {
        showScreen('homeScreen');
        updateHomeStats();
    });
}

function logoutOperator() {
    if (confirm('Yakin ingin keluar?')) {
        localStorage.removeItem('current_operator');
        localStorage.removeItem('draft_turbine');
        currentUser = '';
        currentInput = {};
        location.reload();
    }
}

function updateUserDisplay() {
    const ids = ['displayUserName', 'tpmHeaderUser', 'tpmInputUser', 'areaListUser', 'paramUser'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = currentUser;
    });
}

// ============================================
// NAVIGATION
// ============================================

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.style.animation = 'none';
    });
    
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
        // Trigger reflow
        void target.offsetWidth;
        target.style.animation = '';
    }
}

function navigateTo(screenId) {
    showScreen(screenId);
    
    if (screenId === 'areaListScreen') {
        fetchLastData();
    }
}

// ============================================
// ALERTS
// ============================================

function showCustomAlert(msg, type = 'success') {
    const alert = document.getElementById('customAlert');
    const content = document.getElementById('alertContent');
    const title = document.getElementById('alertTitle');
    const message = document.getElementById('alertMessage');
    const iconWrapper = document.getElementById('alertIconWrapper');
    
    if (!alert) return;
    
    if (autoCloseTimer) clearTimeout(autoCloseTimer);
    
    if (title) title.textContent = type === 'success' ? 'Berhasil' : 'Error';
    if (message) message.textContent = msg;
    
    if (content) {
        content.className = 'alert-content ' + type;
    }
    
    // Update icon
    if (iconWrapper) {
        const color = type === 'success' ? 'var(--success)' : 'var(--danger)';
        iconWrapper.innerHTML = `
            <div class="alert-icon-bg" style="background: ${color}; opacity: 0.2;"></div>
            <svg class="alert-icon-svg" viewBox="0 0 52 52" style="stroke: ${color};">
                <circle cx="26" cy="26" r="25"/>
                ${type === 'success' 
                    ? '<path d="M14.1 27.2l7.1 7.2 16.7-16.8"/>' 
                    : '<path d="M16 16 L36 36 M36 16 L16 36"/>'}
            </svg>
        `;
    }
    
    alert.classList.remove('hidden');
    
    if (type === 'success') {
        autoCloseTimer = setTimeout(closeAlert, 2500);
    }
}

function closeAlert() {
    const alert = document.getElementById('customAlert');
    if (alert) alert.classList.add('hidden');
}

function showUpdateAlert() {
    const alert = document.getElementById('updateAlert');
    if (alert) alert.classList.remove('hidden');
}

function applyUpdate() {
    location.reload();
}

// ============================================
// HOME STATS
// ============================================

function updateHomeStats() {
    const totalAreas = Object.keys(AREAS).length;
    let completed = 0;
    
    Object.entries(AREAS).forEach(([areaName, params]) => {
        const filled = currentInput[areaName] ? Object.keys(currentInput[areaName]).length : 0;
        if (filled === params.length) completed++;
    });
    
    const percent = Math.round((completed / totalAreas) * 100);
    
    const statProgress = document.getElementById('statProgress');
    const statAreas = document.getElementById('statAreas');
    
    if (statProgress) statProgress.textContent = percent + '%';
    if (statAreas) statAreas.textContent = `${completed}/${totalAreas}`;
}

// ============================================
// LOGSHEET - AREA LIST
// ============================================

function fetchLastData() {
    renderAreaList();
    
    // Try to fetch from server
    const callbackName = 'cb_' + Date.now();
    const script = document.createElement('script');
    
    window[callbackName] = (data) => {
        lastData = data;
        renderAreaList();
        delete window[callbackName];
        script.remove();
    };
    
    script.src = `${GAS_URL}?callback=${callbackName}`;
    script.onerror = () => script.remove();
    
    setTimeout(() => {
        if (script.parentNode) script.remove();
    }, 5000);
    
    document.body.appendChild(script);
}

function renderAreaList() {
    const container = document.getElementById('areaList');
    if (!container) return;
    
    const totalAreas = Object.keys(AREAS).length;
    let completed = 0;
    let html = '';
    
    Object.entries(AREAS).forEach(([areaName, params]) => {
        const filled = currentInput[areaName] ? Object.keys(currentInput[areaName]).length : 0;
        const total = params.length;
        const percent = Math.round((filled / total) * 100);
        const isDone = filled === total;
        if (isDone) completed++;
        
        const circumference = 2 * Math.PI * 16;
        const offset = circumference - (percent / 100) * circumference;
        
        html += `
            <div class="area-item" onclick="openArea('${areaName}')" style="border-left-color: ${isDone ? 'var(--success)' : percent > 0 ? 'var(--warning)' : 'transparent'};">
                <div class="area-icon" style="background: ${isDone ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-secondary)'}; color: ${isDone ? 'var(--success)' : 'var(--primary)'};">
                    <svg width="20" height="20" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3"/>
                        <circle cx="20" cy="20" r="16" fill="none" stroke="${isDone ? 'var(--success)' : 'var(--primary)'}" 
                                stroke-width="3" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" 
                                transform="rotate(-90 20 20)" stroke-linecap="round"/>
                        <text x="20" y="24" text-anchor="middle" font-size="10" font-weight="bold" fill="${isDone ? 'var(--success)' : 'var(--text)'}">${filled}</text>
                    </svg>
                </div>
                <div class="area-info">
                    <div class="area-name">${areaName}</div>
                    <div class="area-meta">${filled} dari ${total} parameter</div>
                </div>
                <svg class="item-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6"/>
                </svg>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Update progress
    const percent = Math.round((completed / totalAreas) * 100);
    const progressText = document.getElementById('progressText');
    const overallPercent = document.getElementById('overallPercent');
    const progressBar = document.getElementById('overallProgressBar');
    const submitBtn = document.getElementById('submitBtn');
    
    if (progressText) progressText.textContent = `${percent}% Complete`;
    if (overallPercent) overallPercent.textContent = `${percent}%`;
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (submitBtn) submitBtn.style.display = Object.keys(currentInput).length > 0 ? 'flex' : 'none';
}

function openArea(areaName) {
    activeArea = areaName;
    activeIdx = 0;
    showScreen('paramScreen');
    
    const areaNameEl = document.getElementById('currentAreaName');
    if (areaNameEl) areaNameEl.textContent = areaName;
    
    renderParamDots();
    showStep();
}

// ============================================
// PARAMETER INPUT
// ============================================

function renderParamDots() {
    const container = document.getElementById('progressDots');
    if (!container) return;
    
    const total = AREAS[activeArea].length;
    let html = '';
    
    for (let i = 0; i < total; i++) {
        const isFilled = currentInput[activeArea]?.[AREAS[activeArea][i]];
        const isActive = i === activeIdx;
        let cls = 'dot';
        if (isActive) cls += ' active';
        else if (isFilled) cls += ' filled';
        
        html += `<div class="${cls}" onclick="jumpToStep(${i})"></div>`;
    }
    
    container.innerHTML = html;
}

function jumpToStep(index) {
    saveCurrentValue();
    activeIdx = index;
    showStep();
    renderParamDots();
}

function saveCurrentValue() {
    const input = document.getElementById('valInput');
    if (!input) return;
    
    const val = input.value.trim();
    const label = AREAS[activeArea][activeIdx];
    
    if (val) {
        if (!currentInput[activeArea]) currentInput[activeArea] = {};
        currentInput[activeArea][label] = val;
        localStorage.setItem('draft_turbine', JSON.stringify(currentInput));
    }
}

function showStep() {
    const label = AREAS[activeArea][activeIdx];
    const total = AREAS[activeArea].length;
    const inputType = detectInputType(label);
    currentInputType = inputType.type;
    
    // Update UI
    const stepInfo = document.getElementById('stepInfo');
    const areaProgress = document.getElementById('areaProgress');
    const labelInput = document.getElementById('labelInput');
    const lastTime = document.getElementById('lastTimeLabel');
    const prevVal = document.getElementById('prevValDisplay');
    const unitDisplay = document.getElementById('unitDisplay');
    const container = document.getElementById('inputFieldContainer');
    
    if (stepInfo) stepInfo.textContent = `${activeIdx + 1}/${total}`;
    if (areaProgress) areaProgress.textContent = `${activeIdx + 1}/${total}`;
    if (labelInput) labelInput.textContent = getParamName(label);
    if (lastTime) lastTime.textContent = lastData._lastTime || '--:--';
    if (prevVal) prevVal.textContent = lastData[label] || '--';
    
    // Render input
    const currentVal = currentInput[activeArea]?.[label] || '';
    
    if (inputType.type === 'select') {
        let options = `<option value="" disabled ${!currentVal ? 'selected' : ''}>Pilih...</option>`;
        inputType.options.forEach(opt => {
            options += `<option value="${opt}" ${currentVal === opt ? 'selected' : ''}>${opt}</option>`;
        });
        
        if (container) {
            container.innerHTML = `<select id="valInput" style="width: 100%; background: transparent; border: none; color: var(--text); font-size: 1.125rem; font-weight: 600; outline: none;">${options}</select>`;
        }
        if (unitDisplay) unitDisplay.style.display = 'none';
    } else {
        if (container) {
            container.innerHTML = `<input type="text" id="valInput" inputmode="decimal" placeholder="0.00" value="${currentVal}" autocomplete="off" style="width: 100%; background: transparent; border: none; color: var(--text); font-size: 1.25rem; font-weight: 600; outline: none;">`;
        }
        if (unitDisplay) {
            unitDisplay.textContent = getUnit(label) || '--';
            unitDisplay.style.display = 'flex';
        }
    }
    
    renderParamDots();
    
    // Focus
    setTimeout(() => {
        const input = document.getElementById('valInput');
        if (input && inputType.type === 'text') {
            input.focus();
            input.select();
        }
    }, 100);
}

function saveStep() {
    saveCurrentValue();
    
    if (activeIdx < AREAS[activeArea].length - 1) {
        activeIdx++;
        showStep();
    } else {
        showCustomAlert('Area selesai!', 'success');
        setTimeout(() => navigateTo('areaListScreen'), 1000);
    }
}

function goBack() {
    if (activeIdx > 0) {
        activeIdx--;
        showStep();
    } else {
        navigateTo('areaListScreen');
    }
}

// ============================================
// TPM FUNCTIONS
// ============================================

function openTPMArea(areaName) {
    activeTPMArea = areaName;
    currentTPMPhoto = null;
    currentTPMStatus = '';
    
    // Reset form
    const preview = document.getElementById('tpmPhotoPreview');
    const section = document.getElementById('tpmPhotoSection');
    const notes = document.getElementById('tpmNotes');
    const action = document.getElementById('tpmAction');
    
    if (preview) {
        preview.innerHTML = `
            <div class="photo-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                </svg>
                <span>Ambil Foto</span>
            </div>
        `;
    }
    if (section) section.classList.remove('has-photo');
    if (notes) notes.value = '';
    if (action) action.value = '';
    
    // Reset buttons
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.className = 'status-btn';
    });
    
    const title = document.getElementById('tpmInputTitle');
    if (title) title.textContent = areaName;
    
    navigateTo('tpmInputScreen');
}

function handleTPMPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
        showCustomAlert('Maksimal 5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        currentTPMPhoto = e.target.result;
        const preview = document.getElementById('tpmPhotoPreview');
        const section = document.getElementById('tpmPhotoSection');
        
        if (preview) {
            preview.innerHTML = `<img src="${currentTPMPhoto}" alt="Preview">`;
        }
        if (section) section.classList.add('has-photo');
    };
    reader.readAsDataURL(file);
}

function selectTPMStatus(status) {
    currentTPMStatus = status;
    
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.className = 'status-btn';
    });
    
    const btn = document.getElementById('btn' + status.charAt(0).toUpperCase() + status.slice(1));
    if (btn) {
        btn.classList.add('active', `active-${status}`);
    }
}

async function submitTPMData() {
    const notes = document.getElementById('tpmNotes')?.value || '';
    const action = document.getElementById('tpmAction')?.value || '';
    
    if (!currentTPMStatus) {
        showCustomAlert('Pilih status!', 'error');
        return;
    }
    if (!currentTPMPhoto) {
        showCustomAlert('Ambil foto!', 'error');
        return;
    }
    if (!action) {
        showCustomAlert('Pilih tindakan!', 'error');
        return;
    }
    
    const data = {
        type: 'TPM',
        area: activeTPMArea,
        status: currentTPMStatus,
        notes,
        action,
        photo: currentTPMPhoto,
        user: currentUser,
        timestamp: new Date().toISOString()
    };
    
    showCustomAlert('Data TPM tersimpan!', 'success');
    
    setTimeout(() => {
        navigateTo('tpmScreen');
    }, 1500);
}

// ============================================
// SEND DATA
// ============================================

async function sendToSheet() {
    const btn = document.getElementById('submitBtn');
    if (btn) btn.disabled = true;
    
    const data = {
        Operator: currentUser,
        Timestamp: new Date().toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'})
    };
    
    Object.values(currentInput).forEach(area => {
        Object.assign(data, area);
    });
    
    try {
        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        
        showCustomAlert('Data terkirim!', 'success');
        currentInput = {};
        localStorage.removeItem('draft_turbine');
        
        setTimeout(() => navigateTo('homeScreen'), 1500);
    } catch (e) {
        showCustomAlert('Gagal mengirim', 'error');
    } finally {
        if (btn) btn.disabled = false;
    }
}

// ============================================
// UTILITIES
// ============================================

function detectInputType(label) {
    for (const [type, config] of Object.entries(INPUT_TYPES)) {
        for (const pattern of config.patterns) {
            if (label.includes(pattern)) {
                return {
                    type: 'select',
                    options: config.options[pattern]
                };
            }
        }
    }
    return {type: 'text', options: null};
}

function getUnit(label) {
    const match = label.match(/\(([^)]+)\)/);
    return match ? match[1] : '';
}

function getParamName(label) {
    return label.split(' (')[0];
}

function setupKeyboardHandlers() {
    document.addEventListener('keydown', (e) => {
        // Login
        if (e.key === 'Enter' && document.getElementById('loginScreen')?.classList.contains('active')) {
            loginOperator();
            return;
        }
        
        // Param screen
        if (!document.getElementById('paramScreen')?.classList.contains('active')) return;
        
        if (e.key === 'Enter' && currentInputType !== 'select') {
            e.preventDefault();
            saveStep();
        } else if (e.key === 'Escape') {
            goBack();
        }
    });
}
