// ============================================
// 💳 TELEGRAM MANUAL PAYMENT SYSTEM - FIREBASE VERSION
// ============================================

// ============================================
// 1️⃣ PAYMENT CONFIG
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
// 2️⃣ FIREBASE HELPER
// ============================================

function getFirebaseDB() {
  if (!window.firebaseDB) {
    console.error('❌ Firebase Database not initialized!');
    return null;
  }
  return window.firebaseDB;
}

// ============================================
// 3️⃣ PAYMENT MODAL UI
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
        
        <button 
          onclick="openTelegram('${productType}', '${userName}', '${user.uid}', '${user.email}')" 
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

// ============================================
// 4️⃣ COPY CARD NUMBER
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
// 5️⃣ TELEGRAM DEEP LINK (FIREBASE)
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
  
  // ✅ Firebase'ga saqlash
  logPaymentAttemptToFirebase(productType, userName, userId, userEmail);
}

// ============================================
// 6️⃣ FIREBASE PAYMENT LOGGING
// ============================================

async function logPaymentAttemptToFirebase(productType, userName, userId, userEmail) {
  const db = getFirebaseDB();
  if (!db) return;
  
  try {
    const paymentRef = db.ref('payment_attempts').push();
    await paymentRef.set({
      productType,
      userName,
      userId,
      userEmail,
      timestamp: new Date().toISOString(),
      status: 'pending',
      product: PAYMENT_CONFIG.PRODUCTS[productType]
    });
    
    console.log('💳 Payment logged to Firebase:', paymentRef.key);
    showNotification('✅ To\'lov so\'rovi yuborildi', 'success');
  } catch (error) {
    console.error('❌ Firebase logging error:', error);
  }
}

// ============================================
// 7️⃣ ADMIN PANEL (FIREBASE)
// ============================================

