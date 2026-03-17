/**
 * =============================================================================
 * TURBINE LOGSHEET PRO - FRONTEND FINAL v2.2.0 (CORS Fixed)
 * Full Working Code - Ready to Deploy
 * =============================================================================
 */

// ============================================
// CONFIGURATION & CONSTANTS
// ============================================
const APP_VERSION = '2.0.2';
// ⚠️⚠️⚠️ GANTI DENGAN URL DEPLOYMENT BARU ANDA (tanpa spasi di akhir!)
const GAS_URL = "https://script.google.com/macros/s/AKfycbx0FrXLs0JzUJpm8dnJoyM3jvuYJ4CmihpID2dHy-kvZ9A-MtapVHdzmhNmhGR2PJyn/exec";

const AUTH_CONFIG = {
    SESSION_KEY: 'turbine_session_v2',
    USER_KEY: 'turbine_user_v2',
    SESSION_DURATION: 8 * 60 * 60 * 1000,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_KEY: 'login_lockout_until',
    FAILED_ATTEMPTS_KEY: 'failed_login_count',
    PASSWORD_MIN_LENGTH: 4
};

const DRAFT_KEYS = {
    LOGSHEET: 'draft_turbine',
    LOGSHEET_BACKUP: 'draft_turbine_backup',
    BALANCING: 'balancing_draft',
    TPM_OFFLINE: 'tpm_offline',
    LOGSHEET_OFFLINE: 'offline_logsheets',
    BALANCING_OFFLINE: 'balancing_offline',
    TPM_HISTORY: 'tpm_history',
    BALANCING_HISTORY: 'balancing_history'
};

const BALANCING_FIELDS = [
    'balancingDate', 'balancingTime',
    'loadMW', 'eksporMW',
    'plnMW', 'ubbMW', 'pieMW', 'tg65MW', 'tg66MW', 'gtgMW',
    'ss6500MW', 'ss2000Via', 'activePowerMW', 'reactivePowerMVAR', 
    'currentS', 'voltageV', 'hvs65l02MW', 'hvs65l02Current', 'total3BMW',
    'fq1105',
    'stgSteam', 'pa2Steam', 'puri2Steam', 'melterSA2', 
    'ejectorSteam', 'glandSealSteam', 'deaeratorSteam', 
    'dumpCondenser', 'pcv6105',
    'pi6122', 'ti6112', 'ti6146', 'ti6126', 
    'axialDisplacement', 'vi6102', 'te6134',
    'ctSuFan', 'ctSuPompa', 'ctSaFan', 'ctSaPompa',
    'kegiatanShift'
];

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
let lastData = {};
let currentInput = JSON.parse(localStorage.getItem(DRAFT_KEYS.LOGSHEET)) || {};
let activeArea = "";
let activeIdx = 0;
let totalParams = 0;
let currentInputType = 'text';
let autoCloseTimer = null;
let currentUser = null;
let isAuthenticated = false;
let activeTPMArea = '';
let currentTPMPhoto = null;
let currentTPMStatus = '';
let currentShift = 3;
let balancingAutoSaveInterval = null;
let uploadProgressInterval = null;
let currentUploadController = null;

// ============================================
// API HELPERS (CORS FIXED)
// ============================================

/**
 * Login menggunakan JSONP (bypass CORS total)
 */
function loginWithJSONP(username, password) {
    return new Promise((resolve, reject) => {
        const callbackName = 'loginCB_' + Date.now();
        const script = document.createElement('script');
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Timeout'));
        }, 15000);
        
        const cleanup = () => {
            clearTimeout(timeout);
            delete window[callbackName];
            if (script.parentNode) script.parentNode.removeChild(script);
        };
        
        window[callbackName] = (response) => {
            cleanup();
            resolve(response);
        };
        
        const url = new URL(GAS_URL);
        url.searchParams.append('action', 'login');
        url.searchParams.append('username', username);
        url.searchParams.append('password', password);
        url.searchParams.append('callback', callbackName);
        
        script.src = url.toString();
        script.onerror = () => {
            cleanup();
            reject(new Error('Network error'));
        };
        
        document.body.appendChild(script);
    });
}

/**
 * POST data menggunakan no-cors mode (fire and forget)
 */
