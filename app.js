// ============================================
// TURBINE LOGSHEET PRO - VERSION CONTROL
// ============================================
const APP_VERSION = '1.1.4'; // Updated with Balancing feature

// ============================================
// AUTHENTICATION SYSTEM
// ============================================
const AUTH_CONFIG = {
    SESSION_KEY: 'turbine_session',
    USER_KEY: 'turbine_user',
    SESSION_DURATION: 8 * 60 * 60 * 1000, // 8 hours
    REMEMBER_ME_DURATION: 30 * 24 * 60 * 60 * 1000 // 30 days
};

let currentUser = null;
let isAuthenticated = false;

// ============================================
// SERVICE WORKER REGISTRATION
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
// AUTHENTICATION FUNCTIONS
// ============================================
function initAuth() {
    const session = getSession();
    
    if (session && isSessionValid(session)) {
        currentUser = session.user;
        isAuthenticated = true;
        updateUIForAuthenticatedUser();
        
        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen && loginScreen.classList.contains('active')) {
            navigateTo('homeScreen');
        }
    } else {
        clearSession();
        showLoginScreen();
    }
}

function getSession() {
    try {
        const sessionData = localStorage.getItem(AUTH_CONFIG.SESSION_KEY);
        return sessionData ? JSON.parse(sessionData) : null;
    } catch (e) {
        console.error('Error reading session:', e);
        return null;
    }
}

function saveSession(user, rememberMe = false) {
    const duration = rememberMe ? AUTH_CONFIG.REMEMBER_ME_DURATION : AUTH_CONFIG.SESSION_DURATION;
    const session = {
        user: user,
        loginTime: Date.now(),
        expiresAt: Date.now() + duration,
        rememberMe: rememberMe
    };
    
    try {
        localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(session));
        localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user));
    } catch (e) {
        console.error('Error saving session:', e);
    }
}

function isSessionValid(session) {
    if (!session || !session.expiresAt) return false;
    return Date.now() < session.expiresAt;
}

function clearSession() {
    localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    currentUser = null;
    isAuthenticated = false;
}

function loginOperator() {
    const nameInput = document.getElementById('operatorName');
    const errorMsg = document.getElementById('loginError');
    
    if (!nameInput) {
        console.error('Login input not found');
        return;
    }
    
    const operatorName = nameInput.value.trim();
    
    if (!operatorName) {
        if (errorMsg) {
            errorMsg.textContent = 'Nama operator wajib diisi!';
            errorMsg.style.display = 'block';
        }
        nameInput.focus();
        nameInput.classList.add('error');
        return;
    }
    
    if (operatorName.length < 3) {
        if (errorMsg) {
            errorMsg.textContent = 'Nama minimal 3 karakter!';
            errorMsg.style.display = 'block';
        }
        nameInput.focus();
        nameInput.classList.add('error');
        return;
    }
    
    if (errorMsg) errorMsg.style.display = 'none';
    nameInput.classList.remove('error');
    
    const user = {
        name: operatorName,
        id: 'OP-' + Date.now().toString(36).toUpperCase(),
        loginTime: new Date().toISOString(),
        role: 'operator'
    };
    
    saveSession(user, false);
    currentUser = user;
    isAuthenticated = true;
    
    showCustomAlert(`Selamat datang, ${operatorName}!`, 'success');
    
    setTimeout(() => {
        updateUIForAuthenticatedUser();
        navigateTo('homeScreen');
        loadUserStats();
    }, 800);
}

function logoutOperator() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        if (Object.keys(currentInput).length > 0) {
            localStorage.setItem('draft_turbine_backup', JSON.stringify(currentInput));
        }
        
        clearSession();
        
        const nameInput = document.getElementById('operatorName');
        if (nameInput) nameInput.value = '';
        
        showLoginScreen();
        showCustomAlert('Anda telah keluar dari sistem.', 'success');
    }
}

function showLoginScreen() {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
    });
    
    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen) {
        loginScreen.classList.add('active');
    }
    
    const savedUser = localStorage.getItem(AUTH_CONFIG.USER_KEY);
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            const nameInput = document.getElementById('operatorName');
            if (nameInput && user.name) {
                nameInput.value = user.name;
            }
        } catch (e) {
            console.error('Error parsing saved user:', e);
        }
    }
}

