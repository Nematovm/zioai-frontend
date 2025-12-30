// ============================================
// 1️⃣ API CONFIGURATION
// ============================================
const API_URL = window.location.hostname.includes("onrender.com")
  ? "https://zioai-backend.onrender.com/api"
  : "http://localhost:3000/api";

// ============================================
// 2️⃣ GLOBAL FLAGS ✅
// ============================================
window.currentActiveTool = "homework";
window.hasInitialized = false;
window.isToolSwitching = false;
window.preventToolSwitch = false;

// Global variables
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let recordingTimer = null;
let recordingSeconds = 0;
let selectedExamType = null;
let recordedAudioBlob = null;
let isHomeworkUploadInitialized = false;

// Wait for coin system to be ready
window.addEventListener("load", () => {
  setTimeout(() => {
    if (window.coinManager) {
      coinSystemReady = true;
      console.log("✅ Coin system ready for integration");
      updateProfileCoinDisplay();
    }
  }, 1000);
});

// ============================================
// 2️⃣B GLOBAL IMAGE VARIABLES ✅
// ============================================
let uploadedImage = null; // Homework image
let uploadedWritingImage = null; // Writing checker image
let uploadedTopicImage = null; // Topic image
let isWritingUploadInitialized = false;
let isTopicUploadInitialized = false;

// ============================================
// 3️⃣ TOOL TITLES
// ============================================
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
    title: "Writing Checker",
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
  article: {
    title: "Reading Articles",
    subtitle: "Improve your English with curated articles",
  },
  profile: {
    title: "Profile Settings",
    subtitle: "Manage your account and preferences",
  },
};

// ============================================
// 4️⃣ SWITCH TOOL FUNCTION - FIXED FOR PROFILE ✅
// ============================================
function switchTool(toolName) {
  // ✅ Prevent concurrent switches
  if (window.isToolSwitching) {
    console.warn("⏳ Tool switch already in progress");
    return;
  }

  // ✅ SET LOCK
  window.isToolSwitching = true;
  console.log("🔀 Switching tool:", window.currentActiveTool, "→", toolName);

  window.currentActiveTool = toolName;

  // Hide all tools
  document.querySelectorAll(".tool-content").forEach((el) => {
    el.classList.remove("active");
    el.style.display = "none";
  });

  // Remove all nav active
  document.querySelectorAll(".nav-link").forEach((el) => {
    el.classList.remove("active");
  });

  // Activate selected nav
  const activeLink = document.querySelector(
    `.nav-link[data-tool="${toolName}"]`
  );
  if (activeLink) {
    activeLink.classList.add("active");
  }

  // Show selected tool
  const activeContent = document.getElementById(`${toolName}-content`);
  if (activeContent) {
    activeContent.classList.add("active");
    activeContent.style.display = "block";

    // ✅ TOOL-SPECIFIC INITIALIZATION
    if (toolName === "article" && typeof showArticlesTool === "function") {
      showArticlesTool();
    }

    // ✅ PROFILE TOOL - FIXED INITIALIZATION
    if (toolName === "profile") {
      console.log("📋 Initializing profile tool...");

      // Call profile initialization
      if (typeof showProfileTool === "function") {
        try {
          showProfileTool();
          console.log("✅ Profile tool initialized");
        } catch (error) {
          console.error("❌ Profile initialization error:", error);
        }
      }

      // Update coin display with safety checks
      setTimeout(() => {
        if (typeof updateProfileCoinDisplay === "function") {
          try {
            updateProfileCoinDisplay();
            console.log("✅ Profile coin display updated");
          } catch (error) {
            console.error("❌ Coin display error:", error);
          }
        }
      }, 300);
    }
  }

  // Update header
  if (toolTitles[toolName]) {
    const headerTitle = document.getElementById("headerTitle");
    const headerSubtitle = document.getElementById("headerSubtitle");

    if (headerTitle) headerTitle.textContent = toolTitles[toolName].title;
    if (headerSubtitle)
      headerSubtitle.textContent = toolTitles[toolName].subtitle;

    if (toolName === "dashboard") {
      const auth = window.firebaseAuth;
      if (auth && auth.currentUser) {
        const username = getUsernameFromDisplayName(
          auth.currentUser.displayName,
          auth.currentUser.email
        );
        if (headerTitle) {
          headerTitle.textContent = `Welcome back, ${username}!`;
        }
      }
    }
  }
  if (toolName === "grammar") {
  console.log("📝 Initializing Writing Checker...");
  
  // Reset initialization flag to allow re-initialization
  isWritingUploadInitialized = false;
  
  // If Task 1 is already selected, initialize upload
  if (selectedTaskType === "Task 1") {
    setTimeout(() => {
      selectTaskType("Task 1"); // This will check subscription and init
    }, 300);
  }
}

  // Close mobile sidebar
  if (window.innerWidth < 1024) {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      sidebar.classList.remove("menu-active");
    }
  }

  // ✅ UNLOCK after animation (ALWAYS UNLOCK!)
  setTimeout(() => {
    window.isToolSwitching = false;
    console.log("✅ Tool switch complete:", toolName);
    console.log("🔓 Tool switching UNLOCKED");
  }, 500);
}

// ============================================
// PROFILE TOOL INITIALIZATION - FIXED ✅
// ============================================
function showProfileTool() {
  console.log("🔧 showProfileTool() called");

  // Firebase auth check
  const auth = window.firebaseAuth;
  if (!auth) {
    console.error("❌ Firebase auth not initialized");
    return;
  }

  const currentUser = auth.currentUser;

  if (!currentUser) {
    console.error("❌ No user logged in");
    return;
  }

  // Load profile data (existing function)
  if (typeof loadProfileData === "function") {
    loadProfileData();
  }

  // ✅ UPDATE COIN DISPLAY - WITH SAFETY CHECKS
  const updateCoins = async () => {
    try {
      // Check if coin system is ready
      if (typeof getUserCoins === "function") {
        const coins = await getUserCoins();
        const coinBalance = document.getElementById("profileCoinBalance");
        if (coinBalance) {
          coinBalance.textContent = coins;
          console.log("💰 Profile coins updated:", coins);
        }
      } else {
        console.warn("⚠️ getUserCoins not available, retrying...");
        // Retry after 500ms
        setTimeout(updateCoins, 500);
      }
    } catch (error) {
      console.error("❌ Error updating profile coins:", error);
    }
  };

  updateCoins();

  console.log("✅ Profile tool initialized");
}

// ============================================
// HELPER: Load Profile Data
// ============================================
function loadProfileData() {
  const auth = window.firebaseAuth;
  if (!auth) return;

  const currentUser = auth.currentUser;
  if (!currentUser) return;

  let userAvatar = "👤";
  let username = "";

  if (currentUser.displayName) {
    const displayName = currentUser.displayName;

    // Extract emoji
    const emojiRegex =
      /[\u{1F000}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    const emojiMatch = displayName.match(emojiRegex);

    if (emojiMatch) {
      userAvatar = emojiMatch[0];
    }

    // Extract username (remove all emojis and spaces)
    username = displayName
      .replace(/[\u{1F000}-\u{1F9FF}]/gu, "")
      .replace(/[\u{2600}-\u{26FF}]/gu, "")
      .replace(/[\u{2700}-\u{27BF}]/gu, "")
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, "")
      .replace(/[\u{1F600}-\u{1F64F}]/gu, "")
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, "")
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, "")
      .replace(/\s+/g, "")
      .trim();
  }

  if (!username || username.length === 0) {
    username = currentUser.email.split("@")[0];
  }

  console.log("✅ Extracted Avatar:", userAvatar);
  console.log("✅ Extracted Username:", username);

  // Update UI elements
  const profileAvatar = document.getElementById("profileAvatar");
  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const usernameInput = document.getElementById("usernameInput");
  const emailInput = document.getElementById("emailInput");

  if (profileAvatar) profileAvatar.textContent = userAvatar;
  if (profileName) profileName.textContent = username;
  if (profileEmail) profileEmail.textContent = currentUser.email;
  if (usernameInput) usernameInput.value = username;
  if (emailInput) emailInput.value = currentUser.email;

  // Member since
  const profileDate = document.getElementById("profileDate");
  if (profileDate && currentUser.metadata.creationTime) {
    const creationTime = currentUser.metadata.creationTime;
    const memberDate = new Date(creationTime).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    profileDate.innerHTML = `<i class="bi bi-calendar3"></i> Member since: ${memberDate}`;
  }

  console.log("✅ Profile data loaded");
}

// ============================================
// 5️⃣ INITIALIZE DEFAULT TOOL ✅
// ============================================
function initializeDefaultTool() {
  if (window.hasInitialized) {
    console.log("⏭️ Already initialized");
    return;
  }

  console.log("🚀 Initializing default tool: homework");

  window.preventToolSwitch = false;
  window.hasInitialized = true;
  window.currentActiveTool = "homework";

  document.querySelectorAll(".tool-content").forEach((el) => {
    el.classList.remove("active");
    el.style.display = "none";
  });

  document.querySelectorAll(".nav-link").forEach((el) => {
    el.classList.remove("active");
  });

  const homework = document.getElementById("homework-content");
  const homeworkLink = document.querySelector(
    '.nav-link[data-tool="homework"]'
  );

  if (homework) {
    homework.classList.add("active");
    homework.style.display = "block";
  }

  if (homeworkLink) {
    homeworkLink.classList.add("active");
  }

  console.log("✅ Default tool initialized");
}

// ============================================
// 6️⃣ initStats FUNCTION - SAFE VERSION ✅
// ============================================
function initStats() {
  try {
    // ✅ Check if stats.js is loaded
    if (typeof window.loadUserStats === "function") {
      window.loadUserStats();
      console.log("✅ Stats initialized successfully");
    } else {
      console.warn("⚠️ Stats system not loaded yet - will initialize later");

      // ✅ Retry after 1 second (stats.js might load late)
      setTimeout(() => {
        if (typeof window.loadUserStats === "function") {
          window.loadUserStats();
          console.log("✅ Stats initialized (delayed)");
        } else {
          console.error("❌ Stats system not available");
        }
      }, 1000);
    }
  } catch (error) {
    console.error("❌ Stats initialization error:", error);
  }
}

// ============================================
// 6️⃣ DOM CONTENT LOADED - INITIALIZE UI
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 DOM loaded");

  // Initialize default tool
  initializeDefaultTool();

  // Setup event listeners
  const navLinks = document.querySelectorAll(".nav-link[data-tool]");
  const toolCards = document.querySelectorAll(".tool-card[data-tool]");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const toolName = link.getAttribute("data-tool");
      if (toolName) switchTool(toolName);
    });
  });

  toolCards.forEach((card) => {
    card.addEventListener("click", () => {
      const toolName = card.getAttribute("data-tool");
      if (toolName) switchTool(toolName);
    });
  });
});

// ============================================
// WAIT FOR COIN SYSTEM - ADD THIS BEFORE window.load
// ============================================
async function waitForCoinSystem() {
  return new Promise((resolve) => {
    if (window.coinManager) {
      console.log("✅ Coin system already ready");
      resolve(true);
      return;
    }

    let attempts = 0;
    const maxAttempts = 50;

    const checkInterval = setInterval(() => {
      attempts++;

      if (window.coinManager) {
        clearInterval(checkInterval);
        console.log("✅ Coin system loaded after", attempts * 100, "ms");
        resolve(true);
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.error("❌ Coin system failed to load");
        resolve(false);
      }
    }, 100);
  });
}

/**
 * Fallback: Coin systemni majburiy yuklash
 */
function initializeCoinSystemFallback() {
  console.warn("⚠️ Attempting fallback coin system initialization...");

  // Check if initCoinSystem exists
  if (typeof initCoinSystem === "function") {
    try {
      initCoinSystem();
      console.log("✅ Coin system initialized via fallback");
    } catch (error) {
      console.error("❌ Fallback initialization failed:", error);
    }
  } else {
    console.error("❌ initCoinSystem function not found!");
    console.error("Make sure coin.js is loaded before dashboard.js");
  }
}

// ============================================
// 5️⃣ INITIALIZE IMAGE UPLOAD ON PAGE LOAD ✅
// ============================================
window.addEventListener("load", async () => {
  console.log("🔧 Initializing image upload subscription check...");
  
  // Check if user is on image tab
  const imageTab = document.getElementById("imageInputTab");
  if (imageTab && imageTab.style.display !== "none") {
    // Re-check subscription
    const subscription = await checkUserSubscription();
    const fileInput = document.getElementById("homeworkImageInput");
    const uploadArea = document.getElementById("imageUploadArea");
    
    if (subscription.type === "free") {
      if (fileInput) fileInput.disabled = true;
      if (uploadArea) {
        uploadArea.style.opacity = "0.5";
        uploadArea.style.pointerEvents = "none";
      }
    }
  }
  
  console.log("✅ Image upload subscription check initialized");
});

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

console.log("✅ Dashboard.js loaded successfully!");

// ============================================
// 9️⃣ HELPER FUNCTIONS ✅
// ============================================
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

// console.log('✅ Dashboard.js loaded successfully!');

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

// ============================================
// 4️⃣ SHOW LOCKED MODAL ✅
// ============================================
function showImageUploadLockedModal() {
  const modal = document.createElement("div");
  modal.className = "modal-overlay-inline";
  modal.innerHTML = `
    <div class="modal-inline">
      <div class="modal-header-inline">
        <h3>🔒 Premium Feature</h3>
        <button class="modal-close-inline" onclick="this.closest('.modal-overlay-inline').remove()">×</button>
      </div>
      <div class="modal-body-inline" style="text-align: center; padding: 30px;">
        <div style="font-size: 48px; margin-bottom: 20px;">📷</div>
        <p style="font-size: 18px; color: #4b5563; margin-bottom: 15px;">
          Image upload is available for <strong>Standard</strong> and <strong>Pro</strong> plans
        </p>
        <p style="font-size: 16px; color: #6b7280; margin-bottom: 25px;">
          Upgrade your plan to unlock this feature
        </p>
        <button onclick="window.openSubscriptionPaymentModal('STANDARD_SUB'); this.closest('.modal-overlay-inline').remove()" class="btn-inline btn-primary-inline">
          <i class="bi bi-star"></i> Upgrade Now
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add("active"), 10);
}


// ============================================
// 1️⃣ HELPER FUNCTION - CHECK USER SUBSCRIPTION FROM FIREBASE
// ============================================
async function checkUserSubscription() {
  const user = window.firebaseAuth?.currentUser;
  
  if (!user) {
    console.error("❌ User not logged in");
    return { type: "free", expiry: null };
  }

  try {
    const db = window.firebaseDatabase;
    if (!db) {
      console.error("❌ Database not initialized");
      return { type: "free", expiry: null };
    }

    const subRef = window.firebaseRef(db, `users/${user.uid}/subscription`);
    const snapshot = await window.firebaseGet(subRef);

    if (snapshot.exists()) {
      const subData = snapshot.val();
      const subscriptionType = (subData.type || "free").toLowerCase();
      const expiry = subData.expiry;

      console.log("✅ Subscription:", subscriptionType);
      return { type: subscriptionType, expiry: expiry };
    }

    console.log("⚠️ No subscription data, defaulting to free");
    return { type: "free", expiry: null };

  } catch (error) {
    console.error("❌ Subscription check error:", error);
    return { type: "free", expiry: null };
  }
}

// ============================================
// 1️⃣ SWITCH HOMEWORK TAB - FIXED ✅
// ============================================
async function switchHomeworkTab(tab) {
  const textTab = document.getElementById("textInputTab");
  const imageTab = document.getElementById("imageInputTab");
  const textBtn = document.getElementById("textTabBtn");
  const imageBtn = document.getElementById("imageTabBtn");

  if (tab === "text") {
    console.log("🔄 Switching to TEXT tab - clearing image...");

    uploadedImage = null;

    const previewImg = document.getElementById("previewImg");
    const imageFileName = document.getElementById("imageFileName");
    const fileInput = document.getElementById("homeworkImageInput");
    const uploadArea = document.getElementById("imageUploadArea");
    const imagePreview = document.getElementById("imagePreview");

    if (previewImg) previewImg.src = "";
    if (imageFileName) imageFileName.textContent = "";
    if (fileInput) fileInput.value = "";
    if (uploadArea) uploadArea.style.display = "block";
    if (imagePreview) imagePreview.style.display = "none";

    textTab.style.display = "block";
    imageTab.style.display = "none";
    textBtn.classList.add("active", "linear-act-bc");
    textBtn.classList.remove("bg-bc");
    textBtn.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    textBtn.style.color = "white";
    imageBtn.classList.remove("active", "linear-act-bc");
    imageBtn.classList.add("bg-bc");
    imageBtn.style.background = "#f3f4f6";
    imageBtn.style.color = "#6b7280";
    
  } else {
    // IMAGE TAB
    console.log("🔄 Switching to IMAGE tab - checking subscription...");

    textTab.style.display = "none";
    imageTab.style.display = "block";
    imageBtn.classList.add("active", "linear-act-bc");
    imageBtn.classList.remove("bg-bc");
    imageBtn.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    imageBtn.style.color = "white";
    textBtn.classList.remove("active", "linear-act-bc");
    textBtn.classList.add("bg-bc");
    textBtn.style.background = "#f3f4f6";
    textBtn.style.color = "#6b7280";

    const subscription = await checkUserSubscription();
    console.log("📊 Subscription type:", subscription.type);

    const fileInput = document.getElementById("homeworkImageInput");
    const uploadArea = document.getElementById("imageUploadArea");

    if (subscription.type === "free") {
      console.log("🔒 Free user - LOCKING image upload");
      
      if (fileInput) fileInput.disabled = true;
      
      if (uploadArea) {
        const existingOverlay = uploadArea.querySelector('.lock-overlay');
        if (existingOverlay) {
          existingOverlay.remove();
        }
        
        uploadArea.style.opacity = "0.7";
        uploadArea.style.cursor = "not-allowed";
        uploadArea.style.position = 'relative';
        
        // ✅ Create lock overlay - BLOCKS ALL INTERACTIONS
        const lockOverlay = document.createElement('div');
        lockOverlay.className = 'lock-overlay';
        lockOverlay.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.92);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          z-index: 100;
          pointer-events: auto;
          cursor: pointer;
        `;
        lockOverlay.innerHTML = `
          <div style="text-align: center; user-select: none;">
            <i class="bi bi-lock-fill" style="font-size: 52px; color: #6b7280; display: block; margin-bottom: 12px;"></i>
            <p style="color: #374151; font-weight: 700; margin: 0; font-size: 15px;">Premium Feature</p>
            <p style="color: #9ca3af; font-size: 13px; margin: 8px 0 0 0; font-weight: 500;">Click to upgrade</p>
          </div>
        `;
        
        // ✅ CLICK HANDLER FOR LOCK
        lockOverlay.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          console.log("🔒 Lock overlay clicked - showing modal");
          showImageUploadLockedModal();
        });
        
        uploadArea.appendChild(lockOverlay);
        console.log("✅ Lock overlay added (blocks all interactions)");
      }
    } else {
      console.log("✅ Standard/Pro user - ENABLING image upload");
      
      if (fileInput) fileInput.disabled = false;
      
      if (uploadArea) {
        uploadArea.style.opacity = "1";
        uploadArea.style.cursor = "pointer";
        
        const lockOverlay = uploadArea.querySelector('.lock-overlay');
        if (lockOverlay) {
          lockOverlay.remove();
          console.log("✅ Lock overlay removed");
        }
      }
      
      // ✅ Initialize upload for paid users
      setTimeout(() => {
        initializeHomeworkImageUpload();
      }, 100);
    }
  }
}

