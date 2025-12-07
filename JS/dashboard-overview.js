// ============================================
// PROFESSIONAL DASHBOARD - UPGRADED VERSION ✅
// ============================================

// Global variables
let dashboardStats = {
  totalStudyTime: 0,
  totalPomodoros: 0,
  homeworkCompleted: 0,
  quizzesTaken: 0
};

// Time Tracking Variables
let activeToolTimer = null;
let currentToolStartTime = null;
let currentToolName = null;
let accumulatedSeconds = 0; // Real-time seconds tracker


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

// Weekly data - UPGRADED with historical data
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
let weeklyData = weekDays.map(day => ({ day, hours: 0, tasks: 0 }));
let lastWeekData = weekDays.map(day => ({ day, hours: 0, tasks: 0 }));
let thisMonthData = [];

// Storage keys
const STORAGE_KEYS = {
  stats: 'ziyoai_stats_v2',
  toolUsage: 'ziyoai_tool_usage_v2',
  weeklyData: 'ziyoai_weekly_data_v2',
  lastWeekData: 'ziyoai_last_week_data_v2',
  monthlyData: 'ziyoai_monthly_data_v2',
  todayData: 'ziyoai_today_data_v2',
  activities: 'ziyoai_activities_v2',
  goals: 'ziyoai_goals_v2',
  customGoals: 'ziyoai_custom_goals_v2',
  lastActive: 'ziyoai_last_active',
  streak: 'ziyoai_streak'
};

// ============================================
// INITIALIZE ✅
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
  loadShownGoals(); // ← YANGI QO'SHILDI
  
  updateAllDashboard();
  
  console.log('✅ Dashboard initialized');
}

// ============================================
// LOAD FUNCTIONS ✅
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
  
  const lastWeekSaved = localStorage.getItem(STORAGE_KEYS.lastWeekData);
  if (lastWeekSaved) lastWeekData = JSON.parse(lastWeekSaved);
  
  const monthlySaved = localStorage.getItem(STORAGE_KEYS.monthlyData);
  if (monthlySaved) thisMonthData = JSON.parse(monthlySaved);
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
// SAVE FUNCTIONS ✅
// ============================================
function saveStats() {
  localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(dashboardStats));
}

function saveToolUsage() {
  localStorage.setItem(STORAGE_KEYS.toolUsage, JSON.stringify(toolUsageData));
}

