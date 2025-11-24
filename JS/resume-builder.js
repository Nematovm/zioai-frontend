// ============================================
// PROFESSIONAL RESUME BUILDER - ZIYOAI (DASHBOARD INTEGRATED)
// ============================================

// Resume data structure
let resumeData = {
  personal: {
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    photo: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  languages: [],
  projects: [],
};

let currentTemplate = "professional";

// ============================================
// INITIALIZATION - DASHBOARD INTEGRATED
// ============================================
function initializeResumeBuilder() {
  console.log('✅ Resume Builder initialized');
  
  // Personal information - RESUME PREFIX BILAN
  ['resumeFullName', 'resumeJobTitle', 'resumeEmail', 'resumePhone', 'resumeLocation', 'resumeLinkedin', 'resumeGithub'].forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("input", updateResumePersonalInfo);
    }
  });

  // Photo upload
  const photoInput = document.getElementById("resumePhotoInput");
  if (photoInput) {
    photoInput.addEventListener("change", handleResumePhotoUpload);
  }

  // Summary
  const summaryInput = document.getElementById("resumeSummary");
  if (summaryInput) {
    summaryInput.addEventListener("input", updateResumeSummary);
  }

  // Template selector
  document.querySelectorAll(".template-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".template-btn").forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      currentTemplate = this.dataset.template;
      const preview = document.getElementById("resumePreview");
      if (preview) {
        preview.className = `template-${currentTemplate}`;
      }
      updateResumePreview();
    });
  });

  // Initialize preview
  updateResumePreview();
}

// Call initialization when dashboard tool is shown
document.addEventListener('DOMContentLoaded', function() {
  // Wait for tool to be visible
  const observer = new MutationObserver(function(mutations) {
    const articleContent = document.getElementById('article-content');
    if (articleContent && articleContent.classList.contains('active')) {
      initializeResumeBuilder();
      observer.disconnect();
    }
  });
  
  observer.observe(document.body, { 
    attributes: true, 
    subtree: true, 
    attributeFilter: ['class'] 
  });
});

// ============================================
// PHOTO UPLOAD
// ============================================
function handleResumePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const photoData = event.target.result;
    resumeData.personal.photo = photoData;

    const preview = document.getElementById("resumePhotoPreview");
    if (preview) {
      preview.src = photoData;
      preview.style.display = "block";
    }

    updateResumePreview();
  };
  reader.readAsDataURL(file);
}

// ============================================
// UPDATE FUNCTIONS
// ============================================
function updateResumePersonalInfo() {
  resumeData.personal.fullName = document.getElementById("resumeFullName")?.value || "";
  resumeData.personal.jobTitle = document.getElementById("resumeJobTitle")?.value || "";
  resumeData.personal.email = document.getElementById("resumeEmail")?.value || "";
  resumeData.personal.phone = document.getElementById("resumePhone")?.value || "";
  resumeData.personal.location = document.getElementById("resumeLocation")?.value || "";
  resumeData.personal.linkedin = document.getElementById("resumeLinkedin")?.value || "";
  resumeData.personal.github = document.getElementById("resumeGithub")?.value || "";
  updateResumePreview();
}

function updateResumeSummary() {
  resumeData.summary = document.getElementById("resumeSummary")?.value || "";
  updateResumePreview();
}

