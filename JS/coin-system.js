// ============================================
// 🪙 COIN SYSTEM - FIREBASE DATABASE VERSION
// ============================================

const COIN_CONFIG = {
  INITIAL_COINS: 10,
  DAILY_BONUS: 5,
  DAILY_BONUS_COOLDOWN: 24 * 60 * 60 * 1000,
  
  TOOL_COSTS: {
    homework: 2,
    grammar: 3,
    vocabulary: 1,
    quiz: 2,
    study: 2,
    speaking: 3
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
// 6️⃣ UPDATE COIN DISPLAY (REAL-TIME)
// ============================================
async function updateCoinDisplay() {
  const coins = await getUserCoins();
  
  // Update all coin displays
  const coinElements = document.querySelectorAll('#userCoins, .coin-amount, #profileCoinBalance');
  coinElements.forEach(el => {
    if (el) {
      el.textContent = coins;
      
      // Animation
      el.style.transform = 'scale(1.2)';
      setTimeout(() => {
        el.style.transform = 'scale(1)';
      }, 200);
    }
  });
  
  console.log('🔄 Coin display updated:', coins);
}

// ============================================
// 7️⃣ REAL-TIME COIN LISTENER
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
    
    // Update all displays
    const coinElements = document.querySelectorAll('#userCoins, .coin-amount, #profileCoinBalance');
    coinElements.forEach(el => {
      if (el) el.textContent = coins;
    });
  });
  
  console.log('✅ Real-time coin listener started');
}

// ============================================
// 8️⃣ CHECK IF USER CAN USE TOOL
// ============================================
async function canUseTool(toolName) {
  const cost = COIN_CONFIG.TOOL_COSTS[toolName] || 0;
  
  // Check subscription
  const subscription = await checkUserSubscription();
  
  if (subscription.type === 'pro') {
    return { canUse: true, cost: 0, reason: 'Pro subscription' };
  }
  
  const coins = await getUserCoins();
  
  if (coins >= cost) {
    return { canUse: true, cost: cost, reason: 'Sufficient coins' };
  }
  
  return { canUse: false, cost: cost, reason: 'Not enough coins' };
}

// ============================================
// 9️⃣ USE TOOL - FIXED TO STOP EXECUTION ✅
// ============================================
async function useTool(toolName) {
  const check = await canUseTool(toolName);
  
  if (!check.canUse) {
    console.error(`❌ Cannot use ${toolName}: ${check.reason}`);
    
    // ✅ SHOW MODAL IMMEDIATELY
    const currentCoins = await getUserCoins();
    if (typeof showInsufficientCoinsModal === 'function') {
      showInsufficientCoinsModal(check.cost, currentCoins);
    }
    
    // ✅ CRITICAL: Return false to stop execution
    return false;
  }
  
  if (check.cost > 0) {
    const success = await spendCoins(check.cost, `Used ${toolName} tool`);
    
    if (!success) {
      console.error(`❌ Failed to deduct ${check.cost} coins`);
      return false;
    }
    
    return true;
  }
  
  return true;
}

// ============================================
// 🔟 CHECK USER SUBSCRIPTION
// ============================================
async function checkUserSubscription() {
  const user = window.firebaseAuth?.currentUser;
  if (!user) {
    return { type: 'free', status: 'active' };
  }
  
  const db = window.firebaseDatabase;
  if (!db) {
    return { type: 'free', status: 'active' };
  }
  
  try {
    const subRef = window.firebaseRef(db, `users/${user.uid}/subscription`);
    const snapshot = await window.firebaseGet(subRef);
    
    if (!snapshot.exists()) {
      return { type: 'free', status: 'active' };
    }
    
    const subData = snapshot.val();
    
    // Check expiry
    if (subData.expiry && subData.expiry !== null) {
      const expiryDate = new Date(subData.expiry);
      const now = new Date();
      
      if (expiryDate < now) {
        return { type: 'free', status: 'expired', expiredAt: subData.expiry };
      }
    }
    
    return subData;
  } catch (error) {
    console.error('❌ Subscription check error:', error);
    return { type: 'free', status: 'active' };
  }
}

// ============================================
// 1️⃣1️⃣ DAILY BONUS
// ============================================
async function canClaimDailyBonus() {
  const user = window.firebaseAuth?.currentUser;
  if (!user) return false;
  
  const db = window.firebaseDatabase;
  if (!db) return false;
  
  try {
    const bonusRef = window.firebaseRef(db, `users/${user.uid}/lastDailyBonus`);
    const snapshot = await window.firebaseGet(bonusRef);
    
    if (!snapshot.exists()) return true;
    
    const lastBonus = new Date(snapshot.val()).getTime();
    const now = Date.now();
    const timeDiff = now - lastBonus;
    
    return timeDiff >= COIN_CONFIG.DAILY_BONUS_COOLDOWN;
  } catch (error) {
    console.error('❌ Error checking daily bonus:', error);
    return false;
  }
}