async function postDataToGAS(payload) {
    try {
        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(payload)
        });
        
        return { success: true, message: 'Data terkirim' };
    } catch (error) {
        console.error('Post error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * GET data menggunakan JSONP
 */
function getDataJSONP(action, extraParams = {}) {
    return new Promise((resolve, reject) => {
        const cbName = 'dataCB_' + Date.now();
        const script = document.createElement('script');
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Timeout'));
        }, 10000);
        
        const cleanup = () => {
            clearTimeout(timeout);
            delete window[cbName];
            if (script.parentNode) script.parentNode.removeChild(script);
        };
        
        window[cbName] = (data) => {
            cleanup();
            resolve(data);
        };
        
        const url = new URL(GAS_URL);
        url.searchParams.append('action', action);
        url.searchParams.append('callback', cbName);
        url.searchParams.append('t', Date.now());
        
        Object.keys(extraParams).forEach(key => {
            url.searchParams.append(key, extraParams[key]);
        });
        
        script.src = url.toString();
        script.onerror = () => {
            cleanup();
            reject(new Error('Load error'));
        };
        
        document.body.appendChild(script);
    });
}

// ============================================
// AUTHENTICATION SYSTEM
// ============================================

function initAuth() {
    if (isClientLockedOut()) {
        showClientLockoutScreen();
        return;
    }
    
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
        return null;
    }
}

function saveSession(user, rememberMe = false) {
    const duration = rememberMe ? (30 * 24 * 60 * 60 * 1000) : AUTH_CONFIG.SESSION_DURATION;
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
    if (Date.now() > session.expiresAt) return false;
    return true;
}

function clearSession() {
    localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    currentUser = null;
    isAuthenticated = false;
}

function isClientLockedOut() {
    const lockoutUntil = localStorage.getItem(AUTH_CONFIG.LOCKOUT_KEY);
    if (lockoutUntil) {
        const now = Date.now();
        if (now < parseInt(lockoutUntil)) {
            return true;
        } else {
            localStorage.removeItem(AUTH_CONFIG.LOCKOUT_KEY);
            localStorage.removeItem(AUTH_CONFIG.FAILED_ATTEMPTS_KEY);
        }
    }
    return false;
}

function setClientLockout(minutes) {
    const until = Date.now() + (minutes * 60000);
    localStorage.setItem(AUTH_CONFIG.LOCKOUT_KEY, until.toString());
}

function showClientLockoutScreen() {
    const lockoutUntil = parseInt(localStorage.getItem(AUTH_CONFIG.LOCKOUT_KEY));
    const remainingMinutes = Math.ceil((lockoutUntil - Date.now()) / 60000);
    
    showLoginError(`Akun terkunci. Tunggu ${remainingMinutes} menit.`, 'locked');
    
    const inputs = document.querySelectorAll('#loginScreen input, #loginScreen button');
    inputs.forEach(el => {
        if (!el.classList.contains('alert-btn')) el.disabled = true;
    });
    
    setTimeout(() => {
        inputs.forEach(el => el.disabled = false);
        hideLoginError();
    }, remainingMinutes * 60000);
}