// ============================================
// WORK EXPERIENCE
// ============================================
function addResumeExperience() {
  const container = document.getElementById("resumeExperienceContainer");
  if (!container) return;
  
  const id = Date.now();

  const html = `
    <div class="dynamic-section-resume" data-id="${id}">
      <button class="remove-btn-resume" onclick="removeResumeExperience(${id})">
        <i class="bi bi-trash"></i> Remove
      </button>
      
      <div class="input-group-inline">
        <label>Job Title</label>
        <input type="text" class="exp-title" placeholder="Senior Software Engineer">
      </div>
      
      <div class="input-group-inline">
        <label>Company</label>
        <input type="text" class="exp-company" placeholder="Tech Corp Inc.">
      </div>
      
      <div class="input-group-inline">
        <label>Location</label>
        <input type="text" class="exp-location" placeholder="Tashkent, Uzbekistan">
      </div>
      
      <div class="input-group-inline">
        <label>Start Date</label>
        <input type="month" class="exp-start">
      </div>
      
      <div class="input-group-inline">
        <label>End Date (Leave empty if current)</label>
        <input type="month" class="exp-end">
      </div>
      
      <div class="input-group-inline">
        <label>Description</label>
        <textarea class="exp-description" placeholder="• Led team of 5 developers&#10;• Increased efficiency by 30%" rows="3"></textarea>
      </div>
    </div>
  `;

  container.insertAdjacentHTML("beforeend", html);

  const section = container.querySelector(`[data-id="${id}"]`);
  section.querySelectorAll("input, textarea").forEach((input) => {
    input.addEventListener("input", collectResumeExperienceData);
  });

  collectResumeExperienceData();
}

function removeResumeExperience(id) {
  document.querySelector(`#resumeExperienceContainer [data-id="${id}"]`)?.remove();
  collectResumeExperienceData();
}

function collectResumeExperienceData() {
  resumeData.experience = [];

  document.querySelectorAll("#resumeExperienceContainer .dynamic-section-resume").forEach((section) => {
    const exp = {
      title: section.querySelector(".exp-title")?.value || "",
      company: section.querySelector(".exp-company")?.value || "",
      location: section.querySelector(".exp-location")?.value || "",
      startDate: section.querySelector(".exp-start")?.value || "",
      endDate: section.querySelector(".exp-end")?.value || "Present",
      description: section.querySelector(".exp-description")?.value || "",
    };

    if (exp.title || exp.company) {
      resumeData.experience.push(exp);
    }
  });

  updateResumePreview();
}

// ============================================
// EDUCATION
// ============================================
function addResumeEducation() {
  const container = document.getElementById("resumeEducationContainer");
  if (!container) return;
  
  const id = Date.now();

  const html = `
    <div class="dynamic-section-resume" data-id="${id}">
      <button class="remove-btn-resume" onclick="removeResumeEducation(${id})">
        <i class="bi bi-trash"></i> Remove
      </button>
      
      <div class="input-group-inline">
        <label>Degree</label>
        <input type="text" class="edu-degree" placeholder="Bachelor of Computer Science">
      </div>
      
      <div class="input-group-inline">
        <label>Institution</label>
        <input type="text" class="edu-institution" placeholder="University of Technology">
      </div>
      
      <div class="input-group-inline">
        <label>Location</label>
        <input type="text" class="edu-location" placeholder="Tashkent, Uzbekistan">
      </div>
      
      <div class="input-group-inline">
        <label>Graduation Year</label>
        <input type="number" class="edu-year" placeholder="2023" min="1950" max="2030">
      </div>
      
      <div class="input-group-inline">
        <label>GPA (Optional)</label>
        <input type="text" class="edu-gpa" placeholder="3.8/4.0">
      </div>
    </div>
  `;

  container.insertAdjacentHTML("beforeend", html);

  const section = container.querySelector(`[data-id="${id}"]`);
  section.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", collectResumeEducationData);
  });

  collectResumeEducationData();
}

function removeResumeEducation(id) {
  document.querySelector(`#resumeEducationContainer [data-id="${id}"]`)?.remove();
  collectResumeEducationData();
}

function collectResumeEducationData() {
  resumeData.education = [];

  document.querySelectorAll("#resumeEducationContainer .dynamic-section-resume").forEach((section) => {
    const edu = {
      degree: section.querySelector(".edu-degree")?.value || "",
      institution: section.querySelector(".edu-institution")?.value || "",
      location: section.querySelector(".edu-location")?.value || "",
      year: section.querySelector(".edu-year")?.value || "",
      gpa: section.querySelector(".edu-gpa")?.value || "",
    };

    if (edu.degree || edu.institution) {
      resumeData.education.push(edu);
    }
  });

  updateResumePreview();
}