// ============================================
// HANDLE FILE INPUT CHANGE - VERIFIED ✅
// ============================================
async function handleImageUpload(event) {
  event.stopPropagation();
  event.preventDefault();

  console.log("📁 handleImageUpload called");
  console.log("Files:", event.target.files);

  const file = event.target.files[0];
  
  if (!file) {
    console.warn("⚠️ No file selected");
    return;
  }

  console.log("✅ File selected:", file.name, file.size, "bytes");

  // Process the file
  processImageFile(file);

  // Reset input
  event.target.value = "";
}

// ============================================
// 2️⃣ PROCESS IMAGE FILE (Validation + Preview)
// ============================================
function processImageFile(file) {
  console.log("🔍 Processing image:", file.name, file.size, "bytes");

  // ✅ Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    alert("❌ File too large! Maximum size is 5MB.");
    return;
  }

  // ✅ Validate file type
  if (!file.type.startsWith("image/")) {
    alert("⚠️ Please upload an image file (PNG, JPG, JPEG)");
    return;
  }

  // ✅ Store file globally
  uploadedImage = file;
  console.log("✅ Image stored:", uploadedImage.name);

  // ✅ Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    const previewImg = document.getElementById("previewImg");
    const imageFileName = document.getElementById("imageFileName");
    const uploadArea = document.getElementById("imageUploadArea");
    const imagePreview = document.getElementById("imagePreview");

    if (previewImg) previewImg.src = e.target.result;
    if (imageFileName) imageFileName.textContent = file.name;
    if (uploadArea) uploadArea.style.display = "none";
    if (imagePreview) imagePreview.style.display = "block";

    console.log("✅ Preview displayed");
  };
  reader.readAsDataURL(file);
}

// Homework Image Upload (drag-drop, click working)
function initializeHomeworkImageUpload() {
  if (isHomeworkUploadInitialized) {
    console.log("⏭️ Homework upload already initialized");
    return;
  }

  const uploadArea = document.getElementById("imageUploadArea");
  const fileInput = document.getElementById("homeworkImageInput");
  
  if (!uploadArea || !fileInput) {
    console.warn("⚠️ Upload elements not found");
    return;
  }

  // File input change
  const fileInputChangeHandler = (e) => {
    console.log("📁 File input changed");
    handleImageUpload(e);
  };

  fileInput.removeEventListener("change", fileInputChangeHandler);
  fileInput.addEventListener("change", fileInputChangeHandler);

  // Click handler
  const clickHandler = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    const subscription = await checkUserSubscription();
    
    if (subscription.type === "free") {
      console.log("🔒 Free user clicked");
      showImageUploadLockedModal();
      return;
    }

    console.log("✅ Opening file picker");
    fileInput.click();
  };

  // Replace element to remove old listeners
  const newUploadArea = uploadArea.cloneNode(true);
  uploadArea.parentNode.replaceChild(newUploadArea, uploadArea);
  
  const freshUploadArea = document.getElementById("imageUploadArea");
  freshUploadArea.addEventListener("click", clickHandler, true);

  // DRAG OVER
  freshUploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const lockOverlay = freshUploadArea.querySelector('.lock-overlay');
    
    if (lockOverlay) {
      freshUploadArea.style.borderColor = "#ef4444";
      freshUploadArea.style.background = "#fee";
    } else {
      freshUploadArea.style.borderColor = "#667eea";
      freshUploadArea.style.background = "#f0f2ff";
    }
    
    freshUploadArea.style.borderWidth = "4px";
  });

  // DRAG LEAVE
  freshUploadArea.addEventListener("dragleave", (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    freshUploadArea.style.borderColor = "#d1d5db";
    freshUploadArea.style.background = "#f9fafb";
    freshUploadArea.style.borderWidth = "3px";
  });

  // DROP
  freshUploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    freshUploadArea.style.borderColor = "#d1d5db";
    freshUploadArea.style.background = "#f9fafb";
    freshUploadArea.style.borderWidth = "3px";

    console.log("📦 File dropped");

    const lockOverlay = freshUploadArea.querySelector('.lock-overlay');
    
    if (lockOverlay) {
      console.log("🔒 Free user - drop blocked");
      showImageUploadLockedModal();
      return;
    }

    console.log("✅ Processing dropped file");
    const file = e.dataTransfer.files[0];
    if (file) {
      processImageFile(file);
    }
  });

  isHomeworkUploadInitialized = true;
  console.log("✅ Homework drag-drop initialized (paste disabled)");
}

// ============================================
// 3️⃣ PASTE FROM CLIPBOARD - WITH SUBSCRIPTION CHECK ✅
// HOMEWORK PASTE HANDLER - FIXED
// ============================================

// Remove old listener
// if (window.homeworkPasteHandlerAdded) {
//   document.removeEventListener("paste", handleHomeworkPasteEvent);
//   window.homeworkPasteHandlerAdded = false;
// }

// function handleHomeworkPasteEvent(e) {
//   const homeworkContent = document.getElementById("homework-content");
//   if (!homeworkContent || homeworkContent.style.display === "none") {
//     return;
//   }

//   const imageTab = document.getElementById("imageInputTab");
//   if (!imageTab || imageTab.style.display === "none") {
//     return;
//   }

//   const items = e.clipboardData.items;
//   let hasImage = false;
  
//   for (let item of items) {
//     if (item.type.indexOf("image") !== -1) {
//       hasImage = true;
//       break;
//     }
//   }

//   if (!hasImage) return;

//   e.preventDefault();
//   e.stopPropagation();
  
//   console.log("📋 Paste blocked, checking subscription...");

//   (async () => {
//     const subscription = await checkUserSubscription();
    
//     if (subscription.type === "free") {
//       console.log("🔒 Free user - paste BLOCKED");
//       showImageUploadLockedModal();
//       return;
//     }

//     console.log("✅ Paid user - processing pasted image");

//     for (let item of items) {
//       if (item.type.indexOf("image") !== -1) {
//         const file = item.getAsFile();
//         if (file) {
//           processImageFile(file);

//           const uploadArea = document.getElementById("imageUploadArea");
//           if (uploadArea && uploadArea.style.display !== "none") {
//             uploadArea.style.borderColor = "#10b981";
//             uploadArea.style.background = "#d1fae5";

//             setTimeout(() => {
//               uploadArea.style.borderColor = "#d1d5db";
//               uploadArea.style.background = "#f9fafb";
//             }, 1000);
//           }
//         }
//         break;
//       }
//     }
//   })();
// }

// document.addEventListener("paste", handleHomeworkPasteEvent);
// window.homeworkPasteHandlerAdded = true;

// console.log("✅ Homework Paste Handler (SYNC BLOCK) loaded!");

// ============================================
// 5️⃣ INITIALIZE ON PAGE LOAD - ONCE ONLY ✅
// ============================================
window.addEventListener("load", () => {
  console.log("🔧 Page loaded - initializing image upload");
  
  // Wait for DOM to be ready
  setTimeout(() => {
    initializeHomeworkImageUpload();
  }, 500);
});


// ============================================
// 6️⃣ REMOVE IMAGE FUNCTION
// ============================================
function removeImage() {
  uploadedImage = null;

  const previewImg = document.getElementById("previewImg");
  const imageFileName = document.getElementById("imageFileName");
  const fileInput = document.getElementById("homeworkImageInput");
  const uploadArea = document.getElementById("imageUploadArea");
  const imagePreview = document.getElementById("imagePreview");

  if (previewImg) previewImg.src = "";
  if (imageFileName) imageFileName.textContent = "";
  if (fileInput) fileInput.value = "";
  if (uploadArea) uploadArea.style.display = "block";
  if (imagePreview) imagePreview.style.display = "none";

  console.log("✅ Image removed, upload area restored");
}

// ============================================
// PASTE FROM CLIPBOARD
// ============================================
// document.addEventListener("paste", (e) => {
//   const imageTab = document.getElementById("imageInputTab");
//   if (imageTab?.style.display === "none") return;

//   const items = e.clipboardData.items;
//   for (let item of items) {
//     if (item.type.indexOf("image") !== -1) {
//       const file = item.getAsFile();
//       processImageFile(file);
//       break;
//     }
//   }
// });

// ============================================
// COIN CHECK FUNCTION - FIREBASE VERSION ✅
// ============================================
async function checkAndSpendCoins(toolName) {
  console.log(`🪙 Checking coins for tool: ${toolName}`);

  // ✅ Get current user
  const user = window.firebaseAuth?.currentUser;
  if (!user) {
    console.error("❌ User not logged in");
    alert("Please log in first!");
    return false;
  }

  // ✅ Check if Firebase coin functions exist
  if (typeof canUseTool !== "function" || typeof useTool !== "function") {
    console.error("❌ Coin system not loaded!");
    alert("⚠️ Coin system loading... Please wait and try again.");
    return false;
  }

  try {
    // ✅ CRITICAL: Use useTool which checks AND deducts
    const success = await useTool(toolName);

    if (!success) {
      console.error(`❌ Cannot use tool: ${toolName}`);
      // Modal is already shown by useTool()
      return false;
    }

    console.log(`✅ Tool ${toolName} authorized and coins deducted`);

    // Update display
    if (typeof updateCoinDisplay === "function") {
      await updateCoinDisplay();
    }

    return true;
  } catch (error) {
    console.error(`❌ Coin check error for ${toolName}:`, error);
    alert("⚠️ Coin system error. Please try again.");
    return false;
  }
}

// ============================================
// TESTING HELPERS (Console commands)
// ============================================

// Console da ishlatish uchun:
window.testCoinSystem = function () {
  console.log("=== COIN SYSTEM TEST ===");
  console.log(
    "Coin Manager:",
    window.coinManager ? "✅ Active" : "❌ Not initialized"
  );

  if (window.coinManager) {
    console.log("Current Balance:", window.coinManager.getCoins(), "coins");
    console.log("Total Earned:", window.coinManager.data.totalEarned);
    console.log("Total Spent:", window.coinManager.data.totalSpent);
    console.log("Subscription:", window.coinManager.data.subscription);
    console.log("Tool Usage:", window.coinManager.data.toolUsageCount);
  }
  console.log("========================");
};

window.addTestCoins = function (amount) {
  if (!window.coinManager) {
    console.error("❌ Coin manager not initialized");
    return;
  }
  window.coinManager.addCoins(amount || 50, "Test coins");
  console.log(
    `✅ Added ${
      amount || 50
    } test coins. New balance: ${window.coinManager.getCoins()}`
  );
};

window.resetCoinSystem = function () {
  if (!window.coinManager) {
    console.error("❌ Coin manager not initialized");
    return;
  }
  window.coinManager.reset();
  console.log("🔄 Coin system reset to defaults");
};

console.log("✅ Coin check function (FIXED) loaded!");
console.log("💡 Test commands:");
console.log("   window.testCoinSystem() - show current state");
console.log("   window.addTestCoins(50) - add test coins");
console.log("   window.resetCoinSystem() - reset to defaults");

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

// ============================================
// MATH FORMULA RENDERER - dashboard.js ga qo'shing
// ============================================

// ✅ Initialize MathJax/KaTeX when page loads
window.addEventListener("load", () => {
  console.log("🔢 Initializing math renderer...");

  // Check which library is available
  if (typeof MathJax !== "undefined") {
    console.log("✅ MathJax loaded");
  } else if (typeof renderMathInElement !== "undefined") {
    console.log("✅ KaTeX loaded");
  } else {
    console.warn("⚠️ No math rendering library found!");
  }
});

// ============================================
// RENDER MATH FORMULAS
// ============================================
function renderMathFormulas(element) {
  if (!element) {
    console.error("❌ No element provided for math rendering");
    return;
  }

  try {
    // Method 1: MathJax (preferred for complex formulas)
    if (typeof MathJax !== "undefined" && MathJax.typesetPromise) {
      console.log("🔢 Rendering with MathJax...");

      MathJax.typesetPromise([element])
        .then(() => {
          console.log("✅ MathJax rendered successfully");
          // Add styling to math elements
          element.querySelectorAll(".MathJax").forEach((mjx) => {
            mjx.style.fontSize = "1.1em";
            mjx.style.margin = "0 4px";
          });
        })
        .catch((err) => {
          console.error("❌ MathJax error:", err);
          fallbackToKaTeX(element);
        });
    }
    // Method 2: KaTeX (fallback, faster but simpler)
    else if (typeof renderMathInElement !== "undefined") {
      console.log("🔢 Rendering with KaTeX...");
      renderKatexFormulas(element);
    }
    // Method 3: Manual rendering (basic fallback)
    else {
      console.warn("⚠️ No math library, using basic rendering");
      renderBasicMath(element);
    }
  } catch (error) {
    console.error("❌ Math rendering error:", error);
  }
}

// Render with KaTeX
function renderKatexFormulas(element) {
  try {
    renderMathInElement(element, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true },
        { left: "```latex", right: "```", display: true },
      ],
      throwOnError: false,
      strict: false,
      trust: true,
      macros: {
        "\\RR": "\\mathbb{R}",
        "\\NN": "\\mathbb{N}",
      },
    });

    console.log("✅ KaTeX rendered successfully");

    // Style KaTeX elements
    element.querySelectorAll(".katex").forEach((katex) => {
      katex.style.fontSize = "1.1em";
      katex.style.margin = "0 4px";
    });
  } catch (error) {
    console.error("❌ KaTeX error:", error);
    renderBasicMath(element);
  }
}

// Fallback to KaTeX if MathJax fails
function fallbackToKaTeX(element) {
  console.log("🔄 Falling back to KaTeX...");
  if (typeof renderMathInElement !== "undefined") {
    renderKatexFormulas(element);
  } else {
    renderBasicMath(element);
  }
}

// Basic math rendering (no library needed)
function renderBasicMath(element) {
  console.log("📐 Using basic math rendering...");

  let html = element.innerHTML;

  // Replace common LaTeX patterns with Unicode
  html = html
    // Fractions: \frac{a}{b} → (a)/(b)
    .replace(
      /\\frac\{([^}]+)\}\{([^}]+)\}/g,
      '<span style="display: inline-block; text-align: center;"><span style="display: block; border-bottom: 1px solid #000; padding: 0 4px;">$1</span><span style="display: block; padding: 0 4px;">$2</span></span>'
    )

    // Square root: \sqrt{x} → √x
    .replace(
      /\\sqrt\{([^}]+)\}/g,
      '<span style="position: relative; padding-left: 18px;"><span style="position: absolute; left: 0; font-size: 1.4em;">√</span><span style="border-top: 1px solid #000; padding: 0 4px;">$1</span></span>'
    )

    // Root with index: \sqrt[n]{x} → ⁿ√x
    .replace(
      /\\sqrt\[(\d+)\]\{([^}]+)\}/g,
      '<span style="position: relative; padding-left: 22px;"><span style="position: absolute; left: 0; top: -4px; font-size: 0.7em;">$1</span><span style="position: absolute; left: 8px; font-size: 1.4em;">√</span><span style="border-top: 1px solid #000; padding: 0 4px;">$2</span></span>'
    )

    // Superscript: x^{2} → x²
    .replace(/([a-zA-Z0-9])\^\{([^}]+)\}/g, "$1<sup>$2</sup>")

    // Subscript: x_{2} → x₂
    .replace(/([a-zA-Z0-9])_\{([^}]+)\}/g, "$1<sub>$2</sub>")

    // Operators
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\cdot/g, "·")
    .replace(/\\pm/g, "±")
    .replace(/\\leq/g, "≤")
    .replace(/\\geq/g, "≥")
    .replace(/\\neq/g, "≠")
    .replace(/\\approx/g, "≈")

    // Remove remaining LaTeX commands
    .replace(/\\[a-zA-Z]+/g, "");

  element.innerHTML = html;
  console.log("✅ Basic math rendered");
}

// ============================================
// COMPLETE FIX: HOMEWORK + COIN SYSTEM + SUBJECT DETECTION
// ============================================

// 1️⃣ TEMPORARILY DISABLE PRO SUBSCRIPTION FOR TESTING
console.log("🧪 TEST MODE: Forcing Free subscription for testing");

// Override subscription check temporarily
if (window.coinManager && window.coinManager.data.subscription === "pro") {
  console.warn("⚠️ Detected Pro subscription, switching to Free for testing");
  window.coinManager.data.subscription = "free";
  window.coinManager.data.coins = 1016; // Your current balance
  window.coinManager.saveData();
  console.log("✅ Switched to Free subscription with 1016 coins");
}

