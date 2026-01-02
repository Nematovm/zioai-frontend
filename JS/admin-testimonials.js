// ============================================
// 👨‍💼 ADMIN TESTIMONIAL MANAGEMENT
// ============================================

console.log('👨‍💼 Loading admin testimonial manager...');

// ============================================
// NOTIFICATION HELPER - FIXED
// ============================================
function showAdminNotification(message, type = 'info') {
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
  notification.className = 'admin-notification';
  notification.innerHTML = `
    <style>
      .admin-notification {
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
// OPEN ADMIN TESTIMONIALS PANEL
// ============================================
async function openAdminTestimonialsPanel() {
  const user = window.firebaseAuth?.currentUser;
  if (!user) {
    showAdminNotification('❌ Please log in first', 'error');
    return;
  }

  const db = window.firebaseDatabase;
  if (!db) {
    showAdminNotification('❌ Database not available', 'error');
    return;
  }

  try {
    // Verify admin status
    const adminRef = window.firebaseRef(db, `admins/${user.uid}`);
    const adminSnap = await window.firebaseGet(adminRef);
    
    if (adminSnap.val() !== true) {
      showAdminNotification('❌ Admin access required', 'error');
      return;
    }

    // Fetch all testimonials
    const testimonialsRef = window.firebaseRef(db, 'testimonials');
    const snapshot = await window.firebaseGet(testimonialsRef);

    const testimonials = [];
    if (snapshot.exists()) {
      snapshot.forEach(child => {
        testimonials.push({
          id: child.key,
          ...child.val()
        });
      });
    }

    // Sort by submission date (newest first)
    testimonials.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    // Create modal
    const modal = createAdminTestimonialsModal(testimonials);
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);

    console.log('✅ Admin testimonials panel opened:', testimonials.length, 'testimonials');

  } catch (error) {
    console.error('❌ Error opening admin panel:', error);
    showAdminNotification('Failed to load testimonials: ' + error.message, 'error');
  }
}

// ============================================
// CREATE ADMIN MODAL
// ============================================
function createAdminTestimonialsModal(testimonials) {
  const pending = testimonials.filter(t => t.status === 'pending');
  const approved = testimonials.filter(t => t.status === 'approved');
  const rejected = testimonials.filter(t => t.status === 'rejected');

  const modal = document.createElement('div');
  modal.className = 'admin-testimonials-modal';
  modal.innerHTML = `
    <style>
      .admin-testimonials-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        padding: 20px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .admin-testimonials-modal.active {
        opacity: 1;
      }

      .admin-modal-content {
        background: white;
        border-radius: 20px;
        max-width: 1200px;
        width: 100%;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
      }

      .admin-modal-header {
        padding: 30px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .admin-modal-header h2 {
        margin: 0;
        font-size: 28px;
        font-weight: 800;
      }

      .admin-close-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 32px;
        width: 45px;
        height: 45px;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .admin-close-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: rotate(90deg);
      }

      .admin-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
        padding: 25px 30px;
        background: #f9fafb;
        border-bottom: 2px solid #e5e7eb;
      }

      .admin-stat-card {
        text-align: center;
        padding: 15px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      }

      .admin-stat-value {
        font-size: 32px;
        font-weight: 800;
        margin-bottom: 5px;
      }

      .admin-stat-label {
        font-size: 13px;
        color: #6b7280;
        font-weight: 600;
      }

      .admin-tabs {
        display: flex;
        gap: 10px;
        padding: 20px 30px;
        background: white;
        border-bottom: 2px solid #e5e7eb;
      }

      .admin-tab {
        padding: 12px 24px;
        border: none;
        background: #f3f4f6;
        color: #6b7280;
        font-weight: 700;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .admin-tab.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .admin-modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 30px;
      }

      .admin-testimonial-card {
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 16px;
        padding: 25px;
        margin-bottom: 20px;
        transition: all 0.3s ease;
      }

      .admin-testimonial-card:hover {
        border-color: #667eea;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
      }

      .admin-testimonial-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 20px;
      }

      .admin-testimonial-author {
        display: flex;
        gap: 15px;
        align-items: center;
      }

      .admin-author-avatar {
        font-size: 48px;
      }

      .admin-author-info h4 {
        margin: 0 0 5px 0;
        color: #1f2937;
        font-size: 18px;
      }

      .admin-author-email {
        color: #9ca3af;
        font-size: 13px;
      }

      .admin-rating {
        color: #fbbf24;
        font-size: 24px;
      }

      .admin-testimonial-content {
        margin: 20px 0;
      }

      .admin-testimonial-title {
        font-weight: 700;
        color: #1f2937;
        font-size: 16px;
        margin-bottom: 10px;
      }

      .admin-testimonial-message {
        color: #4b5563;
        line-height: 1.8;
        padding: 15px;
        background: #f9fafb;
        border-radius: 10px;
      }

      .admin-testimonial-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 20px;
        border-top: 2px solid #f3f4f6;
      }

      .admin-testimonial-date {
        font-size: 13px;
        color: #9ca3af;
      }

      .admin-action-buttons {
        display: flex;
        gap: 10px;
      }

      .admin-action-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
      }

      .admin-approve-btn {
        background: #10b981;
        color: white;
      }

      .admin-approve-btn:hover {
        background: #059669;
      }

      .admin-reject-btn {
        background: #ef4444;
        color: white;
      }

      .admin-reject-btn:hover {
        background: #dc2626;
      }

      .admin-feature-btn {
        background: #fbbf24;
        color: #1f2937;
      }

      .admin-feature-btn:hover {
        background: #f59e0b;
      }

      .admin-delete-btn {
        background: #6b7280;
        color: white;
      }

      .admin-delete-btn:hover {
        background: #4b5563;
      }

      .admin-empty-state {
        text-align: center;
        padding: 60px 20px;
      }

      .admin-empty-icon {
        font-size: 64px;
        margin-bottom: 20px;
      }

      .admin-tab-content {
        display: none;
      }

      .admin-tab-content.active {
        display: block;
      }
    </style>

    <div class="admin-modal-content">
      <!-- Header -->
      <div class="admin-modal-header">
        <h2>
          <i class="bi bi-star-fill"></i>
          Testimonials Management
        </h2>
        <button class="admin-close-btn" onclick="closeAdminTestimonialsPanel()">×</button>
      </div>

      <!-- Stats -->
      <div class="admin-stats">
        <div class="admin-stat-card">
          <div class="admin-stat-value" style="color: #f59e0b;">${pending.length}</div>
          <div class="admin-stat-label">Pending</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-value" style="color: #10b981;">${approved.length}</div>
          <div class="admin-stat-label">Approved</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-value" style="color: #ef4444;">${rejected.length}</div>
          <div class="admin-stat-label">Rejected</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-value" style="color: #667eea;">${testimonials.length}</div>
          <div class="admin-stat-label">Total</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="admin-tabs">
        <button class="admin-tab active" onclick="switchAdminTab('pending')">
          ⏳ Pending (${pending.length})
        </button>
        <button class="admin-tab" onclick="switchAdminTab('approved')">
          ✅ Approved (${approved.length})
        </button>
        <button class="admin-tab" onclick="switchAdminTab('rejected')">
          ❌ Rejected (${rejected.length})
        </button>
      </div>

      <!-- Body -->
      <div class="admin-modal-body">
        <!-- Pending Tab -->
        <div class="admin-tab-content active" id="admin-pending-tab">
          ${pending.length === 0 ? `
            <div class="admin-empty-state">
              <div class="admin-empty-icon">📭</div>
              <h3 style="color: #4b5563;">No pending testimonials</h3>
              <p style="color: #9ca3af;">All reviews have been processed</p>
            </div>
          ` : pending.map(t => renderAdminTestimonialCard(t, 'pending')).join('')}
        </div>

        <!-- Approved Tab -->
        <div class="admin-tab-content" id="admin-approved-tab">
          ${approved.length === 0 ? `
            <div class="admin-empty-state">
              <div class="admin-empty-icon">✅</div>
              <h3 style="color: #4b5563;">No approved testimonials</h3>
            </div>
          ` : approved.map(t => renderAdminTestimonialCard(t, 'approved')).join('')}
        </div>

        <!-- Rejected Tab -->
        <div class="admin-tab-content" id="admin-rejected-tab">
          ${rejected.length === 0 ? `
            <div class="admin-empty-state">
              <div class="admin-empty-icon">❌</div>
              <h3 style="color: #4b5563;">No rejected testimonials</h3>
            </div>
          ` : rejected.map(t => renderAdminTestimonialCard(t, 'rejected')).join('')}
        </div>
      </div>
    </div>
  `;

  return modal;
}

// ============================================
// RENDER TESTIMONIAL CARD
// ============================================
function renderAdminTestimonialCard(testimonial, tab) {
  return `
    <div class="admin-testimonial-card">
      <div class="admin-testimonial-header">
        <div class="admin-testimonial-author">
          <span class="admin-author-avatar">${testimonial.avatar || '👤'}</span>
          <div class="admin-author-info">
            <h4>${testimonial.displayType === 'anonymous' ? 'Anonymous User' : testimonial.username}</h4>
            <div class="admin-author-email">${testimonial.email}</div>
            <div class="admin-author-email">User ID: ${testimonial.userId}</div>
          </div>
        </div>
        <div class="admin-rating">
          ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
        </div>
      </div>

      <div class="admin-testimonial-content">
        ${testimonial.title ? `
          <div class="admin-testimonial-title">"${testimonial.title}"</div>
        ` : ''}
        <div class="admin-testimonial-message">${testimonial.message}</div>
      </div>

      <div class="admin-testimonial-footer">
        <div class="admin-testimonial-date">
          <i class="bi bi-calendar3"></i> ${new Date(testimonial.submittedAt).toLocaleString()}
          ${testimonial.featured ? '<span style="color: #8b5cf6; margin-left: 10px;"><i class="bi bi-star-fill"></i> Featured</span>' : ''}
        </div>
        <div class="admin-action-buttons">
          ${tab === 'pending' ? `
            <button class="admin-action-btn admin-approve-btn" onclick="approveTestimonial('${testimonial.id}')">
              <i class="bi bi-check-circle"></i> Approve
            </button>
            <button class="admin-action-btn admin-reject-btn" onclick="rejectTestimonial('${testimonial.id}')">
              <i class="bi bi-x-circle"></i> Reject
            </button>
          ` : ''}
          ${tab === 'approved' ? `
            <button class="admin-action-btn admin-feature-btn" onclick="toggleFeature('${testimonial.id}', ${!testimonial.featured})">
              <i class="bi bi-star"></i> ${testimonial.featured ? 'Unfeature' : 'Feature'}
            </button>
            <button class="admin-action-btn admin-reject-btn" onclick="rejectTestimonial('${testimonial.id}')">
              <i class="bi bi-x-circle"></i> Reject
            </button>
          ` : ''}
          ${tab === 'rejected' ? `
            <button class="admin-action-btn admin-approve-btn" onclick="approveTestimonial('${testimonial.id}')">
              <i class="bi bi-check-circle"></i> Approve
            </button>
          ` : ''}
          <button class="admin-action-btn admin-delete-btn" onclick="deleteTestimonial('${testimonial.id}')">
            <i class="bi bi-trash"></i> Delete
          </button>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// APPROVE TESTIMONIAL - FIXED AVATAR COPY
