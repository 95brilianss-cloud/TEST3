// ============================================
// TURBINE LOGSHEET PRO - v1.1.0
// Dengan Sistem Login Operator
// ============================================

const APP_VERSION = '1.0.7';
const GAS_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

// State
let currentUser = localStorage.getItem('current_operator') || '';
let lastData = {};
let currentInput = JSON.parse(localStorage.getItem('draft_turbine')) || {};
let activeArea = "", activeIdx = 0, totalParams = 0, currentInputType = 'text';
let activeTPMArea = '', currentTPMPhoto = null, currentTPMStatus = '';

// ============================================
// LOGIN SYSTEM
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    totalParams = Object.values(AREAS).reduce((acc, arr) => acc + arr.length, 0);
    
    // Cek apakah sudah login
    if (currentUser) {
        updateUserDisplay();
        showScreen('homeScreen');
        simulateLoading();
    } else {
        showScreen('loginScreen');
    }
});

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
    
    // Simpan user
    currentUser = name;
    localStorage.setItem('current_operator', name);
    
    // Update UI
    updateUserDisplay();
    
    // Go to home
    showScreen('homeScreen');
    simulateLoading();
    
    // Clear input untuk keamanan
    input.value = '';
}

function logoutOperator() {
    if (confirm('Yakin ingin keluar dan ganti operator?')) {
        localStorage.removeItem('current_operator');
        localStorage.removeItem('draft_turbine'); // Optional: clear draft
        currentUser = '';
        location.reload();
    }
}

function updateUserDisplay() {
    const elements = ['displayUserName', 'headerUserName', 'tpmUserName', 'paramUserName'];
    elements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = currentUser;
    });
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
        if (screenId === 'areaListScreen') {
            fetchLastData();
            updateOverallProgress();
        }
    }
}

// Alias untuk kompatibilitas
function navigateTo(screenId) {
    showScreen(screenId);
}

// ============================================
// CORE FUNCTIONS (Logsheet & TPM)
// ============================================

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
                renderMenu();
            }, 500);
        }
        if (loaderProgress) loaderProgress.style.width = progress + '%';
    }, 300);
}

// ... (sisipkan fungsi-fungsi Logsheet yang sudah ada sebelumnya: fetchLastData, renderMenu, openArea, showStep, saveStep, dll)

// ============================================
// TPM FUNCTIONS
// ============================================

function openTPMArea(areaName) {
    activeTPMArea = areaName;
    currentTPMPhoto = null;
    currentTPMStatus = '';
    
    // Reset form
    const preview = document.getElementById('tpmPhotoPreview');
    if (preview) {
        preview.innerHTML = '<span style="color: var(--text-muted); font-size: 3rem;">📷</span>';
        preview.closest('.tpm-photo-section')?.classList.remove('has-photo');
    }
    
    document.getElementById('tpmNotes').value = '';
    document.getElementById('tpmAction').value = '';
    document.querySelectorAll('.tpm-status-btn').forEach(btn => {
        btn.className = 'tpm-status-btn';
    });
    
    document.getElementById('tpmInputTitle').textContent = areaName;
    
    // Update user display di TPM screen
    const userDisplay = document.getElementById('tpmUserDisplay');
    if (userDisplay) userDisplay.textContent = currentUser;
    
    navigateTo('tpmInputScreen');
}

function handleTPMPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
        showCustomAlert('Ukuran foto maksimal 5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        currentTPMPhoto = e.target.result;
        const preview = document.getElementById('tpmPhotoPreview');
        if (preview) {
            preview.innerHTML = `<img src="${currentTPMPhoto}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
            preview.closest('.tpm-photo-section')?.classList.add('has-photo');
        }
        showCustomAlert('Foto berhasil diambil', 'success');
    };
    reader.readAsDataURL(file);
}

function selectTPMStatus(status) {
    currentTPMStatus = status;
    document.getElementById('btnNormal').className = 'tpm-status-btn' + (status === 'normal' ? ' active-normal' : '');
    document.getElementById('btnAbnormal').className = 'tpm-status-btn' + (status === 'abnormal' ? ' active-abnormal' : '');
    document.getElementById('btnOff').className = 'tpm-status-btn' + (status === 'off' ? ' active-off' : '');
}

async function submitTPMData() {
    const notes = document.getElementById('tpmNotes')?.value || '';
    const action = document.getElementById('tpmAction')?.value || '';
    
    if (!currentTPMStatus) {
        showCustomAlert('Pilih status kondisi!', 'error');
        return;
    }
    if (!currentTPMPhoto) {
        showCustomAlert('Ambil foto dokumentasi!', 'error');
        return;
    }
    if (!action) {
        showCustomAlert('Pilih tindakan!', 'error');
        return;
    }
    
    const loader = document.getElementById('loader');
    const loaderText = document.querySelector('.loader-text h3');
    if (loader) loader.style.display = 'flex';
    if (loaderText) loaderText.textContent = 'Mengupload TPM...';
    
    const tpmData = {
        type: 'TPM',
        area: activeTPMArea,
        status: currentTPMStatus,
        action: action,
        notes: notes,
        photo: currentTPMPhoto,
        user: currentUser, // ⭐ KIRIM NAMA OPERATOR
        timestamp: new Date().toISOString()
    };
    
    try {
        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tpmData)
        });
        
        // Simpan history lokal
        let history = JSON.parse(localStorage.getItem('tpm_history') || '[]');
        history.push({...tpmData, photo: '[UPLOADED]'});
        localStorage.setItem('tpm_history', JSON.stringify(history));
        
        showCustomAlert(`✓ TPM ${activeTPMArea} berhasil!`, 'success');
        currentTPMPhoto = null;
        currentTPMStatus = '';
        
        setTimeout(() => navigateTo('tpmScreen'), 2000);
    } catch (err) {
        // Simpan offline
        let offline = JSON.parse(localStorage.getItem('tpm_offline') || '[]');
        offline.push(tpmData);
        localStorage.setItem('tpm_offline', JSON.stringify(offline));
        showCustomAlert('Gagal, disimpan lokal', 'error');
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

// ============================================
// ALERT & UTILS
// ============================================

function showCustomAlert(msg, type = 'success') {
    const alert = document.getElementById('customAlert');
    const content = document.getElementById('alertContent');
    const title = document.getElementById('alertTitle');
    const message = document.getElementById('alertMessage');
    
    if (!alert) return;
    
    title.textContent = type === 'success' ? 'Berhasil' : 'Error';
    message.textContent = msg;
    content.className = 'alert-content ' + type;
    
    // Icon
    const iconWrapper = document.getElementById('alertIconWrapper');
    if (iconWrapper) {
        if (type === 'success') {
            iconWrapper.innerHTML = `<div class="alert-icon-bg"></div><svg class="alert-icon-svg" viewBox="0 0 52 52"><circle cx="26" cy="26" r="25"></circle><path d="M14.1 27.2l7.1 7.2 16.7-16.8"></path></svg>`;
        } else {
            iconWrapper.innerHTML = `<div class="alert-icon-bg" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);"></div><svg class="alert-icon-svg" viewBox="0 0 52 52" style="stroke: #ef4444;"><circle cx="26" cy="26" r="25"></circle><path d="M16 16 L36 36 M36 16 L16 36"></path></svg>`;
        }
    }
    
    alert.classList.remove('hidden');
    setTimeout(() => closeAlert(), type === 'success' ? 3000 : 5000);
}

function closeAlert() {
    document.getElementById('customAlert')?.classList.add('hidden');
}

// ============================================
// LOGSHEET SEND (Update dengan User)
// ============================================

async function sendToSheet() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'flex';
    
    const finalData = {};
    Object.values(currentInput).forEach(obj => Object.assign(finalData, obj));
    
    // ⭐ TAMBAHKAN OPERATOR
    finalData.Operator = currentUser;
    finalData.Device_Timestamp = new Date().toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'});
    
    try {
        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalData)
        });
        
        showCustomAlert('✓ Data berhasil dikirim!', 'success');
        currentInput = {};
        localStorage.removeItem('draft_turbine');
        setTimeout(() => navigateTo('homeScreen'), 2000);
    } catch (err) {
        showCustomAlert('Gagal: ' + err.message, 'error');
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.getElementById('loginScreen')?.classList.contains('active')) {
        loginOperator();
    }
});
