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
      benefits: ['20 coin/kun', 'Barcha toollar', 'Reklama yo\'q']
    },
    PRO_SUB: {
      name: 'PRO Subscription',
      nameUz: 'PRO Obuna',
      price: 50000,
      duration: '1 oy',
      benefits: ['50 coin/kun', 'Barcha premium toollar', 'Reklama yo\'q', 'Birinchi qo\'llab-quvvatlash']
    },
    COINS_50: { name: '50 Coins', nameUz: '50 Coin', price: 10000, coins: 50 },
    COINS_100: { name: '120 Coins', nameUz: '120 Coin', price: 20000, coins: 120, bonus: 20 },
    COINS_250: { name: '300 Coins', nameUz: '300 Coin', price: 45000, coins: 300, bonus: 50 },
    COINS_500: { name: '400 Coins', nameUz: '400 Coin', price: 70000, coins: 400, bonus: 100 }
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
// IMPROVED PAYMENT MODAL - MODERN UI DESIGN
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
    <div class="modal-inline payment-modal-content" style="
      max-width: 720px; 
      width: 95vw;
      max-height: 92vh; 
      overflow-y: auto;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
      animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    ">
      <!-- Header with Decorative Elements -->
      <div class="modal-header-inline" style="
        position: sticky; 
        top: 0; 
        background: linear-gradient(
    151deg,
    rgba(93, 156, 245, 1) 0%,
    rgba(44, 170, 154, 1) 60%,
    rgba(35, 195, 101, 1) 100%
  );;
        z-index: 10; 
        padding: 32px 36px;
        border-radius: 24px 0px 0 0;
        position: relative;
        overflow: hidden;
      ">
        <!-- Decorative Background Pattern -->
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0%, transparent 50%);
          opacity: 0.6;
        "></div>
        
        <div style="position: relative; z-index: 1;">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
            <div style="
              width: 56px;
              height: 56px;
              background: rgba(255,255,255,0.2);
              backdrop-filter: blur(10px);
              border-radius: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 28px;
              box-shadow: 0 8px 16px rgba(0,0,0,0.1);
            ">💳</div>
            <div>
              <h3 style="
                margin: 0; 
                color: white; 
                font-size: 28px; 
                font-weight: 700;
                letter-spacing: -0.5px;
                text-shadow: 0 2px 8px rgba(0,0,0,0.1);
              ">To'lov qilish</h3>
              <p style="
                margin: 4px 0 0 0;
                color: rgba(255,255,255,0.9);
                font-size: 14px;
                font-weight: 500;
              ">Xavfsiz va tez to'lov tizimi</p>
            </div>
          </div>
        </div>
        
        <button class="modal-close-inline" onclick="closeSubscriptionPaymentModal()" style="
          position: absolute; 
          right: 24px; 
          top: 24px; 
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255,255,255,0.2);
          width: 44px;
          height: 44px;
          border-radius: 12px;
          font-size: 24px; 
          cursor: pointer; 
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          font-weight: 300;
        " onmouseover="this.style.background='rgba(255,255,255,0.25)'; this.style.transform='rotate(90deg) scale(1.1)';" 
           onmouseout="this.style.background='rgba(255,255,255,0.15)'; this.style.transform='rotate(0deg) scale(1)';">×</button>
      </div>
      
      <div class="modal-body-inline" style="padding: 36px;">
        <!-- Product Card with Modern Design -->
        <div style="
          background: linear-gradient(135deg, #667eea15, #764ba215);
          padding: 32px;
          border-radius: 20px;
          margin-bottom: 28px;
          border: 2px solid #e0e7ff;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 20px 40px rgba(102, 126, 234, 0.15)';" 
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
          <!-- Decorative Corner -->
          <div style="
            position: absolute;
            top: -20px;
            right: -20px;
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #667eea30, #764ba230);
            border-radius: 50%;
            filter: blur(30px);
          "></div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 24px; position: relative;">
            <div class="payment_cost-card" style="flex: 1;">
              <div style="
                display: inline-block;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 6px 14px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 12px;
              ">Premium</div>
              
              <h4 style="
                margin: 0 0 8px 0;
                font-size: 26px;
                font-weight: 700;
                color: #1e293b;
                letter-spacing: -0.5px;
              ">${product.nameUz}</h4>
              
              <p style="
                margin: 0; 
                color: #64748b; 
                font-size: 15px;
                line-height: 1.6;
                font-weight: 500;
              ">
                ${product.duration ? `<span style="display: inline-flex; align-items: center; gap: 6px;"><span style="font-size: 18px;">📅</span> ${product.duration}</span>` : `<span style="display: inline-flex; align-items: center; gap: 6px;"><span style="font-size: 18px;">🪙</span> ${product.coins} ta coin</span>`}
                ${product.bonus ? `<br><span style="color: #10b981; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; margin-top: 6px;"><span style="font-size: 18px;">🎁</span> +${product.bonus} bonus coin!</span>` : ''}
              </p>
            </div>
            <div style="
              background: linear-gradient(135deg, #10b981, #059669);
              color: white;
              padding: 20px 28px;
              border-radius: 16px;
              text-align: center;
              box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
            ">
              <div style="
                font-size: 14px;
                opacity: 0.9;
                margin-bottom: 4px;
                font-weight: 600;
              ">Narx</div>
              <div style="
                font-size: 28px; 
                font-weight: 800;
                line-height: 1.2;
                letter-spacing: -0.5px;
              ">${formatPrice(product.price)}</div>
              <div style="
                font-size: 15px;
                opacity: 0.9;
                margin-top: 2px;
                font-weight: 600;
              ">so'm</div>
            </div>
          </div>
        </div>
        
        <!-- Instructions Card -->
        <div style="
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          padding: 24px 28px;
          border-radius: 16px;
          margin-bottom: 28px;
          border-left: 5px solid #f59e0b;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
        ">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="
              font-size: 28px;
              width: 44px;
              height: 44px;
              background: rgba(245, 158, 11, 0.2);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">📋</div>
            <h4 style="
              margin: 0;
              font-weight: 700;
              color: #92400e;
              font-size: 18px;
            ">To'lov qilish bo'yicha ko'rsatma</h4>
          </div>
          
          <ol style="
            margin: 0; 
            padding-left: 24px; 
            color: #78350f; 
            font-size: 15px;
            line-height: 2;
            font-weight: 500;
          ">
            <li style="padding-left: 8px;">Karta raqamini nusxalang</li>
            <li style="padding-left: 8px;">Belgilangan summani o'tkazing</li>
            <li style="padding-left: 8px;">"Telegramga yozish" tugmasini bosing</li>
            <li style="padding-left: 8px;">To'lov chekini yuboring va tasdiqlang</li>
          </ol>
        </div>
        
        <!-- Card Details Section -->
        <div class="card-number-section" style="
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        ">
          <div class="card-number-section" style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
            <div style="
              font-size: 24px;
              width: 40px;
              height: 40px;
              background: linear-gradient(135deg, #3b82f615, #2563eb15);
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">💳</div>
            <h4 style="
              margin: 0;
              font-size: 17px;
              color: #475569;
              font-weight: 700;
              letter-spacing: -0.3px;
            ">Karta raqami</h4>
          </div>
          
          <div style="
            display: flex;
            gap: 12px;
            align-items: stretch;
          ">
            <input type="text" id="cardNumberInput" value="${PAYMENT_CONFIG.CARD_NUMBER}" readonly
              style="
                flex: 1;
                padding: 18px 20px;
                font-size: 20px;
                font-weight: 700;
                border: 2px solid #e2e8f0;
                border-radius: 14px;
                font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
                background: #f8fafc;
                color: #1e293b;
                letter-spacing: 1px;
                transition: all 0.3s ease;
              "
              onfocus="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 0 0 4px rgba(59, 130, 246, 0.1)';"
              onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none';">
            <button class="copy-card-number" onclick="copySubscriptionCardNumber()" 
              style="
                padding: 18px 28px;
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                color: white;
                border: none;
                border-radius: 14px;
                cursor: pointer;
                font-weight: 700;
                font-size: 15px;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
                white-space: nowrap;
              "
              onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(59, 130, 246, 0.4)';"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 16px rgba(59, 130, 246, 0.3)';">
              <span style="font-size: 18px;">📋</span>
              <span>Nusxalash</span>
            </button> 
          </div>
          
          <div style="
            margin-top: 20px;
            padding: 16px 20px;
            background: linear-gradient(135deg, #f1f5f915, #e2e8f015);
            border-radius: 12px;
            border: 1px dashed #cbd5e1;
          ">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 20px;">👤</span>
              <span style="
                font-size: 14px;
                color: #64748b;
                font-weight: 600;
              ">Karta egasi:</span>
              <strong style="
                color: #1e293b;
                font-size: 16px;
                font-weight: 700;
              ">${PAYMENT_CONFIG.CARD_HOLDER}</strong>
            </div>
          </div>
        </div>
        
        <!-- Telegram Button -->
        <button onclick="openTelegram('${productType}', '${userName}', '${user.uid}', '${user.email}')" 
          style="
            width: 100%;
            padding: 20px 32px;
            background: linear-gradient(135deg, #0088cc, #006699);
            color: white;
            border: none;
            border-radius: 16px;
            font-size: 18px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            box-shadow: 0 8px 24px rgba(0, 136, 204, 0.3);
            position: relative;
            overflow: hidden;
          "
          onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 32px rgba(0, 136, 204, 0.4)';"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 24px rgba(0, 136, 204, 0.3)';">
          <span style="font-size: 24px;"><i class="bi bi-telegram"></i></span>
          <span>Telegramga yozish</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="margin-left: 4px;">
            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <!-- Security Badge -->
        <div style="
          margin-top: 24px;
          padding: 16px;
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 1px solid #bbf7d0;
        ">
          <span style="font-size: 20px;">🔒</span>
          <span style="
            color: #166534;
            font-size: 14px;
            font-weight: 600;
          ">Xavfsiz to'lov tizimi orqali amalga oshiriladi</span>
        </div>
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
    const content = modal.querySelector('.payment-modal-content');
    if (content) {
      content.style.animation = 'modalSlideOut 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    }
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
    
    // Enhanced visual feedback
    const button = event.target.closest('button');
    const originalHTML = button.innerHTML;
    button.innerHTML = '<span style="font-size: 18px;">✅</span><span>Nusxalandi!</span>';
    button.style.background = 'linear-gradient(135deg, #10b981, #059669) !important';
    
    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
    }, 2000);
    
    showNotification('✅ Karta raqami nusxalandi!', 'success');
  } catch (err) {
    console.error('Copy error:', err);
    showNotification('❌ Nusxalashda xatolik', 'error');
  }
}

// Add these CSS animations to your stylesheet or in a <style> tag
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(40px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes modalSlideOut {
    from {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    to {
      opacity: 0;
      transform: translateY(40px) scale(0.95);
    }
  }
  
  .payment-modal-content::-webkit-scrollbar {
    width: 8px;
  }
  
  .payment-modal-content::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 10px;
  }
  
  .payment-modal-content::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 10px;
  }
  
  .payment-modal-content::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #764ba2, #667eea);
  }
`;

// Append the stylesheet to document head
if (!document.querySelector('#payment-modal-styles')) {
  styleSheet.id = 'payment-modal-styles';
  document.head.appendChild(styleSheet);
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
// SAFE OPEN ADMIN PANEL - WITH ERROR HANDLING ✅
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
        <h3>👨‍💼 Admin Panel</h3>
        <button class="modal-close-inline" onclick="closeAdminPanel()">×</button>
      </div>
      <div class="modal-body-inline" style="padding: 20px;">
        
        <!-- BUTTONS SECTION -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px; margin-bottom: 30px;">
          
          <!-- Coin Management Button -->
          <button onclick="viewAllUsersCoins()" style="
            padding: 15px 25px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 700;
            font-size: 15px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          ">
            <i class="bi bi-coin" style="font-size: 20px;"></i>
            <span>Coin Management</span>
          </button>
          
          <!-- Feedbacks Button -->
          <button onclick="openFeedbackManager()" style="
            padding: 15px 25px;
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 700;
            font-size: 15px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
          ">
            <i class="bi bi-chat-left-text-fill" style="font-size: 20px;"></i>
            <span>Feedbacks</span>
            <span id="feedbackBadge" style="
              background: #fbbf24;
              color: #1f2937;
              padding: 4px 10px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 700;
              display: none;
            ">0</span>
          </button>
          
        </div>
        
        <!-- PAYMENTS LIST -->
        <div style="
          background: linear-gradient(135deg, #667eea15, #764ba215);
          padding: 20px;
          border-radius: 12px;
          border: 2px solid #e0e7ff;
        ">
          <h4 style="margin: 0 0 15px 0; color: #4b5563;">
            <i class="bi bi-credit-card"></i> Pending Payments
          </h4>
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
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
  document.body.style.overflow = 'hidden';
  
  // Load pending payments (this should work since it doesn't require special permissions)
  await loadPendingPayments();
  
  // Try to update feedback badge (will fail silently if no permission)
  updateAdminFeedbackBadge().catch(err => {
    console.warn('⚠️ Could not load feedback count:', err.message);
  });
}

// Export to window
window.updateAdminFeedbackBadge = updateAdminFeedbackBadge;
window.openAdminPanel = openAdminPanel;

console.log('✅ Fixed admin panel functions loaded');

// ============================================
// UPDATE FEEDBACK BADGE IN ADMIN PANEL - FIXED VERSION ✅
// ============================================

async function updateAdminFeedbackBadge() {
  const db = window.firebaseDatabase;
  const auth = window.firebaseAuth;
  
  if (!db || !auth?.currentUser) {
    console.warn('⚠️ Database or user not available');
    return;
  }
  
  // Check if user is admin first
  const userIsAdmin = await isAdmin(auth.currentUser.uid);
  if (!userIsAdmin) {
    console.warn('⚠️ User is not admin, skipping feedback count');
    return;
  }
  
  try {
    const feedbackRef = window.firebaseRef(db, 'feedback');
    const snapshot = await window.firebaseGet(feedbackRef);
    
    let pendingCount = 0;
    
    if (snapshot.exists()) {
      snapshot.forEach(userSnapshot => {
        userSnapshot.forEach(feedbackSnapshot => {
          const feedback = feedbackSnapshot.val();
          if (feedback && feedback.status === 'pending') {
            pendingCount++;
          }
        });
      });
    }
    
    const badge = document.getElementById('feedbackBadge');
    if (badge) {
      badge.textContent = pendingCount;
      badge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
    }
    
    console.log('✅ Feedback badge updated:', pendingCount, 'pending');
    
  } catch (error) {
    console.error('❌ Error counting feedbacks:', error);
    
    // Don't show error to user, just hide badge
    const badge = document.getElementById('feedbackBadge');
    if (badge) {
      badge.style.display = 'none';
    }
  }
}


// ============================================
// 📬 ADMIN FEEDBACK MANAGEMENT SYSTEM
// ============================================
// Bu kodni subscription.js ga qo'shing (openAdminPanel funksiyasidan keyin)

// ============================================
// OPEN FEEDBACK MANAGER
// ============================================
async function openFeedbackManager() {
  const db = window.firebaseDatabase;
  if (!db) {
    alert('❌ Database not initialized!');
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'feedbackManagerOverlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;
  `;

  overlay.innerHTML = `
    <div style="
      background: white;
      width: 95%;
      max-width: 1400px;
      height: 90vh;
      border-radius: 20px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    ">
      <!-- HEADER -->
      <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 25px 30px;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div>
          <h2 style="margin: 0; font-size: 28px; font-weight: 700;">
            <i class="bi bi-chat-left-text-fill"></i> Feedback Manager
          </h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">
            Manage user feedback and suggestions
          </p>
        </div>
        <button onclick="closeFeedbackManager()" style="
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 28px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        ">×</button>
      </div>

      <!-- STATS BAR -->
      <div style="
        padding: 20px 30px;
        background: #f9fafb;
        border-bottom: 2px solid #e5e7eb;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
      " id="feedbackStats">
        <div style="background: white; padding: 15px; border-radius: 10px; border-left: 4px solid #fbbf24;">
          <div style="font-size: 24px; font-weight: 700; color: #1f2937;" id="totalFeedbacks">0</div>
          <div style="font-size: 13px; color: #6b7280; margin-top: 5px;">Total Feedbacks</div>
        </div>
        <div style="background: white; padding: 15px; border-radius: 10px; border-left: 4px solid #ef4444;">
          <div style="font-size: 24px; font-weight: 700; color: #1f2937;" id="pendingFeedbacks">0</div>
          <div style="font-size: 13px; color: #6b7280; margin-top: 5px;">⏳ Pending</div>
        </div>
        <div style="background: white; padding: 15px; border-radius: 10px; border-left: 4px solid #3b82f6;">
          <div style="font-size: 24px; font-weight: 700; color: #1f2937;" id="reviewedFeedbacks">0</div>
          <div style="font-size: 13px; color: #6b7280; margin-top: 5px;">👀 Reviewed</div>
        </div>
        <div style="background: white; padding: 15px; border-radius: 10px; border-left: 4px solid #10b981;">
          <div style="font-size: 24px; font-weight: 700; color: #1f2937;" id="resolvedFeedbacks">0</div>
          <div style="font-size: 13px; color: #6b7280; margin-top: 5px;">✅ Resolved</div>
        </div>
      </div>

      <!-- FILTERS -->
      <div style="
        padding: 20px 30px;
        background: white;
        border-bottom: 2px solid #e5e7eb;
        display: flex;
        gap: 15px;
        align-items: center;
        flex-wrap: wrap;
      ">
        <select id="feedbackFilterStatus" onchange="filterFeedbacks()" style="
          padding: 10px 15px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        ">
          <option value="all">All Status</option>
          <option value="pending">⏳ Pending</option>
          <option value="reviewed">👀 Reviewed</option>
          <option value="resolved">✅ Resolved</option>
        </select>

        <select id="feedbackFilterCategory" onchange="filterFeedbacks()" style="
          padding: 10px 15px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        ">
          <option value="all">All Categories</option>
          <option value="bug">🐛 Bug Report</option>
          <option value="feature">✨ Feature Request</option>
          <option value="suggestion">💡 Suggestion</option>
          <option value="complaint">😕 Complaint</option>
          <option value="other">📝 Other</option>
        </select>

        <select id="feedbackFilterPriority" onchange="filterFeedbacks()" style="
          padding: 10px 15px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        ">
          <option value="all">All Priorities</option>
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>

        <input type="text" id="feedbackSearchInput" placeholder="🔍 Search by title or user..." oninput="filterFeedbacks()" style="
          flex: 1;
          min-width: 250px;
          padding: 10px 15px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
        ">

        <button onclick="refreshFeedbacks()" style="
          padding: 10px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        ">
          <i class="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>

      <!-- FEEDBACKS LIST -->
      <div style="
        flex: 1;
        overflow-y: auto;
        padding: 20px 30px;
        background: #f9fafb;
      " id="feedbacksList">
        <div style="text-align: center; padding: 60px 20px; color: #9ca3af;">
          <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p style="margin-top: 20px; font-size: 16px; font-weight: 600;">Loading feedbacks...</p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  
  // Load feedbacks
  await loadAllFeedbacks();
  
  console.log('✅ Feedback Manager opened');
}

// ============================================
// LOAD ALL FEEDBACKS
// ============================================
let allFeedbacksData = [];

async function loadAllFeedbacks() {
  const db = window.firebaseDatabase;
  const feedbackRef = window.firebaseRef(db, 'feedback');
  
  try {
    const snapshot = await window.firebaseGet(feedbackRef);
    
    if (!snapshot.exists()) {
      document.getElementById('feedbacksList').innerHTML = `
        <div style="text-align: center; padding: 80px 20px;">
          <div style="font-size: 80px; margin-bottom: 20px;">📭</div>
          <h3 style="color: #4b5563; margin-bottom: 10px;">No feedbacks yet</h3>
          <p style="color: #9ca3af;">User feedback will appear here</p>
        </div>
      `;
      updateFeedbackStats(0, 0, 0, 0);
      return;
    }
    
    // Convert to array
    allFeedbacksData = [];
    snapshot.forEach(userSnapshot => {
      const uid = userSnapshot.key;
      userSnapshot.forEach(feedbackSnapshot => {
        allFeedbacksData.push({
          id: feedbackSnapshot.key,
          uid: uid,
          ...feedbackSnapshot.val()
        });
      });
    });
    
    // Sort by timestamp (newest first)
    allFeedbacksData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    console.log('✅ Loaded', allFeedbacksData.length, 'feedbacks');
    
    // Update stats
    const total = allFeedbacksData.length;
    const pending = allFeedbacksData.filter(f => f.status === 'pending').length;
    const reviewed = allFeedbacksData.filter(f => f.status === 'reviewed').length;
    const resolved = allFeedbacksData.filter(f => f.status === 'resolved').length;
    
    updateFeedbackStats(total, pending, reviewed, resolved);
    
    // Display feedbacks
    displayFeedbacks(allFeedbacksData);
    
  } catch (error) {
    console.error('❌ Error loading feedbacks:', error);
    document.getElementById('feedbacksList').innerHTML = `
      <div style="text-align: center; padding: 60px 20px;">
        <div style="font-size: 64px; color: #ef4444; margin-bottom: 15px;">❌</div>
        <p style="color: #6b7280; font-size: 16px;">Failed to load feedbacks</p>
        <p style="color: #9ca3af; font-size: 14px; margin-top: 10px;">${error.message}</p>
      </div>
    `;
  }
}

// ============================================
// UPDATE STATS
// ============================================
function updateFeedbackStats(total, pending, reviewed, resolved) {
  document.getElementById('totalFeedbacks').textContent = total;
  document.getElementById('pendingFeedbacks').textContent = pending;
  document.getElementById('reviewedFeedbacks').textContent = reviewed;
  document.getElementById('resolvedFeedbacks').textContent = resolved;
}

// ============================================
// DISPLAY FEEDBACKS
// ============================================
function displayFeedbacks(feedbacks) {
  const container = document.getElementById('feedbacksList');
  
  if (feedbacks.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px;">
        <div style="font-size: 64px; margin-bottom: 20px;">🔍</div>
        <h3 style="color: #4b5563; margin-bottom: 10px;">No feedbacks found</h3>
        <p style="color: #9ca3af;">Try adjusting your filters</p>
      </div>
    `;
    return;
  }
  
  const categoryEmoji = {
    'bug': '🐛',
    'feature': '✨',
    'suggestion': '💡',
    'complaint': '😕',
    'other': '📝'
  };
  
  const priorityEmoji = {
    'low': '🟢',
    'medium': '🟡',
    'high': '🔴'
  };
  
  container.innerHTML = feedbacks.map(fb => {
    const date = new Date(fb.timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `
      <div style="
        background: white;
        border-radius: 12px;
        padding: 25px;
        margin-bottom: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        border: 2px solid #e5e7eb;
        transition: all 0.3s;
      " onmouseover="this.style.borderColor='#667eea'" onmouseout="this.style.borderColor='#e5e7eb'">
        
        <!-- HEADER -->
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <h4 style="margin: 0; font-size: 18px; color: #1f2937;">
                ${categoryEmoji[fb.category] || '📝'} ${fb.title}
              </h4>
              <span style="
                padding: 4px 12px;
                background: ${fb.category === 'bug' ? '#fee2e2' : 
                            fb.category === 'feature' ? '#dbeafe' : 
                            fb.category === 'suggestion' ? '#fef3c7' : '#f3f4f6'};
                color: ${fb.category === 'bug' ? '#991b1b' : 
                         fb.category === 'feature' ? '#1e40af' : 
                         fb.category === 'suggestion' ? '#92400e' : '#4b5563'};
                border-radius: 6px;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
              ">${fb.category}</span>
            </div>
            <div style="display: flex; gap: 20px; font-size: 13px; color: #6b7280;">
              <span><i class="bi bi-person-circle"></i> ${fb.username || 'Unknown'}</span>
              <span><i class="bi bi-envelope"></i> ${fb.email}</span>
              <span><i class="bi bi-calendar3"></i> ${date}</span>
            </div>
          </div>
          
          <div style="display: flex; gap: 10px; align-items: center;">
            <span style="
              padding: 6px 14px;
              background: ${fb.priority === 'high' ? '#fee2e2' : 
                          fb.priority === 'medium' ? '#fef3c7' : '#dcfce7'};
              color: ${fb.priority === 'high' ? '#991b1b' : 
                       fb.priority === 'medium' ? '#92400e' : '#166534'};
              border-radius: 20px;
              font-size: 12px;
              font-weight: 700;
            ">${priorityEmoji[fb.priority]} ${fb.priority.toUpperCase()}</span>
            
            <select onchange="updateFeedbackStatus('${fb.uid}', '${fb.id}', this.value)" style="
              padding: 6px 12px;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
            ">
              <option value="pending" ${fb.status === 'pending' ? 'selected' : ''}>⏳ Pending</option>
              <option value="reviewed" ${fb.status === 'reviewed' ? 'selected' : ''}>👀 Reviewed</option>
              <option value="resolved" ${fb.status === 'resolved' ? 'selected' : ''}>✅ Resolved</option>
            </select>
          </div>
        </div>

        <!-- MESSAGE -->
        <div style="
          background: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
          margin-bottom: 15px;
          line-height: 1.6;
          color: #374151;
        ">${fb.message}</div>

        <!-- ADMIN RESPONSE -->
        <div style="margin-top: 15px;">
          ${fb.adminResponse ? `
            <div style="
              background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #10b981;
              margin-bottom: 10px;
            ">
              <div style="font-weight: 700; color: #166534; margin-bottom: 5px;">
                <i class="bi bi-shield-check"></i> Admin Response:
              </div>
              <div style="color: #14532d;">${fb.adminResponse}</div>
            </div>
          ` : ''}
          
          <div style="display: flex; gap: 10px;">
            <input type="text" id="response_${fb.uid}_${fb.id}" placeholder="Type admin response..." style="
              flex: 1;
              padding: 10px 15px;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              font-size: 14px;
            ">
            <button onclick="sendAdminResponse('${fb.uid}', '${fb.id}')" style="
              padding: 10px 20px;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              border: none;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
            ">
              <i class="bi bi-send-fill"></i> Send Response
            </button>
            <button onclick="deleteFeedback('${fb.uid}', '${fb.id}')" style="
              padding: 10px 20px;
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              color: white;
              border: none;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
            ">
              <i class="bi bi-trash-fill"></i> Delete
            </button>
          </div>
        </div>

      </div>
    `;
  }).join('');
}

