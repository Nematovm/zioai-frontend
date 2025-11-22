const API_URL = "https://zioai-backend.onrender.com";

// API Configuration
const API_BASE_URL = "/api";

// Sidebar Toggle
const sidebar = document.querySelector(".sidebar");
const sidebarToggler = document.querySelector(".sidebar-toggler");
const menuToggler = document.querySelector(".menu-toggler");

sidebarToggler.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
});

const toggleMenu = (isMenuActive) => {
  sidebar.style.height = isMenuActive ? `${sidebar.scrollHeight}px` : "56px";
  menuToggler.querySelector("span").innerText = isMenuActive ? "close" : "menu";
};

menuToggler.addEventListener("click", () => {
  toggleMenu(sidebar.classList.toggle("menu-active"));
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024) {
    sidebar.style.height = "calc(100vh - 32px)";
  } else {
    sidebar.classList.remove("collapsed");
    sidebar.style.height = "auto";
    toggleMenu(sidebar.classList.contains("menu-active"));
  }
});

// Tool Navigation
const navLinks = document.querySelectorAll(".nav-link[data-tool]");
const toolCards = document.querySelectorAll(".tool-card[data-tool]");
const toolContents = document.querySelectorAll(".tool-content");
const headerTitle = document.getElementById("headerTitle");
const headerSubtitle = document.getElementById("headerSubtitle");

const toolTitles = {
  dashboard: {
    title: "Welcome back, Student!",
    subtitle: "Select a tool below to get started",
  },
  homework: {
    title: "Homework Fixer",
    subtitle: "Paste your homework and get instant corrections",
  },
  grammar: {
    title: "Grammar Checker",
    subtitle: "Check and improve your grammar",
  },
  vocabulary: {
    title: "Vocabulary Builder",
    subtitle: "Learn new words with examples",
  },
};

function switchTool(toolName) {
  navLinks.forEach((link) => link.classList.remove("active"));
  const activeLink = document.querySelector(
    `.nav-link[data-tool="${toolName}"]`
  );
  if (activeLink) activeLink.classList.add("active");

  toolContents.forEach((content) => content.classList.remove("active"));
  const activeContent = document.getElementById(`${toolName}-content`);
  if (activeContent) activeContent.classList.add("active");

  if (toolTitles[toolName]) {
    headerTitle.textContent = toolTitles[toolName].title;
    headerSubtitle.textContent = toolTitles[toolName].subtitle;
  }

  if (window.innerWidth < 1024) {
    sidebar.classList.remove("menu-active");
    toggleMenu(false);
  }
}

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    switchTool(link.getAttribute("data-tool"));
  });
});

toolCards.forEach((card) => {
  card.addEventListener("click", () => {
    switchTool(card.getAttribute("data-tool"));
  });
});

// Helper Functions
function showLoading(outputElement) {
  outputElement.innerHTML = `
    <div style="text-align: center; padding: 30px;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p style="margin-top: 15px; color: #6b7280;">AI processing...</p>
    </div>
  `;
}

function showError(outputElement, message) {
  outputElement.innerHTML = `
    <div class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <strong>Error:</strong> ${message}
    </div>
  `;
}

// IMAGE UPLOAD SYSTEM
let currentHomeworkTab = "text";
let uploadedImageBase64 = null;

