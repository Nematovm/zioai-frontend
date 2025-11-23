// PROFILE TOOL JAVASCRIPT - FIREBASE INTEGRATED ✅

// Current user data (Firebase dan olinadi)
let currentUser = null;
let selectedEmoji = '👤';

// Emoji list
const emojis = [
  '👤', '😀', '😃', '😄', '😁', '😊', '😎', '🤓', '🧐', '🤩',
  '🥳', '😇', '🤠', '🥰', '😍', '🤗', '🤔', '🤨', '😏', '😌',
  '👨', '👩', '👦', '👧', '🧑', '👶', '🧓', '👨‍💼', '👩‍💼', '👨‍🎓',
  '👩‍🎓', '👨‍🏫', '👩‍🏫', '👨‍💻', '👩‍💻', '🎭', '🎨', '🎪', '🎬', '🎤',
  '🎧', '🎮', '🏀', '⚽', '🏈', '⚾', '🎾', '🏐', '🏆', '🥇'
];

// Page yuklanganida
document.addEventListener('DOMContentLoaded', function() {
  generateEmojiGrid();
  loadDarkMode();
});

// Profile tool ochilganda ma'lumotlarni yuklash
function showProfileTool() {
  // Firebase dan current user ni olish
  const auth = window.firebaseAuth;
  if (!auth) {
    console.error('❌ Firebase auth not initialized');
    return;
  }
  
  currentUser = auth.currentUser;
  
  if (currentUser) {
    loadProfileData();
  } else {
    console.error('❌ No user logged in');
  }
}

// Profile ma'lumotlarini yuklash - FIREBASE DAN
function loadProfileData() {
  if (!currentUser) return;
  
  // Avatar (displayName dan birinchi emoji ni olish yoki default)
  const userAvatar = currentUser.displayName && currentUser.displayName.match(/[\u{1F300}-\u{1F9FF}]/u) 
    ? currentUser.displayName.match(/[\u{1F300}-\u{1F9FF}]/u)[0] 
    : '👤';
  
  selectedEmoji = userAvatar;
  document.getElementById('profileAvatar').textContent = userAvatar;
  
  // Username (displayName dan emoji ni olib tashlab)
  const username = currentUser.displayName 
    ? currentUser.displayName.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim() 
    : currentUser.email.split('@')[0];
  
  document.getElementById('profileName').textContent = username;
  document.getElementById('profileEmail').textContent = currentUser.email;
  
  // Member since (Firebase metadata dan)
  const creationTime = currentUser.metadata.creationTime;
  const memberDate = new Date(creationTime).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  document.getElementById('profileDate').innerHTML = `<i class="bi bi-calendar3"></i> Member since: ${memberDate}`;
  
  // Input fieldlarni to'ldirish
  document.getElementById('usernameInput').value = username;
  document.getElementById('emailInput').value = currentUser.email;
  
  console.log('✅ Profile data loaded:', { username, email: currentUser.email });
}

// Username yangilash - FIREBASE BILAN ✅
async function updateUsername() {
  const newUsername = document.getElementById('usernameInput').value.trim();
  
  if (!newUsername) {
    showNotification('Username cannot be empty!', 'error');
    return;
  }
  
  const currentUsername = currentUser.displayName 
    ? currentUser.displayName.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim() 
    : currentUser.email.split('@')[0];
  
  if (newUsername === currentUsername) {
    showNotification('No changes detected!', 'info');
    return;
  }
  
  try {
    const auth = window.firebaseAuth;
    const updateProfile = window.updateProfile;
    
    // Emoji + username ni birlashtirish
    const newDisplayName = `${selectedEmoji} ${newUsername}`;
    
    await updateProfile(auth.currentUser, {
      displayName: newDisplayName
    });
    
    // UI ni yangilash
    document.getElementById('profileName').textContent = newUsername;
    currentUser = auth.currentUser; // Yangilangan userni olish
    
    showNotification('Username updated successfully! ✅', 'success');
    console.log('✅ Firebase username updated:', newDisplayName);
    
  } catch (error) {
    console.error('❌ Username update error:', error);
    showNotification('Failed to update username: ' + error.message, 'error');
  }
}

// Avatar Modal
function openAvatarModal() {
  document.getElementById('avatarModal').classList.add('active');
  updateEmojiSelection();
}

function closeAvatarModal() {
  document.getElementById('avatarModal').classList.remove('active');
}

function generateEmojiGrid() {
  const emojiGrid = document.getElementById('emojiGrid');
  if (!emojiGrid) return;
  
  emojiGrid.innerHTML = '';
  
  emojis.forEach(emoji => {
    const emojiDiv = document.createElement('div');
    emojiDiv.className = 'emoji-option-inline';
    emojiDiv.textContent = emoji;
    emojiDiv.onclick = () => selectEmoji(emoji);
    emojiGrid.appendChild(emojiDiv);
  });
}

