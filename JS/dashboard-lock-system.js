// ============================================
// DASHBOARD LOCK SYSTEM - SILENT VERSION ✅
// NO CONSOLE SPAM, NO TOOL SWITCHING INTERFERENCE
// ============================================

// ADMIN PASSWORD
const ADMIN_PASSWORD = "unlock2025";

// Dashboard lock configuration
const DASHBOARD_LOCK = {
  locked: true,
  requiredLevel: 5,
  requiredPoints: 1000,
  unlockMessage: 'Reach Level 5 or earn 1000 points to unlock Dashboard'
};

// ✅ PREVENT CONSOLE SPAM
let lastLockState = null;
let hasLoggedInitialState = false;

// ============================================
// GET USER STATS (LOCAL COPY)
// ============================================
function getUserStatsForLock() {
  try {
    const stats = JSON.parse(localStorage.getItem('ziyoai_stats_v2') || '{}');
    const points = (stats.homeworkCompleted || 0) * 100 + 
                   (stats.quizzesTaken || 0) * 50 + 
                   (stats.totalPomodoros || 0) * 25;
    const level = Math.floor(points / 500) + 1;
    
    return { level, points };
  } catch (error) {
    console.error('❌ Error getting stats:', error);
    return { level: 1, points: 0 };
  }
}

// ============================================
// CHECK IF DASHBOARD IS UNLOCKED
// ============================================
function isDashboardUnlocked() {
  // Admin force unlock
  if (localStorage.getItem('ziyoai_dashboard_force_unlock') === 'true') {
    return true;
  }
  
  if (!DASHBOARD_LOCK.locked) {
    return true;
  }
  
  const { level, points } = getUserStatsForLock();
  
  return level >= DASHBOARD_LOCK.requiredLevel || points >= DASHBOARD_LOCK.requiredPoints;
}

// ============================================
// ADMIN UNLOCK FUNCTION
// ============================================
function unlockDashboardWithPassword() {
  const password = prompt("🔐 Dashboard ni ochish uchun parol kiriting:");
  
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem('ziyoai_dashboard_force_unlock', 'true');
    alert("✅ Dashboard muvaffaqiyatli ochildi!");
    location.reload();
  } else {
    alert("❌ Parol noto'g'ri!");
  }
}

// Make it globally accessible
window.unlockDashboardWithPassword = unlockDashboardWithPassword;