function switchHomeworkTab(tab) {
  currentHomeworkTab = tab;

  const textTab = document.getElementById("textInputTab");
  const imageTab = document.getElementById("imageInputTab");
  const textBtn = document.getElementById("textTabBtn");
  const imageBtn = document.getElementById("imageTabBtn");

  if (tab === "text") {
    textTab.style.display = "block";
    imageTab.style.display = "none";
    textBtn.style.background =
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    textBtn.style.color = "white";
    imageBtn.style.background = "#f3f4f6";
    imageBtn.style.color = "#6b7280";
  } else {
    textTab.style.display = "none";
    imageTab.style.display = "block";
    imageBtn.style.background =
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    imageBtn.style.color = "white";
    textBtn.style.background = "#f3f4f6";
    textBtn.style.color = "#6b7280";
  }
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert("Image size must be less than 5MB!");
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("Please upload an image file!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    uploadedImageBase64 = e.target.result;
    document.getElementById("previewImg").src = e.target.result;
    document.getElementById("imageFileName").textContent = file.name;
    document.getElementById("imagePreview").style.display = "block";
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  uploadedImageBase64 = null;
  document.getElementById("imagePreview").style.display = "none";
  document.getElementById("homeworkImageInput").value = "";
}

// HOMEWORK FIXER - WITH LAN
async function fixHomework() {
  const result = document.getElementById("homeworkResult");
  const output = document.getElementById("homeworkOutput");

  // TIL OLISH
  const languageDropdown = document.getElementById("homework-language");
  const language = languageDropdown ? languageDropdown.value : "uz";

  console.log("🌐 Homework Til:", language);

  let homeworkContent = "";

  if (currentHomeworkTab === "text") {
    homeworkContent = document.getElementById("homeworkInput").value;
    if (!homeworkContent.trim()) {
      alert("Please enter your homework!");
      return;
    }
  } else {
    if (!uploadedImageBase64) {
      alert("Please upload an image!");
      return;
    }
    homeworkContent = uploadedImageBase64;
  }

  result.style.display = "block";
  showLoading(output);

  try {
    const requestBody = {
      homework: currentHomeworkTab === "text" ? homeworkContent : null,
      image: currentHomeworkTab === "image" ? homeworkContent : null,
      type: currentHomeworkTab,
      language: language,
    };

    console.log("📤 Yuborilayotgan:", requestBody);

    const response = await fetch(`${API_URL}${API_BASE_URL}/fix-homework`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Server error");
    }

    if (data.success && data.correctedHomework) {
      output.innerHTML = `
        <div class="alert alert-success">
          <h5 class="alert-heading">
            <i class="bi bi-check-circle-fill"></i> AI Analysis
          </h5>
          <hr>
          <div style="white-space: pre-wrap; line-height: 1.8;">
            ${data.correctedHomework}
          </div>
        </div>
      `;

      if (currentHomeworkTab === "image") {
        removeImage();
      }
    } else {
      throw new Error("No response from AI");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    showError(output, error.message);
  }
}

// ============================================
// GRAMMAR CHECKER - TIL BILAN ✅
// ============================================
async function checkGrammar() {
  const input = document.getElementById("grammarInput").value;
  const result = document.getElementById("grammarResult");
  const output = document.getElementById("grammarOutput");

  // TIL OLISH
  const languageDropdown = document.getElementById("grammar-language");
  const language = languageDropdown ? languageDropdown.value : "uz";

  console.log("🌐 Grammar Til:", language);

  if (!input.trim()) {
    alert("Please enter text!");
    return;
  }

  result.style.display = "block";
  showLoading(output);

  try {
    const response = await fetch(`${API_URL}${API_BASE_URL}/check-grammar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: input,
        language: language,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Server error");
    }

    if (data.success && data.result) {
      output.innerHTML = `
        <div class="alert alert-info">
          <div style="white-space: pre-wrap; line-height: 1.8;">
            ${data.result}
          </div>
        </div>
      `;
    } else {
      throw new Error("No response from AI");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    showError(output, error.message);
  }
}

// ============================================
// AUTOMATIC LANGUAGE DETECTION ✅
// ============================================
function detectWordLanguage(word) {
  // Kirill harflar - Ruscha
  const cyrillicPattern = /[\u0400-\u04FF]/;
  if (cyrillicPattern.test(word)) {
    return "ru-RU";
  }

  // Lotin harflar - Inglizcha yoki O'zbekcha
  const latinPattern = /^[a-zA-Z\s]+$/;
  if (latinPattern.test(word)) {
    // Inglizcha so'zlar (eng keng tarqalgan)
    const commonEnglishWords = [
      "the",
      "be",
      "to",
      "of",
      "and",
      "a",
      "in",
      "that",
      "have",
      "i",
      "it",
      "for",
      "not",
      "on",
      "with",
      "he",
      "as",
      "you",
      "do",
      "at",
      "this",
      "but",
      "his",
      "by",
      "from",
      "they",
      "we",
      "say",
      "her",
      "she",
      "or",
      "an",
      "will",
      "my",
      "one",
      "all",
      "would",
      "there",
      "their",
    ];

    // O'zbekcha uchun maxsus harflar
    const uzbekPattern = /[oʻgʻ]/i;
    if (uzbekPattern.test(word)) {
      return "tr-TR"; // O'zbek uchun turkcha yaqin
    }

    // Agar so'z inglizcha lug'atda bo'lsa
    const lowerWord = word.toLowerCase();
    if (commonEnglishWords.includes(lowerWord)) {
      return "en-US";
    }

    // So'z uzunligi va tuzilishiga qarab
    // Inglizcha so'zlar ko'proq 'th', 'ch', 'sh' kombinatsiyalariga ega
    if (/th|ch|sh|wh|ph/.test(word.toLowerCase())) {
      return "en-US";
    }

    // Default: Inglizcha (lotin alifbosi uchun)
    return "en-US";
  }

  // O'zbek-lotin alifbosi (apostroflar bilan)
  const uzbekLatinPattern = /[oʻgʻ]/;
  if (uzbekLatinPattern.test(word)) {
    return "tr-TR";
  }

  // Default: Inglizcha
  return "en-US";
}

// ============================================
// VOCABULARY BUILDER - YANGILANGAN ✅
// ============================================
async function buildVocab() {
  const input = document.getElementById("vocabInput").value;
  const result = document.getElementById("vocabResult");
  const output = document.getElementById("vocabOutput");

  const languageDropdown = document.getElementById("vocab-language");
  const language = languageDropdown ? languageDropdown.value : "uz";

  console.log("🌐 Interface Til:", language);
  console.log("📝 Kiritilgan so'z:", input);

  if (!input.trim()) {
    alert("Please enter a word!");
    return;
  }

  result.style.display = "block";
  showLoading(output);

  try {
    const response = await fetch(`${API_URL}${API_BASE_URL}/vocabulary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        word: input,
        language: language,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Server error");
    }

    if (data.success && data.result) {
      // ✅ So'z tilini avtomatik aniqlash
      const wordLanguage = detectWordLanguage(input);
      console.log("🔊 So'z tili:", wordLanguage);

      output.innerHTML = `
        <div class="alert alert-warning">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h5 style="margin: 0; color: #1f2937;">
              <i class="bi bi-book"></i> ${data.word || input}
            </h5>
            <button 
              onclick="playPronunciation('${(data.word || input).replace(/'/g, "\\'")}')" 
              class="audio-btn"
              title="Listen to pronunciation">
              <i class="bi bi-volume-up-fill"></i> Eshitish
            </button>
          </div>
          <hr style="margin: 12px 0;">
          <div style="white-space: pre-wrap; line-height: 1.8;">
            ${data.result}
          </div>
        </div>
      `;
    } else {
      throw new Error("No response from AI");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    showError(output, error.message);
  }
}

// ============================================
// AUDIO PRONUNCIATION - GOOGLE TTS ✅
// ============================================
function playPronunciation(word) {
  const audioBtn = event.target.closest(".audio-btn");
  
  // Tugma holatini o'zgartirish
  if (audioBtn) {
    audioBtn.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
    audioBtn.innerHTML = '<i class="bi bi-volume-mute-fill"></i> Playing...';
  }

  // Google Translate TTS - barcha browserlarda bir xil ishlaydi
  const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(word)}&tl=en&client=tw-ob`;
  
  const audio = new Audio(audioUrl);
  
  audio.onended = () => {
    if (audioBtn) {
      audioBtn.style.background = "";
      audioBtn.innerHTML = '<i class="bi bi-volume-up-fill"></i> Eshitish';
    }
  };

  audio.onerror = (e) => {
    console.error("Google TTS xatosi, zaxira variantga o'tilmoqda...", e);
    // Zaxira: Browser TTS
    fallbackSpeech(word, audioBtn);
  };

  audio.play().catch(error => {
    console.error("Audio play xatosi:", error);
    fallbackSpeech(word, audioBtn);
  });

  console.log("🔊 Google TTS talaffuz:", word);
}

// Zaxira variant - Browser TTS
function fallbackSpeech(word, audioBtn) {
  if (!("speechSynthesis" in window)) {
    alert("Sizning brauzeringiz audio talaffuzni qo'llab-quvvatlamaydi!");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.75;
  utterance.pitch = 1;
  utterance.volume = 1;

  utterance.onend = () => {
    if (audioBtn) {
      audioBtn.style.background = "";
      audioBtn.innerHTML = '<i class="bi bi-volume-up-fill"></i> Eshitish';
    }
  };

  utterance.onerror = () => {
    if (audioBtn) {
      audioBtn.style.background = "";
      audioBtn.innerHTML = '<i class="bi bi-volume-up-fill"></i> Eshitish';
    }
  };

  window.speechSynthesis.speak(utterance);
  console.log("🔊 Fallback TTS ishlatilmoqda:", word);
}

// ============================================
// MOTIVATION SYSTEM
// ============================================
let motivationInterval;

async function showMotivation() {
  try {
    const response = await fetch(`${API_URL}/api/motivation`);
    const data = await response.json();

    if (data.success) {
      const toast = document.getElementById("motivationToast");
      const text = document.querySelector(".motivation-text");

      text.textContent = data.quote;
      toast.classList.add("show");

      setTimeout(() => {
        toast.classList.remove("show");
      }, 10000);
    }
  } catch (error) {
    console.error("Motivatsiya xatosi:", error);
  }
}

function closeMotivation() {
  document.getElementById("motivationToast").classList.remove("show");
}

function startMotivationSystem() {
  setTimeout(() => {
    showMotivation();
  }, 5000);

  motivationInterval = setInterval(() => {
    showMotivation();
  }, 300000);
}

// ============================================
// POMODORO TIMER
// ============================================
let miniTimerInterval;
let miniTimeLeft = 25 * 60;
let miniTimerRunning = false;
let currentMode = "pomodoro";
let pomodoroMinutes = 25;
let breakMinutes = 5;
let soundEnabled = true;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

function updateMiniTimerDisplay() {
  document.getElementById("miniTimerDisplay").textContent =
    formatTime(miniTimeLeft);
}

function startMiniTimer() {
  if (miniTimerRunning) return;

  miniTimerRunning = true;
  document.getElementById("miniStartBtn").style.display = "none";
  document.getElementById("miniPauseBtn").style.display = "flex";

  miniTimerInterval = setInterval(() => {
    miniTimeLeft--;
    updateMiniTimerDisplay();

    if (miniTimeLeft <= 0) {
      clearInterval(miniTimerInterval);
      miniTimerRunning = false;
      onTimerComplete();
    }
  }, 1000);
}

function pauseMiniTimer() {
  miniTimerRunning = false;
  clearInterval(miniTimerInterval);
  document.getElementById("miniStartBtn").style.display = "flex";
  document.getElementById("miniPauseBtn").style.display = "none";
}

function resetMiniTimer() {
  pauseMiniTimer();
  if (currentMode === "pomodoro") {
    miniTimeLeft = pomodoroMinutes * 60;
  } else {
    miniTimeLeft = breakMinutes * 60;
  }
  updateMiniTimerDisplay();
}

function onTimerComplete() {
  if (soundEnabled) {
    playNotificationSound();
  }

  const notification = document.getElementById("timerNotification");
  const icon = document.getElementById("notificationIcon");
  const title = document.getElementById("notificationTitle");
  const message = document.getElementById("notificationMessage");

  if (currentMode === "pomodoro") {
    icon.textContent = "🎉";
    title.textContent = "Pomodoro Complete!";
    message.textContent = "Great work! Time for a break?";
  } else {
    icon.textContent = "🍅";
    title.textContent = "Break Over!";
    message.textContent = "Ready to start another Pomodoro?";
  }

  notification.classList.add("active");

  document.getElementById("miniStartBtn").style.display = "flex";
  document.getElementById("miniPauseBtn").style.display = "none";
}

function playNotificationSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const playBeep = (frequency, startTime, duration) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };

  const now = audioContext.currentTime;

  playBeep(523.25, now, 0.15);
  playBeep(659.25, now + 0.15, 0.15);
  playBeep(783.99, now + 0.3, 0.25);
}

function startBreakTimer() {
  currentMode = "break";
  miniTimeLeft = breakMinutes * 60;
  document.getElementById("timerLabel").textContent = "Break Time";
  document.getElementById("timerNotification").classList.remove("active");
  updateMiniTimerDisplay();
  startMiniTimer();
}

function restartPomodoro() {
  currentMode = "pomodoro";
  miniTimeLeft = pomodoroMinutes * 60;
  document.getElementById("timerLabel").textContent = "Pomodoro";
  document.getElementById("timerNotification").classList.remove("active");
  updateMiniTimerDisplay();
  startMiniTimer();
}

function openTimerSettings() {
  document.getElementById("timerSettingsModal").classList.add("active");
}

function closeTimerSettings() {
  document.getElementById("timerSettingsModal").classList.remove("active");
}

function setPomodoroTime(minutes) {
  pomodoroMinutes = minutes;
  document
    .querySelectorAll(".setting-group:first-child .time-option")
    .forEach((btn) => {
      btn.classList.remove("active");
    });
  event.target.classList.add("active");
}

function setBreakTime(minutes) {
  breakMinutes = minutes;
  document
    .querySelectorAll(".setting-group:nth-child(2) .time-option")
    .forEach((btn) => {
      btn.classList.remove("active");
    });
  event.target.classList.add("active");
}

function saveTimerSettings() {
  soundEnabled = document.getElementById("soundToggle").checked;

  if (currentMode === "pomodoro") {
    miniTimeLeft = pomodoroMinutes * 60;
  } else {
    miniTimeLeft = breakMinutes * 60;
  }

  updateMiniTimerDisplay();
  closeTimerSettings();
  showMotivation();
}

// ============================================
// PAGE LOAD
// ============================================
window.addEventListener("load", () => {
  updateMiniTimerDisplay();
  startMotivationSystem();

  setTimeout(() => {
    document.querySelector(".spinner-wrapper").style.display = "none";
  }, 500);
});

window.addEventListener("beforeunload", () => {
  if (motivationInterval) {
    clearInterval(motivationInterval);
  }
});

/* ========================================
   QUIZ GENERATOR FUNCTIONALITY - YANGILANGAN
======================================== */

let quizData = null;
let currentQuizQuestion = 0;
let quizAnswers = [];
let quizSelectedAnswer = null;
let quizTimeLeft = 0;
let quizTimerInterval = null;

// Generate Quiz Questions - SERVER ORQALI
async function generateQuizQuestions() {
  const article = document.getElementById("quizArticleInput").value.trim();
  const questionCount = parseInt(
    document.getElementById("quizQuestionCount").value
  );
  const difficulty = document.getElementById("quizDifficulty").value;
  const language = document.getElementById("quiz-language").value;

  if (!article) {
    alert("Iltimos, matn kiriting!");
    return;
  }

  // Show loading
  const generateBtn = event.target;
  const originalText = generateBtn.innerHTML;
  generateBtn.disabled = true;
  generateBtn.innerHTML =
    '<i class="bi bi-hourglass-split"></i> Yaratilmoqda...';

  try {
    console.log("📤 Quiz so'rov yuborilmoqda...", {
      articleLength: article.length,
      questionCount,
      difficulty,
      language,
    });

    // SERVER GA SO'ROV YUBORISH
    const response = await fetch(`${API_URL}/api/generate-quiz`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        article: article,
        questionCount: questionCount,
        difficulty: difficulty,
        language: language,
      }),
    });

    console.log("📥 Server javobi:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Server xatosi");
    }

    const data = await response.json();
    console.log("✅ Quiz yaratildi:", data);

    if (!data.success || !data.questions) {
      throw new Error("Quiz yaratilmadi");
    }

    // Quiz ma'lumotlarini saqlash
    quizData = { questions: data.questions };
    currentQuizQuestion = 0;
    quizAnswers = [];
    quizSelectedAnswer = null;

    // Timer sozlash (1 daqiqa har bir savol uchun)
    quizTimeLeft = questionCount * 60;

    // Ko'rinishni o'zgartirish
    document.getElementById("quizInputForm").style.display = "none";
    document.getElementById("quizQuestionsSection").style.display = "block";
    document.getElementById("quizResultsSection").style.display = "none";

    // Timerni boshlash
    startQuizTimer();

    // Birinchi savolni ko'rsatish
    displayQuizQuestion();
  } catch (error) {
    console.error("❌ Xatolik:", error);
    alert(
      "Xatolik yuz berdi: " +
        error.message +
        "\n\nIltimos, qaytadan urinib ko'ring."
    );
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = originalText;
  }
}

// Display Quiz Question
function displayQuizQuestion() {
  if (!quizData || !quizData.questions) {
    console.error("❌ Quiz ma'lumotlari yo'q");
    return;
  }

  const question = quizData.questions[currentQuizQuestion];
  const totalQuestions = quizData.questions.length;

  // Update question counter
  document.getElementById("quizCurrentQuestion").textContent =
    currentQuizQuestion + 1;
  document.getElementById("quizTotalQuestions").textContent = totalQuestions;

  // Update progress bar
  const progress = ((currentQuizQuestion + 1) / totalQuestions) * 100;
  document.getElementById("quizProgressBar").style.width = progress + "%";

  // Display question text
  document.getElementById("quizQuestionText").textContent = question.question;

  // Display options
  const optionsContainer = document.getElementById("quizOptionsContainer");
  optionsContainer.innerHTML = "";

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "quiz-option";
    button.textContent = option;
    button.onclick = () => selectQuizAnswer(index);
    optionsContainer.appendChild(button);
  });

  // Reset selected answer
  quizSelectedAnswer = null;
  document.getElementById("quizNextBtn").disabled = true;

  // Update button text
  const nextBtnText = document.getElementById("quizNextBtnText");
  if (currentQuizQuestion < totalQuestions - 1) {
    nextBtnText.textContent = "Keyingi Savol";
  } else {
    nextBtnText.textContent = "Yakunlash";
  }
}

// Select Quiz Answer
function selectQuizAnswer(index) {
  quizSelectedAnswer = index;

  // Remove selected class from all options
  const options = document.querySelectorAll(".quiz-option");
  options.forEach((opt) => opt.classList.remove("selected"));

  // Add selected class to chosen option
  options[index].classList.add("selected");

  // Enable next button
  document.getElementById("quizNextBtn").disabled = false;
}

// Next Quiz Question
function nextQuizQuestion() {
  // Save answer
  quizAnswers.push(quizSelectedAnswer);

  // Check if there are more questions
  if (currentQuizQuestion < quizData.questions.length - 1) {
    currentQuizQuestion++;
    displayQuizQuestion();
  } else {
    // Show results
    finishQuiz();
  }
}

// Start Quiz Timer
function startQuizTimer() {
  if (quizTimerInterval) {
    clearInterval(quizTimerInterval);
  }

  quizTimerInterval = setInterval(() => {
    quizTimeLeft--;

    // Update timer display
    const minutes = Math.floor(quizTimeLeft / 60);
    const seconds = quizTimeLeft % 60;
    const timerDisplay = document.getElementById("quizTimer");
    timerDisplay.textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;

    // Warning colors
    if (quizTimeLeft <= 60) {
      timerDisplay.classList.add("warning");
    }
    if (quizTimeLeft <= 30) {
      timerDisplay.classList.remove("warning");
      timerDisplay.classList.add("danger");
    }

    // Time's up
    if (quizTimeLeft <= 0) {
      clearInterval(quizTimerInterval);
      finishQuiz();
    }
  }, 1000);
}

// Finish Quiz
function finishQuiz() {
  // Stop timer
  if (quizTimerInterval) {
    clearInterval(quizTimerInterval);
  }

  // Hide quiz section
  document.getElementById("quizQuestionsSection").style.display = "none";

  // Show results
  displayQuizResults();
}

// Display Quiz Results
function displayQuizResults() {
  // Calculate score
  let score = 0;
  quizData.questions.forEach((question, index) => {
    if (quizAnswers[index] === question.correctAnswer) {
      score++;
    }
  });

  const totalQuestions = quizData.questions.length;
  const percentage = ((score / totalQuestions) * 100).toFixed(0);

  // Update score display
  document.getElementById(
    "quizScoreDisplay"
  ).textContent = `${score}/${totalQuestions}`;
  document.getElementById(
    "quizPercentageDisplay"
  ).textContent = `${percentage}% to'g'ri!`;

  // Display detailed answers
  const reviewContainer = document.getElementById("quizAnswersReview");
  reviewContainer.innerHTML = "";

  quizData.questions.forEach((question, index) => {
    const userAnswer = quizAnswers[index];
    const correctAnswer = question.correctAnswer;
    const isCorrect = userAnswer === correctAnswer;

    const reviewItem = document.createElement("div");
    reviewItem.className = `quiz-review-item ${
      isCorrect ? "correct" : "incorrect"
    }`;

    reviewItem.innerHTML = `
      <div class="quiz-review-question">
        ${index + 1}. ${question.question}
      </div>
      <div class="quiz-review-answer user ${
        isCorrect ? "correct" : "incorrect"
      }">
        ${isCorrect ? "✅" : "❌"} Sizning javobingiz: ${
      question.options[userAnswer] || "Javob berilmagan"
    }
      </div>
      ${
        !isCorrect
          ? `
        <div class="quiz-review-answer correct-answer">
          ✅ To'g'ri javob: ${question.options[correctAnswer]}
        </div>
      `
          : ""
      }
      <div class="quiz-review-explanation">
        💡 ${question.explanation}
      </div>
    `;

    reviewContainer.appendChild(reviewItem);
  });

  // Show results section
  document.getElementById("quizResultsSection").style.display = "block";

  // Confetti effect for high scores
  if (percentage >= 80) {
    createConfetti();
  }
}

// Reset Quiz
function resetQuiz() {
  quizData = null;
  currentQuizQuestion = 0;
  quizAnswers = [];
  quizSelectedAnswer = null;
  quizTimeLeft = 0;

  if (quizTimerInterval) {
    clearInterval(quizTimerInterval);
  }

  // Clear inputs
  document.getElementById("quizArticleInput").value = "";

  // Show input form
  document.getElementById("quizInputForm").style.display = "block";
  document.getElementById("quizQuestionsSection").style.display = "none";
  document.getElementById("quizResultsSection").style.display = "none";
}

// Create Confetti Effect
function createConfetti() {
  const colors = ["#667eea", "#764ba2", "#f093fb", "#fbbf24", "#10b981"];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "%";
    confetti.style.background =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 3 + "s";
    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 3000);
  }
}

// Cleanup timer on page unload
window.addEventListener("beforeunload", () => {
  if (quizTimerInterval) {
    clearInterval(quizTimerInterval);
  }
});