function selectEmoji(emoji) {
  selectedEmoji = emoji;
  updateEmojiSelection();
}

function updateEmojiSelection() {
  document.querySelectorAll('.emoji-option-inline').forEach(el => {
    el.classList.remove('selected');
    if (el.textContent === selectedEmoji) {
      el.classList.add('selected');
    }
  });
}

// Avatar saqlash - FIREBASE BILAN ✅
async function saveAvatar() {
  try {
    const auth = window.firebaseAuth;
    const updateProfile = window.updateProfile;
    
    // Current username ni olish
    const username = currentUser.displayName 
      ? currentUser.displayName.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim() 
      : currentUser.email.split('@')[0];
    
    // Yangi displayName (emoji + username)
    const newDisplayName = `${selectedEmoji} ${username}`;
    
    await updateProfile(auth.currentUser, {
      displayName: newDisplayName
    });
    
    // UI ni yangilash
    document.getElementById('profileAvatar').textContent = selectedEmoji;
    currentUser = auth.currentUser;
    
    closeAvatarModal();
    showNotification('Avatar updated successfully! ✅', 'success');
    console.log('✅ Firebase avatar updated:', selectedEmoji);
    
  } catch (error) {
    console.error('❌ Avatar update error:', error);
    showNotification('Failed to update avatar: ' + error.message, 'error');
  }
}

// Password Modal
function openPasswordModal() {
  document.getElementById('passwordModal').classList.add('active');
}

function closePasswordModal() {
  document.getElementById('passwordModal').classList.remove('active');
  document.getElementById('currentPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
}

// Password o'zgartirish - FIREBASE BILAN ✅
async function changePassword() {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (!currentPassword || !newPassword || !confirmPassword) {
    showNotification('All fields are required!', 'error');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showNotification('New passwords do not match!', 'error');
    return;
  }
  
  if (newPassword.length < 6) {
    showNotification('Password must be at least 6 characters!', 'error');
    return;
  }
  
  try {
    const auth = window.firebaseAuth;
    const user = auth.currentUser;
    const EmailAuthProvider = window.EmailAuthProvider;
    const reauthenticateWithCredential = window.reauthenticateWithCredential;
    const updatePassword = window.updatePassword;
    
    // Reauthenticate (xavfsizlik uchun)
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    
    await reauthenticateWithCredential(user, credential);
    
    // Password ni yangilash
    await updatePassword(user, newPassword);
    
    closePasswordModal();
    showNotification('Password changed successfully! ✅', 'success');
    console.log('✅ Firebase password updated');
    
  } catch (error) {
    console.error('❌ Password change error:', error);
    
    if (error.code === 'auth/wrong-password') {
      showNotification('Current password is incorrect!', 'error');
    } else if (error.code === 'auth/weak-password') {
      showNotification('Password is too weak!', 'error');
    } else {
      showNotification('Failed to change password: ' + error.message, 'error');
    }
  }
}

// Dark Mode
function toggleDarkMode() {
  const isDark = document.getElementById('darkModeToggle').checked;
  
  if (isDark) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'true');
    showNotification('Dark mode enabled 🌙', 'info');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'false');
    showNotification('Dark mode disabled ☀️', 'info');
  }
}

function loadDarkMode() {
  const darkMode = localStorage.getItem('darkMode') === 'true';
  const toggle = document.getElementById('darkModeToggle');
  if (toggle) {
    toggle.checked = darkMode;
    if (darkMode) {
      document.body.classList.add('dark-mode');
    }
  }
}