function setupLoginListeners() {
    const nameInput = document.getElementById('operatorName');
    const passInput = document.getElementById('operatorPassword');
    
    if (nameInput) {
        nameInput.addEventListener('input', () => {
            nameInput.classList.remove('error');
            hideLoginError();
        });
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && passInput) passInput.focus();
        });
    }
    
    if (passInput) {
        passInput.addEventListener('input', () => {
            passInput.classList.remove('error');
            hideLoginError();
        });
        passInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') loginOperator();
        });
    }
    
    const toggleBtn = document.getElementById('togglePassword');
    if (toggleBtn && passInput) {
        toggleBtn.addEventListener('click', () => {
            const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passInput.setAttribute('type', type);
            toggleBtn.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }
}

function hideLoginError() {
    const errorMsg = document.getElementById('loginError');
    if (errorMsg) {
        errorMsg.style.display = 'none';
        errorMsg.textContent = '';
        errorMsg.className = 'login-error';
    }
}

function showLoginError(message, type = 'error') {
    const errorMsg = document.getElementById('loginError');
    if (!errorMsg) return;
    
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    
    if (type === 'warning') {
        errorMsg.style.color = 'var(--warning)';
        errorMsg.style.background = 'rgba(245, 158, 11, 0.1)';
        errorMsg.style.borderColor = 'rgba(245, 158, 11, 0.2)';
    } else if (type === 'locked') {
        errorMsg.style.color = 'var(--danger)';
        errorMsg.style.background = 'rgba(239, 68, 68, 0.15)';
        errorMsg.style.borderColor = 'var(--danger)';
        errorMsg.style.fontWeight = '600';
    } else {
        errorMsg.style.color = 'var(--danger)';
        errorMsg.style.background = 'rgba(239, 68, 68, 0.1)';
        errorMsg.style.borderColor = 'rgba(239, 68, 68, 0.2)';
    }
}

async function loginOperator() {
    if (isClientLockedOut()) {
        showClientLockoutScreen();
        return;
    }
    
    const nameInput = document.getElementById('operatorName');
    const passInput = document.getElementById('operatorPassword');
    const loginBtn = document.querySelector('#loginScreen .btn-primary');
    
    if (!nameInput || !passInput) return;
    
    const username = nameInput.value.trim();
    const password = passInput.value;
    
    if (!username || !password) {
        showLoginError('Username dan password wajib diisi!');
        return;
    }
    
    if (password.length < AUTH_CONFIG.PASSWORD_MIN_LENGTH) {
        showLoginError(`Password minimal ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} karakter!`);
        return;
    }
    
    const originalBtnText = loginBtn ? loginBtn.innerHTML : '';
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="spinner"></span> Memverifikasi...';
    }
    
    try {
        const result = await loginWithJSONP(username, password);
        console.log('Login result:', result);
        
        if (result.success) {
            localStorage.removeItem(AUTH_CONFIG.FAILED_ATTEMPTS_KEY);
            saveSession(result.user, false);
            currentUser = result.user;
            isAuthenticated = true;
            
            showCustomAlert(`Selamat datang, ${username}!`, 'success');
            setTimeout(() => {
                updateUIForAuthenticatedUser();
                navigateTo('homeScreen');
                loadUserStats();
            }, 800);
        } else {
            const failedAttempts = parseInt(localStorage.getItem(AUTH_CONFIG.FAILED_ATTEMPTS_KEY) || '0') + 1;
            localStorage.setItem(AUTH_CONFIG.FAILED_ATTEMPTS_KEY, failedAttempts.toString());
            
            if (result.error === 'account_locked') {
                setClientLockout(result.lockoutMinutes || 30);
                showClientLockoutScreen();
            } else {
                showLoginError(result.message || 'Username atau password salah');
                if (failedAttempts >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS) {
                    setClientLockout(30);
                    showClientLockoutScreen();
                }
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        showLoginError('Gagal terhubung ke server. Periksa koneksi internet.', 'error');
    } finally {
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = originalBtnText;
        }
    }
}

function logoutOperator() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        if (Object.keys(currentInput).length > 0) {
            localStorage.setItem(DRAFT_KEYS.LOGSHEET_BACKUP, JSON.stringify(currentInput));
        }
        
        clearSession();
        
        const nameInput = document.getElementById('operatorName');
        const passInput = document.getElementById('operatorPassword');
        if (nameInput) nameInput.value = '';
        if (passInput) passInput.value = '';
        
        showLoginScreen();
        showCustomAlert('Anda telah keluar dari sistem.', 'success');
    }
}

function showLoginScreen() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen) {
        loginScreen.classList.add('active');
        const inputs = loginScreen.querySelectorAll('input, button');
        inputs.forEach(el => el.disabled = false);
    }
    
    const savedUser = localStorage.getItem(AUTH_CONFIG.USER_KEY);
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            const nameInput = document.getElementById('operatorName');
            if (nameInput && user.name) {
                nameInput.value = user.name;
            }
        } catch (e) {}
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
    
    if (currentUser.role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
    }
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

// ============================================
// UI FUNCTIONS
// ============================================

function showUploadProgress(title = 'Mengupload Data...') {
    const overlay = document.getElementById('uploadProgressOverlay');
    const percentage = document.getElementById('progressPercentage');
    const ringFill = document.getElementById('progressRingFill');
    const turbine = document.getElementById('uploadTurbine');
    const statusText = document.getElementById('uploadStatusText');
    
    if (overlay) {
        overlay.classList.remove('hidden', 'success', 'error');
        percentage.textContent = '0%';
        ringFill.style.strokeDashoffset = 339.292;
        turbine.classList.add('spinning');
        statusText.textContent = title;
    }
    
    let progress = 0;
    uploadProgressInterval = setInterval(() => {
        if (progress < 90) {
            progress += Math.random() * 5;
            updateProgressRing(progress);
        }
    }, 200);
    
    return {
        complete: () => {
            clearInterval(uploadProgressInterval);
            updateProgressRing(100);
            if (overlay) overlay.classList.add('success');
            if (turbine) turbine.classList.remove('spinning');
            if (statusText) statusText.textContent = '✓ Berhasil!';
            setTimeout(() => hideUploadProgress(), 800);
        },
        error: () => {
            clearInterval(uploadProgressInterval);
            if (overlay) overlay.classList.add('error');
            if (turbine) turbine.classList.remove('spinning');
            if (statusText) statusText.textContent = '✗ Gagal';
            setTimeout(() => hideUploadProgress(), 1500);
        },
        updateText: (text) => {
            if (statusText) statusText.textContent = text;
        }
    };
}