function saveWeeklyData() {
  localStorage.setItem(STORAGE_KEYS.weeklyData, JSON.stringify(weeklyData));
  localStorage.setItem(STORAGE_KEYS.lastWeekData, JSON.stringify(lastWeekData));
  localStorage.setItem(STORAGE_KEYS.monthlyData, JSON.stringify(thisMonthData));
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
// INCREMENT STAT ✅
// ============================================
function incrementStat(statName, value = 1) {
  if (dashboardStats.hasOwnProperty(statName)) {
    // FAQAT totalStudyTime uchun value ishlatiladi (minutlarda)
    // Boshqa statlar uchun faqat +1
    if (statName === 'totalStudyTime') {
      dashboardStats[statName] += value; // value = minutlar
      todayData.hours += (value / 60);
      todayData.tasks += 1;
      saveTodayData();
      updateTodayWeeklyData(value);
    } else {
      // Quiz, homework va boshqalar uchun faqat 1 ta qo'shish
      dashboardStats[statName] += 1;
    }
    
    saveStats();
    updateAllDashboard();
    console.log(`✅ ${statName} updated: ${dashboardStats[statName]}`);
  }
}

// ============================================
// UPDATE WEEKLY DATA ✅
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
// TRACK TOOL USAGE ✅
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

// Yangi global variable - qaysi goallar allaqachon ko'rsatilganini track qilish uchun
let shownGoals = new Set();

function checkGoalAchievement(toolName) {
  let goalsMet = [];
  
  // Check default goals
  if (toolName === 'quiz' && dashboardStats.quizzesTaken === userGoals.quiz) {
    const goalKey = `quiz_${userGoals.quiz}`;
    if (!shownGoals.has(goalKey)) {
      goalsMet.push({
        title: 'Quiz Goal',
        message: `You completed ${userGoals.quiz} quizzes!`,
        icon: '🎯',
        key: goalKey
      });
    }
  }
  
  const studyHours = Math.floor(todayData.hours);
  if (studyHours === userGoals.hours && todayData.tasks > 0) {
    const prevHours = Math.floor((todayData.hours - 0.1));
    const goalKey = `hours_${userGoals.hours}_${new Date().toDateString()}`;
    if (prevHours < userGoals.hours && !shownGoals.has(goalKey)) {
      goalsMet.push({
        title: 'Study Hours Goal',
        message: `You studied ${userGoals.hours} hours today!`,
        icon: '⏰',
        key: goalKey
      });
    }
  }
  
  if (toolName === 'vocabulary' && toolUsageData.vocabulary === userGoals.vocabulary) {
    const goalKey = `vocabulary_${userGoals.vocabulary}`;
    if (!shownGoals.has(goalKey)) {
      goalsMet.push({
        title: 'Vocabulary Goal',
        message: `You learned ${userGoals.vocabulary} words!`,
        icon: '📚',
        key: goalKey
      });
    }
  }
  
  // Check custom goals
  customGoals.forEach(goal => {
    if (goal.toolName === toolName) {
      const currentCount = toolUsageData[toolName] || 0;
      const goalKey = `custom_${goal.id}_${goal.target}`;
      if (currentCount === goal.target && !shownGoals.has(goalKey)) {
        goalsMet.push({
          title: goal.title,
          message: `You completed: ${goal.title}!`,
          icon: goal.icon,
          key: goalKey
        });
      }
    }
  });
  
  // Show toasts for all achieved goals
  goalsMet.forEach((goal, index) => {
    setTimeout(() => {
      showGoalAchievementToast(goal);
      shownGoals.add(goal.key); // Goal ko'rsatilganini belgilash
      localStorage.setItem('ziyoai_shown_goals', JSON.stringify([...shownGoals]));
    }, index * 500);
  });
}

// Load shown goals on init
function loadShownGoals() {
  const saved = localStorage.getItem('ziyoai_shown_goals');
  if (saved) {
    shownGoals = new Set(JSON.parse(saved));
  }
}

// ============================================
// GOAL ACHIEVEMENT TOAST ✅
// ============================================
function showGoalAchievementToast(goal) {
  const toast = document.createElement('div');
  toast.className = 'goal-achievement-toast';
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    z-index: 100000;
    min-width: 320px;
    max-width: 400px;
    display: flex;
    align-items: center;
    gap: 15px;
    opacity: 0;
    transform: translateX(400px);
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    pointer-events: auto;
  `;
  
  toast.innerHTML = `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; flex-shrink: 0;">
      ${goal.icon}
    </div>
    <div style="flex: 1; min-width: 0;">
      <div style="font-weight: 700; color: #1f2937; font-size: 16px; margin-bottom: 4px;">Goal Achieved! 🎉</div>
      <div style="color: #6b7280; font-size: 14px; line-height: 1.4;">${goal.message}</div>
    </div>
    <button onclick="this.closest('.goal-achievement-toast').remove()" style="
      background: #f3f4f6;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
      color: #6b7280;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s;
    " onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">
      <i class="bi bi-x"></i>
    </button>
  `;
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  }, 100);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(400px)';
    setTimeout(() => toast.remove(), 500);
  }, 5000);
  
  // Confetti effect
  if (typeof createConfetti === 'function') {
    createConfetti();
  }
}

// ============================================
// ADD RECENT ACTIVITY ✅
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
// CALCULATE STREAK ✅
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
// UPDATE HERO STATS ✅
// ============================================
function updateHeroStats() {
  // Total Study Time
  const hours = Math.floor(dashboardStats.totalStudyTime / 60);
  const mins = dashboardStats.totalStudyTime % 60;
  const heroStudyTime = document.getElementById('heroStudyTime');
  if (heroStudyTime) {
    heroStudyTime.textContent = `${hours}h ${mins}m`;
  }
  
  // Weekly Growth Calculation
  const thisWeekTotal = weeklyData.reduce((sum, d) => sum + d.hours, 0);
  const lastWeekTotal = lastWeekData.reduce((sum, d) => sum + d.hours, 0);
  
  let weeklyGrowth = 0;
  if (lastWeekTotal > 0) {
    weeklyGrowth = Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100);
  } else if (thisWeekTotal > 0) {
    weeklyGrowth = 100; // First week
  }
  
  const weeklyGrowthEl = document.querySelector('.hero-purple .hero-badge');
  if (weeklyGrowthEl) {
    const isPositive = weeklyGrowth >= 0;
    const icon = isPositive ? '📈' : '📉';
    const sign = isPositive ? '+' : '';
    weeklyGrowthEl.textContent = `${icon} ${sign}${weeklyGrowth}% this week`;
    weeklyGrowthEl.style.background = isPositive ? 'rgba(255,255,255,0.2)' : 'rgba(239,68,68,0.2)';
  }
  
  // Daily Goal Progress
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
  
  // Points and Level
  const points = (dashboardStats.homeworkCompleted * 100) + 
                 (dashboardStats.quizzesTaken * 50) + 
                 (dashboardStats.totalPomodoros * 25);
  const level = Math.floor(points / 500) + 1;
  
  const heroPoints = document.getElementById('heroPoints');
  if (heroPoints) heroPoints.textContent = points;
  
  const heroLevel = document.getElementById('heroLevel');
  if (heroLevel) heroLevel.textContent = `Level ${level}`;
  
  // Streak
  const streak = calculateStreak();
  const heroStreak = document.getElementById('heroStreak');
  if (heroStreak) heroStreak.textContent = streak;
}

// ============================================
// UPDATE WEEKLY CHART - UPGRADED ✅
// ============================================
let performanceChart = null;
let currentChartPeriod = 'thisWeek'; // 'thisWeek', 'lastWeek', 'thisMonth'

function updateWeeklyChart() {
  const canvas = document.getElementById('performanceChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  if (performanceChart) {
    performanceChart.destroy();
  }
  
  // Get data based on selected period
  let chartData = weeklyData;
  let chartLabels = weeklyData.map(d => d.day);
  
  if (currentChartPeriod === 'lastWeek') {
    chartData = lastWeekData;
    chartLabels = lastWeekData.map(d => d.day);
  } else if (currentChartPeriod === 'thisMonth') {
    chartData = thisMonthData.length > 0 ? thisMonthData : weeklyData;
    chartLabels = chartData.map((d, i) => `Day ${i + 1}`);
  }
  
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
  gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
  
  performanceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: [{
        label: 'Study Hours',
        data: chartData.map(d => d.hours.toFixed(2)),
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
  
  // Update stats
  const totalWeekHours = chartData.reduce((sum, d) => sum + d.hours, 0);
  const weeklyGoalHours = userGoals.hours * 7;
  const goalProgress = Math.round((totalWeekHours / weeklyGoalHours) * 100);
  const bestDay = Math.max(...chartData.map(d => d.hours));
  
  const totalWeekHoursEl = document.getElementById('totalWeekHours');
  if (totalWeekHoursEl) totalWeekHoursEl.textContent = `${totalWeekHours.toFixed(1)}h`;
  
  const goalProgressEl = document.getElementById('goalProgress');
  if (goalProgressEl) goalProgressEl.textContent = `+${goalProgress}%`;
  
  const bestDayEl = document.getElementById('bestDay');
  if (bestDayEl) bestDayEl.textContent = `${bestDay.toFixed(1)}h`;
}

// ✅ WEEK SELECTOR HANDLER
function setupWeekSelector() {
  const selector = document.getElementById('weekSelector');
  if (selector) {
    selector.addEventListener('change', (e) => {
      const value = e.target.value;
      if (value === 'This Week') {
        currentChartPeriod = 'thisWeek';
      } else if (value === 'Last Week') {
        currentChartPeriod = 'lastWeek';
      } else if (value === 'This Month') {
        currentChartPeriod = 'thisMonth';
      }
      updateWeeklyChart();
    });
  }
}

// ============================================
// UPDATE RECENT ACTIVITIES - FIXED ✅
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

// ✅ VIEW ALL ACTIVITIES - FIXED
function viewAllActivities() {
  const modal = document.createElement('div');
  modal.className = 'activity-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;
  
  modal.innerHTML = `
    <div class="activity-modal-content" style="
      background: white;
      border-radius: 16px;
      padding: 30px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      animation: slideUp 0.3s ease;
    ">
      <div class="activity-modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="margin: 0; color: #1f2937; font-size: 24px;">
          <i class="bi bi-clock-history"></i> All Recent Activities
        </h3>
        <button class="activity-modal-close" onclick="this.closest('.activity-modal').remove()" style="
          background: #f3f4f6;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <i class="bi bi-x"></i>
        </button>
      </div>
      <div class="activity-modal-body">
        ${recentActivitiesList.length === 0 ? 
          '<p style="text-align: center; color: #9ca3af; padding: 40px;">No activities yet</p>' :
          recentActivitiesList.map(activity => `
            <div class="activity-item" style="margin-bottom: 15px; padding: 15px; background: #f9fafb; border-radius: 12px;">
              <div class="activity-content" style="display: flex; gap: 15px;">
                <div class="activity-icon" style="
                  background: ${activity.color}15;
                  width: 50px;
                  height: 50px;
                  border-radius: 12px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 24px;
                  flex-shrink: 0;
                ">
                  ${activity.icon}
                </div>
                <div class="activity-details" style="flex: 1;">
                  <div class="activity-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <p class="activity-title" style="margin: 0; font-weight: 600; color: #1f2937;">${activity.tool}</p>
                    <span class="activity-score" style="background: ${activity.color}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${activity.score}%</span>
                  </div>
                  <p class="activity-time" style="margin: 0 0 8px 0; font-size: 13px; color: #9ca3af;">${activity.timeText}</p>
                  <div class="activity-progress" style="background: #e5e7eb; height: 6px; border-radius: 10px; overflow: hidden;">
                    <div class="activity-progress-fill" style="width: ${activity.score}%; background: ${activity.color}; height: 100%; transition: width 0.5s;"></div>
                  </div>
                </div>
              </div>
            </div>
          `).join('')
        }
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.style.opacity = '1', 10);
}

