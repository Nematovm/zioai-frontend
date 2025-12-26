// ============================================
// 👨‍💼 ADMIN PANEL BUTTON - FIXED VERSION
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
    MAX_RETRIES: 20,
    RETRY_DELAY: 1000
  };
  
  let retryCount = 0;
  let paymentListener = null;
  let isAdminVerified = false;
  
  // ============================================
  // VERIFY ADMIN IN DATABASE
  // ============================================
  
  async function verifyAdminInDatabase(uid) {
    const db = window.firebaseDatabase;
    if (!db) return false;
    
    try {
      const adminRef = window.firebaseRef(db, `admins/${uid}`);
      const snapshot = await window.firebaseGet(adminRef);
      
      const isAdmin = snapshot.val() === true;
      console.log(isAdmin ? '✅ Admin verified in database' : '❌ Not admin in database');
      
      return isAdmin;
    } catch (error) {
      console.error('❌ Admin verification error:', error);
      return false;
    }
  }
  
  // ============================================
  // CHECK ADMIN ACCESS
  // ============================================
  
  function checkAdminAccess() {
    const auth = window.firebaseAuth;
    const db = window.firebaseDatabase;
    
    if (!auth || !db) {
      retryCount++;
      if (retryCount < ADMIN_CONFIG.MAX_RETRIES) {
        console.warn(`⚠️ [${retryCount}/${ADMIN_CONFIG.MAX_RETRIES}] Waiting for Firebase...`);
        setTimeout(checkAdminAccess, ADMIN_CONFIG.RETRY_DELAY);
      } else {
        console.error('❌ Firebase not loaded after max retries');
        console.error('💡 Check Firebase initialization in dashboard.html');
      }
      return;
    }
    
    console.log('✅ Firebase detected');
    
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const isInList = ADMIN_CONFIG.ADMIN_UIDS.includes(user.uid);
        
        if (isInList) {
          console.log('👨‍💼 Admin UID detected:', user.uid);
          
          // Verify in database
          isAdminVerified = await verifyAdminInDatabase(user.uid);
          
          if (isAdminVerified) {
            createAdminButton();
            startListeningForPayments();
          } else {
            console.warn('⚠️ Admin UID in list but not in database!');
            console.warn('💡 Run: initializeAdmin() in console');
            showAdminSetupButton();
          }
        } else {
          console.log('👤 Regular user:', user.email);
        }
      }
    });
  }
  
  // ============================================
  // SHOW SETUP BUTTON (if admin not in DB)
  // ============================================
  
  function showAdminSetupButton() {
    if (document.getElementById('adminSetupButton')) return;
    
    const button = document.createElement('button');
    button.id = 'adminSetupButton';
    button.innerHTML = '⚠️ Setup Admin';
    button.onclick = setupAdminInDatabase;
    
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 9998;
      padding: 15px 25px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
      animation: pulse 2s infinite;
    `;
    
    document.body.appendChild(button);
  }
  
  async function setupAdminInDatabase() {
    const db = window.firebaseDatabase;
    const auth = window.firebaseAuth;
    
    if (!db || !auth || !auth.currentUser) {
      alert('❌ Firebase not ready!');
      return;
    }
    
    try {
      // Add to admins
      const adminRef = window.firebaseRef(db, `admins/${auth.currentUser.uid}`);
      await window.firebaseSet(adminRef, true);
      
      alert('✅ Admin initialized! Refreshing page...');
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Setup error:', error);
      
      if (error.code === 'PERMISSION_DENIED') {
        alert(`❌ Permission denied!
        
Please:
1. Go to Firebase Console
2. Realtime Database > Rules
3. Temporarily set:
   "admins": { ".write": true }
4. Try again
5. Set .write back to restricted`);
      } else {
        alert('❌ Error: ' + error.message);
      }
    }
  }
  
  // ============================================
  // LISTEN FOR PAYMENTS
  // ============================================
  
  function startListeningForPayments() {
    if (!isAdminVerified) {
      console.error('❌ Cannot start listener - admin not verified');
      return;
    }
    
    const db = window.firebaseDatabase;
    if (!db) {
      console.error('❌ Database not available');
      return;
    }
    
    try {
      // Stop previous listener
      if (paymentListener) {
        paymentListener();
      }
      
      // Create query
      const paymentsRef = window.firebaseRef(db, 'payment_attempts');
      
      // Listen to all payments first
      paymentListener = window.firebaseOnValue(
        paymentsRef,
        (snapshot) => {
          let pendingCount = 0;
          
          snapshot.forEach((child) => {
            if (child.val().status === 'pending') {
              pendingCount++;
            }
          });
          
          updateNotificationBadge(pendingCount);
          
          if (pendingCount > 0) {
            console.log(`🔔 ${pendingCount} pending payment(s)`);
          }
        },
        (error) => {
          console.error('❌ Listener error:', error);
          
          if (error.code === 'PERMISSION_DENIED') {
            console.error('💡 Check:');
            console.error('   1. Admin is in /admins node');
            console.error('   2. Rules allow admin read access');
            console.error('   3. Run: debugFirebase() in console');
          }
        }
      );
      
      console.log('✅ Payment listener started');
      
    } catch (error) {
      console.error('❌ Listener setup error:', error);
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
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    
    // ADMIN PANEL BUTTON
    const adminButton = document.createElement('button');
    adminButton.id = 'adminPanelBtn';
    adminButton.onclick = openAdminPanelWithCheck;
    adminButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
        <path d="M2 17l10 5 10-5"></path>
        <path d="M2 12l10 5 10-5"></path>
      </svg>
      Admin Panel
      <span id="adminNotificationBadge" style="display: none; position: absolute; top: -8px; right: -8px; background: #fbbf24; color: #1f2937; width: 24px; height: 24px; border-radius: 50%; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; animation: pulse 2s infinite;">0</span>
    `;
    
    adminButton.style.cssText = `
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
    
    adminButton.onmouseover = () => {
      adminButton.style.background = ADMIN_CONFIG.STYLE.hoverBackground;
      adminButton.style.transform = 'translateY(-2px)';
      adminButton.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
    };
    
    adminButton.onmouseout = () => {
      adminButton.style.background = ADMIN_CONFIG.STYLE.background;
      adminButton.style.transform = 'translateY(0)';
      adminButton.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
    };
    
    buttonContainer.appendChild(adminButton);
    
    // COINS MANAGEMENT BUTTON
    const coinsButton = document.createElement('button');
    coinsButton.innerHTML = '💰 Coinlar';
    coinsButton.onclick = () => {
      if (typeof window.viewAllUsersCoins === 'function') {
        window.viewAllUsersCoins();
      } else {
        alert('viewAllUsersCoins funksiyasi topilmadi!');
        console.error('❌ viewAllUsersCoins is not defined. Is subscription.js loaded?');
      }
    };
    coinsButton.style.cssText = `
      padding: 12px 20px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    coinsButton.onmouseover = () => {
      coinsButton.style.background = 'linear-gradient(135deg, #059669, #047857)';
      coinsButton.style.transform = 'translateY(-2px)';
    };
    
    coinsButton.onmouseout = () => {
      coinsButton.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      coinsButton.style.transform = 'translateY(0)';
    };
    
    buttonContainer.appendChild(coinsButton);
    document.body.appendChild(buttonContainer);
    
    console.log('✅ Admin buttons created');
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
    if (!isAdminVerified) {
      alert('❌ Admin access not verified!');
      return;
    }
    
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
      #adminPanelButton, #adminSetupButton {
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
  
  console.log('✅ Admin button script (FIXED) loaded');
  
})();

