// ============================================
// 🪙 COIN SYSTEM - ZIYOAI (FIXED VERSION)
// ============================================

// ============================================
// 1️⃣ CONSTANTS & CONFIG
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
  
  SUBSCRIPTION: {
    free: {
      dailyCoins: 5,
      maxCoins: 50,
      toolAccess: 'limited'
    },
    standard: {
      dailyCoins: 100,
      maxCoins: null,
      toolAccess: 'all',
      price: 25000
    },
    pro: {
      dailyCoins: null,
      maxCoins: null,
      toolAccess: 'premium',
      price: 50000
    }
  },
  
  // ✅ YANGILANGAN: Real prices (so'mda)
  COIN_PACKAGES: [
    { id: 'COINS_50', coins: 50, price: 10000, bonus: 0, popular: false },
    { id: 'COINS_100', coins: 100, price: 17000, bonus: 10, popular: true },
    { id: 'COINS_250', coins: 250, price: 40000, bonus: 50, popular: false },
    { id: 'COINS_500', coins: 500, price: 70000, bonus: 150, popular: false }
  ]
};

// ============================================
// 2️⃣ USER COIN DATA CLASS
// ============================================
class UserCoinData {
  constructor(userId) {
    this.userId = userId;
    this.storageKey = `ziyoai_coins_${userId}`;
    this.load();
  }
  
  getDefaultData() {
    return {
      coins: COIN_CONFIG.INITIAL_COINS,
      totalEarned: COIN_CONFIG.INITIAL_COINS,
      totalSpent: 0,
      lastDailyBonus: null,
      lastDailyBonusDate: null,
      subscription: 'free',
      subscriptionExpiry: null,
      toolUsageCount: {},
      purchaseHistory: [],
      createdAt: new Date().toISOString()
    };
  }
  
