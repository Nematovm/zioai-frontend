// ============================================
// API CONFIGURATION - TUZATILGAN ✅
// ============================================
const API_URL = "https://zioai-backend.onrender.com/api";

console.log("🌐 API URL:", API_URL);

// ============================================
// BACKEND AVAILABILITY CHECKER
// ============================================
async function checkBackendStatus() {
  try {
    const response = await fetch(API_URL.replace("/api", "/api/test"));
    const data = await response.json();

    if (data.status === "OK") {
      console.log("✅ Backend ishlayapti!");
      return true;
    }
  } catch (error) {
    console.error("❌ Backend ishlamayapti:", error);
    alert(
      "⚠️ Backend serverga ulanib bo'lmadi!\n\nServer ishlayotganini tekshiring:\n" +
        API_URL
    );
    return false;
  }
}

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
    title: "Welcome back!",
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
  quiz: {
    title: "Quiz Generator",
    subtitle: "Generate quizzes from any text",
  },
  study: {
    title: "Study Assistant",
    subtitle: "AI-powered study helper",
  },
  speaking: {
    title: "IELTS Feedback",
    subtitle: "Get feedback on your speaking",
  },
  article: {  // ✅ YANGI
    title: "📚 Reading Articles",
    subtitle: "Improve your English with curated articles"
  },
  profile: {
    title: "Profile Settings",
    subtitle: "Manage your account and preferences",
  },
};

function getUsernameFromDisplayName(displayName, email) {
  if (!displayName) {
    return email ? email.split("@")[0] : "User";
  }

  let username = displayName
    .replace(/[\u{1F000}-\u{1F9FF}]/gu, "")
    .replace(/[\u{2600}-\u{26FF}]/gu, "")
    .replace(/[\u{2700}-\u{27BF}]/gu, "")
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, "")
    .replace(/[\u{1F600}-\u{1F64F}]/gu, "")
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, "")
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, "")
    .trim();

  if (!username || username.length === 0 || /^\s*$/.test(username)) {
    username = email ? email.split("@")[0] : "User";
  }

  return username;
}

function updateWelcomeMessage(username) {
  const headerTitle = document.getElementById("headerTitle");
  if (headerTitle && headerTitle.textContent.includes("Welcome back")) {
    headerTitle.textContent = `Welcome back, ${username}!`;
  }
}

function switchTool(toolName) {
  navLinks.forEach((link) => link.classList.remove("active"));
  const activeLink = document.querySelector(
    `.nav-link[data-tool="${toolName}"]`
  );
  if (activeLink) activeLink.classList.add("active");

  toolContents.forEach((content) => content.classList.remove("active"));
  const activeContent = document.getElementById(`${toolName}-content`);
  if (activeContent) {
    activeContent.classList.add("active");

    if (toolName === "profile" && typeof showProfileTool === "function") {
      showProfileTool();
    }
  }

  if (toolTitles[toolName]) {
    headerTitle.textContent = toolTitles[toolName].title;
    headerSubtitle.textContent = toolTitles[toolName].subtitle;

    if (toolName === "dashboard") {
      const auth = window.firebaseAuth;
      if (auth && auth.currentUser) {
        const username = getUsernameFromDisplayName(
          auth.currentUser.displayName,
          auth.currentUser.email
        );
        headerTitle.textContent = `Welcome back, ${username}!`;
      }
    }
  }

  if (toolName !== "dashboard" && toolName !== "profile") {
    if (typeof trackToolUsage === "function") {
      trackToolUsage(toolName);
    }
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

// ============================================
// HOMEWORK FIXER - TRACKING FAQAT SUCCESS DA ✅
// ============================================
async function fixHomework() {
  const result = document.getElementById("homeworkResult");
  const output = document.getElementById("homeworkOutput");
  const languageDropdown = document.getElementById("homework-language");
  const language = languageDropdown ? languageDropdown.value : "uz";

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
    const response = await fetch(`${API_URL}/fix-homework`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homework: currentHomeworkTab === "text" ? homeworkContent : null,
        image: currentHomeworkTab === "image" ? homeworkContent : null,
        type: currentHomeworkTab,
        language: language,
      }),
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

      // ✅ TRACKING - FAQAT SUCCESS HOLATIDA
      console.log('📊 Homework completed successfully, tracking...');
      
      if (typeof trackToolUsage === 'function') {
        trackToolUsage('homework');
      }
      
      if (typeof addRecentActivity === 'function') {
        const score = Math.floor(Math.random() * (95 - 85 + 1)) + 85;
        addRecentActivity('Homework Fixer', score, '📚', '#8b5cf6');
      }
      
      if (typeof incrementStat === 'function') {
        incrementStat('homeworkCompleted', 1);
        incrementStat('totalStudyTime', 3); // 3 daqiqa
      }

      if (currentHomeworkTab === "image") {
        removeImage();
      }
      
      console.log('✅ Homework tracking completed!');
      
    } else {
      throw new Error("No response from AI");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    showError(output, error.message);
    // ❌ XATO BO'LSA TRACKING QILMAYDI
  }
}

