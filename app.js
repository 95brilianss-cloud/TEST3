// ============================================
// TURBINE LOGSHEET PRO - v1.1.2 (FIXED)
// ============================================

const APP_VERSION = '1.0.9';
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
// STATE VARIABLES
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
// SERVICE WORKER
// ============================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register(`./sw.js?v=${APP_VERSION}`)
            .then(registration => {
                console.log('SW registered:', registration);
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showUpdateAlert();
                        }
                    });
                });
            })
            .catch(err => console.log('SW registration failed:', err));
            
        navigator.serviceWorker.addEventListener('message', event => {
            if (event.data?.type === 'VERSION_CHECK' && event.data.version !== APP_VERSION) {
                showUpdateAlert();
            }
        });
    });
}

// ============================================
// INITIALIZATION
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    totalParams = Object.values(AREAS).reduce((acc, arr) => acc + arr.length, 0);
    
    // Update version display
    const versionDisplay = document.getElementById('versionDisplay');
    if (versionDisplay) versionDisplay.textContent = APP_VERSION;
    
    // Check login status
    if (currentUser) {
        updateUserDisplay();
        simulateLoading(() => {
            showScreen('homeScreen');
        });
    } else {
        showScreen('loginScreen');
        // Hide loader immediately for login screen
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
    }
});

// ============================================
// LOGIN SYSTEM
// ============================================

function loginOperator() {
    const input = document.getElementById('operatorName');
    const errorMsg = document.getElementById('loginError');
    const name = input.value.trim();
    
    if (!name) {
        errorMsg.style.display = 'block';
        input.style.borderColor = '#ef4444';
        setTimeout(() => {
            input.style.borderColor = 'var(--border-color)';
        }, 2000);
        return;
    }
    
    // Save user
    currentUser = name;
    localStorage.setItem('current_operator', name);
    
    // Update UI
    updateUserDisplay();
    
    // Go to home with loading
    simulateLoading(() => {
        showScreen('homeScreen');
    });
    
    // Clear input for security
    input.value = '';
}

function logoutOperator() {
    if (confirm('Yakin ingin keluar dan ganti operator?')) {
        localStorage.removeItem('current_operator');
        localStorage.removeItem('draft_turbine');
        currentUser = '';
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
// NAVIGATION & SCREEN MANAGEMENT
// ============================================

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.style.animation = 'none';
        setTimeout(() => s.style.animation = '', 10);
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        if (screenId === 'areaListScreen') {
            fetchLastData();
            updateOverallProgress();
        }
    }
}

function navigateTo(screenId) {
    showScreen(screenId);
}

// ============================================
// LOADER & PROGRESS
// ============================================

function simulateLoading(callback) {
    const loader = document.getElementById('loader');
    const loaderProgress = document.getElementById('loaderProgress');
    const loaderText = document.getElementById('loaderText');
    
    if (loader) loader.style.display = 'flex';
    if (loaderText) loaderText.textContent = 'Loading...';
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 25;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            if (loaderProgress) loaderProgress.style.width = '100%';
            
            setTimeout(() => {
                if (loader) loader.style.display = 'none';
                if (callback) callback();
            }, 500);
        } else {
            if (loaderProgress) loaderProgress.style.width = progress + '%';
        }
    }, 200);
}

// ============================================
// ALERT SYSTEM
// ============================================

function showUpdateAlert() {
    const updateAlert = document.getElementById('updateAlert');
    if (updateAlert) updateAlert.classList.remove('hidden');
}

function applyUpdate() {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
}

