// ============================================
// 💳 TELEGRAM MANUAL PAYMENT SYSTEM - ZIYOAI (FIXED)
// ============================================

// ============================================
// 1️⃣ PAYMENT CONFIG
// ============================================
const PAYMENT_CONFIG = {
  // Sizning Telegram ma'lumotlaringiz
  TELEGRAM: {
    username: 'muhammadali_100',
    phoneNumber: '+998916428186'
  },
  
  // Karta raqami
  CARD_NUMBER: '9860 1201 3511 5240',
  CARD_HOLDER: 'GULLOLA NARZULLAEVA',
  
  // Mahsulotlar
  PRODUCTS: {
    PRO: {
      name: 'PRO Subscription',
      nameUz: 'PRO Obuna',
      price: 50000,
      duration: '1 oy',
      benefits: [
        'Cheksiz coinlar',
        'Barcha premium toollar',
        'Reklama yo\'q',
        'Birinchi qo\'llab-quvvatlash'
      ]
    },
    
    STANDARD_SUB: {
      name: 'Standard Subscription',
      nameUz: 'Standard Obuna',
      price: 25000,
      duration: '1 oy',
      benefits: [
        '100 coin/kun',
        'Barcha toollar',
        'Reklama yo\'q'
      ]
    },
    
    PRO_SUB: {
      name: 'PRO Subscription',
      nameUz: 'PRO Obuna',
      price: 50000,
      duration: '1 oy',
      benefits: [
        'Cheksiz coinlar',
        'Barcha premium toollar',
        'Reklama yo\'q',
        'Birinchi qo\'llab-quvvatlash'
      ]
    },
    
    // ✅ COIN PACKAGES (to'g'rilangan)
    COINS_50: {
      name: '50 Coins',
      nameUz: '50 Coin',
      price: 10000,
      coins: 50
    },
    COINS_100: {
      name: '100 Coins',
      nameUz: '100 Coin',
      price: 17000,
      coins: 100,
      bonus: 10
    },
    COINS_250: {
      name: '250 Coins',
      nameUz: '250 Coin',
      price: 40000,
      coins: 250,
      bonus: 50
    },
    COINS_500: {
      name: '500 Coins',
      nameUz: '500 Coin',
      price: 70000,
      coins: 500,
      bonus: 150
    }
  }
};

// ============================================
// 2️⃣ PAYMENT MODAL UI (TO'G'RILANGAN)
// ============================================