// ============================================
// FILTER FEEDBACKS
// ============================================
function filterFeedbacks() {
  const statusFilter = document.getElementById('feedbackFilterStatus').value;
  const categoryFilter = document.getElementById('feedbackFilterCategory').value;
  const priorityFilter = document.getElementById('feedbackFilterPriority').value;
  const searchQuery = document.getElementById('feedbackSearchInput').value.toLowerCase();
  
  let filtered = allFeedbacksData;
  
  // Filter by status
  if (statusFilter !== 'all') {
    filtered = filtered.filter(f => f.status === statusFilter);
  }
  
  // Filter by category
  if (categoryFilter !== 'all') {
    filtered = filtered.filter(f => f.category === categoryFilter);
  }
  
  // Filter by priority
  if (priorityFilter !== 'all') {
    filtered = filtered.filter(f => f.priority === priorityFilter);
  }
  
  // Filter by search query
  if (searchQuery) {
    filtered = filtered.filter(f => 
      f.title.toLowerCase().includes(searchQuery) ||
      f.message.toLowerCase().includes(searchQuery) ||
      f.username.toLowerCase().includes(searchQuery) ||
      f.email.toLowerCase().includes(searchQuery)
    );
  }
  
  displayFeedbacks(filtered);
  console.log('🔍 Filtered:', filtered.length, 'feedbacks');
}