  load() {
    try {
      const data = localStorage.getItem(this.storageKey);
      this.data = data ? JSON.parse(data) : this.getDefaultData();
      
      if (!this.data.toolUsageCount) this.data.toolUsageCount = {};
      if (!this.data.purchaseHistory) this.data.purchaseHistory = [];
      
      console.log('✅ Coin data loaded:', this.data);
    } catch (error) {
      console.error('❌ Coin data load error:', error);
      this.data = this.getDefaultData();
    }
  }
  
  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      console.log('💾 Coin data saved:', this.data.coins, 'coins');
      return true;
    } catch (error) {
      console.error('❌ Coin data save error:', error);
      return false;
    }
  }
  
  getCoins() {
    return this.data.coins || 0;
  }
  
  addCoins(amount, reason = 'unknown') {
    if (amount <= 0) return false;
    
    this.data.coins += amount;
    this.data.totalEarned += amount;
    
    this.logTransaction('earn', amount, reason);
    this.save();
    
    if (typeof updateCoinDisplay === 'function') {
      updateCoinDisplay();
    }
    
    console.log(`✅ Added ${amount} coins. Total: ${this.data.coins}`);
    return true;
  }
  
  spendCoins(amount, reason = 'unknown') {
    if (amount <= 0) return false;
    if (this.data.coins < amount) {
      console.warn(`⚠️ Not enough coins! Need: ${amount}, Have: ${this.data.coins}`);
      return false;
    }
    
    this.data.coins -= amount;
    this.data.totalSpent += amount;
    
    this.logTransaction('spend', amount, reason);
    this.save();
    
    if (typeof updateCoinDisplay === 'function') {
      updateCoinDisplay();
    }
    
    console.log(`✅ Spent ${amount} coins. Remaining: ${this.data.coins}`);
    return true;
  }
  
  logTransaction(type, amount, reason) {
    if (!this.data.purchaseHistory) this.data.purchaseHistory = [];
    
    this.data.purchaseHistory.push({
      type: type,
      amount: amount,
      reason: reason,
      timestamp: new Date().toISOString(),
      balance: this.data.coins
    });
    
    if (this.data.purchaseHistory.length > 100) {
      this.data.purchaseHistory = this.data.purchaseHistory.slice(-100);
    }
  }
  
  canUseTool(toolName) {
    const cost = COIN_CONFIG.TOOL_COSTS[toolName] || 0;
    
    if (this.data.subscription === 'pro') {
      return { canUse: true, cost: 0, reason: 'Pro subscription' };
    }
    
    if (this.data.coins >= cost) {
      return { canUse: true, cost: cost, reason: 'Sufficient coins' };
    }
    
    return { canUse: false, cost: cost, reason: 'Not enough coins' };
  }
  
  useTool(toolName) {
    const check = this.canUseTool(toolName);
    
    if (!check.canUse) {
      console.error(`❌ Cannot use ${toolName}: ${check.reason}`);
      if (typeof showInsufficientCoinsModal === 'function') {
        showInsufficientCoinsModal(check.cost, this.data.coins);
      }
      return false;
    }
    
    if (check.cost > 0) {
      const success = this.spendCoins(check.cost, `Used ${toolName} tool`);
      if (success) {
        if (!this.data.toolUsageCount[toolName]) {
          this.data.toolUsageCount[toolName] = 0;
        }
        this.data.toolUsageCount[toolName]++;
        this.save();
      }
      return success;
    }
    
    return true;
  }
  
  canClaimDailyBonus() {
    if (!this.data.lastDailyBonus) return true;
    
    const now = Date.now();
    const lastBonus = new Date(this.data.lastDailyBonus).getTime();
    const timeDiff = now - lastBonus;
    
    return timeDiff >= COIN_CONFIG.DAILY_BONUS_COOLDOWN;
  }
  
  claimDailyBonus() {
    if (!this.canClaimDailyBonus()) {
      const timeLeft = this.getTimeUntilNextBonus();
      if (typeof showNotification === 'function') {
        showNotification(`⏰ Daily bonus available in ${timeLeft}`, 'info');
      }
      return false;
    }
    
    let bonusAmount = 5;
    if (this.data.subscription === 'standard') bonusAmount = 10;
    if (this.data.subscription === 'pro') bonusAmount = 20;
    
    this.addCoins(bonusAmount, 'Daily login bonus');
    this.data.lastDailyBonus = new Date().toISOString();
    this.data.lastDailyBonusDate = new Date().toLocaleDateString();
    this.save();
    
    if (typeof showCoinEarnAnimation === 'function') {
      showCoinEarnAnimation(bonusAmount);
    }
    if (typeof showNotification === 'function') {
      showNotification(`🎉 You earned ${bonusAmount} coins! Daily bonus claimed!`, 'success');
    }
    
    return true;
  }
  
  getTimeUntilNextBonus() {
    if (!this.data.lastDailyBonus) return '0h 0m';
    
    const now = Date.now();
    const lastBonus = new Date(this.data.lastDailyBonus).getTime();
    const nextBonus = lastBonus + COIN_CONFIG.DAILY_BONUS_COOLDOWN;
    const timeLeft = nextBonus - now;
    
    if (timeLeft <= 0) return '0h 0m';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }
  
  getSubscriptionInfo() {
    return {
      type: this.data.subscription,
      expiry: this.data.subscriptionExpiry,
      isActive: this.isSubscriptionActive(),
      config: COIN_CONFIG.SUBSCRIPTION[this.data.subscription]
    };
  }
  
  isSubscriptionActive() {
    if (this.data.subscription === 'free') return true;
    if (!this.data.subscriptionExpiry) return false;
    
    return new Date(this.data.subscriptionExpiry) > new Date();
  }
  
  reset() {
    this.data = this.getDefaultData();
    this.save();
    if (typeof updateCoinDisplay === 'function') {
      updateCoinDisplay();
    }
    console.log('🔄 Coin data reset');
  }
}

// ============================================
// 3️⃣ GLOBAL INITIALIZATION
// ============================================

function initCoinSystem() {
  const auth = window.firebaseAuth;
  if (!auth || !auth.currentUser) {
    console.warn('⚠️ User not logged in, coin system delayed');
    return null;
  }
  
  const userId = auth.currentUser.uid;
  const manager = new UserCoinData(userId);
  
  window.coinManager = manager;
  
  if (typeof updateCoinDisplay === 'function') {
    updateCoinDisplay();
  }
  if (typeof checkDailyBonus === 'function') {
    checkDailyBonus();
  }
  
  console.log('✅ Coin system initialized for user:', userId);
  console.log('💰 Current balance:', manager.getCoins(), 'coins');
  
  return manager;
}

// ============================================
// 4️⃣ UI FUNCTIONS
// ============================================

function updateCoinDisplay() {
  const coinElement = document.getElementById('userCoins');
  if (!coinElement) return;
  
  if (!window.coinManager) {
    coinElement.textContent = '0';
    return;
  }
  
  const coins = window.coinManager.getCoins();
  coinElement.textContent = coins;
  
  coinElement.style.transform = 'scale(1.2)';
  setTimeout(() => {
    coinElement.style.transform = 'scale(1)';
  }, 200);
}

function checkDailyBonus() {
  if (!window.coinManager) return;
  
  if (window.coinManager.canClaimDailyBonus()) {
    setTimeout(() => {
      showDailyBonusNotification();
    }, 2000);
  }
}

