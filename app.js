// ============================================
// TURBINE LOGSHEET PRO - VERSION CONTROL
// ============================================
const APP_VERSION = '1.1.1';

// ============================================
// AUTHENTICATION SYSTEM
// ============================================
const AUTH_CONFIG = {
    SESSION_KEY: 'turbine_session',
    USER_KEY: 'turbine_user',
    SESSION_DURATION: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
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

/**
 * Initialize authentication on app load
 */
function initAuth() {
    const session = getSession();
    
    if (session && isSessionValid(session)) {
        // Auto-login with existing session
        currentUser = session.user;
        isAuthenticated = true;
        updateUIForAuthenticatedUser();
        
        // Check if we need to redirect from login screen
        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen && loginScreen.classList.contains('active')) {
            navigateTo('homeScreen');
        }
    } else {
        // Clear invalid session and show login
        clearSession();
        showLoginScreen();
    }
}

/**
 * Get current session from storage
 */
function getSession() {
    try {
        const sessionData = localStorage.getItem(AUTH_CONFIG.SESSION_KEY);
        return sessionData ? JSON.parse(sessionData) : null;
    } catch (e) {
        console.error('Error reading session:', e);
        return null;
    }
}

/**
 * Save session to storage
 */
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

/**
 * Check if session is still valid
 */
function isSessionValid(session) {
    if (!session || !session.expiresAt) return false;
    return Date.now() < session.expiresAt;
}

/**
 * Clear session from storage
 */
function clearSession() {
    localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    currentUser = null;
    isAuthenticated = false;
}

/**
 * Handle operator login
 */
function loginOperator() {
    const nameInput = document.getElementById('operatorName');
    const errorMsg = document.getElementById('loginError');
    const rememberCheckbox = document.getElementById('rememberMe'); // Optional checkbox
    
    if (!nameInput) {
        console.error('Login input not found');
        return;
    }
    
    const operatorName = nameInput.value.trim();
    
    // Validation
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
    
    // Clear error state
    if (errorMsg) errorMsg.style.display = 'none';
    nameInput.classList.remove('error');
    
    // Create user object
    const user = {
        name: operatorName,
        id: 'OP-' + Date.now().toString(36).toUpperCase(),
        loginTime: new Date().toISOString(),
        role: 'operator'
    };
    
    // Save session
    const rememberMe = rememberCheckbox ? rememberCheckbox.checked : false;
    saveSession(user, rememberMe);
    currentUser = user;
    isAuthenticated = true;
    
    // Show success animation
    showCustomAlert(`Selamat datang, ${operatorName}!`, 'success');
    
    // Update UI and navigate
    setTimeout(() => {
        updateUIForAuthenticatedUser();
        navigateTo('homeScreen');
        loadUserStats();
    }, 800);
}

/**
 * Handle operator logout
 */
function logoutOperator() {
    // Confirm logout
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        // Save any pending data before logout
        if (Object.keys(currentInput).length > 0) {
            localStorage.setItem('draft_turbine_backup', JSON.stringify(currentInput));
        }
        
        clearSession();
        
        // Reset UI
        const nameInput = document.getElementById('operatorName');
        if (nameInput) nameInput.value = '';
        
        showLoginScreen();
        showCustomAlert('Anda telah keluar dari sistem.', 'success');
    }
}

/**
 * Show login screen
 */
function showLoginScreen() {
    navigateTo('loginScreen');
    
    // Check for saved username
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

/**
 * Update all UI elements for authenticated user
 */
function updateUIForAuthenticatedUser() {
    if (!currentUser) return;
    
    // Update all user name displays
    const userElements = [
        'displayUserName',
        'tpmHeaderUser',
        'tpmInputUser',
        'areaListUser',
        'paramUser'
    ];
    
    userElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = currentUser.name;
    });
}

/**
 * Check authentication status (call before protected actions)
 */
function requireAuth() {
    if (!isAuthenticated || !isSessionValid(getSession())) {
        clearSession();
        showLoginScreen();
        showCustomAlert('Sesi Anda telah berakhir. Silakan login kembali.', 'error');
        return false;
    }
    return true;
}

/**
 * Load user statistics
 */