window.viewAllActivities = viewAllActivities;

// ✅ START NEW ACTIVITY - FIXED
function startNewActivity() {
  const modal = document.createElement('div');
  modal.className = 'activity-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;
  
  modal.innerHTML = `
    <div class="activity-modal-content" style="
      background: white;
      border-radius: 16px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
      animation: slideUp 0.3s ease;
    ">
      <div class="activity-modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
        <h3 style="margin: 0; color: #1f2937; font-size: 24px;">
          <i class="bi bi-plus-circle"></i> Start New Activity
        </h3>
        <button class="activity-modal-close" onclick="this.closest('.activity-modal').remove()" style="
          background: #f3f4f6;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
          color: #6b7280;
        ">
          <i class="bi bi-x"></i>
        </button>
      </div>
      <div class="activity-modal-body">
        <div class="quick-actions-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
          <button class="quick-action-btn" onclick="switchTool('grammar'); this.closest('.activity-modal').remove();" style="
            padding: 20px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            background: white;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
          ">
            <i class="bi bi-pencil" style="font-size: 32px; color: #ef4444;"></i>
            <span style="font-weight: 600; color: #1f2937;">Grammar Checker</span>
          </button>
          <button class="quick-action-btn" onclick="switchTool('vocabulary'); this.closest('.activity-modal').remove();" style="
            padding: 20px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            background: white;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
          ">
            <i class="bi bi-book" style="font-size: 32px; color: #8b5cf6;"></i>
            <span style="font-weight: 600; color: #1f2937;">Vocabulary Builder</span>
          </button>
          <button class="quick-action-btn" onclick="switchTool('quiz'); this.closest('.activity-modal').remove();" style="
            padding: 20px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            background: white;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
          ">
            <i class="bi bi-question-circle" style="font-size: 32px; color: #3b82f6;"></i>
            <span style="font-weight: 600; color: #1f2937;">Quiz Generator</span>
          </button>
          <button class="quick-action-btn" onclick="switchTool('homework'); this.closest('.activity-modal').remove();" style="
            padding: 20px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            background: white;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
          ">
            <i class="bi bi-clipboard-check" style="font-size: 32px; color: #10b981;"></i>
            <span style="font-weight: 600; color: #1f2937;">Homework Fixer</span>
          </button>
          <button class="quick-action-btn" onclick="switchTool('study'); this.closest('.activity-modal').remove();" style="
            padding: 20px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            background: white;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
          ">
            <i class="bi bi-robot" style="font-size: 32px; color: #f59e0b;"></i>
            <span style="font-weight: 600; color: #1f2937;">Study Assistant</span>
          </button>
          <button class="quick-action-btn" onclick="switchTool('speaking'); this.closest('.activity-modal').remove();" style="
            padding: 20px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            background: white;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
          ">
            <i class="bi bi-mic" style="font-size: 32px; color: #06b6d4;"></i>
            <span style="font-weight: 600; color: #1f2937;">Speaking Practice</span>
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add event listeners to close modal after clicking
  modal.querySelectorAll('.quick-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeout(() => modal.remove(), 100);
    });
  });
}

window.startNewActivity = startNewActivity;

function updateToolUsage() {
  const container = document.getElementById('toolUsageList');
  if (!container) return;
  
  // Barcha toollarni olish va sort qilish
  const allTools = ['grammar', 'quiz', 'vocabulary', 'homework', 'study', 'speaking', 'article'];
  
  // Har bir tool uchun ma'lumot yaratish
  const toolsWithData = allTools.map(tool => ({
    name: tool,
    count: toolUsageData[tool] || 0
  })).sort((a, b) => b.count - a.count);
  
  if (toolsWithData.every(t => t.count === 0)) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #9ca3af;">
        <i class="bi bi-bar-chart" style="font-size: 48px; opacity: 0.5;"></i>
        <p style="margin-top: 15px;">No tool usage data yet</p>
        <p style="font-size: 14px;">Start using learning tools to track your progress!</p>
      </div>
    `;
    return;
  }
  
  const maxUsage = Math.max(...toolsWithData.map(t => t.count));
  
  container.innerHTML = toolsWithData.slice(0, 5).map(tool => {
    const percentage = tool.count > 0 ? Math.min(Math.round((tool.count / maxUsage) * 100), 100) : 0;
    const icon = getToolIcon(tool.name);
    const color = getToolColor(tool.name);
    
    return `
      <div style="margin-bottom: 20px; opacity: ${tool.count === 0 ? '0.5' : '1'};">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="background: ${color}15; width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">${icon}</span>
            <span style="font-weight: 600; color: #1f2937; font-size: 15px;">${tool.name}</span>
          </div>
          <span style="background: ${color}; color: white; padding: 5px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; white-space: nowrap;">${tool.count}x</span>
        </div>
        <div style="background: #e5e7eb; height: 10px; border-radius: 10px; overflow: hidden; position: relative;">
          <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${percentage}%; background: ${color}; transition: width 0.5s ease; border-radius: 10px;"></div>
        </div>
      </div>
    `;
  }).join('');
}