function updateUIForAuthenticatedUser() {
    if (!currentUser) return;
    
    const userElements = [
        'displayUserName',
        'tpmHeaderUser',
        'tpmInputUser',
        'areaListUser',
        'paramUser',
        'balancingUser'
    ];
    
    userElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = currentUser.name;
    });
}

function requireAuth() {
    if (!isAuthenticated || !isSessionValid(getSession())) {
        clearSession();
        showLoginScreen();
        showCustomAlert('Sesi Anda telah berakhir. Silakan login kembali.', 'error');
        return false;
    }
    return true;
}

function loadUserStats() {
    const totalAreas = Object.keys(AREAS).length;
    let completedAreas = 0;
    
    Object.entries(AREAS).forEach(([areaName, params]) => {
        const filled = currentInput[areaName] ? Object.keys(currentInput[areaName]).length : 0;
        if (filled === params.length && filled > 0) completedAreas++;
    });
    
    const statProgress = document.getElementById('statProgress');
    const statAreas = document.getElementById('statAreas');
    
    if (statProgress) {
        const percent = Math.round((completedAreas / totalAreas) * 100);
        statProgress.textContent = `${percent}%`;
    }
    
    if (statAreas) {
        statAreas.textContent = `${completedAreas}/${totalAreas}`;
    }
}

// ============================================
// CONFIGURATION
// ============================================
const GAS_URL = "https://script.google.com/macros/s/AKfycbyXcwDKaifFI44PhViy2yQewwhujDiIl3PRt46l66nmGobJ0iy7MH1gfYvFZVEVIPms/exec";

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

// State Variables
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

// Balancing State
let currentShift = 3;

// ============================================
// INITIALIZATION
// ============================================
window.addEventListener('DOMContentLoaded', () => {
    totalParams = Object.values(AREAS).reduce((acc, arr) => acc + arr.length, 0);
    
    const versionDisplay = document.getElementById('versionDisplay');
    if (versionDisplay) {
        versionDisplay.textContent = APP_VERSION;
    }
    
    initAuth();
    setupLoginListeners();
    setupTPMListeners();
    
    simulateLoading();
});

function setupLoginListeners() {
    const nameInput = document.getElementById('operatorName');
    if (nameInput) {
        nameInput.addEventListener('input', () => {
            nameInput.classList.remove('error');
            const errorMsg = document.getElementById('loginError');
            if (errorMsg) errorMsg.style.display = 'none';
        });
        
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loginOperator();
            }
        });
    }
}

function setupTPMListeners() {
    const tpmCamera = document.getElementById('tpmCamera');
    if (tpmCamera) {
        tpmCamera.addEventListener('change', handleTPMPhoto);
    }
}

