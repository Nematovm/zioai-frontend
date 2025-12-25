// ============================================
// 💳 TELEGRAM PAYMENT SYSTEM - FIXED VERSION
// ============================================

const PAYMENT_CONFIG = {
  TELEGRAM: {
    username: 'muhammadali_100',
    phoneNumber: '+998916428186'
  },
  
  CARD_NUMBER: '9860 1201 3511 5240',
  CARD_HOLDER: 'GULLOLA NARZULLAEVA',
  
  PRODUCTS: {
    PRO: {
      name: 'PRO Subscription',
      nameUz: 'PRO Obuna',
      price: 50000,
      duration: '1 oy',
      benefits: ['Cheksiz coinlar', 'Barcha premium toollar', 'Reklama yo\'q', 'Birinchi qo\'llab-quvvatlash']
    },
    STANDARD_SUB: {
      name: 'Standard Subscription',
      nameUz: 'Standard Obuna',
      price: 25000,
      duration: '1 oy',
      benefits: ['100 coin/kun', 'Barcha toollar', 'Reklama yo\'q']
    },
    PRO_SUB: {
      name: 'PRO Subscription',
      nameUz: 'PRO Obuna',
      price: 50000,
      duration: '1 oy',
      benefits: ['Cheksiz coinlar', 'Barcha premium toollar', 'Reklama yo\'q', 'Birinchi qo\'llab-quvvatlash']
    },
    COINS_50: { name: '50 Coins', nameUz: '50 Coin', price: 10000, coins: 50 },
    COINS_100: { name: '100 Coins', nameUz: '100 Coin', price: 17000, coins: 100, bonus: 10 },
    COINS_250: { name: '250 Coins', nameUz: '250 Coin', price: 40000, coins: 250, bonus: 50 },
    COINS_500: { name: '500 Coins', nameUz: '500 Coin', price: 70000, coins: 500, bonus: 150 }
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getDatabase() {
  if (!window.firebaseDatabase) {
    console.error('❌ Firebase Database not initialized!');
    return null;
  }
  return window.firebaseDatabase;
}

function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

async function isAdmin(userId) {
  const db = getDatabase();
  if (!db || !userId) return false;
  
  try {
    const adminRef = window.firebaseRef(db, `admins/${userId}`);
    const snapshot = await window.firebaseGet(adminRef);
    return snapshot.val() === true;
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

// ============================================
// PAYMENT MODAL
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
        <button class="modal-close-inline" onclick="closeSubscriptionPaymentModal()" style="position: absolute; right: 20px; top: 20px; background: none; border: none; font-size: 28px; cursor: pointer; color: #6b7280;">×</button>
      </div>
      
      <div class="modal-body-inline" style="padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea20, #764ba220); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h4 style="margin: 0 0 5px 0;">${product.nameUz}</h4>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                ${product.duration ? `📅 ${product.duration}` : `🪙 ${product.coins} ta coin`}
                ${product.bonus ? ` + <strong style="color: #10b981;">${product.bonus} bonus!</strong>` : ''}
              </p>
            </div>
            <div style="font-size: 24px; font-weight: bold; color: #10b981;">
              ${formatPrice(product.price)} so'm
            </div>
          </div>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0 0 10px 0; font-weight: 600; color: #92400e;">📋 To'lov qilish bo'yicha ko'rsatma:</p>
          <ol style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px;">
            <li>Karta raqamini nusxalang</li>
            <li>Pul o'tkazing</li>
            <li>"Telegramga yozish" tugmasini bosing</li>
            <li>Xabarni yuboring</li>
          </ol>
        </div>
        
        <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; font-weight: 600;">💳 Karta raqami:</p>
          <div style="display: flex; gap: 10px; align-items: center;">
            <input type="text" id="cardNumberInput" value="${PAYMENT_CONFIG.CARD_NUMBER}" readonly
              style="flex: 1; padding: 12px; font-size: 18px; font-weight: bold; border: 2px solid #e5e7eb; border-radius: 8px; font-family: monospace;">
            <button onclick="copySubscriptionCardNumber()" 
              style="padding: 12px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
              📋 Nusxalash
            </button>
          </div>
          <p style="margin: 10px 0 0 0; font-size: 13px; color: #6b7280;">
            📌 Karta egasi: <strong>${PAYMENT_CONFIG.CARD_HOLDER}</strong>
          </p>
        </div>
        
        <button onclick="openTelegram('${productType}', '${userName}', '${user.uid}', '${user.email}')" 
          style="width: 100%; padding: 16px; background: linear-gradient(135deg, #0088cc, #006699); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer;">
          📱 Telegramga yozish
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
  document.body.style.overflow = 'hidden';
}

function closeSubscriptionPaymentModal() {
  const modal = document.querySelector('.payment-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
  document.body.style.overflow = '';
}

function copySubscriptionCardNumber() {
  const input = document.getElementById('cardNumberInput');
  if (!input) return;
  
  try {
    navigator.clipboard.writeText(PAYMENT_CONFIG.CARD_NUMBER);
    showNotification('✅ Karta raqami nusxalandi!', 'success');
  } catch (err) {
    console.error('Copy error:', err);
  }
}

// ============================================
// TELEGRAM
// ============================================

function openTelegram(productType, userName, userId, userEmail) {
  const product = PAYMENT_CONFIG.PRODUCTS[productType];
  if (!product) return;
  
  const message = `Assalomu alaykum 👋

Mening ismim: ${userName}
Email: ${userEmail}

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
  
  logPaymentAttempt(productType, userName, userId, userEmail);
}

// ============================================
// LOG PAYMENT
// ============================================

async function logPaymentAttempt(productType, userName, userId, userEmail) {
  const db = getDatabase();
  if (!db) return;
  
  try {
    const paymentsRef = window.firebaseRef(db, 'payment_attempts');
    const newPaymentRef = window.firebasePush(paymentsRef);
    
    await window.firebaseSet(newPaymentRef, {
      productType,
      userName,
      userId,
      userEmail,
      timestamp: new Date().toISOString(),
      status: 'pending',
      product: PAYMENT_CONFIG.PRODUCTS[productType]
    });
    
    console.log('💳 Payment logged:', newPaymentRef.key);
    showNotification('✅ To\'lov so\'rovi yuborildi', 'success');
  } catch (error) {
    console.error('❌ Payment log error:', error);
  }
}

// ============================================
// ADMIN PANEL - FIXED
// ============================================

async function openAdminPanel() {
  const user = window.firebaseAuth?.currentUser;
  if (!user) {
    showNotification('❌ Tizimga kiring', 'error');
    return;
  }
  
  const adminStatus = await isAdmin(user.uid);
  if (!adminStatus) {
    showNotification('❌ Ruxsat yo\'q', 'error');
    console.error('❌ Not admin:', user.email);
    return;
  }
  
  console.log('✅ Admin verified, opening panel...');
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay-inline admin-panel-modal';
  modal.innerHTML = `
    <div class="modal-inline" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
      <div class="modal-header-inline" style="position: sticky; top: 0; background: white; z-index: 10;">
        <h3>👨‍💼 Admin Panel - To'lovlarni tasdiqlash</h3>
        <button class="modal-close-inline" onclick="closeAdminPanel()">×</button>
      </div>
      <div class="modal-body-inline" style="padding: 20px;">
        <div id="pendingPaymentsList">
          <div style="text-align: center; padding: 40px; color: #6b7280;">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p style="margin-top: 15px;">Yuklanmoqda...</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
  document.body.style.overflow = 'hidden';
  
  await loadPendingPayments();
}

async function loadPendingPayments() {
  const db = getDatabase();
  if (!db) {
    console.error('❌ Database not available');
    return;
  }
  
  const container = document.getElementById('pendingPaymentsList');
  if (!container) return;
  
  try {
    // Read ALL payments first
    const paymentsRef = window.firebaseRef(db, 'payment_attempts');
    const snapshot = await window.firebaseGet(paymentsRef);
    
    console.log('📊 Total payments:', snapshot.size);
    
    const payments = [];
    
    snapshot.forEach((child) => {
      const data = child.val();
      if (data.status === 'pending') {
        payments.push({
          key: child.key,
          ...data
        });
      }
    });
    
    console.log('⏳ Pending payments:', payments.length);
    
    // Sort by timestamp
    payments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (payments.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 40px;">Kutilayotgan to\'lovlar yo\'q</p>';
      return;
    }
    
    container.innerHTML = payments.map(payment => `
      <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 15px;">
          <div style="flex: 1; min-width: 250px;">
            <h4 style="margin: 0 0 8px 0;">👤 ${payment.userName}</h4>
            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
              📧 ${payment.userEmail}<br>
              🆔 ${payment.userId}<br>
              📦 ${payment.product?.nameUz || 'Unknown'}<br>
              💰 ${formatPrice(payment.product?.price || 0)} so'm<br>
              📅 ${new Date(payment.timestamp).toLocaleString('uz-UZ')}
            </p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button onclick="approvePayment('${payment.key}', '${payment.userId}', '${payment.productType}')" 
              style="padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
              ✅ Tasdiqlash
            </button>
            <button onclick="rejectPayment('${payment.key}')" 
              style="padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
              ❌ Rad etish
            </button>
          </div>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('❌ Load payments error:', error);
    
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <p style="color: #ef4444; margin-bottom: 10px;">❌ Xatolik yuz berdi</p>
        <p style="color: #6b7280; font-size: 14px;">${error.message}</p>
        <button onclick="loadPendingPayments()" style="margin-top: 15px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">
          🔄 Qayta urinish
        </button>
      </div>
    `;
  }
}

function closeAdminPanel() {
  const modal = document.querySelector('.admin-panel-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
  document.body.style.overflow = '';
}

// ============================================
// APPROVE/REJECT
// ============================================

async function approvePayment(paymentKey, userId, productType) {
  const db = getDatabase();
  if (!db) return;
  
  try {
    const paymentRef = window.firebaseRef(db, `payment_attempts/${paymentKey}`);
    await window.firebaseUpdate(paymentRef, {
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: window.firebaseAuth?.currentUser?.uid
    });
    
    const product = PAYMENT_CONFIG.PRODUCTS[productType];
    
    if (productType === 'PRO' || productType === 'PRO_SUB') {
      const subRef = window.firebaseRef(db, `users/${userId}/subscription`);
      await window.firebaseSet(subRef, {
        type: 'pro',
        expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        activatedAt: new Date().toISOString()
      });
      showNotification('✅ PRO obuna faollashtirildi!', 'success');
    } else if (productType === 'STANDARD_SUB') {
      const subRef = window.firebaseRef(db, `users/${userId}/subscription`);
      await window.firebaseSet(subRef, {
        type: 'standard',
        expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        activatedAt: new Date().toISOString()
      });
      showNotification('✅ Standard obuna faollashtirildi!', 'success');
    } else if (product.coins) {
      const coinsToAdd = product.coins + (product.bonus || 0);
      const coinsRef = window.firebaseRef(db, `users/${userId}/coins`);
      const snapshot = await window.firebaseGet(coinsRef);
      const currentCoins = snapshot.val() || 0;
      await window.firebaseSet(coinsRef, currentCoins + coinsToAdd);
      showNotification(`✅ ${coinsToAdd} coin qo'shildi!`, 'success');
    }
    
    closeAdminPanel();
    setTimeout(() => openAdminPanel(), 300);
    
  } catch (error) {
    console.error('❌ Approve error:', error);
    showNotification('❌ Xatolik yuz berdi', 'error');
  }
}

async function rejectPayment(paymentKey) {
  const db = getDatabase();
  if (!db) return;
  
  try {
    const paymentRef = window.firebaseRef(db, `payment_attempts/${paymentKey}`);
    await window.firebaseUpdate(paymentRef, {
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: window.firebaseAuth?.currentUser?.uid
    });
    
    showNotification('❌ To\'lov rad etildi', 'info');
    closeAdminPanel();
    setTimeout(() => openAdminPanel(), 300);
    
  } catch (error) {
    console.error('❌ Reject error:', error);
    showNotification('❌ Xatolik yuz berdi', 'error');
  }
}

// ============================================
// GLOBAL EXPORTS
// ============================================

window.openSubscriptionPaymentModal = openSubscriptionPaymentModal;
window.closeSubscriptionPaymentModal = closeSubscriptionPaymentModal;
window.copySubscriptionCardNumber = copySubscriptionCardNumber;
window.openTelegram = openTelegram;
window.openAdminPanel = openAdminPanel;
window.closeAdminPanel = closeAdminPanel;
window.approvePayment = approvePayment;
window.rejectPayment = rejectPayment;
window.loadPendingPayments = loadPendingPayments;

console.log('✅ Subscription.js (FIXED) loaded!');