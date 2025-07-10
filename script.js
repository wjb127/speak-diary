// Global variables
let currentEmotion = null;
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let currentEnglishText = '';

// Demo data for new interactive demo
const demoData = {
    emotions: {
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
    },
    translations: {
        '오늘 친구와 카페에서 즐거운 시간을 보냈어요.': {
            english: 'I had a great time with my friend at the cafe today.',
            tip: '일상적인 경험을 표현할 때 "have a great time"은 매우 자연스러운 표현입니다.'
        },
        '시험 결과가 나와서 조금 걱정이 되네요.': {
            english: "I'm a bit worried about the test results.",
            tip: '"a bit"은 "조금"을 의미하는 자연스러운 표현으로, "a little"보다 구어적입니다.'
        },
        '오늘 하루 종일 바빠서 너무 피곤해요.': {
            english: "I'm so tired from being busy all day.",
            tip: '"from being busy"는 원인을 나타내는 자연스러운 표현입니다.'
        }
    },
    practice: {
        'I had a great time with my friend at the cafe today.': {
            pronunciation: '/aɪ hæd ə ɡreɪt taɪm wɪð maɪ frend æt ðə kæˈfeɪ təˈdeɪ/',
            tips: [
                '"great time"에서 "t" 연음 주의',
                '"with my"는 "wi-my"로 연결해서 발음',
                '"at the"는 "æt-ðə"로 자연스럽게 연결"'
            ]
        },
        "I'm a bit worried about the test results.": {
            pronunciation: '/aɪm ə bɪt ˈwɜrid əˈbaʊt ðə test rɪˈzʌlts/',
            tips: [
                '"I\'m a bit"은 빠르게 연결해서 발음',
                '"worried about"에서 "d" 연음 주의',
                '"test results"는 각각 명확하게 발음'
            ]
        },
        "I'm so tired from being busy all day.": {
            pronunciation: '/aɪm soʊ ˈtaɪərd frʌm ˈbiɪŋ ˈbɪzi ɔl deɪ/',
            tips: [
                '"so tired"에서 강세 주의',
                '"from being"은 자연스럽게 연결',
                '"all day"는 "ɔl-deɪ"로 연결해서 발음'
            ]
        }
    }
};

// Supabase 클라이언트 초기화
let supabase;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase client
    try {
        supabase = window.supabase.createClient(
            'https://bzzjkcrbwwrqlumxigag.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6emprY3Jid3dycWx1bXhpZ2FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg4MTM0OTUsImV4cCI6MjA0NDM4OTQ5NX0.yuQ9Ofc-s2sSHcRSU2_p9ZtcIL0yracXfVa48ZlmUNY'
        );
        console.log('Supabase client initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
    }
    
    // Set up initial state
    initializeDemo();
    
    // Add smooth scrolling for navigation
    setupSmoothScrolling();
    
    // Add intersection observer for animations
    setupScrollAnimations();
    
    // Initialize preorder functionality
    initializePreorder();
    
    // Initialize top preorder functionality
    initializeTopPreorder();
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

// Add sample diary button functionality
function loadSampleDiary() {
    const samples = [
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
    ];
    
    const sample = samples[Math.floor(Math.random() * samples.length)];
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
    
    // Initialize preorder form
    initializePreorder();
});

// Preorder Functionality
function initializePreorder() {
    const preorderForm = document.getElementById('preorderForm');
    if (preorderForm) {
        preorderForm.addEventListener('submit', handlePreorderSubmit);
    }
    
    // Service card click tracking
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            const serviceName = card.getAttribute('data-service');
            // 서비스 카드 클릭은 추적하지 않음
            
            // Update active state
            serviceCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
    });
}

// Top Preorder Functionality
function initializeTopPreorder() {
    const topPreorderForm = document.getElementById('topPreorderForm');
    if (topPreorderForm) {
        topPreorderForm.addEventListener('submit', handleTopPreorderSubmit);
    }
}

