// ============================================
// 🌟 TESTIMONIALS/REVIEWS SYSTEM - COMPLETE
// ============================================

console.log('🌟 Loading testimonials system...');

// ============================================
// GLOBAL STATE
// ============================================
let userRating = 0;
let testimonialsCache = [];

// ============================================
// NOTIFICATION HELPER - FIXED
// ============================================
function showTestimonialNotification(message, type = 'info') {
  // Try to use the existing notification system first
  if (typeof window.showNotification === 'function') {
    try {
      window.showNotification(message, type);
      return;
    } catch (err) {
      console.log('Using fallback notification');
    }
  }

  // Fallback: Create custom notification
  const notification = document.createElement('div');
  notification.className = 'testimonial-notification';
  notification.innerHTML = `
    <style>
      .testimonial-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 999999;
        font-weight: 600;
        animation: slideIn 0.3s ease;
      }
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    </style>
    ${message}
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ============================================
// 1️⃣ OPEN TESTIMONIAL MODAL
// ============================================
function openTestimonialModal() {
  const user = window.firebaseAuth?.currentUser;
  if (!user) {
    showTestimonialNotification('❌ Please log in first', 'error');
    return;
  }

  // Check if user already submitted a testimonial
  checkExistingTestimonial(user.uid);

  const modal = createTestimonialModal();
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
  document.body.style.overflow = 'hidden';
}

// ============================================
// 2️⃣ CREATE TESTIMONIAL MODAL (FULLY FIXED)
// ============================================
function createTestimonialModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay-inline testimonial-modal';
  modal.innerHTML = `
    <div class="modal-inline" style="max-width: 600px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden;">
      <div class="modal-header-inline" style="flex-shrink: 0; padding: 20px; border-bottom: 1px solid #e5e7eb;">
        <h3 style="margin: 0; font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
          <i class="bi bi-star-fill" style="color: #fbbf24;"></i>
          Tajribangiz bilan bo'lishing
        </h3>
        <button class="modal-close-inline" onclick="closeTestimonialModal()" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 32px; color: #6b7280; cursor: pointer; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s;">×</button>
      </div>
      
      <div style="flex: 1; overflow-y: auto; padding: 25px 20px;">
        <!-- Rating Section -->
        <div style="margin-bottom: 30px;">
          <label style="display: block; margin-bottom: 15px; color: #374151; font-weight: 600; font-size: 15px;">
            ⭐ ZiyoAI'ni qanday baholaysiz?
          </label>
          <div class="star-rating" style="display: flex; gap: 8px; font-size: 48px; justify-content: center; margin: 20px 0;">
            <span class="star" data-rating="1" onclick="setRating(1)" style="cursor: pointer; transition: all 0.2s;">☆</span>
            <span class="star" data-rating="2" onclick="setRating(2)" style="cursor: pointer; transition: all 0.2s;">☆</span>
            <span class="star" data-rating="3" onclick="setRating(3)" style="cursor: pointer; transition: all 0.2s;">☆</span>
            <span class="star" data-rating="4" onclick="setRating(4)" style="cursor: pointer; transition: all 0.2s;">☆</span>
            <span class="star" data-rating="5" onclick="setRating(5)" style="cursor: pointer; transition: all 0.2s;">☆</span>
          </div>
          <p style="text-align: center; color: #6b7280; font-size: 14px; margin: 0;" id="ratingText">
            Baholash uchun yulduzni bosing
          </p>
        </div>

        <!-- Testimonial Title -->
        <div style="margin-bottom: 25px;">
          <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 600; font-size: 14px;">
            📌 Sarlavha (Ixtiyoriy)
          </label>
          <input
            type="text"
            id="testimonialTitle"
            placeholder="Masalan: 'Eng zo'r AI o'quv vositasi!'"
            maxlength="80"
            style="padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; width: 100%; box-sizing: border-box; font-size: 14px; font-family: inherit;"
          />
          <small style="color: #9ca3af; font-size: 12px; margin-top: 5px; display: block;">
            Maksimal 80 belgi (ixtiyoriy)
          </small>
        </div>

        <!-- Testimonial Message -->
        <div style="margin-bottom: 25px;">
          <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 600; font-size: 14px;">
            ✍️ Sizning fikringiz <span style="color: #ef4444;">*</span>
          </label>
          <textarea
            id="testimonialMessage"
            placeholder="ZiyoAI haqidagi tajribangizni yozing... Sizga nima yoqdi? U sizga qanday yordam berdi?"
            style="min-height: 120px; resize: vertical; font-family: inherit; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; width: 100%; box-sizing: border-box; font-size: 14px; line-height: 1.5;"
            maxlength="500"
          ></textarea>
          <small style="color: #9ca3af; font-size: 12px; margin-top: 5px; display: block;">
            <span id="testimonialCharCount">0</span>/500 belgi
          </small>
        </div>

        <!-- Display Name Option -->
        <div style="margin-bottom: 25px;">
          <label style="display: block; margin-bottom: 12px; color: #374151; font-weight: 600; font-size: 14px;">
            👤 Kim sifatida ko'rsatilsin:
          </label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <button 
              class="display-name-btn active" 
              data-type="username" 
              onclick="selectDisplayType('username')" 
              style="padding: 14px 12px; border: 2px solid #667eea; background: linear-gradient(135deg, #667eea20, #764ba220); border-radius: 10px; cursor: pointer; font-weight: 600; color: #667eea; transition: all 0.3s; font-size: 14px; font-family: inherit;"
            >
              Mening ismim
            </button>
            <button 
              class="display-name-btn" 
              data-type="anonymous" 
              onclick="selectDisplayType('anonymous')" 
              style="padding: 14px 12px; border: 2px solid #e5e7eb; background: #fff; border-radius: 10px; cursor: pointer; font-weight: 600; color: #4b5563; transition: all 0.3s; font-size: 14px; font-family: inherit;"
            >
              Anonim foydalanuvchi
            </button>
          </div>
        </div>

        <!-- Info Box -->
        <div style="padding: 14px 16px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 10px; border-left: 4px solid #3b82f6; margin-bottom: 10px;">
          <p style="margin: 0; color: #1e40af; font-size: 12.5px; line-height: 1.6;">
            <i class="bi bi-info-circle-fill"></i> <strong>Eslatma:</strong> Sizning fikringiz boshqa talabalarga yordam berish uchun asosiy sahifamizda ko'rsatilishi mumkin. Faqat tasdiqlangan fikrlar ommaviy ko'rsatiladi.
          </p>
        </div>
      </div>

      <div class="testimonials-footer-inline" style="flex-shrink: 0; display: flex; gap: 12px; padding: 18px 20px; border-top: 1px solid #e5e7eb; background: #fafafa;">
        <button
          class="btn-inline btn-secondary-inline"
          onclick="closeTestimonialModal()"
          style="flex: 1; padding: 13px 20px; font-size: 15px; font-weight: 600; border-radius: 8px; border: 2px solid #e5e7eb; background: #fff; color: #4b5563; cursor: pointer; transition: all 0.2s; font-family: inherit;"
        >
          Bekor qilish
        </button>
        <button
          class="btn-inline btn-primary-inline"
          onclick="submitTestimonial()"
          style="flex: 1.5; padding: 13px 20px; font-size: 15px; font-weight: 600; border-radius: 8px; border: none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; cursor: pointer; transition: all 0.2s; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 8px;"
        >
          <i class="bi bi-send-fill"></i> Yuborish
        </button>
      </div>
    </div>
  `;

  // Add event listener for character count
  setTimeout(() => {
    const textarea = document.getElementById('testimonialMessage');
    const charCount = document.getElementById('testimonialCharCount');
    
    if (textarea && charCount) {
      textarea.addEventListener('input', () => {
        const length = textarea.value.length;
        charCount.textContent = length;
        
        if (length > 450) {
          charCount.style.color = '#ef4444';
        } else if (length > 350) {
          charCount.style.color = '#f59e0b';
        } else {
          charCount.style.color = '#9ca3af';
        }
      });
    }
  }, 100);

  return modal;
}

// ============================================
// 3️⃣ CHECK EXISTING TESTIMONIAL
// ============================================
async function checkExistingTestimonial(uid) {
  const db = window.firebaseDatabase;
  if (!db) return;

  try {
    const testimonialRef = window.firebaseRef(db, `testimonials/${uid}`);
    const snapshot = await window.firebaseGet(testimonialRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      
      // Pre-fill the form
      setTimeout(() => {
        const titleInput = document.getElementById('testimonialTitle');
        const messageInput = document.getElementById('testimonialMessage');
        
        if (titleInput) titleInput.value = data.title || '';
        if (messageInput) messageInput.value = data.message || '';
        
        if (data.rating) {
          setRating(data.rating);
        }

        if (data.displayType === 'anonymous') {
          selectDisplayType('anonymous');
        }

        showTestimonialNotification('📝 You already have a review. You can edit it.', 'info');
      }, 200);
    }
  } catch (error) {
    console.error('❌ Error checking testimonial:', error);
  }
}

// ============================================
// 4️⃣ SET RATING
// ============================================
function setRating(rating) {
  userRating = rating;
  
  const stars = document.querySelectorAll('.star');
  const ratingText = document.getElementById('ratingText');
  
  stars.forEach((star, index) => {
    if (index < rating) {
      star.textContent = '★';
      star.style.color = '#fbbf24';
    } else {
      star.textContent = '☆';
      star.style.color = '#d1d5db';
    }
  });

  const texts = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  if (ratingText) {
    ratingText.textContent = texts[rating];
    ratingText.style.color = '#fbbf24';
    ratingText.style.fontWeight = '700';
  }

  console.log('⭐ Rating set to:', rating);
}

// ============================================
// 5️⃣ SELECT DISPLAY TYPE
// ============================================
function selectDisplayType(type) {
  document.querySelectorAll('.display-name-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.style.border = '2px solid #e5e7eb';
    btn.style.background = '#fff';
    btn.style.color = '#4b5563';
  });

  const selectedBtn = document.querySelector(`[data-type="${type}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add('active');
    selectedBtn.style.border = '2px solid #667eea';
    selectedBtn.style.background = 'linear-gradient(135deg, #667eea15, #764ba215)';
    selectedBtn.style.color = '#667eea';
  }

  console.log('👤 Display type:', type);
}

