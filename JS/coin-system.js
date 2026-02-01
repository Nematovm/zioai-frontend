// ============================================
// 🪙 COIN SYSTEM - FIREBASE DATABASE VERSION
// WITH AUTO DAILY COINS ✅ COMPLETELY FIXED
// ============================================

const COIN_CONFIG = {
  INITIAL_COINS: 10,
  DAILY_BONUS: 5,
  DAILY_BONUS_COOLDOWN: 24 * 60 * 60 * 1000, // 24 hours in ms
  
  TOOL_COSTS: {
    homework: 2,
    grammar: 3,
    vocabulary: 1,
    quiz: 2,
    study: 2,
    speaking: 3
  },
  
  // ✅ SUBSCRIPTION DAILY COINS
  SUBSCRIPTION_DAILY_COINS: {
    free: 5,
    standard: 20,
    pro: 50
  },
  
  COIN_PACKAGES: [
    { id: 'COINS_50', coins: 50, price: 10000, bonus: 0, popular: false },
    { id: 'COINS_100', coins: 120, price: 20000, bonus: 20, popular: true },
    { id: 'COINS_250', coins: 300, price: 45000, bonus: 50, popular: false },
    { id: 'COINS_500', coins: 400, price: 70000, bonus: 100, popular: false }
  ]
};

// ============================================
// 1️⃣ GET CURRENT USER COINS FROM FIREBASE
// ============================================
async function getUserCoins() {
  const user = window.firebaseAuth?.currentUser;
  if (!user) {
    console.warn('⚠️ No user logged in');
    return 0;
  }
  
  const db = window.firebaseDatabase;
  if (!db) {
    console.error('❌ Firebase Database not initialized');
    return 0;
  }
  
  try {
    const coinsRef = window.firebaseRef(db, `users/${user.uid}/coins`);
    const snapshot = await window.firebaseGet(coinsRef);
    const coins = snapshot.val() || 0;
    
    console.log('💰 User coins from Firebase:', coins);
    return coins;
  } catch (error) {
    console.error('❌ Error getting coins:', error);
    return 0;
  }
}

// ============================================
// 2️⃣ SET USER COINS IN FIREBASE
// ============================================
async function setUserCoins(amount) {
  const user = window.firebaseAuth?.currentUser;
  if (!user) {
    console.error('❌ No user logged in');
    return false;
  }
  
  const db = window.firebaseDatabase;
  if (!db) {
    console.error('❌ Firebase Database not initialized');
    return false;
  }
  
  try {
    const updates = {};
    updates[`users/${user.uid}/coins`] = amount;
    
    const rootRef = window.firebaseRef(db, '/');
    await window.firebaseUpdate(rootRef, updates);
    
    console.log('✅ Coins updated in Firebase:', amount);
    return true;
  } catch (error) {
    console.error('❌ Error setting coins:', error);
    return false;
  }
}

// ============================================
// 3️⃣ ADD COINS
// ============================================
async function addCoins(amount, reason = 'unknown') {
  if (amount <= 0) return false;
  
  const currentCoins = await getUserCoins();
  const newCoins = currentCoins + amount;
  
  const success = await setUserCoins(newCoins);
  
  if (success) {
    console.log(`✅ Added ${amount} coins. Total: ${newCoins}`);
    await updateCoinDisplay();
    
    // Log transaction
    await logTransaction('earn', amount, reason, newCoins);
  }
  
  return success;
}

// ============================================
// 4️⃣ SPEND COINS
// ============================================
async function spendCoins(amount, reason = 'unknown') {
  if (amount <= 0) return false;
  
  const currentCoins = await getUserCoins();
  
  if (currentCoins < amount) {
    console.warn(`⚠️ Not enough coins! Need: ${amount}, Have: ${currentCoins}`);
    return false;
  }
  
  const newCoins = currentCoins - amount;
  const success = await setUserCoins(newCoins);
  
  if (success) {
    console.log(`✅ Spent ${amount} coins. Remaining: ${newCoins}`);
    await updateCoinDisplay();
    
    // Log transaction
    await logTransaction('spend', amount, reason, newCoins);
  }
  
  return success;
}

// ============================================
// 5️⃣ LOG TRANSACTION
// ============================================
async function logTransaction(type, amount, reason, balance) {
  const user = window.firebaseAuth?.currentUser;
  if (!user) return;
  
  const db = window.firebaseDatabase;
  if (!db) return;
  
  try {
    const transactionRef = window.firebaseRef(db, `users/${user.uid}/coin_transactions`);
    const newTransactionRef = window.firebasePush(transactionRef);
    
    await window.firebaseSet(newTransactionRef, {
      type: type,
      amount: amount,
      reason: reason,
      balance: balance,
      timestamp: new Date().toISOString()
    });
    
    console.log('📝 Transaction logged:', type, amount);
  } catch (error) {
    console.error('❌ Error logging transaction:', error);
  }
}

