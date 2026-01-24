/* =============================================
   NS ONBOARDING QUEST - GAME LOGIC
   ============================================= */

// Configuration
const TOTAL_STAGES = 9;
const STAGE_CONFIG = [
    { id: 1, checkbox: 'disclaimerCheck', hasLink: false },
    { id: 2, checkbox: 'wikiCheck', hasLink: true, linkId: 'wikiLink' },
    { id: 3, checkbox: 'applyCheck', hasLink: true, linkId: 'applyLink' },
    { id: 4, checkbox: 'waitCheck', hasLink: false },
    { id: 5, checkbox: 'paymentCheck', hasLink: false },
    { id: 6, checkbox: 'onboardingCheck', hasLink: true, linkId: 'onboardingLink' },
    { id: 7, checkbox: 'passportCheck', hasLink: true, linkId: 'passportLink' },
    { id: 8, checkbox: 'visaCheck', hasLink: false },
    { id: 9, checkbox: null, hasLink: false, isEmail: true }
];

// Game State
const state = {
    currentScreen: 'welcome',
    completedStages: [],
    soundEnabled: true,
    userEmail: '',
    videoWatched: false
};

// DOM Elements
const elements = {
    // Sounds
    clickSound: document.getElementById('clickSound'),
    completeSound: document.getElementById('completeSound'),
    celebrationSound: document.getElementById('celebrationSound'),

    // Screens
    welcomeScreen: document.getElementById('welcomeScreen'),
    videoScreen: document.getElementById('videoScreen'),
    mapScreen: document.getElementById('mapScreen'),
    stage1: document.getElementById('stage1'),
    stage2: document.getElementById('stage2'),
    stage3: document.getElementById('stage3'),
    stage4: document.getElementById('stage4'),
    stage5: document.getElementById('stage5'),
    stage6: document.getElementById('stage6'),
    stage7: document.getElementById('stage7'),
    stage8: document.getElementById('stage8'),
    stage9: document.getElementById('stage9'),
    celebrationScreen: document.getElementById('celebrationScreen'),

    // Buttons
    startBtn: document.getElementById('startBtn'),
    videoNextBtn: document.getElementById('videoNextBtn'),
    backToMap: document.getElementById('backToMap'),
    soundToggle: document.getElementById('soundToggle'),
    restartBtn: document.getElementById('restartBtn'),
    copyLink: document.getElementById('copyLink'),

    // Stage buttons
    stage1Btn: document.getElementById('stage1Btn'),
    stage2Btn: document.getElementById('stage2Btn'),
    stage3Btn: document.getElementById('stage3Btn'),
    stage4Btn: document.getElementById('stage4Btn'),
    stage5Btn: document.getElementById('stage5Btn'),
    stage6Btn: document.getElementById('stage6Btn'),
    stage7Btn: document.getElementById('stage7Btn'),
    stage8Btn: document.getElementById('stage8Btn'),
    stage9Btn: document.getElementById('stage9Btn'),

    // Checkboxes
    disclaimerCheck: document.getElementById('disclaimerCheck'),
    wikiCheck: document.getElementById('wikiCheck'),
    applyCheck: document.getElementById('applyCheck'),
    waitCheck: document.getElementById('waitCheck'),
    paymentCheck: document.getElementById('paymentCheck'),
    onboardingCheck: document.getElementById('onboardingCheck'),
    passportCheck: document.getElementById('passportCheck'),
    visaCheck: document.getElementById('visaCheck'),

    // Other
    emailInput: document.getElementById('emailInput'),
    confetti: document.getElementById('confetti'),
    resetToggle: document.getElementById('resetToggle')
};

// =============================================
// SOUND EFFECTS
// =============================================
function playSound(soundElement) {
    if (!state.soundEnabled || !soundElement) return;
    soundElement.currentTime = 0;
    soundElement.volume = 0.5;
    soundElement.play().catch(() => { });
}

function playClickSound() {
    playSound(elements.clickSound);
}

function playCompleteSound() {
    playSound(elements.completeSound);
}

function playCelebrationSound() {
    playSound(elements.celebrationSound);
}