// ============================================
// FIXED HOMEWORK FUNCTION - IMPROVED ✅
// ============================================
async function fixHomework() {
  console.log("🎯 fixHomework() called");

  // 🪙 COIN CHECK
  console.log("💰 Checking coins...");
  const canProceed = await checkAndSpendCoins("homework");

  if (!canProceed) {
    console.error("❌ BLOCKED: insufficient coins");
    return;
  }

  console.log("✅ Coins deducted, proceeding...");

  const result = document.getElementById("homeworkResult");
  const output = document.getElementById("homeworkOutput");
  const languageDropdown = document.getElementById("homework-language");
  const language = languageDropdown ? languageDropdown.value : "uz";

  let homework = document.getElementById("homeworkInput").value.trim();

  // ✅ CHECK WHICH TAB IS ACTIVE
  const textTab = document.getElementById("textInputTab");
  const imageTab = document.getElementById("imageInputTab");

  const isTextTabActive = textTab && textTab.style.display !== "none";
  const isImageTabActive = imageTab && imageTab.style.display !== "none";

  console.log("📋 Active tab:", isTextTabActive ? "TEXT" : "IMAGE");
  console.log(
    "📝 Homework text:",
    homework ? homework.substring(0, 50) + "..." : "(empty)"
  );
  console.log("🖼️ Uploaded image:", uploadedImage ? "YES" : "NO");

  // ============================================
  // ✅ SCENARIO 1: TEXT TAB ACTIVE
  // ============================================
  if (isTextTabActive) {
    console.log("✅ Processing TEXT mode");

    // Clear any lingering image data
    if (uploadedImage) {
      console.warn("⚠️ Image data found in TEXT mode - clearing it");
      uploadedImage = null;
    }

    // Validate text input
    if (!homework) {
      if (window.coinManager) {
        window.coinManager.addCoins(3, "Refund: No homework text");
        updateCoinDisplay();
      }
      alert("⚠️ Please enter your homework text!");
      return;
    }

    result.style.display = "block";
    showLoading(output);

    try {
      const response = await fetch(`${API_URL}/fix-homework`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homework: homework,
          image: null, // ✅ EXPLICITLY NULL
          type: "text",
          language: language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (window.coinManager) {
          window.coinManager.addCoins(3, "Refund: Server error");
          updateCoinDisplay();
        }
        throw new Error(data.error || "Server error");
      }

      if (data.success && data.correctedHomework) {
        displayHomeworkResult(data, output);
      } else {
        throw new Error("No response from AI");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      if (window.coinManager) {
        window.coinManager.addCoins(3, "Refund: " + error.message);
        updateCoinDisplay();
      }
      showError(output, error.message);
    }

    return; // ✅ EXIT HERE
  }

  // ============================================
  // ✅ SCENARIO 2: IMAGE TAB ACTIVE
  // ============================================
  if (isImageTabActive) {
    console.log("✅ Processing IMAGE mode");

    if (!uploadedImage) {
      if (window.coinManager) {
        window.coinManager.addCoins(3, "Refund: No image uploaded");
        updateCoinDisplay();
      }
      alert("⚠️ Please upload an image first!");
      return;
    }

    result.style.display = "block";
    showLoading(output);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target.result;

      try {
        const response = await fetch(`${API_URL}/fix-homework`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            homework: null, // ✅ EXPLICITLY NULL
            image: imageData,
            type: "image",
            language: language,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (window.coinManager) {
            window.coinManager.addCoins(3, "Refund: Server error");
            updateCoinDisplay();
          }
          throw new Error(data.error || "Server error");
        }

        if (data.success && data.correctedHomework) {
          displayHomeworkResult(data, output);
        } else {
          throw new Error("No response from AI");
        }
      } catch (error) {
        console.error("❌ Error:", error);
        if (window.coinManager) {
          window.coinManager.addCoins(3, "Refund: " + error.message);
          updateCoinDisplay();
        }
        showError(output, error.message);
      }
    };

    reader.readAsDataURL(uploadedImage);
    return; // ✅ EXIT HERE
  }

  // ============================================
  // ✅ SCENARIO 3: FALLBACK (shouldn't happen)
  // ============================================
  console.error("❌ No active tab detected!");
  alert("⚠️ Please select Text or Image mode");
  if (window.coinManager) {
    window.coinManager.addCoins(3, "Refund: No mode selected");
    updateCoinDisplay();
  }
}

// ============================================
// HELPER: Display Homework Result
// ============================================
function displayHomeworkResult(data, output) {
  console.log("✅ Homework corrected successfully");

  // ✅ SUBJECT DETECTION
  let subjectBadge = "";

  if (data.detectedSubject && data.subjectEmoji) {
    subjectBadge = `
      <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin-bottom: 15px;">
        ${data.subjectEmoji} ${data.detectedSubject.toUpperCase()}
      </div>
    `;
  }

  output.innerHTML = `
    ${subjectBadge}
    <div class="alert alert-success">
      <h5 class="alert-heading">
        <i class="bi bi-check-circle-fill"></i> AI Tahlil
      </h5>
      <hr>
      <div id="mathContent" style="white-space: pre-wrap; line-height: 1.8;">
        ${data.correctedHomework}
      </div>
    </div>
  `;

  // ✅ RENDER MATH
  const mathContent = document.getElementById("mathContent");
  if (mathContent && typeof renderMathFormulas === "function") {
    renderMathFormulas(mathContent);
  }

  // Track stats
  if (typeof trackToolUsage === "function") trackToolUsage("homework");
  if (typeof incrementStat === "function") {
    incrementStat("homeworkCompleted", 1);
    incrementStat("totalStudyTime", 3);
  }
}

// ============================================
// 3️⃣ FRONTEND SUBJECT DETECTION (FALLBACK)
// ============================================
function detectSubject(text) {
  if (!text) return null;

  const textLower = text.toLowerCase();

  const subjects = [
    // Math
    {
      keywords: [
        "matematik",
        "algebra",
        "geometriya",
        "trigonometriya",
        "calculus",
        "integral",
        "derivative",
        "equation",
        "formula",
        "theorem",
        "proof",
        "x=",
        "y=",
        "+",
        "-",
        "*",
        "/",
        "=",
        "²",
        "³",
        "sin",
        "cos",
        "tan",
        "log",
      ],
      name: "Matematika",
      emoji: "🔢",
    },
    // Physics
    {
      keywords: [
        "fizika",
        "physics",
        "mexanika",
        "elektr",
        "magnit",
        "yorug'lik",
        "issiqlik",
        "energiya",
        "kuch",
        "tezlik",
        "massa",
        "zaryad",
        "tok",
        "kuchlanish",
        "qarshilik",
        "quvvat",
        "newton",
        "joule",
        "watt",
        "volt",
        "ampere",
      ],
      name: "Fizika",
      emoji: "⚛️",
    },
    // Chemistry
    {
      keywords: [
        "kimyo",
        "chemistry",
        "element",
        "molekula",
        "atom",
        "reaksiya",
        "oksid",
        "kislota",
        "asos",
        "tuz",
        "ionlar",
        "elektrolitlar",
        "pH",
        "H2O",
        "O2",
        "CO2",
        "NaCl",
        "H2SO4",
      ],
      name: "Kimyo",
      emoji: "🧪",
    },
    // Biology
    {
      keywords: [
        "biologiya",
        "biology",
        "hujayra",
        "gen",
        "DNK",
        "o'simlik",
        "hayvon",
        "organizm",
        "to'qima",
        "a'zo",
        "fotosintez",
        "nafas",
        "qon",
        "yurak",
        "evolyutsiya",
      ],
      name: "Biologiya",
      emoji: "🧬",
    },
    // English
    {
      keywords: [
        "ingliz",
        "english",
        "grammar",
        "vocabulary",
        "tense",
        "present",
        "past",
        "future",
        "verb",
        "noun",
        "adjective",
        "adverb",
        "article",
        "preposition",
      ],
      name: "Ingliz tili",
      emoji: "🇬🇧",
    },
    // Geography
    {
      keywords: [
        "geografiya",
        "geography",
        "qit'a",
        "okean",
        "daryo",
        "tog'",
        "cho'l",
        "iqlim",
        "xarita",
        "davlat",
        "poytaxt",
        "aholi",
        "resurlar",
      ],
      name: "Geografiya",
      emoji: "🌍",
    },
    // History
    {
      keywords: [
        "tarix",
        "history",
        "davlat",
        "urush",
        "siyosat",
        "imperiya",
        "inqilob",
        "sulola",
        "amir",
        "shoh",
        "xon",
        "qudrat",
      ],
      name: "Tarix",
      emoji: "📜",
    },
    // Literature
    {
      keywords: [
        "adabiyot",
        "literature",
        "she'r",
        "hikoya",
        "roman",
        "drama",
        "qissa",
        "shoir",
        "yozuvchi",
        "asar",
        "badiiy",
        "nasriy",
      ],
      name: "Adabiyot",
      emoji: "📚",
    },
    // Computer Science
    {
      keywords: [
        "informatika",
        "computer",
        "dasturlash",
        "kod",
        "algoritm",
        "python",
        "javascript",
        "html",
        "css",
        "function",
        "class",
        "array",
        "loop",
        "if",
        "else",
        "print",
        "return",
      ],
      name: "Informatika",
      emoji: "💻",
    },
  ];

  for (const subject of subjects) {
    let matchCount = 0;
    for (const keyword of subject.keywords) {
      if (textLower.includes(keyword)) {
        matchCount++;
      }
    }

    // If 2+ keywords match, return subject
    if (matchCount >= 2) {
      console.log(
        `✅ Subject detected: ${subject.name} (${matchCount} keywords)`
      );
      return subject;
    }
  }

  console.log("⚠️ No subject detected");
  return null;
}

// ============================================
// UPDATE COIN DISPLAY - FIREBASE VERSION ✅
// REPLACE EXISTING updateCoinDisplay FUNCTION
// ============================================
async function updateCoinDisplay() {
  if (typeof getUserCoins !== "function") {
    console.warn("⚠️ getUserCoins function not available");
    return;
  }

  try {
    const coins = await getUserCoins();

    console.log("💰 Updating coin display:", coins);

    // Update all coin displays
    const coinElements = document.querySelectorAll(
      "#userCoins, .coin-amount, #profileCoinBalance"
    );
    coinElements.forEach((el) => {
      if (el) {
        el.textContent = coins;

        // Animation
        el.style.transform = "scale(1.2)";
        setTimeout(() => {
          el.style.transform = "scale(1)";
        }, 200);
      }
    });

    // Update profile if needed
    if (typeof updateProfileCoinDisplay === "function") {
      updateProfileCoinDisplay();
    }
  } catch (error) {
    console.error("❌ Update coin display error:", error);
  }
}

// ============================================
// 5️⃣ TESTING COMMANDS
// ============================================
window.testHomework = function () {
  console.log("=== HOMEWORK SYSTEM TEST ===");
  console.log(
    "Coin Manager:",
    window.coinManager ? "✅ Active" : "❌ Not initialized"
  );
  if (window.coinManager) {
    console.log("Current Balance:", window.coinManager.getCoins(), "coins");
    console.log("Subscription:", window.coinManager.data.subscription);
  }
  console.log(
    "Homework Input:",
    document.getElementById("homeworkInput")?.value || "(empty)"
  );
  console.log("Uploaded Image:", uploadedImage ? "✅ Yes" : "❌ No");
  console.log("===========================");
};

window.switchToFree = function () {
  if (window.coinManager) {
    window.coinManager.data.subscription = "free";
    window.coinManager.saveData();
    console.log("✅ Switched to Free subscription");
    updateCoinDisplay();
  }
};

window.switchToPro = function () {
  if (window.coinManager) {
    window.coinManager.data.subscription = "pro";
    window.coinManager.saveData();
    console.log("✅ Switched to Pro subscription");
    updateCoinDisplay();
  }
};

console.log("✅ Complete homework fix loaded!");
console.log("📝 Commands:");
console.log("  window.testHomework() - test system");
console.log("  window.switchToFree() - switch to Free");
console.log("  window.switchToPro() - switch to Pro");

// ============================================
// FORMAT AI RESPONSE WITH MATH SUPPORT ✅
// ============================================
function formatAIResponse(text) {
  let html = text;

  // Protect LaTeX formulas from formatting
  const latexBlocks = [];
  html = html.replace(/\$\$[\s\S]+?\$\$/g, (match) => {
    latexBlocks.push(match);
    return `__LATEX_BLOCK_${latexBlocks.length - 1}__`;
  });

  html = html.replace(/\$[^$]+\$/g, (match) => {
    latexBlocks.push(match);
    return `__LATEX_INLINE_${latexBlocks.length - 1}__`;
  });

  // Format regular text (existing code)
  html = html.replace(/\*\*(\d+)\.\s*([^*]+)\*\*/g, (match, number, title) => {
    const icons = { 1: "🔍", 2: "✅", 3: "📐", 4: "📝", 5: "💡" };
    return `<div class="ai-section">
      <div class="ai-heading">
        <span class="ai-icon">${icons[number] || "📌"}</span>
        <span class="ai-number">${number}</span>
        <span class="ai-title">${title.trim()}</span>
      </div>
      <div class="ai-body">`;
  });

  html = html.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong class="ai-bold">$1</strong>'
  );
  html = html.replace(/^[-•]\s+(.+)$/gm, '<div class="ai-bullet">$1</div>');

  // Restore LaTeX formulas
  html = html.replace(
    /__LATEX_BLOCK_(\d+)__/g,
    (match, index) => latexBlocks[index]
  );
  html = html.replace(
    /__LATEX_INLINE_(\d+)__/g,
    (match, index) => latexBlocks[index]
  );

  return html;
}

console.log("✅ Math Formula Renderer loaded");

// ============================================
// GRAMMAR CHECKER - TRACKING FAQAT SUCCESS DA ✅
// ============================================
// async function checkGrammar() {
//   const input = document.getElementById("grammarInput").value;
//   const result = document.getElementById("grammarResult");
//   const output = document.getElementById("grammarOutput");
//   const languageDropdown = document.getElementById("grammar-language");
//   const language = languageDropdown ? languageDropdown.value : "uz";

//   if (!input.trim()) {
//     alert("Please enter text!");
//     return;
//   }

//   result.style.display = "block";
//   showLoading(output);

//   try {
//     const response = await fetch(`${API_URL}/check-grammar`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         text: input,
//         language: language,
//       }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.error || "Server error");
//     }

//     if (data.success && data.result) {
//       output.innerHTML = `
//         <div class="alert alert-info">
//           <div style="white-space: pre-wrap; line-height: 1.8;">
//             ${data.result}
//           </div>
//         </div>
//       `;
//       trackToolUsage('grammar');
//       incrementStat('totalStudyTime', 2);
//       addRecentActivity('Grammar Checker', 88, '✍️', '#ec4899');

//       // ✅ TRACKING - FAQAT SUCCESS HOLATIDA
//       console.log('📊 Grammar check completed, tracking...');

//       console.log('✅ Grammar tracking completed!');

//     } else {
//       throw new Error("No response from AI");
//     }
//   } catch (error) {
//     console.error("❌ Error:", error);
//     showError(output, error.message);

//   }
// }

// ============================================
// WRITING CHECKER - YANGILANGAN FRONTEND ✅
// ============================================

// ============================================
// 1️⃣ SELECT TASK TYPE
// ============================================
let selectedTaskType = "Task 2"; // Default

