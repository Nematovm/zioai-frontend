// ============================================
// STATISTICS TRACKING SYSTEM - FULLY FIXED
// ============================================

// ✅ VALID TOOLS - GLOBAL
const VALID_TOOLS = [
  'homework', 'grammar', 'vocabulary', 
  'quiz', 'study', 'speaking', 'resume'
];

// ✅ TOOL NAME MAPPING
const TOOL_NAME_MAP = {
  'homework': 'homework',
  'grammar': 'grammar',
  'vocabulary': 'vocabulary',
  'quiz': 'quiz',
  'study': 'study',
  'chat_bubble': 'speaking',
  'article': 'resume',
  'speaking': 'speaking',
  'resume': 'resume'
};

// ✅ User-specific LocalStorage keys
function getStatsKey() {
  const auth = window.firebaseAuth;
  const user = auth?.currentUser;
  if (!user) return null;
  return `ziyoai_stats_${user.uid}`;
}

function getToolUsageKey() {
  const auth = window.firebaseAuth;
  const user = auth?.currentUser;
  if (!user) return null;
  return `ziyoai_tool_usage_${user.uid}`;
}

// ✅ CLEAN OLD AND CORRUPTED localStorage
function cleanAllOldStats() {
  const keysToRemove = [];
  const auth = window.firebaseAuth;
  const currentUser = auth?.currentUser;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    if (!key) continue;
    
    // ✅ 1. Faqat eski format keylarni o'chirish (user ID siz)
    if (key === 'ziyoai_stats' || key === 'ziyoai_tool_usage') {
      keysToRemove.push(key);
      continue;
    }
    
    // ✅ 2. Agar user login qilgan bo'lsa
    if (currentUser) {
      // ❌ Current user ga tegishli keylarni SAQLAB QOLISH!
      if (key.includes(currentUser.uid)) {
        continue; // ← Bu keyni o'chirmaslik!
      }
      
      // ✅ Boshqa userlarning eski keylarini o'chirish
      if (key.startsWith('ziyoai_stats_') || key.startsWith('ziyoai_tool_usage_')) {
        keysToRemove.push(key);
      }
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log('🗑️ Removed orphaned key:', key);
  });
  
  if (keysToRemove.length > 0) {
    console.log('✅ Old stats cleaned:', keysToRemove.length, 'items removed');
  } else {
    console.log('✅ No old stats to clean');
  }
}

// Initialize stats
function initStats() {
  // Clean old localStorage first
  cleanAllOldStats();
  
  const statsKey = getStatsKey();
  const toolUsageKey = getToolUsageKey();
  
  if (!statsKey || !toolUsageKey) {
    console.log('⚠️ No user logged in, stats not initialized');
    return;
  }
  
  console.log('📊 Stats initialized for user:', statsKey);
  
  const stats = getStats();
  updateStatsDisplay(stats);
  updateToolUsageDisplay();
}

// Get stats from localStorage - USER-SPECIFIC
function getStats() {
  const defaultStats = {
    totalStudyTime: 0,
    totalPomodoros: 0,
    homeworkCompleted: 0,
    quizzesTaken: 0
  };
  
  const statsKey = getStatsKey();
  if (!statsKey) return defaultStats;
  
  try {
    const saved = localStorage.getItem(statsKey);
    
    if (saved) {
      console.log('✅ Stats loaded:', saved);
      return JSON.parse(saved);
    } else {
      console.log('📊 No saved stats, using defaults');
      return defaultStats;
    }
  } catch (error) {
    console.error('❌ Error loading stats:', error);
    return defaultStats;
  }
}

// Save stats to localStorage - USER-SPECIFIC
function saveStats(stats) {
  const statsKey = getStatsKey();
  if (!statsKey) {
    console.log('⚠️ Cannot save stats: No user logged in');
    return;
  }
  
  try {
    localStorage.setItem(statsKey, JSON.stringify(stats));
    updateStatsDisplay(stats);
    console.log('💾 Stats saved:', statsKey, stats);
  } catch (error) {
    console.error('❌ Error saving stats:', error);
  }
}