// =============================================
// SCREEN MANAGEMENT
// =============================================
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        state.currentScreen = screenId;
    }

    // Show/hide back to map button
    const stageScreens = ['stage1', 'stage2', 'stage3', 'stage4', 'stage5', 'stage6', 'stage7', 'stage8', 'stage9'];
    if (stageScreens.includes(screenId)) {
        elements.backToMap.style.display = 'flex';
    } else {
        elements.backToMap.style.display = 'none';
    }

    // Scroll to top
    window.scrollTo(0, 0);
}

// =============================================
// JOURNEY MAP
// =============================================
function updateJourneyMap() {
    document.querySelectorAll('.quest-node').forEach(node => {
        const stage = parseInt(node.dataset.stage);

        // Remove all state classes
        node.classList.remove('locked', 'completed', 'current');

        if (state.completedStages.includes(stage)) {
            // Stage completed
            node.classList.add('completed');
            node.querySelector('.node-status').textContent = '✓ Complete';
        } else if (stage === getNextStage()) {
            // Current stage
            node.classList.add('current');
            node.querySelector('.node-status').textContent = 'Start this stage!';
        } else if (stage > getNextStage()) {
            // Locked stage
            node.classList.add('locked');
            node.querySelector('.node-status').textContent = '🔒 Locked';
        }
    });
}

function getNextStage() {
    for (let i = 1; i <= TOTAL_STAGES; i++) {
        if (!state.completedStages.includes(i)) {
            return i;
        }
    }
    return TOTAL_STAGES + 1; // All completed
}

// =============================================
// STAGE COMPLETION
// =============================================
function completeStage(stageNum) {
    if (!state.completedStages.includes(stageNum)) {
        state.completedStages.push(stageNum);
        saveState();
        playCompleteSound();

        // Animate the node on the map
        const node = document.querySelector(`.quest-node[data-stage="${stageNum}"]`);
        if (node) {
            node.classList.add('animate-glow');
            setTimeout(() => node.classList.remove('animate-glow'), 1000);
        }

        // Show confetti for every other stage
        if (stageNum % 2 === 0 || stageNum === TOTAL_STAGES) {
            launchConfetti();
        }
    }

    updateJourneyMap();

    // Navigate to next stage or celebration
    if (stageNum === TOTAL_STAGES) {
        setTimeout(() => {
            showScreen('celebrationScreen');
            playCelebrationSound();
            launchConfetti();
        }, 500);
    } else {
        setTimeout(() => {
            showScreen('mapScreen');
        }, 500);
    }
}

// =============================================
// CONFETTI
// =============================================
function launchConfetti() {
    const canvas = elements.confetti;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

    // Create particles
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 3 + 2,
            speedX: Math.random() * 2 - 1,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5
        });
    }

    let frame = 0;
    const maxFrames = 180;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
            ctx.restore();

            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotationSpeed;
        });

        frame++;
        if (frame < maxFrames) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    animate();
}

// =============================================
// STATE PERSISTENCE
// =============================================
function saveState() {
    const stateToSave = {
        completedStages: state.completedStages,
        soundEnabled: state.soundEnabled,
        userEmail: state.userEmail,
        videoWatched: state.videoWatched
    };
    localStorage.setItem('nsQuestState', JSON.stringify(stateToSave));
}

function loadState() {
    const saved = localStorage.getItem('nsQuestState');
    if (saved) {
        const parsed = JSON.parse(saved);
        state.completedStages = parsed.completedStages || [];
        state.soundEnabled = parsed.soundEnabled !== false;
        state.userEmail = parsed.userEmail || '';
        state.videoWatched = parsed.videoWatched || false;

        // Update sound toggle UI
        updateSoundToggleUI();

        // Update email input if saved
        if (state.userEmail && elements.emailInput) {
            elements.emailInput.value = state.userEmail;
        }
    }
}

function resetState() {
    state.completedStages = [];
    state.userEmail = '';
    state.videoWatched = false;
    saveState();
    updateJourneyMap();

    // Reset checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });

    // Reset buttons
    [elements.stage1Btn, elements.stage2Btn, elements.stage3Btn,
    elements.stage4Btn, elements.stage5Btn, elements.stage6Btn,
    elements.stage7Btn, elements.stage8Btn].forEach(btn => {
        if (btn) btn.disabled = true;
    });

    // Reset email
    if (elements.emailInput) elements.emailInput.value = '';
}

