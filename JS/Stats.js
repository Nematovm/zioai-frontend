// ============================================
// STATS.JS - SAFE VERSION (OPTIONAL)
// Works even if not included in HTML
// ============================================

(function() {
  'use strict';

  // ✅ Check if already loaded
  if (window.statsSystemLoaded) {
    console.log('⏭️ Stats system already loaded');
    return;
  }

  console.log('📊 Loading stats system...');

  // Global flag
  window.statsSystemLoaded = true;

  // ============================================
  // TRACK TOOL USAGE
  // ============================================
  window.trackToolUsage = function(toolName) {
    try {
      console.log('📊 Tracking tool usage:', toolName);
      // Add your tracking logic here
    } catch (error) {
      console.warn('⚠️ Track tool error:', error);
    }
  };

  // ============================================
  // INCREMENT STAT
  // ============================================
  window.incrementStat = function(statName, value = 1) {
    try {
      console.log('📈 Incrementing stat:', statName, '+', value);
      // Add your increment logic here
    } catch (error) {
      console.warn('⚠️ Increment stat error:', error);
    }
  };

  // ============================================
  // ADD RECENT ACTIVITY
  // ============================================
  window.addRecentActivity = function(name, score, icon, color) {
    try {
      console.log('📝 Adding activity:', name, score);
      // Add your activity logic here
    } catch (error) {
      console.warn('⚠️ Add activity error:', error);
    }
  };

  // ============================================
  // LOAD USER STATS
  // ============================================
  window.loadUserStats = function() {
    try {
      console.log('📊 Loading user stats...');
      // Add your load logic here
      console.log('✅ Stats loaded');
    } catch (error) {
      console.warn('⚠️ Load stats error:', error);
    }
  };

  console.log('✅ Stats system loaded (safe mode)');

})();