// ============================================
async function approveTestimonial(testimonialId) {
  if (!confirm('Approve this testimonial?')) return;

  const db = window.firebaseDatabase;
  const testimonialRef = window.firebaseRef(db, `testimonials/${testimonialId}`);

  try {
    // Get testimonial data
    const snapshot = await window.firebaseGet(testimonialRef);
    if (!snapshot.exists()) {
      showAdminNotification('❌ Testimonial not found', 'error');
      return;
    }

    const testimonialData = snapshot.val();
    const now = new Date().toISOString();

    // ✅ ENSURE AVATAR EXISTS
    let finalAvatar = testimonialData.avatar;
    
    // If no avatar in testimonial, fetch from user profile
    if (!finalAvatar || finalAvatar === '👤' || finalAvatar.trim() === '') {
      try {
        const userRef = window.firebaseRef(db, `users/${testimonialData.userId}`);
        const userSnapshot = await window.firebaseGet(userRef);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          finalAvatar = userData.avatar || '👤';
          console.log('✅ Avatar fetched from user profile:', finalAvatar);
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch user avatar');
        finalAvatar = '👤'; // Fallback
      }
    }

    // Update status in private testimonials
    await window.firebaseUpdate(testimonialRef, {
      status: 'approved',
      approvedAt: now,
      avatar: finalAvatar // ✅ Update avatar if it was missing
    });

    // ✅ COPY TO PUBLIC WITH CORRECT AVATAR
    const publicRef = window.firebaseRef(db, `public_testimonials/${testimonialId}`);
    await window.firebaseSet(publicRef, {
      userId: testimonialData.userId,
      username: testimonialData.username,
      avatar: finalAvatar, // ✅ Use finalized avatar
      title: testimonialData.title || null,
      message: testimonialData.message,
      rating: testimonialData.rating,
      displayType: testimonialData.displayType,
      status: 'approved',
      submittedAt: testimonialData.submittedAt,
      approvedAt: now,
      featured: testimonialData.featured || false
    });

    showAdminNotification('✅ Testimonial approved and published!', 'success');
    closeAdminTestimonialsPanel();
    openAdminTestimonialsPanel();
  } catch (error) {
    console.error('❌ Error:', error);
    showAdminNotification('Failed to approve: ' + error.message, 'error');
  }
}