// =============================================
// SOUND TOGGLE
// =============================================
function updateSoundToggleUI() {
    const soundOn = elements.soundToggle.querySelector('.sound-on');
    const soundOff = elements.soundToggle.querySelector('.sound-off');

    if (state.soundEnabled) {
        soundOn.style.display = 'inline';
        soundOff.style.display = 'none';
    } else {
        soundOn.style.display = 'none';
        soundOff.style.display = 'inline';
    }
}

function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    saveState();
    updateSoundToggleUI();
    if (state.soundEnabled) {
        playClickSound();
    }
}

// =============================================
// EVENT LISTENERS
// =============================================
function initEventListeners() {
    // Start button
    elements.startBtn?.addEventListener('click', () => {
        playClickSound();
        showScreen('videoScreen');
    });

    // Video next button
    elements.videoNextBtn?.addEventListener('click', () => {
        playClickSound();
        state.videoWatched = true;
        saveState();
        showScreen('mapScreen');
        updateJourneyMap();
    });

    // Back to map
    elements.backToMap?.addEventListener('click', () => {
        playClickSound();
        showScreen('mapScreen');
    });

    // Back buttons (go to previous stage)
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            playClickSound();
            const backTo = btn.dataset.back;
            if (backTo === 'map') {
                showScreen('mapScreen');
            } else {
                showScreen(`stage${backTo}`);
            }
        });
    });

    // Sound toggle
    elements.soundToggle?.addEventListener('click', toggleSound);

    // Reset toggle (in header)
    elements.resetToggle?.addEventListener('click', () => {
        if (confirm('Reset all progress? This will start the quest from the beginning.')) {
            playClickSound();
            resetState();
            showScreen('welcomeScreen');
        }
    });

    // Restart button (on celebration screen)
    elements.restartBtn?.addEventListener('click', () => {
        playClickSound();
        resetState();
        showScreen('welcomeScreen');
    });

    // Copy link button
    elements.copyLink?.addEventListener('click', () => {
        playClickSound();
        navigator.clipboard.writeText('https://ns.com/andreikun/apply').then(() => {
            elements.copyLink.textContent = '✓';
            setTimeout(() => {
                elements.copyLink.textContent = '📋';
            }, 2000);
        });
    });

    // Quest nodes click
    document.querySelectorAll('.quest-node').forEach(node => {
        node.addEventListener('click', () => {
            const stage = parseInt(node.dataset.stage);
            if (!node.classList.contains('locked')) {
                playClickSound();
                showScreen(`stage${stage}`);
            }
        });
    });

    // Stage 1 - Disclaimer
    elements.disclaimerCheck?.addEventListener('change', (e) => {
        playClickSound();
        elements.stage1Btn.disabled = !e.target.checked;
    });

    elements.stage1Btn?.addEventListener('click', () => {
        if (!elements.stage1Btn.disabled) {
            completeStage(1);
        }
    });

    // Stage 2 - Wiki
    elements.wikiCheck?.addEventListener('change', (e) => {
        playClickSound();
        elements.stage2Btn.disabled = !e.target.checked;
    });

    document.getElementById('wikiLink')?.addEventListener('click', () => {
        playClickSound();
    });

    elements.stage2Btn?.addEventListener('click', () => {
        if (!elements.stage2Btn.disabled) {
            completeStage(2);
        }
    });

    // Stage 3 - Apply
    elements.applyCheck?.addEventListener('change', (e) => {
        playClickSound();
        elements.stage3Btn.disabled = !e.target.checked;
    });

    document.getElementById('applyLink')?.addEventListener('click', () => {
        playClickSound();
    });

    elements.stage3Btn?.addEventListener('click', () => {
        if (!elements.stage3Btn.disabled) {
            completeStage(3);
        }
    });

    // Stage 4 - Wait
    elements.waitCheck?.addEventListener('change', (e) => {
        playClickSound();
        elements.stage4Btn.disabled = !e.target.checked;
    });

    elements.stage4Btn?.addEventListener('click', () => {
        if (!elements.stage4Btn.disabled) {
            completeStage(4);
        }
    });

    // Stage 5 - Payment
    elements.paymentCheck?.addEventListener('change', (e) => {
        playClickSound();
        elements.stage5Btn.disabled = !e.target.checked;
    });

    elements.stage5Btn?.addEventListener('click', () => {
        if (!elements.stage5Btn.disabled) {
            completeStage(5);
        }
    });

    // Stage 6 - NS Onboarding
    elements.onboardingCheck?.addEventListener('change', (e) => {
        playClickSound();
        elements.stage6Btn.disabled = !e.target.checked;
    });

    document.getElementById('onboardingLink')?.addEventListener('click', () => {
        playClickSound();
    });

    elements.stage6Btn?.addEventListener('click', () => {
        if (!elements.stage6Btn.disabled) {
            completeStage(6);
        }
    });

    // Stage 7 - Passport & Visa Check
    elements.passportCheck?.addEventListener('change', (e) => {
        playClickSound();
        elements.stage7Btn.disabled = !e.target.checked;
    });

    document.getElementById('passportLink')?.addEventListener('click', () => {
        playClickSound();
    });

    elements.stage7Btn?.addEventListener('click', () => {
        if (!elements.stage7Btn.disabled) {
            completeStage(7);
        }
    });

    // Stage 8 - Visa & Travel
    elements.visaCheck?.addEventListener('change', (e) => {
        playClickSound();
        elements.stage8Btn.disabled = !e.target.checked;
    });

    elements.stage8Btn?.addEventListener('click', () => {
        if (!elements.stage8Btn.disabled) {
            completeStage(8);
        }
    });

    // Stage 9 - Email
    elements.stage9Btn?.addEventListener('click', () => {
        const email = elements.emailInput.value.trim();
        if (email && isValidEmail(email)) {
            state.userEmail = email;
            saveState();
            completeStage(9);
        } else {
            elements.emailInput.classList.add('animate-shake');
            setTimeout(() => {
                elements.emailInput.classList.remove('animate-shake');
            }, 500);
        }
    });

    // Add click sound to all buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousedown', () => {
            playClickSound();
        });
    });

    // External link click sounds
    document.querySelectorAll('.card-link, .docs-subtitle a').forEach(link => {
        link.addEventListener('click', () => {
            playClickSound();
        });
    });
}