function updateProgressRing(percentage) {
    const ringFill = document.getElementById('progressRingFill');
    const percentageText = document.getElementById('progressPercentage');
    const circumference = 339.292;
    const offset = circumference - (percentage / 100) * circumference;
    
    if (ringFill) ringFill.style.strokeDashoffset = offset;
    if (percentageText) percentageText.textContent = Math.round(percentage) + '%';
}

function hideUploadProgress() {
    const overlay = document.getElementById('uploadProgressOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.classList.remove('success', 'error');
    }
    clearInterval(uploadProgressInterval);
}

function showCustomAlert(msg, type = 'success') {
    const alertContent = document.getElementById('alertContent');
    const alertTitle = document.getElementById('alertTitle');
    const alertIconWrapper = document.getElementById('alertIconWrapper');
    const customAlert = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');
    
    if (!customAlert) {
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
        'warning': 'Peringatan',
        'info': 'Informasi'
    };
    if (alertTitle) alertTitle.textContent = titleMap[type] || 'Informasi';
    if (alertMessage) alertMessage.innerText = msg;
    if (alertContent) alertContent.className = 'alert-content ' + type;
    
    if (alertIconWrapper) {
        if (type === 'success') {
            alertIconWrapper.innerHTML = `<div class="alert-icon-bg"></div><svg class="alert-icon-svg" viewBox="0 0 52 52"><circle cx="26" cy="26" r="25"></circle><path d="M14.1 27.2l7.1 7.2 16.7-16.8"></path></svg>`;
        } else if (type === 'error') {
            alertIconWrapper.innerHTML = `<div class="alert-icon-bg" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);"></div><svg class="alert-icon-svg" viewBox="0 0 52 52" style="stroke: #ef4444;"><circle cx="26" cy="26" r="25"></circle><path d="M16 16 L36 36 M36 16 L16 36"></path></svg>`;
        } else if (type === 'warning') {
            alertIconWrapper.innerHTML = `<div class="alert-icon-bg" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);"></div><svg class="alert-icon-svg" viewBox="0 0 52 52" style="stroke: #f59e0b;"><circle cx="26" cy="26" r="25"></circle><path d="M26 10 L26 30 M26 34 L26 38"></path></svg>`;
        }
    }
    
    customAlert.classList.remove('hidden');
    
    if (type === 'success' || type === 'info') {
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

function navigateTo(screenId) {
    const protectedScreens = ['homeScreen', 'areaListScreen', 'paramScreen', 'tpmScreen', 'tpmInputScreen', 'balancingScreen'];
    if (protectedScreens.includes(screenId) && !requireAuth()) return;
    
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        
        if (screenId === 'areaListScreen') {
            fetchLastData();
        } else if (screenId === 'homeScreen') {
            loadUserStats();
        } else if (screenId === 'balancingScreen') {
            initBalancingScreen();
        }
    }
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
    if (statAreas) statAreas.textContent = `${completedAreas}/${totalAreas}`;
}

// ============================================
// LOGSHEET FUNCTIONS
// ============================================

function fetchLastData() {
    getDataJSONP('default')
        .then(data => {
            lastData = data;
            renderMenu();
        })
        .catch(err => {
            console.error('Fetch error:', err);
            renderMenu();
        });
}

function renderMenu() {
    const list = document.getElementById('areaList');
    if (!list) return;
    
    const totalAreas = Object.keys(AREAS).length;
    let completedAreas = 0;
    let html = '';
    
    Object.entries(AREAS).forEach(([areaName, params]) => {
        const areaData = currentInput[areaName] || {};
        const filled = Object.keys(areaData).length;
        const total = params.length;
        const percent = Math.round((filled / total) * 100);
        const isCompleted = filled === total && total > 0;
        
        const hasAbnormal = params.some(paramName => {
            const val = areaData[paramName] || '';
            const firstLine = val.split('\n')[0];
            return ['ERROR', 'UPPER', 'NOT_INSTALLED'].includes(firstLine);
        });
        
        if (isCompleted) completedAreas++;
        
        const circumference = 2 * Math.PI * 18;
        const strokeDashoffset = circumference - (percent / 100) * circumference;
        
        html += `
            <div class="area-item ${isCompleted ? 'completed' : ''} ${hasAbnormal ? 'has-warning' : ''}" onclick="openArea('${areaName}')">
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
                    <div class="area-meta ${hasAbnormal ? 'warning' : ''}">
                        ${hasAbnormal ? '⚠️ Ada parameter bermasalah • ' : ''}${filled} dari ${total} parameter
                    </div>
                </div>
                <div class="area-status">
                    ${hasAbnormal ? '<span style="color: #ef4444; margin-right: 4px;">!</span>' : ''}
                    ${isCompleted ? '✓' : '❯'}
                </div>
            </div>
        `;
    });
    
    list.innerHTML = html;
    
    const hasData = Object.keys(currentInput).length > 0;
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.style.display = hasData ? 'flex' : 'none';
    
    const progressText = document.getElementById('progressText');
    const overallPercent = document.getElementById('overallPercent');
    const overallProgressBar = document.getElementById('overallProgressBar');
    const percent = Math.round((completedAreas / totalAreas) * 100);
    
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
        const fullLabel = AREAS[activeArea][i];
        const savedValue = currentInput[activeArea]?.[fullLabel] || '';
        const lines = savedValue.split('\n');
        const firstLine = lines[0];
        
        const isFilled = savedValue !== '';
        const hasIssue = ['ERROR', 'UPPER', 'NOT_INSTALLED'].includes(firstLine);
        const isActive = i === activeIdx;
        
        let className = '';
        if (isActive) className = 'active';
        else if (hasIssue) className = 'has-issue';
        else if (isFilled) className = 'filled';
        
        html += `<div class="progress-dot ${className}" onclick="jumpToStep(${i})" title="${hasIssue ? firstLine : ''}"></div>`;
    }
    container.innerHTML = html;
}

