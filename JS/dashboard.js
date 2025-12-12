// ============================================
// API CONFIGURATION - TUZATILGAN ✅
// ============================================
const API_URL = window.location.hostname.includes("onrender.com")
    ? "https://zioai-backend.onrender.com/api"
    : "http://localhost:3000/api";

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
  article: {  // ✅ YANGI
    title: "Reading Articles",
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

// ============================================
// FORCE DEFAULT TOOL ON PAGE LOAD ✅
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    console.log('🚀 Initializing default tool...');
    
    // ✅ 1. FORCE HIDE ALL TOOLS with inline style
    document.querySelectorAll('.tool-content').forEach(el => {
      el.classList.remove('active');
      el.style.display = 'none';
    });
    
    // ✅ 2. Remove all nav active
    document.querySelectorAll('.nav-link').forEach(el => {
      el.classList.remove('active');
    });
    
    // ✅ 3. Set homework as default FORCED
    const homework = document.getElementById('homework-content');
    const homeworkLink = document.querySelector('.nav-link[data-tool="homework"]');
    
    if (homework) {
      homework.classList.add('active');
      homework.style.display = 'block'; // ✅ Force show
    }
    
    if (homeworkLink) {
      homeworkLink.classList.add('active');
    }
    
    console.log('✅ Default tool set: Homework Fixer');
  }, 100);
});

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


// ============================================
// SWITCH HOMEWORK TAB
// ============================================
function switchHomeworkTab(tab) {
  const textTab = document.getElementById('textInputTab');
  const imageTab = document.getElementById('imageInputTab');
  const textBtn = document.getElementById('textTabBtn');
  const imageBtn = document.getElementById('imageTabBtn');
  
  if (tab === 'text') {
    textTab.style.display = 'block';
    imageTab.style.display = 'none';
    textBtn.classList.add('active', 'linear-act-bc');
    textBtn.classList.remove('bg-bc');
    textBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    textBtn.style.color = 'white';
    imageBtn.classList.remove('active', 'linear-act-bc');
    imageBtn.classList.add('bg-bc');
    imageBtn.style.background = '#f3f4f6';
    imageBtn.style.color = '#6b7280';
  } else {
    textTab.style.display = 'none';
    imageTab.style.display = 'block';
    imageBtn.classList.add('active', 'linear-act-bc');
    imageBtn.classList.remove('bg-bc');
    imageBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    imageBtn.style.color = 'white';
    textBtn.classList.remove('active', 'linear-act-bc');
    textBtn.classList.add('bg-bc');
    textBtn.style.background = '#f3f4f6';
    textBtn.style.color = '#6b7280';
  }
}

// ============================================
// PROCESS IMAGE FILE
// ============================================
function processImageFile(file) {
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    alert('❌ File too large! Maximum size is 5MB.');
    return;
  }
  
  if (!file.type.startsWith('image/')) {
    alert('⚠️ Please upload an image file (PNG, JPG, JPEG)');
    return;
  }
  
  uploadedImage = file;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('previewImg').src = e.target.result;
    document.getElementById('imageFileName').textContent = file.name;
    document.getElementById('imageUploadArea').style.display = 'none';
    document.getElementById('imagePreview').style.display = 'block';
  };
  reader.readAsDataURL(file);
}

// ============================================
// HANDLE FILE INPUT CHANGE
// ============================================
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    processImageFile(file);
  }
}

// ============================================
// REMOVE IMAGE
// ============================================
function removeImage() {
  uploadedImage = null;
  
  document.getElementById('previewImg').src = '';
  document.getElementById('imageFileName').textContent = '';
  
  const fileInput = document.getElementById('homeworkImageInput');
  fileInput.value = '';
  
  // ✅ SHOW UPLOAD AREA AGAIN
  document.getElementById('imageUploadArea').style.display = 'block';
  document.getElementById('imagePreview').style.display = 'none';
  
  console.log('✅ Image removed, upload area restored');
}

// ============================================
// PASTE FROM CLIPBOARD
// ============================================
document.addEventListener('paste', (e) => {
  const imageTab = document.getElementById('imageInputTab');
  if (imageTab?.style.display === 'none') return;
  
  const items = e.clipboardData.items;
  for (let item of items) {
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile();
      processImageFile(file);
      break;
    }
  }
});

// ============================================
// FIX HOMEWORK - WITH IMAGE SUPPORT ✅
// ============================================
async function fixHomework() {
  const result = document.getElementById("homeworkResult");
  const output = document.getElementById("homeworkOutput");
  const languageDropdown = document.getElementById("homework-language");
  const language = languageDropdown ? languageDropdown.value : "uz";

  let homework = document.getElementById("homeworkInput").value.trim();

  // ✅ CHECK: If image is uploaded, use image mode
  if (uploadedImage) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target.result;
      
      result.style.display = "block";
      showLoading(output);
      
      try {
        const response = await fetch(`${API_URL}/fix-homework`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            homework: null,
            image: imageData,
            type: 'image',
            language: language,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Server error");
        }

        if (data.success && data.correctedHomework) {
          const subjectBadge = data.detectedSubject ? `
            <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin-bottom: 15px;">
              ${data.subjectEmoji || '📚'} ${data.detectedSubject.toUpperCase()}
            </div>
          ` : '';
          
          output.innerHTML = `
            ${subjectBadge}
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
          
          if (typeof trackToolUsage === 'function') trackToolUsage('homework');
          if (typeof incrementStat === 'function') {
            incrementStat('homeworkCompleted', 1);
            incrementStat('totalStudyTime', 3);
          }
          if (typeof addRecentActivity === 'function') {
            addRecentActivity('Homework Fixer', 87, '✏️', '#10b981');
          }
          
          console.log('📊 Homework completed successfully');
          
        } else {
          throw new Error("No response from AI");
        }
      } catch (error) {
        console.error("❌ Error:", error);
        showError(output, error.message);
      }
    };
    reader.readAsDataURL(uploadedImage);
    return;
  }

  // ✅ CHECK: If no image and no text, show error
  if (!homework) {
    alert('⚠️ Please enter your homework or upload an image!');
    return;
  }

  // ✅ TEXT HOMEWORK
  result.style.display = "block";
  showLoading(output);

  try {
    const response = await fetch(`${API_URL}/fix-homework`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homework: homework,
        image: null,
        type: 'text',
        language: language,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Server error");
    }

    if (data.success && data.correctedHomework) {
      const subjectBadge = data.detectedSubject ? `
        <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin-bottom: 15px;">
          ${data.subjectEmoji || '📚'} ${data.detectedSubject.toUpperCase()}
        </div>
      ` : '';
      
      output.innerHTML = `
        ${subjectBadge}
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
      
      if (typeof trackToolUsage === 'function') trackToolUsage('homework');
      if (typeof incrementStat === 'function') {
        incrementStat('homeworkCompleted', 1);
        incrementStat('totalStudyTime', 3);
      }
      if (typeof addRecentActivity === 'function') {
        addRecentActivity('Homework Fixer', 87, '✏️', '#10b981');
      }
      
      console.log('✅ Homework tracking completed!');
      
    } else {
      throw new Error("No response from AI");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    showError(output, error.message);
  }
}

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
// INITIALIZE ON PAGE LOAD ✅
// ============================================
window.addEventListener("load", () => {
  // IMAGE UPLOAD EVENT LISTENERS
  const fileInput = document.getElementById('homeworkImageInput');
  const uploadArea = document.getElementById('imageUploadArea');
  const fixBtn = document.getElementById('fixHomeworkBtn'); // ✅ YANGI
  const removeBtn = document.getElementById('removeImageBtn');
if (removeBtn) {
  removeBtn.addEventListener('click', removeImage);
}
  
  if (fileInput) {
    fileInput.addEventListener('change', handleImageUpload);
    console.log('✅ File input listener added');
  }
  
  if (uploadArea) {
    // Click to upload
    uploadArea.addEventListener('click', () => {
      if (fileInput) fileInput.click();
    });
    
    // Drag over
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#667eea';
      uploadArea.style.background = '#f0f2ff';
      uploadArea.style.borderWidth = '4px';
    });

    // Drag leave
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = '#d1d5db';
      uploadArea.style.background = '#f9fafb';
      uploadArea.style.borderWidth = '3px';
    });

    // Drop
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#d1d5db';
      uploadArea.style.background = '#f9fafb';
      uploadArea.style.borderWidth = '3px';
      
      const file = e.dataTransfer.files[0];
      if (file) {
        processImageFile(file);
      }
    });
    
    console.log('✅ Upload area listeners added');
  }
});

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