// ============================================
// 6️⃣ UPDATE COIN DISPLAY (REAL-TIME) - FIXED ✅
// ============================================
async function updateCoinDisplay() {
  const coins = await getUserCoins();
  
  console.log('🔄 Updating ALL coin displays:', coins);
  
  const coinSelectors = [
    '#userCoins',
    '.coin-amount',
    '#profileCoinBalance',
    '[data-coin-display]'
  ];
  
  coinSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    console.log(`📍 Found ${elements.length} elements for: ${selector}`);
    
    elements.forEach(el => {
      if (el) {
        el.textContent = coins;
        
        el.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        el.style.transform = 'scale(1.15)';
        setTimeout(() => {
          el.style.transform = 'scale(1)';
        }, 300);
        
        console.log(`✅ Updated: ${selector} = ${coins}`);
      }
    });
  });
  
  console.log('✅ All coin displays updated');
  
  await updateSubscriptionDisplay();
}

// ============================================
// UPDATE SUBSCRIPTION DISPLAY
// ============================================
async function updateSubscriptionDisplay() {
  const subscription = await checkUserSubscription();
  const subType = subscription.type || 'free';
  
  const subBadges = document.querySelectorAll('[data-subscription-badge]');
  subBadges.forEach(badge => {
    if (subType === 'pro') {
      badge.textContent = 'PRO';
      badge.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
    } else if (subType === 'standard') {
      badge.textContent = 'STANDARD';
      badge.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
    } else {
      badge.textContent = 'FREE';
      badge.style.background = '#6b7280';
    }
  });
  
  const dailyCoinsInfo = document.querySelectorAll('[data-daily-coins]');
  const dailyAmount = COIN_CONFIG.SUBSCRIPTION_DAILY_COINS[subType] || 5;
  
  dailyCoinsInfo.forEach(el => {
    el.textContent = `${dailyAmount} coins/day`;
  });
  
  console.log('✅ Subscription display updated:', subType);
}

// ============================================
// 7️⃣ REAL-TIME COIN LISTENER - FIXED ✅
// ============================================
function listenToCoins() {
  const user = window.firebaseAuth?.currentUser;
  if (!user) return;
  
  const db = window.firebaseDatabase;
  if (!db) return;
  
  const coinsRef = window.firebaseRef(db, `users/${user.uid}/coins`);
  
  window.firebaseOnValue(coinsRef, (snapshot) => {
    const coins = snapshot.val() || 0;
    console.log('🔔 Coins changed in real-time:', coins);
    
    const selectors = ['#userCoins', '.coin-amount', '#profileCoinBalance', '[data-coin-display]'];
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el) {
          el.textContent = coins;
          
          el.style.transform = 'scale(1.2)';
          setTimeout(() => {
            el.style.transform = 'scale(1)';
          }, 200);
        }
      });
    });
  });
  
  console.log('✅ Real-time coin listener started');
}

// ============================================
// 8️⃣ CHECK IF USER CAN USE TOOL - FIXED ✅
// ============================================
async function canUseTool(toolName) {
  const cost = COIN_CONFIG.TOOL_COSTS[toolName] || 0;
  const coins = await getUserCoins();
  
  if (coins >= cost) {
    return { canUse: true, cost: cost, reason: 'Sufficient coins' };
  }
  
  return { canUse: false, cost: cost, reason: 'Not enough coins' };
}

// ============================================
// 9️⃣ USE TOOL - FIXED ✅
// ============================================
async function useTool(toolName) {
  const check = await canUseTool(toolName);
  
  if (!check.canUse) {
    console.error(`❌ Cannot use ${toolName}: ${check.reason}`);
    
    const currentCoins = await getUserCoins();
    if (typeof showInsufficientCoinsModal === 'function') {
      showInsufficientCoinsModal(check.cost, currentCoins);
    }
    
    return false;
  }
  
  if (check.cost > 0) {
    const success = await spendCoins(check.cost, `Used ${toolName} tool`);
    
    if (!success) {
      console.error(`❌ Failed to deduct ${check.cost} coins`);
      return false;
    }
    
    console.log(`✅ Spent ${check.cost} coins for ${toolName}`);
  }
  
  return true;
}

// ============================================
// 🔟 CHECK USER SUBSCRIPTION
// ============================================
async function checkUserSubscription() {
  const user = window.firebaseAuth?.currentUser;
  if (!user) {
    return { type: 'free', status: 'active', dailyCoins: 5 };
  }
  
  const db = window.firebaseDatabase;
  if (!db) {
    return { type: 'free', status: 'active', dailyCoins: 5 };
  }
  
  try {
    const subRef = window.firebaseRef(db, `users/${user.uid}/subscription`);
    const snapshot = await window.firebaseGet(subRef);
    
    if (!snapshot.exists()) {
      return { type: 'free', status: 'active', dailyCoins: 5 };
    }
    
    const subData = snapshot.val();
    
    if (subData.expiry && subData.expiry !== null) {
      const expiryDate = new Date(subData.expiry);
      const now = new Date();
      
      if (expiryDate < now) {
        console.log('⚠️ Subscription expired:', subData.expiry);
        return { 
          type: 'free', 
          status: 'expired', 
          expiredAt: subData.expiry,
          dailyCoins: 5 
        };
      }
    }
    
    const dailyCoins = COIN_CONFIG.SUBSCRIPTION_DAILY_COINS[subData.type] || 5;
    
    return {
      ...subData,
      dailyCoins: dailyCoins
    };
  } catch (error) {
    console.error('❌ Subscription check error:', error);
    return { type: 'free', status: 'active', dailyCoins: 5 };
  }
}