function getToolIcon(toolName) {
  const icons = {
    'grammar': '📝',
    'quiz': '🎯',
    'vocabulary': '📚',
    'homework': '✏️',
    'study': '🤖',
    'speaking': '🎤',
    'article': '📄'
  };
  return icons[toolName] || '🔧';
}

function getToolColor(toolName) {
  const colors = {
    'grammar': '#ef4444',
    'quiz': '#3b82f6',
    'vocabulary': '#8b5cf6',
    'homework': '#10b981',
    'study': '#f59e0b',
    'speaking': '#06b6d4',
    'article': '#ec4899'
  };
  return colors[toolName] || '#6b7280';
}

function updateStudyGoals() {
  const container = document.getElementById('studyGoalsList');
  if (!container) return;
  
  const goals = [
    {
      title: 'Daily Study Goal',
      current: todayData.hours.toFixed(1),
      target: userGoals.hours,
      unit: 'hours',
      icon: '⏰',
      color: '#3b82f6'
    },
    {
      title: 'Weekly Quizzes',
      current: dashboardStats.quizzesTaken,
      target: userGoals.quiz,
      unit: 'quizzes',
      icon: '🎯',
      color: '#8b5cf6'
    },
    {
      title: 'Vocabulary Words',
      current: toolUsageData.vocabulary || 0,
      target: userGoals.vocabulary,
      unit: 'words',
      icon: '📚',
      color: '#ec4899'
    }
  ];
  
  container.innerHTML = goals.map(goal => {
    const progress = Math.min(Math.round((goal.current / goal.target) * 100), 100);
    const isComplete = goal.current >= goal.target;
    
    return `
      <div style="
        padding: 20px;
        background: ${isComplete ? 'linear-gradient(135deg, #d1fae515, #a7f3d015)' : 'white'};
        border: 2px solid ${isComplete ? '#10b981' : '#e5e7eb'};
        border-radius: 16px;
        margin-bottom: 15px;
        transition: all 0.3s;
      ">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
          <div style="display: flex; gap: 12px; align-items: start;">
            <div style="background: ${goal.color}15; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">${goal.icon}</div>
            <div>
              <h4 style="margin: 0 0 5px 0; font-size: 16px; font-weight: 700; color: #1f2937;">${goal.title}</h4>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">${goal.current} / ${goal.target} ${goal.unit}</p>
            </div>
          </div>
          ${isComplete ? '<span style="background: #10b981; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">✓ Complete</span>' : ''}
        </div>
        <div style="background: #e5e7eb; height: 10px; border-radius: 10px; overflow: hidden; margin-bottom: 8px;">
          <div style="width: ${progress}%; background: ${goal.color}; height: 100%; transition: width 0.8s ease; border-radius: 10px;"></div>
        </div>
        <p style="margin: 0; text-align: right; font-size: 13px; font-weight: 600; color: ${goal.color};">${progress}% Complete</p>
      </div>
    `;
  }).join('');
  
  // Add custom goals
  if (customGoals.length > 0) {
    const customGoalsHTML = customGoals.map(goal => {
      const current = toolUsageData[goal.toolName] || 0;
      const progress = Math.min(Math.round((current / goal.target) * 100), 100);
      const isComplete = current >= goal.target;
      
      return `
        <div style="
          padding: 20px;
          background: ${isComplete ? 'linear-gradient(135deg, #d1fae515, #a7f3d015)' : 'white'};
          border: 2px solid ${isComplete ? '#10b981' : '#e5e7eb'};
          border-radius: 16px;
          margin-bottom: 15px;
          position: relative;
        ">
          <button onclick="deleteCustomGoal('${goal.id}')" style="
            position: absolute;
            top: 15px;
            right: 15px;
            background: #fee2e2;
            color: #ef4444;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
          ">
            <i class="bi bi-trash"></i>
          </button>
          <div style="display: flex; gap: 12px; align-items: start; margin-bottom: 15px; padding-right: 40px;">
            <div style="background: ${goal.color}15; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">${goal.icon}</div>
            <div>
              <h4 style="margin: 0 0 5px 0; font-size: 16px; font-weight: 700; color: #1f2937;">${goal.title}</h4>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">${current} / ${goal.target}</p>
            </div>
          </div>
          <div style="background: #e5e7eb; height: 10px; border-radius: 10px; overflow: hidden; margin-bottom: 8px;">
            <div style="width: ${progress}%; background: ${goal.color}; height: 100%; transition: width 0.8s ease; border-radius: 10px;"></div>
          </div>
          <p style="margin: 0; text-align: right; font-size: 13px; font-weight: 600; color: ${goal.color};">${progress}% Complete</p>
        </div>
      `;
    }).join('');
    
    container.innerHTML += customGoalsHTML;
  }
}