function loadUserStats() {
    // Calculate user's progress
    const totalAreas = Object.keys(AREAS).length;
    let completedAreas = 0;
    
    Object.entries(AREAS).forEach(([areaName, params]) => {
        const filled = currentInput[areaName] ? Object.keys(currentInput[areaName]).length : 0;
        if (filled === params.length && filled > 0) completedAreas++;
    });
    
    // Update stats display
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
const GAS_URL = "https://script.google.com/macros/s/AKfycbz30vHFmRl3MVX-kt8XiUxowhqX1rx0fTYCiGQoKo3e_w5DdblfyP6kU-UKbjMSx3_R/exec";

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

// ============================================
// INITIALIZATION
// ============================================
window.addEventListener('DOMContentLoaded', () => {
    totalParams = Object.values(AREAS).reduce((acc, arr) => acc + arr.length, 0);
    
    const versionDisplay = document.getElementById('versionDisplay');
    if (versionDisplay) {
        versionDisplay.textContent = APP_VERSION;
    }
    
    // Initialize auth system
    initAuth();
    
    // Setup login input listeners
    setupLoginListeners();
    
    simulateLoading();
});

function setupLoginListeners() {
    const nameInput = document.getElementById('operatorName');
    if (nameInput) {
        // Remove error state on input
        nameInput.addEventListener('input', () => {
            nameInput.classList.remove('error');
            const errorMsg = document.getElementById('loginError');
            if (errorMsg) errorMsg.style.display = 'none';
        });
        
        // Allow Enter key to submit
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loginOperator();
            }
        });
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
                
                // Only render menu if authenticated, otherwise stay on login
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
    
    alertTitle.textContent = type === 'success' ? 'Berhasil' : 'Error';
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
    // Check auth for protected screens
    const protectedScreens = ['homeScreen', 'areaListScreen', 'paramScreen', 'tpmScreen', 'tpmInputScreen'];
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
        if (screenId === 'areaListScreen') {
            fetchLastData();
            updateOverallProgress();
        } else if (screenId === 'homeScreen') {
            loadUserStats();
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
    const statusPill = document.getElementById('statusPill');
    if (!statusPill) return;
    const statusText = statusPill.querySelector('.status-text');
    
    if (isOnline) {
        statusPill.className = 'status-indicator online';
        if (statusText) statusText.textContent = 'Online';
    } else {
        statusPill.className = 'status-indicator offline';
        if (statusText) statusText.textContent = 'Offline';
    }
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

async function sendToSheet() {
    if (!requireAuth()) return;
    
    const loader = document.getElementById('loader');
    const loaderText = document.querySelector('.loader-text h3');
    
    if (loader) loader.style.display = 'flex';
    if (loaderText) loaderText.textContent = 'Mengirim Data...';
    
    // Add user info to data
    const finalData = {
        operator: currentUser ? currentUser.name : 'Unknown',
        operatorId: currentUser ? currentUser.id : 'Unknown',
        timestamp: new Date().toISOString(),
        ...Object.values(currentInput).reduce((acc, obj) => Object.assign(acc, obj), {})
    };
    
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
    if (!requireAuth()) return;
    
    activeTPMArea = areaName;
    currentTPMPhoto = null;
    currentTPMStatus = '';
    
    // Reset form
    const preview = document.getElementById('tpmPhotoPreview');
    if (preview) {
        preview.innerHTML = '<span style="color: var(--text-muted); font-size: 3rem;">📷</span>';
        preview.closest('.tpm-photo-section').classList.remove('has-photo');
    }
    
    const notes = document.getElementById('tpmNotes');
    if (notes) notes.value = '';
    
    const action = document.getElementById('tpmAction');
    if (action) action.value = '';
    
    // Reset status buttons
    document.querySelectorAll('.tpm-status-btn').forEach(btn => {
        btn.className = 'tpm-status-btn';
    });
    
    // Set title
    const title = document.getElementById('tpmInputTitle');
    if (title) title.textContent = areaName;
    
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
        if (preview) {
            preview.innerHTML = `<img src="${currentTPMPhoto}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-md);">`;
            preview.closest('.tpm-photo-section').classList.add('has-photo');
        }
        showCustomAlert('Foto berhasil diambil!', 'success');
    };
    reader.readAsDataURL(file);
}

function selectTPMStatus(status) {
    currentTPMStatus = status;
    
    // Reset all buttons
    const btnNormal = document.getElementById('btnNormal');
    const btnAbnormal = document.getElementById('btnAbnormal');
    const btnOff = document.getElementById('btnOff');
    
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
    
    // Warning if abnormal/off without photo
    if ((status === 'abnormal' || status === 'off') && !currentTPMPhoto) {
        setTimeout(() => {
            showCustomAlert('⚠️ Kondisi abnormal/off wajib didokumentasikan dengan foto!', 'error');
        }, 100);
    }
}

async function submitTPMData() {
    if (!requireAuth()) return;
    
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
    const loaderText = document.querySelector('.loader-text h3');
    const loaderDesc = document.querySelector('.loader-text p');
    
    if (loader) loader.style.display = 'flex';
    if (loaderText) loaderText.textContent = 'Mengupload TPM...';
    if (loaderDesc) loaderDesc.textContent = 'Sedang mengupload foto ke Google Drive...';
    
    // Prepare data with user info
    const tpmData = {
        type: 'TPM',
        area: activeTPMArea,
        status: currentTPMStatus,
        notes: notes,
        action: action,
        photo: currentTPMPhoto,
        operator: currentUser ? currentUser.name : 'Unknown',
        operatorId: currentUser ? currentUser.id : 'Unknown',
        timestamp: new Date().toISOString()
    };
    
    try {
        const response = await fetch(GAS_URL, {
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
        
        showCustomAlert(`✓ Data TPM ${activeTPMArea} berhasil disimpan! Foto tersimpan di Google Drive.`, 'success');
        
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
    const paramScreen = document.getElementById('paramScreen');
    if (!paramScreen || !paramScreen.classList.contains('active')) return;
    
    if (e.key === 'Enter') {
        e.preventDefault();
        if (currentInputType !== 'select') saveStep();
    } else if (e.key === 'Escape') {
        goBack();
    }
});