// ============================================
// GRAMMAR CHECKER - TRACKING FAQAT SUCCESS DA ✅
// ============================================
async function checkGrammar() {
  const input = document.getElementById("grammarInput").value;
  const result = document.getElementById("grammarResult");
  const output = document.getElementById("grammarOutput");
  const languageDropdown = document.getElementById("grammar-language");
  const language = languageDropdown ? languageDropdown.value : "uz";

  if (!input.trim()) {
    alert("Please enter text!");
    return;
  }

  result.style.display = "block";
  showLoading(output);

  try {
    const response = await fetch(`${API_URL}/check-grammar`, {
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
      
      // ✅ TRACKING - FAQAT SUCCESS HOLATIDA
      console.log('📊 Grammar check completed, tracking...');
      
      if (typeof trackToolUsage === 'function') {
        trackToolUsage('grammar');
      }
      
      if (typeof addRecentActivity === 'function') {
        const score = Math.floor(Math.random() * (98 - 88 + 1)) + 88;
        addRecentActivity('Grammar Checker', score, '✍️', '#ec4899');
      }
      
      if (typeof incrementStat === 'function') {
        incrementStat('totalStudyTime', 2); // 2 daqiqa
      }
      
      console.log('✅ Grammar tracking completed!');
      
    } else {
      throw new Error("No response from AI");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    showError(output, error.message);
    // ❌ XATO BO'LSA TRACKING QILMAYDI
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
// VOCABULARY BUILDER - TRACKING FAQAT SUCCESS DA ✅
// ============================================

// ✅ FLAG to prevent duplicate tracking
let isVocabProcessing = false;

async function buildVocab() {
  // ✅ Prevent duplicate calls
  if (isVocabProcessing) {
    console.log('⚠️ Vocabulary already processing, skipping...');
    return;
  }
  
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

  // ✅ Set processing flag
  isVocabProcessing = true;
  
  result.style.display = "block";
  showLoading(output);

  try {
    const response = await fetch(`${API_URL}/vocabulary`, {
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
      
      // ✅ TRACKING - FAQAT SUCCESS HOLATIDA VA BIR MARTA
      console.log('📊 Vocabulary learned successfully, tracking...');
      
      if (typeof trackToolUsage === 'function') {
        trackToolUsage('vocabulary');
      }
      
      if (typeof addRecentActivity === 'function') {
        const score = Math.floor(Math.random() * (95 - 82 + 1)) + 82;
        addRecentActivity('Vocabulary Builder', score, '📖', '#3b82f6');
      }
      
      if (typeof incrementStat === 'function') {
        incrementStat('totalStudyTime', 1); // 1 daqiqa
      }
      
      console.log('✅ Vocabulary tracking completed!');
      
    } else {
      throw new Error("No response from AI");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    showError(output, error.message);
    // ❌ XATO BO'LSA TRACKING QILMAYDI
  } finally {
    // ✅ Reset processing flag after 1 second
    setTimeout(() => {
      isVocabProcessing = false;
      console.log('🔓 Vocabulary processing unlocked');
    }, 1000);
  }
}


// ============================================
// AUDIO PRONUNCIATION - GOOGLE TTS ✅
// ============================================
function playPronunciation(word) {
  const audioBtn = event.target.closest(".audio-btn");

  // Tugma holatini o'zgartirish
  if (audioBtn) {
    audioBtn.style.background =
      "linear-gradient(135deg, #10b981 0%, #059669 100%)";
    audioBtn.innerHTML = '<i class="bi bi-volume-mute-fill"></i> Playing...';
  }

  // Google Translate TTS - barcha browserlarda bir xil ishlaydi
  const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
    word
  )}&tl=en&client=tw-ob`;

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

  audio.play().catch((error) => {
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
// MOTIVATION SYSTEM - TUZATILGAN ✅
// ============================================
let motivationInterval;
let isMotivationVisible = false;

async function showMotivation() {
  // Agar modal hali ko'rinishda bo'lsa, yangi motivatsiya ko'rsatmang
  if (isMotivationVisible) {
    console.log("⏳ Motivatsiya hali ko'rinishda, yangi so'rovni kutish...");
    return;
  }

  try {
    console.log("📤 Motivatsiya so'ralyapti...");

    // ✅ TUZATILGAN API URL
    const response = await fetch(`${API_URL}/motivation`);
    const data = await response.json();

    console.log("📥 Motivatsiya olindi:", data);

    if (data.success) {
      const toast = document.getElementById("motivationToast");
      const text = document.querySelector(".motivation-text");

      if (!toast || !text) {
        console.error("❌ Motivatsiya elementlari topilmadi!");
        return;
      }

      text.innerHTML = `
        ${data.quote}
        <span style="display: block; font-style: italic; font-size: 0.85em; margin-top: 8px; opacity: 0.8;">
          ${data.author}
        </span>
      `;

      // ✅ Modal animatsiyani to'g'ri ko'rsatish
      isMotivationVisible = true;
      toast.style.display = "flex"; // Avval display:flex qilish

      // 50ms kechikish - brauzer DOM ni yangilashi uchun
      setTimeout(() => {
        toast.classList.add("show");
      }, 50);

      console.log("✅ Motivatsiya ko'rsatildi!");

      // ✅ 10 soniyadan keyin avtomatik yopish
      setTimeout(() => {
        closeMotivation();
      }, 10000);
    }
  } catch (error) {
    console.error("❌ Motivatsiya xatosi:", error);
  }
}

function closeMotivation() {
  const toast = document.getElementById("motivationToast");

  if (!toast) return;

  // ✅ Animatsiya bilan yopish
  toast.classList.remove("show");

  // Animatsiya tugagandan keyin display:none qilish
  setTimeout(() => {
    toast.style.display = "none";
    isMotivationVisible = false;
    console.log("✅ Motivatsiya yopildi");
  }, 800); // ✅ CSS animation (0.8s) bilan mos kelishi kerak
}

function startMotivationSystem() {
  console.log("🚀 Motivatsiya tizimi boshlandi");

  // ✅ Sahifa yuklangandan 5 soniya keyin birinchi motivatsiya
  setTimeout(() => {
    showMotivation();
  }, 5000);

  // ✅ Har 5 daqiqada (300000ms) yangi motivatsiya
  motivationInterval = setInterval(() => {
    showMotivation();
  }, 300000); // 5 daqiqa
}

// ✅ Sahifa yopilganda intervallarni to'xtatish
window.addEventListener("beforeunload", () => {
  if (motivationInterval) {
    clearInterval(motivationInterval);
  }
});

// ============================================
// PAGE LOAD
// ============================================
window.addEventListener("load", () => {
  updateMiniTimerDisplay();
  startMotivationSystem(); // ✅ Motivatsiya tizimini ishga tushirish
  initStats();

  // ✅ Firebase auth tekshirish va username ni yangilash
  const auth = window.firebaseAuth;
  if (auth) {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const username = getUsernameFromDisplayName(
          user.displayName,
          user.email
        );
        console.log("✅ Username extracted:", username);

        // Header title ni yangilash (agar dashboard bo'lsa)
        updateWelcomeMessage(username);

        // Sidebar username ni yangilash
        const userNameElement = document.getElementById("userName");
        if (userNameElement) {
          userNameElement.textContent = username;
        }
      }
      unsubscribe(); // Bir marta ishlasin
    });
  }

  setTimeout(() => {
    document.querySelector(".spinner-wrapper").style.display = "none";
  }, 500);
});

let miniTimerInterval;
let miniTimeLeft = 25 * 60;
let miniTimerRunning = false;
let currentMode = "pomodoro";
let pomodoroMinutes = 25;
let breakMinutes = 5;
let soundEnabled = true;
let timerDropdownOpen = false;

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

function toggleTimerDropdown() {
  timerDropdownOpen = !timerDropdownOpen;
  const dropdown = document.getElementById("timerDropdown");
  const button = document.querySelector(".tomato-icon-btn");

  if (timerDropdownOpen) {
    dropdown.classList.add("active");
    button.classList.add("hidden");
  } else {
    dropdown.classList.remove("active");
    button.classList.remove("hidden");
  }
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
    // ✅ STATISTIKA QO'SHISH
    incrementStat("totalPomodoros");
    incrementStat("totalStudyTime", pomodoroMinutes);

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
}

// Close dropdown when clicking outside (but not when timer is running)
document.addEventListener("click", function (event) {
  const dropdown = document.getElementById("timerDropdown");
  const button = document.querySelector(".tomato-icon-btn");
  const settingsModal = document.getElementById("timerSettingsModal");

  // Don't close if clicking on settings modal
  if (settingsModal.classList.contains("active")) {
    return;
  }

  // Don't close if timer is running - keep it visible
  if (miniTimerRunning) {
    return;
  }

  if (
    timerDropdownOpen &&
    !dropdown.contains(event.target) &&
    !button.contains(event.target)
  ) {
    toggleTimerDropdown();
  }
});

// function trackPomodoroSession() {
//   if (typeof window.incrementStat === 'function') {
//     window.incrementStat('totalPomodoros', 1);
//     window.incrementStat('totalStudyTime', 25); // 25 minutes
//     window.trackToolUsage('study');
    
//     // Add activity
//     if (typeof window.addRecentActivity === 'function') {
//       window.addRecentActivity('Study Session', 100, '🎓', '#f59e0b');
//     }
    
//     console.log('✅ Pomodoro tracked: 25 minutes');
//   }
// }

// ============================================
// PAGE LOAD
// ============================================
window.addEventListener("load", () => {
  updateMiniTimerDisplay();
  startMotivationSystem();
  initStats();

  // ✅ Firebase auth tekshirish va username ni yangilash
  const auth = window.firebaseAuth;
  if (auth) {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const username = getUsernameFromDisplayName(
          user.displayName,
          user.email
        );
        console.log("✅ Username extracted:", username);

        // Header title ni yangilash (agar dashboard bo'lsa)
        updateWelcomeMessage(username);

        // Sidebar username ni yangilash
        const userNameElement = document.getElementById("userName");
        if (userNameElement) {
          userNameElement.textContent = username;
        }
      }
      unsubscribe(); // Bir marta ishlasin
    });
  }

  setTimeout(() => {
    document.querySelector(".spinner-wrapper").style.display = "none";
  }, 500);
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
    const response = await fetch(`${API_URL}/generate-quiz`, {
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

// ============================================
// FINISH QUIZ - TRACKING FAQAT SUCCESS DA ✅
// ============================================
function finishQuiz() {
  if (quizTimerInterval) {
    clearInterval(quizTimerInterval);
  }

  // ✅ TRACKING - QUIZ YAKUNLANGANDA
  console.log('📊 Quiz finished, tracking...');
  
  if (typeof incrementStat === 'function') {
    incrementStat('quizzesTaken', 1);
    
    // Real time calculation
    const questionCount = parseInt(document.getElementById('quizQuestionCount').value);
    const totalSeconds = (questionCount * 60) - quizTimeLeft;
    const minutes = Math.max(1, Math.ceil(totalSeconds / 60));
    
    console.log('⏱️ Quiz time:', { totalSeconds, minutes });
    incrementStat('totalStudyTime', minutes);
  }
  
  if (typeof trackToolUsage === 'function') {
    trackToolUsage('quiz');
  }

  // Hide quiz section
  document.getElementById("quizQuestionsSection").style.display = "none";

  // Show results
  displayQuizResults();
  
  console.log('✅ Quiz tracking completed!');
}

function displayQuizResults() {
  // Calculate score
  let score = 0;
  quizData.questions.forEach((question, index) => {
    if (quizAnswers[index] === question.correctAnswer) {
      score++;
    }
  });

  const totalQuestions = quizData.questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);

  // ✅ ADD ACTIVITY WITH REAL SCORE
  if (typeof addRecentActivity === 'function') {
    addRecentActivity('Quiz Generator', percentage, '❓', '#10b981');
    console.log('✅ Quiz activity added with score:', percentage);
  }

  // Update score display
  document.getElementById("quizScoreDisplay").textContent = `${score}/${totalQuestions}`;
  document.getElementById("quizPercentageDisplay").textContent = `${percentage}% to'g'ri!`;

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
    if (typeof createConfetti === 'function') {
      createConfetti();
    }
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

// ============================================
// STUDY ASSISTANT - FRONTEND
// ============================================

// Tanlangan mode
let selectedMode = null;

// Mode tanlash
function selectStudyMode(mode) {
  selectedMode = mode;

  // Barcha tugmalardan active classni olib tashlash
  document.querySelectorAll(".study-mode-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Tanlangan tugmaga active class qo'shish
  event.target.closest(".study-mode-btn").classList.add("active");

  // Placeholder textni o'zgartirish
  const placeholders = {
    explain: "Mavzuni yozing... (masalan: Pythagoras teoremasi)",
    notes: "Konspekt qilish uchun matnni yozing...",
    quiz: "Quiz yaratish uchun mavzuni yozing...",
    plan: "O'quv reja uchun mavzuni yozing... (masalan: Matematika)",
    mistakes: "Xatongizni yoki savolingizni yozing...",
    flashcards: "Flashcard yaratish uchun mavzuni yozing...",
    script: "Speaking/Writing mavzusini yozing...",
  };

  document.getElementById("studyInput").placeholder =
    placeholders[mode] || "Matn kiriting...";
  document.getElementById("studyInput").focus();

  console.log("📚 Tanlangan mode:", mode);
}

// ============================================
// STUDY ASSISTANT - TRACKING FAQAT SUCCESS DA ✅
// ============================================
async function submitStudyAssistant() {
  const input = document.getElementById("studyInput").value;
  const result = document.getElementById("studyResult");
  const output = document.getElementById("studyOutput");
  
  const languageDropdown = document.getElementById("study-language");
  const language = languageDropdown ? languageDropdown.value : "uz";

  if (!selectedMode) {
    alert("Iltimos, avval rejim tanlang!");
    return;
  }
  
  if (!input.trim()) {
    alert("Iltimos, matn kiriting!");
    return;
  }

  result.style.display = "block";
  showLoading(output);

  try {
    const response = await fetch(`${API_URL}/study-assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: selectedMode,
        content: input,
        language: language
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Server error");
    }

    if (data.success && data.result) {
      const modeNames = {
        explain: "📖 Mavzu Tushuntirish",
        notes: "📝 Konspekt",
        quiz: "❓ Quiz",
        plan: "📅 O'quv Reja",
        mistakes: "🔍 Xato Tahlili",
        flashcards: "🎴 Flashcardlar",
        script: "🎤 Speaking/Writing Script"
      };

      output.innerHTML = `
        <div class="alert alert-success">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h5 style="margin: 0; color: #1f2937;">
              ${modeNames[selectedMode] || "Study Assistant"}
            </h5>
            <button onclick="copyToClipboard()" class="copy-btn" title="Nusxa olish">
              <i class="bi bi-clipboard"></i> Nusxa
            </button>
          </div>
          <hr style="margin: 12px 0;">
          <div id="studyContent" style="white-space: pre-wrap; line-height: 1.8;">
            ${data.result}
          </div>
        </div>
      `;
      
      // ✅ TRACKING - FAQAT SUCCESS HOLATIDA
      console.log('📊 Study assistant completed, tracking...');
      
      if (typeof trackToolUsage === 'function') {
        trackToolUsage('study');
      }
      
      if (typeof addRecentActivity === 'function') {
        const score = Math.floor(Math.random() * (97 - 88 + 1)) + 88;
        addRecentActivity('Study Assistant', score, '🎓', '#f59e0b');
      }
      
      if (typeof incrementStat === 'function') {
        incrementStat('totalStudyTime', 4); // 4 daqiqa
      }
      
      console.log('✅ Study assistant tracking completed!');
      
    } else {
      throw new Error("AI dan javob kelmadi");
    }
  } catch (error) {
    console.error("❌ Study Assistant xatosi:", error);
    showError(output, error.message);
    // ❌ XATO BO'LSA TRACKING QILMAYDI
  }
}


// Nusxa olish funksiyasi
function copyToClipboard() {
  const content = document.getElementById("studyContent");
  const text = content.innerText;

  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert("Nusxa olindi! ✅");
    })
    .catch((err) => {
      console.error("Nusxa olishda xato:", err);
    });
}

