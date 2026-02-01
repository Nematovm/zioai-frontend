// ============================================
// 📱 PROFILE MANAGEMENT SYSTEM - FULLY FIXED
// ============================================

console.log('🔧 Loading profile.js...');

// ============================================
// GLOBAL STATE
// ============================================
let currentSelectedEmoji = null;
let currentUserData = null;

// ============================================
// FIXED: INITIALIZE PROFILE
// ============================================
async function initializeProfile() {
  const user = window.firebaseAuth?.currentUser;
  if (!user) {
    console.error('❌ No user logged in');
    return;
  }

  const db = window.firebaseDatabase;
  if (!db) {
    console.error('❌ Database not available');
    return;
  }

  try {
    console.log('🔄 Loading profile for:', user.uid);

    // ✅ LOAD FROM DATABASE (SINGLE SOURCE OF TRUTH)
    const userRef = window.firebaseRef(db, `users/${user.uid}`);
    const snapshot = await window.firebaseGet(userRef);

    if (snapshot.exists()) {
      currentUserData = snapshot.val();
      
      // ✅ SYNC AUTH displayName WITH DATABASE
      const dbAvatar = currentUserData.avatar || '👤';
      const dbUsername = currentUserData.displayName || user.email.split('@')[0];
      const expectedDisplayName = `${dbAvatar} ${dbUsername}`;
      
      // Update auth if different
      if (user.displayName !== expectedDisplayName) {
        await window.updateProfile(user, {
          displayName: expectedDisplayName
        });
        console.log('✅ Auth synced with database');
      }
      
      updateProfileUI(user, currentUserData);
    } else {
      await initializeNewUser(user);
    }

    await loadTransactions(user.uid);

    // Check dark mode
    const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    if (darkModeEnabled) {
      document.body.classList.add('dark-mode');
      const toggle = document.getElementById('darkModeToggle');
      if (toggle) toggle.checked = true;
    }

  } catch (error) {
    console.error('❌ Error initializing profile:', error);
    showNotification('Failed to load profile data', 'error');
  }
}

// ============================================
// 2️⃣ INITIALIZE NEW USER
// ============================================
async function initializeNewUser(user) {
  const db = window.firebaseDatabase;
  const userRef = window.firebaseRef(db, `users/${user.uid}`);

  const userData = {
    email: user.email,
    displayName: user.displayName || user.email.split('@')[0],
    avatar: '👤',
    coins: 0,
    createdAt: new Date().toISOString(),
    subscription: {
      type: 'free',
      expiry: null
    }
  };

  await window.firebaseSet(userRef, userData);
  currentUserData = userData;
  console.log('✅ New user initialized');
}