// ✅ ADD NEW GOAL - FIXED
function addNewGoal() {
  const modal = document.createElement('div');
  modal.className = 'activity-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
  
  modal.innerHTML = `
    <div class="activity-modal-content" style="
      background: white;
      border-radius: 16px;
      padding: 30px;
      max-width: 450px;
      width: 90%;
    ">
      <div class="activity-modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
        <h3 style="margin: 0; color: #1f2937;">Add New Goal</h3>
        <button class="activity-modal-close" onclick="this.closest('.activity-modal').remove()" style="
          background: #f3f4f6;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
        ">×</button>
      </div>
      <form id="addGoalForm" style="display: flex; flex-direction: column; gap: 15px;">
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Goal Title</label>
          <input type="text" id="goalTitle" placeholder="e.g., Master 50 idioms" required style="
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 15px;
          ">
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Tool/Activity</label>
          <select id="goalTool" required style="
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 15px;
          ">
            <option value="">Select a tool</option>
            <option value="vocabulary">Vocabulary Builder</option>
            <option value="quiz">Quiz Generator</option>
            <option value="grammar">Grammar Checker</option>
            <option value="homework">Homework Fixer</option>
            <option value="study">Study Assistant</option>
            <option value="speaking">Speaking Practice</option>
          </select>
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Target</label>
          <input type="number" id="goalTarget" placeholder="e.g., 50" min="1" required style="
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 15px;
          ">
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Icon (emoji)</label>
          <input type="text" id="goalIcon" placeholder="e.g., 🎯" maxlength="2" required style="
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 15px;
          ">
        </div>
        <button type="submit" style="
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 10px;
        ">
          <i class="bi bi-plus-lg"></i> Add Goal
        </button>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('addGoalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newGoal = {
      id: Date.now().toString(),
      title: document.getElementById('goalTitle').value,
      toolName: document.getElementById('goalTool').value,
      target: parseInt(document.getElementById('goalTarget').value),
      icon: document.getElementById('goalIcon').value,
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    };
    
    customGoals.push(newGoal);
    saveCustomGoals();
    updateStudyGoals();
    
    modal.remove();
    showNotification('Goal added successfully!', 'success');
  });
}

window.addNewGoal = addNewGoal;

// ✅ EDIT GOALS - FIXED
function editGoals() {
  const modal = document.createElement('div');
  modal.className = 'activity-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
  
  modal.innerHTML = `
    <div class="activity-modal-content" style="
      background: white;
      border-radius: 16px;
      padding: 30px;
      max-width: 450px;
      width: 90%;
    ">
      <div class="activity-modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
        <h3 style="margin: 0; color: #1f2937;">Edit Study Goals</h3>
        <button onclick="this.closest('.activity-modal').remove()" style="
          background: #f3f4f6;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
        ">×</button>
      </div>
      <form id="editGoalsForm" style="display: flex; flex-direction: column; gap: 15px;">
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Daily Study Hours</label>
          <input type="number" id="editHoursGoal" value="${userGoals.hours}" min="1" max="24" required style="
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
          ">
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Weekly Quizzes</label>
          <input type="number" id="editQuizGoal" value="${userGoals.quiz}" min="1" required style="
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
          ">
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Vocabulary Words</label>
          <input type="number" id="editVocabGoal" value="${userGoals.vocabulary}" min="1" required style="
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
          ">
        </div>
        <button type="submit" style="
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
        ">Save Changes</button>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('editGoalsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    userGoals.hours = parseInt(document.getElementById('editHoursGoal').value);
    userGoals.quiz = parseInt(document.getElementById('editQuizGoal').value);
    userGoals.vocabulary = parseInt(document.getElementById('editVocabGoal').value);
    
    saveGoals();
    updateAllDashboard();
    
    modal.remove();
    showNotification('Goals updated successfully!', 'success');
  });
}