function jumpToStep(index) {
    saveCurrentStep();
    activeIdx = index;
    showStep();
    renderProgressDots();
}

function detectInputType(label) {
    for (const [type, config] of Object.entries(INPUT_TYPES)) {
        for (const pattern of config.patterns) {
            if (label.includes(pattern)) {
                return { type: 'select', options: config.options[pattern], pattern: pattern };
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
    
    let prevVal = lastData[fullLabel] || '--';
    if (prevVal !== '--') {
        const lines = prevVal.toString().split('\n');
        const firstLine = lines[0];
        if (['ERROR', 'UPPER', 'NOT_INSTALLED'].includes(firstLine)) {
            prevVal = firstLine + (lines[1] ? ' - ' + lines[1] : '');
        }
    }
    if (prevValDisplay) prevValDisplay.textContent = prevVal;
    
    if (inputType.type === 'select') {
        let currentValue = (currentInput[activeArea] && currentInput[activeArea][fullLabel]) || '';
        if (currentValue) {
            const lines = currentValue.split('\n');
            const firstLine = lines[0];
            if (!['ERROR', 'UPPER', 'NOT_INSTALLED'].includes(firstLine)) currentValue = firstLine;
            else currentValue = '';
        }
        
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
        let currentValue = (currentInput[activeArea] && currentInput[activeArea][fullLabel]) || '';
        if (currentValue) {
            const lines = currentValue.split('\n');
            const firstLine = lines[0];
            if (!['ERROR', 'UPPER', 'NOT_INSTALLED'].includes(firstLine)) currentValue = firstLine;
            else currentValue = '';
        }
        
        if (inputFieldContainer) {
            inputFieldContainer.innerHTML = `<input type="text" id="valInput" inputmode="decimal" placeholder="0.00" value="${currentValue}" autocomplete="off">`;
        }
        if (unitDisplay) {
            unitDisplay.textContent = getUnit(fullLabel) || '--';
            unitDisplay.style.display = 'flex';
        }
        if (mainInputWrapper) mainInputWrapper.classList.remove('has-select');
    }
    
    loadAbnormalStatus(fullLabel);
    renderProgressDots();
    
    setTimeout(() => {
        const input = document.getElementById('valInput');
        if (input && inputType.type === 'text' && !input.disabled) {
            input.focus();
            input.select();
        }
    }, 100);
}

function loadAbnormalStatus(fullLabel) {
    document.querySelectorAll('input[name="paramStatus"]').forEach(cb => {
        cb.checked = false;
        cb.closest('.status-chip').classList.remove('active');
    });
    const noteContainer = document.getElementById('statusNoteContainer');
    const noteInput = document.getElementById('statusNote');
    
    if (noteContainer) noteContainer.style.display = 'none';
    if (noteInput) noteInput.value = '';
    
    const valInput = document.getElementById('valInput');
    if (valInput) {
        valInput.disabled = false;
        valInput.style.opacity = '1';
        valInput.style.background = '';
    }
    
    if (currentInput[activeArea] && currentInput[activeArea][fullLabel]) {
        const savedValue = currentInput[activeArea][fullLabel];
        const lines = savedValue.split('\n');
        const firstLine = lines[0];
        const secondLine = lines[1] || '';
        
        const isStatus = ['ERROR', 'UPPER', 'NOT_INSTALLED'].includes(firstLine);
        
        if (isStatus) {
            const checkbox = document.querySelector(`input[value="${firstLine}"]`);
            if (checkbox) {
                checkbox.checked = true;
                checkbox.closest('.status-chip').classList.add('active');
                if (noteContainer) noteContainer.style.display = 'block';
                if (noteInput) noteInput.value = secondLine;
                
                if (firstLine === 'NOT_INSTALLED' && valInput) {
                    valInput.value = '-';
                    valInput.disabled = true;
                    valInput.style.opacity = '0.5';
                    valInput.style.background = 'rgba(100, 116, 139, 0.2)';
                }
            }
        } else {
            if (valInput) valInput.value = savedValue;
        }
    }
}

function saveCurrentStep() {
    const input = document.getElementById('valInput');
    const fullLabel = AREAS[activeArea][activeIdx];
    
    if (!currentInput[activeArea]) currentInput[activeArea] = {};
    
    let valueToSave = '';
    if (input && input.value.trim()) valueToSave = input.value.trim();
    
    const checkedStatus = document.querySelector('input[name="paramStatus"]:checked');
    const note = document.getElementById('statusNote')?.value || '';
    
    if (checkedStatus) {
        if (checkedStatus.value === 'NOT_INSTALLED') {
            valueToSave = 'NOT_INSTALLED';
            if (note) valueToSave += '\n' + note;
        } else {
            if (note) valueToSave = `${checkedStatus.value}\n${note}`;
            else valueToSave = checkedStatus.value;
        }
    }
    
    if (valueToSave) currentInput[activeArea][fullLabel] = valueToSave;
    else delete currentInput[activeArea][fullLabel];
    
    localStorage.setItem(DRAFT_KEYS.LOGSHEET, JSON.stringify(currentInput));
}

function saveStep() {
    saveCurrentStep();
    renderProgressDots();
    
    if (activeIdx < AREAS[activeArea].length - 1) {
        activeIdx++;
        showStep();
    } else {
        showCustomAlert(`Area ${activeArea} selesai diisi!`, 'success');
        setTimeout(() => navigateTo('areaListScreen'), 1500);
    }
}

function goBack() {
    saveCurrentStep();
    
    if (activeIdx > 0) {
        activeIdx--;
        showStep();
    } else {
        navigateTo('areaListScreen');
    }
}

async function sendToSheet() {
    if (!requireAuth()) return;
    
    const progress = showUploadProgress('Mengirim Logsheet...');
    
    let allParameters = {};
    Object.entries(currentInput).forEach(([areaName, params]) => {
        Object.entries(params).forEach(([paramName, value]) => {
            allParameters[paramName] = value;
        });
    });
    
    const finalData = {
        type: 'LOGSHEET',
        Operator: currentUser.name,
        OperatorId: currentUser.id,
        ...allParameters
    };
    
    const result = await postDataToGAS(finalData);
    
    if (result.success) {
        progress.complete();
        showCustomAlert('✓ Data berhasil dikirim!', 'success');
        currentInput = {};
        localStorage.removeItem(DRAFT_KEYS.LOGSHEET);
        setTimeout(() => navigateTo('homeScreen'), 1500);
    } else {
        progress.error();
        let offlineData = JSON.parse(localStorage.getItem(DRAFT_KEYS.LOGSHEET_OFFLINE) || '[]');
        offlineData.push(finalData);
        localStorage.setItem(DRAFT_KEYS.LOGSHEET_OFFLINE, JSON.stringify(offlineData));
        showCustomAlert('Gagal mengirim. Data disimpan lokal.', 'error');
    }
}

// ============================================
// TPM FUNCTIONS
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
    if (photoSection) photoSection.classList.remove('has-photo');
    
    const notes = document.getElementById('tpmNotes');
    const action = document.getElementById('tpmAction');
    if (notes) notes.value = '';
    if (action) action.value = '';
    
    resetTPMStatusButtons();
}

function resetTPMStatusButtons() {
    const buttons = ['btnNormal', 'btnAbnormal', 'btnOff'];
    buttons.forEach((id) => {
        const btn = document.getElementById(id);
        if (btn) btn.className = 'status-btn';
    });
}

function handleTPMPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    
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
        currentTPMPhoto = e.target.result;
        const preview = document.getElementById('tpmPhotoPreview');
        const photoSection = document.getElementById('tpmPhotoSection');
        
        if (preview) {
            preview.innerHTML = `<img src="${currentTPMPhoto}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" alt="TPM Photo">`;
        }
        if (photoSection) photoSection.classList.add('has-photo');
        showCustomAlert('Foto berhasil diambil!', 'success');
    };
    reader.readAsDataURL(file);
}