function openSubscriptionPaymentModal(productType) {
  const product = PAYMENT_CONFIG.PRODUCTS[productType];
  if (!product) {
    showNotification('❌ Mahsulot topilmadi', 'error');
    return;
  }
  
  const user = window.firebaseAuth?.currentUser;
  if (!user) {
    showNotification('❌ Iltimos avval tizimga kiring', 'error');
    return;
  }
  
  const userName = user.displayName || user.email?.split('@')[0] || 'User';
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay-inline payment-modal';
  modal.innerHTML = `
    <div class="modal-inline" style="max-width: 500px; max-height: 90vh; overflow-y: auto;">
      <div class="modal-header-inline" style="position: sticky; top: 0; background: white; z-index: 10; padding: 20px; border-bottom: 2px solid #e5e7eb;">
        <h3 style="margin: 0;">💳 To'lov qilish</h3>
        <button class="modal-close-inline" onclick="closeSubscriptionPaymentModal()" style="position: absolute; right: 20px; top: 20px; background: none; border: none; font-size: 28px; cursor: pointer; color: #6b7280; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s;">×</button>
      </div>
      
      <div class="modal-body-inline" style="padding: 20px;">
        <!-- Mahsulot ma'lumoti -->
        <div style="background: linear-gradient(135deg, #667eea20, #764ba220); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h4 style="margin: 0 0 5px 0; color: #1f2937;">${product.nameUz}</h4>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                ${product.duration ? `📅 ${product.duration}` : `🪙 ${product.coins} ta coin`}
                ${product.bonus ? ` + <strong style="color: #10b981;">${product.bonus} bonus!</strong>` : ''}
              </p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 24px; font-weight: bold; color: #10b981;">
                ${formatPrice(product.price)} so'm
              </div>
            </div>
          </div>
          
          ${product.benefits ? `
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #374151;">✨ Imkoniyatlar:</p>
              <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px;">
                ${product.benefits.map(b => `<li style="margin: 4px 0;">${b}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
        
        <!-- To'lov ko'rsatmalari -->
        <div style="background: #fef3c7; padding: 15px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0 0 10px 0; font-weight: 600; color: #92400e;">
            📋 To'lov qilish bo'yicha ko'rsatma:
          </p>
          <ol style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px;">
            <li style="margin: 5px 0;">Karta raqamini nusxalang</li>
            <li style="margin: 5px 0;">Pul o'tkazing</li>
            <li style="margin: 5px 0;">"Telegramga yozish" tugmasini bosing</li>
            <li style="margin: 5px 0;">Xabarni yuboring</li>
          </ol>
        </div>
        
        <!-- Karta ma'lumotlari -->
        <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; font-weight: 600;">
            💳 Karta raqami:
          </p>
          <div style="display: flex; gap: 10px; align-items: center;">
            <input 
              type="text" 
              id="cardNumberInput" 
              value="${PAYMENT_CONFIG.CARD_NUMBER}" 
              readonly
              style="flex: 1; padding: 12px; font-size: 18px; font-weight: bold; border: 2px solid #e5e7eb; border-radius: 8px; font-family: monospace; letter-spacing: 2px;"
            >
            <button 
              onclick="copySubscriptionCardNumber()" 
              style="padding: 12px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s;"
              onmouseover="this.style.background='#2563eb'"
              onmouseout="this.style.background='#3b82f6'"
            >
              <i class="bi bi-copy"></i> Nusxalash
            </button>
          </div>
          <p style="margin: 10px 0 0 0; font-size: 13px; color: #6b7280;">
            📌 Karta egasi: <strong>${PAYMENT_CONFIG.CARD_HOLDER}</strong>
          </p>
        </div>
        
        <!-- Telegram button -->
        <button 
          onclick="openTelegram('${productType}', '${userName}')" 
          style="width: 100%; padding: 16px; background: linear-gradient(135deg, #0088cc, #006699); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.3s;"
          onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(0,136,204,0.3)'"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.2-.04-.28-.02-.13.02-2.18 1.38-6.15 4.05-.58.41-1.1.61-1.57.6-.52-.01-1.52-.29-2.26-.53-.91-.29-1.63-.45-1.57-.95.03-.26.36-.53.98-.8 3.84-1.68 6.4-2.79 7.69-3.34 3.66-1.52 4.42-1.79 4.92-1.8.11 0 .35.03.51.17.13.12.17.28.19.39.01.11.03.35.01.54z"/>
          </svg>
          Telegramga yozish
        </button>
        
        <p style="margin: 15px 0 0 0; text-align: center; color: #6b7280; font-size: 13px;">
          ℹ️ To'lovni tasdiqlash 5-10 daqiqa ichida amalga oshiriladi
        </p>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
  
  // ✅ Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden';
}

function closeSubscriptionPaymentModal() {
  const modal = document.querySelector('.payment-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
  
  // ✅ Re-enable body scroll
  document.body.style.overflow = '';
}

// ============================================
// 3️⃣ COPY CARD NUMBER
// ============================================

function copySubscriptionCardNumber() {
  const input = document.getElementById('cardNumberInput');
  if (!input) return;
  
  input.select();
  input.setSelectionRange(0, 99999);
  
  try {
    navigator.clipboard.writeText(PAYMENT_CONFIG.CARD_NUMBER);
    showNotification('✅ Karta raqami nusxalandi!', 'success');
    
    const btn = event.target.closest('button');
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="bi bi-check-lg"></i> Nusxalandi!';
      btn.style.background = '#10b981';
      
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '#3b82f6';
      }, 2000);
    }
  } catch (err) {
    document.execCommand('copy');
    showNotification('✅ Karta raqami nusxalandi!', 'success');
  }
}

// ============================================
// 4️⃣ TELEGRAM DEEP LINK
// ============================================

function openTelegram(productType, userName) {
  const product = PAYMENT_CONFIG.PRODUCTS[productType];
  if (!product) return;
  
  const message = `Assalomu alaykum 👋

Mening ismim: ${userName}

Men ZiyoAI'da ${product.nameUz} xarid qilmoqchiman.

💰 Narxi: ${formatPrice(product.price)} so'm
📦 Mahsulot: ${product.nameUz}
${product.coins ? `🪙 Coinlar: ${product.coins}${product.bonus ? ` + ${product.bonus} bonus` : ''}` : ''}
${product.duration ? `📅 Davomiyligi: ${product.duration}` : ''}

Pul o'tkazdim. Iltimos tasdiqlang! 🙏`;

  const encodedMessage = encodeURIComponent(message);
  const telegramUrl = `https://t.me/${PAYMENT_CONFIG.TELEGRAM.username}?text=${encodedMessage}`;
  
  window.open(telegramUrl, '_blank');
  showNotification('📱 Telegram ochilmoqda...', 'info');
  
  logPaymentAttempt(productType, userName);
}

// ============================================
// 5️⃣ HELPER FUNCTIONS
// ============================================

function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function logPaymentAttempt(productType, userName) {
  const attempts = JSON.parse(localStorage.getItem('payment_attempts') || '[]');
  attempts.push({
    productType,
    userName,
    timestamp: new Date().toISOString(),
    status: 'pending'
  });
  localStorage.setItem('payment_attempts', JSON.stringify(attempts));
  
  console.log('💳 Payment attempt logged:', { productType, userName });
}

// ============================================
// 6️⃣ ADMIN PANEL
// ============================================

function openAdminPanel() {
  const user = window.firebaseAuth?.currentUser;
  if (!user || !isAdmin(user.uid)) {
    showNotification('❌ Ruxsat yo\'q', 'error');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay-inline admin-panel-modal';
  modal.innerHTML = `
    <div class="modal-inline" style="max-width: 800px;">
      <div class="modal-header-inline">
        <h3>👨‍💼 Admin Panel - To'lovlarni tasdiqlash</h3>
        <button class="modal-close-inline" onclick="closeAdminPanel()">×</button>
      </div>
      
      <div class="modal-body-inline">
        <div id="pendingPaymentsList">
          ${generatePendingPaymentsHTML()}
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
}

function closeAdminPanel() {
  const modal = document.querySelector('.admin-panel-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

function generatePendingPaymentsHTML() {
  const attempts = JSON.parse(localStorage.getItem('payment_attempts') || '[]');
  const pending = attempts.filter(a => a.status === 'pending');
  
  if (pending.length === 0) {
    return '<p style="text-align: center; color: #6b7280; padding: 40px;">Kutilayotgan to\'lovlar yo\'q</p>';
  }
  
  return pending.map((attempt, index) => `
    <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div>
          <h4 style="margin: 0 0 8px 0;">${attempt.userName}</h4>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            📦 ${PAYMENT_CONFIG.PRODUCTS[attempt.productType]?.nameUz || 'Unknown'}<br>
            📅 ${new Date(attempt.timestamp).toLocaleString('uz-UZ')}
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button 
            onclick="approvePayment(${index})" 
            style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;"
          >
            ✅ Tasdiqlash
          </button>
          <button 
            onclick="rejectPayment(${index})" 
            style="padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;"
          >
            ❌ Rad etish
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function approvePayment(index) {
  const attempts = JSON.parse(localStorage.getItem('payment_attempts') || '[]');
  const pending = attempts.filter(a => a.status === 'pending');
  const payment = pending[index];
  
  if (!payment) return;
  
  const product = PAYMENT_CONFIG.PRODUCTS[payment.productType];
  
  const allAttempts = JSON.parse(localStorage.getItem('payment_attempts') || '[]');
  const attemptIndex = allAttempts.findIndex(a => 
    a.timestamp === payment.timestamp && a.userName === payment.userName
  );
  
  if (attemptIndex !== -1) {
    allAttempts[attemptIndex].status = 'approved';
    allAttempts[attemptIndex].approvedAt = new Date().toISOString();
    localStorage.setItem('payment_attempts', JSON.stringify(allAttempts));
  }
  
  if (payment.productType === 'PRO' || payment.productType === 'PRO_SUB') {
    activatePROSubscription();
  } else if (payment.productType === 'STANDARD_SUB') {
    activateStandardSubscription();
  } else if (product.coins) {
    addCoinsToUser(product.coins + (product.bonus || 0));
  }
  
  showNotification('✅ To\'lov tasdiqlandi!', 'success');
  closeAdminPanel();
  openAdminPanel();
}

function rejectPayment(index) {
  const attempts = JSON.parse(localStorage.getItem('payment_attempts') || '[]');
  const pending = attempts.filter(a => a.status === 'pending');
  const payment = pending[index];
  
  if (!payment) return;
  
  const allAttempts = JSON.parse(localStorage.getItem('payment_attempts') || '[]');
  const attemptIndex = allAttempts.findIndex(a => 
    a.timestamp === payment.timestamp && a.userName === payment.userName
  );
  
  if (attemptIndex !== -1) {
    allAttempts[attemptIndex].status = 'rejected';
    allAttempts[attemptIndex].rejectedAt = new Date().toISOString();
    localStorage.setItem('payment_attempts', JSON.stringify(allAttempts));
  }
  
  showNotification('❌ To\'lov rad etildi', 'info');
  closeAdminPanel();
  openAdminPanel();
}

function activatePROSubscription() {
  if (!window.coinManager) return;
  
  window.coinManager.data.subscription = 'pro';
  window.coinManager.data.subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  window.coinManager.save();
  
  showNotification('🎉 PRO obuna faollashtirildi!', 'success');
}

function activateStandardSubscription() {
  if (!window.coinManager) return;
  
  window.coinManager.data.subscription = 'standard';
  window.coinManager.data.subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  window.coinManager.save();
  
  showNotification('🎉 Standard obuna faollashtirildi!', 'success');
}

function addCoinsToUser(amount) {
  if (!window.coinManager) return;
  
  window.coinManager.addCoins(amount, 'Telegram payment');
  showCoinEarnAnimation(amount);
  showNotification(`🪙 ${amount} coin qo'shildi!`, 'success');
}

function isAdmin(userId) {
  const adminIds = ['YOUR_ADMIN_UID'];
  return adminIds.includes(userId);
}

// ============================================
// 7️⃣ GLOBAL EXPORTS
// ============================================

window.openSubscriptionPaymentModal = openSubscriptionPaymentModal;
window.closeSubscriptionPaymentModal = closeSubscriptionPaymentModal;
window.copySubscriptionCardNumber = copySubscriptionCardNumber;
window.openTelegram = openTelegram;
window.openAdminPanel = openAdminPanel;
window.closeAdminPanel = closeAdminPanel;
window.approvePayment = approvePayment;
window.rejectPayment = rejectPayment;

console.log('✅ Telegram Payment System (FIXED) loaded!');