// ============================================
// 6️⃣ SUBMIT TESTIMONIAL - FIXED AVATAR
// ============================================
async function submitTestimonial() {
  const user = window.firebaseAuth?.currentUser;
  if (!user) {
    showTestimonialNotification('❌ Please log in first', 'error');
    return;
  }

  const title = document.getElementById('testimonialTitle').value.trim();
  const message = document.getElementById('testimonialMessage').value.trim();
  const displayType = document.querySelector('.display-name-btn.active')?.dataset.type || 'username';

  // Validation
  if (userRating === 0) {
    showTestimonialNotification('⚠️ Please select a rating', 'error');
    return;
  }

  if (!message) {
    showTestimonialNotification('⚠️ Please write your review', 'error');
    return;
  }

  if (message.length < 20) {
    showTestimonialNotification('⚠️ Review must be at least 20 characters', 'error');
    return;
  }

  const db = window.firebaseDatabase;
  if (!db) {
    showTestimonialNotification('❌ Database not available', 'error');
    return;
  }

  try {
    showTestimonialNotification('📤 Submitting review...', 'info');

    // ✅ GET AVATAR FROM DATABASE (SINGLE SOURCE OF TRUTH)
    let userAvatar = '👤'; // Default fallback
    
    try {
      const userRef = window.firebaseRef(db, `users/${user.uid}`);
      const userSnapshot = await window.firebaseGet(userRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        userAvatar = userData.avatar || '👤';
        console.log('✅ Avatar from database:', userAvatar);
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch user avatar, using default');
    }

    // ✅ GET USERNAME FROM DATABASE
    let username = user.displayName || user.email.split('@')[0];
    
    try {
      const userRef = window.firebaseRef(db, `users/${user.uid}`);
      const userSnapshot = await window.firebaseGet(userRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        username = userData.displayName || username;
        console.log('✅ Username from database:', username);
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch username, using auth name');
    }

    const testimonialData = {
      userId: user.uid,
      username: username,
      email: user.email,
      avatar: userAvatar, // ✅ Avatar from database
      title: title || null,
      message: message,
      rating: userRating,
      displayType: displayType,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      approvedAt: null,
      featured: false
    };

    const testimonialRef = window.firebaseRef(db, `testimonials/${user.uid}`);
    await window.firebaseSet(testimonialRef, testimonialData);

    closeTestimonialModal();
    showTestimonialNotification('✅ Thank you for your review! It will be reviewed by our team.', 'success');

    console.log('✅ Testimonial submitted:', testimonialData);

  } catch (error) {
    console.error('❌ Error submitting testimonial:', error);
    
    if (error.code === 'PERMISSION_DENIED') {
      showTestimonialNotification('❌ Permission denied! Please check Firebase rules.', 'error');
    } else {
      showTestimonialNotification('❌ Failed to submit review', 'error');
    }
  }
}

// ============================================
// 7️⃣ CLOSE TESTIMONIAL MODAL
// ============================================
function closeTestimonialModal() {
  const modal = document.querySelector('.testimonial-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
  document.body.style.overflow = '';
  userRating = 0;
}

// ============================================
// 8️⃣ VIEW MY TESTIMONIALS (DARK MODE + UZ)
// ============================================
async function viewMyTestimonials() {
  const user = window.firebaseAuth?.currentUser;
  if (!user) {
    showTestimonialNotification('❌ Iltimos avval tizimga kiring', 'error');
    return;
  }

  const db = window.firebaseDatabase;
  if (!db) {
    showTestimonialNotification('❌ Ma\'lumotlar bazasi mavjud emas', 'error');
    return;
  }

  try {
    const testimonialRef = window.firebaseRef(db, `testimonials/${user.uid}`);
    const snapshot = await window.firebaseGet(testimonialRef);

    if (!snapshot.exists()) {
      showTestimonialNotification('📝 Siz hali sharh yozmagansiz', 'info');
      return;
    }

    const testimonial = snapshot.val();
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay-inline my-testimonial-modal';
    modal.innerHTML = `
      <div class="modal-inline" style="max-width: 700px;">
        <div class="modal-header-inline">
          <h3><i class="bi bi-star-fill" style="color: #fbbf24;"></i> Mening sharhim</h3>
          <button class="modal-close-inline" onclick="closeMyTestimonialModal()">×</button>
        </div>
        
        <div class="modal-body-inline" style="padding: 20px;">
          <div class="testimonial-card" style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 2px solid ${
            testimonial.status === 'approved' ? '#10b981' : 
            testimonial.status === 'rejected' ? '#ef4444' : '#f59e0b'
          };">
            
            <!-- Status Badge -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 32px;">${testimonial.avatar || '👤'}</span>
                <div>
                  <h4 style="margin: 0; color: #1f2937;" class="testimonial-username">
                    ${testimonial.displayType === 'anonymous' ? 'Anonim foydalanuvchi' : testimonial.username}
                  </h4>
                  <div style="color: #fbbf24; font-size: 20px; margin-top: 5px;">
                    ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
                  </div>
                </div>
              </div>
              
              <span class="status-badge" style="
                padding: 8px 16px;
                background: ${
                  testimonial.status === 'approved' ? '#dcfce7' : 
                  testimonial.status === 'rejected' ? '#fee2e2' : '#fef3c7'
                };
                color: ${
                  testimonial.status === 'approved' ? '#166534' : 
                  testimonial.status === 'rejected' ? '#991b1b' : '#92400e'
                };
                border-radius: 20px;
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
              ">
                ${
                  testimonial.status === 'approved' ? '✅ Tasdiqlangan' : 
                  testimonial.status === 'rejected' ? '❌ Rad etilgan' : '⏳ Ko\'rib chiqilmoqda'
                }
              </span>
            </div>

            ${testimonial.title ? `
              <h4 class="testimonial-title" style="color: #1f2937; margin-bottom: 15px; font-size: 18px;">
                "${testimonial.title}"
              </h4>
            ` : ''}

            <p class="testimonial-message" style="color: #4b5563; line-height: 1.8; margin-bottom: 20px;">
              ${testimonial.message}
            </p>

            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 2px solid #f3f4f6;" class="testimonial-footer">
              <div style="font-size: 13px; color: #9ca3af;" class="testimonial-date">
                <i class="bi bi-calendar3"></i> ${new Date(testimonial.submittedAt).toLocaleDateString('uz-UZ', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              ${testimonial.featured ? `
                <span class="featured-badge" style="color: #8b5cf6; font-weight: 700; font-size: 13px;">
                  <i class="bi bi-star-fill"></i> Tanlangan
                </span>
              ` : ''}
            </div>

            ${testimonial.status === 'approved' ? `
              <div class="info-box success-box" style="margin-top: 20px; padding: 15px; background: #dcfce7; border-radius: 8px; border-left: 4px solid #10b981;">
                <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">
                  <i class="bi bi-check-circle-fill"></i> <strong>Ajoyib yangilik!</strong> Sizning sharhingiz tasdiqlandi va asosiy sahifamizda ko'rsatilishi mumkin!
                </p>
              </div>
            ` : testimonial.status === 'rejected' ? `
              <div class="info-box error-box" style="margin-top: 20px; padding: 15px; background: #fee2e2; border-radius: 8px; border-left: 4px solid #ef4444;">
                <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
                  <i class="bi bi-x-circle-fill"></i> Sizning sharhingiz tasdiqlanmadi. Iltimos, jamiyat qoidalariga amal qiling.
                </p>
              </div>
            ` : `
              <div class="info-box warning-box" style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <i class="bi bi-hourglass-split"></i> Sizning sharhingiz jamoamiz tomonidan ko'rib chiqilmoqda. Bu odatda 24-48 soat davom etadi.
                </p>
              </div>
            `}
          </div>
        </div>

        <div class="modal-footer-inline" style="display: flex; gap: 12px;">
          <button
            class="btn-inline btn-secondary-inline"
            onclick="closeMyTestimonialModal()"
            style="flex: 1;"
          >
            Yopish
          </button>
          <button
            class="btn-inline btn-primary-inline"
            onclick="closeMyTestimonialModal(); openTestimonialModal();"
            style="flex: 1;"
          >
            <i class="bi bi-pencil-fill"></i> Tahrirlash
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
    document.body.style.overflow = 'hidden';

  } catch (error) {
    console.error('❌ Error loading testimonial:', error);
    showTestimonialNotification('❌ Sharhni yuklashda xatolik', 'error');
  }
}
function closeMyTestimonialModal() {
  const modal = document.querySelector('.my-testimonial-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
  document.body.style.overflow = '';
}

// ============================================
// 9️⃣ FETCH APPROVED TESTIMONIALS (FOR LANDING PAGE) - FIXED
// ============================================
async function fetchApprovedTestimonials(limit = 10) {
  const db = window.firebaseDatabase;
  if (!db) {
    console.error('❌ Database not available');
    return [];
  }

  try {
    // Read from public_testimonials (already approved)
    const testimonialsRef = window.firebaseRef(db, 'public_testimonials');
    const snapshot = await window.firebaseGet(testimonialsRef);

    if (!snapshot.exists()) {
      console.log('ℹ️ No public testimonials yet');
      return [];
    }

    const testimonials = [];
    snapshot.forEach(child => {
      testimonials.push({
        id: child.key,
        ...child.val()
      });
    });

    // Sort by rating (5 stars first), then featured, then date
    testimonials.sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      if (b.featured !== a.featured) {
        return b.featured ? 1 : -1;
      }
      return new Date(b.submittedAt) - new Date(a.submittedAt);
    });

    // Cache for performance
    testimonialsCache = testimonials.slice(0, limit);
    
    console.log('✅ Fetched', testimonialsCache.length, 'public testimonials');
    return testimonialsCache;

  } catch (error) {
    console.error('❌ Error fetching testimonials:', error);
    // Don't show notification here, just log the error
    return [];
  }
}

// ============================================
// 🔟 DISPLAY TESTIMONIALS ON LANDING PAGE - FIXED
// ============================================
function displayTestimonialsOnLandingPage(containerId = 'testimonialsContainer') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ Testimonials container not found');
    return;
  }

  if (testimonialsCache.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px;">
        <div style="font-size: 64px; margin-bottom: 20px;">💬</div>
        <h3 style="color: #4b5563;">No reviews yet</h3>
        <p style="color: #9ca3af;">Be the first to share your experience!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = testimonialsCache.map(testimonial => {
    // ✅ AVATAR VALIDATION - ENSURE IT'S VALID
    let displayAvatar = testimonial.avatar;
    
    // Check if avatar is missing, empty, or default
    if (!displayAvatar || displayAvatar.trim() === '' || displayAvatar === '👤') {
      displayAvatar = '👤'; // Use default icon
      console.warn('⚠️ Invalid avatar for testimonial:', testimonial.id);
    }

    return `
      <div class="testimonial-card" style="
        background: white;
        padding: 30px;
        border-radius: 16px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        transition: transform 0.3s ease;
        border: 2px solid #f3f4f6;
      ">
        <!-- Rating -->
        <div style="color: #fbbf24; font-size: 24px; margin-bottom: 15px;">
          ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
        </div>

        <!-- Title -->
        ${testimonial.title ? `
          <h4 style="color: #1f2937; margin-bottom: 12px; font-size: 18px; font-weight: 700;">
            "${testimonial.title}"
          </h4>
        ` : ''}

        <!-- Message -->
        <p style="color: #6b7280; line-height: 1.8; margin-bottom: 20px; font-size: 15px;">
          ${testimonial.message}
        </p>

        <!-- Author -->
        <div style="display: flex; align-items: center; gap: 12px; padding-top: 20px; border-top: 2px solid #f3f4f6;">
          <span style="font-size: 36px;">${displayAvatar}</span>
          <div>
            <div style="font-weight: 700; color: #1f2937; font-size: 15px;">
              ${testimonial.displayType === 'anonymous' ? 'Anonymous User' : testimonial.username}
            </div>
            <div style="font-size: 13px; color: #9ca3af;">
              ${new Date(testimonial.submittedAt).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  console.log('✅ Displayed', testimonialsCache.length, 'testimonials on landing page');
}

// ============================================
// 1️⃣1️⃣ GLOBAL EXPORTS
// ============================================
window.openTestimonialModal = openTestimonialModal;
window.closeTestimonialModal = closeTestimonialModal;
window.setRating = setRating;
window.selectDisplayType = selectDisplayType;
window.submitTestimonial = submitTestimonial;
window.viewMyTestimonials = viewMyTestimonials;
window.closeMyTestimonialModal = closeMyTestimonialModal;
window.fetchApprovedTestimonials = fetchApprovedTestimonials;
window.displayTestimonialsOnLandingPage = displayTestimonialsOnLandingPage;

// ============================================
// 1️⃣2️⃣ AUTO-LOAD TESTIMONIALS - FIXED WITH SILENT ERROR HANDLING
// ============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Silent fetch - won't show errors to user
    fetchApprovedTestimonials().catch(err => {
      console.log('ℹ️ Testimonials not loaded yet (normal on first setup)');
    });
  });
} else {
  // Silent fetch - won't show errors to user
  fetchApprovedTestimonials().catch(err => {
    console.log('ℹ️ Testimonials not loaded yet (normal on first setup)');
  });
}

console.log('✅ Testimonials system loaded!');
console.log('💡 Usage:');
console.log('   openTestimonialModal() - Open review form');
console.log('   viewMyTestimonials() - View your review');
console.log('   fetchApprovedTestimonials() - Get approved reviews');
console.log('   displayTestimonialsOnLandingPage() - Display on landing page');