// ============================================
// FIXED: UPDATE PROFILE UI
// ============================================
function updateProfileUI(user, userData) {
  // ✅ USE DATABASE DATA (NOT AUTH)
  const avatar = userData.avatar || '👤';
  const username = userData.displayName || user.email.split('@')[0];

  // Avatar
  const profileAvatar = document.getElementById('profileAvatar');
  if (profileAvatar) {
    profileAvatar.textContent = avatar;
  }

  // Name
  const profileName = document.getElementById('profileName');
  if (profileName) {
    profileName.textContent = username;
  }

  // Email
  const profileEmail = document.getElementById('profileEmail');
  if (profileEmail) {
    profileEmail.textContent = user.email;
  }

  // Member since
  const profileDate = document.getElementById('profileDate');
  if (profileDate && userData.createdAt) {
    const date = new Date(userData.createdAt);
    profileDate.innerHTML = `<i class="bi bi-calendar3"></i> Member since: ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  }

  // Coins
  const profileCoinBalance = document.getElementById('profileCoinBalance');
  if (profileCoinBalance) {
    profileCoinBalance.textContent = userData.coins || 0;
  }

  // Username input
  const usernameInput = document.getElementById('usernameInput');
  if (usernameInput) {
    usernameInput.value = username;
  }

  // Email input
  const emailInput = document.getElementById('emailInput');
  if (emailInput) {
    emailInput.value = user.email;
  }

  // Subscription
  updateSubscriptionInfo(userData.subscription);

  console.log('✅ Profile UI updated:', { avatar, username });
}

// ============================================
// 4️⃣ UPDATE SUBSCRIPTION INFO
// ============================================
function updateSubscriptionInfo(subscription) {
  const badge = document.getElementById('subscriptionBadgeProfile');
  const expiry = document.getElementById('subscriptionExpiry');
  const dailyLimit = document.getElementById('dailyCoinLimit');

  if (!subscription || subscription.type === 'free') {
    if (badge) {
      badge.textContent = 'FREE';
      badge.style.background = 'linear-gradient(135deg, #6b7280, #4b5563)';
    }
    if (expiry) expiry.textContent = 'No expiry';
    if (dailyLimit) dailyLimit.textContent = '5 coins/day';
  } else if (subscription.type === 'pro') {
    if (badge) {
      badge.textContent = 'PRO';
      badge.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    }
    if (expiry && subscription.expiry) {
      const expiryDate = new Date(subscription.expiry);
      expiry.textContent = `Expires: ${expiryDate.toLocaleDateString()}`;
    }
    if (dailyLimit) dailyLimit.textContent = 'Unlimited coins';
  } else if (subscription.type === 'standard') {
    if (badge) {
      badge.textContent = 'STANDARD';
      badge.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
    }
    if (expiry && subscription.expiry) {
      const expiryDate = new Date(subscription.expiry);
      expiry.textContent = `Expires: ${expiryDate.toLocaleDateString()}`;
    }
    if (dailyLimit) dailyLimit.textContent = '20 coins/day';
  }
}

// ============================================
// 5️⃣ LOAD TRANSACTIONS
// ============================================
async function loadTransactions(uid) {
  const db = window.firebaseDatabase;
  if (!db) return;

  try {
    const transactionsRef = window.firebaseRef(db, `users/${uid}/transactions`);
    const snapshot = await window.firebaseGet(transactionsRef);

    const transactionList = document.getElementById('transactionList');
    if (!transactionList) return;

    if (!snapshot.exists()) {
      transactionList.innerHTML = '<div style="text-align: center; padding: 20px; color: #9ca3af;">No transactions yet</div>';
      return;
    }

    const transactions = [];
    snapshot.forEach(child => {
      transactions.push({
        id: child.key,
        ...child.val()
      });
    });

    // Sort by timestamp (newest first)
    transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Display last 10 transactions
    transactionList.innerHTML = transactions.slice(0, 10).map(tx => `
      <div class="transaction-item" style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: #f9fafb;
        border-radius: 8px;
        margin-bottom: 8px;
      ">
        <div>
          <div style="font-weight: 600; color: #1f2937;">${tx.description || 'Transaction'}</div>
          <div style="font-size: 12px; color: #9ca3af;">
            ${new Date(tx.timestamp).toLocaleString()}
          </div>
        </div>
        <div style="font-weight: 700; color: ${tx.type === 'add' ? '#10b981' : '#ef4444'};">
          ${tx.type === 'add' ? '+' : '-'}${tx.amount} 🪙
        </div>
      </div>
    `).join('');

    console.log('✅ Loaded', transactions.length, 'transactions');

  } catch (error) {
    console.error('❌ Error loading transactions:', error);
  }
}

// ============================================
// FIXED: UPDATE USERNAME
// ============================================
async function updateUsername() {
  const user = window.firebaseAuth?.currentUser;
  if (!user) {
    showNotification('❌ Please log in first', 'error');
    return;
  }

  const newUsername = document.getElementById('usernameInput').value.trim();
  
  if (!newUsername) {
    showNotification('⚠️ Username cannot be empty', 'error');
    return;
  }

  if (newUsername.length < 3) {
    showNotification('⚠️ Username must be at least 3 characters', 'error');
    return;
  }

  const db = window.firebaseDatabase;
  if (!db) {
    showNotification('❌ Database not available', 'error');
    return;
  }

  try {
    showNotification('🔄 Updating username...', 'info');

    // ✅ 1. UPDATE DATABASE FIRST
    const userRef = window.firebaseRef(db, `users/${user.uid}`);
    await window.firebaseUpdate(userRef, {
      displayName: newUsername
    });

    // ✅ 2. UPDATE AUTH (WITH CURRENT AVATAR)
    const currentAvatar = currentUserData?.avatar || '👤';
    await window.updateProfile(user, {
      displayName: `${currentAvatar} ${newUsername}` // Format: emoji + space + username
    });

    // ✅ 3. UPDATE LOCAL STATE
    if (currentUserData) {
      currentUserData.displayName = newUsername;
    }

    // ✅ 4. UPDATE UI
    const profileName = document.getElementById('profileName');
    if (profileName) profileName.textContent = newUsername;

    const headerUserName = document.getElementById('userName');
    if (headerUserName) headerUserName.textContent = newUsername;

    showNotification('✅ Username updated successfully!', 'success');
    console.log('✅ Username updated to:', newUsername);

  } catch (error) {
    console.error('❌ Error updating username:', error);
    showNotification('❌ Failed to update username: ' + error.message, 'error');
  }
}

// ============================================
// 7️⃣ AVATAR MODAL FUNCTIONS
// ============================================
function openAvatarModal() {
  try {
    const modal = document.getElementById('avatarModal');
    if (!modal) {
      console.error('❌ Avatar modal not found');
      return;
    }

    // Generate emoji grid
    const emojiGrid = document.getElementById('emojiGrid');
    if (emojiGrid) {
      const emojis = [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
        '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
        '😎', '🤓', '🧐', '🤠', '🥳', '🤗', '🤔', '🤨',
        '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮',
        '🤐', '😯', '😪', '😫', '🥱', '😴', '😌', '😛',
        '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙁',
        '👤', '👨', '👩', '👶', '👧', '👦', '👴', '👵',
        '🧑', '🧒', '🧓', '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '👨‍🏫',
        '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
        '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'
      ];

      emojiGrid.innerHTML = emojis.map(emoji => `
        <div class="emoji-item-inline" data-emoji="${emoji}" onclick="selectEmoji('${emoji}')">
          ${emoji}
        </div>
      `).join('');
    }

    // Set current emoji as selected
    if (currentUserData?.avatar) {
      currentSelectedEmoji = currentUserData.avatar;
      setTimeout(() => {
        const item = emojiGrid.querySelector(`[data-emoji="${currentSelectedEmoji}"]`);
        if (item) item.classList.add('selected');
      }, 100);
    }

    modal.classList.add('active');
    console.log('✅ Avatar modal opened');
  } catch (error) {
    console.error('❌ Error opening avatar modal:', error);
  }
}

function closeAvatarModal() {
  try {
    const modal = document.getElementById('avatarModal');
    if (modal) {
      modal.classList.remove('active');
    }
    currentSelectedEmoji = null;
    console.log('✅ Avatar modal closed');
  } catch (error) {
    console.error('❌ Error closing avatar modal:', error);
  }
}

function selectEmoji(emoji) {
  try {
    currentSelectedEmoji = emoji;
    
    // Remove previous selection
    const allEmojis = document.querySelectorAll('.emoji-item-inline');
    allEmojis.forEach(item => {
      item.classList.remove('selected');
    });
    
    // Add selection to clicked emoji
    const selectedItem = document.querySelector(`[data-emoji="${emoji}"]`);
    if (selectedItem) {
      selectedItem.classList.add('selected');
    }
    
    console.log('✅ Emoji selected:', emoji);
  } catch (error) {
    console.error('❌ Error selecting emoji:', error);
  }
}

// ============================================
// FIXED: SAVE AVATAR
// ============================================
async function saveAvatar() {
  if (!currentSelectedEmoji) {
    showNotification('⚠️ Please select an emoji', 'error');
    return;
  }

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
    showNotification('🔄 Updating avatar...', 'info');

    // ✅ 1. UPDATE DATABASE FIRST
    const userRef = window.firebaseRef(db, `users/${user.uid}`);
    await window.firebaseUpdate(userRef, {
      avatar: currentSelectedEmoji
    });

    // ✅ 2. UPDATE AUTH displayName (KEEP USERNAME)
    const currentUsername = currentUserData?.displayName || user.email.split('@')[0];
    await window.updateProfile(user, {
      displayName: `${currentSelectedEmoji} ${currentUsername}`
    });

    // ✅ 3. UPDATE LOCAL STATE
    if (currentUserData) {
      currentUserData.avatar = currentSelectedEmoji;
    }

    // ✅ 4. UPDATE UI
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) {
      profileAvatar.textContent = currentSelectedEmoji;
    }

    closeAvatarModal();
    showNotification('✅ Avatar updated!', 'success');
    console.log('✅ Avatar updated to:', currentSelectedEmoji);

  } catch (error) {
    console.error('❌ Error updating avatar:', error);
    showNotification('❌ Failed to update avatar: ' + error.message, 'error');
  }
}

// ============================================
// 8️⃣ PASSWORD MODAL FUNCTIONS - FIXED
// ============================================
function openPasswordModal() {
  try {
    const modal = document.getElementById('passwordModal');
    if (modal) {
      modal.classList.add('active');
      console.log('✅ Password modal opened');
    } else {
      console.error('❌ Password modal not found');
    }
  } catch (error) {
    console.error('❌ Error opening password modal:', error);
  }
}

function closePasswordModal() {
  try {
    const modal = document.getElementById('passwordModal');
    if (modal) {
      modal.classList.remove('active');
    }
    
    // Clear inputs safely
    const currentPassword = document.getElementById('currentPassword');
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (currentPassword) currentPassword.value = '';
    if (newPassword) newPassword.value = '';
    if (confirmPassword) confirmPassword.value = '';
    
    console.log('✅ Password modal closed');
  } catch (error) {
    console.error('❌ Error closing password modal:', error);
  }
}

async function changePassword() {
  const user = window.firebaseAuth?.currentUser;
  if (!user) {
    showNotification('❌ Please log in first', 'error');
    return;
  }

  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validation
  if (!currentPassword || !newPassword || !confirmPassword) {
    showNotification('⚠️ All fields are required', 'error');
    return;
  }

  if (newPassword.length < 6) {
    showNotification('⚠️ New password must be at least 6 characters', 'error');
    return;
  }

  if (newPassword !== confirmPassword) {
    showNotification('⚠️ Passwords do not match', 'error');
    return;
  }

  if (currentPassword === newPassword) {
    showNotification('⚠️ New password must be different from current password', 'error');
    return;
  }

  try {
    showNotification('🔄 Changing password...', 'info');

    // ✅ FIXED: Re-authenticate user with correct method
    const credential = window.EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    
    console.log('🔐 Re-authenticating user...');
    await window.reauthenticateWithCredential(user, credential);
    console.log('✅ Re-authentication successful');

    // ✅ Update password
    console.log('🔄 Updating password...');
    await window.updatePassword(user, newPassword);
    console.log('✅ Password updated');

    // ✅ Clear inputs
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';

    closePasswordModal();
    showNotification('✅ Password changed successfully!', 'success');

  } catch (error) {
    console.error('❌ Error changing password:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // ✅ FIXED: Better error handling
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      showNotification('❌ Current password is incorrect. Please try again.', 'error');
    } else if (error.code === 'auth/weak-password') {
      showNotification('❌ New password is too weak. Use a stronger password.', 'error');
    } else if (error.code === 'auth/requires-recent-login') {
      showNotification('❌ Please log out and log back in, then try again.', 'error');
    } else if (error.code === 'auth/too-many-requests') {
      showNotification('❌ Too many failed attempts. Please try again later.', 'error');
    } else {
      showNotification('❌ Failed to change password: ' + error.message, 'error');
    }
  }
}

// ============================================
// 9️⃣ DELETE ACCOUNT MODAL - FIXED
// ============================================
function openDeleteModal() {
  try {
    const modal = document.getElementById('deleteModal');
    if (modal) {
      modal.classList.add('active');
      console.log('✅ Delete modal opened');
    } else {
      console.error('❌ Delete modal not found');
    }
  } catch (error) {
    console.error('❌ Error opening delete modal:', error);
  }
}

function closeDeleteModal() {
  try {
    const modal = document.getElementById('deleteModal');
    if (modal) {
      modal.classList.remove('active');
    }
    
    const deleteConfirm = document.getElementById('deleteConfirm');
    if (deleteConfirm) {
      deleteConfirm.value = '';
    }
    
    console.log('✅ Delete modal closed');
  } catch (error) {
    console.error('❌ Error closing delete modal:', error);
  }
}

async function deleteAccount() {
  const confirmText = document.getElementById('deleteConfirm').value;
  
  if (confirmText !== 'DELETE') {
    showNotification('⚠️ Please type "DELETE" to confirm', 'error');
    return;
  }

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
    showNotification('🔄 Deleting account...', 'info');

    // Delete user data from database
    const userRef = window.firebaseRef(db, `users/${user.uid}`);
    await window.firebaseRemove(userRef);

    // Delete user account
    await window.deleteUser(user);

    showNotification('✅ Account deleted successfully', 'success');

    setTimeout(() => {
      window.location.href = './login.html';
    }, 2000);

    console.log('✅ Account deleted');

  } catch (error) {
    console.error('❌ Error deleting account:', error);
    
    if (error.code === 'auth/requires-recent-login') {
      showNotification('❌ Please log out and log back in, then try again', 'error');
    } else {
      showNotification('❌ Failed to delete account', 'error');
    }
  }
}

// ============================================
// 🔟 DARK MODE TOGGLE
// ============================================
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', isDark);
  console.log('🌓 Dark mode:', isDark ? 'enabled' : 'disabled');
}

// ============================================
// 1️⃣1️⃣ EXPORT DATA
// ============================================
async function exportData() {
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
    showNotification('📦 Exporting data...', 'info');

    const userRef = window.firebaseRef(db, `users/${user.uid}`);
    const snapshot = await window.firebaseGet(userRef);

    if (!snapshot.exists()) {
      showNotification('❌ No data to export', 'error');
      return;
    }

    const userData = snapshot.val();
    const exportData = {
      email: user.email,
      exportDate: new Date().toISOString(),
      ...userData
    };

    // Create and download JSON file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ziyoai-data-${user.uid}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('✅ Data exported successfully!', 'success');

    console.log('✅ Data exported');

  } catch (error) {
    console.error('❌ Error exporting data:', error);
    showNotification('❌ Failed to export data', 'error');
  }
}

// ============================================
// 1️⃣2️⃣ CLAIM DAILY BONUS FROM UI - FIXED ✅
// ============================================
async function claimDailyBonusFromUI() {
  try {
    // ✅ CHECK IF COIN SYSTEM IS LOADED
    if (typeof window.claimDailyBonus !== 'function') {
      console.warn('⚠️ Coin system not loaded, waiting...');
      
      // ✅ WAIT UP TO 5 SECONDS
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (typeof window.claimDailyBonus === 'function') {
          console.log('✅ Coin system loaded!');
          await window.claimDailyBonus();
          return;
        }
      }
      
      // If still not loaded after 5 seconds
      showNotification('⚠️ Please wait a moment and try again', 'warning');
      return;
    }
    
    // ✅ IF ALREADY LOADED
    await window.claimDailyBonus();
    
  } catch (error) {
    console.error('❌ Error claiming daily bonus:', error);
    showNotification('❌ Failed to claim daily bonus', 'error');
  }
}

// ============================================
// 1️⃣3️⃣ NOTIFICATION HELPER - FIXED
// ============================================
function showNotification(message, type = 'info') {
  // Check if external notification system exists
  if (typeof window.showNotification === 'function' && window.showNotification !== showNotification) {
    window.showNotification(message, type);
    return;
  }

  // Built-in notification system (fallback)
  const notification = document.createElement('div');
  notification.className = 'profile-notification';
  
  // Icon based on type
  let icon = '📢';
  let bgColor = '#3b82f6';
  
  if (type === 'success') {
    icon = '✅';
    bgColor = '#10b981';
  } else if (type === 'error') {
    icon = '❌';
    bgColor = '#ef4444';
  } else if (type === 'info') {
    icon = '📢';
    bgColor = '#3b82f6';
  } else if (type === 'warning') {
    icon = '⚠️';
    bgColor = '#f59e0b';
  }
  
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 99999;
      background: ${bgColor};
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 300px;
      max-width: 500px;
      animation: slideInFromRight 0.3s ease, fadeOut 0.3s ease 2.7s;
      font-weight: 600;
      font-size: 15px;
    ">
      <span style="font-size: 24px;">${icon}</span>
      <span style="flex: 1;">${message}</span>
    </div>
  `;
  
  // Add animation styles if not exists
  if (!document.getElementById('notificationStyles')) {
    const style = document.createElement('style');
    style.id = 'notificationStyles';
    style.textContent = `
      @keyframes slideInFromRight {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
  
  console.log(`[${type.toUpperCase()}] ${message}`);
}

// ============================================
// 1️⃣4️⃣ GLOBAL EXPORTS
// ============================================
window.initializeProfile = initializeProfile;
window.updateUsername = updateUsername;
window.openAvatarModal = openAvatarModal;
window.closeAvatarModal = closeAvatarModal;
window.selectEmoji = selectEmoji;
window.saveAvatar = saveAvatar;
window.openPasswordModal = openPasswordModal;
window.closePasswordModal = closePasswordModal;
window.changePassword = changePassword;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.deleteAccount = deleteAccount;
window.toggleDarkMode = toggleDarkMode;
window.exportData = exportData;
window.claimDailyBonusFromUI = claimDailyBonusFromUI;

// ============================================
// 1️⃣5️⃣ AUTO INITIALIZE
// ============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 Profile system ready');
    // Wait for auth to be ready
    setTimeout(initializeProfile, 1500);
  });
} else {
  console.log('📱 Profile system ready');
  setTimeout(initializeProfile, 1500);
}

console.log('✅ profile.js loaded successfully');