async function openAdminPanel() {
  const user = window.firebaseAuth?.currentUser;
  if (!user || !isAdmin(user.uid)) {
    showNotification('❌ Ruxsat yo\'q', 'error');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay-inline admin-panel-modal';
  modal.innerHTML = `
    <div class="modal-inline" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
      <div class="modal-header-inline" style="position: sticky; top: 0; background: white; z-index: 10;">
        <h3>👨‍💼 Admin Panel - To'lovlarni tasdiqlash</h3>
        <button class="modal-close-inline" onclick="closeAdminPanel()">×</button>
      </div>
      
      <div class="modal-body-inline" style="padding: 20px;">
        <div id="pendingPaymentsList" style="min-height: 200px;">
          <div style="text-align: center; padding: 40px; color: #6b7280;">
            <div class="spinner" style="margin: 0 auto 10px; width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            Yuklanmoqda...
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
  document.body.style.overflow = 'hidden';
  
  // Load pending payments from Firebase
  await loadPendingPayments();
}

async function loadPendingPayments() {
  const db = getFirebaseDB();
  if (!db) return;
  
  try {
    const snapshot = await db.ref('payment_attempts').orderByChild('status').equalTo('pending').once('value');
    const payments = [];
    
    snapshot.forEach((child) => {
      payments.push({
        key: child.key,
        ...child.val()
      });
    });
    
    // Sort by timestamp (newest first)
    payments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const container = document.getElementById('pendingPaymentsList');
    if (!container) return;
    
    if (payments.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 40px;">Kutilayotgan to\'lovlar yo\'q</p>';
      return;
    }
    
    container.innerHTML = payments.map(payment => `
      <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 15px;">
          <div style="flex: 1; min-width: 250px;">
            <h4 style="margin: 0 0 8px 0; color: #1f2937;">👤 ${payment.userName}</h4>
            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
              📧 ${payment.userEmail}<br>
              🆔 ${payment.userId}<br>
              📦 ${payment.product?.nameUz || 'Unknown'}<br>
              💰 ${formatPrice(payment.product?.price || 0)} so'm<br>
              📅 ${new Date(payment.timestamp).toLocaleString('uz-UZ')}
            </p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button 
              onclick="approvePaymentFirebase('${payment.key}', '${payment.userId}', '${payment.productType}')" 
              style="padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s;"
              onmouseover="this.style.background='#059669'"
              onmouseout="this.style.background='#10b981'"
            >
              ✅ Tasdiqlash
            </button>
            <button 
              onclick="rejectPaymentFirebase('${payment.key}')" 
              style="padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s;"
              onmouseover="this.style.background='#dc2626'"
              onmouseout="this.style.background='#ef4444'"
            >
              ❌ Rad etish
            </button>
          </div>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('❌ Error loading payments:', error);
    const container = document.getElementById('pendingPaymentsList');
    if (container) {
      container.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 40px;">❌ Xatolik yuz berdi</p>';
    }
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
// 8️⃣ APPROVE/REJECT PAYMENTS (FIREBASE)
// ============================================

async function approvePaymentFirebase(paymentKey, userId, productType) {
  const db = getFirebaseDB();
  if (!db) return;
  
  try {
    // Update payment status
    await db.ref(`payment_attempts/${paymentKey}`).update({
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: window.firebaseAuth?.currentUser?.uid
    });
    
    // Get product info
    const product = PAYMENT_CONFIG.PRODUCTS[productType];
    
    // Update user's subscription or coins
    if (productType === 'PRO' || productType === 'PRO_SUB') {
      await db.ref(`users/${userId}/subscription`).set({
        type: 'pro',
        expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        activatedAt: new Date().toISOString()
      });
      showNotification('✅ PRO obuna faollashtirildi!', 'success');
    } else if (productType === 'STANDARD_SUB') {
      await db.ref(`users/${userId}/subscription`).set({
        type: 'standard',
        expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        activatedAt: new Date().toISOString()
      });
      showNotification('✅ Standard obuna faollashtirildi!', 'success');
    } else if (product.coins) {
      const coinsToAdd = product.coins + (product.bonus || 0);
      const userCoinsRef = db.ref(`users/${userId}/coins`);
      const snapshot = await userCoinsRef.once('value');
      const currentCoins = snapshot.val() || 0;
      await userCoinsRef.set(currentCoins + coinsToAdd);
      showNotification(`✅ ${coinsToAdd} coin qo'shildi!`, 'success');
    }
    
    // Reload admin panel
    closeAdminPanel();
    setTimeout(() => openAdminPanel(), 300);
    
  } catch (error) {
    console.error('❌ Approve error:', error);
    showNotification('❌ Xatolik yuz berdi', 'error');
  }
}

async function rejectPaymentFirebase(paymentKey) {
  const db = getFirebaseDB();
  if (!db) return;
  
  try {
    await db.ref(`payment_attempts/${paymentKey}`).update({
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: window.firebaseAuth?.currentUser?.uid
    });
    
    showNotification('❌ To\'lov rad etildi', 'info');
    
    // Reload admin panel
    closeAdminPanel();
    setTimeout(() => openAdminPanel(), 300);
    
  } catch (error) {
    console.error('❌ Reject error:', error);
    showNotification('❌ Xatolik yuz berdi', 'error');
  }
}

// ============================================
// 9️⃣ ADMIN CHECK
// ============================================

function isAdmin(userId) {
  const adminIds = ['HYin7lK9AEZNHBnd8zbFVKp2Wc43']; // ✅ Sizning UID
  return adminIds.includes(userId);
}

// ============================================
// 🔟 HELPER FUNCTIONS
// ============================================

function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// ============================================
// 1️⃣1️⃣ ANIMATIONS
// ============================================

const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// ============================================
// 1️⃣2️⃣ GLOBAL EXPORTS
// ============================================

window.openSubscriptionPaymentModal = openSubscriptionPaymentModal;
window.closeSubscriptionPaymentModal = closeSubscriptionPaymentModal;
window.copySubscriptionCardNumber = copySubscriptionCardNumber;
window.openTelegram = openTelegram;
window.openAdminPanel = openAdminPanel;
window.closeAdminPanel = closeAdminPanel;
window.approvePaymentFirebase = approvePaymentFirebase;
window.rejectPaymentFirebase = rejectPaymentFirebase;

console.log('✅ Telegram Payment System (Firebase Version) loaded!');