function simulateLoading() {
    let progress = 0;
    const loaderProgress = document.getElementById('loaderProgress');
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                const loader = document.getElementById('loader');
                if (loader) loader.style.display = 'none';
                
                if (isAuthenticated) {
                    renderMenu();
                }
            }, 500);
        }
        if (loaderProgress) loaderProgress.style.width = progress + '%';
    }, 300);
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
    
    if (!customAlert || !alertContent || !alertTitle || !alertIconWrapper) {
        console.error('Alert elements not found');
        alert(msg);
        return;
    }
    
    if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        autoCloseTimer = null;
    }
    
    const titleMap = {
        'success': 'Berhasil',
        'error': 'Error',
        'warning': 'Peringatan'
    };
    alertTitle.textContent = titleMap[type] || 'Informasi';
    
    const alertMessage = document.getElementById('alertMessage');
    if (alertMessage) alertMessage.innerText = msg;
    
    alertContent.className = 'alert-content ' + type;
    
    if (type === 'success') {
        alertIconWrapper.innerHTML = `
            <div class="alert-icon-bg"></div>
            <svg class="alert-icon-svg" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="25"></circle>
                <path d="M14.1 27.2l7.1 7.2 16.7-16.8"></path>
            </svg>
        `;
    } else if (type === 'warning') {
        alertIconWrapper.innerHTML = `
            <div class="alert-icon-bg" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);"></div>
            <svg class="alert-icon-svg" viewBox="0 0 52 52" style="stroke: #f59e0b;">
                <circle cx="26" cy="26" r="25"></circle>
                <path d="M26 10 L26 30 M26 34 L26 38"></path>
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
// NAVIGATION
// ============================================
function navigateTo(screenId) {
    const protectedScreens = ['homeScreen', 'areaListScreen', 'paramScreen', 'tpmScreen', 'tpmInputScreen', 'balancingScreen'];
    if (protectedScreens.includes(screenId) && !requireAuth()) {
        return;
    }
    
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.style.animation = 'none';
        setTimeout(() => s.style.animation = '', 10);
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        
        if (screenId === 'tpmScreen' || screenId === 'tpmInputScreen') {
            updateTPMUserInfo();
        }
        
        if (screenId === 'areaListScreen') {
            fetchLastData();
            updateOverallProgress();
        } else if (screenId === 'homeScreen') {
            loadUserStats();
        } else if (screenId === 'balancingScreen') {
            initBalancingScreen();
        }
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
    // Implementation depends on your UI
    console.log('Status:', isOnline ? 'Online' : 'Offline');
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
            <div class="area-item ${isCompleted ? 'completed' : ''}" onclick="openArea('${areaName}')">
                <div class="area-progress-ring">
                    <svg width="40" height="40" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3"/>
                        <circle cx="20" cy="20" r="18" fill="none" stroke="${isCompleted ? '#10b981' : 'var(--primary)'}" 
                                stroke-width="3" stroke-linecap="round" stroke-dasharray="${circumference}" 
                                stroke-dashoffset="${strokeDashoffset}" transform="rotate(-90 20 20)"/>
                        <text x="20" y="24" text-anchor="middle" font-size="10" font-weight="bold" fill="${isCompleted ? '#10b981' : 'var(--text-primary)'}">${filled}</text>
                    </svg>
                </div>
                <div class="area-info">
                    <div class="area-name">${areaName}</div>
                    <div class="area-meta">${filled} dari ${total} parameter diisi</div>
                </div>
                <div class="area-status">${isCompleted ? '✓' : '❯'}</div>
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
    if (!requireAuth()) return;
    
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
        const className = isActive ? 'active' : (isFilled ? 'filled' : '');
        html += `<div class="progress-dot ${className}" onclick="jumpToStep(${i})"></div>`;
    }
    container.innerHTML = html;
}

function jumpToStep(index) {
    const input = document.getElementById('valInput');
    if (input) {
        const currentVal = input.value.trim();
        if (currentVal) {
            const fullLabel = AREAS[activeArea][activeIdx];
            if (!currentInput[activeArea]) currentInput[activeArea] = {};
            currentInput[activeArea][fullLabel] = currentVal;
            localStorage.setItem('draft_turbine', JSON.stringify(currentInput));
        }
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
                <div class="select-wrapper">
                    <select id="valInput" class="status-select">${optionsHtml}</select>
                    <div class="select-arrow">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 9l6 6 6-6"/>
                        </svg>
                    </div>
                </div>
            `;
        }
        if (unitDisplay) unitDisplay.style.display = 'none';
        if (mainInputWrapper) mainInputWrapper.classList.add('has-select');
    } else {
        if (inputFieldContainer) {
            inputFieldContainer.innerHTML = `<input type="text" id="valInput" inputmode="decimal" placeholder="0.00" value="${currentValue}" autocomplete="off">`;
        }
        if (unitDisplay) {
            unitDisplay.textContent = getUnit(fullLabel) || '--';
            unitDisplay.style.display = 'flex';
        }
        if (mainInputWrapper) mainInputWrapper.classList.remove('has-select');
    }
    
    const dots = document.querySelectorAll('.progress-dot');
    dots.forEach((dot, idx) => {
        dot.className = 'progress-dot';
        if (idx === activeIdx) dot.classList.add('active');
        else if (currentInput[activeArea] && currentInput[activeArea][AREAS[activeArea][idx]]) {
            dot.classList.add('filled');
        }
    });
    
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

