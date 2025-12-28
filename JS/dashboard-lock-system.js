// ============================================
// 📰 ARTICLE TOOL - ENHANCED UI MANAGER
// ============================================

// Article tool ni initialize qilish
async function initializeArticleTool() {
  console.log('📰 Initializing Article tool...');
  
  const articleNav = document.getElementById('articleNavLink');
  const articleBadge = document.getElementById('articleBadge');
  
  if (!articleNav) {
    console.warn('⚠️ Article nav link not found');
    return;
  }
  
  // Firebase auth kutish
  const auth = window.firebaseAuth;
  if (!auth) {
    console.error('❌ Firebase auth not initialized');
    return;
  }
  
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      await updateArticleAccess();
    }
  });
}

// Article access ni yangilash
async function updateArticleAccess() {
  const articleNav = document.getElementById('articleNavLink');
  const articleBadge = document.getElementById('articleBadge');
  const articleCard = document.querySelector('.tool-card[data-tool="article"]');
  
  if (!articleNav) return;
  
  // Subscription tekshirish
  const subscription = await checkUserSubscription();
  const isPro = subscription.type === 'pro';
  
  console.log('📰 Article access check:', isPro ? 'GRANTED' : 'DENIED');
  
  if (isPro) {
    // ✅ PRO USER - ochiq qilish
    articleNav.setAttribute('data-tool', 'article');
    articleNav.style.cursor = 'pointer';
    articleNav.style.opacity = '1';
    
    if (articleBadge) {
      articleBadge.textContent = 'PRO';
      articleBadge.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      articleBadge.classList.remove('free');
      articleBadge.classList.add('pro-active');
    }
    
    // Dashboard card
    if (articleCard) {
      const oldBadge = articleCard.querySelector('.pro-badge-overlay');
      if (oldBadge) oldBadge.remove();
      articleCard.style.opacity = '1';
    }
    
    // Event listener qo'shish
    articleNav.removeEventListener('click', handleArticleClick);
    articleNav.addEventListener('click', handleArticleClick);
    
    console.log('✅ Article tool unlocked for PRO user');
    
  } else {
    // 🔒 FREE USER - lock qilish
    articleNav.removeAttribute('data-tool');
    articleNav.style.cursor = 'pointer';
    articleNav.style.opacity = '0.7';
    
    if (articleBadge) {
      articleBadge.innerHTML = '<i class="bi bi-lock-fill"></i> PRO';
      articleBadge.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
      articleBadge.classList.remove('pro-active');
      articleBadge.classList.add('free');
    }
    
    // Dashboard card
    if (articleCard) {
      const oldBadge = articleCard.querySelector('.pro-badge-overlay');
      if (oldBadge) oldBadge.remove();
      
      const proBadge = document.createElement('div');
      proBadge.className = 'pro-badge-overlay';
      proBadge.style.cssText = `
        position: absolute;
        top: 12px;
        right: 12px;
        background: linear-gradient(135deg, #fbbf24, #f59e0b);
        color: white;
        padding: 5px 14px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
        z-index: 1;
        box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
      `;
      proBadge.innerHTML = '<i class="bi bi-star-fill"></i> PRO Only';
      articleCard.style.position = 'relative';
      articleCard.style.opacity = '0.8';
      articleCard.appendChild(proBadge);
    }
    
    // Event listener - show upgrade modal
    articleNav.removeEventListener('click', handleArticleLocked);
    articleNav.addEventListener('click', handleArticleLocked);
    
    console.log('🔒 Article tool locked for FREE user');
  }
}

// Article nav click handler (PRO user)
function handleArticleClick(e) {
  e.preventDefault();
  e.stopPropagation();
  
  console.log('📰 Article nav clicked (PRO user)');
  
  // Tool ni ochish
  if (typeof switchTool === 'function') {
    switchTool('article');
  }
}

// Article locked click handler (FREE user)
function handleArticleLocked(e) {
  e.preventDefault();
  e.stopPropagation();
  
  console.log('🔒 Article nav clicked (FREE user) - showing upgrade modal');
  
  showArticleUpgradeModal();
}