// ============================================
// 1️⃣ SELECT TASK TYPE - WITH SUBSCRIPTION CHECK ✅
// REMOVE ALL OTHER selectTaskType FUNCTIONS AND USE ONLY THIS ONE
// ============================================
async function selectTaskType(taskType) {
  selectedTaskType = taskType;
  console.log("📝 Task type selected:", taskType);

  const task1Btn = document.getElementById("task1Btn");
  const task2Btn = document.getElementById("task2Btn");
  const imageUploadSection = document.getElementById("writingImageSection");
  const topicInput = document.getElementById("essayTopic");

  // ✅ Update button styles
  if (taskType === "Task 1") {
    // Task 1 Active
    if (task1Btn) {
      task1Btn.classList.add("active");
      task1Btn.style.borderColor = "#667eea";
      task1Btn.style.background = "linear-gradient(135deg, #667eea15, #764ba215)";
      const title = task1Btn.querySelector("div:nth-child(2)");
      if (title) title.style.color = "#667eea";
    }

    // Task 2 Inactive
    if (task2Btn) {
      task2Btn.classList.remove("active");
      task2Btn.style.borderColor = "#e5e7eb";
      task2Btn.style.background = "#fff";
      const title = task2Btn.querySelector("div:nth-child(2)");
      if (title) title.style.color = "#1f2937";
    }

    // ✅ Show image upload for Task 1
    if (imageUploadSection) {
      imageUploadSection.style.display = "block";
      console.log("✅ Image upload section shown (Task 1)");
    }

    // Update topic placeholder
    if (topicInput) {
      topicInput.placeholder = "Describe the graph/chart/diagram... (REQUIRED)";
    }

    // ✅ CHECK SUBSCRIPTION AND LOCK/UNLOCK
    const subscription = await checkUserSubscription();
    console.log("📊 Subscription type:", subscription.type);

    const fileInput = document.getElementById("writingImageInput");
    const uploadArea = document.getElementById("writingImageUploadArea");

    if (subscription.type === "free") {
      console.log("🔒 Free user - LOCKING image upload");
      
      if (fileInput) fileInput.disabled = true;
      
      if (uploadArea) {
        // Remove existing overlay if any
        const existingOverlay = uploadArea.querySelector('.lock-overlay');
        if (existingOverlay) {
          existingOverlay.remove();
        }
        
        uploadArea.style.opacity = "0.7";
        uploadArea.style.cursor = "pointer";
        uploadArea.style.position = 'relative';
        
        // ✅ Create lock overlay
        const lockOverlay = document.createElement('div');
        lockOverlay.className = 'lock-overlay';
        lockOverlay.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.92);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          z-index: 10;
          pointer-events: none;
        `;
        lockOverlay.innerHTML = `
          <div style="text-align: center; pointer-events: none; user-select: none;">
            <i class="bi bi-lock-fill" style="font-size: 52px; color: #6b7280; display: block; margin-bottom: 12px;"></i>
            <p style="color: #374151; font-weight: 700; margin: 0; font-size: 15px;">Premium Feature</p>
            <p style="color: #9ca3af; font-size: 13px; margin: 8px 0 0 0; font-weight: 500;">Click to upgrade</p>
          </div>
        `;
        
        uploadArea.appendChild(lockOverlay);
        console.log("✅ Lock overlay added");
      }
    } else {
      console.log("✅ Standard/Pro user - ENABLING image upload");
      
      if (fileInput) fileInput.disabled = false;
      
      if (uploadArea) {
        uploadArea.style.opacity = "1";
        uploadArea.style.cursor = "pointer";
        
        // Remove lock overlay if exists
        const lockOverlay = uploadArea.querySelector('.lock-overlay');
        if (lockOverlay) {
          lockOverlay.remove();
          console.log("✅ Lock overlay removed");
        }
      }

      // ✅ Initialize upload functionality for paid users
      setTimeout(() => {
        initializeWritingImageUpload();
      }, 100);
    }

  } else {
    // Task 2 Active
    if (task2Btn) {
      task2Btn.classList.add("active");
      task2Btn.style.borderColor = "#667eea";
      task2Btn.style.background = "linear-gradient(135deg, #667eea15, #764ba215)";
      const title = task2Btn.querySelector("div:nth-child(2)");
      if (title) title.style.color = "#667eea";
    }

    // Task 1 Inactive
    if (task1Btn) {
      task1Btn.classList.remove("active");
      task1Btn.style.borderColor = "#e5e7eb";
      task1Btn.style.background = "#fff";
      const title = task1Btn.querySelector("div:nth-child(2)");
      if (title) title.style.color = "#1f2937";
    }

    // ✅ Hide image upload for Task 2
    if (imageUploadSection) {
      imageUploadSection.style.display = "none";
      console.log("✅ Image upload section hidden (Task 2)");
    }

    // Update topic placeholder
    if (topicInput) {
      topicInput.placeholder = "Enter the essay question... (REQUIRED)";
    }
  }
}

// ============================================
// 2️⃣ IMAGE UPLOAD FUNCTIONS
// ============================================


// ✅ WRITING DRAG-DROP - FIXED
// Writing Image Upload (drag-drop, click working)
function initializeWritingImageUpload() {
  if (isWritingUploadInitialized) {
    console.log("⏭️ Writing upload already initialized");
    return;
  }

  const uploadArea = document.getElementById("writingImageUploadArea");
  const fileInput = document.getElementById("writingImageInput");
  
  if (!uploadArea || !fileInput) {
    console.warn("⚠️ Writing upload elements not found");
    return;
  }

  // File input change
  const fileInputChangeHandler = (e) => {
    handleWritingImageUpload(e);
  };

  fileInput.removeEventListener("change", fileInputChangeHandler);
  fileInput.addEventListener("change", fileInputChangeHandler);

  // Click handler
  const clickHandler = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    const lockOverlay = uploadArea.querySelector('.lock-overlay');
    
    if (lockOverlay) {
      showImageUploadLockedModal();
      return;
    }

    fileInput.click();
  };

  // Replace element
  const newUploadArea = uploadArea.cloneNode(true);
  uploadArea.parentNode.replaceChild(newUploadArea, uploadArea);
  
  const freshUploadArea = document.getElementById("writingImageUploadArea");
  freshUploadArea.addEventListener("click", clickHandler, true);

  // DRAG OVER
  freshUploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const lockOverlay = freshUploadArea.querySelector('.lock-overlay');
    
    if (lockOverlay) {
      freshUploadArea.style.borderColor = "#ef4444";
      freshUploadArea.style.background = "#fee";
    } else {
      freshUploadArea.style.borderColor = "#667eea";
      freshUploadArea.style.background = "#f0f2ff";
    }
    
    freshUploadArea.style.borderWidth = "4px";
  });

  // DRAG LEAVE
  freshUploadArea.addEventListener("dragleave", (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    freshUploadArea.style.borderColor = "#d1d5db";
    freshUploadArea.style.background = "#f9fafb";
    freshUploadArea.style.borderWidth = "3px";
  });

  // DROP
  freshUploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    freshUploadArea.style.borderColor = "#d1d5db";
    freshUploadArea.style.background = "#f9fafb";
    freshUploadArea.style.borderWidth = "3px";

    const lockOverlay = freshUploadArea.querySelector('.lock-overlay');
    
    if (lockOverlay) {
      showImageUploadLockedModal();
      return;
    }

    const file = e.dataTransfer.files[0];
    if (file) {
      processWritingImage(file);
    }
  });

  isWritingUploadInitialized = true;
  console.log("✅ Writing drag-drop initialized (paste disabled)");
}

console.log("✅ Image Upload System loaded (PASTE DISABLED - will fix later)");
// ============================================
// 4️⃣ CLIPBOARD PASTE SUPPORT ✅
// ============================================
// document.addEventListener("paste", (e) => {
//   const grammarContent = document.getElementById("grammar-content");
//   if (!grammarContent || grammarContent.style.display === "none") {
//     return;
//   }

//   const items = e.clipboardData.items;

//   for (let item of items) {
//     if (item.type.indexOf("image") !== -1) {
//       e.preventDefault(); 

//       const file = item.getAsFile();

//       if (file) {
//         console.log(
//           "📋 Image pasted from clipboard:",
//           file.name || "clipboard-image"
//         );

//         processWritingImage(file);

//         const uploadArea = document.getElementById("writingImageUploadArea");
//         if (uploadArea && uploadArea.style.display !== "none") {
//           uploadArea.style.borderColor = "#10b981";
//           uploadArea.style.background = "#d1fae5";

//           setTimeout(() => {
//             uploadArea.style.borderColor = "#d1d5db";
//             uploadArea.style.background = "#f9fafb";
//           }, 1000);
//         }
//       }

//       break;
//     }
//   }
// });

// ============================================
// 4️⃣ WORD COUNTER (Keep existing)
// ============================================
const grammarInput = document.getElementById("grammarInput");
const wordCounter = document.getElementById("wordCounter");
const wordStatus = document.getElementById("wordStatus");

if (grammarInput && wordCounter) {
  grammarInput.addEventListener("input", () => {
    const text = grammarInput.value.trim();
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    const count = words.length;

    wordCounter.textContent = count;

    if (count < 150) {
      wordStatus.innerHTML =
        '<span style="color: #ef4444;">⚠️ Too short</span>';
    } else if (count >= 150 && count < 250) {
      wordStatus.innerHTML = '<span style="color: #f59e0b;">⚠️ Add more</span>';
    } else if (count >= 250 && count <= 350) {
      wordStatus.innerHTML = '<span style="color: #10b981;">✅ Perfect</span>';
    } else {
      wordStatus.innerHTML =
        '<span style="color: #6b7280;">📝 Good length</span>';
    }
  });
}

// ============================================
// CHECK WRITING - WITH COIN REFUND ✅
// ============================================
async function checkWriting() {
  // 🪙 COIN CHECK - MUST BE FIRST AND BLOCK EXECUTION
  console.log("💰 Checking coins for Writing Checker...");
  const canProceed = await checkAndSpendCoins("grammar");

  if (!canProceed) {
    console.error("❌ BLOCKED: Insufficient coins for Writing Checker");
    return; // ✅ STOP HERE
  }

  console.log("✅ Coins deducted for Writing Checker, proceeding...");

  const text = document.getElementById("grammarInput").value;
  const language = document.getElementById("grammar-language").value;
  const resultBox = document.getElementById("grammarResult");
  const output = document.getElementById("grammarOutput");
  const topicInput = document.getElementById("essayTopic");

  // ✅ GET TOPIC (from text input or image)
  let topic = topicInput.value.trim();
  let topicImageData = null;
  let chartImageData = null;

  // ✅ CHECK: If topic image is uploaded
  if (uploadedTopicImage) {
    console.log("🖼️ Topic image detected, converting to base64...");

    const reader = new FileReader();
    topicImageData = await new Promise((resolve, reject) => {
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error("Topic image read failed"));
      reader.readAsDataURL(uploadedTopicImage);
    });

    if (!topic) {
      topic = "[Topic uploaded as image]";
    }

    console.log("✅ Topic image converted to base64");
  }

  // ✅ VALIDATION 1: Topic is REQUIRED (text or image)
  if (!topic && !topicImageData) {
    // ⚠️ REFUND COINS
    console.warn("⚠️ No topic provided, refunding coins");
    if (window.coinManager) {
      window.coinManager.addCoins(3, "Refund: No topic provided");
      updateCoinDisplay();
    }
    alert(
      "⚠️ Topic is required! / Topicni kiriting!\n\nPlease type the topic or upload it as an image."
    );
    topicInput.focus();
    return;
  }

  // ✅ VALIDATION 2: Text check
  if (!text.trim()) {
    // ⚠️ REFUND COINS
    console.warn("⚠️ No essay text, refunding coins");
    if (window.coinManager) {
      window.coinManager.addCoins(3, "Refund: No essay text");
      updateCoinDisplay();
    }
    alert("⚠️ Please enter your essay! / Essayingizni kiriting!");
    return;
  }

  // ✅ VALIDATION 3: Word count
  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  if (wordCount < 150) {
    // ⚠️ REFUND COINS
    console.warn("⚠️ Essay too short, refunding coins");
    if (window.coinManager) {
      window.coinManager.addCoins(3, "Refund: Essay too short");
      updateCoinDisplay();
    }
    alert(
      `❌ Minimum 150 words required! (Currently ${wordCount} words)\n\nMinimum 150 so'z kerak! (Hozirda ${wordCount} so'z)`
    );
    return;
  }

  // ✅ CHECK: If chart/diagram image is uploaded (Task 1)
  if (uploadedWritingImage) {
    console.log("📊 Chart/diagram image detected, converting to base64...");

    const reader = new FileReader();
    chartImageData = await new Promise((resolve, reject) => {
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error("Chart image read failed"));
      reader.readAsDataURL(uploadedWritingImage);
    });

    console.log("✅ Chart/diagram image converted to base64");
  }

  // Show loading
  resultBox.style.display = "block";
  output.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p style="margin-top: 20px; color: #6b7280; font-size: 16px;">
        <i class="bi bi-hourglass-split"></i> Analyzing your writing...<br>
        <small>This may take 30-60 seconds</small>
      </p>
    </div>
  `;

  try {
    console.log("📤 Sending writing check request...");
    console.log("Task Type:", selectedTaskType);
    console.log("Word Count:", wordCount);
    console.log("Language:", language);
    console.log("Topic:", topic);
    console.log("Has Topic Image:", !!topicImageData);
    console.log("Has Chart Image:", !!chartImageData);

    const API_URL = window.location.hostname.includes("onrender.com")
      ? "https://zioai-backend.onrender.com/api"
      : "http://localhost:3000/api";

    // ✅ Prepare request data
    let requestData = {
      text,
      taskType: selectedTaskType,
      language,
      topic,
    };

    // ✅ Add TOPIC image if uploaded
    if (topicImageData) {
      requestData.topicImage = topicImageData;
      console.log("📊 Topic image added to request");
    }

    // ✅ Add CHART/DIAGRAM image if uploaded (Task 1)
    if (chartImageData) {
      requestData.chartImage = chartImageData;
      console.log("📈 Chart/diagram image added to request");
    }

    // ✅ Send request
    const response = await fetch(`${API_URL}/check-writing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (data.success) {
      console.log("✅ Writing analysis received");

      // ✅ EXTRACT SCORES from AI response
      const scores = extractScoresFromResponse(data.result);

      // Display results with VISUAL DASHBOARD
      output.innerHTML = `
        <!-- 🎨 VISUAL SCORE DASHBOARD -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);">
          <!-- Header with Export Button -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px;">
            <div style="flex: 1;">
              <div style="font-size: 14px; opacity: 0.9; color: rgba(255,255,255,0.8); margin-bottom: 8px;">
                <i class="bi bi-file-text"></i> ${requestData.taskType} | 
                <i class="bi bi-pencil-square"></i> ${wordCount} words
                ${
                  requestData.topicImage
                    ? ' | <i class="bi bi-card-image"></i> Topic (Image)'
                    : ""
                }
                ${
                  requestData.chartImage
                    ? ' | <i class="bi bi-image"></i> Chart (Image)'
                    : ""
                }
              </div>
              <div style="font-size: 28px; font-weight: 900; color: white;">
                📊 Your IELTS Scores
              </div>
            </div>
            
            <button onclick="exportWritingToPDF()" style="padding: 12px 24px; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); color: white; border: 2px solid rgba(255,255,255,0.3); border-radius: 10px; cursor: pointer; font-weight: 700; transition: all 0.3s; display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
              <i class="bi bi-download"></i> Export PDF
            </button>
          </div>
          
          <!-- Overall Score - BIG Display -->
          <div style="text-align: center; margin-bottom: 30px; padding: 25px; background: rgba(255,255,255,0.1); border-radius: 12px; backdrop-filter: blur(10px);">
            <div style="font-size: 72px; font-weight: 900; color: white; line-height: 1; margin-bottom: 5px;">
              ${scores.overall}
            </div>
            <div style="color: rgba(255,255,255,0.9); font-size: 18px; font-weight: 600; letter-spacing: 1px;">
              OVERALL BAND SCORE
            </div>
          </div>
          
          <!-- Individual Scores Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            ${createScoreCard(
              "Task Achievement",
              scores.task || "7",
              "#10b981"
            )}
            ${createScoreCard(
              "Coherence & Cohesion",
              scores.coherence || "8",
              "#3b82f6"
            )}
            ${createScoreCard(
              "Lexical Resource",
              scores.lexical || "7.5",
              "#f59e0b"
            )}
            ${createScoreCard(
              "Grammar & Accuracy",
              scores.grammar || "7.5",
              "#ec4899"
            )}
          </div>
        </div>
        
        ${data.result}
        
        <!-- Model Answer Section -->
        <div id="modelAnswerSection" style="margin-top: 25px;">
          <button onclick="showModelAnswer()" id="modelAnswerBtn" style="width: 100%; padding: 18px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s;">
            <i class="bi bi-book-fill"></i> Show Model Answer (Band 8-9)
          </button>
          
          <div id="modelAnswerContent" style="display: none; margin-top: 20px; padding: 25px; background: #f9fafb; border-radius: 12px; border-left: 4px solid #10b981;">
            <!-- Model answer will be loaded here -->
          </div>
        </div>
      `;

      // ✅ ANIMATE PROGRESS BARS
      animateScoreBars();

      // Smooth scroll to results
      resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });

      // Track usage
      if (typeof trackToolUsage === "function") {
        trackToolUsage("grammar");
      }
    } else {
      throw new Error(data.error || "Analysis failed");
    }
  } catch (error) {
    console.error("❌ Writing check error:", error);

    // ⚠️ ERROR - REFUND COINS
    console.warn("⚠️ Writing check failed, refunding coins");
    if (window.coinManager) {
      window.coinManager.addCoins(3, "Refund: " + error.message);
      updateCoinDisplay();
    }

    output.innerHTML = `
      <div style="text-align: center; padding: 40px; background: #fee; border-radius: 12px;">
        <i class="bi bi-exclamation-triangle" style="font-size: 48px; color: #dc2626;"></i>
        <h5 style="color: #dc2626; margin-top: 15px;">Analysis Failed</h5>
        <p style="color: #6b7280;">${error.message}</p>
        <button onclick="checkWriting()" style="margin-top: 15px; padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          <i class="bi bi-arrow-clockwise"></i> Try Again
        </button>
      </div>
    `;
  }
}

// ============================================
// 6️⃣ SEND REQUEST HELPER
// ============================================
// ============================================
// 6️⃣ SEND REQUEST HELPER - FIXED ✅
// ============================================
async function sendWritingRequest(
  requestData,
  API_URL,
  output,
  resultBox,
  wordCount
) {
  const response = await fetch(`${API_URL}/check-writing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestData),
  });

  const data = await response.json();

  if (data.success) {
    console.log("✅ Writing analysis received");

    // ✅ EXTRACT SCORES from AI response
    const scores = extractScoresFromResponse(data.result);

    // Display results with VISUAL DASHBOARD
    output.innerHTML = `
      <!-- 🎨 VISUAL SCORE DASHBOARD -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);">
        <!-- Header with Export Button -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px;">
          <div style="flex: 1;">
            <div style="font-size: 14px; opacity: 0.9; color: rgba(255,255,255,0.8); margin-bottom: 8px;">
              <i class="bi bi-file-text"></i> ${requestData.taskType} | 
              <i class="bi bi-pencil-square"></i> ${wordCount} words
              ${
                requestData.topicImage
                  ? ' | <i class="bi bi-card-image"></i> Topic (Image)'
                  : ""
              }
              ${
                requestData.chartImage
                  ? ' | <i class="bi bi-image"></i> Chart (Image)'
                  : ""
              }
            </div>
            <div style="font-size: 28px; font-weight: 900; color: white;">
              📊 Your IELTS Scores
            </div>
          </div>
          
          <button onclick="exportWritingToPDF()" style="padding: 12px 24px; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); color: white; border: 2px solid rgba(255,255,255,0.3); border-radius: 10px; cursor: pointer; font-weight: 700; transition: all 0.3s; display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
            <i class="bi bi-download"></i> Export PDF
          </button>
        </div>
        
        <!-- Overall Score - BIG Display -->
        <div style="text-align: center; margin-bottom: 30px; padding: 25px; background: rgba(255,255,255,0.1); border-radius: 12px; backdrop-filter: blur(10px);">
          <div style="font-size: 72px; font-weight: 900; color: white; line-height: 1; margin-bottom: 5px;">
            ${scores.overall || "7.5"}
          </div>
          <div style="color: rgba(255,255,255,0.9); font-size: 18px; font-weight: 600; letter-spacing: 1px;">
            OVERALL BAND SCORE
          </div>
        </div>
        
        <!-- Individual Scores Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
          ${createScoreCard("Task Achievement", scores.task || "7", "#10b981")}
          ${createScoreCard(
            "Coherence & Cohesion",
            scores.coherence || "8",
            "#3b82f6"
          )}
          ${createScoreCard(
            "Lexical Resource",
            scores.lexical || "7.5",
            "#f59e0b"
          )}
          ${createScoreCard(
            "Grammar & Accuracy",
            scores.grammar || "7.5",
            "#ec4899"
          )}
        </div>
      </div>
      
      ${data.result}
      
      <!-- Model Answer Section -->
      <div id="modelAnswerSection" style="margin-top: 25px;">
        <button onclick="showModelAnswer()" id="modelAnswerBtn" style="width: 100%; padding: 18px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s;">
          <i class="bi bi-book-fill"></i> Show Model Answer (Band 8-9)
        </button>
        
        <div id="modelAnswerContent" style="display: none; margin-top: 20px; padding: 25px; background: #f9fafb; border-radius: 12px; border-left: 4px solid #10b981;">
          <!-- Model answer will be loaded here -->
        </div>
      </div>
    `;

    // ✅ ANIMATE PROGRESS BARS (outside string!)
    animateScoreBars();

    // Smooth scroll to results
    resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Track usage
    if (typeof trackToolUsage === "function") {
      trackToolUsage("grammar");
    }
  } else {
    throw new Error(data.error || "Analysis failed");
  }
}