// ============================================
// 🆕 GIVE WELCOME COINS TO NEW USERS - FIXED ✅
// ============================================
async function giveWelcomeCoinsToNewUser(userId) {
  const db = window.firebaseDatabase;
  if (!db || !userId) {
    console.warn('⚠️ Database or userId not available');
    return false;
  }
  
  try {
    console.log('🎁 Checking if user needs welcome coins:', userId);
    
    // ✅ CHECK: Oldin coin olganmi?
    const welcomeCoinRef = window.firebaseRef(db, `users/${userId}/welcomeCoinReceived`);
    const welcomeSnapshot = await window.firebaseGet(welcomeCoinRef);
    
    if (welcomeSnapshot.exists() && welcomeSnapshot.val() === true) {
      console.log('⏭️ User already received welcome coins, skipping');
      return false;
    }
    
    console.log('🎉 NEW USER! Giving 10 welcome coins...');
    
    // ✅ GET CURRENT COINS
    const coinsRef = window.firebaseRef(db, `users/${userId}/coins`);
    const coinsSnapshot = await window.firebaseGet(coinsRef);
    const currentCoins = coinsSnapshot.val() || 0;
    
    console.log('💰 Current coins:', currentCoins);
    
    // ✅ GIVE 10 WELCOME COINS
    const newCoins = currentCoins + 10;
    
    const updates = {};
    updates[`users/${userId}/coins`] = newCoins;
    updates[`users/${userId}/welcomeCoinReceived`] = true;
    updates[`users/${userId}/welcomeCoinGivenAt`] = new Date().toISOString();
    
    const rootRef = window.firebaseRef(db, '/');
    await window.firebaseUpdate(rootRef, updates);
    
    console.log(`✅ Welcome coins given: ${currentCoins} → ${newCoins}`);
    
    // ✅ LOG TRANSACTION
    try {
      const transactionRef = window.firebaseRef(db, `users/${userId}/coin_transactions`);
      const newTransactionRef = window.firebasePush(transactionRef);
      
      await window.firebaseSet(newTransactionRef, {
        type: 'welcome_bonus',
        amount: 10,
        reason: '🎁 Welcome to ZiyoAI! Here are your first 10 coins',
        balance: newCoins,
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ Welcome transaction logged');
    } catch (txError) {
      console.warn('⚠️ Transaction log failed (non-critical):', txError);
    }
    
    // ✅ SHOW NOTIFICATION TO USER
    console.log('🔔 Showing welcome notification...');
    showWelcomeCoinsNotification();
    
    // ✅ UPDATE COIN DISPLAY
    if (typeof updateCoinDisplay === 'function') {
      await updateCoinDisplay();
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Welcome coins error:', error);
    return false;
  }
}

// ============================================
// 🎉 SHOW WELCOME COINS NOTIFICATION
// ============================================
function showWelcomeCoinsNotification() {
  // ✅ Remove existing notification
  const existing = document.querySelector('.welcome-coins-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = 'welcome-coins-notification';
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 40px 50px;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(16, 185, 129, 0.5);
    z-index: 10001;
    text-align: center;
    animation: bounceIn 0.6s ease;
    max-width: 450px;
  `;
  
  notification.innerHTML = `
    <div style="font-size: 80px; margin-bottom: 20px;">🎁</div>
    <h2 style="margin: 0 0 15px 0; font-size: 32px; font-weight: 800;">
      Welcome to ZiyoAI!
    </h2>
    <div style="font-size: 20px; opacity: 0.95; margin-bottom: 15px;">
      You've received <strong style="font-size: 28px;">10 coins</strong> as a welcome gift!
    </div>
    <p style="font-size: 16px; opacity: 0.9; margin-bottom: 30px;">
      Use them to try our AI tools 🚀
    </p>
    <button onclick="closeWelcomeCoinsNotification()" style="
      padding: 15px 35px;
      background: white;
      color: #10b981;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 16px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.3s;
    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
      <i class="bi bi-rocket-takeoff-fill"></i> Get Started!
    </button>
  `;
  
  document.body.appendChild(notification);
  
  // Backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop-welcome';
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;
  document.body.insertBefore(backdrop, notification);
  
  // Auto-close after 8 seconds
  setTimeout(() => {
    closeWelcomeCoinsNotification();
  }, 8000);
}

function closeWelcomeCoinsNotification() {
  const notification = document.querySelector('.welcome-coins-notification');
  const backdrop = document.querySelector('.modal-backdrop-welcome');
  
  if (notification) notification.remove();
  if (backdrop) backdrop.remove();
}

// ============================================
// 🆕 CHECK AND GIVE DAILY COINS - FIXED ✅
// ============================================
async function checkAndGiveDailyCoins() {
  const user = window.firebaseAuth?.currentUser;
  if (!user) {
    console.log('❌ No user for daily coins check');
    return;
  }
  
  const db = window.firebaseDatabase;
  if (!db) {
    console.error('❌ Database not initialized');
    return;
  }
  
  try {
    const lastDailyRef = window.firebaseRef(db, `users/${user.uid}/lastDailyCoin`);
    const snapshot = await window.firebaseGet(lastDailyRef);
    
    const now = Date.now();
    const lastDaily = snapshot.exists() ? new Date(snapshot.val()).getTime() : 0;
    const timeDiff = now - lastDaily;
    
    console.log('⏰ Daily coin check:', {
      lastDaily: lastDaily ? new Date(lastDaily).toLocaleString() : 'never',
      timeDiff: Math.round(timeDiff / 1000 / 60 / 60) + ' hours',
      cooldown: COIN_CONFIG.DAILY_BONUS_COOLDOWN / 1000 / 60 / 60 + ' hours'
    });
    
    // ✅ AGAR VAQT EMAS BOLSA - COUNTDOWN NOTIFICATION
    if (timeDiff < COIN_CONFIG.DAILY_BONUS_COOLDOWN) {
      const remainingMs = COIN_CONFIG.DAILY_BONUS_COOLDOWN - timeDiff;
      const remainingHours = Math.floor(remainingMs / 1000 / 60 / 60);
      const remainingMinutes = Math.ceil((remainingMs % (1000 * 60 * 60)) / 1000 / 60);
      
      console.log(`⏳ Next daily coins in ${remainingHours}h ${remainingMinutes}m`);
      
      // ✅ SHOW COUNTDOWN NOTIFICATION
      showDailyBonusReadyNotification(remainingHours, remainingMinutes);
      return;
    }
    
    // ✅ AGAR VAQT KELSA - CLAIMABLE NOTIFICATION
    console.log('🎁 Daily coins ready to claim!');
    
    const subscription = await checkUserSubscription();
    const subType = subscription.type || 'free';
    const coinsToGive = COIN_CONFIG.SUBSCRIPTION_DAILY_COINS[subType] || 5;
    
    console.log(`🎁 Daily coins available: ${coinsToGive} coins (${subType})`);
    
    // ✅ SHOW CLAIMABLE NOTIFICATION
    showDailyBonusClaimableNotification(coinsToGive, subType);
    
  } catch (error) {
    console.error('❌ Daily coins error:', error);
  }
}

// ============================================
// 🆕 SHOW DAILY BONUS READY NOTIFICATION ✅
// ============================================
function showDailyBonusReadyNotification(hoursRemaining, minutesRemaining) {
  const oldNotification = document.querySelector('.daily-bonus-ready-notification');
  if (oldNotification) {
    oldNotification.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = 'daily-bonus-ready-notification';
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #6b7280, #4b5563);
    color: white;
    padding: 20px 25px;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(107, 114, 128, 0.4);
    z-index: 10000;
    font-weight: 600;
    animation: slideInRight 0.5s ease;
    max-width: 350px;
    cursor: pointer;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 15px;">
      <div style="font-size: 40px;">⏰</div>
      <div style="flex: 1;">
        <div style="font-size: 16px; font-weight: 700; margin-bottom: 5px;">
          Daily Bonus Coming Soon
        </div>
        <div style="font-size: 14px; opacity: 0.95;">
          Available in ${hoursRemaining}h ${minutesRemaining}m
        </div>
      </div>
      <button onclick="this.closest('.daily-bonus-ready-notification').remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center;">×</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification && notification.parentNode) {
      notification.style.animation = 'slideOutRight 0.5s ease';
      setTimeout(() => notification.remove(), 500);
    }
  }, 8000);
}

// ============================================
// 🆕 SHOW DAILY BONUS CLAIMABLE NOTIFICATION ✅
// ============================================
function showDailyBonusClaimableNotification(amount, subType) {
  const oldNotification = document.querySelector('.daily-bonus-claimable-notification');
  if (oldNotification) {
    oldNotification.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = 'daily-bonus-claimable-notification';
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 40px 50px;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(16, 185, 129, 0.5);
    z-index: 10001;
    text-align: center;
    animation: bounceIn 0.6s ease;
    max-width: 450px;
  `;
  
  const subEmoji = subType === 'pro' ? '👑' : subType === 'standard' ? '⭐' : '🆓';
  
  notification.innerHTML = `
    <div style="font-size: 80px; margin-bottom: 20px;">🎁</div>
    <h2 style="margin: 0 0 15px 0; font-size: 32px; font-weight: 800;">
      Daily Bonus Ready!
    </h2>
    <div style="font-size: 20px; opacity: 0.95; margin-bottom: 30px;">
      ${subEmoji} <strong>${amount} coins</strong> waiting for you!
    </div>
    <div style="display: flex; gap: 15px; justify-content: center;">
      <button onclick="claimDailyCoinsNow()" style="
        padding: 18px 40px;
        background: white;
        color: #10b981;
        border: none;
        border-radius: 12px;
        font-weight: 700;
        font-size: 18px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s;
      " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
        <i class="bi bi-gift-fill"></i> Claim Now!
      </button>
      <button onclick="this.closest('.daily-bonus-claimable-notification').remove(); document.querySelector('.modal-backdrop-daily')?.remove();" style="
        padding: 18px 30px;
        background: rgba(255,255,255,0.2);
        color: white;
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
      ">
        Later
      </button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop-daily';
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;
  backdrop.onclick = () => {
    notification.remove();
    backdrop.remove();
  };
  document.body.insertBefore(backdrop, notification);
}

// ============================================
// 🆕 CLAIM DAILY COINS NOW ✅
// ============================================
async function claimDailyCoinsNow() {
  const user = window.firebaseAuth?.currentUser;
  if (!user) return;
  
  const db = window.firebaseDatabase;
  if (!db) return;
  
  try {
    const notification = document.querySelector('.daily-bonus-claimable-notification');
    const backdrop = document.querySelector('.modal-backdrop-daily');
    if (notification) notification.remove();
    if (backdrop) backdrop.remove();
    
    const subscription = await checkUserSubscription();
    const subType = subscription.type || 'free';
    const coinsToGive = COIN_CONFIG.SUBSCRIPTION_DAILY_COINS[subType] || 5;
    
    const success = await addCoins(coinsToGive, `Daily bonus (${subType})`);
    
    if (success) {
      const lastDailyRef = window.firebaseRef(db, `users/${user.uid}/lastDailyCoin`);
      await window.firebaseSet(lastDailyRef, new Date().toISOString());
      
      console.log(`✅ Daily coins claimed: ${coinsToGive}`);
      
      showDailyCoinsNotification(coinsToGive, subType);
    }
    
  } catch (error) {
    console.error('❌ Claim error:', error);
    showNotification('❌ Error claiming daily coins', 'error');
  }
}

// ============================================
// 🆕 SHOW DAILY COINS SUCCESS NOTIFICATION ✅
// ============================================
function showDailyCoinsNotification(amount, subType) {
  const oldNotification = document.querySelector('.daily-coins-notification');
  if (oldNotification) {
    oldNotification.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = 'daily-coins-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 20px 25px;
    border-radius: 16px;
    box-shadow: 0 10px 30
    px rgba(16, 185, 129, 0.4);
    z-index: 10000;
    font-weight: 600;
    animation: slideInRight 0.5s ease;
    max-width: 350px;
  `;
  
  const subEmoji = subType === 'pro' ? '👑' : subType === 'standard' ? '⭐' : '🆓';
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 15px;">
      <div style="font-size: 40px;">🎁</div>
      <div style="flex: 1;">
        <div style="font-size: 18px; font-weight: 700; margin-bottom: 5px;">
          Daily Bonus!
        </div>
        <div style="font-size: 15px; opacity: 0.95;">
          ${subEmoji} +${amount} coins (${subType})
        </div>
      </div>
      <button onclick="this.closest('.daily-coins-notification').remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center;">×</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification && notification.parentNode) {
      notification.style.animation = 'slideOutRight 0.5s ease';
      setTimeout(() => notification.remove(), 500);
    }
  }, 5000);
  
  if (typeof showCoinEarnAnimation === 'function') {
    showCoinEarnAnimation(amount);
  }
}

// ============================================
// CSS ANIMATIONS - COMBINED ✅
// ============================================
if (!document.querySelector('#coin-system-animations')) {
  const style = document.createElement('style');
  style.id = 'coin-system-animations';
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
    
    @keyframes bounceIn {
      0% {
        transform: translate(-50%, -50%) scale(0.3);
        opacity: 0;
      }
      50% {
        transform: translate(-50%, -50%) scale(1.05);
      }
      70% {
        transform: translate(-50%, -50%) scale(0.9);
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
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
  `;
  document.head.appendChild(style);
}

// ============================================
// START DAILY COIN CHECKER ✅
// ============================================
function startDailyCoinChecker() {
  console.log('🔄 Starting daily coin checker...');
  
  checkAndGiveDailyCoins();
  
  setInterval(() => {
    console.log('⏰ Running periodic daily coin check...');
    checkAndGiveDailyCoins();
  }, 5 * 60 * 1000);
  
  console.log('✅ Daily coin checker started (every 5 minutes)');
}

// ============================================
// INSUFFICIENT COINS MODAL
// ============================================
function showInsufficientCoinsModal(required, current) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay-inline insufficient-coins-modal';
  modal.innerHTML = `
    <div class="modal-inline">
      <div class="modal-header-inline">
        <h3>🪙 Not Enough Coins</h3>
        <button class="modal-close-inline" onclick="closeInsufficientCoinsModal()">×</button>
      </div>
      <div class="modal-body-inline" style="text-align: center; padding: 30px;">
        <div style="font-size: 64px; margin-bottom: 20px;">😔</div>
        <p style="font-size: 18px; color: #4b5563; margin-bottom: 15px;">
          You need <strong style="color: #f59e0b;">${required} coins</strong> to use this tool.
        </p>
        <p style="font-size: 16px; color: #6b7280; margin-bottom: 25px;">
          Your balance: <strong style="color: #ef4444;">${current} coins</strong>
        </p>
        
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button onclick="openCoinShop()" class="btn-inline btn-primary-inline">
            <i class="bi bi-cart-plus"></i> Buy Coins
          </button>
          <button onclick="claimDailyBonusFromUI()" class="btn-inline btn-secondary-inline">
            <i class="bi bi-gift"></i> Daily Bonus
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
}

function closeInsufficientCoinsModal() {
  const modal = document.querySelector('.insufficient-coins-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

// ============================================
// NOTIFICATION HELPER
// ============================================
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: ${type === 'success' ? '#10b981' : 
                  type === 'error' ? '#ef4444' : 
                  type === 'info' ? '#3b82f6' : '#6b7280'};
    color: white;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-weight: 600;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ============================================
// COIN SHOP
// ============================================

function openCoinShop() {
  closeInsufficientCoinsModal();
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay-inline coin-shop-modal';
  modal.innerHTML = `
    <div class="modal-inline" style="max-width: 800px; max-height: 90vh; overflow-y: auto; background: white;">
      <div class="modal-header-inline" style="position: sticky; top: 0; background: white; z-index: 10; padding: 20px; border-bottom: 2px solid #e5e7eb;">
        <h3 style="margin: 0;">🪙 Coin Shop</h3>
        <button class="modal-close-inline" onclick="closeCoinShop()" style="position: absolute; right: 20px; top: 20px; background: none; border: none; font-size: 28px; cursor: pointer; color: #6b7280;">×</button>
      </div>
      <div class="modal-body-inline" style="padding: 20px;">
        ${generateCoinPackagesHTML()}
        
        <div class="subscription-sect" style="margin-top: 30px; padding: 20px; border-radius: 12px;">
          <h4 class="pkg-coins" style="margin: 0 0 15px 0; color: #374151;">
            <i class="bi bi-star-fill" style="color: #fbbf24;"></i> Or Upgrade to Premium
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            ${generateSubscriptionCardsHTML()}
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
  document.body.style.overflow = 'hidden';
}

function closeCoinShop() {
  const modal = document.querySelector('.coin-shop-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
  document.body.style.overflow = '';
}

function generateCoinPackagesHTML() {
  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 15px; margin-bottom: 20px;">
      ${COIN_CONFIG.COIN_PACKAGES.map(pkg => `
        <div class="coin-package ${pkg.popular ? 'popular' : ''}" onclick="purchaseCoinPackage('${pkg.id}')" style="
          background: white;
          border: 2px solid ${pkg.popular ? '#f59e0b' : '#e5e7eb'};
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
        ">
          ${pkg.popular ? '<div style="position: absolute; top: -10px; right: -10px; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold;">Popular</div>' : ''}
          <div style="font-size: 48px; margin-bottom: 10px;">🪙</div>
          <div class="pkg-coins" style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 5px;">${pkg.coins} Coins</div>
          ${pkg.bonus > 0 ? `<div style="color: #10b981; font-size: 14px; font-weight: 600; margin-bottom: 10px;">+${pkg.bonus} Bonus!</div>` : '<div style="height: 24px;"></div>'}
          <div style="font-size: 18px; color: #6b7280; margin-bottom: 15px;">${formatPrice(pkg.price)} so'm</div>
          <button style="width: 100%; padding: 10px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Buy Now</button>
        </div>
      `).join('')}
      <div style="width: 750px; background: linear-gradient(135deg, #fbbf2420, #f59e0b20); border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; text-align: center; position: relative;">
        <span>
        💡 Coins run out. Subscriptions give you coins every day.
        </span>
      </div>
    </div>
  `;
}

function generateSubscriptionCardsHTML() {
  return `
    <div class="subs-card" style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 20px; text-align: center; position: relative;">
      <div style="position: absolute; top: -10px; right: -10px; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold;">Free Forever</div>
      <h5 class="subs_card-option"  style="margin: 0 0 10px 0; font-size: 20px; color: #1f2937;">Free</h5>
      <div style="font-size: 28px; font-weight: bold; color: #10b981; margin-bottom: 15px;">0<span style="font-size: 14px; color: #6b7280;">/oy</span></div>
      <ul style="list-style: none; padding: 0; margin: 0 0 15px 0; text-align: left;">
        <li class="subs_card-enable" style="padding: 5px 0; color: #4b5563; font-size: 14px;">✅ 5 coins/day</li>
        <li class="subs_card-enable" style="padding: 5px 0; color: #4b5563; font-size: 14px;">✅ Homework Checker</li>
        <li class="subs_card-enable" style="padding: 5px 0; color: #4b5563; font-size: 14px;">✅ Writing Checker</li>
        <li class="subs_card-enable" style="padding: 5px 0; color: #4b5563; font-size: 14px;">❌ Image upload</li>
        <li class="subs_card-enable" style="padding: 5px 0; color: #4b5563; font-size: 14px;">❌ Export / Download</li>
      </ul>
      <button style="width: 100%; padding: 10px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 8px; font-weight: 600;">Current Plan</button>
    </div>

    <div class="subs-card" onclick="purchaseSubscription('standard')" style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; position: relative;">
      <div style="position: absolute; top: -10px; right: -10px; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold;">Best Value</div>
      <h5  class="subs_card-option" style="margin: 0 0 10px 0; font-size: 20px; color: #1f2937;">Standard</h5>
      <div style="font-size: 28px; font-weight: bold; color: #10b981; margin-bottom: 15px;">25,000<span style="font-size: 14px; color: #6b7280;">/oy</span></div>
      <ul style="list-style: none; padding: 0; margin: 0 0 15px 0; text-align: left;">
        <li class="subs_card-enable" style="padding: 5px 0; color: #4b5563; font-size: 14px;">✅ 20 coins/day</li>
        <li class="subs_card-enable" style="padding: 5px 0; color: #4b5563; font-size: 14px;">✅ Homework Checker</li>
        <li class="subs_card-enable" style="padding: 5px 0; color: #4b5563; font-size: 14px;">✅ Writing Checker</li>
        <li class="subs_card-enable" style="padding: 5px 0; color: #4b5563; font-size: 14px;">✅ Image upload</li>
        <li class="subs_card-enable" style="padding: 5px 0; color: #4b5563; font-size: 14px;">✅ Export / Download</li>
      </ul>
      <button style="width: 100%; padding: 10px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 8px; font-weight: 600;">Subscribe</button>
    </div>
    
    <div onclick="purchaseSubscription('pro')" style="background: linear-gradient(135deg, #fbbf2420, #f59e0b20); border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; position: relative;">
      <div style="position: absolute; top: -10px; right: -10px; background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold;">Premium</div>
      <h5 class="subs_card-option" style="margin: 0 0 10px 0; font-size: 20px; color: #1f2937;">Pro</h5>
      <div style="font-size: 28px; font-weight: bold; color: #f59e0b; margin-bottom: 15px;">50,000<span style="font-size: 14px; color: #6b7280;">/oy</span></div>
      <ul style="list-style: none; padding: 0; margin: 0 0 15px 0; text-align: left;">
        <li class="subs_card-enable" style="padding: 5px 0; color: #4b5563; font-size: 14px;">✅ 50 coins/day</li>
        <li class="subs_card-enable" style="padding: 5px 0; color: #4b5563; font-size: 14px;">🎁 Article tool (bonus)</li>
        <li class="subs_card-enable" style="padding: 5px 0; color: #4b5563; font-size: 14px;">✅ Priority support</li>
        <li class="subs_card-enable" style="padding: 5px 0; color: #4b5563; font-size: 14px;">✅ Everything in Free</li>
        <li class="subs_card-enable" style="padding: 5px 0; color: #4b5563; font-size: 14px;">✅ Everything in Standard</li>
      </ul>
      <button style="width: 100%; padding: 10px; background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; border: none; border-radius: 8px; font-weight: 600;">Subscribe</button>
    </div>
  `;
}

function purchaseCoinPackage(packageId) {
  if (typeof window.openSubscriptionPaymentModal === 'function') {
    closeCoinShop();
    window.openSubscriptionPaymentModal(packageId);
  } else {
    showNotification('❌ Payment system not found', 'error');
  }
}

function purchaseSubscription(plan) {
  const productKey = plan === 'standard' ? 'STANDARD_SUB' : 'PRO_SUB';
  if (typeof window.openSubscriptionPaymentModal === 'function') {
    closeCoinShop();
    window.openSubscriptionPaymentModal(productKey);
  } else {
    showNotification('❌ Payment system not found', 'error');
  }
}

function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// ============================================
// INITIALIZE COIN SYSTEM - UPDATED WITH WELCOME COINS ✅
// ============================================
async function initCoinSystem() {
  const user = window.firebaseAuth?.currentUser;
  if (!user) {
    console.warn('⚠️ User not logged in');
    return false;
  }
  
  const db = window.firebaseDatabase;
  if (!db) {
    console.error('❌ Database not initialized');
    return false;
  }
  
  console.log('✅ Coin system ready for:', user.uid);
  
  // ✅ 1. Start listening to coins FIRST
  listenToCoins();
  
  // ✅ 2. Update coin display
  await updateCoinDisplay();
  
  // ✅ 3. Give welcome coins to new users (BEFORE daily check)
  if (typeof giveWelcomeCoinsToNewUser === 'function') {
    await giveWelcomeCoinsToNewUser(user.uid);
  }
  
  // ✅ 4. Check and give daily coins (AFTER welcome coins)
  setTimeout(() => {
    checkAndGiveDailyCoins();
  }, 1000); // Wait 1 second to ensure welcome coins are processed
  
  // ✅ 5. Start daily coin checker (periodic)
  startDailyCoinChecker();
  
  return true;
}

// ============================================
// 🎁 CLAIM DAILY BONUS (FOR UI BUTTONS) ✅
// ============================================
async function claimDailyBonus() {
  const user = window.firebaseAuth?.currentUser;
  if (!user) {
    showNotification('❌ Please log in first', 'error');
    return;
  }
  
  const db = window.firebaseDatabase;
  if (!db) {
    showNotification('❌ Database not available', 'error');
    return;
  }
  
  try {
    // Check if daily bonus is available
    const lastDailyRef = window.firebaseRef(db, `users/${user.uid}/lastDailyCoin`);
    const snapshot = await window.firebaseGet(lastDailyRef);
    
    const now = Date.now();
    const lastDaily = snapshot.exists() ? new Date(snapshot.val()).getTime() : 0;
    const timeDiff = now - lastDaily;
    
    // Check cooldown (24 hours)
    if (timeDiff < COIN_CONFIG.DAILY_BONUS_COOLDOWN) {
      const remainingMs = COIN_CONFIG.DAILY_BONUS_COOLDOWN - timeDiff;
      const remainingHours = Math.floor(remainingMs / 1000 / 60 / 60);
      const remainingMinutes = Math.ceil((remainingMs % (1000 * 60 * 60)) / 1000 / 60);
      
      showNotification(
        `⏳ Daily bonus available in ${remainingHours}h ${remainingMinutes}m`,
        'warning'
      );
      return;
    }
    
    // Get user subscription to determine coins amount
    const subscription = await checkUserSubscription();
    const subType = subscription.type || 'free';
    const coinsToGive = COIN_CONFIG.SUBSCRIPTION_DAILY_COINS[subType] || 5;
    
    // Give coins
    const success = await addCoins(coinsToGive, `Daily bonus (${subType})`);
    
    if (success) {
      // Update last daily claim time
      await window.firebaseSet(lastDailyRef, new Date().toISOString());
      
      console.log(`✅ Daily bonus claimed: ${coinsToGive} coins`);
      
      // Show success notification
      showNotification(
        `🎁 Daily bonus claimed! +${coinsToGive} coins`,
        'success'
      );
      
      // Show coin animation if available
      if (typeof showCoinEarnAnimation === 'function') {
        showCoinEarnAnimation(coinsToGive);
      }
    }
    
  } catch (error) {
    console.error('❌ Error claiming daily bonus:', error);
    showNotification('❌ Failed to claim daily bonus', 'error');
  }
}

// ============================================
// 🕐 CAN CLAIM DAILY BONUS (CHECK AVAILABILITY) ✅
// ============================================
async function canClaimDailyBonus() {
  const user = window.firebaseAuth?.currentUser;
  if (!user) return { canClaim: false, reason: 'Not logged in' };
  
  const db = window.firebaseDatabase;
  if (!db) return { canClaim: false, reason: 'Database not available' };
  
  try {
    const lastDailyRef = window.firebaseRef(db, `users/${user.uid}/lastDailyCoin`);
    const snapshot = await window.firebaseGet(lastDailyRef);
    
    const now = Date.now();
    const lastDaily = snapshot.exists() ? new Date(snapshot.val()).getTime() : 0;
    const timeDiff = now - lastDaily;
    
    if (timeDiff >= COIN_CONFIG.DAILY_BONUS_COOLDOWN) {
      return { canClaim: true, reason: 'Ready to claim' };
    }
    
    const remainingMs = COIN_CONFIG.DAILY_BONUS_COOLDOWN - timeDiff;
    const remainingHours = Math.floor(remainingMs / 1000 / 60 / 60);
    const remainingMinutes = Math.ceil((remainingMs % (1000 * 60 * 60)) / 1000 / 60);
    
    return {
      canClaim: false,
      reason: `Available in ${remainingHours}h ${remainingMinutes}m`,
      remainingMs
    };
    
  } catch (error) {
    console.error('❌ Error checking daily bonus:', error);
    return { canClaim: false, reason: 'Error checking' };
  }
}

// ============================================
// INITIALIZE ON AUTH ✅
// ============================================
if (window.firebaseAuth) {
  window.firebaseAuth.onAuthStateChanged(async (user) => {
    if (user) {
      console.log('👤 User authenticated, initializing coin system...');
      
      // ✅ WAIT FOR DOM TO BE READY
      await new Promise(resolve => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', resolve);
        }
      });
      
      // ✅ WAIT 1 SECOND (ensure Firebase DB is ready)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // ✅ INITIALIZE COIN SYSTEM
      if (typeof initCoinSystem === 'function') {
        const success = await initCoinSystem();
        
        if (success) {
          console.log('✅ Coin system initialized successfully');
          
          // ✅ UPDATE COIN DISPLAY
          if (typeof updateCoinDisplay === 'function') {
            await updateCoinDisplay();
            console.log('✅ Initial coin display updated');
          }
        } else {
          console.error('❌ Coin system initialization failed');
        }
      } else {
        console.error('❌ initCoinSystem function not found!');
      }
    } else {
      console.log('❌ No user logged in');
    }
  });
}

// ============================================
// GLOBAL EXPORTS ✅
// ============================================
window.getUserCoins = getUserCoins;
window.setUserCoins = setUserCoins;
window.addCoins = addCoins;
window.spendCoins = spendCoins;
window.canUseTool = canUseTool;
window.useTool = useTool;
window.updateCoinDisplay = updateCoinDisplay;
window.listenToCoins = listenToCoins;
window.canClaimDailyBonus = canClaimDailyBonus;  // ✅ QO'SHILDI
window.claimDailyBonus = claimDailyBonus;  // ✅ QO'SHILDI
window.claimDailyBonusFromUI = claimDailyBonusFromUI;
window.checkUserSubscription = checkUserSubscription;
window.showInsufficientCoinsModal = showInsufficientCoinsModal;
window.closeInsufficientCoinsModal = closeInsufficientCoinsModal;
window.openCoinShop = openCoinShop;
window.closeCoinShop = closeCoinShop;
window.showNotification = showNotification;
window.initCoinSystem = initCoinSystem;
window.checkAndGiveDailyCoins = checkAndGiveDailyCoins;
window.startDailyCoinChecker = startDailyCoinChecker;
window.showDailyBonusReadyNotification = showDailyBonusReadyNotification;
window.showDailyBonusClaimableNotification = showDailyBonusClaimableNotification;
window.claimDailyCoinsNow = claimDailyCoinsNow;
window.showDailyCoinsNotification = showDailyCoinsNotification;
window.giveWelcomeCoinsToNewUser = giveWelcomeCoinsToNewUser;
window.showWelcomeCoinsNotification = showWelcomeCoinsNotification;
window.closeWelcomeCoinsNotification = closeWelcomeCoinsNotification;
window.updateSubscriptionDisplay = updateSubscriptionDisplay;
window.showCoinEarnAnimation = showCoinEarnAnimation;

console.log('✅ Firebase Coin System with Auto Daily Coins loaded!');