// ============================================
// DEBUG HELPERS
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

async function debugFirebase() {
  console.log('=== 🔥 FIREBASE DEBUG ===');
  console.log('Auth:', window.firebaseAuth ? '✅' : '❌');
  console.log('Database:', window.firebaseDatabase ? '✅' : '❌');
  console.log('Current User:', window.firebaseAuth?.currentUser?.email || '❌');
  
  if (window.firebaseAuth?.currentUser) {
    const uid = window.firebaseAuth.currentUser.uid;
    console.log('UID:', uid);
    
    // Check if admin in database
    if (window.firebaseDatabase) {
      try {
        const adminRef = window.firebaseRef(window.firebaseDatabase, `admins/${uid}`);
        const snapshot = await window.firebaseGet(adminRef);
        console.log('Is Admin in DB:', snapshot.val() === true ? '✅' : '❌');
        
        // Check connection
        const connectedRef = window.firebaseRef(window.firebaseDatabase, '.info/connected');
        window.firebaseOnValue(connectedRef, (snap) => {
          console.log('DB Connected:', snap.val() ? '✅' : '❌');
        }, { onlyOnce: true });
        
        // Try to read payment_attempts
        const paymentsRef = window.firebaseRef(window.firebaseDatabase, 'payment_attempts');
        const paymentsSnap = await window.firebaseGet(paymentsRef);
        console.log('Can read payments:', '✅');
        console.log('Payments count:', paymentsSnap.size);
        
      } catch (error) {
        console.error('❌ Database check error:', error);
        console.error('Code:', error.code);
        console.error('Message:', error.message);
      }
    }
  }
  console.log('======================');
}

window.getMyUID = getMyUID;
window.debugFirebase = debugFirebase;

console.log('💡 Debug commands:');
console.log('   getMyUID() - Get your UID');
console.log('   debugFirebase() - Check all connections');