// Enhanced Upgrade Modal with Better UI
function showArticleUpgradeModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay-inline article-upgrade-modal';
  modal.innerHTML = `
    <div class="modal-inline article-modal-content" style="max-width: 650px; max-height: 90vh; background: white; border-radius: 24px; padding: 0; overflow-y: auto; overflow-x: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">  
      <!-- Gradient Header -->
      <div class="modal-header-gradient" style="padding: 40px 35px; background: linear-gradient(151deg, rgba(93, 156, 245, 1) 0%, rgba(44, 170, 154, 1) 60%, rgba(35, 195, 101, 1) 100%); color: white; text-align: center; position: relative;">
        <button class="modal-close-btn" onclick="closeArticleUpgradeModal()" style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.25); border: none; color: white; width: 40px; height: 40px; border-radius: 12px; cursor: pointer; font-size: 22px; display: flex; align-items: center; justify-content: center; transition: all 0.3s; backdrop-filter: blur(10px); font-weight: 300;">×</button>
        
        <div class="modal-icon-container" style="display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <div class="modal-icon-paper" style="font-size: 75px; animation: iconFloat 3s ease-in-out infinite; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.15)); margin-top: -50px;">📰</div>
        </div>
        <h2 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 800; letter-spacing: -1px; text-shadow: 0 2px 8px rgba(0,0,0,0.1);">Article Reading Tool</h2>
        <p style="margin: 0; font-size: 17px; opacity: 0.95; line-height: 1.6; max-width: 420px; margin: 0 auto;">PRO foydalanuvchilar uchun maxsus moslashtirilgan o'qish tajribasi</p>
      </div>
      
      <!-- Main Content -->
      <div style="padding: 40px 35px;">
        
        <!-- Features Grid -->
        <div style="margin-bottom: 32px;">
          <h3 style="margin: 0 0 22px 0; color: #111827; font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 24px;">✨</span>
            Article Tool Imkoniyatlari
          </h3>
          
          <div style="display: grid; gap: 14px;">
            <!-- Reading Materials -->
            <div class="feature-card" style="display: flex; align-items: start; gap: 14px; padding: 18px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 14px; border: 2px solid #86efac; transition: all 0.3s;">
              <span style="font-size: 26px; flex-shrink: 0;">📖</span>
              <div style="flex: 1;">
                <div style="color: #065f46; font-size: 15px; font-weight: 700; margin-bottom: 4px;">O'qish materiallari</div>
                <div style="color: #047857; font-size: 13px; line-height: 1.5;">IELTS, CEFR darajasiga mos professional maqolalar</div>
              </div>
            </div>
            
            <!-- Vocabulary Building -->
            <div class="feature-card" style="display: flex; align-items: start; gap: 14px; padding: 18px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 14px; border: 2px solid #fcd34d; transition: all 0.3s;">
              <span style="font-size: 26px; flex-shrink: 0;">🎯</span>
              <div style="flex: 1;">
                <div style="color: #92400e; font-size: 15px; font-weight: 700; margin-bottom: 4px;">Vocabulary Building</div>
                <div style="color: #b45309; font-size: 13px; line-height: 1.5;">Har bir maqoladan yangi so'zlarni o'rganish va eslab qolish</div>
              </div>
            </div>
            
            <!-- Comprehension Questions -->
            <div class="feature-card" style="display: flex; align-items: start; gap: 14px; padding: 18px; background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); border-radius: 14px; border: 2px solid #a5b4fc; transition: all 0.3s;">
              <span style="font-size: 26px; flex-shrink: 0;">📝</span>
              <div style="flex: 1;">
                <div style="color: #3730a3; font-size: 15px; font-weight: 700; margin-bottom: 4px;">Comprehension Questions</div>
                <div style="color: #4f46e5; font-size: 13px; line-height: 1.5;">O'qish qobiliyatini test qilish va baholash</div>
              </div>
            </div>
            
            <!-- Fresh Content -->
            <div class="feature-card" style="display: flex; align-items: start; gap: 14px; padding: 18px; background: linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%); border-radius: 14px; border: 2px solid #fda4af; transition: all 0.3s;">
              <span style="font-size: 26px; flex-shrink: 0;">⚡</span>
              <div style="flex: 1;">
                <div style="color: #9f1239; font-size: 15px; font-weight: 700; margin-bottom: 4px;">Har kuni yangi maqola</div>
                <div style="color: #e11d48; font-size: 13px; line-height: 1.5;">Turli mavzularda fresh va qiziqarli content</div>
              </div>
            </div>
            
            <!-- NEW: AI Summary & Feedback -->
            <div class="feature-card" style="display: flex; align-items: start; gap: 14px; padding: 18px; background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); border-radius: 14px; border: 2px solid #d8b4fe; transition: all 0.3s;">
              <span style="font-size: 26px; flex-shrink: 0;">🤖</span>
              <div style="flex: 1;">
                <div style="color: #6b21a8; font-size: 15px; font-weight: 700; margin-bottom: 4px;">AI Summary & Feedback</div>
                <div style="color: #9333ea; font-size: 13px; line-height: 1.5;">Maqola xulosasi yozish va AI'dan professional feedback olish</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- PRO Pricing Card -->
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 28px; border-radius: 18px; margin-bottom: 28px; border: 3px solid #fbbf24; position: relative; overflow: hidden;">
          <div style="position: absolute; top: -20px; right: -20px; font-size: 120px; opacity: 0.1;">⭐</div>
          
          <div style="text-align: center; position: relative; z-index: 1;">
            <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(146, 64, 14, 0.15); padding: 8px 18px; border-radius: 30px; margin-bottom: 16px;">
              <span style="font-size: 12px; color: #92400e; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">PRO Subscription</span>
            </div>
            
            <div style="margin-bottom: 12px;">
              <span style="font-size: 48px; font-weight: 800; color: #f59e0b; line-height: 1;">50,000</span>
              <span style="font-size: 18px; color: #92400e; font-weight: 600; margin-left: 6px;">so'm/oyiga</span>
            </div>
            
            <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 12px; margin-top: 18px; padding-top: 18px; border-top: 2px dashed rgba(146, 64, 14, 0.3);">
              <div style="display: flex; align-items: center; gap: 6px; color: #92400e; font-size: 14px; font-weight: 600; background: rgba(255, 255, 255, 0.5); padding: 6px 14px; border-radius: 20px;">
                <span>💰</span> 150 coins/day
              </div>
              <div style="display: flex; align-items: center; gap: 6px; color: #92400e; font-size: 14px; font-weight: 600; background: rgba(255, 255, 255, 0.5); padding: 6px 14px; border-radius: 20px;">
                <span>📰</span> Article tool
              </div>
              <div style="display: flex; align-items: center; gap: 6px; color: #92400e; font-size: 14px; font-weight: 600; background: rgba(255, 255, 255, 0.5); padding: 6px 14px; border-radius: 20px;">
                <span>⚡</span> Barcha toollar
              </div>
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div style="display: flex; gap: 14px;">
          <button onclick="closeArticleUpgradeModal()" class="modal-btn-secondary" style="flex: 1; padding: 18px; background: #f3f4f6; color: #6b7280; border: 2px solid #e5e7eb; border-radius: 14px; font-weight: 700; cursor: pointer; font-size: 16px; transition: all 0.3s; font-family: inherit;">
            Keyinroq
          </button>
          <button onclick="upgradeToProFromArticle()" class="modal-btn-primary" style="flex: 2; padding: 18px; background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; border: none; border-radius: 14px; font-weight: 700; cursor: pointer; font-size: 16px; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.4); font-family: inherit;">
            <span style="font-size: 20px;">⭐</span>
            <span>PRO Obuna Olish</span>
          </button>
        </div>
        
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin: 18px 0 0 0;">
          🔒 Xavfsiz to'lov • 🔄 Istalgan vaqt bekor qilish mumkin
        </p>
      </div>
    </div>
    
    <style>
      @keyframes iconFloat {
        0%, 100% { 
          transform: translateY(0) rotate(-2deg); 
        }
        50% { 
          transform: translateY(-15px) rotate(2deg); 
        }
      }
      
      .modal-icon-paper {
        position: relative;
      }
      
      .modal-icon-paper::before {
        content: '';
        position: absolute;
        inset: -10px;
        background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
        border-radius: 50%;
        animation: iconGlow 2s ease-in-out infinite;
      }
      
      @keyframes iconGlow {
        0%, 100% { opacity: 0.5; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.1); }
      }
      
      .modal-close-btn:hover {
        background: rgba(255, 255, 255, 0.35) !important;
        transform: scale(1.1) rotate(90deg);
      }
      
      .modal-close-btn:active {
        transform: scale(0.95) rotate(90deg);
      }
      
      .feature-card:hover {
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
      
      .modal-btn-secondary:hover {
        background: #e5e7eb;
        border-color: #d1d5db;
        transform: translateY(-2px);
      }
      
      .modal-btn-primary:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 30px -5px rgba(245, 158, 11, 0.5);
      }
      
      .modal-btn-secondary:active,
      .modal-btn-primary:active {
        transform: translateY(0);
      }
    </style>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
  document.body.style.overflow = 'hidden';
  
  console.log('📰 Enhanced Article upgrade modal shown');
}

function closeArticleUpgradeModal() {
  const modal = document.querySelector('.article-upgrade-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
  document.body.style.overflow = '';
}

function upgradeToProFromArticle() {
  closeArticleUpgradeModal();
  
  // Open payment modal
  if (typeof openSubscriptionPaymentModal === 'function') {
    openSubscriptionPaymentModal('PRO_SUB');
  } else {
    console.error('❌ openSubscriptionPaymentModal not found');
    alert('To\'lov tizimi topilmadi!');
  }
}

// ============================================
// EXPORTS
// ============================================
window.initializeArticleTool = initializeArticleTool;
window.updateArticleAccess = updateArticleAccess;
window.showArticleUpgradeModal = showArticleUpgradeModal;
window.closeArticleUpgradeModal = closeArticleUpgradeModal;
window.upgradeToProFromArticle = upgradeToProFromArticle;

// ============================================
// AUTO-INITIALIZE
// ============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeArticleTool);
} else {
  initializeArticleTool();
}

console.log('✅ Enhanced Article Lock Manager loaded!');
console.log('📰 Article tool with AI feedback feature ready!');
console.log('🎨 Modern UI with improved design loaded!');