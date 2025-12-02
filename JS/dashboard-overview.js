// ============================================
// PROFESSIONAL DASHBOARD - YANGI VERSION
// ============================================

// Global variables
let dashboardStats = {
  totalStudyTime: 0,
  totalPomodoros: 0,
  homeworkCompleted: 0,
  quizzesTaken: 0
};

let toolUsageData = {};
let recentActivitiesList = [];
let userGoals = {
  quiz: 3,
  hours: 5,
  vocabulary: 20
};

// Custom goals list
let customGoals = [];

// Daily data
let todayData = {
  hours: 0,
  tasks: 0,
  date: new Date().toDateString()
};

// Weekly data
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
let weeklyData = weekDays.map(day => ({ day, hours: 0, tasks: 0 }));

// Storage keys
const STORAGE_KEYS = {
  stats: 'ziyoai_stats_v2',
  toolUsage: 'ziyoai_tool_usage_v2',
  weeklyData: 'ziyoai_weekly_data_v2',
  todayData: 'ziyoai_today_data_v2',
  activities: 'ziyoai_activities_v2',
  goals: 'ziyoai_goals_v2',
  customGoals: 'ziyoai_custom_goals_v2',
  lastActive: 'ziyoai_last_active',
  streak: 'ziyoai_streak'
};

// ============================================
// INITIALIZE
// ============================================
function initStats() {
  console.log('📊 Initializing professional dashboard...');
  
  loadStats();
  loadToolUsage();
  loadWeeklyData();
  loadTodayData();
  loadActivities();
  loadGoals();
  loadCustomGoals();
  
  updateAllDashboard();
  
  console.log('✅ Dashboard initialized');
}

// ============================================
// LOAD FUNCTIONS
// ============================================
function loadStats() {
  const saved = localStorage.getItem(STORAGE_KEYS.stats);
  if (saved) dashboardStats = JSON.parse(saved);
}

function loadToolUsage() {
  const saved = localStorage.getItem(STORAGE_KEYS.toolUsage);
  if (saved) toolUsageData = JSON.parse(saved);
}

function loadWeeklyData() {
  const saved = localStorage.getItem(STORAGE_KEYS.weeklyData);
  if (saved) weeklyData = JSON.parse(saved);
}

function loadTodayData() {
  const saved = localStorage.getItem(STORAGE_KEYS.todayData);
  const today = new Date().toDateString();
  
  if (saved) {
    const data = JSON.parse(saved);
    if (data.date === today) {
      todayData = data;
    } else {
      todayData = { hours: 0, tasks: 0, date: today };
      saveTodayData();
    }
  }
}

function loadActivities() {
  const saved = localStorage.getItem(STORAGE_KEYS.activities);
  if (saved) recentActivitiesList = JSON.parse(saved);
}

function loadGoals() {
  const saved = localStorage.getItem(STORAGE_KEYS.goals);
  if (saved) userGoals = JSON.parse(saved);
}

function loadCustomGoals() {
  const saved = localStorage.getItem(STORAGE_KEYS.customGoals);
  if (saved) customGoals = JSON.parse(saved);
}

// ============================================
// SAVE FUNCTIONS
// ============================================
function saveStats() {
  localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(dashboardStats));
}

function saveToolUsage() {
  localStorage.setItem(STORAGE_KEYS.toolUsage, JSON.stringify(toolUsageData));
}

function saveWeeklyData() {
  localStorage.setItem(STORAGE_KEYS.weeklyData, JSON.stringify(weeklyData));
}

function saveTodayData() {
  localStorage.setItem(STORAGE_KEYS.todayData, JSON.stringify(todayData));
}

function saveActivities() {
  localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(recentActivitiesList));
}

function saveGoals() {
  localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(userGoals));
}

function saveCustomGoals() {
  localStorage.setItem(STORAGE_KEYS.customGoals, JSON.stringify(customGoals));
}

// ============================================
// INCREMENT STAT
// ============================================
function incrementStat(statName, value = 1) {
  if (dashboardStats.hasOwnProperty(statName)) {
    dashboardStats[statName] += value;
    saveStats();
    
    if (statName === 'totalStudyTime') {
      todayData.hours += (value / 60);
      todayData.tasks += 1;
      saveTodayData();
      updateTodayWeeklyData(value);
    }
    
    updateAllDashboard();
    console.log(`✅ ${statName} updated: ${dashboardStats[statName]}`);
  }
}

// ============================================
// UPDATE WEEKLY DATA
// ============================================
function updateTodayWeeklyData(minutes) {
  const today = new Date().getDay();
  const dayIndex = today === 0 ? 6 : today - 1;
  
  weeklyData[dayIndex].hours += (minutes / 60);
  weeklyData[dayIndex].tasks += 1;
  
  saveWeeklyData();
  updateWeeklyChart();
}