// =============================================
// UTILITIES
// =============================================
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// =============================================
// INITIALIZATION
// =============================================
function init() {
    // Load saved state
    loadState();

    // Check if user has progress
    if (state.completedStages.length > 0 || state.videoWatched) {
        // Resume from map
        showScreen('mapScreen');
        updateJourneyMap();

        // Restore checkbox states based on completed stages
        restoreCheckboxStates();
    } else {
        // Start fresh
        showScreen('welcomeScreen');
    }

    // Initialize event listeners
    initEventListeners();

    // Handle window resize for confetti
    window.addEventListener('resize', () => {
        elements.confetti.width = window.innerWidth;
        elements.confetti.height = window.innerHeight;
    });
}

function restoreCheckboxStates() {
    // If a stage is completed, its checkbox should be checked
    if (state.completedStages.includes(1)) {
        elements.disclaimerCheck.checked = true;
        elements.stage1Btn.disabled = false;
    }
    if (state.completedStages.includes(2)) {
        elements.wikiCheck.checked = true;
        elements.stage2Btn.disabled = false;
    }
    if (state.completedStages.includes(3)) {
        elements.applyCheck.checked = true;
        elements.stage3Btn.disabled = false;
    }
    if (state.completedStages.includes(4)) {
        elements.waitCheck.checked = true;
        elements.stage4Btn.disabled = false;
    }
    if (state.completedStages.includes(5)) {
        elements.paymentCheck.checked = true;
        elements.stage5Btn.disabled = false;
    }
    if (state.completedStages.includes(6)) {
        elements.onboardingCheck.checked = true;
        elements.stage6Btn.disabled = false;
    }
    if (state.completedStages.includes(7)) {
        elements.passportCheck.checked = true;
        elements.stage7Btn.disabled = false;
    }
    if (state.completedStages.includes(8)) {
        elements.visaCheck.checked = true;
        elements.stage8Btn.disabled = false;
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