// ============================================
// SKILLS
// ============================================
function addResumeSkill() {
  const container = document.getElementById("resumeSkillsContainer");
  if (!container) return;
  
  const id = Date.now();

  const html = `
    <div class="dynamic-section-resume" data-id="${id}">
      <button class="remove-btn-resume" onclick="removeResumeSkill(${id})">
        <i class="bi bi-trash"></i> Remove
      </button>
      
      <div class="input-group-inline">
        <label>Skill Name</label>
        <input type="text" class="skill-name" placeholder="JavaScript, Python, React">
      </div>
      
      <div class="input-group-inline">
        <label>Proficiency Level</label>
        <select class="skill-level">
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced" selected>Advanced</option>
          <option value="Expert">Expert</option>
        </select>
      </div>
    </div>
  `;

  container.insertAdjacentHTML("beforeend", html);

  const section = container.querySelector(`[data-id="${id}"]`);
  section.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", collectResumeSkillsData);
    input.addEventListener("change", collectResumeSkillsData);
  });

  collectResumeSkillsData();
}

function removeResumeSkill(id) {
  document.querySelector(`#resumeSkillsContainer [data-id="${id}"]`)?.remove();
  collectResumeSkillsData();
}

function collectResumeSkillsData() {
  resumeData.skills = [];

  document.querySelectorAll("#resumeSkillsContainer .dynamic-section-resume").forEach((section) => {
    const skill = {
      name: section.querySelector(".skill-name")?.value || "",
      level: section.querySelector(".skill-level")?.value || "Advanced",
    };

    if (skill.name) {
      resumeData.skills.push(skill);
    }
  });

  updateResumePreview();
}

// ============================================
// LANGUAGES
// ============================================
function addResumeLanguage() {
  const container = document.getElementById("resumeLanguagesContainer");
  if (!container) return;
  
  const id = Date.now();

  const html = `
    <div class="dynamic-section-resume" data-id="${id}">
      <button class="remove-btn-resume" onclick="removeResumeLanguage(${id})">
        <i class="bi bi-trash"></i> Remove
      </button>
      
      <div class="input-group-inline">
        <label>Language</label>
        <input type="text" class="lang-name" placeholder="English, Uzbek, Russian">
      </div>
      
      <div class="input-group-inline">
        <label>Proficiency Level</label>
        <select class="lang-level">
          <option value="Elementary">Elementary</option>
          <option value="Limited Working">Limited Working</option>
          <option value="Professional Working">Professional Working</option>
          <option value="Full Professional" selected>Full Professional</option>
          <option value="Native">Native / Bilingual</option>
        </select>
      </div>
    </div>
  `;

  container.insertAdjacentHTML("beforeend", html);

  const section = container.querySelector(`[data-id="${id}"]`);
  section.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", collectResumeLanguagesData);
    input.addEventListener("change", collectResumeLanguagesData);
  });

  collectResumeLanguagesData();
}

function removeResumeLanguage(id) {
  document.querySelector(`#resumeLanguagesContainer [data-id="${id}"]`)?.remove();
  collectResumeLanguagesData();
}

function collectResumeLanguagesData() {
  resumeData.languages = [];

  document.querySelectorAll("#resumeLanguagesContainer .dynamic-section-resume").forEach((section) => {
    const lang = {
      name: section.querySelector(".lang-name")?.value || "",
      level: section.querySelector(".lang-level")?.value || "Full Professional",
    };

    if (lang.name) {
      resumeData.languages.push(lang);
    }
  });

  updateResumePreview();
}