function showCustomAlert(msg, type = 'success') {
    const alertContent = document.getElementById('alertContent');
    const alertTitle = document.getElementById('alertTitle');
    const alertIconWrapper = document.getElementById('alertIconWrapper');
    const customAlert = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');
    
    if (!customAlert || !alertContent || !alertTitle || !alertIconWrapper) {
        console.error('Alert elements not found');
        alert(msg);
        return;
    }
    
    if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        autoCloseTimer = null;
    }
    
    alertTitle.textContent = type === 'success' ? 'Berhasil' : 'Error';
    if (alertMessage) alertMessage.textContent = msg;
    
    alertContent.className = 'alert-content ' + type;
    
    if (type === 'success') {
        alertIconWrapper.innerHTML = `
            <div class="alert-icon-bg"></div>
            <svg class="alert-icon-svg" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="25"></circle>
                <path d="M14.1 27.2l7.1 7.2 16.7-16.8"></path>
            </svg>
        `;
    } else {
        alertIconWrapper.innerHTML = `
            <div class="alert-icon-bg" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);"></div>
            <svg class="alert-icon-svg" viewBox="0 0 52 52" style="stroke: #ef4444;">
                <circle cx="26" cy="26" r="25"></circle>
                <path d="M16 16 L36 36 M36 16 L16 36"></path>
            </svg>
        `;
    }
    
    customAlert.classList.remove('hidden');
    
    if (type === 'success') {
        autoCloseTimer = setTimeout(() => {
            if (!customAlert.classList.contains('hidden')) closeAlert();
        }, 3000);
    }
}

function closeAlert() {
    const customAlert = document.getElementById('customAlert');
    if (customAlert) customAlert.classList.add('hidden');
    if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        autoCloseTimer = null;
    }
}

// ============================================
// LOGSHEET FUNCTIONS
// ============================================

function fetchLastData() {
    updateStatusIndicator(false);
    const timeout = setTimeout(() => renderMenu(), 8000);
    const callbackName = 'jsonp_' + Date.now();
    const script = document.createElement('script');
    
    window[callbackName] = (data) => {
        clearTimeout(timeout);
        lastData = data;
        updateStatusIndicator(true);
        delete window[callbackName];
        script.remove();
        renderMenu();
    };
    
    script.src = `${GAS_URL}?callback=${callbackName}`;
    script.onerror = () => {
        clearTimeout(timeout);
        renderMenu();
    };
    document.body.appendChild(script);
}

function updateStatusIndicator(isOnline) {
    // Status indicator removed from HTML, skip this function
    // Keep for compatibility
}

function renderMenu() {
    const list = document.getElementById('areaList');
    if (!list) return;
    
    const totalAreas = Object.keys(AREAS).length;
    let completedAreas = 0;
    let html = '';
    
    Object.entries(AREAS).forEach(([areaName, params]) => {
        const filled = currentInput[areaName] ? Object.keys(currentInput[areaName]).length : 0;
        const total = params.length;
        const percent = Math.round((filled / total) * 100);
        const isCompleted = filled === total && total > 0;
        if (isCompleted) completedAreas++;
        
        const circumference = 2 * Math.PI * 18;
        const strokeDashoffset = circumference - (percent / 100) * circumference;
        
        html += `
            <div class="area-item ${isCompleted ? 'completed' : ''}" onclick="openArea('${areaName}')" style="display: flex; align-items: center; padding: 16px; background: var(--card-bg); border-radius: 12px; margin-bottom: 12px; cursor: pointer; border: 1px solid var(--border-color); border-left: 3px solid ${isCompleted ? '#10b981' : percent > 0 ? '#f59e0b' : 'transparent'};">
                <div style="margin-right: 16px;">
                    <svg width="40" height="40" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3"/>
                        <circle cx="20" cy="20" r="18" fill="none" stroke="${isCompleted ? '#10b981' : 'var(--primary)'}" 
                                stroke-width="3" stroke-linecap="round" stroke-dasharray="${circumference}" 
                                stroke-dashoffset="${strokeDashoffset}" transform="rotate(-90 20 20)"/>
                        <text x="20" y="24" text-anchor="middle" font-size="10" font-weight="bold" fill="${isCompleted ? '#10b981' : 'var(--text-primary)'}">${filled}</text>
                    </svg>
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${areaName}</div>
                    <div style="font-size: 0.875rem; color: var(--text-muted);">${filled} dari ${total} parameter diisi</div>
                </div>
                <div style="color: ${isCompleted ? '#10b981' : 'var(--text-muted)'}; font-size: 1.2rem;">${isCompleted ? '✓' : '›'}</div>
            </div>
        `;
    });
    
    list.innerHTML = html;
    
    const hasData = Object.keys(currentInput).length > 0;
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.style.display = hasData ? 'flex' : 'none';
    
    updateOverallProgressUI(completedAreas, totalAreas);
}

