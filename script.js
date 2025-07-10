// Global variables
let currentEmotion = null;
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let currentEnglishText = '';

// Emotion prompts for different emotions
const emotionPrompts = {
    '기쁨': {
        keywords: ['행복', '즐거움', '만족', '성취', '감사'],
        questions: [
            '오늘 무엇이 가장 기뻤나요?',
            '이 기쁨을 누구와 나누고 싶나요?',
            '이런 기분이 들게 한 특별한 순간이 있나요?'
        ]
    },
    '슬픔': {
        keywords: ['아쉬움', '그리움', '실망', '외로움', '눈물'],
        questions: [
            '무엇이 마음을 아프게 했나요?',
            '이 감정을 어떻게 표현하고 싶나요?',
            '위로받고 싶은 마음이 드나요?'
        ]
    },
    '분노': {
        keywords: ['화남', '짜증', '억울함', '불만', '스트레스'],
        questions: [
            '무엇이 화나게 했나요?',
            '이 감정을 어떻게 해소하고 싶나요?',
            '상황을 바꿀 수 있다면 어떻게 하고 싶나요?'
        ]
    },
    '불안': {
        keywords: ['걱정', '두려움', '긴장', '초조함', '스트레스'],
        questions: [
            '무엇이 불안하게 만드나요?',
            '이 걱정이 현실적인 걱정인가요?',
            '마음을 진정시키려면 무엇이 필요한가요?'
        ]
    },
    '평온': {
        keywords: ['차분함', '안정감', '편안함', '고요함', '여유'],
        questions: [
            '언제 가장 평온함을 느끼나요?',
            '이 평온함을 유지하려면 무엇이 필요한가요?',
            '누구와 함께 있을 때 편안한가요?'
        ]
    },
    '피곤': {
        keywords: ['지침', '무기력', '휴식', '잠', '회복'],
        questions: [
            '무엇이 가장 피곤하게 만드나요?',
            '어떤 휴식이 가장 필요한가요?',
            '에너지를 회복하려면 무엇이 도움이 될까요?'
        ]
    }
};

// Sample translations for demo
const sampleTranslations = {
    '오늘 기분이 좋았어요': 'I felt good today',
    '날씨가 좋아서 기분이 좋았습니다': 'I felt good because of the nice weather',
    '친구와 함께 시간을 보내서 행복했어요': 'I was happy to spend time with my friend',
    '오늘은 슬픈 하루였어요': 'Today was a sad day',
    '많은 일이 있어서 피곤했습니다': 'I was tired because of many things that happened',
    '스트레스가 많아서 화가 났어요': 'I was angry because of a lot of stress'
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set up initial state
    initializeDemo();
    
    // Add smooth scrolling for navigation
    setupSmoothScrolling();
    
    // Add intersection observer for animations
    setupScrollAnimations();
});

// Initialize demo functionality
function initializeDemo() {
    // Set up voice synthesis
    if ('speechSynthesis' in window) {
        // Voice synthesis is supported
        console.log('Speech synthesis supported');
    }
    
    // Set up speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        console.log('Speech recognition supported');
    }
}

// Smooth scrolling for navigation
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Setup scroll animations
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    });
    
    document.querySelectorAll('.feature-card, .persona-card').forEach(card => {
        observer.observe(card);
    });
}