function showDailyBonusNotification() {
  const notification = document.createElement('div');
  notification.className = 'daily-bonus-notification';
  notification.innerHTML = `
    <div class="daily-bonus-content">
      <div class="daily-bonus-icon">🎁</div>
      <div class="daily-bonus-text">
        <h4>Daily Bonus Available!</h4>
        <p>Claim your free coins now</p>
      </div>
      <button onclick="claimDailyBonusFromUI()" class="daily-bonus-btn">
        Claim
      </button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    closeDailyBonusNotification();
  }, 10000);
}

function closeDailyBonusNotification() {
  const notification = document.querySelector('.daily-bonus-notification');
  if (notification) {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }
  
  if (typeof window.preventToolSwitch !== 'undefined') {
    window.preventToolSwitch = false;
    console.log('🔓 Tool switching unlocked after daily bonus');
  }
}

function claimDailyBonusFromUI() {
  if (window.coinManager) {
    window.coinManager.claimDailyBonus();
    closeDailyBonusNotification();
    
    if (typeof window.preventToolSwitch !== 'undefined') {
      window.preventToolSwitch = false;
    }
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
        
        <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 10px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            💡 <strong>Tip:</strong> Upgrade to <strong>Standard</strong> (25,000 so'm/oy) for 100 coins/day!
          </p>
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
// COIN SHOP - TO'G'RILANGAN ✅
// ============================================

function openCoinShop() {
  closeInsufficientCoinsModal();
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay-inline coin-shop-modal';
  modal.innerHTML = `
    <div class="modal-inline" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
      <div class="modal-header-inline" style="position: sticky; top: 0; background: white; z-index: 10; padding: 20px; border-bottom: 2px solid #e5e7eb;">
        <h3 style="margin: 0;">🪙 Coin Shop</h3>
        <button class="modal-close-inline" onclick="closeCoinShop()" style="position: absolute; right: 20px; top: 20px; background: none; border: none; font-size: 28px; cursor: pointer; color: #6b7280;">×</button>
      </div>
      <div class="modal-body-inline" style="padding: 20px;">
        ${generateCoinPackagesHTML()}
        
        <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #667eea15, #764ba215); border-radius: 12px;">
          <h4 style="margin: 0 0 15px 0; color: #374151;">
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
  
  // ✅ Prevent body scroll
  document.body.style.overflow = 'hidden';
}