// Tozalash
function clearStudyAssistant() {
  document.getElementById("studyInput").value = "";
  document.getElementById("studyResult").style.display = "none";
  selectedMode = null;

  document.querySelectorAll(".study-mode-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
}

// ============================================
// SPEAKING FEEDBACK - TUZATILGAN ✅
// ============================================

// Global variables
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let recordingTimer = null;
let recordingSeconds = 0;
let selectedExamType = null;
let recordedAudioBlob = null;

// Exam type tanlash
function selectExamType(type) {
  selectedExamType = type;

  document.querySelectorAll(".exam-type-btn").forEach((btn) => {
    btn.classList.remove("active");
    btn.style.background = "#fff";
    btn.style.color = "#374151";
    btn.style.border = "2px solid #e5e7eb";
  });

  const activeBtn = event.target.closest(".exam-type-btn");
  if (activeBtn) {
    activeBtn.classList.add("active");
    activeBtn.style.background =
      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)";
    activeBtn.style.color = "white";
    activeBtn.style.border = "2px solid #6366f1";
  }

  const infoText = document.getElementById("examInfoText");
  if (type === "IELTS") {
    infoText.innerHTML =
      "📊 <strong>IELTS:</strong> Band 1-9 gacha baholanadi (Fluency, Vocabulary, Grammar, Pronunciation)";
  } else {
    infoText.innerHTML = `📊 <strong>Multilevel (O'zbekiston):</strong> 0-75 ball
    <br>• 0-37 = A1-A2 | 38-50 = B1 | 51-64 = B2 | 65-75 = C1`;
  }

  console.log("📝 Exam type tanlandi:", type);
}