// ============================================
// SEND LOGSHEET TO SPREADSHEET
// ============================================
async function sendToSheet() {
    if (!requireAuth()) return;
    
    const loader = document.getElementById('loader');
    const loaderText = document.querySelector('.loader-text h3');
    
    if (loader) loader.style.display = 'flex';
    if (loaderText) loaderText.textContent = 'Mengirim Data...';
    
    let allParameters = {};
    Object.entries(currentInput).forEach(([areaName, params]) => {
        Object.entries(params).forEach(([paramName, value]) => {
            allParameters[paramName] = value;
        });
    });
    
    const finalData = {
        type: 'LOGSHEET',
        Operator: currentUser ? currentUser.name : 'Unknown',
        OperatorId: currentUser ? currentUser.id : 'Unknown',
        ...allParameters
    };
    
    console.log('Sending Logsheet Data:', finalData);
    
    try {
        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(finalData)
        });
        
        showCustomAlert('✓ Data berhasil dikirim ke sistem!', 'success');
        
        currentInput = {};
        localStorage.removeItem('draft_turbine');
        
        setTimeout(() => {
            navigateTo('homeScreen');
        }, 2000);
        
    } catch (error) {
        console.error('Error sending data:', error);
        showCustomAlert('Gagal mengirim data. Data disimpan lokal.', 'error');
        
        let offlineData = JSON.parse(localStorage.getItem('offline_logsheets') || '[]');
        offlineData.push(finalData);
        localStorage.setItem('offline_logsheets', JSON.stringify(offlineData));
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

// ============================================
// TPM FUNCTIONS (Total Productive Maintenance)
// ============================================

function updateTPMUserInfo() {
    if (!currentUser) return;
    
    const tpmHeaderUser = document.getElementById('tpmHeaderUser');
    const tpmInputUser = document.getElementById('tpmInputUser');
    
    if (tpmHeaderUser) tpmHeaderUser.textContent = currentUser.name;
    if (tpmInputUser) tpmInputUser.textContent = currentUser.name;
}

function openTPMArea(areaName) {
    if (!requireAuth()) return;
    
    console.log('Opening TPM Area:', areaName);
    
    activeTPMArea = areaName;
    currentTPMPhoto = null;
    currentTPMStatus = '';
    
    resetTPMForm();
    
    const title = document.getElementById('tpmInputTitle');
    if (title) title.textContent = areaName;
    
    updateTPMUserInfo();
    
    navigateTo('tpmInputScreen');
}

function resetTPMForm() {
    const preview = document.getElementById('tpmPhotoPreview');
    const photoSection = document.getElementById('tpmPhotoSection');
    
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
    
    if (photoSection) {
        photoSection.classList.remove('has-photo');
    }
    
    const notes = document.getElementById('tpmNotes');
    if (notes) notes.value = '';
    
    const action = document.getElementById('tpmAction');
    if (action) action.value = '';
    
    resetTPMStatusButtons();
}

function resetTPMStatusButtons() {
    const buttons = ['btnNormal', 'btnAbnormal', 'btnOff'];
    
    buttons.forEach((id) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.className = 'status-btn';
        }
    });
}

function handleTPMPhoto(event) {
    console.log('Handle TPM Photo triggered');
    
    const file = event.target.files[0];
    if (!file) {
        console.log('No file selected');
        return;
    }
    
    console.log('File selected:', file.name, 'Size:', file.size);
    
    if (file.size > 5 * 1024 * 1024) {
        showCustomAlert('Ukuran foto terlalu besar. Maksimal 5MB.', 'error');
        event.target.value = '';
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        showCustomAlert('File harus berupa gambar.', 'error');
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        console.log('File loaded successfully');
        currentTPMPhoto = e.target.result;
        
        const preview = document.getElementById('tpmPhotoPreview');
        const photoSection = document.getElementById('tpmPhotoSection');
        
        if (preview) {
            preview.innerHTML = `<img src="${currentTPMPhoto}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" alt="TPM Photo">`;
        }
        
        if (photoSection) {
            photoSection.classList.add('has-photo');
        }
        
        showCustomAlert('Foto berhasil diambil!', 'success');
    };
    
    reader.onerror = function(e) {
        console.error('Error reading file:', e);
        showCustomAlert('Gagal membaca foto. Coba lagi.', 'error');
    };
    
    reader.readAsDataURL(file);
}

function selectTPMStatus(status) {
    console.log('Selecting TPM Status:', status);
    
    currentTPMStatus = status;
    
    resetTPMStatusButtons();
    
    const buttonMap = {
        'normal': { id: 'btnNormal', class: 'active-normal' },
        'abnormal': { id: 'btnAbnormal', class: 'active-abnormal' },
        'off': { id: 'btnOff', class: 'active-off' }
    };
    
    const selected = buttonMap[status];
    if (selected) {
        const btn = document.getElementById(selected.id);
        if (btn) {
            btn.classList.add(selected.class);
        }
    }
    
    if ((status === 'abnormal' || status === 'off') && !currentTPMPhoto) {
        setTimeout(() => {
            showCustomAlert('⚠️ Kondisi abnormal/off wajib didokumentasikan dengan foto!', 'warning');
        }, 100);
    }
}