async function rejectTestimonial(testimonialId) {
  if (!confirm('Reject this testimonial?')) return;

  const db = window.firebaseDatabase;
  const testimonialRef = window.firebaseRef(db, `testimonials/${testimonialId}`);
  const publicRef = window.firebaseRef(db, `public_testimonials/${testimonialId}`);

  try {
    // Update status in private testimonials
    await window.firebaseUpdate(testimonialRef, {
      status: 'rejected'
    });

    // Remove from public testimonials if exists
    await window.firebaseRemove(publicRef);

    showAdminNotification('❌ Testimonial rejected and removed from public', 'info');
    closeAdminTestimonialsPanel();
    openAdminTestimonialsPanel();
  } catch (error) {
    console.error('❌ Error:', error);
    showAdminNotification('Failed to reject: ' + error.message, 'error');
  }
}

async function toggleFeature(testimonialId, featured) {
  const db = window.firebaseDatabase;
  const testimonialRef = window.firebaseRef(db, `testimonials/${testimonialId}`);
  const publicRef = window.firebaseRef(db, `public_testimonials/${testimonialId}`);

  try {
    // Update in private testimonials
    await window.firebaseUpdate(testimonialRef, { featured });
    
    // Update in public testimonials if exists
    const publicSnapshot = await window.firebaseGet(publicRef);
    if (publicSnapshot.exists()) {
      await window.firebaseUpdate(publicRef, { featured });
    }
    
    showAdminNotification(featured ? '⭐ Featured!' : 'Unfeatured', 'success');
    closeAdminTestimonialsPanel();
    openAdminTestimonialsPanel();
  } catch (error) {
    console.error('❌ Error:', error);
    showAdminNotification('Failed: ' + error.message, 'error');
  }
}