window.editGoals = editGoals;

// ============================================
// DELETE CUSTOM GOAL ✅
// ============================================
function deleteCustomGoal(goalId) {
  if (confirm('Are you sure you want to delete this goal?')) {
    customGoals = customGoals.filter(g => g.id !== goalId);
    saveCustomGoals();
    updateStudyGoals();
    showNotification('Goal deleted', 'info');
  }
}

window.deleteCustomGoal = deleteCustomGoal;

function updateAchievements() {
  const container = document.getElementById('achievementsList');
  if (!container) {
    console.error('❌ Achievements container not found');
    return;
  }
  
  const points = (dashboardStats.homeworkCompleted * 100) + 
                 (dashboardStats.quizzesTaken * 50) + 
                 (dashboardStats.totalPomodoros * 25);
  const currentLevel = Math.floor(points / 500) + 1;
  const nextLevel = currentLevel + 1;
  const pointsForNext = nextLevel * 500;
  const progressToNext = ((points % 500) / 500) * 100;
  
  const achievements = [
    {
      title: 'First Steps',
      description: 'Complete your first study session',
      icon: '🎯',
      unlocked: dashboardStats.totalStudyTime > 0,
      color: '#3b82f6'
    },
    {
      title: 'Quiz Master',
      description: 'Complete 10 quizzes',
      icon: '🏆',
      unlocked: dashboardStats.quizzesTaken >= 10,
      color: '#f59e0b'
    },
    {
      title: 'Study Warrior',
      description: 'Study for 50 hours',
      icon: '⚔️',
      unlocked: Math.floor(dashboardStats.totalStudyTime / 60) >= 50,
      color: '#ef4444'
    },
    {
      title: 'Vocabulary Expert',
      description: 'Learn 100 new words',
      icon: '📚',
      unlocked: (toolUsageData.vocabulary || 0) >= 100,
      color: '#8b5cf6'
    },
    {
      title: 'Week Warrior',
      description: 'Study 7 days in a row',
      icon: '🔥',
      unlocked: calculateStreak() >= 7,
      color: '#ec4899'
    },
    {
      title: 'Homework Hero',
      description: 'Complete 20 homework assignments',
      icon: '📝',
      unlocked: dashboardStats.homeworkCompleted >= 20,
      color: '#10b981'
    }
  ];
  
  // Update next level display
  const nextLevelNumber = document.getElementById('nextLevelNumber');
  const nextLevelDesc = document.getElementById('nextLevelDesc');
  const nextLevelFill = document.getElementById('nextLevelFill');
  
  if (nextLevelNumber) nextLevelNumber.textContent = nextLevel;
  if (nextLevelDesc) nextLevelDesc.textContent = `${points} / ${pointsForNext} points to level ${nextLevel}`;
  if (nextLevelFill) nextLevelFill.style.width = `${progressToNext}%`;
  
  // Generate achievements HTML with proper structure
  const achievementsHTML = achievements.map(achievement => `
    <div class="achievement-card ${achievement.unlocked ? 'achievement-unlocked' : 'achievement-locked'}">
      <div class="achievement-icon" style="background: ${achievement.color}20;">
        ${achievement.icon}
      </div>
      <h4 class="achievement-title">${achievement.title}</h4>
      <p class="achievement-description">${achievement.description}</p>
      <span class="${achievement.unlocked ? 'achievement-badge' : 'achievement-locked-badge'}" 
            ${achievement.unlocked ? `style="background: ${achievement.color};"` : ''}>
        ${achievement.unlocked ? '✓ Unlocked' : '🔒 Locked'}
      </span>
    </div>
  `).join('');
  
  container.innerHTML = achievementsHTML;
  
  console.log('✅ Achievements updated successfully');
}