async function submitTPMData() {
    if (!requireAuth()) return;
    
    console.log('Submitting TPM Data...');
    
    const notes = document.getElementById('tpmNotes')?.value.trim() || '';
    const action = document.getElementById('tpmAction')?.value || '';
    
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
    
    const loader = document.getElementById('loader');
    const loaderText = document.querySelector('.loader-text h3');
    const loaderDesc = document.querySelector('.loader-text p');
    
    if (loader) loader.style.display = 'flex';
    if (loaderText) loaderText.textContent = 'Mengupload TPM...';
    if (loaderDesc) loaderDesc.textContent = 'Sedang mengupload foto...';
    
    const tpmData = {
        type: 'TPM',
        area: activeTPMArea,
        status: currentTPMStatus,
        action: action,
        notes: notes,
        photo: currentTPMPhoto,
        user: currentUser ? currentUser.name : 'Unknown',
        timestamp: new Date().toISOString()
    };
    
    console.log('Sending TPM Data:', tpmData);
    
    try {
        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tpmData)
        });
        
        let tpmHistory = JSON.parse(localStorage.getItem('tpm_history') || '[]');
        tpmHistory.push({
            ...tpmData,
            photo: '[UPLOADED]' 
        });
        localStorage.setItem('tpm_history', JSON.stringify(tpmHistory));
        
        showCustomAlert(`✓ Data TPM ${activeTPMArea} berhasil disimpan!`, 'success');
        
        currentTPMPhoto = null;
        currentTPMStatus = '';
        
        setTimeout(() => {
            navigateTo('tpmScreen');
        }, 2000);
        
    } catch (error) {
        console.error('TPM Error:', error);
        
        let offlineTPM = JSON.parse(localStorage.getItem('tpm_offline') || '[]');
        offlineTPM.push(tpmData);
        localStorage.setItem('tpm_offline', JSON.stringify(offlineTPM));
        
        showCustomAlert('Gagal mengupload. Data disimpan lokal untuk diupload nanti.', 'error');
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

// ============================================
// BALANCING FUNCTIONS (INPUT BALANCING)
// ============================================

function initBalancingScreen() {
    if (!requireAuth()) return;
    
    const balancingUser = document.getElementById('balancingUser');
    if (balancingUser && currentUser) balancingUser.textContent = currentUser.name;
    
    const now = new Date();
    const dateInput = document.getElementById('balancingDate');
    const timeInput = document.getElementById('balancingTime');
    
    if (dateInput) {
        dateInput.value = now.toISOString().split('T')[0];
    }
    if (timeInput) {
        timeInput.value = now.toTimeString().slice(0, 5);
    }
    
    detectShift();
    setDefaultBalancingValues();
    calculateTotal3B();
    calculateLPBalance();
}

function detectShift() {
    const hour = new Date().getHours();
    let shift = 3;
    let shiftText = "Shift 3 (23:00 - 07:00)";
    
    if (hour >= 7 && hour < 15) {
        shift = 1;
        shiftText = "Shift 1 (07:00 - 15:00)";
    } else if (hour >= 15 && hour < 23) {
        shift = 2;
        shiftText = "Shift 2 (15:00 - 23:00)";
    }
    
    currentShift = shift;
    
    const badge = document.getElementById('currentShiftBadge');
    const info = document.getElementById('balancingShiftInfo');
    const kegiatanNum = document.getElementById('kegiatanShiftNum');
    
    if (badge) badge.textContent = `SHIFT ${shift}`;
    if (info) info.textContent = `${shiftText} • Auto Update`;
    if (kegiatanNum) kegiatanNum.textContent = shift;
    
    if (badge) {
        if (shift === 1) badge.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
        else if (shift === 2) badge.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
        else badge.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    }
}

function setDefaultBalancingValues() {
    const defaults = {
        'hvs65Current': '1',
        'puri2Steam': '1.4',
        'deaeratorSteam': '2.5',
        'dumpCondenser': '5.0',
        'pcv6105': '0.0',
        'ctSuFan': '4',
        'ctSuPompa': '2',
        'ctSaFan': '3',
        'ctSaPompa': '2'
    };
    
    Object.entries(defaults).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el && !el.value) el.value = value;
    });
}