// Export Data - FIREBASE BILAN ✅
function exportData() {
  if (!currentUser) {
    showNotification('Please login first!', 'error');
    return;
  }
  
  const username = currentUser.displayName 
    ? currentUser.displayName.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim() 
    : currentUser.email.split('@')[0];
  
  const data = {
    uid: currentUser.uid,
    username: username,
    email: currentUser.email,
    avatar: selectedEmoji,
    emailVerified: currentUser.emailVerified,
    creationTime: currentUser.metadata.creationTime,
    lastSignInTime: currentUser.metadata.lastSignInTime,
    exportDate: new Date().toISOString()
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ziyoai_profile_${username}_${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  
  showNotification('Data exported successfully! 📥', 'success');
  console.log('✅ Data exported:', data);
}

// Delete Account Modal
function openDeleteModal() {
  document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('active');
  document.getElementById('deleteConfirm').value = '';
}

// Account o'chirish - FIREBASE BILAN ✅
async function deleteAccount() {
  const confirmText = document.getElementById('deleteConfirm').value;
  
  if (confirmText !== 'DELETE') {
    showNotification('Please type "DELETE" to confirm!', 'error');
    return;
  }
  
  // Ikkinchi tasdiqlash
  const finalConfirm = confirm(
    '⚠️ ARE YOU ABSOLUTELY SURE?\n\n' +
    'This action CANNOT be undone!\n' +
    'Your account and ALL data will be PERMANENTLY deleted.\n\n' +
    'Click OK to DELETE your account forever, or Cancel to go back.'
  );
  
  if (!finalConfirm) {
    showNotification('Account deletion cancelled.', 'info');
    return;
  }
  
  try {
    const auth = window.firebaseAuth;
    const user = auth.currentUser;
    const deleteUser = window.deleteUser;
    
    console.log('🗑️ Deleting account:', user.email);
    
    // Firebase dan account ni o'chirish
    await deleteUser(user);
    
    showNotification('Account deleted successfully. Redirecting...', 'success');
    console.log('✅ Firebase account deleted');
    
    // 2 soniyadan keyin login ga yo'naltirish
    setTimeout(() => {
      window.location.href = './login.html';
    }, 2000);
    
  } catch (error) {
    console.error('❌ Account deletion error:', error);
    
    if (error.code === 'auth/requires-recent-login') {
      showNotification(
        'For security reasons, please log out and log in again before deleting your account.', 
        'error'
      );
    } else {
      showNotification('Failed to delete account: ' + error.message, 'error');
    }
  }
}

// Email o'zgartirish modali
function openEmailModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay-inline';
  modal.id = 'emailModal';
  modal.innerHTML = `
    <div class="modal-inline">
      <div class="modal-header-inline">
        <h3>Change Email Address</h3>
        <button class="modal-close-inline" onclick="closeEmailModal()">×</button>
      </div>
      <div class="modal-body-inline">
        <div class="input-group-inline">
          <label>Current Password (for verification)</label>
          <input type="password" id="emailCurrentPassword" placeholder="Enter current password">
        </div>
        <div class="input-group-inline">
          <label>New Email Address</label>
          <input type="email" id="newEmailInput" placeholder="Enter new email">
        </div>
        <div class="input-group-inline">
          <label>Confirm New Email</label>
          <input type="email" id="confirmEmailInput" placeholder="Confirm new email">
        </div>
      </div>
      <div class="modal-footer-inline">
        <button class="btn-inline btn-secondary-inline" onclick="closeEmailModal()">Cancel</button>
        <button class="btn-inline btn-primary-inline" onclick="changeEmail()">
          <i class="bi bi-check-circle"></i> Update Email
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
}

function closeEmailModal() {
  const modal = document.getElementById('emailModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

// Email o'zgartirish - FIREBASE BILAN ✅
async function changeEmail() {
  const currentPassword = document.getElementById('emailCurrentPassword').value;
  const newEmail = document.getElementById('newEmailInput').value.trim();
  const confirmEmail = document.getElementById('confirmEmailInput').value.trim();
  
  if (!currentPassword || !newEmail || !confirmEmail) {
    showNotification('All fields are required!', 'error');
    return;
  }
  
  if (newEmail !== confirmEmail) {
    showNotification('Emails do not match!', 'error');
    return;
  }
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    showNotification('Invalid email format!', 'error');
    return;
  }
  
  if (newEmail === currentUser.email) {
    showNotification('New email is same as current email!', 'info');
    return;
  }
  
  try {
    const auth = window.firebaseAuth;
    const user = auth.currentUser;
    const EmailAuthProvider = window.EmailAuthProvider;
    const reauthenticateWithCredential = window.reauthenticateWithCredential;
    const updateEmail = window.updateEmail;
    
    // Reauthenticate (xavfsizlik uchun)
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    
    await reauthenticateWithCredential(user, credential);
    
    // Email ni yangilash
    await updateEmail(user, newEmail);
    
    // UI ni yangilash
    document.getElementById('profileEmail').textContent = newEmail;
    document.getElementById('emailInput').value = newEmail;
    currentUser = auth.currentUser;
    
    closeEmailModal();
    showNotification('Email updated successfully! ✅ Please verify your new email.', 'success');
    console.log('✅ Firebase email updated:', newEmail);
    
  } catch (error) {
    console.error('❌ Email change error:', error);
    
    if (error.code === 'auth/wrong-password') {
      showNotification('Current password is incorrect!', 'error');
    } else if (error.code === 'auth/email-already-in-use') {
      showNotification('This email is already in use!', 'error');
    } else if (error.code === 'auth/requires-recent-login') {
      showNotification('Please log out and log in again before changing email.', 'error');
    } else {
      showNotification('Failed to change email: ' + error.message, 'error');
    }
  }
}

// Notification System
function showNotification(message, type = 'info') {
  // Custom notification div yaratish
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
    border-radius: 8px;
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
  
  console.log(`${type.toUpperCase()}: ${message}`);
}

// Modal tashqarisiga bosilganda yopish
window.addEventListener('click', function(event) {
  const modals = ['avatarModal', 'passwordModal', 'deleteModal', 'emailModal'];
  modals.forEach(modalId => {
    const modal = document.getElementById(modalId);
    if (modal && event.target === modal) {
      modal.classList.remove('active');
    }
  });
});