function updateOverallProgress() {
    const totalAreas = Object.keys(AREAS).length;
    let completedAreas = 0;
    Object.entries(AREAS).forEach(([areaName, params]) => {
        const filled = currentInput[areaName] ? Object.keys(currentInput[areaName]).length : 0;
        if (filled === params.length && filled > 0) completedAreas++;
    });
    updateOverallProgressUI(completedAreas, totalAreas);
}

function updateOverallProgressUI(completedAreas, totalAreas) {
    const percent = Math.round((completedAreas / totalAreas) * 100);
    const progressText = document.getElementById('progressText');
    const overallPercent = document.getElementById('overallPercent');
    const overallProgressBar = document.getElementById('overallProgressBar');
    
    if (progressText) progressText.textContent = `${percent}% Complete`;
    if (overallPercent) overallPercent.textContent = `${percent}%`;
    if (overallProgressBar) overallProgressBar.style.width = `${percent}%`;
}

function openArea(areaName) {
    activeArea = areaName;
    activeIdx = 0;
    navigateTo('paramScreen');
    const currentAreaName = document.getElementById('currentAreaName');
    if (currentAreaName) currentAreaName.textContent = areaName;
    renderProgressDots();
    showStep();
}

function renderProgressDots() {
    const container = document.getElementById('progressDots');
    if (!container) return;
    const total = AREAS[activeArea].length;
    let html = '';
    for (let i = 0; i < total; i++) {
        const isFilled = currentInput[activeArea] && currentInput[activeArea][AREAS[activeArea][i]];
        const isActive = i === activeIdx;
        let style = 'width: 10px; height: 10px; border-radius: 50%; cursor: pointer; transition: all 0.3s;';
        if (isActive) {
            style += 'background: var(--primary); transform: scale(1.3);';
        } else if (isFilled) {
            style += 'background: #10b981;';
        } else {
            style += 'background: var(--surface);';
        }
        html += `<div style="${style}" onclick="jumpToStep(${i})"></div>`;
    }
    container.innerHTML = html;
}

function jumpToStep(index) {
    const input = document.getElementById('valInput');
    if (input && input.value.trim()) {
        const fullLabel = AREAS[activeArea][activeIdx];
        if (!currentInput[activeArea]) currentInput[activeArea] = {};
        currentInput[activeArea][fullLabel] = input.value.trim();
        localStorage.setItem('draft_turbine', JSON.stringify(currentInput));
    }
    activeIdx = index;
    showStep();
    renderProgressDots();
}

function detectInputType(label) {
    for (const [type, config] of Object.entries(INPUT_TYPES)) {
        for (const pattern of config.patterns) {
            if (label.includes(pattern)) {
                return {
                    type: 'select',
                    options: config.options[pattern],
                    pattern: pattern
                };
            }
        }
    }
    return { type: 'text', options: null, pattern: null };
}

function getUnit(label) {
    const match = label.match(/\(([^)]+)\)/);
    return match ? match[1] : "";
}

function getParamName(label) {
    return label.split(' (')[0];
}

