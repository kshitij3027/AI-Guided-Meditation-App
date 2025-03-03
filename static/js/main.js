// Main JavaScript for Guided Meditation App

// DOM Elements
const THEME_TOGGLE = document.getElementById('theme-toggle');
const MEDITATION_BUTTONS = document.querySelectorAll('.meditation-btn');
const MEDITATION_PLAYER = document.getElementById('meditation-player');
const MEDITATION_TITLE = document.getElementById('meditation-title');
const MEDITATION_INSTRUCTION = document.getElementById('meditation-instruction');
const MEDITATION_ANIMATION = document.getElementById('meditation-animation');
const PAUSE_BUTTON = document.getElementById('pause-btn');
const STOP_BUTTON = document.getElementById('stop-btn');
const VOICE_TOGGLE = document.getElementById('voice-toggle');
const VOICE_SPEED = document.getElementById('voice-speed');
const VOICE_PITCH = document.getElementById('voice-pitch');

// Variables
let currentMeditation = null;
let instructionIndex = 0;
let meditationInterval = null;
let isPaused = false;
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;
let voiceEnabled = true;

// Theme Toggle Functionality
THEME_TOGGLE.addEventListener('change', function() {
    const htmlElement = document.documentElement;
    if (this.checked) {
        htmlElement.setAttribute('data-theme', 'light');
    } else {
        htmlElement.setAttribute('data-theme', 'dark');
    }
});

// Check system preference for dark/light mode
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.documentElement.setAttribute('data-theme', 'light');
    THEME_TOGGLE.checked = true;
}

// Voice Toggle Functionality
VOICE_TOGGLE.addEventListener('change', function() {
    voiceEnabled = this.checked;
    console.log(`Voice narration ${voiceEnabled ? 'enabled' : 'disabled'}`);
    
    if (!voiceEnabled && speechSynthesis) {
        speechSynthesis.cancel();
    } else if (voiceEnabled && currentMeditation && !isPaused) {
        speakText(MEDITATION_INSTRUCTION.textContent);
    }
});

// Voice Speed and Pitch Change Handlers
VOICE_SPEED.addEventListener('change', function() {
    if (voiceEnabled && currentMeditation && !isPaused) {
        speakText(MEDITATION_INSTRUCTION.textContent, parseFloat(this.value), parseFloat(VOICE_PITCH.value));
    }
});

VOICE_PITCH.addEventListener('change', function() {
    if (voiceEnabled && currentMeditation && !isPaused) {
        speakText(MEDITATION_INSTRUCTION.textContent, parseFloat(VOICE_SPEED.value), parseFloat(this.value));
    }
});

// Meditation Button Click Handlers
MEDITATION_BUTTONS.forEach(button => {
    button.addEventListener('click', function() {
        const meditationType = this.getAttribute('data-type');
        startMeditation(meditationType);
    });
});

// Initialize speech synthesis
function initSpeechSynthesis() {
    try {
        if (!speechSynthesis) {
            console.error("Speech synthesis not supported in this browser");
            return false;
        }
        
        // Wait for voices to be loaded (needed for some browsers)
        return new Promise(resolve => {
            let voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                resolve(true);
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    voices = speechSynthesis.getVoices();
                    resolve(voices.length > 0);
                };
            }
        });
    } catch (error) {
        console.error("Error initializing speech synthesis:", error);
        return false;
    }
}

// Speak text using speech synthesis
function speakText(text, rate = null, pitch = null) {
    try {
        // If voice is disabled, don't speak
        if (!voiceEnabled) {
            return null;
        }
        
        // Cancel any ongoing speech
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        
        // Create a new utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Get available voices
        const voices = speechSynthesis.getVoices();
        
        // Try to find a calm, soothing voice
        let selectedVoice = voices.find(voice => 
            voice.name.includes("Female") || 
            voice.name.includes("Samantha") || 
            voice.name.includes("Calm") ||
            voice.name.includes("Serene")
        );
        
        // If no specific voice found, use the first available
        if (!selectedVoice && voices.length > 0) {
            selectedVoice = voices[0];
        }
        
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        
        // Set properties for a calm, meditative voice
        utterance.rate = rate !== null ? rate : parseFloat(VOICE_SPEED.value);
        utterance.pitch = pitch !== null ? pitch : parseFloat(VOICE_PITCH.value);
        utterance.volume = 1.0;
        
        // Store current utterance for pause/resume functionality
        currentUtterance = utterance;
        
        // Speak the text
        speechSynthesis.speak(utterance);
        
        console.log(`Speaking: "${text}" (Rate: ${utterance.rate}, Pitch: ${utterance.pitch})`);
        
        return utterance;
    } catch (error) {
        console.error("Error speaking text:", error);
        return null;
    }
}