// ============================================
// UPDATE FEEDBACK STATUS
// ============================================
async function updateFeedbackStatus(uid, feedbackId, newStatus) {
  const db = window.firebaseDatabase;
  const feedbackRef = window.firebaseRef(db, `feedback/${uid}/${feedbackId}/status`);
  
  try {
    await window.firebaseSet(feedbackRef, newStatus);
    console.log('✅ Status updated:', feedbackId, '→', newStatus);
    
    // Update local data
    const feedback = allFeedbacksData.find(f => f.id === feedbackId && f.uid === uid);
    if (feedback) {
      feedback.status = newStatus;
    }
    
    // Update stats
    const total = allFeedbacksData.length;
    const pending = allFeedbacksData.filter(f => f.status === 'pending').length;
    const reviewed = allFeedbacksData.filter(f => f.status === 'reviewed').length;
    const resolved = allFeedbacksData.filter(f => f.status === 'resolved').length;
    
    updateFeedbackStats(total, pending, reviewed, resolved);
    
  } catch (error) {
    console.error('❌ Error updating status:', error);
    alert('Failed to update status: ' + error.message);
  }
}

// ============================================
// SEND ADMIN RESPONSE
// ============================================
async function sendAdminResponse(uid, feedbackId) {
  const responseInput = document.getElementById(`response_${uid}_${feedbackId}`);
  const response = responseInput.value.trim();
  
  if (!response) {
    alert('⚠️ Please enter a response!');
    return;
  }
  
  const db = window.firebaseDatabase;
  const feedbackRef = window.firebaseRef(db, `feedback/${uid}/${feedbackId}`);
  
  try {
    await window.firebaseUpdate(feedbackRef, {
      adminResponse: response,
      status: 'reviewed',
      respondedAt: new Date().toISOString()
    });
    
    console.log('✅ Admin response sent:', feedbackId);
    
    // Reload feedbacks
    await loadAllFeedbacks();
    
    // Show success
    responseInput.value = '';
    
  } catch (error) {
    console.error('❌ Error sending response:', error);
    alert('Failed to send response: ' + error.message);
  }
}