async function deleteTestimonial(testimonialId) {
  if (!confirm('⚠️ Delete this testimonial permanently?')) return;

  const db = window.firebaseDatabase;
  const testimonialRef = window.firebaseRef(db, `testimonials/${testimonialId}`);
  const publicRef = window.firebaseRef(db, `public_testimonials/${testimonialId}`);

  try {
    // Delete from private testimonials
    await window.firebaseRemove(testimonialRef);
    
    // Delete from public testimonials
    await window.firebaseRemove(publicRef);
    
    showAdminNotification('🗑️ Testimonial deleted from both private and public', 'success');
    closeAdminTestimonialsPanel();
    openAdminTestimonialsPanel();
  } catch (error) {
    console.error('❌ Error:', error);
    showAdminNotification('Failed to delete: ' + error.message, 'error');
  }
}

// ============================================
// SWITCH TAB
// ============================================
function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));

  document.querySelector(`[onclick="switchAdminTab('${tab}')"]`).classList.add('active');
  document.getElementById(`admin-${tab}-tab`).classList.add('active');
}

// ============================================
// CLOSE PANEL
// ============================================
function closeAdminTestimonialsPanel() {
  const modal = document.querySelector('.admin-testimonials-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

// ============================================
// EXPORTS
// ============================================
window.openAdminTestimonialsPanel = openAdminTestimonialsPanel;
window.closeAdminTestimonialsPanel = closeAdminTestimonialsPanel;
window.switchAdminTab = switchAdminTab;
window.approveTestimonial = approveTestimonial;
window.rejectTestimonial = rejectTestimonial;
window.toggleFeature = toggleFeature;
window.deleteTestimonial = deleteTestimonial;

console.log('✅ Admin testimonial manager loaded!');
console.log('💡 Usage: openAdminTestimonialsPanel()');