// Update stats display
function updateStatsDisplay(stats) {
  const hours = Math.floor(stats.totalStudyTime / 60);
  const minutes = stats.totalStudyTime % 60;
  
  const timeElement = document.getElementById("totalStudyTime");
  if (timeElement) {
    timeElement.textContent = `${hours}h ${minutes}m`;
  }
  
  const pomodoroElement = document.getElementById("totalPomodoros");
  if (pomodoroElement) {
    pomodoroElement.textContent = stats.totalPomodoros;
  }
  
  const homeworkElement = document.getElementById("homeworkCompleted");
  if (homeworkElement) {
    homeworkElement.textContent = stats.homeworkCompleted;
  }
  
  const quizElement = document.getElementById("quizzesTaken");
  if (quizElement) {
    quizElement.textContent = stats.quizzesTaken;
  }
}

// ✅ Track tool usage - WITH MAPPING
function trackToolUsage(toolName) {
  console.log('🔧 Original tool name:', toolName);
  
  const mappedName = TOOL_NAME_MAP[toolName] || toolName;
  console.log('🔧 Mapped tool name:', mappedName);
  
  if (!VALID_TOOLS.includes(mappedName)) {
    console.warn('⚠️ Invalid tool name:', mappedName, '(original:', toolName + ')');
    return;
  }
  
  const toolUsageKey = getToolUsageKey();
  if (!toolUsageKey) {
    console.log('⚠️ Cannot track tool usage: No user logged in');
    return;
  }
  
  try {
    const usage = getToolUsage();
    usage[mappedName] = (usage[mappedName] || 0) + 1;
    
    localStorage.setItem(toolUsageKey, JSON.stringify(usage));
    console.log('🔧 Tool usage tracked:', mappedName, '→', usage[mappedName], 'times');
    
    updateToolUsageDisplay();
  } catch (error) {
    console.error('❌ Error tracking tool usage:', error);
  }
}

// Get tool usage - USER-SPECIFIC
function getToolUsage() {
  const toolUsageKey = getToolUsageKey();
  if (!toolUsageKey) return {};
  
  try {
    const saved = localStorage.getItem(toolUsageKey);
    
    if (saved) {
      const usage = JSON.parse(saved);
      
      const validUsage = {};
      VALID_TOOLS.forEach(tool => {
        if (usage[tool]) {
          validUsage[tool] = usage[tool];
        }
      });
      
      console.log('✅ Tool usage loaded:', validUsage);
      return validUsage;
    } else {
      console.log('📊 No saved tool usage, using empty object');
      return {};
    }
  } catch (error) {
    console.error('❌ Error loading tool usage:', error);
    return {};
  }
}

// Update tool usage display
function updateToolUsageDisplay() {
  const usage = getToolUsage();
  
  VALID_TOOLS.forEach(tool => {
    const badge = document.getElementById(`usage-${tool}`);
    if (badge) {
      const count = usage[tool] || 0;
      badge.textContent = `Used ${count} times`;
    }
  });
  
  const toolNames = {
    homework: "Homework Fixer",
    grammar: "Grammar Checker",
    vocabulary: "Vocabulary Builder",
    quiz: "Quiz Generator",
    study: "Study Assistant",
    speaking: "IELTS Feedback",
    resume: "Resume Builder"
  };
  
  const tools = Object.keys(usage);
  
  if (tools.length > 0) {
    const sortedTools = tools.sort((a, b) => usage[b] - usage[a]);
    const mostUsed = sortedTools[0];
    const leastUsed = sortedTools[sortedTools.length - 1];
    
    const mostUsedElement = document.getElementById("mostUsedTool");
    if (mostUsedElement) {
      mostUsedElement.textContent = toolNames[mostUsed] || mostUsed;
    }
    
    const mostUsedCountElement = document.getElementById("mostUsedCount");
    if (mostUsedCountElement) {
      mostUsedCountElement.textContent = `${usage[mostUsed]} times`;
    }
    
    const leastUsedElement = document.getElementById("leastUsedTool");
    if (leastUsedElement) {
      leastUsedElement.textContent = toolNames[leastUsed] || leastUsed;
    }
    
    const leastUsedCountElement = document.getElementById("leastUsedCount");
    if (leastUsedCountElement) {
      leastUsedCountElement.textContent = `${usage[leastUsed]} times`;
    }
  } else {
    const mostUsedElement = document.getElementById("mostUsedTool");
    const leastUsedElement = document.getElementById("leastUsedTool");
    
    if (mostUsedElement) mostUsedElement.textContent = "No tools used yet";
    if (leastUsedElement) leastUsedElement.textContent = "No tools used yet";
    
    const mostUsedCountElement = document.getElementById("mostUsedCount");
    const leastUsedCountElement = document.getElementById("leastUsedCount");
    
    if (mostUsedCountElement) mostUsedCountElement.textContent = "0 times";
    if (leastUsedCountElement) leastUsedCountElement.textContent = "0 times";
  }
}

