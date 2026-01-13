// ============================================
// TOUR CONFIGURATION
// ============================================

const tourSteps = [
  {
    target: '.sidebar',
    position: { top: '50%', left: '300px', transform: 'translateY(-50%)' },
    icon: '👋',
    title: 'Welcome to ZiyoAI!',
    description: 'Keling, platformamizning asosiy funksiyalari bilan tanishib chiqamiz. This quick tour will help you get started!',
    features: [
      'AI-powered learning tools',
      'Personalized study assistance',
      'Track your progress',
      'Available in 3 languages'
    ]
  },
  {
    target: '[data-tool="homework"]',
    position: { top: '200px', left: '300px' },
    icon: '📚',
    title: 'Homework Fixer',
    description: 'Upload yoki paste qiling homework/task\'ingizni - AI detailed solution va explanation beradi!',
    features: [
      '🪙 Cost: 2 coins per use',
      '📝 Text or image upload',
      '✍️ Step-by-step solutions',
      '🌐 Works in Uzbek, Russian, English'
    ]
  },
  {
    target: '[data-tool="grammar"]',
    position: { top: '250px', left: '300px' },
    icon: '✍️',
    title: 'Writing Checker',
    description: 'IELTS writing yoki essay yuboring - AI band score va detailed feedback beradi!',
    features: [
      '🪙 Cost: 3 coins per check',
      '📊 Task 1 & Task 2 support',
      '⭐ Band score estimation',
      '💡 Improvement suggestions'
    ]
  },
  {
    target: '[data-tool="quiz"]',
    position: { top: '300px', left: '300px' },
    icon: '📝',
    title: 'Quiz Generator',
    description: 'Article yoki matn kiriting - AI interactive quiz yaratadi!',
    features: [
      '🪙 Cost: 2 coins per quiz',
      '🎯 1-10 questions',
      '⚡ Easy, Medium, Hard levels',
      '📊 Instant feedback'
    ]
  },
  {
    target: '.coin-display',
    position: { top: '80px', right: '300px' },
    icon: '🪙',
    title: 'Coin System',
    description: 'Har bir tool coins ishlaydi. Click qiling buy more coins or upgrade your plan!',
    features: [
      '🎁 5 free coins on signup',
      '⏰ Daily bonuses available',
      '💎 PRO users get unlimited coins',
      '🛍️ Buy coins anytime'
    ]
  },
  {
    target: '[data-tool="profile"]',
    position: { bottom: '150px', left: '300px' },
    icon: '👤',
    title: 'Your Profile',
    description: 'Profile settings, subscription management, va transaction history - hammasi shu yerda!',
    features: [
      '⚙️ Account settings',
      '💳 Billing & coins',
      '🌙 Dark mode toggle',
      '📊 Usage statistics'
    ]
  },
  {
    target: '.header-section',
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    icon: '🎉',
    title: 'You\'re All Set!',
    description: 'Endi siz ZiyoAI\'dan to\'liq foydalanishga tayyorsiz! Select any tool from the sidebar to get started.',
    features: [
      '💡 Start with Homework Fixer',
      '🎯 Check your writing skills',
      '📚 Generate quizzes to practice',
      '🚀 Track your learning progress'
    ]
  }
];

let currentStep = 0;
let tourActive = false;

// ============================================
// TOUR INITIALIZATION
// ============================================

function initTour() {
  // Check if required elements exist
  const overlay = document.getElementById('tourOverlay');
  const card = document.getElementById('tourCard');
  
  if (!overlay || !card) {
    console.warn('⚠️ Tour elements not found, retrying...');
    setTimeout(initTour, 500);
    return;
  }
  
  // Check if user has completed tour before
  const tourCompleted = localStorage.getItem('ziyoai_tour_completed');
  
  // For testing: comment out to always show tour
  if (tourCompleted === 'true') {
    console.log('✅ Tour already completed (run resetTour() to see again)');
    return;
  }
  
  // Wait for page to fully load
  setTimeout(() => {
    startTour();
  }, 2000);
}

function startTour() {
  const overlay = document.getElementById('tourOverlay');
  const card = document.getElementById('tourCard');
  
  if (!overlay || !card) {
    console.error('❌ Tour elements not found!');
    return;
  }
  
  tourActive = true;
  currentStep = 0;
  
  overlay.classList.add('active');
  card.classList.add('active');
  
  showTourStep(currentStep);
  
  console.log('🎯 Tour started');
}

// ============================================
// SHOW TOUR STEP
// ============================================