// ============================================
// UPDATE DASHBOARD STATS ✅
// ============================================
function updateDashboardStats() {
  updateHeroStats();
  
  const totalStudyTimeEl = document.getElementById('totalStudyTime');
  const weeklyGoalEl = document.getElementById('weeklyGoal');
  const totalPointsEl = document.getElementById('totalPoints');
  const dayStreakEl = document.getElementById('dayStreak');
  
  const hours = Math.floor(dashboardStats.totalStudyTime / 60);
  const mins = dashboardStats.totalStudyTime % 60;
  
  if (totalStudyTimeEl) {
    totalStudyTimeEl.textContent = `${hours}h ${mins}m`;
  }
  
  const dailyGoalHours = userGoals.hours;
  const currentHours = todayData.hours;
  const dailyGoalPercent = Math.min((currentHours / dailyGoalHours) * 100, 100);
  
  if (weeklyGoalEl) {
    weeklyGoalEl.textContent = `${Math.round(dailyGoalPercent)}%`;
  }
  
  const points = (dashboardStats.homeworkCompleted * 100) + 
                 (dashboardStats.quizzesTaken * 50) + 
                 (dashboardStats.totalPomodoros * 25);
  
  if (totalPointsEl) {
    totalPointsEl.textContent = points;
  }
  
  const streak = calculateStreak();
  if (dayStreakEl) {
    dayStreakEl.textContent = streak;
  }
}

// ============================================
// SHOW NOTIFICATION ✅
// ============================================
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    z-index: 10001;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideIn 0.3s ease;
    font-weight: 600;
  `;
  
  const iconClass = type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info-circle';
  notification.innerHTML = `
    <i class="bi bi-${iconClass}" style="font-size: 20px;"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ============================================
// UPDATE ALL DASHBOARD - MAIN FUNCTION ✅
// ============================================
function updateAllDashboard() {
  try {
    updateDashboardStats();
    updateHeroStats();
    updateWeeklyChart();
    updateRecentActivities();
    updateToolUsage();
    updateStudyGoals();
    updateAchievements();
    console.log('✅ Dashboard fully updated');
  } catch (error) {
    console.error('❌ Error updating dashboard:', error);
  }
}

