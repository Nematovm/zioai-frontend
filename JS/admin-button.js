// ============================================
// 👨‍💼 ADMIN PANEL BUTTON - FIREBASE VERSION
// ============================================

(function() {
  'use strict';
  
  // ============================================
  // 1️⃣ ADMIN CONFIG
  // ============================================
  
  const ADMIN_CONFIG = {
    ADMIN_UIDS: [
      'HYin7lK9AEZNHBnd8zbFVKp2Wc43',  // Sizning UID
    ],
    
    POSITION: {
      bottom: '20px',
      left: '20px'
    },
    
    STYLE: {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      hoverBackground: 'linear-gradient(135deg, #dc2626, #b91c1c)'
    }
  };
  
  // ============================================
  // 2️⃣ CHECK IF USER IS ADMIN
  // ============================================
  
  function checkAdminAccess() {
    const auth = window.firebaseAuth;
    
    if (!auth) {
      console.warn('⚠️ Firebase Auth not loaded yet, retrying...');
      setTimeout(checkAdminAccess, 1000);
      return;
    }
    
    auth.onAuthStateChanged((user) => {
      if (user) {
        const isAdmin = ADMIN_CONFIG.ADMIN_UIDS.includes(user.uid);
        
        if (isAdmin) {
          console.log('👨‍💼 Admin user detected:', user.email);
          createAdminButton();
          startListeningForPayments();
        } else {
          console.log('👤 Regular user:', user.email);
        }
      }
    });
  }
  
  // ============================================
  // 3️⃣ LISTEN FOR NEW PAYMENTS (FIREBASE)
  // ============================================
  
  function startListeningForPayments() {
    const db = window.firebaseDB;
    if (!db) {
      console.warn('⚠️ Firebase Database not loaded yet, retrying...');
      setTimeout(startListeningForPayments, 1000);
      return;
    }
    
    // Listen for pending payments
    db.ref('payment_attempts')
      .orderByChild('status')
      .equalTo('pending')
      .on('value', (snapshot) => {
        const count = snapshot.numChildren();
        updateNotificationBadge(count);
      });
    
    console.log('✅ Started listening for payments');
  }
  
  // ============================================
  // 4️⃣ CREATE ADMIN BUTTON
  // ============================================
  
  function createAdminButton() {
    if (document.getElementById('adminPanelButton')) {
      return;
    }
    
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'adminPanelButton';
    buttonContainer.style.cssText = `
      position: fixed;
      bottom: ${ADMIN_CONFIG.POSITION.bottom};
      left: ${ADMIN_CONFIG.POSITION.left};
      z-index: 9998;
      animation: slideInFromLeft 0.5s ease;
    `;
    
    const button = document.createElement('button');
    button.id = 'adminPanelBtn';
    button.onclick = openAdminPanelWithCheck;
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
        <path d="M2 17l10 5 10-5"></path>
        <path d="M2 12l10 5 10-5"></path>
      </svg>
      Admin Panel
      <span id="adminNotificationBadge" style="display: none; position: absolute; top: -8px; right: -8px; background: #fbbf24; color: #1f2937; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; animation: pulse 2s infinite;">0</span>
    `;
    
    button.style.cssText = `
      padding: 15px 25px;
      background: ${ADMIN_CONFIG.STYLE.background};
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      position: relative;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    button.onmouseover = () => {
      button.style.background = ADMIN_CONFIG.STYLE.hoverBackground;
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
    };
    
    button.onmouseout = () => {
      button.style.background = ADMIN_CONFIG.STYLE.background;
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
    };
    
    buttonContainer.appendChild(button);
    document.body.appendChild(buttonContainer);
    
    console.log('✅ Admin button created');
  }
  
  // ============================================
  // 5️⃣ UPDATE NOTIFICATION BADGE
  // ============================================
  
  function updateNotificationBadge(count) {
    const badge = document.getElementById('adminNotificationBadge');
    if (!badge) return;
    
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'flex';
      
      // Optional: Play notification sound
      if (window.lastNotificationCount !== count) {
        console.log(`🔔 ${count} pending payment(s)`);
        window.lastNotificationCount = count;
      }
    } else {
      badge.style.display = 'none';
    }
  }
  
  // ============================================
  // 6️⃣ OPEN ADMIN PANEL WITH CHECK
  // ============================================
  
  function openAdminPanelWithCheck() {
    if (typeof window.openAdminPanel === 'function') {
      window.openAdminPanel();
    } else {
      console.error('❌ openAdminPanel function not found!');
      alert('Admin panel funksiyasi topilmadi. Iltimos subscription.js yuklanganini tekshiring.');
    }
  }
  
  // ============================================
  // 7️⃣ ADD ANIMATIONS
  // ============================================
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInFromLeft {
      from {
        transform: translateX(-100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.1);
        opacity: 0.8;
      }
    }
    
    @media (max-width: 768px) {
      #adminPanelButton {
        bottom: 80px !important;
        left: 10px !important;
      }
      
      #adminPanelBtn {
        padding: 12px 20px !important;
        font-size: 13px !important;
      }
    }
  `;
  document.head.appendChild(style);
  
  // ============================================
  // 8️⃣ INITIALIZE
  // ============================================
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAdminAccess);
  } else {
    checkAdminAccess();
  }
  
  console.log('✅ Admin button script (Firebase) loaded');
  
})();

// ============================================
// 9️⃣ HELPER: GET YOUR UID
// ============================================

function getMyUID() {
  const user = window.firebaseAuth?.currentUser;
  if (user) {
    console.log('👤 Your Firebase UID:', user.uid);
    console.log('📧 Your email:', user.email);
    console.log('📋 Copy this UID and paste it in ADMIN_CONFIG.ADMIN_UIDS');
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(user.uid);
      console.log('✅ UID copied to clipboard!');
    }
    
    return user.uid;
  } else {
    console.error('❌ No user logged in. Please sign in first.');
    return null;
  }
}

window.getMyUID = getMyUID;
console.log('💡 Tip: Run "getMyUID()" in console to get your Firebase UID');