function showStep() {
    const fullLabel = AREAS[activeArea][activeIdx];
    const total = AREAS[activeArea].length;
    const inputType = detectInputType(fullLabel);
    currentInputType = inputType.type;
    
    const stepInfo = document.getElementById('stepInfo');
    const areaProgress = document.getElementById('areaProgress');
    const labelInput = document.getElementById('labelInput');
    const lastTimeLabel = document.getElementById('lastTimeLabel');
    const prevValDisplay = document.getElementById('prevValDisplay');
    const inputFieldContainer = document.getElementById('inputFieldContainer');
    const unitDisplay = document.getElementById('unitDisplay');
    const mainInputWrapper = document.getElementById('mainInputWrapper');
    
    if (stepInfo) stepInfo.textContent = `Step ${activeIdx + 1}/${total}`;
    if (areaProgress) areaProgress.textContent = `${activeIdx + 1}/${total}`;
    if (labelInput) labelInput.textContent = getParamName(fullLabel);
    if (lastTimeLabel) lastTimeLabel.textContent = lastData._lastTime || '--:--';
    if (prevValDisplay) prevValDisplay.textContent = lastData[fullLabel] || '--';
    
    const currentValue = (currentInput[activeArea] && currentInput[activeArea][fullLabel]) || '';
    
    if (inputType.type === 'select') {
        let optionsHtml = `<option value="" disabled ${!currentValue ? 'selected' : ''}>Pilih Status...</option>`;
        inputType.options.forEach(opt => {
            const selected = currentValue === opt ? 'selected' : '';
            optionsHtml += `<option value="${opt}" ${selected}>${opt}</option>`;
        });
        
        if (inputFieldContainer) {
            inputFieldContainer.innerHTML = `
                <select id="valInput" style="width: 100%; background: transparent; border: none; color: var(--text-primary); font-size: 1.1rem; outline: none; cursor: pointer;">
                    ${optionsHtml}
                </select>
            `;
        }
        if (unitDisplay) unitDisplay.style.display = 'none';
        if (mainInputWrapper) mainInputWrapper.style.padding = '0';
    } else {
        if (inputFieldContainer) {
            inputFieldContainer.innerHTML = `<input type="text" id="valInput" inputmode="decimal" placeholder="0.00" value="${currentValue}" autocomplete="off" style="width: 100%; background: transparent; border: none; color: var(--text-primary); font-size: 1.25rem; font-weight: 600; outline: none;">`;
        }
        if (unitDisplay) {
            unitDisplay.textContent = getUnit(fullLabel) || '--';
            unitDisplay.style.display = 'flex';
        }
        if (mainInputWrapper) mainInputWrapper.style.padding = '0';
    }
    
    renderProgressDots();
    
    setTimeout(() => {
        const input = document.getElementById('valInput');
        if (input && inputType.type === 'text') {
            input.focus();
            input.select();
        }
    }, 100);
}