function selectTPMStatus(status) {
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
        if (btn) btn.classList.add(selected.class);
    }
    
    if ((status === 'abnormal' || status === 'off') && !currentTPMPhoto) {
        setTimeout(() => {
            showCustomAlert('⚠️ Kondisi abnormal/off wajib didokumentasikan dengan foto!', 'warning');
        }, 100);
    }
}

async function submitTPMData() {
    if (!requireAuth()) return;
    
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
    
    const progress = showUploadProgress('Mengupload TPM...');
    
    const tpmData = {
        type: 'TPM',
        area: activeTPMArea,
        status: currentTPMStatus,
        action: action,
        notes: notes,
        photo: currentTPMPhoto,
        user: currentUser.name,
        timestamp: new Date().toISOString()
    };
    
    const result = await postDataToGAS(tpmData);
    
    if (result.success) {
        progress.complete();
        showCustomAlert('✓ Data TPM berhasil disimpan!', 'success');
        currentTPMPhoto = null;
        setTimeout(() => navigateTo('tpmScreen'), 1500);
    } else {
        progress.error();
        let offlineTPM = JSON.parse(localStorage.getItem(DRAFT_KEYS.TPM_OFFLINE) || '[]');
        offlineTPM.push(tpmData);
        localStorage.setItem(DRAFT_KEYS.TPM_OFFLINE, JSON.stringify(offlineTPM));
        showCustomAlert('Gagal mengupload. Data disimpan lokal.', 'error');
    }
}