// Scroll to demo section
function scrollToDemo() {
    document.getElementById('demo').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Tab switching functionality
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Emotion selection functionality
function selectEmotion(emoji, emotion) {
    currentEmotion = emotion;
    
    // Remove previous selections
    document.querySelectorAll('.emotion-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Add selected class to clicked button
    event.target.classList.add('selected');
    
    // Update selected emotion display
    const selectedEmotionDiv = document.getElementById('selectedEmotion');
    selectedEmotionDiv.innerHTML = `
        <p><strong>선택된 감정:</strong> ${emoji} ${emotion}</p>
    `;
    
    // Show emotion prompts
    showEmotionPrompts(emotion);
}

// Show emotion prompts
function showEmotionPrompts(emotion) {
    const promptsDiv = document.getElementById('emotionPrompts');
    const prompts = emotionPrompts[emotion];
    
    if (prompts) {
        promptsDiv.innerHTML = `
            <h4>💭 ${emotion} 감정에 대한 질문들:</h4>
            <ul>
                ${prompts.questions.map(q => `<li>${q}</li>`).join('')}
            </ul>
            <p><strong>관련 키워드:</strong> ${prompts.keywords.join(', ')}</p>
        `;
        promptsDiv.classList.add('active');
    }
}

// Process diary and move to translation
function processDiary() {
    const diaryText = document.getElementById('diaryText').value;
    
    if (!diaryText.trim()) {
        alert('일기를 먼저 작성해주세요!');
        return;
    }
    
    // Move to translation tab
    showTab('translate');
    
    // Fill in the Korean text
    document.getElementById('koreanText').value = diaryText;
    
    // Auto-translate if auto mode is selected
    const autoMode = document.querySelector('input[name="mode"]:checked').value;
    if (autoMode === 'auto') {
        setTimeout(() => {
            translateText();
        }, 500);
    }
}

// Translation functionality
function translateText() {
    const koreanText = document.getElementById('koreanText').value;
    const englishTextarea = document.getElementById('englishText');
    const mode = document.querySelector('input[name="mode"]:checked').value;
    
    if (!koreanText.trim()) {
        alert('번역할 텍스트를 입력해주세요!');
        return;
    }
    
    if (mode === 'auto') {
        // Show loading state
        englishTextarea.value = '번역 중...';
        
        // Simulate API call delay
        setTimeout(() => {
            const translation = getTranslation(koreanText);
            englishTextarea.value = translation;
            currentEnglishText = translation;
            
            // Show success message
            showMessage('번역이 완료되었습니다!', 'success');
        }, 1000);
    } else {
        // Manual mode - just clear the textarea for user input
        englishTextarea.value = '';
        englishTextarea.focus();
    }
}

// Get translation (simplified for demo)
function getTranslation(koreanText) {
    // Check for exact matches first
    for (const [korean, english] of Object.entries(sampleTranslations)) {
        if (koreanText.includes(korean)) {
            return english;
        }
    }
    
    // Generate a simple translation based on emotion
    if (currentEmotion) {
        const emotionTranslations = {
            '기쁨': 'I felt happy',
            '슬픔': 'I felt sad',
            '분노': 'I felt angry',
            '불안': 'I felt anxious',
            '평온': 'I felt peaceful',
            '피곤': 'I felt tired'
        };
        
        const baseTranslation = emotionTranslations[currentEmotion] || 'I had various feelings';
        return `${baseTranslation} today. ${koreanText.length > 50 ? 'I wrote about my emotions in detail.' : 'I expressed my feelings briefly.'}`;
    }
    
    return 'I wrote about my feelings today. This is a sample translation for demonstration purposes.';
}

// Move to speaking practice
function speakText() {
    const englishText = document.getElementById('englishText').value;
    
    if (!englishText.trim()) {
        alert('먼저 번역을 완료해주세요!');
        return;
    }
    
    currentEnglishText = englishText;
    
    // Move to speaking tab
    showTab('speak');
    
    // Update practice text
    document.getElementById('practiceText').innerHTML = `
        <p><strong>연습할 문장:</strong></p>
        <p>${englishText}</p>
    `;
}

// Play target audio (Text-to-Speech)
function playTargetAudio() {
    if (!currentEnglishText) {
        alert('연습할 텍스트가 없습니다!');
        return;
    }
    
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(currentEnglishText);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        speechSynthesis.speak(utterance);
    } else {
        showMessage('음성 합성을 지원하지 않는 브라우저입니다.', 'error');
    }
}

// Start recording
function startRecording() {
    if (isRecording) return;
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };
                
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    // Process recorded audio (simplified for demo)
                    processRecording(audioBlob);
                };
                
                mediaRecorder.start();
                isRecording = true;
                
                // Update UI
                document.querySelector('.speech-btn.record').disabled = true;
                document.querySelector('.speech-btn[onclick="stopRecording()"]').disabled = false;
                document.getElementById('recordingStatus').innerHTML = `
                    <div class="spinner"></div>
                    <p>녹음 중... 말하기 연습을 시작하세요!</p>
                `;
            })
            .catch(err => {
                console.error('Error accessing microphone:', err);
                showMessage('마이크 접근이 거부되었습니다.', 'error');
            });
    } else {
        showMessage('음성 녹음을 지원하지 않는 브라우저입니다.', 'error');
    }
}

// Stop recording
function stopRecording() {
    if (!isRecording) return;
    
    mediaRecorder.stop();
    isRecording = false;
    
    // Update UI
    document.querySelector('.speech-btn.record').disabled = false;
    document.querySelector('.speech-btn[onclick="stopRecording()"]').disabled = true;
    document.getElementById('recordingStatus').innerHTML = `
        <p>녹음이 완료되었습니다. 분석 중...</p>
    `;
    
    // Stop all tracks
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
}

// Process recording (simplified for demo)
function processRecording(audioBlob) {
    // Simulate pronunciation analysis
    setTimeout(() => {
        const feedback = generateFeedback();
        showPronunciationFeedback(feedback);
    }, 2000);
}

// Generate feedback (simplified for demo)
function generateFeedback() {
    const feedbackOptions = [
        {
            score: 85,
            message: '훌륭합니다! 발음이 매우 자연스럽네요.',
            suggestions: ['전반적으로 매우 좋은 발음입니다.', '리듬감이 자연스럽습니다.']
        },
        {
            score: 72,
            message: '좋은 발음이에요! 몇 가지 개선점이 있습니다.',
            suggestions: ['단어 사이의 간격을 조금 더 자연스럽게 해보세요.', '특정 음절의 강세를 조정해보세요.']
        },
        {
            score: 68,
            message: '괜찮은 발음입니다. 조금 더 연습하면 더 좋아질 거예요!',
            suggestions: ['좀 더 천천히 또박또박 말해보세요.', '자신감을 가지고 말해보세요.']
        }
    ];
    
    return feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
}

