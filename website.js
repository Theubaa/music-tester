// Website JavaScript for API-based music analysis
let wavesurfer;
let controls;

// File upload handling
const dropInput = document.createElement('input');
dropInput.setAttribute('type', 'file');
dropInput.setAttribute('accept', 'audio/*');
dropInput.addEventListener('change', () => {
    processFileUpload(dropInput.files);
});

const dropArea = document.querySelector('#file-drop-area');
dropArea.addEventListener('dragover', (e) => { e.preventDefault(); });
dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    processFileUpload(files);
});
dropArea.addEventListener('click', () => {
    dropInput.click();
});

function processFileUpload(files) {
    if (files.length > 1) {
        alert("Only single-file uploads are supported currently");
        return;
    } else if (files.length) {
        const file = files[0];
        
        // Show loader
        toggleLoader();
        
        // Create form data for API
        const formData = new FormData();
        formData.append('audio', file);
        
        // Call our API
        fetch('/api/analyze', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayResults(data.analysis);
                
                // Load audio for playback
                wavesurfer = toggleUploadDisplayHTML('display');
                wavesurfer.loadBlob(file);
                controls = new PlaybackControls(wavesurfer);
                controls.toggleEnabled(true);
            } else {
                alert('Error analyzing audio: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error analyzing audio. Please try again.');
        })
        .finally(() => {
            toggleLoader();
        });
    }
}

function displayResults(analysis) {
    // Update BPM and Key
    document.getElementById('bpm-value').textContent = analysis.bpm;
    document.getElementById('key-value').textContent = analysis.key;
    
    // Update mood meters
    updateMeter('danceability', analysis.danceability);
    updateMeter('mood_happy', analysis.mood.happy);
    updateMeter('mood_sad', analysis.mood.sad);
    updateMeter('mood_relaxed', analysis.mood.relaxed);
    updateMeter('mood_aggressive', analysis.mood.aggressive);
}

function updateMeter(elementId, value) {
    const element = document.getElementById(elementId);
    const meter = element.querySelector('.classifier-meter');
    if (meter) {
        meter.style.width = (value * 100) + '%';
        meter.textContent = (value * 100).toFixed(1) + '%';
    }
}

function toggleLoader() {
    const loader = document.querySelector('#loader');
    loader.classList.toggle('disabled');
    loader.classList.toggle('active');
}

// WaveSurfer and Controls (simplified version)
function toggleUploadDisplayHTML(display) {
    const main = document.querySelector('#main');
    const template = document.querySelector('#playback-controls');
    
    if (display === 'display') {
        const controlsClone = template.content.cloneNode(true);
        main.appendChild(controlsClone);
        
        // Initialize WaveSurfer
        const wavesurfer = WaveSurfer.create({
            container: '#waveform',
            waveColor: '#4F4A85',
            progressColor: '#383351',
            height: 100
        });
        
        return wavesurfer;
    }
}

class PlaybackControls {
    constructor(wavesurfer) {
        this.wavesurfer = wavesurfer;
        this.setupControls();
    }
    
    setupControls() {
        const playBtn = document.getElementById('play');
        const backwardBtn = document.getElementById('backward');
        const forwardBtn = document.getElementById('forward');
        const muteBtn = document.getElementById('mute');
        
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.wavesurfer.playPause();
            });
        }
        
        if (backwardBtn) {
            backwardBtn.addEventListener('click', () => {
                this.wavesurfer.skip(-10);
            });
        }
        
        if (forwardBtn) {
            forwardBtn.addEventListener('click', () => {
                this.wavesurfer.skip(10);
            });
        }
        
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                this.wavesurfer.toggleMute();
            });
        }
    }
    
    toggleEnabled(enabled) {
        const buttons = document.querySelectorAll('.controls button');
        buttons.forEach(btn => {
            btn.disabled = !enabled;
        });
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Music Analysis Website Loaded');
});