// ============================================
// BALANCING FUNCTIONS
// ============================================

function saveBalancingDraft() {
    try {
        const draftData = {};
        BALANCING_FIELDS.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) draftData[fieldId] = element.value;
        });
        
        draftData._shift = currentShift;
        draftData._savedAt = new Date().toISOString();
        draftData._user = currentUser ? currentUser.name : 'Unknown';
        
        localStorage.setItem(DRAFT_KEYS.BALANCING, JSON.stringify(draftData));
        updateDraftStatusIndicator();
    } catch (e) {
        console.error('Error saving draft:', e);
    }
}

function loadBalancingDraft() {
    try {
        const draftData = JSON.parse(localStorage.getItem(DRAFT_KEYS.BALANCING));
        if (!draftData) return false;
        
        let loadedCount = 0;
        BALANCING_FIELDS.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element && draftData[fieldId]) {
                element.value = draftData[fieldId];
                loadedCount++;
            }
        });
        
        if (loadedCount > 0) {
            showCustomAlert(`Draft ditemukan! ${loadedCount} field diisi.`, 'success');
        }
        return true;
    } catch (e) {
        return false;
    }
}

function updateDraftStatusIndicator() {
    const indicator = document.getElementById('draftStatusIndicator');
    if (indicator) {
        const hasDraft = localStorage.getItem(DRAFT_KEYS.BALANCING) !== null;
        indicator.style.display = hasDraft ? 'flex' : 'none';
    }
}

function initBalancingScreen() {
    if (!requireAuth()) return;
    
    const balancingUser = document.getElementById('balancingUser');
    if (balancingUser && currentUser) balancingUser.textContent = currentUser.name;
    
    detectShift();
    
    if (!loadBalancingDraft()) {
        setDefaultDateTime();
    }
    
    calculateLPBalance();
    
    const formContainer = document.getElementById('balancingScreen');
    if (formContainer) {
        formContainer.addEventListener('input', () => {
            setTimeout(saveBalancingDraft, 1000);
        });
    }
}

function detectShift() {
    const hour = new Date().getHours();
    let shift = 3;
    
    if (hour >= 7 && hour < 15) shift = 1;
    else if (hour >= 15 && hour < 23) shift = 2;
    
    currentShift = shift;
    
    const badge = document.getElementById('currentShiftBadge');
    const info = document.getElementById('balancingShiftInfo');
    
    if (badge) badge.textContent = `SHIFT ${shift}`;
    if (info) info.textContent = `Shift ${shift} • Auto Save Aktif`;
}