// ============================================
// DELETE FEEDBACK
// ============================================
async function deleteFeedback(uid, feedbackId) {
  if (!confirm('⚠️ Are you sure you want to DELETE this feedback? This action cannot be undone!')) {
    return;
  }
  
  const db = window.firebaseDatabase;
  const feedbackRef = window.firebaseRef(db, `feedback/${uid}/${feedbackId}`);
  
  try {
    await window.firebaseRemove(feedbackRef);
    console.log('✅ Feedback deleted:', feedbackId);
    
    // Reload feedbacks
    await loadAllFeedbacks();
    
  } catch (error) {
    console.error('❌ Error deleting feedback:', error);
    alert('Failed to delete feedback: ' + error.message);
  }
}

// ============================================
// REFRESH FEEDBACKS
// ============================================
async function refreshFeedbacks() {
  document.getElementById('feedbacksList').innerHTML = `
    <div style="text-align: center; padding: 60px 20px; color: #9ca3af;">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p style="margin-top: 20px; font-size: 16px; font-weight: 600;">Refreshing feedbacks...</p>
    </div>
  `;
  
  await loadAllFeedbacks();
  console.log('🔄 Feedbacks refreshed');
}

// ============================================
// CLOSE FEEDBACK MANAGER
// ============================================
function closeFeedbackManager() {
  const overlay = document.getElementById('feedbackManagerOverlay');
  if (overlay) {
    overlay.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => overlay.remove(), 300);
  }
}