function handleEksporInput(input) {
    const label = document.getElementById('eksporLabel');
    const hint = document.getElementById('eksporHint');
    let value = parseFloat(input.value);
    
    if (isNaN(value) || input.value === '') {
        if (label) {
            label.textContent = 'Ekspor/Impor (MW)';
            label.style.color = '#94a3b8';
        }
        if (hint) {
            hint.innerHTML = '💡 <strong>Minus (-) = Ekspor</strong> ke Grid | <strong>Plus (+) = Impor</strong> dari Grid';
            hint.style.color = '#94a3b8';
        }
        input.style.borderColor = 'rgba(148, 163, 184, 0.2)';
        input.style.background = 'rgba(15, 23, 42, 0.6)';
        input.setAttribute('data-state', '');
        return;
    }
    
    if (value < 0) {
        if (label) {
            label.textContent = 'Ekspor (MW)';
            label.style.color = '#10b981';
        }
        if (hint) {
            hint.innerHTML = '✓ Posisi: <strong>Ekspor ke Grid</strong> (Nilai negatif)';
            hint.style.color = '#10b981';
        }
        input.style.borderColor = '#10b981';
        input.style.background = 'rgba(16, 185, 129, 0.05)';
        input.setAttribute('data-state', 'ekspor');
        
    } else if (value > 0) {
        if (label) {
            label.textContent = 'Impor (MW)';
            label.style.color = '#f59e0b';
        }
        if (hint) {
            hint.innerHTML = '✓ Posisi: <strong>Impor dari Grid</strong> (Nilai positif)';
            hint.style.color = '#f59e0b';
        }
        input.style.borderColor = '#f59e0b';
        input.style.background = 'rgba(245, 158, 11, 0.05)';
        input.setAttribute('data-state', 'impor');
        
    } else {
        if (label) {
            label.textContent = 'Ekspor/Impor (MW)';
            label.style.color = '#94a3b8';
        }
        if (hint) {
            hint.innerHTML = '⚪ Posisi: <strong>Netral</strong> (Nilai 0)';
            hint.style.color = '#64748b';
        }
        input.style.borderColor = 'rgba(148, 163, 184, 0.2)';
        input.style.background = 'rgba(15, 23, 42, 0.6)';
        input.setAttribute('data-state', '');
    }
}

function getEksporImporValue() {
    const input = document.getElementById('eksporMW');
    if (!input || !input.value) return 0;
    
    const value = parseFloat(input.value);
    if (isNaN(value)) return 0;
    
    return value;
}

function toggleSS2000Detail() {
    const detail = document.getElementById('ss2000Detail');
    if (detail) {
        detail.style.display = 'block';
        detail.style.opacity = '0';
        setTimeout(() => {
            detail.style.transition = 'opacity 0.3s';
            detail.style.opacity = '1';
        }, 10);
    }
}

function calculateTotal3B() {
    const ss6500 = parseFloat(document.getElementById('ss6500MW')?.value) || 0;
    const activePower = parseFloat(document.getElementById('activePowerMW')?.value) || 0;
    const hvs65 = parseFloat(document.getElementById('hvs65l02MW')?.value) || 0;
    
    const total = ss6500 + activePower + hvs65;
    
    const totalInput = document.getElementById('total3BMW');
    if (totalInput) {
        totalInput.value = total.toFixed(3);
        totalInput.style.animation = 'none';
        setTimeout(() => {
            totalInput.style.animation = 'pulse 0.5s';
        }, 10);
    }
    
    return total;
}