// ============================================
// PROJECTS
// ============================================
function addResumeProject() {
  const container = document.getElementById("resumeProjectsContainer");
  if (!container) return;
  
  const id = Date.now();

  const html = `
    <div class="dynamic-section-resume" data-id="${id}">
      <button class="remove-btn-resume" onclick="removeResumeProject(${id})">
        <i class="bi bi-trash"></i> Remove
      </button>
      
      <div class="input-group-inline">
        <label>Project Name</label>
        <input type="text" class="proj-name" placeholder="E-commerce Platform">
      </div>
      
      <div class="input-group-inline">
        <label>Technologies Used</label>
        <input type="text" class="proj-tech" placeholder="React, Node.js, MongoDB">
      </div>
      
      <div class="input-group-inline">
        <label>Project URL (Optional)</label>
        <input type="url" class="proj-url" placeholder="https://github.com/username/project">
      </div>
      
      <div class="input-group-inline">
        <label>Description</label>
        <textarea class="proj-description" placeholder="Brief description..." rows="2"></textarea>
      </div>
    </div>
  `;

  container.insertAdjacentHTML("beforeend", html);

  const section = container.querySelector(`[data-id="${id}"]`);
  section.querySelectorAll("input, textarea").forEach((input) => {
    input.addEventListener("input", collectResumeProjectsData);
  });

  collectResumeProjectsData();
}

function removeResumeProject(id) {
  document.querySelector(`#resumeProjectsContainer [data-id="${id}"]`)?.remove();
  collectResumeProjectsData();
}

function collectResumeProjectsData() {
  resumeData.projects = [];

  document.querySelectorAll("#resumeProjectsContainer .dynamic-section-resume").forEach((section) => {
    const proj = {
      name: section.querySelector(".proj-name")?.value || "",
      technologies: section.querySelector(".proj-tech")?.value || "",
      url: section.querySelector(".proj-url")?.value || "",
      description: section.querySelector(".proj-description")?.value || "",
    };

    if (proj.name) {
      resumeData.projects.push(proj);
    }
  });

  updateResumePreview();
}