function closeCoinShop() {
  const modal = document.querySelector('.coin-shop-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
  
  // ✅ Re-enable body scroll
  document.body.style.overflow = '';
}

function generateCoinPackagesHTML() {
  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 15px; margin-bottom: 20px;">
      ${COIN_CONFIG.COIN_PACKAGES.map(pkg => `
        <div class="coin-package ${pkg.popular ? 'popular' : ''}" onclick="purchaseCoinPackage('${pkg.id}', ${pkg.coins}, ${pkg.price}, ${pkg.bonus})" style="
          background: white;
          border: 2px solid ${pkg.popular ? '#f59e0b' : '#e5e7eb'};
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
        ">
          ${pkg.popular ? '<div class="package-badge" style="position: absolute; top: -10px; right: -10px; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold;">Popular</div>' : ''}
          <div class="package-icon" style="font-size: 48px; margin-bottom: 10px;">🪙</div>
          <div class="package-coins" style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 5px;">${pkg.coins} Coins</div>
          ${pkg.bonus > 0 ? `<div class="package-bonus" style="color: #ffffffff; font-size: 14px; font-weight: 600; margin-bottom: 10px;">+${pkg.bonus} Bonus!</div>` : '<div style="height: 24px;"></div>'}
          <div class="package-price" style="font-size: 18px; color: #6b7280; margin-bottom: 15px;">${formatPrice(pkg.price)} so'm</div>
          <button class="package-btn" style="width: 100%; padding: 10px; background: linear-gradient(
    151deg,
    rgba(93, 156, 245, 1) 0%,
    rgba(44, 170, 154, 1) 60%,
    rgba(35, 195, 101, 1) 100%
  ); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Buy Now</button>
        </div>
      `).join('')}
    </div>
  `;
}

function generateSubscriptionCardsHTML() {
  return `
    <div class="sub-card" onclick="purchaseSubscription('standard')" style="
      background: white;
      border: 2px solid #10b981;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      cursor: pointer;
      position: relative;
    ">
      <div class="sub-badge" style="position: absolute; top: -10px; right: -10px; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold;">Best Value</div>
      <h5 style="margin: 0 0 10px 0; font-size: 20px; color: #1f2937;">Standard</h5>
      <div class="sub-price" style="font-size: 28px; font-weight: bold; color: #10b981; margin-bottom: 15px;">25,000<span style="font-size: 14px; color: #6b7280;">/oy</span></div>
      <ul class="sub-features" style="list-style: none; padding: 0; margin: 0 0 15px 0; text-align: left;">
        <li style="padding: 5px 0; color: #4b5563; font-size: 14px;">✅ 100 coins/day</li>
        <li style="padding: 5px 0; color: #4b5563; font-size: 14px;">✅ All tools</li>
        <li style="padding: 5px 0; color: #4b5563; font-size: 14px;">✅ No ads</li>
      </ul>
      <button class="sub-btn" style="width: 100%; padding: 10px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 8px; font-weight: 600;">Subscribe</button>
    </div>
    
    <div class="sub-card pro" onclick="purchaseSubscription('pro')" style="
      background: linear-gradient(135deg, #fbbf2420, #f59e0b20);
      border: 2px solid #f59e0b;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      cursor: pointer;
      position: relative;
    ">
      <div class="sub-badge" style="position: absolute; top: -10px; right: -10px; background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold;">Premium</div>
      <h5 style="margin: 0 0 10px 0; font-size: 20px; color: #1f2937;">Pro</h5>
      <div class="sub-price" style="font-size: 28px; font-weight: bold; color: #f59e0b; margin-bottom: 15px;">50,000<span style="font-size: 14px; color: #6b7280;">/oy</span></div>
      <ul class="sub-features" style="list-style: none; padding: 0; margin: 0 0 15px 0; text-align: left;">
        <li style="padding: 5px 0; color: #4b5563; font-size: 14px;">✅ Unlimited coins</li>
        <li style="padding: 5px 0; color: #4b5563; font-size: 14px;">✅ Premium tools</li>
        <li style="padding: 5px 0; color: #4b5563; font-size: 14px;">✅ Priority support</li>
      </ul>
      <button class="sub-btn" style="width: 100%; padding: 10px; background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; border: none; border-radius: 8px; font-weight: 600;">Subscribe</button>
    </div>
  `;
}

// ============================================
// PURCHASE COIN PACKAGE - TO'G'RILANGAN ✅
// ============================================

function purchaseCoinPackage(packageId, coins, price, bonus) {
  console.log('📦 Purchasing coin package:', packageId);
  
  // ✅ Telegram payment modalni ochish
  if (typeof window.openSubscriptionPaymentModal === 'function') {
    closeCoinShop();
    window.openSubscriptionPaymentModal(packageId);
  } else {
    console.error('❌ openSubscriptionPaymentModal function not found!');
    showNotification('❌ To\'lov tizimi topilmadi', 'error');
  }
}

// ============================================
// PURCHASE SUBSCRIPTION - TO'G'RILANGAN ✅
// ============================================

function purchaseSubscription(plan) {
  console.log('📱 Purchasing subscription:', plan);
  
  // ✅ Telegram payment orqali sotib olish
  if (typeof window.openSubscriptionPaymentModal === 'function') {
    const productKey = plan === 'standard' ? 'STANDARD_SUB' : 'PRO_SUB';
    closeCoinShop();
    window.openSubscriptionPaymentModal(productKey);
  } else {
    console.error('❌ openSubscriptionPaymentModal function not found!');
    showNotification('❌ To\'lov tizimi topilmadi', 'error');
  }
}

function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
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
// 5️⃣ AUTO-INITIALIZATION
// ============================================

if (window.firebaseAuth) {
  window.firebaseAuth.onAuthStateChanged((user) => {
    if (user) {
      console.log('🔐 User authenticated, initializing coin system...');
      initCoinSystem();
    }
  });
} else {
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (window.firebaseAuth && window.firebaseAuth.currentUser) {
        initCoinSystem();
      }
    }, 1000);
  });
}

// ============================================
// 6️⃣ GLOBAL EXPORTS
// ============================================
window.initCoinSystem = initCoinSystem;
window.updateCoinDisplay = updateCoinDisplay;
window.checkDailyBonus = checkDailyBonus;
window.claimDailyBonusFromUI = claimDailyBonusFromUI;
window.showInsufficientCoinsModal = showInsufficientCoinsModal;
window.closeInsufficientCoinsModal = closeInsufficientCoinsModal;
window.openCoinShop = openCoinShop;
window.closeCoinShop = closeCoinShop;
window.purchaseCoinPackage = purchaseCoinPackage;
window.purchaseSubscription = purchaseSubscription;
window.showNotification = showNotification;
window.showCoinEarnAnimation = showCoinEarnAnimation;

console.log('✅ Coin System (FIXED) loaded successfully!');