// ============================================
// TRACK TOOL USAGE
// ============================================
function trackToolUsage(toolName) {
  if (!toolUsageData[toolName]) {
    toolUsageData[toolName] = 0;
  }
  toolUsageData[toolName]++;
  saveToolUsage();
  
  checkGoalAchievement(toolName);
  
  updateAllDashboard();
  console.log(`✅ Tool usage: ${toolName} = ${toolUsageData[toolName]}`);
}

// ============================================
// CHECK GOAL ACHIEVEMENT - PROFESSIONAL
// ============================================
function checkGoalAchievement(toolName) {
  let goalsMet = [];
  
  // Check default goals
  if (toolName === 'quiz' && dashboardStats.quizzesTaken === userGoals.quiz) {
    goalsMet.push({
      title: 'Quiz Goal',
      message: `You completed ${userGoals.quiz} quizzes!`,
      icon: '🎯'
    });
  }
  
  const studyHours = Math.floor(todayData.hours);
  if (studyHours === userGoals.hours && todayData.tasks > 0) {
    const prevHours = Math.floor((todayData.hours - 0.1));
    if (prevHours < userGoals.hours) {
      goalsMet.push({
        title: 'Study Hours Goal',
        message: `You studied ${userGoals.hours} hours today!`,
        icon: '⏰'
      });
    }
  }
  
  if (toolName === 'vocabulary' && toolUsageData.vocabulary === userGoals.vocabulary) {
    goalsMet.push({
      title: 'Vocabulary Goal',
      message: `You learned ${userGoals.vocabulary} words!`,
      icon: '📚'
    });
  }
  
  // Check custom goals
  customGoals.forEach(goal => {
    if (goal.toolName === toolName) {
      const currentCount = toolUsageData[toolName] || 0;
      if (currentCount === goal.target) {
        goalsMet.push({
          title: goal.title,
          message: `You completed: ${goal.title}!`,
          icon: goal.icon
        });
      }
    }
  });
  
  // Show toasts for all achieved goals
  goalsMet.forEach((goal, index) => {
    setTimeout(() => {
      showGoalAchievementToast(goal);
    }, index * 500);
  });
}

