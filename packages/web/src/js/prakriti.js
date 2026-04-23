// Prakriti AI Analyzer - Main JavaScript Logic
// Issue #15: Prakriti AI Analyzer Feature

// Global state
const prakrit iState = {
    images: {
        tongue: null,
        nail: null,
        face: null
    },
    currentStep: 1,
    doshaScores: {
        vata: 0,
        pitta: 0,
        kapha: 0
    },
    questionnaireData: null
};

// Load Prakriti data
let prakritiData = null;
fetch('../data/prakriti-data.json')
    .then(response => response.json())
    .then(data => {
        prakritiData = data;
        loadQuestionnaire();
    })
    .catch(err => console.error('Error loading prakriti data:', err));

// Navigation Functions
function nextStep(step) {
    // Hide current step
    document.getElementById(`step${prakritiState.currentStep}`).classList.remove('active');
    document.querySelectorAll('.step')[prakritiState.currentStep - 1].classList.remove('active');
    document.querySelectorAll('.step')[prakritiState.currentStep - 1].classList.add('completed');
    
    // Show next step
    prakritiState.currentStep = step;
    document.getElementById(`step${step}`).classList.add('active');
    document.querySelectorAll('.step')[step - 1].classList.add('active');
}

function prevStep(step) {
    // Hide current step
    document.getElementById(`step${prakritiState.currentStep}`).classList.remove('active');
    document.querySelectorAll('.step')[prakritiState.currentStep - 1].classList.remove('active');
    
    // Show previous step
    prakritiState.currentStep = step;
    document.getElementById(`step${step}`).classList.add('active');
    document.querySelectorAll('.step')[step - 1].classList.add('active');
}

// Image Capture & Upload Functions
function captureImage(type) {
    // Check if camera is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera not available. Please use file upload instead.');
        return;
    }
    
    // Request camera access
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(stream => {
            // Create video element for camera preview
            const videoModal = document.createElement('div');
            videoModal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:1000; display:flex; flex-direction:column; align-items:center; justify-content:center;';
            
            const video = document.createElement('video');
            video.autoplay = true;
            video.srcObject = stream;
            video.style.maxWidth = '80%';
            video.style.maxHeight = '70%';
            
            const captureBtn = document.createElement('button');
            captureBtn.textContent = '📸 Capture';
            captureBtn.className = 'camera-btn';
            captureBtn.style.marginTop = '1rem';
            
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = '❌ Cancel';
            cancelBtn.className = 'upload-btn';
            cancelBtn.style.marginLeft = '1rem';
            
            videoModal.appendChild(video);
            const btnContainer = document.createElement('div');
            btnContainer.appendChild(captureBtn);
            btnContainer.appendChild(cancelBtn);
            videoModal.appendChild(btnContainer);
            document.body.appendChild(videoModal);
            
            // Capture button handler
            captureBtn.onclick = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);
                
                const imageData = canvas.toDataURL('image/jpeg');
                prakritiState.images[type] = imageData;
                
                // Show preview
                const preview = document.getElementById(`${type}Preview`);
                preview.src = imageData;
                preview.style.display = 'block';
                
                // Show next button
                const nextBtn = document.getElementById(`${type}Next`);
                if (nextBtn) nextBtn.style.display = 'inline-block';
                
                // Stop stream and remove modal
                stream.getTracks().forEach(track => track.stop());
                document.body.removeChild(videoModal);
            };
            
            // Cancel button handler
            cancelBtn.onclick = () => {
                stream.getTracks().forEach(track => track.stop());
                document.body.removeChild(videoModal);
            };
        })
        .catch(err => {
            console.error('Camera error:', err);
            alert('Could not access camera. Please use file upload instead.');
        });
}