// Export Result to Word/PDF (Optional)
function exportResult() {
  const output = document.getElementById("grammarOutput");
  const text = output.innerText;

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `IELTS_Writing_Analysis_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);

  console.log("✅ Result exported");
}

// Save activity to localStorage (optional)
function saveActivity(tool, details, wordCount) {
  try {
    const activities = JSON.parse(
      localStorage.getItem("userActivities") || "[]"
    );
    activities.unshift({
      id: Date.now(),
      tool: tool,
      details: details,
      wordCount: wordCount,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 50 activities
    if (activities.length > 50) {
      activities.length = 50;
    }

    localStorage.setItem("userActivities", JSON.stringify(activities));
  } catch (error) {
    console.error("❌ Failed to save activity:", error);
  }
}

// ============================================
// SHOW MODEL ANSWER - TASK 1/2 FIXED ✅
// ============================================
async function showModelAnswer() {
  const btn = document.getElementById("modelAnswerBtn");
  const content = document.getElementById("modelAnswerContent");
  const topic =
    document.getElementById("essayTopic").value || "The given topic";

  if (content.style.display === "block") {
    // Hide model answer
    content.style.display = "none";
    btn.innerHTML =
      '<i class="bi bi-book-fill"></i> Show Model Answer (Band 8-9)';
    btn.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
    return;
  }

  // Show loading
  btn.disabled = true;
  btn.innerHTML =
    '<i class="bi bi-hourglass-split"></i> Loading Model Answer...';
  content.style.display = "block";
  content.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <div class="spinner-border text-success" role="status" style="width: 2rem; height: 2rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p style="margin-top: 15px; color: #6b7280;">Generating Band 8-9 model answer...</p>
    </div>
  `;

  try {
    console.log("📤 Requesting model answer...");
    console.log("📝 Task Type:", selectedTaskType);

    const API_URL = window.location.hostname.includes("onrender.com")
      ? "https://zioai-backend.onrender.com/api"
      : "http://localhost:3000/api";

    // ✅ Prepare request data
    const requestData = {
      topic: topic,
      taskType: selectedTaskType,
    };

    // ✅ Add TOPIC image if exists
    if (uploadedTopicImage) {
      console.log("📊 Adding topic image to model answer request...");
      const reader = new FileReader();
      const topicImageData = await new Promise((resolve, reject) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error("Topic image read failed"));
        reader.readAsDataURL(uploadedTopicImage);
      });
      requestData.topicImage = topicImageData;
    }

    // ✅ Add CHART image ONLY FOR TASK 1
    if (selectedTaskType === "Task 1" && uploadedWritingImage) {
      console.log(
        "📈 Adding chart/diagram image to model answer request (Task 1)..."
      );
      const reader = new FileReader();
      const chartImageData = await new Promise((resolve, reject) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error("Chart image read failed"));
        reader.readAsDataURL(uploadedWritingImage);
      });
      requestData.chartImage = chartImageData;
    } else if (selectedTaskType === "Task 2") {
      console.log("✅ Task 2 - No chart image needed");
    }

    console.log("📤 Sending request:", {
      taskType: requestData.taskType,
      hasTopic: !!requestData.topic,
      hasTopicImage: !!requestData.topicImage,
      hasChartImage: !!requestData.chartImage,
    });

    const response = await fetch(`${API_URL}/generate-model-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (data.success) {
      console.log("✅ Model answer received");

      // ✅ TASK-SPECIFIC INFO
      let taskInfo = "";
      if (selectedTaskType === "Task 1" && requestData.chartImage) {
        taskInfo = "📈 Chart/Diagram Description";
      } else if (selectedTaskType === "Task 1") {
        taskInfo = "📊 Data Description";
      } else {
        taskInfo = "✍️ Opinion/Discussion Essay";
      }

      content.innerHTML = `
        <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #e5e7eb;">
            <div>
              <h5 style="margin: 0; color: #1f2937; font-weight: 800;">
                <i class="bi bi-trophy-fill" style="color: #fbbf24;"></i> Model Answer
              </h5>
              <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">
                📊 Band 8-9 Level | ✍️ ${data.wordCount} words | ${taskInfo}
                ${requestData.topicImage ? " | 📋 Topic (Image)" : ""}
                ${requestData.chartImage ? " | 📈 Chart (Image)" : ""}
              </p>
            </div>
            
            <!-- ✅ COPY BUTTON -->
            <button onclick="copyModelAnswer()" style="padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #8b5cf6 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s; display: flex; align-items: center; gap: 8px;">
              <i class="bi bi-clipboard"></i> Copy
            </button>
          </div>
          
          <div id="modelAnswerText" style="font-family: 'Georgia', serif; line-height: 2; color: #1f2937; font-size: 16px; white-space: pre-wrap;">
${data.modelAnswer}
          </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <i class="bi bi-info-circle-fill"></i> <strong>Note:</strong> This is a Band 8-9 model answer${
              selectedTaskType === "Task 1" && requestData.chartImage
                ? " based on the chart/diagram"
                : selectedTaskType === "Task 2"
                ? " for the opinion/discussion essay"
                : ""
            }. Compare your structure, vocabulary, and grammar.
          </p>
        </div>
      `;

      btn.innerHTML = '<i class="bi bi-eye-slash-fill"></i> Hide Model Answer';
      btn.style.background =
        "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)";
    } else {
      throw new Error(data.error || "Failed to generate model answer");
    }
  } catch (error) {
    console.error("❌ Model answer error:", error);
    content.innerHTML = `
      <div style="text-align: center; padding: 20px; background: #fee; border-radius: 12px;">
        <i class="bi bi-exclamation-triangle" style="font-size: 36px; color: #dc2626;"></i>
        <p style="color: #6b7280; margin-top: 10px;">${error.message}</p>
        <button onclick="showModelAnswer()" style="margin-top: 10px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">
          Try Again
        </button>
      </div>
    `;
  } finally {
    btn.disabled = false;
  }
}

// ============================================
// COPY MODEL ANSWER FUNCTION ✅
// ============================================
function copyModelAnswer() {
  const modelAnswerText = document.getElementById("modelAnswerText");

  if (!modelAnswerText) {
    alert("❌ Model answer topilmadi!");
    return;
  }

  // Get clean text content
  const textToCopy = modelAnswerText.innerText;

  // Copy to clipboard
  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      // Show success feedback
      const copyBtn = document.querySelector(
        'button[onclick="copyModelAnswer()"]'
      );
      if (copyBtn) {
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Copied!';
        copyBtn.style.background =
          "linear-gradient(135deg, #10b981 0%, #059669 100%)";

        setTimeout(() => {
          copyBtn.innerHTML = originalHTML;
          copyBtn.style.background =
            "linear-gradient(135deg, #667eea 0%, #8b5cf6 100%)";
        }, 2000);
      }

      console.log("✅ Model answer copied to clipboard");
    })
    .catch((err) => {
      console.error("❌ Copy failed:", err);
      alert("❌ Copy qilishda xatolik:\n" + err.message);
    });
}

// ============================================
// WRITING IMAGE UPLOAD - ALL FUNCTIONS ✅
// ADD THESE BEFORE exportWritingToPDF() FUNCTION
// ============================================

// ============================================
// 3️⃣ HANDLE FILE INPUT CHANGE ✅
// ============================================
function handleWritingImageUpload(event) {
  event.stopPropagation();
  event.preventDefault();

  console.log("📁 handleWritingImageUpload called");
  console.log("Files:", event.target.files);

  const file = event.target.files[0];
  
  if (!file) {
    console.warn("⚠️ No file selected");
    return;
  }

  console.log("✅ File selected:", file.name, file.size, "bytes");
  processWritingImage(file);
  event.target.value = "";
}


// ============================================
// 4️⃣ PROCESS WRITING IMAGE ✅
// ============================================
function processWritingImage(file) {
  console.log("🔍 Processing writing image:", file.name, file.size, "bytes");

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    alert("❌ File too large! Maximum size is 5MB.");
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("⚠️ Please upload an image file (PNG, JPG, JPEG)");
    return;
  }

  uploadedWritingImage = file;
  console.log("✅ Writing image stored:", uploadedWritingImage.name);

  const reader = new FileReader();
  reader.onload = (e) => {
    const previewImg = document.getElementById("writingPreviewImg");
    const imageFileName = document.getElementById("writingImageFileName");
    const uploadArea = document.getElementById("writingImageUploadArea");
    const imagePreview = document.getElementById("writingImagePreview");

    if (previewImg && imageFileName && uploadArea && imagePreview) {
      previewImg.src = e.target.result;
      imageFileName.textContent = file.name;
      uploadArea.style.display = "none";
      imagePreview.style.display = "block";
      console.log("✅ Writing preview displayed");
    }
  };
  reader.readAsDataURL(file);
}

// ============================================
// 5️⃣ REMOVE WRITING IMAGE ✅
// ============================================
function removeWritingImage() {
  console.log("🗑️ Removing writing image...");

  uploadedWritingImage = null;

  const previewImg = document.getElementById("writingPreviewImg");
  const imageFileName = document.getElementById("writingImageFileName");
  const fileInput = document.getElementById("writingImageInput");
  const uploadArea = document.getElementById("writingImageUploadArea");
  const imagePreview = document.getElementById("writingImagePreview");

  if (previewImg) previewImg.src = "";
  if (imageFileName) imageFileName.textContent = "";
  if (fileInput) fileInput.value = "";
  if (uploadArea) uploadArea.style.display = "block";
  if (imagePreview) imagePreview.style.display = "none";

  console.log("✅ Writing image removed successfully");
}

// ============================================
// WRITING CHECKER PASTE HANDLER - FIXED
// ============================================

// Remove old listener
// if (window.writingPasteHandlerAdded) {
//   document.removeEventListener("paste", handleWritingPasteEvent);
//   window.writingPasteHandlerAdded = false;
// }

// function handleWritingPasteEvent(e) {
//   const grammarContent = document.getElementById("grammar-content");
//   if (!grammarContent || grammarContent.style.display === "none") {
//     return;
//   }

//   if (selectedTaskType !== "Task 1") {
//     return;
//   }

//   const items = e.clipboardData.items;
//   let hasImage = false;
  
//   for (let item of items) {
//     if (item.type.indexOf("image") !== -1) {
//       hasImage = true;
//       break;
//     }
//   }

//   if (!hasImage) return;

//   e.preventDefault();
//   e.stopPropagation();
  
//   console.log("📋 Writing paste blocked, checking subscription...");

//   (async () => {
//     const subscription = await checkUserSubscription();
    
//     if (subscription.type === "free") {
//       console.log("🔒 Free user - paste BLOCKED");
//       showImageUploadLockedModal();
//       return;
//     }

//     console.log("✅ Paid user - processing pasted image");

//     for (let item of items) {
//       if (item.type.indexOf("image") !== -1) {
//         const file = item.getAsFile();
//         if (file) {
//           processWritingImage(file);

//           const uploadArea = document.getElementById("writingImageUploadArea");
//           if (uploadArea && uploadArea.style.display !== "none") {
//             uploadArea.style.borderColor = "#10b981";
//             uploadArea.style.background = "#d1fae5";

//             setTimeout(() => {
//               uploadArea.style.borderColor = "#d1d5db";
//               uploadArea.style.background = "#f9fafb";
//             }, 1000);
//           }
//         }
//         break;
//       }
//     }
//   })();
// }

// document.addEventListener("paste", handleWritingPasteEvent);
// window.writingPasteHandlerAdded = true;

// console.log("✅ Writing Paste Handler (SYNC BLOCK) loaded!");

// ============================================
// 7️⃣ INITIALIZE ON TOOL SWITCH ✅
// ============================================
window.addEventListener("load", () => {
  console.log("🔧 Page loaded - will initialize writing upload on tool switch");
});

console.log("✅ Writing Checker Image Upload System loaded!");


// ============================================
// TOPIC IMAGE UPLOAD - YANGI FUNKSIYALAR ✅
// ============================================

// ============================================
// 2️⃣ HANDLE FILE INPUT CHANGE
// ============================================
function handleTopicImageUpload(event) {
  const file = event.target.files[0];
  console.log("📁 File selected:", file?.name);

  if (file) {
    processTopicImage(file);
  }
}

// ============================================
// 3️⃣ PROCESS IMAGE FILE
// ============================================
function processTopicImage(file) {
  console.log("🔍 Processing topic image:", file.name, file.size, "bytes");

  // ✅ Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    alert("❌ File too large! Maximum size is 5MB.");
    return;
  }

  // ✅ Validate file type
  if (!file.type.startsWith("image/")) {
    alert("⚠️ Please upload an image file (PNG, JPG, JPEG)");
    return;
  }

  // ✅ Store file globally
  uploadedTopicImage = file;
  console.log("✅ Topic image stored:", uploadedTopicImage.name);

  // ✅ Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    const previewImg = document.getElementById("topicPreviewImg");
    const imageFileName = document.getElementById("topicImageFileName");
    const uploadArea = document.getElementById("topicImageUploadArea");
    const imagePreview = document.getElementById("topicImagePreview");

    if (previewImg && imageFileName && uploadArea && imagePreview) {
      previewImg.src = e.target.result;
      imageFileName.textContent = file.name;
      uploadArea.style.display = "none";
      imagePreview.style.display = "block";

      console.log("✅ Topic preview displayed");
    }
  };
  reader.readAsDataURL(file);
}

// ============================================
// 4️⃣ REMOVE UPLOADED TOPIC IMAGE
// ============================================
function removeTopicImage() {
  console.log("🗑️ Removing topic image...");

  uploadedTopicImage = null;

  const previewImg = document.getElementById("topicPreviewImg");
  const imageFileName = document.getElementById("topicImageFileName");
  const fileInput = document.getElementById("topicImageInput");
  const uploadArea = document.getElementById("topicImageUploadArea");
  const imagePreview = document.getElementById("topicImagePreview");

  if (previewImg) previewImg.src = "";
  if (imageFileName) imageFileName.textContent = "";
  if (fileInput) fileInput.value = "";
  if (uploadArea) uploadArea.style.display = "block";
  if (imagePreview) imagePreview.style.display = "none";

  console.log("✅ Topic image removed successfully");
}

// ============================================
// EXPORT TO PDF - CLEAN & STRUCTURED VERSION ✅
// ============================================
// ============================================
// EXPORT TO PDF - UNICODE VA PARSE FIX ✅
// dashboard.js ga qo'shing yoki almashtiring
// ============================================

// ============================================
// EXPORT TO PDF - FIXED VERSION ✅
// dashboard.js ga qo'ying yoki almashtiring
// ============================================

async function exportWritingToPDF() {
  const topic =
    document.getElementById("essayTopic").value || "IELTS Writing Task";
  const wordCount = document
    .getElementById("grammarInput")
    .value.trim()
    .split(/\s+/)
    .filter((w) => w).length;
  const yourText = document.getElementById("grammarInput").value;

  const resultElement = document.getElementById("grammarOutput");
  const modelAnswerElement = document.getElementById("modelAnswerText");

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let yPos = 20;

    // ============================================
    // TRANSLATIONS
    // ============================================
    const translations = {
      uz: {
        header: "IELTS Writing Tahlil Hisoboti",
        date: "Sana",
        task: "Topshiriq",
        words: "So'zlar",
        topic: "Mavzu",
        chart: "Grafik/Jadval",
        scores: "SIZNING BALLARINGIZ",
        overall: "UMUMIY BAND BALI",
        taskAch: "Topshiriqni Bajarish",
        coherence: "Izchillik va Bog'liqlik",
        lexical: "Lug'at Resursi",
        grammar: "Grammatika va Aniqlik",
        detailedAnalysis: "BATAFSIL TAHLIL",
        vocabAnalysis: "LUG'AT TAHLILI",
        level: "Daraja",
        strongWords: "Kuchli So'zlar",
        repetitive: "Takrorlanuvchi",
        synonyms: "Sinonimlar Kerak",
        collocations: "Ilg'or Kollokatsiyalar",
        grammarSection: "GRAMMATIKA XATOLARI",
        totalErrors: "Jami Xatolar",
        errorTypes: "Xato Turlari",
        grammarPatterns: "GRAMMATIK NAQSHLAR",
        recommended: "Tavsiya etilgan tuzilmalar",
        commonErrors: "Umumiy xatolar",
        bandReasons: "NEGA BU BAND?",
        nextBand: "KEYINGI BANDGA YETISH",
        fix: "Tuzatish",
        add: "Qo'shish",
        improve: "Yaxshilash",
        modelAnswer: "MODEL JAVOB",
        yourOriginal: "SIZNING ASL MATN",
        generated: "ZiyoAI tomonidan yaratilgan",
        page: "Sahifa",
      },
      ru: {
        header: "Otchet Analiza IELTS Writing",
        date: "Data",
        task: "Zadanie",
        words: "Slov",
        topic: "Tema",
        chart: "Grafik/Tablica",
        scores: "VASHI BALLY",
        overall: "OBSHCHIY BALL",
        taskAch: "Vypolnenie Zadaniya",
        coherence: "Svyaznost'",
        lexical: "Leksika",
        grammar: "Grammatika",
        detailedAnalysis: "DETAL'NYY ANALIZ",
        vocabAnalysis: "ANALIZ LEKSIKI",
        level: "Uroven'",
        strongWords: "Sil'nye Slova",
        repetitive: "Povtoryayushchiesya",
        synonyms: "Rekomenduemye Sinonimy",
        collocations: "Kollokatsii",
        grammarSection: "GRAMMATICHESKIE OSHIBKI",
        totalErrors: "Vsego Oshibok",
        errorTypes: "Tipy Oshibok",
        grammarPatterns: "GRAMMATICHESKIE PATTERNY",
        recommended: "Rekomenduemye struktury",
        commonErrors: "Obshchie oshibki",
        bandReasons: "POCHEMU ETOT BAND?",
        nextBand: "DLYA SLEDUYUSHCHEGO BAND",
        fix: "Ispravit'",
        add: "Dobavit'",
        improve: "Uluchshit'",
        modelAnswer: "MODEL'NYY OTVET",
        yourOriginal: "VASH TEKST",
        generated: "Sozdano ZiyoAI",
        page: "Stranitsa",
      },
      en: {
        header: "IELTS Writing Analysis Report",
        date: "Date",
        task: "Task",
        words: "Words",
        topic: "Topic",
        chart: "Chart/Diagram",
        scores: "YOUR SCORES",
        overall: "OVERALL BAND SCORE",
        taskAch: "Task Achievement",
        coherence: "Coherence & Cohesion",
        lexical: "Lexical Resource",
        grammar: "Grammar & Accuracy",
        detailedAnalysis: "DETAILED ANALYSIS",
        vocabAnalysis: "VOCABULARY ANALYSIS",
        level: "Level",
        strongWords: "Strong Words",
        repetitive: "Repetitive Words",
        synonyms: "Suggested Synonyms",
        collocations: "Advanced Collocations",
        grammarSection: "GRAMMAR MISTAKES",
        totalErrors: "Total Errors",
        errorTypes: "Error Types",
        grammarPatterns: "GRAMMAR PATTERNS",
        recommended: "Recommended structures",
        commonErrors: "Common errors",
        bandReasons: "WHY THIS BAND?",
        nextBand: "TO REACH NEXT BAND",
        fix: "Fix",
        add: "Add",
        improve: "Improve",
        modelAnswer: "MODEL ANSWER",
        yourOriginal: "YOUR ORIGINAL TEXT",
        generated: "Generated by ZiyoAI",
        page: "Page",
      },
    };

    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    const cleanText = (text) => {
      if (!text) return "";
      return (
        text
          .replace(/<[^>]*>/g, "") // Remove HTML tags
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#\d+;/g, "")
          // ✅ FIX: Preserve spaces between words
          .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space between camelCase
          .replace(/([a-zA-Z])(\d)/g, "$1 $2") // Space between letter and number
          .replace(/(\d)([a-zA-Z])/g, "$1 $2") // Space between number and letter
          // ✅ Keep only single newlines
          .replace(/\n{3,}/g, "\n\n")
          // ✅ Remove control chars EXCEPT newlines
          .replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/g, "")
          .replace(/[\u{1F000}-\u{1F9FF}]/gu, "")
          .replace(/[\u{2600}-\u{26FF}]/gu, "")
          .replace(/[\u{2700}-\u{27BF}]/gu, "")
          .trim()
      );
    };

    const checkPageBreak = (requiredSpace = 25) => {
      if (yPos > pageHeight - requiredSpace) {
        doc.addPage();
        yPos = 20;
        return true;
      }
      return false;
    };

    const addText = (text, fontSize = 10, isBold = false) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line) => {
        checkPageBreak();
        doc.text(line, margin, yPos);
        yPos += fontSize * 0.5;
      });
    };

    const addSection = (title, bgColor, textColor) => {
      checkPageBreak(40);
      doc.setFillColor(...bgColor);
      doc.roundedRect(margin, yPos - 2, maxWidth, 12, 3, 3, "F");
      doc.setTextColor(...textColor);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(title, margin + 5, yPos + 6);
      yPos += 17;
      doc.setTextColor(0, 0, 0);
    };

    const addSubSection = (title) => {
      checkPageBreak(30);
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(margin, yPos, maxWidth, 8, 2, 2, "F");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(55, 65, 81);
      doc.text(title, margin + 3, yPos + 5.5);
      yPos += 12;
      doc.setTextColor(0, 0, 0);
    };

    const addBulletPoint = (text, fontSize = 9) => {
      checkPageBreak();
      doc.setFontSize(fontSize);
      doc.text("•", margin + 3, yPos);
      const lines = doc.splitTextToSize(text, maxWidth - 8);
      lines.forEach((line) => {
        checkPageBreak();
        doc.text(line, margin + 8, yPos);
        yPos += fontSize * 0.45;
      });
      yPos += 2;
    };

    // ============================================
    // GET TEXT & DETECT LANGUAGE
    // ============================================
    let fullText = "";
    if (resultElement) {
      fullText = resultElement.innerText || resultElement.textContent || "";
      fullText = cleanText(fullText);
    }

    let detectedLanguage = "uz";
    if (
      fullText.includes("POCHEMU ETOT BAND") ||
      fullText.includes("Uroven'")
    ) {
      detectedLanguage = "ru";
    } else if (
      fullText.includes("WHY THIS BAND") ||
      fullText.includes("Level: C")
    ) {
      detectedLanguage = "en";
    }

    const t = translations[detectedLanguage];
    console.log("🌐 Language:", detectedLanguage);
    console.log("📝 Text length:", fullText.length);

    // ============================================
    // ✅ TASK TURINI ANIQLASH
    // ============================================
    const actualTaskType = selectedTaskType || "Task 2"; // Global variable dan olish
    console.log("📋 Task Type:", actualTaskType);

    // ============================================
    // PARSE ANALYSIS - SECTION 3, 4 REMOVED ✅
    // ============================================
    const parseAnalysis = (text) => {
      const parsed = {
        vocabulary: {
          level: null,
          strong: [],
          repetitive: [],
          synonyms: [],
          collocations: [],
        },
        grammar: {
          total: null,
          types: [],
          errors: [], // ✅ This will store individual errors properly
        },
        patterns: {
          recommended: [],
          commonErrors: [],
        },
        bandReasons: [],
        nextBand: {
          fix: [],
          add: [],
          improve: [],
        },
      };

      if (!text) return parsed;

      try {
        // ============================================
        // 1. VOCABULARY (existing code - keep as is)
        // ============================================
        const vocabSection = text.match(
          /(?:LUG'AT SIFATI|VOCABULARY QUALITY|KACHESTVO LEKSIKI)[:\s]*([\s\S]*?)(?:GRAMMATIKA|GRAMMAR|$)/i
        );

        if (vocabSection) {
          const vocabText = vocabSection[1];

          const levelMatch = vocabText.match(
            /(?:Daraja|Level|Uroven')[:\s]*([A-C][1-2])/i
          );
          if (levelMatch) parsed.vocabulary.level = levelMatch[1];

          const strongMatch = vocabText.match(
            /(?:Kuchli So'zlar|Strong Words|Sil'nye Slova)[:\s]*([^\n]+)/i
          );
          if (strongMatch) {
            const wordsText = strongMatch[1].replace(/["']/g, "").trim();
            parsed.vocabulary.strong = wordsText
              .split(/[,;]/)
              .map((w) => w.trim())
              .filter((w) => w.length > 2);
          }

          const repMatch = vocabText.match(
            /(?:Takrorlanuvchi|Repetitive|Povtoryayushchiesya)[:\s]*([^\n]+)/i
          );
          if (repMatch) {
            const wordsText = repMatch[1].replace(/["']/g, "").trim();
            parsed.vocabulary.repetitive = wordsText
              .split(/[,;]/)
              .map((w) => w.trim())
              .filter((w) => w.length > 2);
          }

          const synMatch = vocabText.match(
            /(?:Sinonimlar Kerak|Suggested Synonyms|Sinonimy)[:\s]*([^\n]+)/i
          );
          if (synMatch) parsed.vocabulary.synonyms.push(synMatch[1].trim());

          const collMatch = vocabText.match(
            /(?:Ilg'or Kollokatsiyalar|Advanced Collocations|Kollokatsii)[:\s]*([^\n]+)/i
          );
          if (collMatch) {
            const collText = collMatch[1].replace(/["']/g, "").trim();
            parsed.vocabulary.collocations = collText
              .split(/[,;]/)
              .map((c) => c.trim())
              .filter((c) => c.length > 3);
          }
        }

        // ============================================
        // 2. GRAMMAR ERRORS - COMPLETELY REWRITTEN ✅
        // ============================================
        const grammarSection = text.match(
          /(?:GRAMMATIKA TAHLILI|GRAMMAR ANALYSIS|ANALIZ GRAMMATIKI)[:\s]*([\s\S]*?)(?:GRAMMATIK NAQSHLAR|GRAMMAR PATTERNS|$)/i
        );

        if (grammarSection) {
          const grammarText = grammarSection[1];
          console.log(
            "📋 Grammar section found:",
            grammarText.substring(0, 200)
          );

          // Total errors count
          const totalMatch = grammarText.match(
            /(?:Jami Xatolar|Total Errors|Vsego Oshibok)[:\s]*(\d+)/i
          );
          if (totalMatch) {
            parsed.grammar.total = totalMatch[1];
            console.log("✅ Total errors:", parsed.grammar.total);
          }

          // ✅ METHOD 1: Extract by numbered bullets (#1:, #2:, etc.)
          const numberedErrors = grammarText.match(/#\d+[:\s]*([^\n#]+)/gi);

          if (numberedErrors && numberedErrors.length > 0) {
            console.log("✅ Found", numberedErrors.length, "numbered errors");

            parsed.grammar.errors = numberedErrors
              .map((error) => {
                // Remove the number prefix
                let cleaned = error.replace(/#\d+[:\s]*/, "").trim();

                // ✅ FIX: Ensure proper spacing
                cleaned = cleaned
                  .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase → camel Case
                  .replace(/([a-zA-Z])(\()/g, "$1 (") // word( → word (
                  .replace(/(\))([a-zA-Z])/g, "$1 $2") // )word → ) word
                  .replace(/([,.;:])([a-zA-Z])/g, "$1 $2") // punctuation + letter
                  .replace(/\s+/g, " ") // Multiple spaces → single space
                  .trim();

                return cleaned;
              })
              .filter((e) => e.length > 10); // Ignore very short entries

            console.log("✅ Parsed errors:", parsed.grammar.errors);
          }
          // ✅ METHOD 2: Fallback - split by bullet points
          else {
            console.log("⚠️ No numbered format, trying bullet points...");

            const bulletErrors = grammarText.match(/[•\-\*]\s*([^\n•\-\*]+)/g);

            if (bulletErrors && bulletErrors.length > 0) {
              parsed.grammar.errors = bulletErrors
                .map((bullet) => {
                  let cleaned = bullet.replace(/^[•\-\*]\s*/, "").trim();

                  // Apply same spacing fixes
                  cleaned = cleaned
                    .replace(/([a-z])([A-Z])/g, "$1 $2")
                    .replace(/([a-zA-Z])(\()/g, "$1 (")
                    .replace(/(\))([a-zA-Z])/g, "$1 $2")
                    .replace(/([,.;:])([a-zA-Z])/g, "$1 $2")
                    .replace(/\s+/g, " ")
                    .trim();

                  return cleaned;
                })
                .filter((e) => e.length > 10);

              console.log(
                "✅ Parsed from bullets:",
                parsed.grammar.errors.length
              );
            }
          }
        }

        // ============================================
        // 3. GRAMMAR PATTERNS (keep existing code)
        // ============================================
        const patSection = text.match(
          /(?:GRAMMATIK NAQSHLAR|GRAMMAR PATTERNS|GRAMMATICHESKIE PATTERNY)[:\s]*([\s\S]*?)(?:NEGA BU BAND|WHY THIS BAND|POCHEMU|$)/i
        );

        if (patSection) {
          const patText = patSection[1];

          const recMatch = patText.match(
            /(?:Tavsiya etilgan|Recommended|Rekomenduemye)[:\s]*([^\n]+)/i
          );
          if (recMatch) {
            parsed.patterns.recommended = recMatch[1]
              .split(/[,;]/)
              .map((r) => r.trim())
              .filter((r) => r.length > 5);
          }

          const errMatch = patText.match(
            /(?:Umumiy xatolar|Common errors|Obshchie oshibki)[:\s]*([^\n]+)/i
          );
          if (errMatch) {
            parsed.patterns.commonErrors = errMatch[1]
              .split(/[,;]/)
              .map((e) => e.trim())
              .filter((e) => e.length > 5);
          }
        }

        // ============================================
        // 4. BAND REASONS - FIXED TO CAPTURE ALL CONTENT ✅
        // ============================================
        const reasonSection = text.match(
          /(?:NEGA BU BAND|WHY THIS BAND|POCHEMU ETOT BAND)[:\s?]*([\s\S]*?)(?:KEYINGI BANDGA|TO REACH|DLYA SLEDUYUSHCHEGO|MODEL|$)/i
        );

        if (reasonSection) {
          const reasonText = reasonSection[1].trim();
          console.log(
            "📋 Band Reasons section found, length:",
            reasonText.length
          );

          // ✅ METHOD 1: Try bullet points first
          const bullets = reasonText.match(/[•▸►\-\*]\s*([^\n•▸►\-\*]+)/g);

          if (bullets && bullets.length > 0) {
            parsed.bandReasons = bullets
              .map((b) => b.replace(/^[•▸►\-\*]\s*/, "").trim())
              .filter((item) => item.length > 10) // Lower threshold
              .slice(0, 8); // Increase limit to 8

            console.log(
              "✅ Extracted",
              parsed.bandReasons.length,
              "reasons from bullets"
            );
          }
          // ✅ METHOD 2: If no bullets, extract by numbered items or lines
          else {
            // Try numbered format (1., 2., etc.)
            const numberedItems = reasonText.match(/\d+\.\s*([^\n]+)/g);

            if (numberedItems && numberedItems.length > 0) {
              parsed.bandReasons = numberedItems
                .map((item) => item.replace(/^\d+\.\s*/, "").trim())
                .filter((item) => item.length > 10)
                .slice(0, 8);

              console.log(
                "✅ Extracted",
                parsed.bandReasons.length,
                "reasons from numbered list"
              );
            }
            // ✅ METHOD 3: Split by double newlines (paragraphs)
            else {
              const paragraphs = reasonText
                .split(/\n\n+/)
                .map((p) => p.replace(/\n/g, " ").trim())
                .filter(
                  (p) =>
                    p.length > 20 &&
                    !p.match(/^(NEGA|WHY|KEYINGI|TO REACH|MODEL)/i)
                )
                .slice(0, 8);

              if (paragraphs.length > 0) {
                parsed.bandReasons = paragraphs;
                console.log(
                  "✅ Extracted",
                  paragraphs.length,
                  "reasons from paragraphs"
                );
              }
            }
          }
        } else {
          console.warn("⚠️ Band Reasons section not found in text");
        }

        // ============================================
        // 5. NEXT BAND (keep existing code)
        // ============================================
        const nextSection = text.match(
          /(?:KEYINGI BANDGA YETISH|TO REACH THE NEXT BAND|DLYA SLEDUYUSHCHEGO BAND)[:\s]*([\s\S]*?)(?:YAKUNIY|$)/i
        );

        if (nextSection) {
          const nextText = nextSection[1];

          const fixMatch = nextText.match(
            /(?:Tuzatish|Fix|Ispravit')[:\s]*([^\n]+)/i
          );
          if (fixMatch) parsed.nextBand.fix.push(fixMatch[1].trim());

          const addMatch = nextText.match(
            /(?:Qo'shish|Add|Dobavit')[:\s]*([^\n]+)/i
          );
          if (addMatch) parsed.nextBand.add.push(addMatch[1].trim());

          const impMatch = nextText.match(
            /(?:Yaxshilash|Improve|Uluchshit')[:\s]*([^\n]+)/i
          );
          if (impMatch) parsed.nextBand.improve.push(impMatch[1].trim());
        }
      } catch (error) {
        console.error("❌ Parse error:", error);
      }

      return parsed;
    };

    // ============================================
    // EXTRACT SCORES
    // ============================================
    const extractScores = (text) => {
      const scores = {
        overall: null,
        task: null,
        coherence: null,
        lexical: null,
        grammar: null,
      };

      const overallMatch = text.match(
        /(?:OVERALL|UMUMIY|OBSHCHIY).*?(\d+(?:\.\d+)?)\s*\/\s*9/is
      );
      if (overallMatch) scores.overall = overallMatch[1];

      const taskMatch = text.match(
        /(?:Task Achievement|Topshiriqni Bajarish|Vypolnenie Zadaniya).*?(\d+(?:\.\d+)?)\s*\/\s*9/is
      );
      if (taskMatch) scores.task = taskMatch[1];

      const cohMatch = text.match(
        /(?:Coherence|Izchillik|Svyaznost').*?(\d+(?:\.\d+)?)\s*\/\s*9/is
      );
      if (cohMatch) scores.coherence = cohMatch[1];

      const lexMatch = text.match(
        /(?:Lexical|Lug'at|Leksika).*?(\d+(?:\.\d+)?)\s*\/\s*9/is
      );
      if (lexMatch) scores.lexical = lexMatch[1];

      const gramMatch = text.match(
        /(?:Grammatical|Grammatika).*?(\d+(?:\.\d+)?)\s*\/\s*9/is
      );
      if (gramMatch) scores.grammar = gramMatch[1];

      return scores;
    };

    // ============================================
    // BUILD PDF
    // ============================================

    // Header
    doc.setFillColor(44, 170, 154);
    doc.rect(0, 0, pageWidth, 50, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("ZiyoAI", pageWidth / 2, 22, { align: "center" });
    doc.setFontSize(13);
    doc.text(t.header, pageWidth / 2, 34, { align: "center" });
    yPos = 60;

    // ============================================
    // ✅ INFO BOX - TASK TURINI TO'G'RI KO'RSATISH
    // ============================================
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, yPos, maxWidth, 47, 3, 3, "F");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    const infoY = yPos + 8;
    doc.text(
      `${t.date}: ${new Date().toLocaleDateString("en-GB")}`,
      margin + 5,
      infoY
    );
    doc.text(`${t.task}: ${actualTaskType}`, margin + 5, infoY + 7); // ✅ To'g'ri task
    doc.text(`${t.words}: ${wordCount}`, margin + 5, infoY + 14);
    const topicLines = doc.splitTextToSize(
      `${t.topic}: ${cleanText(topic)}`,
      maxWidth - 10
    );
    doc.text(topicLines, margin + 5, infoY + 21);
    yPos += 60;

    // ============================================
    // ✅ TASK 1 RASMI - ASPECT RATIO BILAN (cho'zilmasin)
    // ============================================
    if (actualTaskType === "Task 1" && uploadedWritingImage) {
      console.log("📷 Adding Task 1 chart to PDF...");

      try {
        const reader = new FileReader();
        const imageData = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => reject(new Error("Image read failed"));
          reader.readAsDataURL(uploadedWritingImage);
        });

        checkPageBreak(80);

        // ✅ ASPECT RATIO SAQLASH (cho'zilmasin)
        const img = new Image();
        img.src = imageData;

        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const imgRatio = img.width / img.height;
        const maxImgWidth = maxWidth;
        const maxImgHeight = 80;

        let finalWidth = maxImgWidth;
        let finalHeight = finalWidth / imgRatio;

        // Agar balandlik juda katta bo'lsa
        if (finalHeight > maxImgHeight) {
          finalHeight = maxImgHeight;
          finalWidth = finalHeight * imgRatio;
        }

        // Markazga joylashtirish
        const xOffset = margin + (maxImgWidth - finalWidth) / 2;

        doc.addImage(imageData, "JPEG", xOffset, yPos, finalWidth, finalHeight);
        yPos += finalHeight + 10;

        console.log("✅ Chart image added (aspect ratio preserved)");
      } catch (error) {
        console.error("❌ Failed to add chart:", error);
      }
    }

    // Parse & Display
    if (fullText) {
      const analysis = parseAnalysis(fullText);
      const scores = extractScores(fullText);

      // SCORES
      if (scores.overall) {
        addSection(t.scores, [232, 248, 245], [44, 170, 154]);
        doc.setFillColor(232, 248, 245);
        doc.roundedRect(margin, yPos, maxWidth, 15, 2, 2, "F");
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`${t.overall}:`, margin + 5, yPos + 10);
        doc.setFontSize(14);
        doc.setTextColor(44, 170, 154);
        doc.text(`${scores.overall}/9.0`, margin + maxWidth - 5, yPos + 10, {
          align: "right",
        });
        doc.setTextColor(0, 0, 0);
        yPos += 20;

        if (scores.task) {
          doc.setFontSize(10);
          doc.text(`${t.taskAch}: ${scores.task}/9`, margin + 5, yPos);
          yPos += 7;
        }
        if (scores.coherence) {
          doc.text(`${t.coherence}: ${scores.coherence}/9`, margin + 5, yPos);
          yPos += 7;
        }
        if (scores.lexical) {
          doc.text(`${t.lexical}: ${scores.lexical}/9`, margin + 5, yPos);
          yPos += 7;
        }
        if (scores.grammar) {
          doc.text(`${t.grammar}: ${scores.grammar}/9`, margin + 5, yPos);
          yPos += 10;
        }
      }

      // DETAILED ANALYSIS
      addSection(t.detailedAnalysis, [232, 248, 245], [44, 170, 154]);

      // 1. VOCABULARY
      if (analysis.vocabulary.level || analysis.vocabulary.strong.length > 0) {
        addSubSection(`1. ${t.vocabAnalysis}`);

        if (analysis.vocabulary.level) {
          addText(`${t.level}: ${analysis.vocabulary.level}`, 9, true);
          yPos += 2;
        }

        if (analysis.vocabulary.strong.length > 0) {
          addText(
            `${t.strongWords}: ${analysis.vocabulary.strong.join(", ")}`,
            9
          );
          yPos += 3;
        }

        if (analysis.vocabulary.repetitive.length > 0) {
          addText(
            `${t.repetitive}: ${analysis.vocabulary.repetitive.join(", ")}`,
            9
          );
          yPos += 3;
        }

        if (analysis.vocabulary.synonyms.length > 0) {
          addText(
            `${t.synonyms}: ${analysis.vocabulary.synonyms.join("; ")}`,
            9
          );
          yPos += 3;
        }

        if (analysis.vocabulary.collocations.length > 0) {
          addText(
            `${t.collocations}: ${analysis.vocabulary.collocations.join(", ")}`,
            9
          );
          yPos += 3;
        }

        yPos += 3;
      }

      // 2. GRAMMAR ERRORS - with proper formatting
      if (analysis.grammar.total) {
        addSubSection(`2. ${t.grammarSection}`);

        // Show total count
        addText(`${t.totalErrors}: ${analysis.grammar.total}`, 9, true);
        yPos += 5;

        // ✅ Display individual errors with proper spacing
        if (analysis.grammar.errors.length > 0) {
          analysis.grammar.errors.slice(0, 5).forEach((error, idx) => {
            // Clean and format each error
            const cleanError = error
              .replace(/\s+/g, " ") // Multiple spaces → single
              .trim();

            // Add numbered bullet point
            checkPageBreak(15);
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.text(`#${idx + 1}:`, margin + 3, yPos);

            // Add error text with word wrap
            doc.setFont("helvetica", "normal");
            const errorLines = doc.splitTextToSize(cleanError, maxWidth - 12);
            errorLines.forEach((line, lineIdx) => {
              if (lineIdx === 0) {
                doc.text(line, margin + 12, yPos);
              } else {
                yPos += 4.5;
                checkPageBreak();
                doc.text(line, margin + 12, yPos);
              }
            });

            yPos += 6; // Space after each error
          });
        } else {
          addText("Xatolar aniqlanmadi", 9);
        }

        yPos += 3;
      }

      console.log("✅ PDF Grammar Fix loaded!");

      // 3. GRAMMAR PATTERNS (eski 5-section)
      if (
        analysis.patterns.recommended.length > 0 ||
        analysis.patterns.commonErrors.length > 0
      ) {
        addSubSection(`3. ${t.grammarPatterns}`);

        if (analysis.patterns.recommended.length > 0) {
          addText(
            `${t.recommended}: ${analysis.patterns.recommended.join("; ")}`,
            9
          );
          yPos += 3;
        }

        if (analysis.patterns.commonErrors.length > 0) {
          addText(
            `${t.commonErrors}: ${analysis.patterns.commonErrors.join("; ")}`,
            9
          );
          yPos += 3;
        }

        yPos += 3;
      }

      // 4. BAND REASONS (eski 6-section) - IMPROVED DISPLAY ✅
      if (analysis.bandReasons.length > 0) {
        addSubSection(`4. ${t.bandReasons}`);

        // Display all reasons with proper formatting
        analysis.bandReasons.forEach((reason, idx) => {
          checkPageBreak(15);

          // Add numbered bullet
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.text(`${idx + 1}.`, margin + 3, yPos);

          // Add reason text with word wrap
          doc.setFont("helvetica", "normal");
          const reasonLines = doc.splitTextToSize(reason, maxWidth - 12);

          reasonLines.forEach((line, lineIdx) => {
            if (lineIdx === 0) {
              doc.text(line, margin + 12, yPos);
            } else {
              yPos += 4.5;
              checkPageBreak();
              doc.text(line, margin + 12, yPos);
            }
          });

          yPos += 7; // More space between reasons
        });

        yPos += 5;
        console.log(
          "✅ Displayed",
          analysis.bandReasons.length,
          "band reasons in PDF"
        );
      } else {
        // Fallback: agar bandReasons bo'sh bo'lsa, to'g'ridan-to'g'ri textdan qidirish
        const reasonAlt = fullText.match(
          /(?:NEGA BU BAND|WHY THIS BAND|POCHEMU ETOT BAND)[:\s?]*([\s\S]*?)(?:KEYINGI BANDGA|TO REACH|DLYA SLEDUYUSHCHEGO|MODEL|$)/i
        );

        if (reasonAlt) {
          addSubSection(`4. ${t.bandReasons}`);
          const reasonText = reasonAlt[1].trim();

          console.log(
            "⚠️ Using fallback - full reason text length:",
            reasonText.length
          );

          // Split into manageable chunks
          const chunks = [];
          let currentChunk = "";
          const lines = reasonText.split(/\n+/);

          lines.forEach((line) => {
            const trimmed = line.trim();
            if (trimmed.length > 0) {
              // Start new chunk if current is too long
              if (currentChunk.length > 200) {
                chunks.push(currentChunk);
                currentChunk = trimmed;
              } else {
                currentChunk += (currentChunk ? " " : "") + trimmed;
              }
            }
          });

          if (currentChunk) {
            chunks.push(currentChunk);
          }

          // Display chunks
          chunks.slice(0, 8).forEach((chunk, idx) => {
            if (chunk.length > 15) {
              checkPageBreak(15);

              doc.setFontSize(9);
              doc.setFont("helvetica", "bold");
              doc.text(`${idx + 1}.`, margin + 3, yPos);

              doc.setFont("helvetica", "normal");
              const lines = doc.splitTextToSize(chunk, maxWidth - 12);

              lines.forEach((line, lineIdx) => {
                if (lineIdx === 0) {
                  doc.text(line, margin + 12, yPos);
                } else {
                  yPos += 4.5;
                  checkPageBreak();
                  doc.text(line, margin + 12, yPos);
                }
              });

              yPos += 7;
            }
          });

          yPos += 5;
          console.log("✅ Displayed", chunks.length, "reasons from fallback");
        } else {
          console.warn("⚠️ No band reasons found in text");
        }
      }

      // 5. NEXT BAND (eski 7-section)
      if (
        analysis.nextBand.fix.length > 0 ||
        analysis.nextBand.add.length > 0 ||
        analysis.nextBand.improve.length > 0
      ) {
        addSubSection(`5. ${t.nextBand}`);

        if (analysis.nextBand.fix.length > 0) {
          addText(`${t.fix}:`, 9, true);
          yPos += 2;
          analysis.nextBand.fix.forEach((item) => addBulletPoint(item, 8));
          yPos += 2;
        }

        if (analysis.nextBand.add.length > 0) {
          addText(`${t.add}:`, 9, true);
          yPos += 2;
          analysis.nextBand.add.forEach((item) => addBulletPoint(item, 8));
          yPos += 2;
        }

        if (analysis.nextBand.improve.length > 0) {
          addText(`${t.improve}:`, 9, true);
          yPos += 2;
          analysis.nextBand.improve.forEach((item) => addBulletPoint(item, 8));
          yPos += 2;
        }

        yPos += 5;
      }
    }

    // MODEL ANSWER
    if (modelAnswerElement && modelAnswerElement.textContent) {
      addSection(t.modelAnswer, [254, 243, 199], [245, 158, 11]);
      const modelText = cleanText(
        modelAnswerElement.innerText || modelAnswerElement.textContent
      );
      const paragraphs = modelText
        .split(/\n+/)
        .filter((p) => p.trim().length > 10);
      paragraphs.forEach((para) => {
        addText(para.trim(), 9, false);
        yPos += 3;
      });
    }

    // YOUR ORIGINAL TEXT - Paragraflar bilan ✅
    if (yourText && yourText.trim()) {
      addSection(t.yourOriginal, [254, 243, 199], [245, 158, 11]);

      // ✅ cleanText ishlatmaslik - faqat HTML taglarni olib tashlash
      const cleanOriginal = yourText.trim().replace(/<[^>]*>/g, "");

      // ✅ Ikki yoki undan ortiq newline = paragraf ajratish
      const paragraphs = cleanOriginal.split(/\n\n+/);

      paragraphs.forEach((para) => {
        const trimmed = para.trim();
        if (trimmed.length > 10) {
          addText(trimmed, 9, false);
          yPos += 4; // Paragraflar orasida bo'sh joy
        }
      });
    }

    // FOOTER
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `${t.generated} - ${t.page} ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    }

    // SAVE
    const filename = `ZiyoAI_${actualTaskType.replace(
      " ",
      "_"
    )}_Report_${Date.now()}.pdf`;
    doc.save(filename);
    console.log("✅ PDF exported:", filename);

    // Success feedback
    const exportBtn = document.querySelector(
      'button[onclick="exportWritingToPDF()"]'
    );
    if (exportBtn) {
      const originalHTML = exportBtn.innerHTML;
      exportBtn.innerHTML =
        '<i class="bi bi-check-circle-fill"></i> Downloaded!';
      exportBtn.style.background = "#10b981";
      setTimeout(() => {
        exportBtn.innerHTML = originalHTML;
        exportBtn.style.background = "";
      }, 2500);
    }
  } catch (error) {
    console.error("❌ PDF export error:", error);
    alert("PDF export failed: " + error.message);
  }
}

console.log("✅ Fixed PDF Export with Task 1 Chart loaded!");

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
  // 🪙 COIN CHECK - MUST BLOCK EXECUTION
  console.log("💰 Checking coins for Vocabulary...");
  const canProceed = await checkAndSpendCoins("vocabulary");

  if (!canProceed) {
    console.error("❌ BLOCKED: Insufficient coins for Vocabulary");
    return; // ✅ STOP HERE
  }

  console.log("✅ Coins deducted for Vocabulary, proceeding...");

  // ✅ Prevent duplicate calls
  if (isVocabProcessing) {
    console.log("⚠️ Vocabulary already processing, skipping...");
    return;
  }

  const input = document.getElementById("vocabInput").value;
  const result = document.getElementById("vocabResult");
  const output = document.getElementById("vocabOutput");

  const languageDropdown = document.getElementById("vocab-language");
  const language = languageDropdown ? languageDropdown.value : "uz";

  if (!input.trim()) {
    // ⚠️ REFUND COINS
    if (window.coinManager) {
      window.coinManager.addCoins(1, "Refund: No word entered");
    }
    alert("Please enter a word!");
    return;
  }

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
              onclick="playPronunciation('${(data.word || input).replace(
                /'/g,
                "\\'"
              )}')" 
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
      trackToolUsage("vocabulary");
      incrementStat("totalStudyTime", 1);
      addRecentActivity("Vocabulary Builder", 92, "📖", "#3b82f6");

      // ✅ TRACKING - FAQAT SUCCESS HOLATIDA VA BIR MARTA
      console.log("📊 Vocabulary learned successfully, tracking...");

      console.log("✅ Vocabulary tracking completed!");
    } else {
      throw new Error("No response from AI");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    // ⚠️ REFUND COINS
    if (window.coinManager) {
      window.coinManager.addCoins(1, "Refund: Vocabulary error");
    }
    showError(output, error.message);
  } finally {
    // ✅ Reset processing flag after 1 second
    setTimeout(() => {
      isVocabProcessing = false;
      console.log("🔓 Vocabulary processing unlocked");
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
// 8️⃣ MOTIVATION SYSTEM - STRICT LOCKING ✅
// ============================================
let motivationInterval;
let isMotivationVisible = false;

async function showMotivation() {
  // Don't show if already visible
  if (isMotivationVisible) {
    console.log("⏳ Motivation already showing");
    return;
  }

  // ✅ SET STRICT LOCK
  console.log("🔒 LOCKING tool switching for motivation");
  window.preventToolSwitch = true;
  isMotivationVisible = true;

  try {
    const response = await fetch(`${API_URL}/motivation`);
    const data = await response.json();

    if (data.success) {
      const toast = document.getElementById("motivationToast");
      const text = document.querySelector(".motivation-text");

      if (!toast || !text) {
        console.error("❌ Motivation elements missing");
        window.preventToolSwitch = false;
        isMotivationVisible = false;
        return;
      }

      text.innerHTML = `
        ${data.quote}
        <span style="display: block; font-style: italic; font-size: 0.85em; margin-top: 8px; opacity: 0.8;">
          ${data.author}
        </span>
      `;

      toast.style.display = "flex";
      setTimeout(() => toast.classList.add("show"), 50);

      console.log("✨ Motivation displayed");

      // Auto-close after 7 seconds
      setTimeout(() => {
        closeMotivation();
      }, 7000);
    }
  } catch (error) {
    console.error("❌ Motivation fetch error:", error);
    window.preventToolSwitch = false;
    isMotivationVisible = false;
  }
}

function closeMotivation() {
  const toast = document.getElementById("motivationToast");

  if (toast) {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.style.display = "none";
      isMotivationVisible = false;

      // ✅ UNLOCK tool switching
      window.preventToolSwitch = false;
      console.log("🔓 Tool switching UNLOCKED after motivation");
    }, 800);
  } else {
    window.preventToolSwitch = false;
    isMotivationVisible = false;
  }
}

function startMotivationSystem() {
  console.log("🚀 Starting motivation system");

  // First show after 15 seconds
  setTimeout(() => {
    showMotivation();
  }, 15000);

  // Repeat every 5 minutes
  motivationInterval = setInterval(() => {
    // Only show if not currently visible
    if (!isMotivationVisible) {
      showMotivation();
    }
  }, 300000);
}

// ============================================
// 🔟 CLEANUP ✅
// ============================================
window.addEventListener("beforeunload", () => {
  if (motivationInterval) {
    clearInterval(motivationInterval);
  }
  window.preventToolSwitch = false;
  isMotivationVisible = false;
});

console.log("✅ Dashboard.js (fixed version) loaded successfully!");

// ============================================
// DEBUG HELPERS (can be removed in production)
// ============================================
window.debugDashboard = () => {
  console.log("=== DASHBOARD DEBUG ===");
  console.log("Current tool:", window.currentActiveTool);
  console.log("Initialized:", window.hasInitialized);
  console.log("Is switching:", window.isToolSwitching);
  console.log("Prevent switch:", window.preventToolSwitch);
  console.log("Motivation visible:", isMotivationVisible);
  console.log("======================");
};

console.log("✅ Dashboard.js loaded successfully");
console.log("   Type window.debugDashboard() to see current state");

// ============================================
// HELPER FUNCTIONS FOR VISUAL SCORE DASHBOARD ✅
// ADD THESE AT THE END OF dashboard.js FILE
// ============================================

function roundToIELTSBand(score) {
  const num = parseFloat(score);
  if (isNaN(num)) return null;

  // IELTS rounding: 0.25+ → round up, 0.24- → round down
  const rounded = Math.round(num * 2) / 2;

  // Ensure within valid range (0-9)
  return Math.max(0, Math.min(9, rounded)).toFixed(1);
}

/**
 * Calculate IELTS overall band from 4 criteria
 */
function calculateIELTSOverall(task, coherence, lexical, grammar) {
  const scores = [task, coherence, lexical, grammar]
    .map((s) => parseFloat(s))
    .filter((s) => !isNaN(s));

  if (scores.length !== 4) {
    console.warn("⚠️ Not all 4 scores available for overall calculation");
    return null;
  }

  const average = scores.reduce((sum, score) => sum + score, 0) / 4;
  return roundToIELTSBand(average);
}

// Extract scores from AI response text
function extractScoresFromResponse(resultText) {
  const scores = {
    overall: null,
    task: null,
    coherence: null,
    lexical: null,
    grammar: null,
  };

  if (!resultText) {
    console.warn("⚠️ No result text provided");
    return scores;
  }

  try {
    // ============================================
    // 1️⃣ INDIVIDUAL SCORES (extract first)
    // ============================================

    // Task Achievement / Response
    const taskMatch = resultText.match(
      /(?:Task\s+Achievement|Task\s+Response)[:\s]*(\d+(?:\.\d+)?)\s*\/?\s*9/i
    );
    if (taskMatch) {
      scores.task = roundToIELTSBand(taskMatch[1]);
      console.log("✅ Task score:", taskMatch[1], "→", scores.task);
    }

    // Coherence & Cohesion
    const cohMatch = resultText.match(
      /Coherence\s*(?:and|&)?\s*Cohesion[:\s]*(\d+(?:\.\d+)?)\s*\/?\s*9/i
    );
    if (cohMatch) {
      scores.coherence = roundToIELTSBand(cohMatch[1]);
      console.log("✅ Coherence score:", cohMatch[1], "→", scores.coherence);
    }

    // Lexical Resource
    const lexMatch = resultText.match(
      /Lexical\s+Resource[:\s]*(\d+(?:\.\d+)?)\s*\/?\s*9/i
    );
    if (lexMatch) {
      scores.lexical = roundToIELTSBand(lexMatch[1]);
      console.log("✅ Lexical score:", lexMatch[1], "→", scores.lexical);
    }

    // Grammar & Accuracy
    const gramMatch = resultText.match(
      /Gramm(?:ar|atical)\s+(?:Range\s+(?:and|&)\s+)?Accuracy[:\s]*(\d+(?:\.\d+)?)\s*\/?\s*9/i
    );
    if (gramMatch) {
      scores.grammar = roundToIELTSBand(gramMatch[1]);
      console.log("✅ Grammar score:", gramMatch[1], "→", scores.grammar);
    }

    // ============================================
    // 2️⃣ OVERALL SCORE - PRIORITIZE EXTRACTION
    // ============================================

    // Pattern 1: "OVERALL BAND SCORE: 8.0/9"
    let overallMatch = resultText.match(
      /OVERALL\s+BAND\s+SCORE[:\s]*(\d+(?:\.\d+)?)\s*\/?\s*9?/i
    );

    // Pattern 2: "Band Score: 8.0/9.0"
    if (!overallMatch) {
      overallMatch = resultText.match(
        /Band\s+Score[:\s]*(\d+(?:\.\d+)?)\s*\/?\s*9/i
      );
    }

    // Pattern 3: "Overall: 8.0/9"
    if (!overallMatch) {
      overallMatch = resultText.match(
        /Overall[:\s]*(\d+(?:\.\d+)?)\s*\/?\s*9/i
      );
    }

    // Pattern 4: Just the number after "OVERALL"
    if (!overallMatch) {
      overallMatch = resultText.match(/OVERALL.*?(\d+\.\d+)/i);
    }

    if (overallMatch) {
      scores.overall = roundToIELTSBand(overallMatch[1]);
      console.log(
        "✅ Overall score extracted:",
        overallMatch[1],
        "→",
        scores.overall
      );
    }

    // ============================================
    // 3️⃣ FALLBACK: CALCULATE OVERALL IF MISSING
    // ============================================

    if (
      !scores.overall &&
      scores.task &&
      scores.coherence &&
      scores.lexical &&
      scores.grammar
    ) {
      scores.overall = calculateIELTSOverall(
        scores.task,
        scores.coherence,
        scores.lexical,
        scores.grammar
      );
      console.log("✅ Overall calculated from criteria:", scores.overall);
    }

    // ============================================
    // 4️⃣ FINAL VALIDATION
    // ============================================

    if (!scores.overall) {
      console.error("❌ Overall score still not found!");
      console.log("First 500 chars of result:", resultText.substring(0, 500));
      scores.overall = "N/A";
    }
  } catch (error) {
    console.error("❌ Score extraction error:", error);
  }

  console.log("📊 Final IELTS scores (rounded):", scores);
  return scores;
}

// Create visual score card
function createScoreCard(label, score, color) {
  const numericScore = parseFloat(score) || 0;
  const percentage = (numericScore / 9) * 100;

  return `
    <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 18px; border-radius: 12px; border: 2px solid rgba(255,255,255,0.2); transition: all 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.25)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(255,255,255,0.15)'; this.style.transform='translateY(0)'">
      <div style="color: rgba(255,255,255,0.85); font-size: 12px; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
        ${label}
      </div>
      <div style="display: flex; align-items: baseline; gap: 5px; margin-bottom: 12px;">
        <span style="font-size: 36px; font-weight: 800; color: white;">${score}</span>
        <span style="font-size: 20px; color: rgba(255,255,255,0.7); font-weight: 600;">/9</span>
      </div>
      <!-- Animated Progress Bar -->
      <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.2); border-radius: 10px; overflow: hidden; position: relative;">
        <div style="width: 0%; height: 100%; background: white; border-radius: 10px; transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 10px rgba(255,255,255,0.5);" class="score-progress-bar" data-target="${percentage}"></div>
      </div>
    </div>
  `;
}

// Animate progress bars (call this after rendering)
function animateScoreBars() {
  setTimeout(() => {
    document.querySelectorAll(".score-progress-bar").forEach((bar) => {
      const target = bar.getAttribute("data-target");
      bar.style.width = target + "%";
    });
  }, 100);
}

console.log("✅ Visual Score Dashboard helpers loaded");

// ============================================
// PAGE LOAD - DEFAULT TOOL ✅
// ============================================

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
  // 🪙 COIN CHECK - MUST BLOCK EXECUTION
  console.log("💰 Checking coins for Quiz...");
  const canProceed = await checkAndSpendCoins("quiz");

  if (!canProceed) {
    console.error("❌ BLOCKED: Insufficient coins for Quiz");
    return; // ✅ STOP HERE
  }

  console.log("✅ Coins deducted for Quiz, proceeding...");

  const article = document.getElementById("quizArticleInput").value.trim();
  const questionCount = parseInt(
    document.getElementById("quizQuestionCount").value
  );
  const difficulty = document.getElementById("quizDifficulty").value;
  const language = document.getElementById("quiz-language").value;

  if (!article) {
    // ⚠️ REFUND COINS
    if (window.coinManager) {
      window.coinManager.addCoins(2, "Refund: No text provided");
    }
    alert("Iltimos, matn kiriting!");
    return;
  }

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
    // ⚠️ REFUND COINS
    if (window.coinManager) {
      window.coinManager.addCoins(2, "Refund: Quiz generation error");
    }
    alert("Xatolik yuz berdi: " + error.message);
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
  console.log("📊 Quiz finished, tracking...");

  if (typeof incrementStat === "function") {
    incrementStat("quizzesTaken", 1);

    // Real time calculation
    const questionCount = parseInt(
      document.getElementById("quizQuestionCount").value
    );
    const totalSeconds = questionCount * 60 - quizTimeLeft;
    const minutes = Math.max(1, Math.ceil(totalSeconds / 60));

    console.log("⏱️ Quiz time:", { totalSeconds, minutes });
    incrementStat("totalStudyTime", minutes);
  }

  // ✅ MANA SHU JOYGA (quiz yakunlanganda):
  incrementStat("quizzesTaken", 1);

  const questionCount = parseInt(
    document.getElementById("quizQuestionCount").value
  );
  const totalSeconds = questionCount * 60 - quizTimeLeft;
  const minutes = Math.max(1, Math.ceil(totalSeconds / 60));

  incrementStat("totalStudyTime", minutes);
  trackToolUsage("quiz");

  // Hide quiz section
  document.getElementById("quizQuestionsSection").style.display = "none";

  // Show results
  displayQuizResults();

  console.log("✅ Quiz tracking completed!");
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
  addRecentActivity("Quiz Generator", percentage, "❓", "#10b981");

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
    if (typeof createConfetti === "function") {
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
  // 🪙 COIN CHECK
  if (!checkAndSpendCoins("study")) {
    return;
  }
  const input = document.getElementById("studyInput").value;
  const result = document.getElementById("studyResult");
  const output = document.getElementById("studyOutput");

  const languageDropdown = document.getElementById("study-language");
  const language = languageDropdown ? languageDropdown.value : "uz";

  if (!selectedMode) {
    // ⚠️ REFUND COINS
    if (window.coinManager) {
      window.coinManager.addCoins(2, "Refund: No mode selected");
    }
    alert("Iltimos, avval rejim tanlang!");
    return;
  }

  if (!input.trim()) {
    // ⚠️ REFUND COINS
    if (window.coinManager) {
      window.coinManager.addCoins(2, "Refund: No input provided");
    }
    alert("Iltimos, matn kiriting!");
    return;
  }

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
        language: language,
      }),
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
        script: "🎤 Speaking/Writing Script",
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
      trackToolUsage("study");
      incrementStat("totalStudyTime", 4);
      addRecentActivity("Study Assistant", 90, "🎓", "#f59e0b");

      // ✅ TRACKING - FAQAT SUCCESS HOLATIDA
      console.log("📊 Study assistant completed, tracking...");

      console.log("✅ Study assistant tracking completed!");
    } else {
      throw new Error("AI dan javob kelmadi");
    }
  } catch (error) {
    console.error("❌ Study Assistant xatosi:", error);
    // ⚠️ REFUND COINS
    if (window.coinManager) {
      window.coinManager.addCoins(2, "Refund: Study assistant error");
    }
    showError(output, error.message);
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
  // 🪙 COIN CHECK - MUST BLOCK EXECUTION
  console.log("💰 Checking coins for Speaking...");
  const canProceed = await checkAndSpendCoins("speaking");

  if (!canProceed) {
    console.error("❌ BLOCKED: Insufficient coins for Speaking");
    return; // ✅ STOP HERE
  }

  console.log("✅ Coins deducted for Speaking, proceeding...");

  if (!recordedAudioBlob) {
    alert("❌ Audio yozilmagan!");
    return;
  }

  const topic = document.getElementById("speakingTopicInput").value.trim();
  const result = document.getElementById("speakingResult");
  const output = document.getElementById("speakingOutput");

  const languageDropdown = document.getElementById("speaking-language");
  const language = languageDropdown ? languageDropdown.value : "uz";

  result.style.display = "block";
  showLoading(output);

  try {
    const formData = new FormData();
    const audioFileName = "recording.webm";
    formData.append("audio", recordedAudioBlob, audioFileName);

    const transcriptResponse = await fetch(
      `${API_URL.replace("/api", "")}/api/audio-to-text`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!transcriptResponse.ok) {
      const errorText = await transcriptResponse.text();
      throw new Error(
        `Backend xatosi (${transcriptResponse.status}): ${errorText}`
      );
    }

    const transcriptData = await transcriptResponse.json();

    if (!transcriptData.success) {
      throw new Error(transcriptData.error || "Speech-to-Text xatosi");
    }

    const transcript = transcriptData.transcript;

    if (!transcript || transcript.trim().length < 10) {
      throw new Error("❌ Ovoz aniq eshitilmadi yoki juda qisqa.");
    }

    const feedbackResponse = await fetch(`${API_URL}/speaking-feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript: transcript,
        topic: topic,
        examType: selectedExamType,
        language: language,
      }),
    });

    const feedbackData = await feedbackResponse.json();

    if (!feedbackResponse.ok) {
      throw new Error(feedbackData.error || "Server error");
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
      console.log("📊 Speaking feedback received, tracking...");

      if (typeof addRecentActivity === "function") {
        const score = Math.floor(Math.random() * (92 - 78 + 1)) + 78;
        addRecentActivity("IELTS Feedback", score, "💬", "#06b6d4");
      }

      trackToolUsage("speaking");

      if (typeof incrementStat === "function") {
        const minutes = Math.max(1, Math.ceil(recordingSeconds / 60));
        incrementStat("totalStudyTime", minutes);
      }

      console.log("✅ Speaking tracking completed!");

      setTimeout(() => {
        result.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } else {
      throw new Error("AI dan javob kelmadi");
    }
  } catch (error) {
    console.error("❌ Xatolik:", error);
    // ⚠️ REFUND COINS
    if (window.coinManager) {
      window.coinManager.addCoins(3, "Refund: Speaking feedback error");
    }
    showError(output, error.message);
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

// ============================================
// UPDATE PROFILE COIN DISPLAY - FIXED ✅
// ============================================
async function updateProfileCoinDisplay() {
  console.log("🔄 Updating profile coin display...");

  const user = window.firebaseAuth?.currentUser;
  if (!user) {
    console.log("❌ No user logged in");
    return;
  }

  // ✅ 1. UPDATE COINS
  if (typeof getUserCoins === "function") {
    try {
      const coins = await getUserCoins();
      const coinBalance = document.getElementById("profileCoinBalance");
      if (coinBalance) {
        coinBalance.textContent = coins;

        // Animation
        coinBalance.style.transform = "scale(1.1)";
        setTimeout(() => {
          coinBalance.style.transform = "scale(1)";
        }, 200);

        console.log("💰 Profile coins updated:", coins);
      }
    } catch (error) {
      console.error("❌ Error getting coins:", error);
    }
  } else {
    console.warn("⚠️ getUserCoins function not available");
  }

  // ✅ 2. UPDATE SUBSCRIPTION FROM FIREBASE
  try {
    const db = window.firebaseDatabase;
    if (!db) {
      console.error("❌ Database not initialized");
      return;
    }

    const subRef = window.firebaseRef(db, `users/${user.uid}/subscription`);
    const snapshot = await window.firebaseGet(subRef);

    let subType = "free";
    let subExpiry = null;

    if (snapshot.exists()) {
      const subData = snapshot.val();
      subType = (subData.type || "free").toLowerCase();
      subExpiry = subData.expiry;
    }

    console.log("✅ Subscription type:", subType);

    // ✅ 3. UPDATE BADGE
    const subBadge = document.getElementById("subscriptionBadgeProfile");
    if (subBadge) {
      subBadge.textContent = subType.toUpperCase();

      if (subType === "pro") {
        subBadge.style.background =
          "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)";
        subBadge.style.color = "white";
      } else if (subType === "standard") {
        subBadge.style.background =
          "linear-gradient(135deg, #10b981 0%, #059669 100%)";
        subBadge.style.color = "white";
      } else {
        subBadge.style.background = "linear-gradient(135deg, #6b7280, #4b5563)";
        subBadge.style.color = "white";
      }
    }

    // ✅ 4. UPDATE EXPIRY
    const subExpiryElement = document.getElementById("subscriptionExpiry");
    if (subExpiryElement) {
      if (subType === "free" || !subExpiry) {
        subExpiryElement.textContent = "No expiry";
      } else {
        const expiryDate = new Date(subExpiry);
        const options = { year: "numeric", month: "long", day: "numeric" };
        subExpiryElement.textContent = `Expires: ${expiryDate.toLocaleDateString(
          "en-US",
          options
        )}`;
      }
    }

    // ✅ 5. UPDATE DAILY LIMIT
    const dailyLimit = document.getElementById("dailyCoinLimit");
    if (dailyLimit) {
      if (subType === "free") {
        dailyLimit.textContent = "5 coins/day";
      } else if (subType === "standard") {
        dailyLimit.textContent = "20 coins/day";
      } else if (subType === "pro") {
        dailyLimit.textContent = "50 coins/day";
      }
    }
  } catch (error) {
    console.error("❌ Error updating subscription:", error);
  }

  // ✅ 6. Load transaction history
  if (typeof loadTransactionHistory === "function") {
    loadTransactionHistory();
  }

  console.log("✅ Profile display update complete");
}

console.log("✅ Fixed Profile Tool Switching loaded!");

// ============================================
// LOAD TRANSACTION HISTORY - FIREBASE VERSION ✅
// ============================================
async function loadTransactionHistory() {
  const transactionList = document.getElementById("transactionList");
  if (!transactionList) return;

  const user = window.firebaseAuth?.currentUser;
  if (!user) {
    transactionList.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #9ca3af;">
        Please log in to view transactions
      </div>
    `;
    return;
  }

  const db = window.firebaseDatabase;
  if (!db) return;

  try {
    // Get transactions from Firebase
    const transRef = window.firebaseRef(
      db,
      `users/${user.uid}/coin_transactions`
    );
    const snapshot = await window.firebaseGet(transRef);

    if (!snapshot.exists()) {
      transactionList.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #9ca3af;">
          No transactions yet
        </div>
      `;
      return;
    }

    const transactions = [];
    snapshot.forEach((childSnapshot) => {
      transactions.push({
        id: childSnapshot.key,
        ...childSnapshot.val(),
      });
    });

    // Sort by timestamp (newest first)
    transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Show last 10 transactions
    const recentTransactions = transactions.slice(0, 10);

    transactionList.innerHTML = recentTransactions
      .map((tx) => {
        const icon = tx.type === "earn" ? "💰" : "🪙";
        const amountClass = tx.type === "earn" ? "earn" : "spend";
        const amountPrefix = tx.type === "earn" ? "+" : "-";
        const date = new Date(tx.timestamp).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return `
        <div class="transaction-item">
          <span class="transaction-icon">${icon}</span>
          <div class="transaction-info">
            <div class="transaction-reason">${tx.reason}</div>
            <div class="transaction-date">${date}</div>
          </div>
          <div class="transaction-amount ${amountClass}">
            ${amountPrefix}${tx.amount}
          </div>
        </div>
      `;
      })
      .join("");

    console.log("✅ Loaded", recentTransactions.length, "transactions");
  } catch (error) {
    console.error("❌ Error loading transactions:", error);
    transactionList.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #ef4444;">
        Error loading transactions
      </div>
    `;
  }
}

function showError(element, message) {
  // Detect common error types for better messages
  let errorIcon = "❌";
  let errorTitle = "Xatolik yuz berdi";
  let helpText =
    "Iltimos, qaytadan urinib ko'ring yoki qo'llab-quvvatlash xizmatiga murojaat qiling.";

  if (message.includes("Audio") || message.includes("speech")) {
    errorIcon = "🎤";
    errorTitle = "Audio Xatosi";
    helpText = "Mikrofon sozlamalarini tekshiring va qaytadan yozib ko'ring.";
  } else if (message.includes("network") || message.includes("fetch")) {
    errorIcon = "📡";
    errorTitle = "Internet Aloqasi";
    helpText = "Internetga ulanganingizni tekshiring va qayta urinib ko'ring.";
  } else if (message.includes("timeout") || message.includes("slow")) {
    errorIcon = "⏱️";
    errorTitle = "Vaqt Tugadi";
    helpText =
      "Server javob bermadi. Iltimos, bir necha daqiqadan keyin qaytadan urinib ko'ring.";
  }

  element.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      border: 2px solid #fca5a5;
      border-radius: 16px;
      padding: 25px;
      margin: 20px 0;
      box-shadow: 0 8px 16px rgba(239, 68, 68, 0.15);
      animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    ">
      <!-- Header with Animated Icon -->
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 16px;">
        <div style="
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        ">
          <span style="font-size: 24px;">${errorIcon}</span>
        </div>
        <div style="flex: 1;">
          <h4 style="
            margin: 0;
            font-size: 18px;
            font-weight: 700;
            color: #991b1b;
            letter-spacing: -0.5px;
          ">${errorTitle}</h4>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #b91c1c; opacity: 0.9;">
            ${new Date().toLocaleTimeString("uz-UZ", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <!-- Error Message Box -->
      <div style="
        background: rgba(255, 255, 255, 0.8);
        padding: 16px 18px;
        border-radius: 10px;
        margin-bottom: 16px;
        border-left: 4px solid #ef4444;
      ">
        <p style="
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
          color: #7f1d1d;
          font-weight: 500;
        ">${message}</p>
      </div>
      
      <!-- Help Text -->
      <div style="
        padding: 12px 16px;
        background: rgba(254, 243, 199, 0.5);
        border-radius: 8px;
        margin-bottom: 16px;
        border-left: 3px solid #f59e0b;
      ">
        <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
          <i class="bi bi-info-circle-fill" style="margin-right: 6px;"></i>
          <strong>Yordam:</strong> ${helpText}
        </p>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; gap: 10px;">
        <button onclick="location.reload()" style="
          flex: 1;
          padding: 12px 20px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
        " 
        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(239, 68, 68, 0.35)'"
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(239, 68, 68, 0.25)'">
          <i class="bi bi-arrow-clockwise"></i>
          <span>Qaytadan Urinish</span>
        </button>
        
        <button onclick="window.location.href='mailto:support@ziyoai.com?subject=Error%20Report&body=${encodeURIComponent(
          message
        )}'" style="
          padding: 12px 20px;
          background: white;
          color: #dc2626;
          border: 2px solid #fca5a5;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        "
        onmouseover="this.style.background='#fef2f2'"
        onmouseout="this.style.background='white'">
          <i class="bi bi-envelope"></i>
          <span>Yordam</span>
        </button>
      </div>
    </div>

    <!-- CSS Animations -->
    <style>
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }
    </style>
  `;
}

// console.log('Remaining localStorage:', Object.keys(localStorage).filter(k => k.includes('ziyoai')));

// ============================================
// TESTING MODE - COIN CHECK NI O'CHIRISH
// ============================================

// Console da ishlatish uchun:
// enableCoinCheck() - yoqish
// disableCoinCheck() - o'chirish
// addTestCoins(50) - test coinlar qo'shish
// resetCoins() - reset qilish

window.enableCoinCheck = function () {
  isCoinCheckEnabled = true;
  console.log("✅ Coin check enabled");
};

window.disableCoinCheck = function () {
  isCoinCheckEnabled = false;
  console.log("⚠️ Coin check disabled (testing mode)");
};

window.addTestCoins = function (amount) {
  if (window.coinManager) {
    window.coinManager.addCoins(amount, "Test coins");
    console.log(`✅ Added ${amount} test coins`);
  } else {
    console.error("❌ Coin manager not initialized");
  }
};

window.resetCoins = function () {
  if (window.coinManager) {
    window.coinManager.reset();
    console.log("🔄 Coins reset to default");
  }
};

window.showCoinInfo = function () {
  if (window.coinManager) {
    console.log("🪙 Current Coins:", window.coinManager.getCoins());
    console.log("📊 Subscription:", window.coinManager.data.subscription);
    console.log("💰 Total Earned:", window.coinManager.data.totalEarned);
    console.log("💸 Total Spent:", window.coinManager.data.totalSpent);
  }
};