// ============================================
// APPLY DASHBOARD LOCK - SILENT VERSION ✅
// ============================================
function applyDashboardLock() {
  const dashboardNavItem = document.querySelector('.nav-link[data-tool="dashboard"]');
  
  if (!dashboardNavItem) {
    if (!hasLoggedInitialState) {
      console.warn('⚠️ Dashboard nav item not found, retrying...');
    }
    return false;
  }
  
  const isUnlocked = isDashboardUnlocked();
  
  // ✅ ONLY LOG IF STATE CHANGED
  if (lastLockState !== isUnlocked) {
    console.log('🔐 Dashboard lock status changed:', { 
      isUnlocked, 
      previousState: lastLockState,
      stats: getUserStatsForLock() 
    });
    lastLockState = isUnlocked;
  }
  
  if (!isUnlocked) {
    // ✅ ONLY APPLY STYLES IF NOT ALREADY APPLIED
    if (!dashboardNavItem.classList.contains('dashboard-locked')) {
      dashboardNavItem.classList.add('dashboard-locked');
      dashboardNavItem.classList.remove('active');
      
      const parentLi = dashboardNavItem.closest('.nav-item');
      if (parentLi) {
        parentLi.style.opacity = '0.5';
        parentLi.style.cursor = 'not-allowed';
      }
      
      if (!dashboardNavItem.querySelector('.lock-icon')) {
        const lockIcon = document.createElement('i');
        lockIcon.className = 'bi bi-lock-fill lock-icon';
        lockIcon.style.cssText = `
          margin-left: auto;
          color: #9ca3af;
          font-size: 16px;
          flex-shrink: 0;
        `;
        dashboardNavItem.appendChild(lockIcon);
      }
      
      dashboardNavItem.style.opacity = '0.6';
      dashboardNavItem.style.cursor = 'not-allowed';
      dashboardNavItem.style.pointerEvents = 'none';
      dashboardNavItem.style.background = 'transparent';
      
      // ✅ ONLY LOG ONCE
      if (!hasLoggedInitialState) {
        console.log('🔒 Dashboard locked successfully');
        hasLoggedInitialState = true;
      }
    }
    
    // ✅ CHECK IF DASHBOARD IS VISIBLE - ONLY SWITCH ONCE
    const dashboardContent = document.getElementById('dashboard-content');
    if (dashboardContent && dashboardContent.classList.contains('active')) {
      console.log('⚠️ Dashboard is visible but should be locked - switching to homework');
      
      // Switch to homework WITHOUT triggering tool switch logs
      const homeworkContent = document.getElementById('homework-content');
      const homeworkNav = document.querySelector('.nav-link[data-tool="homework"]');
      
      if (dashboardContent) {
        dashboardContent.classList.remove('active');
        dashboardContent.style.display = 'none';
      }
      
      if (homeworkContent) {
        homeworkContent.classList.add('active');
        homeworkContent.style.display = 'block';
      }
      
      if (homeworkNav) {
        document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
        homeworkNav.classList.add('active');
      }
      
      // Update current tool silently
      window.currentActiveTool = 'homework';
      
      // Update header
      const headerTitle = document.getElementById('headerTitle');
      if (headerTitle) {
        headerTitle.textContent = 'Homework Fixer';
      }
      const headerSubtitle = document.getElementById('headerSubtitle');
      if (headerSubtitle) {
        headerSubtitle.textContent = 'Paste your homework and get instant corrections';
      }
    }
    
  } else {
    // ✅ UNLOCK ONLY IF CURRENTLY LOCKED
    if (dashboardNavItem.classList.contains('dashboard-locked')) {
      dashboardNavItem.classList.remove('dashboard-locked');
      const lockIcon = dashboardNavItem.querySelector('.lock-icon');
      if (lockIcon) lockIcon.remove();
      
      const parentLi = dashboardNavItem.closest('.nav-item');
      if (parentLi) {
        parentLi.style.opacity = '1';
        parentLi.style.cursor = 'pointer';
      }
      
      dashboardNavItem.style.opacity = '1';
      dashboardNavItem.style.cursor = 'pointer';
      dashboardNavItem.style.pointerEvents = 'auto';
      dashboardNavItem.style.background = '';
      
      console.log('✅ Dashboard unlocked');
      
      // Show unlock notification (only once)
      const hasShownUnlock = localStorage.getItem('ziyoai_dashboard_unlocked');
      if (!hasShownUnlock) {
        showDashboardUnlockNotification();
        localStorage.setItem('ziyoai_dashboard_unlocked', 'true');
      }
    }
  }
  
  return true;
}

// ============================================
// INTERCEPT DASHBOARD CLICKS
// ============================================
function interceptDashboardClick() {
  const dashboardNavItem = document.querySelector('.nav-link[data-tool="dashboard"]');
  
  if (!dashboardNavItem) {
    console.warn('⚠️ Dashboard nav item not found for click interception');
    return;
  }
  
  // Remove existing listener if any
  const newNavItem = dashboardNavItem.cloneNode(true);
  dashboardNavItem.parentNode.replaceChild(newNavItem, dashboardNavItem);
  
  newNavItem.addEventListener('click', function(e) {
    if (!isDashboardUnlocked()) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      showLockedDashboardModal();
      console.log('🚫 Dashboard click blocked - showing modal');
    }
  }, true);
  
  console.log('✅ Dashboard click interceptor installed');
}