// ============================================
// START TRACKING (Tool ichiga kirganda)
// ============================================
function startTimeTracking(toolName) {
  // Agar boshqa tool active bo'lsa, avval uni to'xtatamiz
  if (activeToolTimer) {
    stopTimeTracking();
  }
  
  currentToolName = toolName;
  currentToolStartTime = Date.now();
  accumulatedSeconds = 0;
  
  console.log(`⏱️ Time tracking started: ${toolName}`);
  
  // Har 1 SONIYADA increment qilish (real-time)
  activeToolTimer = setInterval(() => {
    accumulatedSeconds++;
    
    // Har 60 soniyada (1 minut) dashboard ga qo'shish
    if (accumulatedSeconds % 60 === 0) {
      const minutesToAdd = 1;
      incrementStat('totalStudyTime', minutesToAdd);
      console.log(`⏱️ ${currentToolName}: +${minutesToAdd} minute added (total: ${Math.floor(accumulatedSeconds / 60)} min)`);
    }
    
    // Console da real-time ko'rsatish (har 10 soniyada)
    if (accumulatedSeconds % 10 === 0) {
      const mins = Math.floor(accumulatedSeconds / 60);
      const secs = accumulatedSeconds % 60;
      console.log(`⏱️ ${currentToolName} active: ${mins}m ${secs}s`);
    }
  }, 1000); // 1000ms = 1 soniya
}

// ============================================
// STOP TRACKING (Tool dan chiqganda)
// ============================================
function stopTimeTracking() {
  if (!currentToolStartTime || !currentToolName) {
    return;
  }
  
  // Timer ni to'xtatish
  if (activeToolTimer) {
    clearInterval(activeToolTimer);
  }
  
  // Oxirgi qolgan soniyalarni hisoblash
  const remainingSeconds = accumulatedSeconds % 60;
  
  // Agar 30+ soniya qolgan bo'lsa, 1 minut qo'shamiz
  if (remainingSeconds >= 30) {
    incrementStat('totalStudyTime', 1);
    console.log(`✅ Time tracking stopped: ${currentToolName} - Added final minute (${remainingSeconds} seconds rounded up)`);
  } else if (remainingSeconds > 0) {
    console.log(`✅ Time tracking stopped: ${currentToolName} - ${remainingSeconds} seconds not counted (less than 30s)`);
  }
  
  const totalMinutes = Math.floor(accumulatedSeconds / 60);
  if (totalMinutes > 0) {
    showTimeTrackingNotification(currentToolName, totalMinutes);
  }
  
  // Reset
  activeToolTimer = null;
  currentToolStartTime = null;
  currentToolName = null;
  accumulatedSeconds = 0;
}


// ============================================
// GET CURRENT SESSION TIME
// ============================================
function getCurrentSessionTime() {
  return Math.floor(accumulatedSeconds / 60); // minutes
}

function getCurrentSessionTimeInSeconds() {
  return accumulatedSeconds; // seconds
}

// ============================================
// NOTIFICATION (Vaqt qo'shilganda)
// ============================================
function showTimeTrackingNotification(toolName, minutes) {
  if (minutes === 0) return; // 0 minut bo'lsa notification ko'rsatmaslik
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 10001;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideInUp 0.3s ease;
    font-weight: 600;
  `;
  
  notification.innerHTML = `
    <i class="bi bi-clock-history" style="font-size: 24px;"></i>
    <div>
      <div style="font-size: 14px; opacity: 0.9;">Session Complete</div>
      <div style="font-size: 16px;">${toolName}: ${minutes} min tracked</div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutDown 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ============================================
// PAGE UNLOAD & VISIBILITY HANDLERS
// ============================================
window.addEventListener('beforeunload', () => {
  if (activeToolTimer) {
    stopTimeTracking();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && activeToolTimer) {
    console.log('⏸️ Tab hidden - tracking continues in background');
  } else if (!document.hidden && activeToolTimer) {
    console.log('▶️ Tab visible - tracking active');
  }
});

console.log('✅ Real-Time Automatic Time Tracking System Loaded');

// ============================================
// GLOBAL EXPORTS ✅
// ============================================
window.updateAllDashboard = updateAllDashboard;
window.incrementStat = incrementStat;
window.trackToolUsage = trackToolUsage;
window.addRecentActivity = addRecentActivity;
window.viewAllActivities = viewAllActivities;
window.startNewActivity = startNewActivity;
window.addNewGoal = addNewGoal;
window.editGoals = editGoals;
window.deleteCustomGoal = deleteCustomGoal;
window.startTimeTracking = startTimeTracking;
window.stopTimeTracking = stopTimeTracking;
window.getCurrentSessionTime = getCurrentSessionTime;

// ============================================
// INITIALIZE ON LOAD ✅
// ============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initStats();
    setupWeekSelector();
    
    // Setup button event listeners
    const viewAllBtn = document.querySelector('.view-all-btn');
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', viewAllActivities);
    }
    
    const startActivityBtn = document.querySelector('.dashboard-btn.btn-gradient');
    if (startActivityBtn) {
      startActivityBtn.addEventListener('click', startNewActivity);
    }
    
    const addGoalBtn = document.querySelector('.dashboard-btn.btn-gradient-orange');
    if (addGoalBtn) {
      addGoalBtn.addEventListener('click', addNewGoal);
    }
    
    const editGoalsBtn = document.querySelectorAll('.view-all-btn')[1];
    if (editGoalsBtn) {
      editGoalsBtn.addEventListener('click', editGoals);
    }
  });
} else {
  initStats();
  setupWeekSelector();
}

console.log('✅ Dashboard Overview Script Loaded Successfully');