function calculateLPBalance() {
    const produksi = parseFloat(document.getElementById('fq1105')?.value) || 0;
    
    const konsumsiItems = [
        'stgSteam', 'pa2Steam', 'puri2Steam', 'deaeratorSteam',
        'dumpCondenser', 'pcv6105'
    ];
    
    let totalKonsumsi = 0;
    konsumsiItems.forEach(id => {
        totalKonsumsi += parseFloat(document.getElementById(id)?.value) || 0;
    });
    
    totalKonsumsi += parseFloat(document.getElementById('melterSA2')?.value) || 0;
    totalKonsumsi += parseFloat(document.getElementById('ejectorSteam')?.value) || 0;
    totalKonsumsi += parseFloat(document.getElementById('glandSealSteam')?.value) || 0;
    
    const totalDisplay = document.getElementById('totalKonsumsiSteam');
    if (totalDisplay) {
        totalDisplay.textContent = totalKonsumsi.toFixed(1) + ' t/h';
    }
    
    const balance = produksi - totalKonsumsi;
    
    const balanceField = document.getElementById('lpBalanceField');
    const balanceLabel = document.getElementById('lpBalanceLabel');
    const balanceInput = document.getElementById('lpBalanceValue');
    const balanceStatus = document.getElementById('lpBalanceStatus');
    
    if (balanceInput) balanceInput.value = Math.abs(balance).toFixed(1);
    
    if (balance < 0) {
        if (balanceLabel) balanceLabel.textContent = 'LPS Impor dari SU 3A (t/h)';
        if (balanceStatus) {
            balanceStatus.textContent = 'Posisi: Impor dari 3A (Produksi < Konsumsi)';
            balanceStatus.style.color = '#f59e0b';
        }
        if (balanceInput) {
            balanceInput.style.borderColor = '#f59e0b';
            balanceInput.style.color = '#f59e0b';
            balanceInput.style.background = 'rgba(245, 158, 11, 0.1)';
        }
        if (balanceField) {
            balanceField.style.borderColor = 'rgba(245, 158, 11, 0.3)';
            balanceField.style.background = 'rgba(245, 158, 11, 0.05)';
        }
    } else {
        if (balanceLabel) balanceLabel.textContent = 'LPS Ekspor ke SU 3A (t/h)';
        if (balanceStatus) {
            balanceStatus.textContent = 'Posisi: Ekspor ke 3A (Produksi > Konsumsi)';
            balanceStatus.style.color = '#10b981';
        }
        if (balanceInput) {
            balanceInput.style.borderColor = '#10b981';
            balanceInput.style.color = '#10b981';
            balanceInput.style.background = 'rgba(16, 185, 129, 0.1)';
        }
        if (balanceField) {
            balanceField.style.borderColor = 'rgba(16, 185, 129, 0.3)';
            balanceField.style.background = 'rgba(16, 185, 129, 0.05)';
        }
    }
    
    return balance;
}