// Start Meditation
async function startMeditation(type) {
    try {
        // Reset any ongoing meditation
        if (meditationInterval) {
            clearInterval(meditationInterval);
        }
        
        // Cancel any ongoing speech
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        
        // Show loading animation
        MEDITATION_PLAYER.classList.remove('hidden');
        MEDITATION_TITLE.textContent = "Loading...";
        MEDITATION_INSTRUCTION.textContent = "Preparing your meditation experience...";
        
        // Initialize speech synthesis
        const speechAvailable = await initSpeechSynthesis();
        if (!speechAvailable) {
            console.warn("Speech synthesis not available. Continuing without voice narration.");
            // Disable voice toggle if speech synthesis is not available
            VOICE_TOGGLE.checked = false;
            VOICE_TOGGLE.disabled = true;
            voiceEnabled = false;
        } else {
            console.log("Speech synthesis initialized successfully");
        }
        
        // Fetch meditation data from API
        console.log(`Fetching meditation data for: ${type}`);
        const response = await fetch(`/api/meditations/${type}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch meditation data: ${response.status}`);
        }
        
        // Get meditation data
        currentMeditation = await response.json();
        
        // Convert snake_case to camelCase for JavaScript
        currentMeditation.animationColor = currentMeditation.animation_color;
        
        // Update UI
        MEDITATION_TITLE.textContent = currentMeditation.title;
        MEDITATION_INSTRUCTION.textContent = currentMeditation.instructions[0];
        instructionIndex = 0;
        
        // Update animation color
        const animationElement = MEDITATION_ANIMATION.querySelector('div');
        animationElement.className = `w-32 h-32 rounded-full bg-gradient-to-r ${currentMeditation.animationColor} opacity-75`;
        
        // Use anime.js for a smooth entrance animation
        anime({
            targets: MEDITATION_PLAYER,
            opacity: [0, 1],
            translateY: [20, 0],
            easing: 'easeOutExpo',
            duration: 1000
        });
        
        // Scroll to player
        MEDITATION_PLAYER.scrollIntoView({ behavior: 'smooth' });
        
        // Start instruction cycle
        isPaused = false;
        PAUSE_BUTTON.textContent = 'Pause';
        
        // Speak the first instruction
        if (speechAvailable && voiceEnabled) {
            speakText(currentMeditation.instructions[0]);
        }
        
        // Start cycling instructions after a delay to allow first instruction to be spoken
        meditationInterval = setInterval(cycleInstructions, 10000); // Change instruction every 10 seconds
        
        console.log(`Started ${type} meditation`);
    } catch (error) {
        console.error('Error starting meditation:', error);
        MEDITATION_TITLE.textContent = "Error";
        MEDITATION_INSTRUCTION.textContent = "Failed to load meditation. Please try again.";
    }
}

// Cycle through meditation instructions
function cycleInstructions() {
    try {
        instructionIndex = (instructionIndex + 1) % currentMeditation.instructions.length;
        const newInstruction = currentMeditation.instructions[instructionIndex];
        
        // Use anime.js for text transition
        anime({
            targets: MEDITATION_INSTRUCTION,
            opacity: [0, 1],
            translateY: [10, 0],
            easing: 'easeOutExpo',
            duration: 1000,
            begin: function() {
                MEDITATION_INSTRUCTION.textContent = newInstruction;
            }
        });
        
        // Speak the new instruction if not paused
        if (!isPaused && speechSynthesis && voiceEnabled) {
            speakText(newInstruction);
        }
    } catch (error) {
        console.error('Error cycling instructions:', error);
    }
}

// Pause Button Handler
PAUSE_BUTTON.addEventListener('click', function() {
    if (isPaused) {
        // Resume
        meditationInterval = setInterval(cycleInstructions, 10000);
        this.textContent = 'Pause';
        
        // Resume speech
        if (speechSynthesis && voiceEnabled) {
            speakText(MEDITATION_INSTRUCTION.textContent);
        }
        
        // Resume animation
        anime({
            targets: '.loading-animation div',
            scale: [0.8, 1.2, 0.8],
            opacity: [0.7, 1, 0.7],
            easing: 'easeInOutSine',
            duration: 5000,
            loop: true
        });
    } else {
        // Pause
        clearInterval(meditationInterval);
        this.textContent = 'Resume';
        
        // Pause speech
        if (speechSynthesis) {
            speechSynthesis.cancel();
        }
        
        // Pause animation
        anime.remove('.loading-animation div');
    }
    
    isPaused = !isPaused;
});

// Stop Button Handler
STOP_BUTTON.addEventListener('click', function() {
    if (meditationInterval) {
        clearInterval(meditationInterval);
        meditationInterval = null;
    }
    
    // Stop speech
    if (speechSynthesis) {
        speechSynthesis.cancel();
    }
    
    // Hide player with animation
    anime({
        targets: MEDITATION_PLAYER,
        opacity: 0,
        translateY: 20,
        easing: 'easeInExpo',
        duration: 1000,
        complete: function() {
            MEDITATION_PLAYER.classList.add('hidden');
        }
    });
    
    currentMeditation = null;
    isPaused = false;
}); 