// ============================================
// GLOBAL EXPORTS
// ============================================
window.openFeedbackManager = openFeedbackManager;
window.closeFeedbackManager = closeFeedbackManager;
window.loadAllFeedbacks = loadAllFeedbacks;
window.filterFeedbacks = filterFeedbacks;
window.updateFeedbackStatus = updateFeedbackStatus;
window.sendAdminResponse = sendAdminResponse;
window.deleteFeedback = deleteFeedback;
window.refreshFeedbacks = refreshFeedbacks;

console.log('✅ Admin Feedback Manager loaded!');

// ============================================
// ANIMATIONS (CSS)
// ============================================
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  #feedbacksList::-webkit-scrollbar {
    width: 8px;
  }
  
  #feedbacksList::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  #feedbacksList::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
  
  #feedbacksList::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;
document.head.appendChild(style);

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

// ============================================
// APPROVE PAYMENT - COMPLETELY FIXED ✅
// ============================================
async function approvePayment(paymentKey, userId, productType) {
  const db = getDatabase();
  if (!db) {
    showNotification('❌ Database mavjud emas', 'error');
    return;
  }
  
  console.log('🔄 Approving payment:', { paymentKey, userId, productType });
  
  try {
    // 1. Update payment status
    const paymentRef = window.firebaseRef(db, `payment_attempts/${paymentKey}`);
    await window.firebaseUpdate(paymentRef, {
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: window.firebaseAuth?.currentUser?.uid
    });
    
    console.log('✅ Payment status updated');
    
    // 2. Get product info
    const product = PAYMENT_CONFIG.PRODUCTS[productType];
    if (!product) {
      throw new Error('Product not found: ' + productType);
    }
    
    console.log('📦 Product:', product);
    
    // 3. Process based on product type
    if (productType === 'PRO' || productType === 'PRO_SUB') {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      
      // ✅ USE BATCH UPDATE (ATOMIC)
      const updates = {};
      updates[`users/${userId}/subscription/type`] = 'pro';
      updates[`users/${userId}/subscription/expiry`] = expiryDate.toISOString();
      updates[`users/${userId}/subscription/activatedAt`] = new Date().toISOString();
      updates[`users/${userId}/subscription/status`] = 'active';
      updates[`users/${userId}/lastDailyCoin`] = null;
      
      const rootRef = window.firebaseRef(db, '/');
      await window.firebaseUpdate(rootRef, updates);
      
      console.log('✅ PRO subscription activated');
      showNotification('✅ PRO obuna faollashtirildi! 50 coin/kun', 'success');
      
    } else if (productType === 'STANDARD_SUB') {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      
      const updates = {};
      updates[`users/${userId}/subscription/type`] = 'standard';
      updates[`users/${userId}/subscription/expiry`] = expiryDate.toISOString();
      updates[`users/${userId}/subscription/activatedAt`] = new Date().toISOString();
      updates[`users/${userId}/subscription/status`] = 'active';
      updates[`users/${userId}/lastDailyCoin`] = null;
      
      const rootRef = window.firebaseRef(db, '/');
      await window.firebaseUpdate(rootRef, updates);
      
      console.log('✅ Standard subscription activated');
      showNotification('✅ Standard obuna faollashtirildi! 20 coin/kun', 'success');
      
    } else if (product.coins) {
      // ✅ COINS PURCHASE - FIXED VERSION
      const coinsToAdd = product.coins + (product.bonus || 0);
      
      console.log(`💰 Adding ${coinsToAdd} coins to user ${userId}`);
      
      // Get current coins
      const coinsRef = window.firebaseRef(db, `users/${userId}/coins`);
      const snapshot = await window.firebaseGet(coinsRef);
      const currentCoins = snapshot.val() || 0;
      const newCoins = currentCoins + coinsToAdd;
      
      console.log(`Current: ${currentCoins}, Adding: ${coinsToAdd}, New: ${newCoins}`);
      
      // ✅ UPDATE COINS USING ROOT UPDATE (ATOMIC)
      const updates = {};
      updates[`users/${userId}/coins`] = newCoins;
      
      const rootRef = window.firebaseRef(db, '/');
      await window.firebaseUpdate(rootRef, updates);
      
      console.log(`✅ Coins updated successfully: ${currentCoins} → ${newCoins}`);
      
      // ✅ LOG TRANSACTION - WITH PROPER ERROR HANDLING
      try {
        const transactionRef = window.firebaseRef(db, `users/${userId}/coin_transactions`);
        const newTransactionRef = window.firebasePush(transactionRef);
        
        await window.firebaseSet(newTransactionRef, {
          type: 'purchase',
          amount: coinsToAdd,
          productType: productType,
          productName: product.nameUz || product.name,
          timestamp: new Date().toISOString(),
          paymentKey: paymentKey,
          adminId: window.firebaseAuth?.currentUser?.uid,
          reason: `Purchased ${product.nameUz || product.name}`
        });
        
        console.log('✅ Transaction logged successfully');
      } catch (transactionError) {
        console.error('⚠️ Transaction log failed (non-critical):', transactionError);
        // Don't throw error - coins were added successfully
      }
      
      showNotification(`✅ ${coinsToAdd} coin qo'shildi!`, 'success');
      
    } else {
      throw new Error('Unknown product type: ' + productType);
    }
    
    // 4. Reload admin panel
    console.log('✅ Payment approved successfully!');
    closeAdminPanel();
    setTimeout(() => openAdminPanel(), 500);
    
  } catch (error) {
    console.error('❌ Approve error:', error);
    
    // ✅ USER-FRIENDLY ERROR MESSAGES
    let errorMessage = 'Xatolik yuz berdi';
    
    if (error.code === 'PERMISSION_DENIED') {
      errorMessage = '❌ Ruxsat yo\'q! Firebase Rules ni tekshiring.';
      console.error('🔴 PERMISSION_DENIED - Check Firebase Rules for coin_transactions');
    } else if (error.message.includes('not found')) {
      errorMessage = '❌ Mahsulot topilmadi!';
    } else {
      errorMessage = `❌ Xatolik: ${error.message}`;
    }
    
    showNotification(errorMessage, 'error');
  }
}