let uploadedWritingImage = null; // Global variable for image

// ============================================
// 1️⃣ SELECT TASK TYPE
// ============================================
let selectedTaskType = 'Task 2'; // Default

function selectTaskType(taskType) {
  selectedTaskType = taskType;
  
  const task1Btn = document.getElementById('task1Btn');
  const task2Btn = document.getElementById('task2Btn');
  const imageUploadSection = document.getElementById('writingImageSection');
  const topicInput = document.getElementById('essayTopic');
  
  // Update button styles
  if (taskType === 'Task 1') {
    task1Btn.classList.add('active');
    task2Btn.classList.remove('active');
    task1Btn.style.borderColor = '#667eea';
    task1Btn.style.background = 'linear-gradient(135deg, #667eea15, #764ba215)';
    task1Btn.querySelector('div:nth-child(2)').style.color = '#667eea';
    
    task2Btn.style.borderColor = '#e5e7eb';
    task2Btn.style.background = '#fff';
    task2Btn.querySelector('div:nth-child(2)').style.color = '#1f2937';
    
    // ✅ Show image upload for Task 1
    if (imageUploadSection) {
      imageUploadSection.style.display = 'block';
    }
    
    // Update topic placeholder
    topicInput.placeholder = 'Describe the graph/chart/diagram... (REQUIRED)';
    
  } else {
    task2Btn.classList.add('active');
    task1Btn.classList.remove('active');
    task2Btn.style.borderColor = '#667eea';
    task2Btn.style.background = 'linear-gradient(135deg, #667eea15, #764ba215)';
    task2Btn.querySelector('div:nth-child(2)').style.color = '#667eea';
    
    task1Btn.style.borderColor = '#e5e7eb';
    task1Btn.style.background = '#fff';
    task1Btn.querySelector('div:nth-child(2)').style.color = '#1f2937';
    
    // ✅ Hide image upload for Task 2
    if (imageUploadSection) {
      imageUploadSection.style.display = 'none';
    }
    
    // Update topic placeholder
    topicInput.placeholder = 'Enter the essay question... (REQUIRED)';
  }
  
  console.log('✅ Selected task type:', taskType);
}

// ============================================
// 2️⃣ IMAGE UPLOAD FUNCTIONS
// ============================================

// Handle image upload
function handleWritingImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    processWritingImage(file);
  }
}

// Process image file
function processWritingImage(file) {
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (file.size > maxSize) {
    alert('❌ File too large! Maximum size is 5MB.');
    return;
  }
  
  if (!file.type.startsWith('image/')) {
    alert('⚠️ Please upload an image file (PNG, JPG, JPEG)');
    return;
  }
  
  uploadedWritingImage = file;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('writingPreviewImg').src = e.target.result;
    document.getElementById('writingImageFileName').textContent = file.name;
    document.getElementById('writingImageUploadArea').style.display = 'none';
    document.getElementById('writingImagePreview').style.display = 'block';
  };
  reader.readAsDataURL(file);
  
  console.log('✅ Image uploaded:', file.name);
}

// Remove uploaded image
function removeWritingImage() {
  uploadedWritingImage = null;
  
  document.getElementById('writingPreviewImg').src = '';
  document.getElementById('writingImageFileName').textContent = '';
  
  const fileInput = document.getElementById('writingImageInput');
  if (fileInput) fileInput.value = '';
  
  document.getElementById('writingImageUploadArea').style.display = 'block';
  document.getElementById('writingImagePreview').style.display = 'none';
  
  console.log('✅ Image removed');
}

// ============================================
// 3️⃣ DRAG & DROP SUPPORT
// ============================================
function initializeWritingImageUpload() {
  const uploadArea = document.getElementById('writingImageUploadArea');
  
  if (!uploadArea) return;
  
  // Click to upload
  uploadArea.addEventListener('click', () => {
    document.getElementById('writingImageInput').click();
  });
  
  // Drag over
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#667eea';
    uploadArea.style.background = '#f0f2ff';
    uploadArea.style.borderWidth = '4px';
  });

  // Drag leave
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#d1d5db';
    uploadArea.style.background = '#f9fafb';
    uploadArea.style.borderWidth = '3px';
  });

  // Drop
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#d1d5db';
    uploadArea.style.background = '#f9fafb';
    uploadArea.style.borderWidth = '3px';
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processWritingImage(file);
    }
  });
}

// ============================================
// 4️⃣ WORD COUNTER (Keep existing)
// ============================================
const grammarInput = document.getElementById('grammarInput');
const wordCounter = document.getElementById('wordCounter');
const wordStatus = document.getElementById('wordStatus');

if (grammarInput && wordCounter) {
  grammarInput.addEventListener('input', () => {
    const text = grammarInput.value.trim();
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const count = words.length;
    
    wordCounter.textContent = count;
    
    if (count < 150) {
      wordStatus.innerHTML = '<span style="color: #ef4444;">⚠️ Too short</span>';
    } else if (count >= 150 && count < 250) {
      wordStatus.innerHTML = '<span style="color: #f59e0b;">⚠️ Add more</span>';
    } else if (count >= 250 && count <= 350) {
      wordStatus.innerHTML = '<span style="color: #10b981;">✅ Perfect</span>';
    } else {
      wordStatus.innerHTML = '<span style="color: #6b7280;">📝 Good length</span>';
    }
  });
}