// ============================================
// SHOW LOCKED MODAL
// ============================================
function showLockedDashboardModal() {
  const { level, points } = getUserStatsForLock();
  
  const modal = document.createElement('div');
  modal.className = 'locked-dashboard-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100000;
    animation: fadeIn 0.3s ease;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 450px;
      width: 90%;
      text-align: center;
      animation: slideUp 0.3s ease;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    ">
      <div style="
        width: 100px;
        height: 100px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 25px;
        font-size: 50px;
      ">
        🔒
      </div>
      
      <h2 style="
        color: #1f2937;
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 15px;
      ">Dashboard Locked</h2>
      
      <p style="
        color: #6b7280;
        font-size: 16px;
        line-height: 1.6;
        margin-bottom: 25px;
      ">${DASHBOARD_LOCK.unlockMessage}</p>
      
      <div style="
        background: #f9fafb;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 25px;
      ">
        <div style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        ">
          <div>
            <div style="color: #9ca3af; font-size: 12px; margin-bottom: 5px;">Your Level</div>
            <div style="color: #1f2937; font-size: 24px; font-weight: 700;">${level}</div>
            <div style="color: #9ca3af; font-size: 11px;">Need Level ${DASHBOARD_LOCK.requiredLevel}</div>
          </div>
          <div>
            <div style="color: #9ca3af; font-size: 12px; margin-bottom: 5px;">Your Points</div>
            <div style="color: #1f2937; font-size: 24px; font-weight: 700;">${points}</div>
            <div style="color: #9ca3af; font-size: 11px;">Need ${DASHBOARD_LOCK.requiredPoints} points</div>
          </div>
        </div>
        
        <div style="margin-top: 15px;">
          <div style="
            background: #e5e7eb;
            height: 8px;
            border-radius: 10px;
            overflow: hidden;
          ">
            <div style="
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              height: 100%;
              width: ${Math.min((points / DASHBOARD_LOCK.requiredPoints) * 100, 100)}%;
              transition: width 0.5s ease;
            "></div>
          </div>
          <div style="
            color: #6b7280;
            font-size: 12px;
            margin-top: 8px;
          ">${Math.max(0, DASHBOARD_LOCK.requiredPoints - points)} more points needed</div>
        </div>
      </div>
      
      <button onclick="this.closest('.locked-dashboard-modal').remove()" style="
        width: 100%;
        padding: 15px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
        <i class="bi bi-check-circle"></i> Got it
      </button>
      
      <p style="
        color: #9ca3af;
        font-size: 13px;
        margin-top: 20px;
        line-height: 1.5;
      ">💡 Complete homework, take quizzes, and use other tools to earn points and unlock the Dashboard!</p>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// ============================================
// UNLOCK NOTIFICATION
// ============================================
function showDashboardUnlockNotification() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 20px 25px;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(16, 185, 129, 0.4);
    z-index: 100001;
    display: flex;
    align-items: center;
    gap: 15px;
    animation: slideIn 0.5s ease;
    max-width: 400px;
  `;
  
  notification.innerHTML = `
    <div style="
      background: rgba(255,255,255,0.2);
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      flex-shrink: 0;
    ">🎉</div>
    <div style="flex: 1;">
      <div style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">Dashboard Unlocked!</div>
      <div style="font-size: 14px; opacity: 0.95;">You can now view your progress!</div>
    </div>
    <button onclick="this.closest('div').remove()" style="
      background: rgba(255,255,255,0.2);
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      color: white;
      font-size: 18px;
    ">×</button>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.5s ease';
    setTimeout(() => notification.remove(), 500);
  }, 5000);
}

// ============================================
// CSS ANIMATIONS
// ============================================
const lockSystemStyle = document.createElement('style');
lockSystemStyle.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
  
  .dashboard-locked {
    pointer-events: none !important;
  }
`;
document.head.appendChild(lockSystemStyle);

// ============================================
// CHECK FOR UNLOCK - SMART VERSION ✅
// ============================================
function checkDashboardUnlock() {
  const currentUnlockState = isDashboardUnlocked();
  
  // ✅ ONLY APPLY IF STATE CHANGED
  if (lastLockState !== currentUnlockState) {
    applyDashboardLock();
  }
}

// ============================================
// INITIALIZE
// ============================================
function initDashboardLock() {
  console.log('🔒 Initializing Dashboard Lock System...');
  
  const success = applyDashboardLock();
  
  if (success) {
    interceptDashboardClick();
    
    // Monitor stats changes - SILENT VERSION
    const originalIncrementStat = window.incrementStat;
    if (originalIncrementStat) {
      window.incrementStat = function(...args) {
        originalIncrementStat(...args);
        // Check silently after 200ms
        setTimeout(checkDashboardUnlock, 200);
      };
    }
    
    // ✅ CHECK EVERY 10 SECONDS (not 5) - LESS FREQUENT
    setInterval(checkDashboardUnlock, 10000);
    
    console.log('✅ Dashboard Lock System Initialized');
  } else {
    setTimeout(initDashboardLock, 500);
  }
}

// ============================================
// START WITH DELAY
// ============================================
function startDashboardLockSystem() {
  if (document.querySelector('.nav-link[data-tool="dashboard"]')) {
    initDashboardLock();
  } else {
    setTimeout(startDashboardLockSystem, 200);
  }
}

// ============================================
// RUN ON LOAD
// ============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(startDashboardLockSystem, 500);
  });
} else {
  setTimeout(startDashboardLockSystem, 500);
}

// Export functions
window.applyDashboardLock = applyDashboardLock;
window.isDashboardUnlocked = isDashboardUnlocked;
window.DASHBOARD_LOCK = DASHBOARD_LOCK;

console.log('📦 Dashboard Lock System Loaded (Silent Mode)');