function showTourStep(stepIndex) {
  const step = tourSteps[stepIndex];
  
  // Get all elements with safety checks
  const stepCounter = document.getElementById('tourStepCounter');
  const icon = document.getElementById('tourIcon');
  const title = document.getElementById('tourTitle');
  const description = document.getElementById('tourDescription');
  const featuresContainer = document.getElementById('tourFeatures');
  const prevBtn = document.getElementById('tourPrevBtn');
  const nextBtn = document.getElementById('tourNextBtn');
  const finishBtn = document.getElementById('tourFinishBtn');
  
  // Safety check
  if (!stepCounter || !icon || !title || !description) {
    console.error('❌ Tour elements not found!');
    return;
  }
  
  // Update counter
  stepCounter.textContent = `${stepIndex + 1} / ${tourSteps.length}`;
  
  // Update content
  icon.textContent = step.icon;
  title.textContent = step.title;
  description.textContent = step.description;
  
  // Update features
  if (featuresContainer) {
    if (step.features && step.features.length > 0) {
      featuresContainer.style.display = 'block';
      featuresContainer.innerHTML = step.features.map(feature => `
        <div class="tour-feature">
          <i class="bi bi-check-circle-fill"></i>
          <span>${feature}</span>
        </div>
      `).join('');
    } else {
      featuresContainer.style.display = 'none';
    }
  }
  
  // Update progress dots
  const dots = document.querySelectorAll('.tour-dot');
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === stepIndex);
  });
  
  // Update buttons
  if (prevBtn) prevBtn.style.display = stepIndex > 0 ? 'flex' : 'none';
  
  if (stepIndex === tourSteps.length - 1) {
    if (nextBtn) nextBtn.style.display = 'none';
    if (finishBtn) finishBtn.style.display = 'flex';
  } else {
    if (nextBtn) nextBtn.style.display = 'flex';
    if (finishBtn) finishBtn.style.display = 'none';
  }
  
  // Update spotlight
  updateSpotlight(step.target);
  
  // Update card position
  updateCardPosition(step.position);
  
  console.log(`✅ Tour step ${stepIndex + 1}/${tourSteps.length} shown`);
}

// ============================================
// UPDATE SPOTLIGHT
// ============================================

function updateSpotlight(targetSelector) {
  const spotlight = document.getElementById('tourSpotlight');
  if (!spotlight) return;
  
  const target = document.querySelector(targetSelector);
  
  if (target) {
    const rect = target.getBoundingClientRect();
    
    spotlight.style.display = 'block';
    spotlight.style.top = `${rect.top - 10}px`;
    spotlight.style.left = `${rect.left - 10}px`;
    spotlight.style.width = `${rect.width + 20}px`;
    spotlight.style.height = `${rect.height + 20}px`;
  } else {
    console.warn(`⚠️ Target not found: ${targetSelector}`);
    spotlight.style.display = 'none';
  }
}

// ============================================
// UPDATE CARD POSITION
// ============================================

function updateCardPosition(position) {
  const card = document.getElementById('tourCard');
  if (!card) return;
  
  // Reset all positions
  card.style.top = '';
  card.style.bottom = '';
  card.style.left = '';
  card.style.right = '';
  card.style.transform = '';
  
  // Apply new position
  if (position) {
    Object.keys(position).forEach(key => {
      card.style[key] = position[key];
    });
  }
}

// ============================================
// NAVIGATION FUNCTIONS
// ============================================

function nextTourStep() {
  if (currentStep < tourSteps.length - 1) {
    currentStep++;
    showTourStep(currentStep);
  }
}

function prevTourStep() {
  if (currentStep > 0) {
    currentStep--;
    showTourStep(currentStep);
  }
}

function skipTour() {
  if (confirm('Are you sure you want to skip the tour? You can always restart it from Settings.')) {
    finishTour();
  }
}

function finishTour() {
  tourActive = false;
  
  // Hide elements
  document.getElementById('tourOverlay').classList.remove('active');
  document.getElementById('tourCard').classList.remove('active');
  
  // Mark tour as completed
  localStorage.setItem('ziyoai_tour_completed', 'true');
  
  // Show success message
  showNotification('🎉 Tour completed! You can now explore ZiyoAI.', 'success');
  
  console.log('✅ Tour finished');
}

// ============================================
// RESET TOUR (for testing)
// ============================================

function resetTour() {
  localStorage.removeItem('ziyoai_tour_completed');
  console.log('🔄 Tour reset - refresh page to see it again');
}

// ============================================
// SIMPLE NOTIFICATION (if not exists)
// ============================================

function showNotification(message, type = 'info') {
  // Check if window.showNotification exists
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, type);
    return;
  }
  
  // Fallback: simple alert
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    z-index: 10001;
    font-weight: 600;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

// Method 1: DOMContentLoaded (most reliable)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM loaded, initializing tour...');
    initTour();
  });
} else {
  // DOM already loaded
  console.log('✅ DOM already loaded, initializing tour...');
  initTour();
}

// Method 2: Backup - window load event
window.addEventListener('load', () => {
  console.log('✅ Window fully loaded');
  // Check if tour was already started
  if (!tourActive) {
    setTimeout(initTour, 1000);
  }
});

// ============================================
// WINDOW RESIZE HANDLER
// ============================================

window.addEventListener('resize', () => {
  if (tourActive) {
    showTourStep(currentStep);
  }
});

// ============================================
// GLOBAL EXPORTS
// ============================================

window.startTour = startTour;
window.resetTour = resetTour;
window.nextTourStep = nextTourStep;
window.prevTourStep = prevTourStep;
window.skipTour = skipTour;
window.finishTour = finishTour;

console.log('✅ Onboarding tour system loaded!');
console.log('💡 Run resetTour() in console to test again');