// ============================================
// 5️⃣ CHECK WRITING FUNCTION - UPDATED ✅
// ============================================
async function checkWriting() {
  const text = document.getElementById('grammarInput').value;
  const language = document.getElementById('grammar-language').value;
  const resultBox = document.getElementById('grammarResult');
  const output = document.getElementById('grammarOutput');
  const topic = document.getElementById('essayTopic').value.trim();

  // ✅ VALIDATION 1: Topic majburiy
  if (!topic) {
    alert('⚠️ Topic is required! / Topicni kiriting!\n\nAI needs the topic to evaluate if your answer is relevant.');
    document.getElementById('essayTopic').focus();
    return;
  }

  // ✅ VALIDATION 2: Text majburiy
  if (!text.trim()) {
    alert('⚠️ Please enter your essay! / Essayingizni kiriting!');
    return;
  }

  // ✅ VALIDATION 3: Word count
  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 150) {
    alert(`❌ Minimum 150 words required! (Currently ${wordCount} words)\n\nMinimum 150 so'z kerak! (Hozirda ${wordCount} so'z)`);
    return;
  }

  // ✅ VALIDATION 4: Task 1 - Image optional but recommended
  if (selectedTaskType === 'Task 1' && !uploadedWritingImage) {
    const confirmed = confirm(
      '⚠️ Task 1 usually requires a chart/graph/diagram.\n\n' +
      'Do you want to continue without an image?\n\n' +
      '(Recommended: Upload the image for better analysis)'
    );
    
    if (!confirmed) {
      return;
    }
  }

  // Show loading
  resultBox.style.display = 'block';
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
    console.log('📤 Sending writing check request...');
    console.log('Task Type:', selectedTaskType);
    console.log('Word Count:', wordCount);
    console.log('Language:', language);
    console.log('Topic:', topic);
    console.log('Has Image:', !!uploadedWritingImage);

    const API_URL = window.location.hostname.includes("onrender.com")
      ? "https://zioai-backend.onrender.com/api"
      : "http://localhost:3000/api";

    // ✅ Prepare request data
    let requestData = {
      text,
      taskType: selectedTaskType,
      language,
      topic
    };

    // ✅ Add image if uploaded (Task 1)
    if (uploadedWritingImage) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target.result;
        requestData.image = imageData;
        
        // Send request with image
        await sendWritingRequest(requestData, API_URL, output, resultBox, wordCount);
      };
      reader.readAsDataURL(uploadedWritingImage);
    } else {
      // Send request without image
      await sendWritingRequest(requestData, API_URL, output, resultBox, wordCount);
    }

  } catch (error) {
    console.error('❌ Writing check error:', error);
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
async function sendWritingRequest(requestData, API_URL, output, resultBox, wordCount) {
  const response = await fetch(`${API_URL}/check-writing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
  });

  const data = await response.json();

  if (data.success) {
    console.log('✅ Writing analysis received');
    
    // Display results
    output.innerHTML = `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; color: white; margin-bottom: 25px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">
              <i class="bi bi-file-text"></i> ${requestData.taskType} | 
              <i class="bi bi-pencil-square"></i> ${wordCount} words
              ${requestData.image ? ' | <i class="bi bi-image"></i> With Chart' : ''}
            </div>
            <div style="font-size: 32px; font-weight: 900;">
              Writing Analysis Complete
            </div>
          </div>
          
          <button onclick="exportWritingToPDF()" style="padding: 12px 24px; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); color: white; border: 2px solid rgba(255,255,255,0.3); border-radius: 10px; cursor: pointer; font-weight: 700; transition: all 0.3s; display: flex; align-items: center; gap: 8px;">
            <i class="bi bi-download"></i> Export PDF
          </button>
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
    
    // Smooth scroll to results
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Track usage
    if (typeof trackToolUsage === 'function') {
      trackToolUsage('grammar');
    }
    
  } else {
    throw new Error(data.error || 'Analysis failed');
  }
}

// Export Result to Word/PDF (Optional)
function exportResult() {
  const output = document.getElementById('grammarOutput');
  const text = output.innerText;
  
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `IELTS_Writing_Analysis_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  
  console.log('✅ Result exported');
}

// Save activity to localStorage (optional)
function saveActivity(tool, details, wordCount) {
  try {
    const activities = JSON.parse(localStorage.getItem('userActivities') || '[]');
    activities.unshift({
      id: Date.now(),
      tool: tool,
      details: details,
      wordCount: wordCount,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 activities
    if (activities.length > 50) {
      activities.length = 50;
    }
    
    localStorage.setItem('userActivities', JSON.stringify(activities));
  } catch (error) {
    console.error('❌ Failed to save activity:', error);
  }
}

// Show Model Answer
async function showModelAnswer() {
  const btn = document.getElementById('modelAnswerBtn');
  const content = document.getElementById('modelAnswerContent');
  const topic = document.getElementById('essayTopic').value || 'The given topic';
  
  if (content.style.display === 'block') {
    // Hide model answer
    content.style.display = 'none';
    btn.innerHTML = '<i class="bi bi-book-fill"></i> Show Model Answer (Band 8-9)';
    btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    return;
  }
  
  // Show loading
  btn.disabled = true;
  btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Loading Model Answer...';
  content.style.display = 'block';
  content.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <div class="spinner-border text-success" role="status" style="width: 2rem; height: 2rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p style="margin-top: 15px; color: #6b7280;">Generating Band 8-9 model answer...</p>
    </div>
  `;
  
  try {
    console.log('📤 Requesting model answer...');
    
    const API_URL = 'http://127.0.0.1:3000';
    
    const response = await fetch(`${API_URL}/api/generate-model-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: topic,
        taskType: selectedTaskType
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Model answer received');
      
content.innerHTML = `
  <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #e5e7eb;">
      <div>
        <h5 style="margin: 0; color: #1f2937; font-weight: 800;">
          <i class="bi bi-trophy-fill" style="color: #fbbf24;"></i> Model Answer
        </h5>
        <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">
          📊 Band 8-9 Level | ✍️ ${data.wordCount} words
        </p>
      </div>
      
      <!-- ✅ COPY TUGMASI O'NG YUQORI BURCHAKDA -->
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
      <i class="bi bi-info-circle-fill"></i> <strong>Note:</strong> This is a Band 8-9 model answer. Compare your structure, vocabulary, and grammar.
    </p>
  </div>
`;
      
      btn.innerHTML = '<i class="bi bi-eye-slash-fill"></i> Hide Model Answer';
      btn.style.background = 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
      
    } else {
      throw new Error(data.error || 'Failed to generate model answer');
    }
    
  } catch (error) {
    console.error('❌ Model answer error:', error);
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
  const modelAnswerText = document.getElementById('modelAnswerText');
  
  if (!modelAnswerText) {
    alert('❌ Model answer topilmadi!');
    return;
  }

  // Get clean text content
  const textToCopy = modelAnswerText.innerText;

  // Copy to clipboard
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      // Show success feedback
      const copyBtn = document.querySelector('button[onclick="copyModelAnswer()"]');
      if (copyBtn) {
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Copied!';
        copyBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        
        setTimeout(() => {
          copyBtn.innerHTML = originalHTML;
          copyBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #8b5cf6 100%)';
        }, 2000);
      }
      
      console.log('✅ Model answer copied to clipboard');
    })
    .catch((err) => {
      console.error('❌ Copy failed:', err);
      alert('❌ Copy qilishda xatolik:\n' + err.message);
    });
}


// ============================================
// WRITING IMAGE UPLOAD - ALL FUNCTIONS ✅
// ADD THESE BEFORE exportWritingToPDF() FUNCTION
// ============================================


// ============================================
// 1️⃣ HANDLE FILE INPUT CHANGE
// ============================================
function handleWritingImageUpload(event) {
  const file = event.target.files[0];
  console.log('📁 File selected:', file?.name);
  
  if (file) {
    processWritingImage(file);
  }
}

// ============================================
// 2️⃣ PROCESS IMAGE FILE (Validation + Preview)
// ============================================
function processWritingImage(file) {
  console.log('🔍 Processing image:', file.name, file.size, 'bytes');
  
  // ✅ Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    alert('❌ File too large! Maximum size is 5MB.');
    return;
  }
  
  // ✅ Validate file type
  if (!file.type.startsWith('image/')) {
    alert('⚠️ Please upload an image file (PNG, JPG, JPEG)');
    return;
  }
  
  // ✅ Store file globally
  uploadedWritingImage = file;
  console.log('✅ Image stored:', uploadedWritingImage.name);
  
  // ✅ Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    const previewImg = document.getElementById('writingPreviewImg');
    const imageFileName = document.getElementById('writingImageFileName');
    const uploadArea = document.getElementById('writingImageUploadArea');
    const imagePreview = document.getElementById('writingImagePreview');
    
    if (previewImg && imageFileName && uploadArea && imagePreview) {
      previewImg.src = e.target.result;
      imageFileName.textContent = file.name;
      uploadArea.style.display = 'none';
      imagePreview.style.display = 'block';
      
      console.log('✅ Preview displayed');
    }
  };
  reader.readAsDataURL(file);
}

// ============================================
// 3️⃣ REMOVE UPLOADED IMAGE
// ============================================
function removeWritingImage() {
  console.log('🗑️ Removing image...');
  
  uploadedWritingImage = null;
  
  const previewImg = document.getElementById('writingPreviewImg');
  const imageFileName = document.getElementById('writingImageFileName');
  const fileInput = document.getElementById('writingImageInput');
  const uploadArea = document.getElementById('writingImageUploadArea');
  const imagePreview = document.getElementById('writingImagePreview');
  
  if (previewImg) previewImg.src = '';
  if (imageFileName) imageFileName.textContent = '';
  if (fileInput) fileInput.value = '';
  if (uploadArea) uploadArea.style.display = 'block';
  if (imagePreview) imagePreview.style.display = 'none';
  
  console.log('✅ Image removed successfully');
}

// ============================================
// 4️⃣ SELECT TASK TYPE (Show/Hide Image Upload)
// ============================================

function selectTaskType(taskType) {
  selectedTaskType = taskType;
  console.log('📝 Task type selected:', taskType);
  
  const task1Btn = document.getElementById('task1Btn');
  const task2Btn = document.getElementById('task2Btn');
  const imageUploadSection = document.getElementById('writingImageSection');
  const topicInput = document.getElementById('essayTopic');
  
  // ✅ Update button styles
  if (taskType === 'Task 1') {
    // Task 1 Active
    if (task1Btn) {
      task1Btn.classList.add('active');
      task1Btn.style.borderColor = '#667eea';
      task1Btn.style.background = 'linear-gradient(135deg, #667eea15, #764ba215)';
      const title = task1Btn.querySelector('div:nth-child(2)');
      if (title) title.style.color = '#667eea';
    }
    
    // Task 2 Inactive
    if (task2Btn) {
      task2Btn.classList.remove('active');
      task2Btn.style.borderColor = '#e5e7eb';
      task2Btn.style.background = '#fff';
      const title = task2Btn.querySelector('div:nth-child(2)');
      if (title) title.style.color = '#1f2937';
    }
    
    // ✅ Show image upload for Task 1
    if (imageUploadSection) {
      imageUploadSection.style.display = 'block';
      console.log('✅ Image upload section shown (Task 1)');
    }
    
    // Update topic placeholder
    if (topicInput) {
      topicInput.placeholder = 'Describe the graph/chart/diagram... (REQUIRED)';
    }
    
  } else {
    // Task 2 Active
    if (task2Btn) {
      task2Btn.classList.add('active');
      task2Btn.style.borderColor = '#667eea';
      task2Btn.style.background = 'linear-gradient(135deg, #667eea15, #764ba215)';
      const title = task2Btn.querySelector('div:nth-child(2)');
      if (title) title.style.color = '#667eea';
    }
    
    // Task 1 Inactive
    if (task1Btn) {
      task1Btn.classList.remove('active');
      task1Btn.style.borderColor = '#e5e7eb';
      task1Btn.style.background = '#fff';
      const title = task1Btn.querySelector('div:nth-child(2)');
      if (title) title.style.color = '#1f2937';
    }
    
    // ✅ Hide image upload for Task 2
    if (imageUploadSection) {
      imageUploadSection.style.display = 'none';
      console.log('✅ Image upload section hidden (Task 2)');
    }
    
    // Update topic placeholder
    if (topicInput) {
      topicInput.placeholder = 'Enter the essay question... (REQUIRED)';
    }
  }
}

// ============================================
// TOPIC IMAGE UPLOAD - YANGI FUNKSIYALAR ✅
// ============================================

let uploadedTopicImage = null; // Global variable

// ============================================
// 1️⃣ INITIALIZE TOPIC IMAGE UPLOAD
// ============================================
window.addEventListener('load', () => {
  console.log('🔧 Initializing Topic Image Upload...');
  
  const uploadArea = document.getElementById('topicImageUploadArea');
  const fileInput = document.getElementById('topicImageInput');
  
  if (!uploadArea || !fileInput) {
    console.error('❌ Topic image upload elements not found!');
    return;
  }
  
  console.log('✅ Topic image upload elements found');
  
  // ✅ 1. CLICK TO UPLOAD
  uploadArea.addEventListener('click', (e) => {
    e.stopPropagation();
    console.log('📂 Topic upload area clicked');
    fileInput.click();
  });
  
  // ✅ 2. FILE INPUT CHANGE
  fileInput.addEventListener('change', (e) => {
    console.log('📁 Topic file selected:', e.target.files[0]?.name);
    handleTopicImageUpload(e);
  });
  
  // ✅ 3. DRAG OVER
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.style.borderColor = '#667eea';
    uploadArea.style.background = '#f0f2ff';
    uploadArea.style.borderWidth = '4px';
  });
  
  // ✅ 4. DRAG LEAVE
  uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.style.borderColor = '#d1d5db';
    uploadArea.style.background = '#f9fafb';
    uploadArea.style.borderWidth = '3px';
  });
  
  // ✅ 5. DROP
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('📥 Topic file dropped');
    
    uploadArea.style.borderColor = '#d1d5db';
    uploadArea.style.background = '#f9fafb';
    uploadArea.style.borderWidth = '3px';
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processTopicImage(file);
    } else {
      alert('⚠️ Please upload an image file (PNG, JPG, JPEG)');
    }
  });
  
  // ✅ 6. PASTE (Ctrl+V)
  document.addEventListener('paste', (e) => {
    const grammarContent = document.getElementById('grammar-content');
    if (grammarContent && grammarContent.classList.contains('active')) {
      console.log('📋 Paste detected in writing section');
      
      const items = e.clipboardData.items;
      for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          processTopicImage(file);
          break;
        }
      }
    }
  });
  
  console.log('✅ Topic image upload initialized successfully!');
});

// ============================================
// 2️⃣ HANDLE FILE INPUT CHANGE
// ============================================
function handleTopicImageUpload(event) {
  const file = event.target.files[0];
  console.log('📁 File selected:', file?.name);
  
  if (file) {
    processTopicImage(file);
  }
}

// ============================================
// 3️⃣ PROCESS IMAGE FILE
// ============================================
function processTopicImage(file) {
  console.log('🔍 Processing topic image:', file.name, file.size, 'bytes');
  
  // ✅ Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    alert('❌ File too large! Maximum size is 5MB.');
    return;
  }
  
  // ✅ Validate file type
  if (!file.type.startsWith('image/')) {
    alert('⚠️ Please upload an image file (PNG, JPG, JPEG)');
    return;
  }
  
  // ✅ Store file globally
  uploadedTopicImage = file;
  console.log('✅ Topic image stored:', uploadedTopicImage.name);
  
  // ✅ Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    const previewImg = document.getElementById('topicPreviewImg');
    const imageFileName = document.getElementById('topicImageFileName');
    const uploadArea = document.getElementById('topicImageUploadArea');
    const imagePreview = document.getElementById('topicImagePreview');
    
    if (previewImg && imageFileName && uploadArea && imagePreview) {
      previewImg.src = e.target.result;
      imageFileName.textContent = file.name;
      uploadArea.style.display = 'none';
      imagePreview.style.display = 'block';
      
      console.log('✅ Topic preview displayed');
    }
  };
  reader.readAsDataURL(file);
}

// ============================================
// 4️⃣ REMOVE UPLOADED TOPIC IMAGE
// ============================================
function removeTopicImage() {
  console.log('🗑️ Removing topic image...');
  
  uploadedTopicImage = null;
  
  const previewImg = document.getElementById('topicPreviewImg');
  const imageFileName = document.getElementById('topicImageFileName');
  const fileInput = document.getElementById('topicImageInput');
  const uploadArea = document.getElementById('topicImageUploadArea');
  const imagePreview = document.getElementById('topicImagePreview');
  
  if (previewImg) previewImg.src = '';
  if (imageFileName) imageFileName.textContent = '';
  if (fileInput) fileInput.value = '';
  if (uploadArea) uploadArea.style.display = 'block';
  if (imagePreview) imagePreview.style.display = 'none';
  
  console.log('✅ Topic image removed successfully');
}

// ============================================
// CHECK WRITING - UPDATED WITH TOPIC IMAGE ✅
// ============================================
async function checkWriting() {
  const text = document.getElementById('grammarInput').value;
  const language = document.getElementById('grammar-language').value;
  const resultBox = document.getElementById('grammarResult');
  const output = document.getElementById('grammarOutput');
  const topicInput = document.getElementById('essayTopic');
  
  // ✅ GET TOPIC (from text input or image)
  let topic = topicInput.value.trim();
  let topicImageData = null;

  // ✅ CHECK: If topic image is uploaded, convert to base64
  if (uploadedTopicImage) {
    console.log('🖼️ Topic image detected, converting to base64...');
    
    const reader = new FileReader();
    topicImageData = await new Promise((resolve, reject) => {
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Topic image read failed'));
      reader.readAsDataURL(uploadedTopicImage);
    });
    
    // If topic text is empty, inform user
    if (!topic) {
      topic = "[Topic uploaded as image]";
    }
    
    console.log('✅ Topic image converted to base64');
  }

  // ✅ VALIDATION 1: Topic is REQUIRED (text or image)
  if (!topic && !topicImageData) {
    alert('⚠️ Topic is required! / Topicni kiriting!\n\nPlease type the topic or upload it as an image.');
    topicInput.focus();
    return;
  }

  // ✅ VALIDATION 2: Text check
  if (!text.trim()) {
    alert('⚠️ Please enter your essay! / Essayingizni kiriting!');
    return;
  }

  // ✅ VALIDATION 3: Word count
  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 150) {
    alert(`❌ Minimum 150 words required! (Currently ${wordCount} words)\n\nMinimum 150 so'z kerak! (Hozirda ${wordCount} so'z)`);
    return;
  }

  // Show loading
  resultBox.style.display = 'block';
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
    console.log('📤 Sending writing check request...');
    console.log('Task Type:', selectedTaskType);
    console.log('Word Count:', wordCount);
    console.log('Language:', language);
    console.log('Topic:', topic);
    console.log('Has Writing Image:', !!uploadedWritingImage);
    console.log('Has Topic Image:', !!topicImageData);

    const API_URL = window.location.hostname.includes("onrender.com")
      ? "https://zioai-backend.onrender.com/api"
      : "http://localhost:3000/api";

    // ✅ Prepare request data
    let requestData = {
      text,
      taskType: selectedTaskType,
      language,
      topic
    };

    // ✅ Add TOPIC image if uploaded
    if (topicImageData) {
      requestData.topicImage = topicImageData;
      console.log('📊 Topic image added to request');
    }

    // ✅ Add CHART/DIAGRAM image if uploaded (Task 1)
    if (uploadedWritingImage) {
      console.log('🖼️ Converting chart image to base64...');
      const reader = new FileReader();
      
      const chartImageData = await new Promise((resolve, reject) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Chart image read failed'));
        reader.readAsDataURL(uploadedWritingImage);
      });
      
      requestData.chartImage = chartImageData;
      console.log('✅ Chart image added to request');
    }

    // ✅ Send request
    const response = await fetch(`${API_URL}/check-writing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Writing analysis received');
      
      // Display results
      output.innerHTML = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; color: white; margin-bottom: 25px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">
                <i class="bi bi-file-text"></i> ${requestData.taskType} | 
                <i class="bi bi-pencil-square"></i> ${wordCount} words
                ${requestData.topicImage ? ' | <i class="bi bi-card-image"></i> Topic (Image)' : ''}
                ${requestData.chartImage ? ' | <i class="bi bi-image"></i> Chart (Image)' : ''}
              </div>
              <div style="font-size: 32px; font-weight: 900;">
                Writing Analysis Complete
              </div>
            </div>
            
            <button onclick="exportWritingToPDF()" style="padding: 12px 24px; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); color: white; border: 2px solid rgba(255,255,255,0.3); border-radius: 10px; cursor: pointer; font-weight: 700; transition: all 0.3s; display: flex; align-items: center; gap: 8px;">
              <i class="bi bi-download"></i> Export PDF
            </button>
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
      
      // Smooth scroll to results
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      // Track usage
      if (typeof trackToolUsage === 'function') {
        trackToolUsage('grammar');
      }
      
    } else {
      throw new Error(data.error || 'Analysis failed');
    }

  } catch (error) {
    console.error('❌ Writing check error:', error);
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
// EXPORT TO PDF - CLEAN & STRUCTURED VERSION ✅
// ============================================
async function exportWritingToPDF() {
  const topic = document.getElementById('essayTopic').value || 'IELTS Writing Task';
  const wordCount = document.getElementById('grammarInput').value.trim().split(/\s+/).filter(w => w).length;
  const yourText = document.getElementById('grammarInput').value;
  
  const resultElement = document.getElementById('grammarOutput');
  const modelAnswerElement = document.getElementById('modelAnswerText');
  
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPos = 20;
    
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    const cleanText = (text) => {
      if (!text) return '';
      return text
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#\d+;/g, '')
        .replace(/&[a-z]+;/gi, '')
        .replace(/[^\x20-\x7E\n]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };
    
    const checkPageBreak = (requiredSpace = 25) => {
      if (yPos > pageHeight - requiredSpace) {
        doc.addPage();
        yPos = 20;
        return true;
      }
      return false;
    };
    
    const addText = (text, fontSize = 10, isBold = false, lineHeight = 1.3) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      const lines = doc.splitTextToSize(text, maxWidth);
      
      lines.forEach(line => {
        checkPageBreak();
        doc.text(line, margin, yPos);
        yPos += fontSize * lineHeight * 0.352778;
      });
    };
    
    const addSection = (title, bgColor, textColor) => {
      checkPageBreak(40);
      
      doc.setFillColor(...bgColor);
      doc.roundedRect(margin, yPos - 2, maxWidth, 12, 3, 3, 'F');
      
      doc.setTextColor(...textColor);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin + 5, yPos + 6);
      
      yPos += 17;
      doc.setTextColor(0, 0, 0);
    };
    
    const addSubSection = (title) => {
      checkPageBreak(30);
      
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(margin, yPos, maxWidth, 8, 2, 2, 'F');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(55, 65, 81);
      doc.text(title, margin + 3, yPos + 5.5);
      
      yPos += 12;
      doc.setTextColor(0, 0, 0);
    };
    
    const addBulletPoint = (text, fontSize = 9) => {
      checkPageBreak();
      
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', 'normal');
      
      const bulletX = margin + 3;
      const textX = margin + 8;
      
      doc.text('•', bulletX, yPos);
      
      const lines = doc.splitTextToSize(text, maxWidth - 8);
      lines.forEach((line, index) => {
        checkPageBreak();
        doc.text(line, textX, yPos);
        yPos += fontSize * 1.3 * 0.352778;
      });
      
      yPos += 1;
    };
    
    // ============================================
    // ADD IMAGE TO PDF (NEW FUNCTION) ✅
    // ============================================
    const addImageToPDF = async (imageElement, title) => {
      if (!imageElement || !imageElement.src) return;
      
      checkPageBreak(120);
      
      try {
        // Calculate image dimensions (maintain aspect ratio)
        const maxImageWidth = maxWidth - 20; // Leave some margin
        const maxImageHeight = 100;
        
        const img = new Image();
        img.src = imageElement.src;
        
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        
        let imgWidth = maxImageWidth;
        let imgHeight = (img.height / img.width) * imgWidth;
        
        if (imgHeight > maxImageHeight) {
          imgHeight = maxImageHeight;
          imgWidth = (img.width / img.height) * imgHeight;
        }
        
        // Center the image
        const xCenter = (pageWidth - imgWidth) / 2;
        
        // Add border around image
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.rect(xCenter - 2, yPos - 2, imgWidth + 4, imgHeight + 4);
        
        // Add image to PDF (centered)
        doc.addImage(
          img.src,
          'JPEG',
          xCenter,
          yPos,
          imgWidth,
          imgHeight
        );
        
        yPos += imgHeight + 15;
        
        console.log(`✅ Image added to PDF: ${title}`);
        
      } catch (error) {
        console.error(`❌ Failed to add image: ${title}`, error);
        yPos += 5;
      }
    };
    
    const extractScores = (text) => {
      const scores = {
        overall: null,
        task: null,
        coherence: null,
        lexical: null,
        grammar: null
      };
      
      const overallMatch = text.match(/(?:OVERALL|Band Score|Overall Band).*?(\d+(?:\.\d+)?)\s*\/\s*9/is);
      if (overallMatch) scores.overall = overallMatch[1];
      
      const taskMatch = text.match(/Task Achievement.*?(\d+)\s*\/\s*9/is);
      if (taskMatch) scores.task = taskMatch[1];
      
      const cohMatch = text.match(/(?:Coherence|Cohesion).*?(\d+)\s*\/\s*9/is);
      if (cohMatch) scores.coherence = cohMatch[1];
      
      const lexMatch = text.match(/(?:Lexical|Vocabulary).*?(\d+)\s*\/\s*9/is);
      if (lexMatch) scores.lexical = lexMatch[1];
      
      const gramMatch = text.match(/(?:Grammar|Grammatical Range).*?(\d+)\s*\/\s*9/is);
      if (gramMatch) scores.grammar = gramMatch[1];
      
      return scores;
    };
    
    const parseAnalysis = (text) => {
      if (!text) return {
        vocabulary: { level: null, strong: [], repetitive: [], synonyms: [] },
        grammar: { total: null, errors: [] },
        taskResponse: [],
        patterns: [],
        tips: []
      };
      
      const analysis = {
        vocabulary: { 
          level: null, 
          strong: [], 
          repetitive: [], 
          synonyms: [] 
        },
        grammar: { 
          total: null, 
          errors: [] 
        },
        taskResponse: [],
        patterns: [],
        tips: []
      };
      
      // ============================================
      // VOCABULARY ANALYSIS - CLEAN EXTRACTION
      // ============================================
      
      // Level
      const vocabMatch = text.match(/Level:\s*([A-C][1-2]|Beginner|Intermediate|Advanced)/is);
      if (vocabMatch) analysis.vocabulary.level = vocabMatch[1];
      
      // Strong Words - extract properly
      const strongMatch = text.match(/Strong Words?:?\s*([^\n]+?)(?=\n|$)/is);
      if (strongMatch) {
        const wordsText = strongMatch[1];
        const cleanWords = wordsText.split(/(?=Repetitive|GRAMMAR|Total Errors|#\d+|ta#)/i)[0];
        analysis.vocabulary.strong = cleanWords
          .split(/[,;]/)
          .map(w => w.trim())
          .filter(w => w && w.length > 2 && w.length < 50 && !w.toLowerCase().includes('grammar') && !w.toLowerCase().includes('mistakes'));
      }
      
      // Repetitive Words - separate from strong words and stop before Synonyms
      const repMatch = text.match(/Repetitive(?:\s+Words?)?:?\s*([^\n]+?)(?=\n|$)/is);
      if (repMatch) {
        const repText = repMatch[1];
        const cleanRep = repText.split(/(?=Synonym|GRAMMAR|Total Errors|#\d+|ta#|Strong)/i)[0];
        analysis.vocabulary.repetitive = cleanRep
          .split(/[,;]/)
          .map(w => w.trim())
          .filter(w => w && w.length > 2 && w.length < 50 && !w.toLowerCase().includes('grammar') && !w.toLowerCase().includes('synonym') && !w.toLowerCase().includes('mistakes'));
      }
      
      // Synonyms - clean extraction
      const synMatch = text.match(/(?:Synonyms?|Suggested Synonyms):?\s*([\s\S]+?)(?=\n*(?:#|GRAMMAR|Task|Coherence|$))/is);
      if (synMatch) {
        const synText = synMatch[1];
        analysis.vocabulary.synonyms = synText
          .split(/[;•\n]/)
          .map(s => s.replace(/^[-•\s]+/, '').trim())
          .filter(s => s && s.includes('-') && s.length > 3);
      }
      
      // ============================================
      // GRAMMAR MISTAKES - STRUCTURED
      // ============================================
      
      const gramTotalMatch = text.match(/Total Errors:\s*(\d+)/is);
      if (gramTotalMatch) analysis.grammar.total = gramTotalMatch[1];
      
      // Extract errors with better regex
      const errorSection = text.match(/GRAMMAR MISTAKES:?([\s\S]+?)(?=TASK RESPONSE|COHERENCE|GRAMMAR PATTERNS|$)/is);
      if (errorSection) {
        const errorMatches = errorSection[1].matchAll(/#?(\d+)[:\s]*(?:Wrong|Xato)?:?\s*[""]([^""]+)[""][\s\S]*?(?:Correct|To'g'ri)?:?\s*[""]([^""]+)[""][\s\S]*?(?:Rule|Qoida)?:?\s*([^\n#]+)/gis);
        
        for (const match of errorMatches) {
          analysis.grammar.errors.push({
            number: match[1],
            wrong: match[2].trim(),
            correct: match[3].trim(),
            rule: match[4].trim()
          });
        }
      }
      
// ============================================
      // TASK RESPONSE - TO'G'RILANGAN ✅
      // ============================================
      
      const taskSection = text.match(/TASK RESPONSE:?\s*([\s\S]+?)(?=COHERENCE|GRAMMAR PATTERNS|IMPROVEMENT|MODEL ANSWER|YOUR ORIGINAL|$)/i);
      if (taskSection) {
        let taskText = taskSection[1].trim();
        
        // Raqamlarni olib tashlash (6 yoki boshqa raqamlar)
        taskText = taskText.replace(/^\d+\s*/gm, '');
        
        const lines = [];
        
        // Har bir savolni alohida ajratish
        const questionPattern = /([^?]+\?)\s*(Ha|Yo'q|Yes|No)\s*[✓✗]?/gi;
        const matches = taskText.matchAll(questionPattern);
        
        for (const match of matches) {
          const question = match[1].trim();
          const answer = match[2].trim();
          
          if (question.length > 5) {
            lines.push(`${question} ${answer}`);
          }
        }

        if (lines.length > 0) {
          analysis.taskResponse = lines;
        }
      }
      
      // COHERENCE & COHESION - O'CHIRILDI ❌
      
      // ============================================
      // GRAMMAR PATTERNS
      // ============================================
      
      const patternsSection = text.match(/GRAMMAR PATTERNS[^:]*:([\s\S]+?)(?=\d+IMPROVEMENT|IMPROVEMENT|MODEL|$)/is);
      if (patternsSection) {
        let patternsText = patternsSection[1].trim();
        
        patternsText = patternsText.replace(/^\d+\s*/, '');
        
        if (!patternsText.includes('\n')) {
          patternsText = patternsText.replace(/(IF Conditionals|Passive Voice|Complex Sentences|Relative Clauses|Modal Verbs)/gi, '\n$1');
        }
        
        const patterns = patternsText
          .split(/\n/)
          .map(p => p.replace(/^[-•\s]+/, '').trim())
          .filter(p => p.length > 15 && !p.includes('IMPROVEMENT') && !p.includes('MODEL'));
        
        if (patterns.length === 0 && patternsText.length > 15) {
          patterns.push(patternsText);
        }
        
        analysis.patterns = patterns;
      }
      
      // ============================================
      // IMPROVEMENT TIPS - TO'G'RILANGAN ✅
      // ============================================
      
      const tipsMatch = text.match(/(?:\d+\s*)?IMPROVEMENT\s*TIPS?:?\s*([\s\S]+?)(?=MODEL ANSWER|YOUR ORIGINAL|Generated|$)/i);
      
      if (tipsMatch) {
        let tipsText = tipsMatch[1].trim();
        
        // Keraksiz qismlarni olib tashlash
        tipsText = tipsText
          .replace(/\s*(Hide|Show|Quick Tips|MODEL ANSWER|YOUR ORIGINAL|Generated).*$/is, '')
          .trim();
        
        // Bullet point bilan ajratish
        const lines = [];
        
        if (tipsText.includes('•')) {
          // Agar • belgisi bo'lsa
          lines.push(...tipsText
            .split(/•/)
            .map(t => t.trim())
            .filter(t => t.length > 5)
          );
        } else {
          // Agar yo'q bo'lsa, katta harf bilan boshlanuvchi gaplarni ajratish
          const sentences = tipsText.match(/[A-ZА-ЯЁЎҒҲҚ][^.!?]*[.!?]*/g) || [];
          lines.push(...sentences.map(s => s.trim()).filter(s => s.length > 5));
        }

        if (lines.length > 0) {
          analysis.tips = lines.filter(t => 
            !t.match(/^(?:Hide|Show|Quick|MODEL|YOUR|Generated|Band Score)/i)
          );
        }
      }
      
      return analysis;
    };
    
    // ============================================
    // DOCUMENT HEADER
    // ============================================
    doc.setFillColor(44, 170, 154);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('ZiyoAI', pageWidth / 2, 22, { align: 'center' });
    
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.text('IELTS Writing Analysis Report', pageWidth / 2, 34, { align: 'center' });
    
    yPos = 60;
    
    // ============================================
    // INFO BOX
    // ============================================
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, yPos, maxWidth, 42, 3, 3, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    const infoY = yPos + 8;
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, margin + 5, infoY);
    doc.text(`Task: ${selectedTaskType || 'Task 2'}`, margin + 5, infoY + 7);
    doc.text(`Words: ${wordCount}`, margin + 5, infoY + 14);
    
    const topicText = cleanText(topic);
    const topicLines = doc.splitTextToSize(`Topic: ${topicText}`, maxWidth - 10);
    doc.text(topicLines, margin + 5, infoY + 21);
    
    yPos += 48;
    
    // ============================================
    // ADD UPLOADED IMAGES ✅
    // ============================================
    
    // 1️⃣ Topic Image
    const topicImageElement = document.getElementById('topicPreviewImg');
    if (topicImageElement && topicImageElement.src) {
      await addImageToPDF(topicImageElement, '📋 Essay Topic/Question (Uploaded Image)');
    }
    
    // 2️⃣ Chart/Diagram Image (Task 1)
    const chartImageElement = document.getElementById('writingPreviewImg');
    if (chartImageElement && chartImageElement.src) {
      await addImageToPDF(chartImageElement, '📊 Chart/Diagram (Task 1 - Uploaded Image)');
    }
    
    // ============================================
    // SCORES SECTION
    // ============================================
    let fullText = '';
    let analysis = null;
    
    if (resultElement) {
      fullText = cleanText(resultElement.textContent);
      const scores = extractScores(fullText);
      
      if (scores.overall) {
        addSection('YOUR SCORES', [232, 248, 245], [44, 170, 154]);
        
        // Overall score
        doc.setFillColor(232, 248, 245);
        doc.roundedRect(margin, yPos, maxWidth, 15, 2, 2, 'F');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Overall Band Score:', margin + 5, yPos + 10);
        
        doc.setFontSize(14);
        doc.setTextColor(44, 170, 154);
        doc.text(`${scores.overall}/9.0`, margin + maxWidth - 5, yPos + 10, { align: 'right' });
        doc.setTextColor(0, 0, 0);
        
        yPos += 20;
        
        // Individual scores
        if (scores.task || scores.coherence || scores.lexical || scores.grammar) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          
          const scoreLabels = [
            { label: 'Task Achievement', value: scores.task },
            { label: 'Coherence & Cohesion', value: scores.coherence },
            { label: 'Lexical Resource', value: scores.lexical },
            { label: 'Grammatical Range & Accuracy', value: scores.grammar }
          ];
          
          scoreLabels.forEach(({ label, value }) => {
            if (value) {
              checkPageBreak();
              doc.text(`${label}:`, margin + 5, yPos);
              doc.setFont('helvetica', 'bold');
              doc.text(`${value}/9`, margin + maxWidth - 5, yPos, { align: 'right' });
              doc.setFont('helvetica', 'normal');
              yPos += 7;
            }
          });
          
          yPos += 5;
        }
      }
      
      // ============================================
      // DETAILED ANALYSIS - CLEAN & STRUCTURED
      // ============================================
      addSection('DETAILED ANALYSIS', [232, 248, 245], [44, 170, 154]);
      
      analysis = parseAnalysis(fullText);
      
      // ============================================
      // 1. VOCABULARY ANALYSIS
      // ============================================
      if (analysis.vocabulary.level || analysis.vocabulary.strong.length > 0) {
        addSubSection('1. VOCABULARY ANALYSIS');
        
        if (analysis.vocabulary.level) {
          doc.setFont('helvetica', 'bold');
          addText(`Level: ${analysis.vocabulary.level}`, 9, true);
          yPos += 3;
        }
        
        if (analysis.vocabulary.strong.length > 0) {
          doc.setFont('helvetica', 'bold');
          addText('Strong Words:', 9, true);
          doc.setFont('helvetica', 'normal');
          addText(analysis.vocabulary.strong.join(', '), 9);
          yPos += 3;
        }
        
        if (analysis.vocabulary.repetitive.length > 0) {
          doc.setFont('helvetica', 'bold');
          addText('Repetitive Words:', 9, true);
          doc.setFont('helvetica', 'normal');
          addText(analysis.vocabulary.repetitive.join(', '), 9);
          yPos += 3;
        }
        
        if (analysis.vocabulary.synonyms.length > 0) {
          doc.setFont('helvetica', 'bold');
          addText('Suggested Synonyms:', 9, true);
          yPos += 2;
          doc.setFont('helvetica', 'normal');
          analysis.vocabulary.synonyms.forEach(syn => {
            addBulletPoint(syn, 9);
          });
        }
        
        yPos += 5;
      }
      
      // ============================================
      // 2. GRAMMAR MISTAKES
      // ============================================
      if (analysis.grammar.total || analysis.grammar.errors.length > 0) {
        addSubSection('2. GRAMMAR MISTAKES');
        
        if (analysis.grammar.total) {
          doc.setFont('helvetica', 'bold');
          addText(`Total Errors: ${analysis.grammar.total}`, 9, true);
          yPos += 5;
        }
        
        analysis.grammar.errors.forEach(error => {
          checkPageBreak(25);
          
          doc.setFont('helvetica', 'bold');
          addText(`Error #${error.number}:`, 9, true);
          yPos += 2;
          
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          
          doc.setTextColor(220, 38, 38);
          addText(`Wrong: "${error.wrong}"`, 9);
          yPos += 1;
          
          doc.setTextColor(22, 163, 74);
          addText(`Correct: "${error.correct}"`, 9);
          yPos += 1;
          
          doc.setTextColor(107, 114, 128);
          addText(`Rule: ${error.rule}`, 9);
          
          doc.setTextColor(0, 0, 0);
          yPos += 5;
        });
        
        yPos += 3;
      }
      
      // ============================================
      // 3. TASK RESPONSE
      // ============================================
      if (analysis.taskResponse.length > 0) {
        addSubSection('3. TASK RESPONSE');
        
        analysis.taskResponse.forEach(feedback => {
          addBulletPoint(feedback, 9);
        });
        
        yPos += 5;
      }
      
      // ============================================
      // 4. COHERENCE & COHESION - O'CHIRILDI ❌
      // ============================================
      
      // ============================================
      // 4. GRAMMAR PATTERNS TO IMPROVE
      // ============================================
      if (analysis.patterns.length > 0) {
        addSubSection('4. GRAMMAR PATTERNS TO IMPROVE');
        
        analysis.patterns.forEach(pattern => {
          addBulletPoint(pattern, 9);
        });
        
        yPos += 5;
      }
      
      // ============================================
      // 5. IMPROVEMENT TIPS
      // ============================================
      if (analysis.tips.length > 0) {
        addSubSection('5. IMPROVEMENT TIPS');
        
        analysis.tips.forEach(tip => {
          addBulletPoint(tip, 9);
        });
        
        yPos += 5;
      }
    }
    
    // ============================================
    // MODEL ANSWER
    // ============================================
    if (modelAnswerElement) {
      addSection('MODEL ANSWER (Band 8-9)', [220, 252, 231], [44, 170, 154]);
      
      const modelText = cleanText(modelAnswerElement.textContent);
      const paragraphs = modelText.split(/\n\n+/).filter(p => p.trim().length > 30);
      
      paragraphs.forEach(para => {
        addText(para.trim(), 9, false, 1.5);
        yPos += 5;
      });
      
      yPos += 3;
      
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(margin, yPos, maxWidth, 12, 2, 2, 'F');
      doc.setFontSize(9);
      doc.setTextColor(146, 64, 14);
      doc.text('Note: This is a Band 8-9 model. Compare your structure, vocabulary, and grammar.', margin + 3, yPos + 7);
      doc.setTextColor(0, 0, 0);
      
      yPos += 17;
    }
    
    // ============================================
    // YOUR ORIGINAL TEXT
    // ============================================
    if (yourText && yourText.trim()) {
      addSection('YOUR ORIGINAL TEXT', [254, 243, 199], [245, 158, 11]);
      
      const cleanOriginal = cleanText(yourText);
      const paragraphs = cleanOriginal.split(/\n+/).filter(p => p.trim().length > 10);
      
      paragraphs.forEach(para => {
        addText(para.trim(), 9, false, 1.5);
        yPos += 5;
      });
    }
    
    // ============================================
    // FOOTER
    // ============================================
    const totalPages = doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Generated by ZiyoAI - Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
    
    // ============================================
    // SAVE
    // ============================================
    const filename = `ZiyoAI_Writing_Report_${Date.now()}.pdf`;
    doc.save(filename);
    
    console.log('✅ PDF exported:', filename);
    
    const exportBtn = document.querySelector('button[onclick="exportWritingToPDF()"]');
    if (exportBtn) {
      const originalHTML = exportBtn.innerHTML;
      exportBtn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Downloaded!';
      exportBtn.style.background = '#10b981';
      
      setTimeout(() => {
        exportBtn.innerHTML = originalHTML;
        exportBtn.style.background = '';
      }, 2500);
    }
    
  } catch (error) {
    console.error('❌ PDF export error:', error);
    alert('PDF export failed: ' + error.message);
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
       trackToolUsage('vocabulary');
       incrementStat('totalStudyTime', 1);
       addRecentActivity('Vocabulary Builder', 92, '📖', '#3b82f6');
           
      // ✅ TRACKING - FAQAT SUCCESS HOLATIDA VA BIR MARTA
      console.log('📊 Vocabulary learned successfully, tracking...');

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
// PAGE LOAD - DEFAULT TOOL ✅
// ============================================
window.addEventListener("load", () => {
  updateMiniTimerDisplay();
  startMotivationSystem();
  initStats();

  // ✅ DEFAULT TOOL: HOMEWORK FIXER
  // Remove all active classes first
  document.querySelectorAll('.tool-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
  
  // Set homework as default active
  const homeworkContent = document.getElementById('homework-content');
  const homeworkLink = document.querySelector('.nav-link[data-tool="homework"]');
  
  if (homeworkContent) homeworkContent.classList.add('active');
  if (homeworkLink) homeworkLink.classList.add('active');
  
  console.log('✅ Default tool set: Homework Fixer');

  // Firebase auth check
  const auth = window.firebaseAuth;
  if (auth) {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const username = getUsernameFromDisplayName(
          user.displayName,
          user.email
        );
        console.log("✅ Username extracted:", username);
        updateWelcomeMessage(username);

        const userNameElement = document.getElementById("userName");
        if (userNameElement) {
          userNameElement.textContent = username;
        }
      }
      unsubscribe();
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
  
  // ✅ MANA SHU JOYGA (quiz yakunlanganda):
  incrementStat('quizzesTaken', 1);
  
  const questionCount = parseInt(document.getElementById('quizQuestionCount').value);
  const totalSeconds = (questionCount * 60) - quizTimeLeft;
  const minutes = Math.max(1, Math.ceil(totalSeconds / 60));
  
  incrementStat('totalStudyTime', minutes);
  trackToolUsage('quiz');

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
  addRecentActivity('Quiz Generator', percentage, '❓', '#10b981');



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
      trackToolUsage('study');
      incrementStat('totalStudyTime', 4);
      addRecentActivity('Study Assistant', 90, '🎓', '#f59e0b');
      
      // ✅ TRACKING - FAQAT SUCCESS HOLATIDA
      console.log('📊 Study assistant completed, tracking...');

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
      
      
      if (typeof addRecentActivity === 'function') {
        const score = Math.floor(Math.random() * (92 - 78 + 1)) + 78;
        addRecentActivity('IELTS Feedback', score, '💬', '#06b6d4');
      }
      
      trackToolUsage('speaking');

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
    <div style="
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      border: 1px solid #fca5a5;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      box-shadow: 0 4px 6px rgba(239, 68, 68, 0.1);
      animation: slideDown 0.3s ease-out;
    ">
      <!-- Header with Icon -->
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
        <div style="
          width: 40px;
          height: 40px;
          background: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        ">
          <i class="bi bi-exclamation-triangle-fill" style="color: white; font-size: 20px;"></i>
        </div>
        <div style="flex: 1;">
          <h4 style="
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #991b1b;
          ">Xatolik yuz berdi</h4>
        </div>
      </div>

      <!-- Error Message -->
      <div style="
        background: rgba(255, 255, 255, 0.7);
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 16px;
      ">
        <p style="
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
          color: #7f1d1d;
          white-space: pre-wrap;
        ">${message}</p>
      </div>

      <!-- Retry Button -->
      <button onclick="clearSpeaking()" style="
        width: 100%;
        padding: 12px 24px;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
      " 
      onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(239, 68, 68, 0.3)'"
      onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(239, 68, 68, 0.2)'">
        <i class="bi bi-arrow-clockwise"></i>
        <span>Qaytadan Urinish</span>
      </button>
    </div>

    <!-- CSS Animation -->
    <style>
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    </style>
  `;
}

// console.log('Remaining localStorage:', Object.keys(localStorage).filter(k => k.includes('ziyoai')));


// ============================================
// SWITCH TOOL FUNCTION - OPTIMIZED ✅
// ============================================
function switchTool(toolName) {
  console.log('🔀 Switching to:', toolName);
  
  // ✅ 1. IMMEDIATELY hide all tools (no animation delay)
  document.querySelectorAll('.tool-content').forEach(el => {
    el.classList.remove('active');
    el.style.display = 'none';
  });
  
  // ✅ 2. Remove all nav active states
  navLinks.forEach((link) => link.classList.remove("active"));
  
  // ✅ 3. Activate selected nav link
  const activeLink = document.querySelector(`.nav-link[data-tool="${toolName}"]`);
  if (activeLink) {
    activeLink.classList.add("active");
  }

  // ✅ 4. IMMEDIATELY show selected tool (no delay)
  const activeContent = document.getElementById(`${toolName}-content`);
  if (activeContent) {
    activeContent.classList.add("active");
    activeContent.style.display = 'block';
    
    // ✅ Initialize special tools
    if (toolName === "article" && typeof showArticlesTool === "function") {
      showArticlesTool();
    }
    
    if (toolName === "profile" && typeof showProfileTool === "function") {
      showProfileTool();
    }
  }

  // ✅ 5. Update header
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

  // ✅ 6. Close mobile sidebar
  if (window.innerWidth < 1024) {
    sidebar.classList.remove("menu-active");
    toggleMenu(false);
  }
  
  console.log('✅ Tool switched successfully');
}

// ============================================
// FORCE DEFAULT TOOL ON PAGE LOAD - IMMEDIATE ✅
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Setting default tool...');
  
  // ✅ IMMEDIATELY hide all tools
  document.querySelectorAll('.tool-content').forEach(el => {
    el.classList.remove('active');
    el.style.display = 'none';
  });
  
  // ✅ Remove all nav active
  document.querySelectorAll('.nav-link').forEach(el => {
    el.classList.remove('active');
  });
  
  // ✅ SHOW Homework Fixer IMMEDIATELY
  const homework = document.getElementById('homework-content');
  const homeworkLink = document.querySelector('.nav-link[data-tool="homework"]');
  
  if (homework) {
    homework.classList.add('active');
    homework.style.display = 'block';
    console.log('✅ Homework Fixer shown');
  }
  
  if (homeworkLink) {
    homeworkLink.classList.add('active');
  }
  
  console.log('✅ Default tool set successfully!');
});

// ============================================
// BACKUP: Force show homework after page fully loads
// ============================================
window.addEventListener('load', () => {
  setTimeout(() => {
    const homework = document.getElementById('homework-content');
    if (homework && !homework.classList.contains('active')) {
      console.warn('⚠️ Homework not shown, forcing...');
      document.querySelectorAll('.tool-content').forEach(el => {
        el.style.display = 'none';
      });
      homework.classList.add('active');
      homework.style.display = 'block';
    }
  }, 100);
});