async function handleTopPreorderSubmit(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('topPreorderEmail');
    const marketingOptIn = document.getElementById('topMarketingOptIn').checked;
    const submitBtn = e.target.querySelector('.preorder-submit-btn');
    
    const email = emailInput.value.trim();
    const serviceName = 'speak-diary';
    
    // Validation
    if (!email || !isValidEmail(email)) {
        showTopPreorderMessage('올바른 이메일 주소를 입력해주세요.', 'error');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div> 주문 중...';
    
    try {
        // Submit preorder
        const result = await submitPreorder(email, serviceName, marketingOptIn);
        
        if (result.success) {
            showTopPreorderMessage('', 'success');
            emailInput.value = '';
            
            // 성공 시 폼 숨기기
            document.querySelector('.top-preorder-form').style.display = 'none';
        } else {
            showTopPreorderMessage(result.message || '주문 중 오류가 발생했습니다.', 'error');
        }
    } catch (error) {
        console.error('Top preorder error:', error);
        showTopPreorderMessage('주문 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> 사전 주문하기';
    }
}

function showTopPreorderMessage(message, type) {
    const successDiv = document.getElementById('topPreorderSuccessMessage');
    const errorDiv = document.getElementById('topPreorderErrorMessage');
    
    // Hide both messages first
    successDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    
    if (type === 'success') {
        successDiv.style.display = 'block';
        setTimeout(() => {
            successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    } else if (type === 'error') {
        errorDiv.querySelector('p').textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
}

async function handlePreorderSubmit(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('preorderEmail');
    const marketingOptIn = document.getElementById('marketingOptIn').checked;
    const submitBtn = document.querySelector('.preorder-submit-btn');
    const activeServiceCard = document.querySelector('.service-card.active');
    
    const email = emailInput.value.trim();
    const serviceName = activeServiceCard ? activeServiceCard.getAttribute('data-service') : 'speak-diary';
    
    // Validation
    if (!email || !isValidEmail(email)) {
        showPreorderMessage('올바른 이메일 주소를 입력해주세요.', 'error');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div> 주문 중...';
    
    try {
        // Submit preorder
        const result = await submitPreorder(email, serviceName, marketingOptIn);
        
        if (result.success) {
            showPreorderMessage('', 'success');
            emailInput.value = '';
            
            // 성공 시 폼 숨기기
            document.querySelector('.preorder-form').style.display = 'none';
        } else {
            showPreorderMessage(result.message || '주문 중 오류가 발생했습니다.', 'error');
        }
    } catch (error) {
        console.error('Preorder error:', error);
        showPreorderMessage('주문 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> 사전 주문하기';
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showPreorderMessage(message, type) {
    const successDiv = document.getElementById('preorderSuccessMessage');
    const errorDiv = document.getElementById('preorderErrorMessage');
    
    // Hide both messages first
    successDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    
    if (type === 'success') {
        successDiv.style.display = 'block';
        setTimeout(() => {
            successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    } else if (type === 'error') {
        errorDiv.querySelector('p').textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
}

// 클릭 추적 함수 - 사전예약과 체험해보기만 추적
async function trackButtonClick(actionType) {
    try {
        // 사전예약과 체험해보기만 추적
        if (actionType !== 'preorder' && actionType !== 'experience') {
            return;
        }
        
        const serviceName = 'speak-diary';
        
        const { data, error } = await supabase
            .from('preorder_clicks')
            .insert([
                { service: serviceName }
            ]);
        
        if (error) throw error;
        console.log(`Click tracked: ${actionType} for ${serviceName}`);
    } catch (error) {
        console.error('클릭 추적 오류:', error);
        // 클릭 추적 실패는 사용자 경험에 영향을 주지 않도록 조용히 처리
    }
}

// Supabase 연동 함수
async function submitBetaSignup(email) {
    try {
        // 중복 이메일 체크
        const emailExists = await checkEmailExists(email);
        if (emailExists) {
            return {
                success: false,
                message: '이미 신청된 이메일입니다.'
            };
        }
        
        // 베타 신청 저장
        const result = await saveBetaSignup(email);
        return {
            success: true,
            message: '베타 신청이 완료되었습니다!'
        };
    } catch (error) {
        console.error('Beta signup error:', error);
        return {
            success: false,
            message: '신청 중 오류가 발생했습니다. 다시 시도해주세요.'
        };
    }
}

// 사전 주문 제출 함수
async function submitPreorder(email, serviceName, marketingOptIn) {
    try {
        console.log('Submitting preorder:', { email, serviceName, marketingOptIn });
        
        // Supabase 연결 확인
        if (!supabase) {
            console.error('Supabase not initialized');
            return {
                success: false,
                message: 'Supabase 연결 오류가 발생했습니다.'
            };
        }
        
        // 중복 이메일 체크
        const { data: existingData, error: checkError } = await supabase
            .from('preorders')
            .select('*')
            .eq('email', email)
            .eq('service', serviceName);
        
        if (checkError) {
            console.error('Check error:', checkError);
            throw checkError;
        }
        
        if (existingData && existingData.length > 0) {
            return {
                success: false,
                message: '이미 해당 서비스에 신청된 이메일입니다.'
            };
        }
        
        // 사전 주문 저장 - 요청하신 데이터 구조로 저장
        const insertData = {
            service: serviceName,
            email: email,
            marketing_opt_in: marketingOptIn
        };
        
        console.log('Inserting data:', insertData);
        
        const { data, error } = await supabase
            .from('preorders')
            .insert([insertData])
            .select();
        
        if (error) {
            console.error('Insert error:', error);
            throw error;
        }
        
        console.log('Insert successful:', data);
        
        return {
            success: true,
            message: '사전 주문이 완료되었습니다!'
        };
    } catch (error) {
        console.error('Preorder error:', error);
        return {
            success: false,
            message: `주문 중 오류가 발생했습니다: ${error.message || '다시 시도해주세요.'}`
        };
    }
}

// New Demo Functions
function showEmotionExample(emoji, emotion) {
    // Remove previous selections
    document.querySelectorAll('.emotion-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Add selected class to clicked button
    event.target.classList.add('selected');
    
    const resultDiv = document.getElementById('diaryResult');
    const emotionData = demoData.emotions[emotion];
    
    if (emotionData) {
        // 먼저 로딩 상태 표시
        resultDiv.innerHTML = `
            <div class="demo-result-content">
                <h5><i class="fas fa-heart"></i> ${emoji} ${emotion} 감정 분석</h5>
                
                <div class="keywords">
                    ${emotionData.keywords.map(keyword => 
                        `<span class="keyword-tag">${keyword}</span>`
                    ).join('')}
                </div>
                
                <div class="questions">
                    <h6>💭 생각해볼 질문들:</h6>
                    <ul>
                        ${emotionData.questions.map(q => `<li>${q}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="translation-section">
                    <h6><i class="fas fa-language"></i> 영어 번역:</h6>
                    <div class="translation-loading">
                        <div class="spinner"></div>
                        <span>번역 중...</span>
                    </div>
                </div>
                
                <div class="learning-tip">
                    <strong>💡 실제 서비스에서는</strong> 선택한 감정에 따라 개인화된 질문과 키워드가 제공되어 더 깊이 있는 일기 작성을 도와드립니다.
                </div>
            </div>
        `;
        
        // 1.5초 후 번역 결과 표시
        setTimeout(() => {
            const translationSection = resultDiv.querySelector('.translation-section');
            if (translationSection) {
                const translations = getEmotionTranslations(emotion);
                translationSection.innerHTML = `
                    <h6><i class="fas fa-language"></i> 영어 번역:</h6>
                    <div class="translation-results">
                        ${translations.map(trans => `
                            <div class="translation-item">
                                <div class="korean-text">${trans.korean}</div>
                                <div class="english-text">${trans.english}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }, 1500);
    }
}

function showTranslationExample(koreanText) {
    // Remove previous selections
    document.querySelectorAll('.sentence-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    const resultDiv = document.getElementById('translationResult');
    const translationData = demoData.translations[koreanText];
    
    if (translationData) {
        resultDiv.innerHTML = `
            <div class="demo-result-content">
                <h5><i class="fas fa-language"></i> 번역 결과</h5>
                
                <div class="korean-text">
                    <strong>한국어:</strong> ${koreanText}
                </div>
                
                <div class="english-text">
                    <strong>English:</strong> ${translationData.english}
                </div>
                
                <div class="learning-tip">
                    <strong>💡 학습 팁:</strong> ${translationData.tip}
                </div>
            </div>
        `;
    }
}

function showPracticeExample(englishText) {
    // Remove previous selections
    document.querySelectorAll('.practice-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    const resultDiv = document.getElementById('practiceResult');
    const practiceData = demoData.practice[englishText];
    
    if (practiceData) {
        resultDiv.innerHTML = `
            <div class="demo-result-content">
                <h5><i class="fas fa-microphone"></i> 발음 연습 가이드</h5>
                
                <div class="english-text">
                    <strong>문장:</strong> ${englishText}
                </div>
                
                <div class="korean-text">
                    <strong>발음 기호:</strong> ${practiceData.pronunciation}
                </div>
                
                <div class="learning-tip">
                    <strong>💡 발음 팁:</strong>
                    <ul>
                        ${practiceData.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
}

// 감정별 번역 데이터 제공 함수
function getEmotionTranslations(emotion) {
    const emotionTranslations = {
        '기쁨': [
            { korean: '오늘 정말 기분이 좋았어요', english: 'I felt really good today' },
            { korean: '행복한 하루였습니다', english: 'It was a happy day' },
            { korean: '마음이 따뜻해졌어요', english: 'My heart felt warm' }
        ],
        '슬픔': [
            { korean: '마음이 아파요', english: 'My heart hurts' },
            { korean: '눈물이 나올 것 같아요', english: 'I feel like crying' },
            { korean: '외로운 기분이에요', english: 'I feel lonely' }
        ],
        '분노': [
            { korean: '정말 화가 나요', english: 'I am really angry' },
            { korean: '짜증이 나는 하루였어요', english: 'It was a frustrating day' },
            { korean: '스트레스를 받았어요', english: 'I was stressed' }
        ],
        '불안': [
            { korean: '걱정이 많아요', english: 'I have many worries' },
            { korean: '불안한 마음이에요', english: 'I feel anxious' },
            { korean: '긴장되는 상황이었어요', english: 'It was a tense situation' }
        ],
        '평온': [
            { korean: '마음이 평온해요', english: 'I feel peaceful' },
            { korean: '차분한 기분이에요', english: 'I feel calm' },
            { korean: '편안한 하루였어요', english: 'It was a comfortable day' }
        ],
        '피곤': [
            { korean: '너무 피곤해요', english: 'I am so tired' },
            { korean: '지친 하루였어요', english: 'It was an exhausting day' },
            { korean: '휴식이 필요해요', english: 'I need some rest' }
        ]
    };
    
    return emotionTranslations[emotion] || [];
}

// 네비게이션 링크는 HTML에서 직접 관리