async function claimDailyBonus() {
  if (!(await canClaimDailyBonus())) {
    showNotification('⏰ Daily bonus already claimed today!', 'info');
    return false;
  }
  
  const subscription = await checkUserSubscription();
  
  let bonusAmount = 5;
  if (subscription.type === 'standard') bonusAmount = 10;
  if (subscription.type === 'pro') bonusAmount = 20;
  
  const success = await addCoins(bonusAmount, 'Daily login bonus');
  
  if (success) {
    // Save last bonus time
    const user = window.firebaseAuth?.currentUser;
    const db = window.firebaseDatabase;
    
    const bonusRef = window.firebaseRef(db, `users/${user.uid}/lastDailyBonus`);
    await window.firebaseSet(bonusRef, new Date().toISOString());
    
    showNotification(`🎉 You earned ${bonusAmount} coins! Daily bonus claimed!`, 'success');
    if (typeof showCoinEarnAnimation === 'function') {
      showCoinEarnAnimation(bonusAmount);
    }
  }
  
  return success;
}

// ============================================
// 1️⃣2️⃣ UI FUNCTIONS
// ============================================

function claimDailyBonusFromUI() {
  claimDailyBonus();
  closeDailyBonusNotification();
}

function closeDailyBonusNotification() {
  const notification = document.querySelector('.daily-bonus-notification');
  if (notification) {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }
}

function showCoinEarnAnimation(amount) {
  const coinDisplay = document.querySelector('.coin-display');
  if (!coinDisplay) return;
  
  for (let i = 0; i < Math.min(amount, 10); i++) {
    setTimeout(() => {
      const coin = document.createElement('div');
      coin.className = 'flying-coin';
      coin.textContent = '🪙';
      coin.style.cssText = `
        position: fixed;
        font-size: 32px;
        pointer-events: none;
        z-index: 9999;
        transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      `;
      
      const startX = Math.random() * window.innerWidth;
      const startY = window.innerHeight;
      
      coin.style.left = startX + 'px';
      coin.style.top = startY + 'px';
      
      document.body.appendChild(coin);
      
      const rect = coinDisplay.getBoundingClientRect();
      const endX = rect.left + rect.width / 2;
      const endY = rect.top + rect.height / 2;
      
      setTimeout(() => {
        coin.style.left = endX + 'px';
        coin.style.top = endY + 'px';
        coin.style.opacity = '0';
        coin.style.transform = 'scale(0.5)';
      }, 50);
      
      setTimeout(() => coin.remove(), 800);
    }, i * 100);
  }
}

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
        <li class="subs_card-enable" style="padding: 5px 0; color: #4b5563; font-size: 14px;">✅ 70 coins/day</li>
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
        <li class="subs_card-enable" style="padding: 5px 0; color: #4b5563; font-size: 14px;">✅ 150 coins/day</li>
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
// INITIALIZE COIN SYSTEM
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
  
  // Start real-time listener
  listenToCoins();
  
  // Initial display update
  await updateCoinDisplay();
  
  return true;
}

// Auto-initialize when auth state changes
if (window.firebaseAuth) {
  window.firebaseAuth.onAuthStateChanged((user) => {
    if (user) {
      console.log('👤 User authenticated, initializing coin system...');
      setTimeout(() => initCoinSystem(), 1000);
    }
  });
}

// ============================================
// 1️⃣4️⃣ GLOBAL EXPORTS
// ============================================
window.getUserCoins = getUserCoins;
window.setUserCoins = setUserCoins;
window.addCoins = addCoins;
window.spendCoins = spendCoins;
window.canUseTool = canUseTool;
window.useTool = useTool;
window.updateCoinDisplay = updateCoinDisplay;
window.listenToCoins = listenToCoins;
window.canClaimDailyBonus = canClaimDailyBonus;
window.claimDailyBonus = claimDailyBonus;
window.claimDailyBonusFromUI = claimDailyBonusFromUI;
window.checkUserSubscription = checkUserSubscription;
window.showInsufficientCoinsModal = showInsufficientCoinsModal;
window.closeInsufficientCoinsModal = closeInsufficientCoinsModal;
window.openCoinShop = openCoinShop;
window.closeCoinShop = closeCoinShop;
window.showNotification = showNotification;
window.initCoinSystem = initCoinSystem;

console.log('✅ Firebase Coin System loaded successfully!');