// ============================================
// PREVIEW RENDERING
// ============================================
function updateResumePreview() {
  const preview = document.getElementById("resumePreview");
  if (!preview) return;
  
  const { personal, summary, experience, education, skills, languages, projects } = resumeData;

  let html = `
    <div class="resume-header">
      ${personal.photo ? `<div class="photo-container"><img src="${personal.photo}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 10px;" alt="Profile"></div>` : ""}
      <div class="resume-name">${personal.fullName || "Your Name"}</div>
      <div style="font-size: 16px; color: ${currentTemplate === "modern" ? "white" : "#666"}; margin-bottom: 8px;">
        ${personal.jobTitle || "Your Job Title"}
      </div>
      <div class="resume-contact">
        ${personal.email ? `<span><i class="bi bi-envelope"></i> ${personal.email}</span>` : ""}
        ${personal.phone ? `<span><i class="bi bi-telephone"></i> ${personal.phone}</span>` : ""}
        ${personal.location ? `<span><i class="bi bi-geo-alt"></i> ${personal.location}</span>` : ""}
        ${personal.linkedin ? `<span><i class="bi bi-linkedin"></i> LinkedIn</span>` : ""}
        ${personal.github ? `<span><i class="bi bi-github"></i> GitHub</span>` : ""}
      </div>
    </div>
  `;

  if (summary) {
    html += `<div class="resume-section">
      <div class="resume-section-title">Professional Summary</div>
      <p>${summary.replace(/\n/g, "<br>")}</p>
    </div>`;
  }

  if (experience.length > 0) {
    html += `<div class="resume-section"><div class="resume-section-title">Work Experience</div>`;
    experience.forEach((exp) => {
      html += `
        <div class="resume-item">
          <div class="resume-item-title">${exp.title}</div>
          <div class="resume-item-subtitle">${exp.company}${exp.location ? ` | ${exp.location}` : ""}</div>
          <div class="resume-item-date">${formatResumeDate(exp.startDate)} - ${formatResumeDate(exp.endDate)}</div>
          <p style="margin-top: 6px; white-space: pre-line;">${exp.description}</p>
        </div>
      `;
    });
    html += `</div>`;
  }

  if (education.length > 0) {
    html += `<div class="resume-section"><div class="resume-section-title">Education</div>`;
    education.forEach((edu) => {
      html += `
        <div class="resume-item">
          <div class="resume-item-title">${edu.degree}</div>
          <div class="resume-item-subtitle">${edu.institution}${edu.location ? ` | ${edu.location}` : ""}</div>
          <div class="resume-item-date">${edu.year}${edu.gpa ? ` | GPA: ${edu.gpa}` : ""}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  if (projects.length > 0) {
    html += `<div class="resume-section"><div class="resume-section-title">Projects</div>`;
    projects.forEach((proj) => {
      html += `
        <div class="resume-item">
          <div class="resume-item-title">${proj.name}${proj.url ? ` <a href="${proj.url}" target="_blank" style="font-size: 11px; color: #667eea;">[Link]</a>` : ""}</div>
          <div class="resume-item-subtitle">${proj.technologies}</div>
          <p style="margin-top: 6px;">${proj.description}</p>
        </div>
      `;
    });
    html += `</div>`;
  }

  if (skills.length > 0) {
    html += `<div class="resume-section"><div class="resume-section-title">Skills</div><div class="skills-grid">`;
    skills.forEach((skill) => {
      html += `<div class="skill-item">${skill.name} - ${skill.level}</div>`;
    });
    html += `</div></div>`;
  }

  if (languages.length > 0) {
    html += `<div class="resume-section"><div class="resume-section-title">Languages</div><div class="languages-grid">`;
    languages.forEach((lang) => {
      html += `<div class="language-item"><span>${lang.name}</span><span style="color: #999; font-size: 12px;">${lang.level}</span></div>`;
    });
    html += `</div></div>`;
  }

  preview.innerHTML = html;
}

function formatResumeDate(date) {
  if (date === "Present" || !date) return "Present";
  const d = new Date(date + "-01");
  return `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
}

// ============================================
// PREVIEW TOGGLE
// ============================================
function togglePreview() {
  const panel = document.getElementById("resumePreviewPanel");
  if (panel) {
    panel.classList.toggle("active");
  }
}

// ============================================
// AI ENHANCEMENT
// ============================================
async function enhanceResumeWithAI() {
  const summaryInput = document.getElementById("resumeSummary");
  const jobTitleInput = document.getElementById("resumeJobTitle");
  
  if (!summaryInput || !jobTitleInput) return;
  
  const currentSummary = summaryInput.value.trim();
  const jobTitle = jobTitleInput.value;

  if (!currentSummary && !jobTitle) {
    alert("Please enter a job title or initial summary first!");
    return;
  }

  const btn = document.getElementById("aiSummaryBtn");
  if (!btn) return;
  
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Enhancing...';

  try {
    const prompt = currentSummary
      ? `Improve this professional summary for a ${jobTitle}:\n\n${currentSummary}\n\nMake it more professional, concise, and impactful. Keep it under 100 words.`
      : `Write a professional summary for a ${jobTitle}. Make it concise, impactful, and highlight key strengths. Keep it under 100 words.`;

    const response = await fetch("/api/study-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "explain", content: prompt, language: "en" }),
    });

    const data = await response.json();

    if (data.success) {
      const text = data.result.replace(/<[^>]*>/g, "").replace(/\*\*/g, "").trim();
      summaryInput.value = text;
      updateResumeSummary();
    }
  } catch (error) {
    console.error("AI Enhancement error:", error);
    alert("Failed to enhance summary. Please try again.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-stars"></i> AI Enhance';
  }
}

// ============================================
// SAVE & LOAD
// ============================================
function saveResume() {
  const auth = window.firebaseAuth;
  const user = auth?.currentUser;

  if (!user) {
    alert("Please login to save your resume!");
    return;
  }

  const resumeKey = `ziyoai_resume_${user.uid}`;
  localStorage.setItem(resumeKey, JSON.stringify(resumeData));

  alert("Resume saved successfully! ✅");
  console.log("Resume saved:", resumeKey);
}

function loadSavedResume() {
  const auth = window.firebaseAuth;
  const user = auth?.currentUser;

  if (!user) {
    alert("Please login first!");
    return;
  }

  const resumeKey = `ziyoai_resume_${user.uid}`;
  const saved = localStorage.getItem(resumeKey);

  if (saved) {
    resumeData = JSON.parse(saved);
    populateResumeForm();
    alert("Resume loaded! ✅");
  } else {
    alert("No saved resume found.");
  }
}

function populateResumeForm() {
  document.getElementById("resumeFullName").value = resumeData.personal.fullName || "";
  document.getElementById("resumeJobTitle").value = resumeData.personal.jobTitle || "";
  document.getElementById("resumeEmail").value = resumeData.personal.email || "";
  document.getElementById("resumePhone").value = resumeData.personal.phone || "";
  document.getElementById("resumeLocation").value = resumeData.personal.location || "";
  document.getElementById("resumeLinkedin").value = resumeData.personal.linkedin || "";
  document.getElementById("resumeGithub").value = resumeData.personal.github || "";
  document.getElementById("resumeSummary").value = resumeData.summary || "";

  if (resumeData.personal.photo) {
    const preview = document.getElementById("resumePhotoPreview");
    if (preview) {
      preview.src = resumeData.personal.photo;
      preview.style.display = "block";
    }
  }

  // Clear containers first
  document.getElementById("resumeExperienceContainer").innerHTML = "";
  document.getElementById("resumeEducationContainer").innerHTML = "";
  document.getElementById("resumeSkillsContainer").innerHTML = "";
  document.getElementById("resumeLanguagesContainer").innerHTML = "";
  document.getElementById("resumeProjectsContainer").innerHTML = "";

  // Add saved data
  resumeData.experience.forEach(() => addResumeExperience());
  resumeData.education.forEach(() => addResumeEducation());
  resumeData.skills.forEach(() => addResumeSkill());
  resumeData.languages.forEach(() => addResumeLanguage());
  resumeData.projects.forEach(() => addResumeProject());

  updateResumePreview();
}

function clearResume() {
  if (confirm("Are you sure you want to clear all data?")) {
    resumeData = {
      personal: { fullName: "", jobTitle: "", email: "", phone: "", location: "", linkedin: "", github: "", photo: "" },
      summary: "",
      experience: [],
      education: [],
      skills: [],
      languages: [],
      projects: [],
    };
    
    document.getElementById("resumeExperienceContainer").innerHTML = "";
    document.getElementById("resumeEducationContainer").innerHTML = "";
    document.getElementById("resumeSkillsContainer").innerHTML = "";
    document.getElementById("resumeLanguagesContainer").innerHTML = "";
    document.getElementById("resumeProjectsContainer").innerHTML = "";
    
    document.querySelectorAll('#article-content input, #article-content textarea').forEach(el => el.value = '');
    
    updateResumePreview();
  }
}

// ============================================
// PDF DOWNLOAD
// ============================================
function downloadResumePDF() {
  if (typeof html2pdf === 'undefined') {
    alert('PDF library not loaded. Please refresh the page.');
    return;
  }
  
  const element = document.getElementById("resumePreview");
  const opt = {
    margin: 10,
    filename: `Resume_${resumeData.personal.fullName || "MyResume"}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  html2pdf().set(opt).from(element).save();
}

// Track tool usage
if (typeof window.trackToolUsage === "function") {
  window.trackToolUsage("resume");
}

// Make functions global
window.addResumeExperience = addResumeExperience;
window.addResumeEducation = addResumeEducation;
window.addResumeSkill = addResumeSkill;
window.addResumeLanguage = addResumeLanguage;
window.addResumeProject = addResumeProject;
window.removeResumeExperience = removeResumeExperience;
window.removeResumeEducation = removeResumeEducation;
window.removeResumeSkill = removeResumeSkill;
window.removeResumeLanguage = removeResumeLanguage;
window.removeResumeProject = removeResumeProject;
window.enhanceResumeWithAI = enhanceResumeWithAI;
window.saveResume = saveResume;
window.loadSavedResume = loadSavedResume;
window.clearResume = clearResume;
window.downloadResumePDF = downloadResumePDF;
window.togglePreview = togglePreview;

console.log('✅ Resume Builder script loaded');