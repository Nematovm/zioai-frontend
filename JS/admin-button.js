// ============================================
// 👨‍💼 ADMIN PANEL BUTTON - MODULAR SDK
// ============================================

(function() {
  'use strict';
  
  const ADMIN_CONFIG = {
    ADMIN_UIDS: ['HYin7lK9AEZNHBnd8zbFVKp2Wc43'],
    POSITION: { bottom: '20px', left: '20px' },
    STYLE: {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      hoverBackground: 'linear-gradient(135deg, #dc2626, #b91c1c)'
    },
    MAX_RETRIES: 15,
    RETRY_DELAY: 1000
  };
  
  let retryCount = 0;
  let paymentListener = null;
  
  // ============================================
  // CHECK ADMIN ACCESS
  // ============================================
  
  function checkAdminAccess() {
    const auth = window.firebaseAuth;
    
    if (!auth) {
      retryCount++;
      if (retryCount < ADMIN_CONFIG.MAX_RETRIES) {
        console.warn(`⚠️ [${retryCount}/${ADMIN_CONFIG.MAX_RETRIES}] Waiting for Firebase Auth...`);
        setTimeout(checkAdminAccess, ADMIN_CONFIG.RETRY_DELAY);
      } else {
        console.error('❌ Firebase Auth not loaded after 15 attempts');
      }
      return;
    }
    
    console.log('✅ Firebase Auth detected');
    
    auth.onAuthStateChanged((user) => {
      if (user) {
        const isAdmin = ADMIN_CONFIG.ADMIN_UIDS.includes(user.uid);
        
        if (isAdmin) {
          console.log('👨‍💼 Admin user detected:', user.email);
          console.log('🆔 Admin UID:', user.uid);
          createAdminButton();
          startListeningForPayments();
        } else {
          console.log('👤 Regular user:', user.email);
        }
      }
    });
  }
  
  // ============================================
  // LISTEN FOR PAYMENTS (MODULAR SDK)
  // ============================================
  
  function startListeningForPayments() {
    const db = window.firebaseDatabase;
    
    if (!db) {
      retryCount++;
      if (retryCount < ADMIN_CONFIG.MAX_RETRIES) {
        console.warn(`⚠️ [${retryCount}/${ADMIN_CONFIG.MAX_RETRIES}] Waiting for Firebase Database...`);
        setTimeout(startListeningForPayments, ADMIN_CONFIG.RETRY_DELAY);
      } else {
        console.error('❌ Firebase Database not loaded after 15 attempts');
        console.error('💡 Check if databaseURL is set in Firebase config');
      }
      return;
    }
    
    console.log('✅ Firebase Database detected');
    
    try {
      // Stop previous listener
      if (paymentListener) {
        paymentListener();
      }
      
      // Create query reference
      const paymentsRef = window.firebaseRef(db, 'payment_attempts');
      const pendingQuery = window.firebaseQuery(
        paymentsRef,
        window.firebaseOrderByChild('status'),
        window.firebaseEqualTo('pending')
      );
      
      // Listen for changes
      paymentListener = window.firebaseOnValue(pendingQuery, 
        (snapshot) => {
          const count = snapshot.size;
          updateNotificationBadge(count);
          
          if (count > 0) {
            console.log(`🔔 ${count} pending payment(s)`);
          }
        },
        (error) => {
          console.error('❌ Payment listener error:', error);
          console.error('💡 Check Firebase Database Rules!');
          console.error('💡 Rules should allow read access to payment_attempts for admins');
        }
      );
      
      console.log('✅ Payment listener started');
      
    } catch (error) {
      console.error('❌ Error setting up listener:', error);
    }
  }
  
  // ============================================
  // CREATE ADMIN BUTTON
  // ============================================
  
  function createAdminButton() {
    if (document.getElementById('adminPanelButton')) {
      console.log('ℹ️ Admin button already exists');
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
      <span id="adminNotificationBadge" style="display: none; position: absolute; top: -8px; right: -8px; background: #fbbf24; color: #1f2937; width: 24px; height: 24px; border-radius: 50%; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; animation: pulse 2s infinite;">0</span>
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
  // UPDATE BADGE
  // ============================================
  
  function updateNotificationBadge(count) {
    const badge = document.getElementById('adminNotificationBadge');
    if (!badge) return;
    
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'flex';
      
      if (window.lastNotificationCount !== count) {
        console.log(`🔔 ${count} pending payment(s)`);
        window.lastNotificationCount = count;
        
        // Desktop notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Yangi to\'lov so\'rovi', {
            body: `${count} ta yangi to'lov kutilmoqda`,
            icon: '/favicon.ico'
          });
        }
      }
    } else {
      badge.style.display = 'none';
    }
  }
  
  // ============================================
  // OPEN PANEL
  // ============================================
  
  function openAdminPanelWithCheck() {
    if (typeof window.openAdminPanel === 'function') {
      console.log('📊 Opening admin panel...');
      window.openAdminPanel();
    } else {
      console.error('❌ openAdminPanel function not found!');
      alert('Admin panel funksiyasi topilmadi. subscription.js yuklanganini tekshiring.');
    }
  }
  
  // ============================================
  // ANIMATIONS
  // ============================================
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInFromLeft {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
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
  // INITIALIZE
  // ============================================
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAdminAccess);
  } else {
    checkAdminAccess();
  }
  
  console.log('✅ Admin button script (Modular SDK) loaded');
  
})();

// ============================================
// HELPERS
// ============================================

function getMyUID() {
  const user = window.firebaseAuth?.currentUser;
  if (user) {
    console.log('👤 Your UID:', user.uid);
    console.log('📧 Your email:', user.email);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(user.uid);
      console.log('✅ UID copied!');
    }
    return user.uid;
  } else {
    console.error('❌ Not logged in');
    return null;
  }
}

function debugFirebase() {
  console.log('=== 🔥 FIREBASE DEBUG ===');
  console.log('Auth:', window.firebaseAuth ? '✅' : '❌');
  console.log('Database:', window.firebaseDatabase ? '✅' : '❌');
  console.log('Current User:', window.firebaseAuth?.currentUser?.email || '❌');
  
  if (window.firebaseDatabase) {
    const connectedRef = window.firebaseRef(window.firebaseDatabase, '.info/connected');
    window.firebaseOnValue(connectedRef, (snapshot) => {
      console.log('DB Connected:', snapshot.val() ? '✅' : '❌');
    });
  }
  console.log('======================');
}

window.getMyUID = getMyUID;
window.debugFirebase = debugFirebase;

console.log('💡 Run "getMyUID()" to get your UID');
console.log('💡 Run "debugFirebase()" to check connection');