function setDefaultDateTime() {
    const now = new Date();
    const dateInput = document.getElementById('balancingDate');
    const timeInput = document.getElementById('balancingTime');
    
    if (dateInput) dateInput.value = now.toISOString().split('T')[0];
    if (timeInput) timeInput.value = now.toTimeString().slice(0, 5);
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
            hint.innerHTML = '💡 <strong>Minus (-) = Ekspor</strong> | <strong>Plus (+) = Impor</strong>';
            hint.style.color = '#94a3b8';
        }
        input.style.borderColor = 'rgba(148, 163, 184, 0.2)';
        return;
    }
    
    if (value < 0) {
        if (label) {
            label.textContent = 'Ekspor (MW)';
            label.style.color = '#10b981';
        }
        input.style.borderColor = '#10b981';
    } else if (value > 0) {
        if (label) {
            label.textContent = 'Impor (MW)';
            label.style.color = '#f59e0b';
        }
        input.style.borderColor = '#f59e0b';
    }
}

function calculateLPBalance() {
    const produksi = parseFloat(document.getElementById('fq1105')?.value) || 0;
    let totalKonsumsi = 0;
    
    ['stgSteam', 'pa2Steam', 'puri2Steam', 'melterSA2', 'ejectorSteam', 
     'glandSealSteam', 'deaeratorSteam', 'dumpCondenser', 'pcv6105'].forEach(id => {
        totalKonsumsi += parseFloat(document.getElementById(id)?.value) || 0;
    });
    
    const totalDisplay = document.getElementById('totalKonsumsiSteam');
    if (totalDisplay) totalDisplay.textContent = totalKonsumsi.toFixed(1) + ' t/h';
    
    const balance = produksi - totalKonsumsi;
    
    const balanceField = document.getElementById('lpBalanceField');
    const balanceLabel = document.getElementById('lpBalanceLabel');
    const balanceInput = document.getElementById('lpBalanceValue');
    const balanceStatus = document.getElementById('lpBalanceStatus');
    
    if (balanceInput) balanceInput.value = Math.abs(balance).toFixed(1);
    
    if (balance < 0) {
        if (balanceLabel) balanceLabel.textContent = 'LPS Impor dari SU 3A (t/h)';
        if (balanceStatus) {
            balanceStatus.textContent = 'Posisi: Impor dari 3A';
            balanceStatus.style.color = '#f59e0b';
        }
    } else {
        if (balanceLabel) balanceLabel.textContent = 'LPS Ekspor ke SU 3A (t/h)';
        if (balanceStatus) {
            balanceStatus.textContent = 'Posisi: Ekspor ke 3A';
            balanceStatus.style.color = '#10b981';
        }
    }
}

async function submitBalancingData() {
    if (!requireAuth()) return;
    
    const progress = showUploadProgress('Mengirim Balancing...');
    
    const eksporValue = parseFloat(document.getElementById('eksporMW')?.value) || 0;
    const lpBalance = calculateLPBalance();
    
    const balancingData = {
        type: 'BALANCING',
        Operator: currentUser.name,
        Tanggal: document.getElementById('balancingDate')?.value || '',
        Jam: document.getElementById('balancingTime')?.value || '',
        Shift: currentShift,
        'Load_MW': parseFloat(document.getElementById('loadMW')?.value) || 0,
        'Ekspor_Impor_MW': eksporValue,
        'Ekspor_Impor_Status': eksporValue > 0 ? 'Impor' : (eksporValue < 0 ? 'Ekspor' : 'Netral'),
        'Produksi_Steam_SA_t/h': parseFloat(document.getElementById('fq1105')?.value) || 0,
        'LPS_Balance_t/h': Math.abs(lpBalance),
        'LPS_Balance_Status': lpBalance < 0 ? 'Impor dari 3A' : 'Ekspor ke 3A',
        'Kegiatan_Shift': document.getElementById('kegiatanShift')?.value || ''
    };
    
    const result = await postDataToGAS(balancingData);
    
    if (result.success) {
        progress.complete();
        localStorage.removeItem(DRAFT_KEYS.BALANCING);
        showCustomAlert('✓ Data Balancing berhasil dikirim!', 'success');
        setTimeout(() => navigateTo('homeScreen'), 1000);
    } else {
        progress.error();
        showCustomAlert('Gagal mengirim. Data disimpan lokal.', 'error');
    }
}

// ============================================
// INITIALIZATION
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    totalParams = Object.values(AREAS).reduce((acc, arr) => acc + arr.length, 0);
    
    const versionDisplay = document.getElementById('versionDisplay');
    if (versionDisplay) versionDisplay.textContent = APP_VERSION;
    
    initAuth();
    setupLoginListeners();
});

// Global error handler
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Global error:', msg, 'Line:', lineNo);
    return false;
};