// ✅ Ovoz yozishni boshlash - TUZATILGAN
async function startRecording() {
  const topic = document.getElementById("speakingTopicInput").value.trim();

  if (!topic) {
    alert("⚠️ Iltimos, avval topic kiriting!");
    return;
  }

  if (!selectedExamType) {
    alert("⚠️ Iltimos, IELTS yoki Multilevel tanlang!");
    return;
  }

  try {
    // ✅ Audio constraints - WAV format
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 16000, // Deepgram uchun optimal
      },
    });

    // ✅ MIME type tekshirish
    let mimeType = "audio/webm;codecs=opus";
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = "audio/webm";
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = "audio/ogg;codecs=opus";
    }

    console.log("🎤 Audio format:", mimeType);

    mediaRecorder = new MediaRecorder(stream, { mimeType });
    audioChunks = [];
    recordedAudioBlob = null;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
        console.log("📦 Audio chunk qo'shildi:", event.data.size, "bytes");
      }
    };

    mediaRecorder.onstop = async () => {
      recordedAudioBlob = new Blob(audioChunks, { type: mimeType });
      console.log("✅ Audio yozib olindi:");
      console.log("  - Size:", recordedAudioBlob.size, "bytes");
      console.log("  - Type:", recordedAudioBlob.type);
      console.log("  - Duration:", recordingSeconds, "seconds");

      // ✅ Audio hajmini tekshirish
      if (recordedAudioBlob.size < 1000) {
        alert(
          "❌ Audio juda qisqa yoki bo'sh!\n\nIltimos, qaytadan yozib ko'ring."
        );
        clearSpeaking();
        return;
      }

      showFeedbackButton();
    };

    mediaRecorder.onerror = (error) => {
      console.error("❌ MediaRecorder xatosi:", error);
      alert("❌ Ovoz yozishda xatolik:\n" + error);
      stopRecording();
    };

    mediaRecorder.start(1000); // Har 1 sekundda chunk
    isRecording = true;
    recordingSeconds = 0;

    // UI yangilash
    document.getElementById("startRecordBtn").style.display = "none";
    document.getElementById("stopRecordBtn").style.display = "flex";
    document.getElementById("recordingStatus").style.display = "flex";

    // Timer boshlash
    recordingTimer = setInterval(() => {
      recordingSeconds++;
      const mins = Math.floor(recordingSeconds / 60);
      const secs = recordingSeconds % 60;
      document.getElementById("recordingTime").textContent = `${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }, 1000);

    console.log("🎤 Ovoz yozish boshlandi");
  } catch (error) {
    console.error("❌ Mikrofon xatosi:", error);
    alert(
      "❌ Mikrofonga ruxsat berilmadi!\n\n" +
        error.message +
        "\n\nBrauzer sozlamalaridan mikrofonga ruxsat bering."
    );
  }
}

// Ovoz yozishni to'xtatish
function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    isRecording = false;

    clearInterval(recordingTimer);

    document.getElementById("startRecordBtn").style.display = "flex";
    document.getElementById("stopRecordBtn").style.display = "none";
    document.getElementById("recordingStatus").style.display = "none";

    console.log("🛑 Ovoz yozish to'xtatildi");
  }
}

// Feedback tugmasini ko'rsatish
function showFeedbackButton() {
  const result = document.getElementById("speakingResult");
  const output = document.getElementById("speakingOutput");

  result.style.display = "block";
  output.innerHTML = `
    <div class="alert alert-success" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: none; border-radius: 12px; padding: 25px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
      <h5 style="color: #1f2937; margin-bottom: 15px;">Audio yozib olindi!</h5>
      <p style="color: #6b7280; margin-bottom: 20px;">
        ⏱️ Davomiyligi: ${recordingSeconds} soniya<br>
        📦 Hajmi: ${(recordedAudioBlob.size / 1024).toFixed(2)} KB
      </p>
      <button 
        onclick="submitRecordedAudio()" 
        style="width: 100%; padding: 15px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer;">
        <i class="bi bi-send"></i> Feedback Olish
      </button>
      <button 
        onclick="clearSpeaking()" 
        style="width: 100%; padding: 12px; background: #6b7280; color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 10px;">
        <i class="bi bi-arrow-clockwise"></i> Qayta Yozish
      </button>
    </div>
  `;
}

// ============================================
// SPEAKING FEEDBACK - TRACKING FAQAT SUCCESS DA ✅
// ============================================
async function submitRecordedAudio() {
  if (!recordedAudioBlob) {
    alert("❌ Audio yozilmagan!");
    return;
  }
  
  const topic = document.getElementById('speakingTopicInput').value.trim();
  const result = document.getElementById('speakingResult');
  const output = document.getElementById('speakingOutput');
  
  const languageDropdown = document.getElementById('speaking-language');
  const language = languageDropdown ? languageDropdown.value : 'uz';
  
  result.style.display = 'block';
  showLoading(output);
  
  try {
    const formData = new FormData();
    const audioFileName = 'recording.webm';
    formData.append('audio', recordedAudioBlob, audioFileName);
    
    const transcriptResponse = await fetch(`${API_URL.replace('/api', '')}/api/audio-to-text`, {
      method: 'POST',
      body: formData
    });
    
    if (!transcriptResponse.ok) {
      const errorText = await transcriptResponse.text();
      throw new Error(`Backend xatosi (${transcriptResponse.status}): ${errorText}`);
    }
    
    const transcriptData = await transcriptResponse.json();
    
    if (!transcriptData.success) {
      throw new Error(transcriptData.error || 'Speech-to-Text xatosi');
    }
    
    const transcript = transcriptData.transcript;
    
    if (!transcript || transcript.trim().length < 10) {
      throw new Error("❌ Ovoz aniq eshitilmadi yoki juda qisqa.");
    }
    
    const feedbackResponse = await fetch(`${API_URL}/speaking-feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: transcript,
        topic: topic,
        examType: selectedExamType,
        language: language
      })
    });
    
    const feedbackData = await feedbackResponse.json();
    
    if (!feedbackResponse.ok) {
      throw new Error(feedbackData.error || 'Server error');
    }
    
    if (feedbackData.success && feedbackData.result) {
      output.innerHTML = `
        <div class="alert alert-success">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h5 style="margin: 0; color: #1f2937;">
              <i class="bi bi-mic-fill"></i> 
              ${selectedExamType} Speaking Feedback
            </h5>
            <span style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 5px 15px; border-radius: 20px; font-weight: 600;">
              ${selectedExamType}
            </span>
          </div>
          
          <div style="background: #fff; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #6366f1;">
            <h6 style="color: #6b7280; margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase;">
              📝 Sizning javobingiz:
            </h6>
            <p style="color: #1f2937; line-height: 1.6; margin: 0; font-style: italic;">"${transcript}"</p>
          </div>
          
          <hr style="margin: 15px 0; border-color: #d1fae5;">
          <div style="white-space: pre-wrap; line-height: 1.8;">
            ${feedbackData.result}
          </div>
        </div>
      `;
      
      // ✅ TRACKING - FAQAT SUCCESS HOLATIDA
      console.log('📊 Speaking feedback received, tracking...');
      
      if (typeof trackToolUsage === 'function') {
        trackToolUsage('speaking');
      }
      
      if (typeof addRecentActivity === 'function') {
        const score = Math.floor(Math.random() * (92 - 78 + 1)) + 78;
        addRecentActivity('IELTS Feedback', score, '💬', '#06b6d4');
      }
      
      if (typeof incrementStat === 'function') {
        const minutes = Math.max(1, Math.ceil(recordingSeconds / 60));
        incrementStat('totalStudyTime', minutes);
      }
      
      console.log('✅ Speaking tracking completed!');
      
      setTimeout(() => {
        result.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
      
    } else {
      throw new Error("AI dan javob kelmadi");
    }
    
  } catch (error) {
    console.error("❌ Xatolik:", error);
    showError(output, error.message);
    // ❌ XATO BO'LSA TRACKING QILMAYDI
  }
}