async function submitBalancingData() {
    if (!requireAuth()) return;
    
    const requiredFields = ['loadMW', 'fq1105', 'stgSteam'];
    for (let id of requiredFields) {
        const el = document.getElementById(id);
        if (!el || !el.value) {
            showCustomAlert(`Field ${id} wajib diisi!`, 'error');
            if (el) el.focus();
            return;
        }
    }
    
    const loader = document.getElementById('loader');
    const loaderText = document.querySelector('.loader-text h3');
    if (loader) loader.style.display = 'flex';
    if (loaderText) loaderText.textContent = 'Mengirim Data Balancing...';
    
    const eksporValue = getEksporImporValue();
    const lpBalance = calculateLPBalance();
    
    const balancingData = {
        type: 'BALANCING',
        Operator: currentUser ? currentUser.name : 'Unknown',
        Timestamp: new Date().toISOString(),
        
        Tanggal: document.getElementById('balancingDate')?.value || '',
        Jam: document.getElementById('balancingTime')?.value || '',
        Shift: currentShift,
        
        'Load_MW': parseFloat(document.getElementById('loadMW')?.value) || 0,
        'Ekspor_Impor_MW': eksporValue,
        'Ekspor_Impor_Status': eksporValue > 0 ? 'Impor' : (eksporValue < 0 ? 'Ekspor' : 'Netral'),
        
        'PLN_MW': parseFloat(document.getElementById('plnMW')?.value) || 0,
        'UBB_MW': parseFloat(document.getElementById('ubbMW')?.value) || 0,
        'PIE_MW': parseFloat(document.getElementById('pieMW')?.value) || 0,
        'TG65_MW': parseFloat(document.getElementById('tg65MW')?.value) || 0,
        'TG66_MW': parseFloat(document.getElementById('tg66MW')?.value) || 0,
        'GTG_MW': parseFloat(document.getElementById('gtgMW')?.value) || 0,
        
        'SS6500_MW': parseFloat(document.getElementById('ss6500MW')?.value) || 0,
        'SS2000_Via': document.getElementById('ss2000Via')?.value || 'TR-Main01',
        'Active_Power_MW': parseFloat(document.getElementById('activePowerMW')?.value) || 0,
        'Reactive_Power_MVAR': parseFloat(document.getElementById('reactivePowerMVAR')?.value) || 0,
        'Current_S_A': parseFloat(document.getElementById('currentS')?.value) || 0,
        'Voltage_V': parseFloat(document.getElementById('voltageV')?.value) || 0,
        'HVS65_L02_MW': parseFloat(document.getElementById('hvs65l02MW')?.value) || 0,
        'Total_3B_MW': parseFloat(document.getElementById('total3BMW')?.value) || 0,
        
        'Produksi_Steam_SA_t/h': parseFloat(document.getElementById('fq1105')?.value) || 0,
        'STG_Steam_t/h': parseFloat(document.getElementById('stgSteam')?.value) || 0,
        'PA2_Steam_t/h': parseFloat(document.getElementById('pa2Steam')?.value) || 0,
        'Puri2_Steam_t/h': parseFloat(document.getElementById('puri2Steam')?.value) || 0,
        'Melter_SA2_t/h': parseFloat(document.getElementById('melterSA2')?.value) || 0,
        'Ejector_t/h': parseFloat(document.getElementById('ejectorSteam')?.value) || 0,
        'Gland_Seal_t/h': parseFloat(document.getElementById('glandSealSteam')?.value) || 0,
        'Deaerator_t/h': parseFloat(document.getElementById('deaeratorSteam')?.value) || 0,
        'Dump_Condenser_t/h': parseFloat(document.getElementById('dumpCondenser')?.value) || 0,
        'PCV6105_t/h': parseFloat(document.getElementById('pcv6105')?.value) || 0,
        'Total_Konsumsi_Steam_t/h': parseFloat(document.getElementById('totalKonsumsiSteam')?.textContent) || 0,
        'LPS_Balance_t/h': Math.abs(lpBalance),
        'LPS_Balance_Status': lpBalance < 0 ? 'Impor dari 3A' : 'Ekspor ke 3A',
        
        'PI6122_kg/cm2': parseFloat(document.getElementById('pi6122')?.value) || 0,
        'TI6112_C': parseFloat(document.getElementById('ti6112')?.value) || 0,
        'TI6146_C': parseFloat(document.getElementById('ti6146')?.value) || 0,
        'TI6126_C': parseFloat(document.getElementById('ti6126')?.value) || 0,
        'Axial_Displacement_mm': parseFloat(document.getElementById('axialDisplacement')?.value) || 0,
        'VI6102_μm': parseFloat(document.getElementById('vi6102')?.value) || 0,
        'TE6134_C': parseFloat(document.getElementById('te6134')?.value) || 0,
        'CT_SU_Fan': parseInt(document.getElementById('ctSuFan')?.value) || 0,
        'CT_SU_Pompa': parseInt(document.getElementById('ctSuPompa')?.value) || 0,
        'CT_SA_Fan': parseInt(document.getElementById('ctSaFan')?.value) || 0,
        'CT_SA_Pompa': parseInt(document.getElementById('ctSaPompa')?.value) || 0,
        
        'Kegiatan_Shift': document.getElementById('kegiatanShift')?.value || ''
    };
    
    try {
        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(balancingData)
        });
        
        showCustomAlert('✓ Data Balancing berhasil dikirim!', 'success');
        
        let balancingHistory = JSON.parse(localStorage.getItem('balancing_history') || '[]');
        balancingHistory.push({
            ...balancingData,
            submittedAt: new Date().toISOString()
        });
        localStorage.setItem('balancing_history', JSON.stringify(balancingHistory));
        
        setTimeout(() => {
            navigateTo('homeScreen');
        }, 2000);
        
    } catch (error) {
        console.error('Balancing Error:', error);
        
        let offlineBalancing = JSON.parse(localStorage.getItem('balancing_offline') || '[]');
        offlineBalancing.push(balancingData);
        localStorage.setItem('balancing_offline', JSON.stringify(offlineBalancing));
        
        showCustomAlert('Gagal mengirim. Data disimpan lokal.', 'error');
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

// ============================================
// KEYBOARD EVENTS
// ============================================
document.addEventListener('keydown', (e) => {
    const paramScreen = document.getElementById('paramScreen');
    if (!paramScreen || !paramScreen.classList.contains('active')) return;
    
    if (e.key === 'Enter') {
        e.preventDefault();
        if (currentInputType !== 'select') saveStep();
    } else if (e.key === 'Escape') {
        goBack();
    }
});