function previewImage(input, previewId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const type = input.id.replace('File', '');
            prakritiState.images[type] = e.target.result;
            
            const preview = document.getElementById(previewId);
            preview.src = e.target.result;
            preview.style.display = 'block';
            
            // Show next button
            const nextBtn = document.getElementById(`${type}Next`);
            if (nextBtn) nextBtn.style.display = 'inline-block';
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

// AI Analysis Functions
async function analyzeImages() {
    // Validate all images are uploaded
    if (!prakritiState.images.tongue || !prakritiState.images.nail || !prakritiState.images.face) {
        alert('Please upload all three images (tongue, nail, face) before analyzing.');
        return;
    }
    
    // Show loading state
    const analyzeBtn = event.target;
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '⏳ Analyzing...';
    
    try {
        // TODO: Replace with actual API call when backend is ready
        // const response = await fetch('/api/prakriti/analyze', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ images: prakritiState.images })
        // });
        // const result = await response.json();
        
        // MOCK: Simulate AI analysis with random scores (for demo)
        await simulateAnalysis();
        
        // Move to results step
        nextStep(4);
        displayResults();
        
    } catch (error) {
        console.error('Analysis error:', error);
        alert('Analysis failed. Please try again.');
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '🔬 Analyze';
    }
}

// Simulate AI analysis (temporary - replace with real API)
function simulateAnalysis() {
    return new Promise(resolve => {
        setTimeout(() => {
            // Generate mock scores (in production, these come from AI model)
            const rand1 = Math.random();
            const rand2 = Math.random() * (1 - rand1);
            const rand3 = 1 - rand1 - rand2;
            
            prakritiState.doshaScores = {
                vata: Math.round(rand1 * 100) / 100,
                pitta: Math.round(rand2 * 100) / 100,
                kapha: Math.round(rand3 * 100) / 100
            };
            
            resolve();
        }, 2000); // Simulate 2s processing time
    });
}

// Results Display
function displayResults() {
    const scores = prakritiState.doshaScores;
    
    // Update percentage labels and bars
    document.getElementById('vataPercent').textContent = `${Math.round(scores.vata * 100)}%`;
    document.getElementById('pittaPercent').textContent = `${Math.round(scores.pitta * 100)}%`;
    document.getElementById('kaphaPercent').textContent = `${Math.round(scores.kapha * 100)}%`;
    
    // Animate bars
    setTimeout(() => {
        document.getElementById('vataBar').style.width = `${scores.vata * 100}%`;
        document.getElementById('pittaBar').style.width = `${scores.pitta * 100}%`;
        document.getElementById('kaphaBar').style.width = `${scores.kapha * 100}%`;
    }, 100);
    
    // Determine dominant dosha
    const dominant = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    const doshaInfo = prakritiData?.doshas[dominant];
    
    if (doshaInfo) {
        document.getElementById('doshaName').textContent = doshaInfo.name;
        document.getElementById('doshaDescription').textContent = doshaInfo.description;
    }
}

// Questionnaire Functions (Fallback)
function loadQuestionnaire() {
    if (!prakritiData || !prakritiData.questionnaire) return;
    
    const container = document.getElementById('questionnaireContainer');
    container.innerHTML = '';
    
    prakritiData.questionnaire.forEach(q => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.innerHTML = `
            <h4>${q.question}</h4>
            <div class="options-container" id="options-${q.id}"></div>
        `;
        
        const optionsContainer = questionDiv.querySelector('.options-container');
        q.options.forEach((opt, idx) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.textContent = opt.text;
            optionDiv.dataset.dosha = opt.dosha;
            optionDiv.dataset.score = opt.score;
            optionDiv.dataset.questionId = q.id;
            
            optionDiv.onclick = function() {
                // Deselect all options in this question
                optionsContainer.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
                // Select this option
                this.classList.add('selected');
            };
            
            optionsContainer.appendChild(optionDiv);
        });
        
        container.appendChild(questionDiv);
    });
}

function analyzeQuestionnaire() {
    // Collect selected answers
    const selected = document.querySelectorAll('.option.selected');
    
    if (selected.length < prakritiData.questionnaire.length) {
        alert(`Please answer all ${prakritiData.questionnaire.length} questions.`);
        return;
    }
    
    // Calculate scores
    const scores = { vata: 0, pitta: 0, kapha: 0 };
    selected.forEach(opt => {
        const dosha = opt.dataset.dosha;
        scores[dosha] += parseInt(opt.dataset.score);
    });
    
    // Normalize to percentages
    const total = scores.vata + scores.pitta + scores.kapha;
    prakritiState.doshaScores = {
        vata: scores.vata / total,
        pitta: scores.pitta / total,
        kapha: scores.kapha / total
    };
    
    // Show results
    document.getElementById('questionnaireSection').style.display = 'none';
    nextStep(4);
    displayResults();
}

// Save Profile Function
function saveProfile() {
    const profile = {
        user_id: localStorage.getItem('userId') || 'demo_user',
        analyzed_at: new Date().toISOString(),
        method: prakritiState.images.tongue ? 'image_analysis' : 'questionnaire',
        images: prakritiState.images,
        dosha_scores: prakritiState.doshaScores,
        dominant_dosha: Object.keys(prakritiState.doshaScores).reduce((a, b) => 
            prakritiState.doshaScores[a] > prakritiState.doshaScores[b] ? a : b
        ),
        confidence_score: 0.85 // Mock confidence
    };
    
    // Save to localStorage (in production, POST to backend API)
    localStorage.setItem('prakritiProfile', JSON.stringify(profile));
    
    alert('✅ Prakriti profile saved successfully! Redirecting to dashboard...');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
}

// Check camera availability on page load
document.addEventListener('DOMContentLoaded', () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Show questionnaire as fallback
        const questionnaireBtn = document.createElement('button');
        questionnaireBtn.className = 'upload-btn';
        questionnaireBtn.textContent = '📋 Use Questionnaire Instead';
        questionnaireBtn.style.margin = '2rem auto';
        questionnaireBtn.style.display = 'block';
        
        questionnaireBtn.onclick = () => {
            document.querySelector('.prakriti-container > div').style.display = 'none';
            document.querySelectorAll('.step-content').forEach(el => el.style.display = 'none');
            document.getElementById('questionnaireSection').style.display = 'block';
        };
        
        document.querySelector('.wizard-steps').after(questionnaireBtn);
    }
});