// Speaking tozalash
function clearSpeaking() {
  document.getElementById("speakingTopicInput").value = "";
  document.getElementById("speakingTextInput").value = "";
  document.getElementById("speakingResult").style.display = "none";
  selectedExamType = null;
  recordedAudioBlob = null;

  // Recording ni to'xtatish (agar ishlayotgan bo'lsa)
  if (isRecording) {
    stopRecording();
  }

  document.querySelectorAll(".exam-type-btn").forEach((btn) => {
    btn.classList.remove("active");
    btn.style.background = "#fff";
    btn.style.color = "#374151";
    btn.style.border = "2px solid #e5e7eb";
  });

  document.getElementById("examInfoText").innerHTML =
    "📊 Imtihon turini tanlang";

  console.log("🧹 Speaking tool tozalandi");
}

// ✅ Helper functions
function showLoading(element) {
  element.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p style="margin-top: 20px; color: #6b7280; font-weight: 600;">✨ AI Processing...</p>
      <p style="color: #9ca3af; font-size: 13px;">Bu 5-10 soniya olishi mumkin.</p>
    </div>
  `;
}

function showError(element, message) {
  element.innerHTML = `
    <div class="alert alert-danger" style="border-left: 4px solid #ef4444; white-space: pre-wrap;">
      <div style="display: flex; align-items: start; gap: 10px;">
        <i class="bi bi-exclamation-triangle-fill" style="font-size: 24px; margin-top: 3px;"></i>
        <div>
          <strong style="display: block; margin-bottom: 8px;">Xatolik yuz berdi:</strong>
          <p style="margin: 0; line-height: 1.6;">${message}</p>
        </div>
      </div>
      <hr style="margin: 15px 0;">
      <button onclick="clearSpeaking()" style="padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer;">
        <i class="bi bi-arrow-clockwise"></i> Qaytadan Urinish
      </button>
    </div>
  `;
}

// console.log('Remaining localStorage:', Object.keys(localStorage).filter(k => k.includes('ziyoai')));


// ============================================
// SWITCH TOOL FUNCTION - FAQAT BIR MARTA ✅
// ============================================
function switchTool(toolName) {
  navLinks.forEach((link) => link.classList.remove("active"));
  const activeLink = document.querySelector(
    `.nav-link[data-tool="${toolName}"]`
  );
  if (activeLink) activeLink.classList.add("active");

  toolContents.forEach((content) => content.classList.remove("active"));
  const activeContent = document.getElementById(`${toolName}-content`);
  if (activeContent) {
    activeContent.classList.add("active");

    // ✅ ARTICLES TOOL INITIALIZE
    if (toolName === "article" && typeof showArticlesTool === "function") {
      showArticlesTool();
    }
    
    if (toolName === "profile" && typeof showProfileTool === "function") {
      showProfileTool();
    }
  }

  if (toolTitles[toolName]) {
    headerTitle.textContent = toolTitles[toolName].title;
    headerSubtitle.textContent = toolTitles[toolName].subtitle;

    if (toolName === "dashboard") {
      const auth = window.firebaseAuth;
      if (auth && auth.currentUser) {
        const username = getUsernameFromDisplayName(
          auth.currentUser.displayName,
          auth.currentUser.email
        );
        headerTitle.textContent = `Welcome back, ${username}!`;
      }
    }
  }

  // ✅ TRACKING - ARTICLES UCHUN HAM
  if (toolName !== "dashboard" && toolName !== "profile") {
    if (typeof trackToolUsage === "function") {
      trackToolUsage(toolName);
    }
  }

  if (window.innerWidth < 1024) {
    sidebar.classList.remove("menu-active");
    toggleMenu(false);
  }
}