function saveStep() {
    const input = document.getElementById('valInput');
    if (!input) return;
    const val = input.value.trim();
    const fullLabel = AREAS[activeArea][activeIdx];
    
    if (val) {
        if (!currentInput[activeArea]) currentInput[activeArea] = {};
        currentInput[activeArea][fullLabel] = val;
        localStorage.setItem('draft_turbine', JSON.stringify(currentInput));
    }
    
    if (activeIdx < AREAS[activeArea].length - 1) {
        activeIdx++;
        showStep();
    } else {
        showCustomAlert(`Area ${activeArea} selesai diisi!`, 'success');
        setTimeout(() => navigateTo('areaListScreen'), 1500);
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

async function sendToSheet() {
    const loader = document.getElementById('loader');
    const loaderText = document.getElementById('loaderText');
    
    if (loader) loader.style.display = 'flex';
    if (loaderText) loaderText.textContent = 'Mengirim Data...';
    
    const finalData = {
        Operator: currentUser,
        Device_Timestamp: new Date().toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'})
    };
    
    Object.values(currentInput).forEach(obj => Object.assign(finalData, obj));
    
    try {
        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalData)
        });
        
        showCustomAlert('✓ Data berhasil dikirim ke sistem!', 'success');
        currentInput = {};
        localStorage.removeItem('draft_turbine');
        setTimeout(() => navigateTo('homeScreen'), 2000);
    } catch (error) {
        showCustomAlert('Gagal mengirim data. Periksa koneksi internet.', 'error');
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

// ============================================
// TPM FUNCTIONS (Total Productive Maintenance)
// ============================================

function openTPMArea(areaName) {
    activeTPMArea = areaName;
    currentTPMPhoto = null;
    currentTPMStatus = '';
    
    // Reset form
    const preview = document.getElementById('tpmPhotoPreview');
    const photoSection = document.getElementById('tpmPhotoSection');
    if (preview) {
        preview.innerHTML = '<span style="font-size: 3rem;">📷</span>';
        if (photoSection) photoSection.classList.remove('has-photo');
    }
    
    const notes = document.getElementById('tpmNotes');
    const action = document.getElementById('tpmAction');
    if (notes) notes.value = '';
    if (action) action.value = '';
    
    // Reset status buttons
    const btnNormal = document.getElementById('btnNormal');
    const btnAbnormal = document.getElementById('btnAbnormal');
    const btnOff = document.getElementById('btnOff');
    if (btnNormal) btnNormal.className = 'tpm-status-btn';
    if (btnAbnormal) btnAbnormal.className = 'tpm-status-btn';
    if (btnOff) btnOff.className = 'tpm-status-btn';
    
    // Set title
    const title = document.getElementById('tpmInputTitle');
    if (title) title.textContent = areaName;
    
    // Update user display
    const userDisplay = document.getElementById('tpmInputUser');
    if (userDisplay) userDisplay.textContent = currentUser;
    
    navigateTo('tpmInputScreen');
}

function handleTPMPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
        showCustomAlert('Ukuran foto terlalu besar. Maksimal 5MB.', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        currentTPMPhoto = e.target.result;
        const preview = document.getElementById('tpmPhotoPreview');
        const photoSection = document.getElementById('tpmPhotoSection');
        if (preview) {
            preview.innerHTML = `<img src="${currentTPMPhoto}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
            if (photoSection) photoSection.classList.add('has-photo');
        }
    };
    reader.readAsDataURL(file);
}

function selectTPMStatus(status) {
    currentTPMStatus = status;
    
    const btnNormal = document.getElementById('btnNormal');
    const btnAbnormal = document.getElementById('btnAbnormal');
    const btnOff = document.getElementById('btnOff');
    
    // Reset all buttons
    if (btnNormal) btnNormal.className = 'tpm-status-btn';
    if (btnAbnormal) btnAbnormal.className = 'tpm-status-btn';
    if (btnOff) btnOff.className = 'tpm-status-btn';
    
    // Activate selected
    if (status === 'normal' && btnNormal) {
        btnNormal.classList.add('active-normal');
    } else if (status === 'abnormal' && btnAbnormal) {
        btnAbnormal.classList.add('active-abnormal');
    } else if (status === 'off' && btnOff) {
        btnOff.classList.add('active-off');
    }
}

async function submitTPMData() {
    const notes = document.getElementById('tpmNotes')?.value || '';
    const action = document.getElementById('tpmAction')?.value || '';
    
    // Validasi
    if (!currentTPMStatus) {
        showCustomAlert('Pilih status kondisi terlebih dahulu!', 'error');
        return;
    }
    
    if (!currentTPMPhoto) {
        showCustomAlert('Ambil foto dokumentasi terlebih dahulu!', 'error');
        return;
    }
    
    if (!action) {
        showCustomAlert('Pilih tindakan yang dilakukan!', 'error');
        return;
    }
    
    // Show loading
    const loader = document.getElementById('loader');
    const loaderText = document.getElementById('loaderText');
    
    if (loader) loader.style.display = 'flex';
    if (loaderText) loaderText.textContent = 'Mengupload TPM...';
    
    // Prepare data
    const tpmData = {
        type: 'TPM',
        area: activeTPMArea,
        status: currentTPMStatus,
        notes: notes,
        action: action,
        photo: currentTPMPhoto,
        user: currentUser,
        timestamp: new Date().toISOString()
    };
    
    try {
        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tpmData)
        });
        
        // Save to local history (without base64 to save space)
        let tpmHistory = JSON.parse(localStorage.getItem('tpm_history') || '[]');
        tpmHistory.push({
            ...tpmData,
            photo: '[UPLOADED_TO_DRIVE]'
        });
        localStorage.setItem('tpm_history', JSON.stringify(tpmHistory));
        
        showCustomAlert(`✓ Data TPM ${activeTPMArea} berhasil disimpan!`, 'success');
        
        // Reset
        currentTPMPhoto = null;
        currentTPMStatus = '';
        
        setTimeout(() => {
            navigateTo('tpmScreen');
        }, 2000);
        
    } catch (error) {
        console.error('TPM Error:', error);
        
        // Save offline for retry
        let offlineTPM = JSON.parse(localStorage.getItem('tpm_offline') || '[]');
        offlineTPM.push(tpmData);
        localStorage.setItem('tpm_offline', JSON.stringify(offlineTPM));
        
        showCustomAlert('Gagal mengupload. Data disimpan lokal untuk diupload nanti.', 'error');
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

// ============================================
// KEYBOARD EVENTS
// ============================================

document.addEventListener('keydown', (e) => {
    // Login screen - Enter to login
    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen && loginScreen.classList.contains('active') && e.key === 'Enter') {
        loginOperator();
        return;
    }
    
    // Param screen shortcuts
    const paramScreen = document.getElementById('paramScreen');
    if (!paramScreen || !paramScreen.classList.contains('active')) return;
    
    if (e.key === 'Enter') {
        e.preventDefault();
        if (currentInputType !== 'select') saveStep();
    } else if (e.key === 'Escape') {
        goBack();
    }
});