// Show pronunciation feedback
function showPronunciationFeedback(feedback) {
    const feedbackDiv = document.getElementById('pronunciationFeedback');
    
    feedbackDiv.innerHTML = `
        <h4>🎯 발음 분석 결과</h4>
        <div class="score-display">
            <div class="score-circle">
                <span class="score-number">${feedback.score}</span>
                <span class="score-label">점</span>
            </div>
        </div>
        <p class="feedback-message">${feedback.message}</p>
        <div class="suggestions">
            <h5>💡 개선 제안:</h5>
            <ul>
                ${feedback.suggestions.map(s => `<li>${s}</li>`).join('')}
            </ul>
        </div>
        <button class="action-btn primary" onclick="startRecording()">
            <i class="fas fa-redo"></i>
            다시 연습하기
        </button>
    `;
    
    feedbackDiv.classList.add('active');
    
    // Update recording status
    document.getElementById('recordingStatus').innerHTML = `
        <p>분석이 완료되었습니다. 아래 결과를 확인하세요!</p>
    `;
}

// Show message utility
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    
    // Find the current active tab
    const activeTab = document.querySelector('.tab-content.active .demo-card');
    if (activeTab) {
        activeTab.appendChild(messageDiv);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// Handle radio button changes
document.addEventListener('change', function(e) {
    if (e.target.name === 'mode') {
        const englishTextarea = document.getElementById('englishText');
        if (e.target.value === 'manual') {
            englishTextarea.placeholder = '여기에 직접 영작해보세요...';
            englishTextarea.readOnly = false;
        } else {
            englishTextarea.placeholder = '여기에 영어 번역이 나타납니다...';
            englishTextarea.readOnly = true;
        }
    }
});

// Add some interactive demo data
const demoData = {
    sampleDiaries: [
        {
            emotion: '기쁨',
            korean: '오늘 친구와 함께 맛있는 음식을 먹으면서 즐거운 시간을 보냈어요. 오랜만에 만나서 이야기를 나누니 정말 행복했습니다.',
            english: 'I had a great time eating delicious food with my friend today. I felt really happy talking and catching up after a long time.'
        },
        {
            emotion: '평온',
            korean: '공원에서 산책하며 자연을 보니 마음이 편안해졌어요. 바쁜 일상에서 벗어나 잠시나마 평온함을 느낄 수 있었습니다.',
            english: 'Walking in the park and seeing nature made me feel peaceful. I could feel calm for a moment, away from my busy daily life.'
        }
    ]
};

// Add sample diary button functionality
function loadSampleDiary() {
    const sample = demoData.sampleDiaries[Math.floor(Math.random() * demoData.sampleDiaries.length)];
    document.getElementById('diaryText').value = sample.korean;
    
    // Select corresponding emotion
    const emotionBtns = document.querySelectorAll('.emotion-btn');
    emotionBtns.forEach(btn => {
        if (btn.textContent.includes(sample.emotion)) {
            btn.click();
        }
    });
}

// Enhanced tab switching with smooth transitions
function showTab(tabName) {
    // Remove active class from all tabs and buttons
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Add active class to selected tab and button
    const selectedTab = document.getElementById(tabName + '-tab');
    const selectedButton = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    
    if (selectedTab) {
        selectedTab.classList.add('active');
        selectedTab.style.opacity = '0';
        
        setTimeout(() => {
            selectedTab.style.opacity = '1';
            selectedTab.style.transform = 'translateY(0)';
        }, 50);
    }
    
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
}

// Initialize page with enhanced features
document.addEventListener('DOMContentLoaded', function() {
    // Add sample diary button
    const diaryActions = document.querySelector('#diary-tab .demo-actions');
    if (diaryActions) {
        const sampleBtn = document.createElement('button');
        sampleBtn.className = 'action-btn secondary';
        sampleBtn.innerHTML = '<i class="fas fa-lightbulb"></i> 샘플 일기 보기';
        sampleBtn.onclick = loadSampleDiary;
        diaryActions.insertBefore(sampleBtn, diaryActions.firstChild);
    }
    
    // Add pronunciation feedback styles
    const style = document.createElement('style');
    style.textContent = `
        .score-display {
            text-align: center;
            margin: 20px 0;
        }
        
        .score-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            margin: 0 auto;
        }
        
        .score-number {
            font-size: 1.5rem;
            font-weight: 700;
        }
        
        .score-label {
            font-size: 0.8rem;
        }
        
        .feedback-message {
            font-size: 1.1rem;
            font-weight: 500;
            text-align: center;
            margin: 20px 0;
            color: #047857;
        }
        
        .suggestions {
            margin-top: 20px;
        }
        
        .suggestions h5 {
            color: #047857;
            margin-bottom: 10px;
        }
        
        .suggestions ul {
            list-style: none;
            padding: 0;
        }
        
        .suggestions li {
            background: #f0fdf4;
            padding: 8px 12px;
            margin: 5px 0;
            border-radius: 5px;
            border-left: 3px solid #10b981;
        }
    `;
    document.head.appendChild(style);
});