async function rejectPayment(paymentKey) {
  const db = getDatabase();
  if (!db) {
    showNotification('❌ Database mavjud emas', 'error');
    return;
  }
  
  console.log('❌ Rejecting payment:', paymentKey);
  
  try {
    const paymentRef = window.firebaseRef(db, `payment_attempts/${paymentKey}`);
    await window.firebaseUpdate(paymentRef, {
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: window.firebaseAuth?.currentUser?.uid
    });
    
    console.log('✅ Payment rejected');
    showNotification('❌ To\'lov rad etildi', 'info');
    
    closeAdminPanel();
    setTimeout(() => openAdminPanel(), 500);
    
  } catch (error) {
    console.error('❌ Reject error:', error);
    showNotification('❌ Xatolik: ' + error.message, 'error');
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
// RESET ALL COINS + SUBSCRIPTION - FIXED ✅
// ============================================
async function resetAllCoins() {
  const user = window.firebaseAuth?.currentUser;
  if (!user) {
    showNotification('❌ Tizimga kiring', 'error');
    return;
  }
  
  const adminStatus = await isAdmin(user.uid);
  if (!adminStatus) {
    showNotification('❌ Faqat admin reset qilishi mumkin', 'error');
    return;
  }
  
  const confirmation = confirm(`⚠️ DIQQAT!

Barcha userlarning:
- Coinlari 0 ga qaytariladi
- Subscription (PRO/Standard) bekor qilinadi

Davom etasizmi?`);
  
  if (!confirmation) return;
  
  // Double confirmation
  const doubleCheck = prompt('Tasdiqlash uchun "RESET ALL" deb yozing:', '');
  if (doubleCheck !== 'RESET ALL') {
    showNotification('❌ Bekor qilindi', 'info');
    return;
  }
  
  const db = getDatabase();
  if (!db) {
    showNotification('❌ Database mavjud emas', 'error');
    return;
  }
  
  try {
    showNotification('🔄 Reset boshlanmoqda...', 'info');
    console.log('🔄 Starting full reset for all users...');
    
    // Get all users
    const usersRef = window.firebaseRef(db, 'users');
    const snapshot = await window.firebaseGet(usersRef);
    
    if (!snapshot.exists()) {
      showNotification('❌ Userlar topilmadi', 'error');
      return;
    }
    
    const updates = {};
    let userCount = 0;
    
    snapshot.forEach((child) => {
      const userId = child.key;
      // Reset coins
      updates[`users/${userId}/coins`] = 0;
      // Reset subscription to free
      updates[`users/${userId}/subscription/type`] = 'free';
      updates[`users/${userId}/subscription/status`] = 'inactive';
      updates[`users/${userId}/subscription/expiry`] = null;
      updates[`users/${userId}/subscription/activatedAt`] = null;
      userCount++;
    });
    
    console.log(`📊 Found ${userCount} users`);
    
    // Apply all updates at once (atomic)
    const rootRef = window.firebaseRef(db, '/');
    await window.firebaseUpdate(rootRef, updates);
    
    console.log('✅ All users reset to free');
    showNotification(`✅ ${userCount} ta user reset qilindi (coins + subscription)!`, 'success');
    
    // Log the action
    const logRef = window.firebaseRef(db, 'admin_logs');
    const newLogRef = window.firebasePush(logRef);
    await window.firebaseSet(newLogRef, {
      action: 'reset_all_users',
      adminId: user.uid,
      adminEmail: user.email,
      affectedUsers: userCount,
      timestamp: new Date().toISOString(),
      details: 'Coins and subscriptions reset'
    });
    
    // Reload users
    await loadUsersCoins();
    
  } catch (error) {
    console.error('❌ Reset error:', error);
    showNotification('❌ Xatolik: ' + error.message, 'error');
  }
}

// ============================================
// RESET USER COINS + SUBSCRIPTION - FIXED ✅
// ============================================
async function resetUserCoins(userId, userName) {
  const confirmation = confirm(`⚠️ ${userName} ning:
- Coinlari 0 ga qaytarilsinmi?
- Subscription bekor qilinsinmi?`);
  if (!confirmation) return;
  
  const db = getDatabase();
  if (!db) {
    showNotification('❌ Database mavjud emas', 'error');
    return;
  }
  
  try {
    // Reset coins and subscription
    const updates = {};
    updates[`users/${userId}/coins`] = 0;
    updates[`users/${userId}/subscription/type`] = 'free';
    updates[`users/${userId}/subscription/status`] = 'inactive';
    updates[`users/${userId}/subscription/expiry`] = null;
    updates[`users/${userId}/subscription/activatedAt`] = null;
    
    const rootRef = window.firebaseRef(db, '/');
    await window.firebaseUpdate(rootRef, updates);
    
    console.log(`✅ User reset: ${userId}`);
    showNotification(`✅ ${userName} reset qilindi (coins + subscription)`, 'success');
    
    // Log
    const logRef = window.firebaseRef(db, `users/${userId}/coin_transactions`);
    const newLogRef = window.firebasePush(logRef);
    await window.firebaseSet(newLogRef, {
      type: 'admin_full_reset',
      amount: 0,
      adminId: window.firebaseAuth?.currentUser?.uid,
      timestamp: new Date().toISOString(),
      details: 'Coins and subscription reset'
    });
    
    // Reload users
    await loadUsersCoins();
    
  } catch (error) {
    console.error('❌ Reset error:', error);
    showNotification('❌ Xatolik: ' + error.message, 'error');
  }
}


// ============================================
// 📊 VIEW ALL USERS WITH COINS - FIXED ✅
// ============================================
async function viewAllUsersCoins() {
  const user = window.firebaseAuth?.currentUser;
  if (!user) {
    showNotification('❌ Tizimga kiring', 'error');
    return;
  }
  
  const adminStatus = await isAdmin(user.uid);
  if (!adminStatus) {
    showNotification('❌ Ruxsat yo\'q', 'error');
    return;
  }
  
  const db = getDatabase();
  if (!db) {
    showNotification('❌ Database mavjud emas', 'error');
    return;
  }
  
  try {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay-inline coins-management-modal';
    modal.innerHTML = `
      <div class="modal-inline" style="max-width: 1000px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header-inline" style="position: sticky; top: 0; background: white; z-index: 10; padding: 20px; border-bottom: 2px solid #e5e7eb;">
          <h3 style="margin: 0;">💰 Coinlarni Boshqarish</h3>
          <button class="modal-close-inline" onclick="closeCoinsManagementModal()">×</button>
        </div>
        <div class="modal-body-inline" style="padding: 20px;">
          <!-- Search & Actions -->
          <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
            <input 
              type="text" 
              id="userSearchInput" 
              placeholder="🔍 Qidirish (ism, email, UID)..." 
              style="flex: 1; min-width: 250px; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 15px;"
              oninput="filterUsers()"
            />
            <button onclick="resetAllCoins()" style="padding: 12px 24px; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
              🔄 Reset All
            </button>
            <button onclick="loadUsersCoins()" style="padding: 12px 24px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
              🔄 Yangilash
            </button>
          </div>
          
          <!-- Stats Summary -->
          <div id="coinsSummary" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
            <!-- Will be filled by JS -->
          </div>
          
          <!-- Users List -->
          <div id="usersCoinsContainer">
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
    
    // Load users
    await loadUsersCoins();
    
  } catch (error) {
    console.error('❌ Error:', error);
    showNotification('❌ Xatolik yuz berdi', 'error');
  }
}

// ============================================
// LOAD USERS COINS - FIXED ✅
// ============================================
async function loadUsersCoins() {
  const db = getDatabase();
  if (!db) {
    showNotification('❌ Database mavjud emas', 'error');
    return;
  }
  
  const container = document.getElementById('usersCoinsContainer');
  const summary = document.getElementById('coinsSummary');
  
  if (!container) return;
  
  try {
    const usersRef = window.firebaseRef(db, 'users');
    const snapshot = await window.firebaseGet(usersRef);
    
    if (!snapshot.exists()) {
      container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 40px;">Userlar topilmadi</p>';
      return;
    }
    
    const users = [];
    snapshot.forEach((child) => {
      const data = child.val();
      users.push({
        uid: child.key,
        email: data.email || 'Unknown',
        displayName: data.displayName || 'Unknown',
        coins: data.coins || 0,
        subscription: data.subscription?.type || 'free',
        createdAt: data.createdAt || null
      });
    });
    
    // Sort by coins (highest first)
    users.sort((a, b) => b.coins - a.coins);
    
    // Store globally for search
    window.allUsers = users;
    
    // Calculate stats
    const totalCoins = users.reduce((sum, user) => sum + user.coins, 0);
    const usersWithCoins = users.filter(u => u.coins > 0).length;
    const avgCoins = users.length > 0 ? Math.round(totalCoins / users.length) : 0;
    const maxCoins = users.length > 0 ? Math.max(...users.map(u => u.coins)) : 0;
    
    // Display summary
    if (summary) {
      summary.innerHTML = `
        <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 15px; border-radius: 12px; color: white;">
          <div style="font-size: 28px; font-weight: 700; margin-bottom: 5px;">${users.length}</div>
          <div style="font-size: 13px; opacity: 0.9;">Jami Userlar</div>
        </div>
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 15px; border-radius: 12px; color: white;">
          <div style="font-size: 28px; font-weight: 700; margin-bottom: 5px;">${totalCoins.toLocaleString()}</div>
          <div style="font-size: 13px; opacity: 0.9;">Jami Coinlar</div>
        </div>
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 15px; border-radius: 12px; color: white;">
          <div style="font-size: 28px; font-weight: 700; margin-bottom: 5px;">${usersWithCoins}</div>
          <div style="font-size: 13px; opacity: 0.9;">Coinli Userlar</div>
        </div>
        <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 15px; border-radius: 12px; color: white;">
          <div style="font-size: 28px; font-weight: 700; margin-bottom: 5px;">${avgCoins}</div>
          <div style="font-size: 13px; opacity: 0.9;">O'rtacha Coin</div>
        </div>
      `;
    }
    
    // Display users
    displayUsers(users);
    
  } catch (error) {
    console.error('❌ Load error:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <p style="color: #ef4444;">❌ Xatolik yuz berdi</p>
        <p style="color: #6b7280; font-size: 14px;">${error.message}</p>
      </div>
    `;
  }
}



// ============================================
// DISPLAY USERS - NEW FUNCTION ✅
// ============================================
function displayUsers(users) {
  const container = document.getElementById('usersCoinsContainer');
  if (!container) return;
  
  if (users.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 40px;">Foydalanuvchilar topilmadi</p>';
    return;
  }
  
  container.innerHTML = users.map(user => `
    <div class="user-coin-card" data-email="${user.email.toLowerCase()}" data-name="${user.displayName.toLowerCase()}" data-uid="${user.uid.toLowerCase()}" style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 15px; transition: all 0.3s;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
        <div style="flex: 1; min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <h4 style="margin: 0;">${user.displayName}</h4>
            ${user.subscription === 'pro' ? '<span style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700;">PRO</span>' : user.subscription === 'standard' ? '<span style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700;">STANDARD</span>' : '<span style="background: #6b7280; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700;">FREE</span>'}
          </div>
          <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
            📧 ${user.email}<br>
            🆔 ${user.uid.substring(0, 20)}...<br>
            ${user.createdAt ? `📅 ${new Date(user.createdAt).toLocaleDateString('uz-UZ')}` : ''}
          </p>
        </div>
        <div style="display: flex; align-items: center; gap: 15px;">
          <div style="text-align: center;">
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Coinlar</div>
            <div style="font-size: 36px; font-weight: 700; color: ${user.coins > 0 ? '#10b981' : '#6b7280'};">
              ${user.coins}
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button onclick="addCoinsToUser('${user.uid}', '${user.displayName}')" style="padding: 8px 16px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px;">
              ➕ Qo'shish
            </button>
            <button onclick="resetUserCoins('${user.uid}', '${user.displayName}')" style="padding: 8px 16px; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px;">
              🔄 Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}


// ============================================
// FILTER USERS - NEW FUNCTION ✅
// ============================================
function filterUsers() {
  const searchInput = document.getElementById('userSearchInput');
  if (!searchInput) return;
  
  const query = searchInput.value.toLowerCase().trim();
  
  if (!window.allUsers) {
    console.warn('⚠️ No users data available');
    return;
  }
  
  if (!query) {
    // Show all users
    displayUsers(window.allUsers);
    return;
  }
  
  // Filter users
  const filtered = window.allUsers.filter(user => 
    user.email.toLowerCase().includes(query) ||
    user.displayName.toLowerCase().includes(query) ||
    user.uid.toLowerCase().includes(query)
  );
  
  console.log(`🔍 Found ${filtered.length} users matching "${query}"`);
  displayUsers(filtered);
}

// ============================================
// ADD COINS TO USER - FIXED ✅
// ============================================
async function addCoinsToUser(userId, userName) {
  const amount = prompt(`${userName} ga nechta coin qo'shmoqchisiz?`, '50');
  
  if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
    return;
  }
  
  const coinsToAdd = parseInt(amount);
  
  const db = getDatabase();
  if (!db) {
    showNotification('❌ Database mavjud emas', 'error');
    return;
  }
  
  try {
    // Get current coins
    const coinsRef = window.firebaseRef(db, `users/${userId}/coins`);
    const snapshot = await window.firebaseGet(coinsRef);
    const currentCoins = snapshot.val() || 0;
    const newCoins = currentCoins + coinsToAdd;
    
    // Update
    await window.firebaseSet(coinsRef, newCoins);
    
    console.log(`✅ Added ${coinsToAdd} coins to ${userName}: ${currentCoins} → ${newCoins}`);
    showNotification(`✅ ${userName} ga ${coinsToAdd} coin qo'shildi!`, 'success');
    
    // Log transaction
    const logRef = window.firebaseRef(db, `users/${userId}/coin_transactions`);
    const newLogRef = window.firebasePush(logRef);
    await window.firebaseSet(newLogRef, {
      type: 'admin_add',
      amount: coinsToAdd,
      adminId: window.firebaseAuth?.currentUser?.uid,
      timestamp: new Date().toISOString(),
      reason: 'Admin added coins'
    });
    
    // Reload users
    await loadUsersCoins();
    
  } catch (error) {
    console.error('❌ Add coins error:', error);
    showNotification('❌ Xatolik: ' + error.message, 'error');
  }
}

// ============================================
// CLOSE MODAL
// ============================================
function closeCoinsManagementModal() {
  const modal = document.querySelector('.coins-management-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
  document.body.style.overflow = '';
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

// ✅ YANGI EXPORTS
window.resetAllCoins = resetAllCoins;
window.resetUserCoins = resetUserCoins;
window.viewAllUsersCoins = viewAllUsersCoins;
window.displayUsers = displayUsers;
window.filterUsers = filterUsers;
window.addCoinsToUser = addCoinsToUser;
window.loadUsersCoins = loadUsersCoins;
window.closeCoinsManagementModal = closeCoinsManagementModal;

console.log('✅ Subscription.js (FIXED) loaded!');