// Increment specific stat
function incrementStat(statName, amount = 1) {
  const stats = getStats();
  
  if (stats.hasOwnProperty(statName)) {
    stats[statName] += amount;
    saveStats(stats);
    console.log(`📈 Stat incremented: ${statName} +${amount}`, stats);
  } else {
    console.warn('⚠️ Invalid stat name:', statName);
  }
}

// ============================================
// CLEAR USER STATS - COMPLETE
// ============================================
function clearUserStats() {
  const auth = window.firebaseAuth;
  const user = auth?.currentUser;
  
  if (user) {
    const statsKey = `ziyoai_stats_${user.uid}`;
    const toolUsageKey = `ziyoai_tool_usage_${user.uid}`;
    
    localStorage.removeItem(statsKey);
    localStorage.removeItem(toolUsageKey);
    
    console.log('🗑️ User stats cleared:', statsKey, toolUsageKey);
  }
}

// ============================================
// RESET STATS (for testing)
// ============================================
function resetStats() {
  const statsKey = getStatsKey();
  const toolUsageKey = getToolUsageKey();
  
  if (statsKey) {
    localStorage.removeItem(statsKey);
    console.log('🔄 Stats reset');
  }
  
  if (toolUsageKey) {
    localStorage.removeItem(toolUsageKey);
    console.log('🔄 Tool usage reset');
  }
  
  initStats();
}

// ============================================
// COMPLETE CLEANUP ON ACCOUNT DELETE
// ============================================
function clearAllUserData() {
  const auth = window.firebaseAuth;
  const user = auth?.currentUser;
  
  console.log('🗑️ Starting complete data cleanup...');
  
  // ✅ 1. Current user stats ni tozalash
  clearUserStats();
  
  // ✅ 2. BARCHA ziyoai* keylarni o'chirish (account delete paytida)
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('ziyoai_stats_') || key.startsWith('ziyoai_tool_usage_') || key.startsWith('ziyoai'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log('🗑️ Removed:', key);
  });
  
  console.log('✅ All user data cleared:', keysToRemove.length, 'keys removed');
  
  // ✅ 3. Stats displayni yangilash
  const defaultStats = {
    totalStudyTime: 0,
    totalPomodoros: 0,
    homeworkCompleted: 0,
    quizzesTaken: 0
  };
  
  updateStatsDisplay(defaultStats);
  
  // ✅ 4. Tool usage displayni yangilash
  const mostUsedElement = document.getElementById("mostUsedTool");
  const leastUsedElement = document.getElementById("leastUsedTool");
  const mostUsedCountElement = document.getElementById("mostUsedCount");
  const leastUsedCountElement = document.getElementById("leastUsedCount");
  
  if (mostUsedElement) mostUsedElement.textContent = "No tools used yet";
  if (leastUsedElement) leastUsedElement.textContent = "No tools used yet";
  if (mostUsedCountElement) mostUsedCountElement.textContent = "0 times";
  if (leastUsedCountElement) leastUsedCountElement.textContent = "0 times";
  
  console.log('✅ UI updated to default values');
}

// ============================================
// MAKE FUNCTIONS GLOBALLY AVAILABLE
// ============================================
window.getStats = getStats;
window.saveStats = saveStats;
window.trackToolUsage = trackToolUsage;
window.incrementStat = incrementStat;
window.clearUserStats = clearUserStats;
window.clearAllUserData = clearAllUserData;
window.resetStats = resetStats;
window.initStats = initStats;
window.VALID_TOOLS = VALID_TOOLS;

console.log('✅ dashboard-overview.js loaded');
console.log('VALID_TOOLS:', window.VALID_TOOLS);
console.log('typeof clearAllUserData:', typeof window.clearAllUserData);