// ============================================
// GOAL ACHIEVEMENT TOAST - PROFESSIONAL
// ============================================
function showGoalAchievementToast(goal) {
  const toast = document.createElement('div');
  toast.className = 'goal-achievement-toast';
  toast.innerHTML = `
    <div class="goal-toast-icon">${goal.icon}</div>
    <div class="goal-toast-content">
      <div class="goal-toast-title">Goal Achieved!</div>
      <div class="goal-toast-message">${goal.message}</div>
    </div>
    <button class="goal-toast-close" onclick="this.parentElement.remove()">
      <i class="bi bi-x"></i>
    </button>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
  
  if (typeof createConfetti === 'function') {
    createConfetti();
  }
}

// ============================================
// ADD RECENT ACTIVITY
// ============================================
function addRecentActivity(toolName, score, icon, color) {
  const activity = {
    tool: toolName,
    score: score,
    icon: icon,
    color: color,
    time: Date.now(),
    timeText: 'Just now'
  };
  
  recentActivitiesList.unshift(activity);
  
  if (recentActivitiesList.length > 20) {
    recentActivitiesList = recentActivitiesList.slice(0, 20);
  }
  
  saveActivities();
  updateRecentActivities();
  console.log('✅ Activity added:', activity);
}

// ============================================
// CALCULATE STREAK
// ============================================
function calculateStreak() {
  const today = new Date().toDateString();
  const lastActive = localStorage.getItem(STORAGE_KEYS.lastActive);
  let streak = parseInt(localStorage.getItem(STORAGE_KEYS.streak) || '0');
  
  if (lastActive === today) {
    return streak;
  } else {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastActive === yesterday) {
      streak++;
    } else {
      streak = 1;
    }
    localStorage.setItem(STORAGE_KEYS.streak, streak.toString());
    localStorage.setItem(STORAGE_KEYS.lastActive, today);
    return streak;
  }
}

// ============================================
// UPDATE HERO STATS
// ============================================
function updateHeroStats() {
  const hours = Math.floor(dashboardStats.totalStudyTime / 60);
  const mins = dashboardStats.totalStudyTime % 60;
  const heroStudyTime = document.getElementById('heroStudyTime');
  if (heroStudyTime) {
    heroStudyTime.textContent = `${hours}h ${mins}m`;
  }
  
  const dailyGoalHours = userGoals.hours;
  const currentHours = todayData.hours;
  const dailyGoalPercent = Math.min((currentHours / dailyGoalHours) * 100, 100);
  
  const heroWeeklyGoal = document.getElementById('heroWeeklyGoal');
  if (heroWeeklyGoal) {
    heroWeeklyGoal.textContent = `${Math.round(dailyGoalPercent)}%`;
  }
  
  const heroProgressFill = document.getElementById('heroProgressFill');
  if (heroProgressFill) {
    heroProgressFill.style.width = `${dailyGoalPercent}%`;
  }
  
  const goalLabel = document.querySelector('.hero-pink .hero-label');
  if (goalLabel) {
    goalLabel.textContent = 'Daily Goal (Today)';
  }
  
  const points = (dashboardStats.homeworkCompleted * 100) + 
                 (dashboardStats.quizzesTaken * 50) + 
                 (dashboardStats.totalPomodoros * 25);
  const level = Math.floor(points / 500) + 1;
  
  const heroPoints = document.getElementById('heroPoints');
  if (heroPoints) heroPoints.textContent = points;
  
  const heroLevel = document.getElementById('heroLevel');
  if (heroLevel) heroLevel.textContent = `Level ${level}`;
  
  const streak = calculateStreak();
  const heroStreak = document.getElementById('heroStreak');
  if (heroStreak) heroStreak.textContent = streak;
}

// ============================================
// UPDATE WEEKLY CHART
// ============================================
let performanceChart = null;

function updateWeeklyChart() {
  const canvas = document.getElementById('performanceChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  if (performanceChart) {
    performanceChart.destroy();
  }
  
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
  gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
  
  performanceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: weeklyData.map(d => d.day),
      datasets: [{
        label: 'Study Hours',
        data: weeklyData.map(d => d.hours.toFixed(2)),
        borderColor: '#3b82f6',
        backgroundColor: gradient,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: '#1f2937',
          bodyColor: '#6b7280',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: (context) => `${context.parsed.y} hours`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#f3f4f6' },
          ticks: { color: '#9ca3af' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#9ca3af' }
        }
      }
    }
  });
  
  const totalWeekHours = weeklyData.reduce((sum, d) => sum + d.hours, 0);
  const weeklyGoalHours = userGoals.hours * 7;
  const goalProgress = Math.round((totalWeekHours / weeklyGoalHours) * 100);
  const bestDay = Math.max(...weeklyData.map(d => d.hours));
  
  const totalWeekHoursEl = document.getElementById('totalWeekHours');
  if (totalWeekHoursEl) totalWeekHoursEl.textContent = `${totalWeekHours.toFixed(1)}h`;
  
  const goalProgressEl = document.getElementById('goalProgress');
  if (goalProgressEl) goalProgressEl.textContent = `+${goalProgress}%`;
  
  const bestDayEl = document.getElementById('bestDay');
  if (bestDayEl) bestDayEl.textContent = `${bestDay.toFixed(1)}h`;
}

// ============================================
// UPDATE RECENT ACTIVITIES
// ============================================
function getRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function updateRecentActivities() {
  const container = document.getElementById('recentActivityList');
  if (!container) return;
  
  recentActivitiesList.forEach(activity => {
    activity.timeText = getRelativeTime(activity.time);
  });
  
  if (recentActivitiesList.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #9ca3af;">
        <i class="bi bi-inbox" style="font-size: 48px; opacity: 0.5;"></i>
        <p style="margin-top: 15px;">No recent activities yet</p>
        <p style="font-size: 14px;">Start using tools to see your activity here!</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = recentActivitiesList.slice(0, 3).map(activity => `
    <div class="activity-item">
      <div class="activity-content">
        <div class="activity-icon" style="background: ${activity.color}15;">
          ${activity.icon}
        </div>
        <div class="activity-details">
          <div class="activity-header">
            <p class="activity-title">${activity.tool}</p>
            <span class="activity-score">${activity.score}%</span>
          </div>
          <p class="activity-time">${activity.timeText}</p>
          <div class="activity-progress">
            <div class="activity-progress-fill" style="width: ${activity.score}%; background: ${activity.color};"></div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}
// ============================================
// UPDATE ALL DASHBOARD - GLOBAL FUNCTION ✅
// ============================================
function updateAllDashboard() {
  try {
    if (typeof updateDashboardStats === 'function') {
      updateDashboardStats();
    }
    if (typeof updateWeeklyChart === 'function') {
      updateWeeklyChart();
    }
    if (typeof updateRecentActivities === 'function') {
      updateRecentActivities();
    }
    if (typeof updateToolUsage === 'function') {
      updateToolUsage();
    }
    if (typeof updateStudyGoals === 'function') {
      updateStudyGoals();
    }
    if (typeof updateAchievements === 'function') {
      updateAchievements();
    }
    console.log('✅ Dashboard fully updated');
  } catch (error) {
    console.error('❌ Error updating dashboard:', error);
  }
}

// Global export
window.updateAllDashboard = updateAllDashboard;

// Update Tool Usage, Study Goals, Achievements - (Previous code same...)
// ... (Qolgan funksiyalarni keyingi message da beraman)