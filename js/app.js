/**
 * FitTrack Core Application Controller
 * Handles navigation routing, dashboard synchronization, hydration, nutrition, goals, and profile
 */

class FitTrackApp {
  constructor() {
    this.currentView = 'landing'; // Starts at landing page per requirements
  }

  init() {
    this.bindEvents();
    this.syncAllViews();
    this.setupDateAndGreeting();
    
    // Check URL hash for initial view
    const hash = window.location.hash.replace('#', '');
    if (hash && ['dashboard', 'workouts', 'progress', 'nutrition', 'goals', 'profile'].includes(hash)) {
      this.switchView(hash);
    } else {
      this.switchView('landing');
    }

    // Subscribe to store updates
    window.fitTrackStore.on('*', () => {
      this.syncAllViews();
    });
  }

  // --- View Routing ---
  switchView(viewName) {
    this.currentView = viewName;
    window.location.hash = viewName;

    // Handle Landing page vs App shell
    const landingView = document.getElementById('landing-view');
    const appShell = document.getElementById('app-container');

    if (viewName === 'landing') {
      if (landingView) landingView.style.display = 'block';
      if (appShell) appShell.style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // App shell view
    if (landingView) landingView.style.display = 'none';
    if (appShell) appShell.style.display = 'flex';

    // Toggle active app views
    document.querySelectorAll('.app-view').forEach(view => {
      view.classList.remove('active');
    });

    const activeViewEl = document.getElementById(`view-${viewName}`);
    if (activeViewEl) {
      activeViewEl.classList.add('active');
    }

    // Update navigation states (Sidebar)
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });

    // Update mobile navigation dock
    document.querySelectorAll('.mobile-bottom-nav .mobile-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });

    // Scroll main content to top
    const mainWrapper = document.querySelector('.main-wrapper');
    if (mainWrapper) mainWrapper.scrollTop = 0;

    // Trigger Chart re-render if switching to progress view
    if (viewName === 'progress' && window.fitTrackCharts) {
      setTimeout(() => {
        window.fitTrackCharts.renderAllCharts();
      }, 100);
    }

    // Refresh workout planner if switching to workouts
    if (viewName === 'workouts' && window.fitTrackWorkout) {
      window.fitTrackWorkout.renderWorkoutsGrid();
    }
  }

  setupDateAndGreeting() {
    const user = window.fitTrackStore.getState().user;
    const hour = new Date().getHours();
    let timeGreeting = "Good morning";
    if (hour >= 12 && hour < 17) timeGreeting = "Good afternoon";
    if (hour >= 17 || hour < 4) timeGreeting = "Good evening";

    const greetingStr = `${timeGreeting}, ${user.name} 👋`;
    
    // Header greeting
    const headerGreetingEl = document.getElementById('headerGreetingTitle');
    if (headerGreetingEl) headerGreetingEl.textContent = greetingStr;

    // Dashboard greeting
    const dashGreetingEl = document.getElementById('dashGreetingTitle');
    if (dashGreetingEl) dashGreetingEl.textContent = greetingStr;

    // Current formatted date
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const dateFormatted = new Date().toLocaleDateString('en-US', options);
    const headerDateBadge = document.getElementById('headerDateBadge');
    if (headerDateBadge) {
      headerDateBadge.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        Today, ${dateFormatted}
      `;
    }
  }

  syncAllViews() {
    const state = window.fitTrackStore.getState();
    if (!state || !state.user) return;

    this.setupDateAndGreeting();
    this.syncDashboardMetrics(state);
    this.syncHydrationView(state);
    this.syncNutritionView(state);
    this.syncGoalsView(state);
    this.syncProfileView(state);
    this.syncNotifications(state);
  }

  // --- 1. Dashboard Metrics Sync ---
  syncDashboardMetrics(state) {
    const { user, metrics } = state;

    // Today's Goal text
    const todayGoalEl = document.getElementById('dashTodayGoalText');
    if (todayGoalEl) todayGoalEl.textContent = user.todayGoal || "Complete today's active recovery & hydration";

    // Streak Displays
    const streakElements = document.querySelectorAll('.user-streak-number');
    streakElements.forEach(el => el.textContent = `${user.streak}`);

    // Steps
    const stepsValEl = document.getElementById('dashStepsValue');
    const stepsFillEl = document.getElementById('dashStepsProgressFill');
    const stepsPercent = Math.min(100, Math.round((metrics.steps.current / metrics.steps.target) * 100));
    if (stepsValEl) stepsValEl.textContent = Number(metrics.steps.current).toLocaleString();
    if (stepsFillEl) stepsFillEl.style.width = `${stepsPercent}%`;

    // Calories Burned
    const calsValEl = document.getElementById('dashCaloriesBurned');
    const calsFillEl = document.getElementById('dashCaloriesProgressFill');
    const calsPercent = Math.min(100, Math.round((metrics.calories.burned / metrics.calories.target) * 100));
    if (calsValEl) calsValEl.textContent = metrics.calories.burned;
    if (calsFillEl) calsFillEl.style.width = `${calsPercent}%`;

    // Water Intake Quick Stat
    const waterValEl = document.getElementById('dashWaterValue');
    const waterFillEl = document.getElementById('dashWaterProgressFill');
    const waterPercent = Math.min(100, Math.round((metrics.water.current / metrics.water.target) * 100));
    if (waterValEl) waterValEl.textContent = `${metrics.water.current} L`;
    if (waterFillEl) waterFillEl.style.width = `${waterPercent}%`;

    // Workout Duration
    const durValEl = document.getElementById('dashWorkoutDuration');
    if (durValEl) durValEl.textContent = `${metrics.workoutTime.minutes} min`;

    // Current Weight
    const weightValEl = document.getElementById('dashCurrentWeight');
    if (weightValEl) weightValEl.textContent = `${user.weight} kg`;

    // Weekly Workouts
    const weeklyWorkoutsEl = document.getElementById('dashWeeklyWorkouts');
    const weeklyFillEl = document.getElementById('dashWeeklyWorkoutsFill');
    if (weeklyWorkoutsEl) weeklyWorkoutsEl.textContent = `${metrics.weeklyWorkouts.completed} / ${metrics.weeklyWorkouts.target} completed`;
    if (weeklyFillEl) {
      const weeklyPercent = Math.min(100, Math.round((metrics.weeklyWorkouts.completed / metrics.weeklyWorkouts.target) * 100));
      weeklyFillEl.style.width = `${weeklyPercent}%`;
    }
  }

  // --- 2. Hydration View Sync ---
  syncHydrationView(state) {
    const water = state.metrics.water;
    const current = parseFloat(water.current) || 0;
    const target = parseFloat(water.target) || 3.0;
    const percent = Math.min(100, Math.round((current / target) * 100));
    const remaining = Math.max(0, Math.round((target - current) * 10) / 10);

    // Current & target text
    const curTextEl = document.getElementById('waterCurrentDisplay');
    const targetTextEl = document.getElementById('waterTargetDisplay');
    const remainingTextEl = document.getElementById('waterRemainingDisplay');
    const fillBottleEl = document.getElementById('waterFillBottleLevel');

    if (curTextEl) curTextEl.textContent = `${current.toFixed(1)} L`;
    if (targetTextEl) targetTextEl.textContent = `/ ${target.toFixed(1)} L`;
    if (remainingTextEl) {
      remainingTextEl.textContent = remaining === 0 
        ? "🎉 Daily hydration target accomplished!" 
        : `${remaining.toFixed(1)} L remaining to hit goal`;
    }
    if (fillBottleEl) {
      fillBottleEl.style.height = `${percent}%`;
    }
  }

  // --- 3. Nutrition View Sync ---
  syncNutritionView(state) {
    const nut = state.nutrition;
    const target = nut.dailyTarget || 2400;
    const consumed = nut.dailyConsumed || 1850;
    const remaining = Math.max(0, target - consumed);
    const percent = Math.min(100, Math.round((consumed / target) * 100));

    const consumedEl = document.getElementById('nutConsumedValue');
    const targetEl = document.getElementById('nutTargetValue');
    const remainingEl = document.getElementById('nutRemainingValue');
    const ringCircle = document.getElementById('nutCaloriesRingCircle');

    if (consumedEl) consumedEl.textContent = consumed;
    if (targetEl) targetEl.textContent = `${target} kcal`;
    if (remainingEl) remainingEl.textContent = `${remaining} kcal`;

    // SVG Circular progress ring
    if (ringCircle) {
      const radius = 64;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (percent / 100) * circumference;
      ringCircle.style.strokeDasharray = `${circumference}`;
      ringCircle.style.strokeDashoffset = `${offset}`;
    }

    // Macros
    const { protein, carbs, fats } = nut.macros;

    const pFill = document.getElementById('macroProteinFill');
    const pVal = document.getElementById('macroProteinVal');
    if (pFill) pFill.style.width = `${Math.min(100, (protein.current / protein.target) * 100)}%`;
    if (pVal) pVal.textContent = `${protein.current}g / ${protein.target}g`;

    const cFill = document.getElementById('macroCarbsFill');
    const cVal = document.getElementById('macroCarbsVal');
    if (cFill) cFill.style.width = `${Math.min(100, (carbs.current / carbs.target) * 100)}%`;
    if (cVal) cVal.textContent = `${carbs.current}g / ${carbs.target}g`;

    const fFill = document.getElementById('macroFatsFill');
    const fVal = document.getElementById('macroFatsVal');
    if (fFill) fFill.style.width = `${Math.min(100, (fats.current / fats.target) * 100)}%`;
    if (fVal) fVal.textContent = `${fats.current}g / ${fats.target}g`;

    // Render Meals by Category
    ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(cat => {
      const container = document.getElementById(`mealList_${cat}`);
      if (!container) return;

      const items = nut.meals[cat] || [];
      if (items.length === 0) {
        container.innerHTML = `<div style="color: var(--text-muted); font-size: 0.8rem; padding: 6px 0;">No foods logged yet</div>`;
        return;
      }

      container.innerHTML = items.map(item => `
        <div class="meal-item-row">
          <div>
            <div style="font-weight: 600; color: var(--text-primary);">${item.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">P: ${item.p}g • C: ${item.c}g • F: ${item.f}g</div>
          </div>
          <span style="font-weight: 700; color: var(--accent-neon); font-size: 0.88rem;">${item.calories} kcal</span>
        </div>
      `).join('');
    });
  }

  // --- 4. Goals View Sync ---
  syncGoalsView(state) {
    const container = document.getElementById('goalsListGrid');
    if (!container) return;

    const goals = state.goals || [];
    container.innerHTML = goals.map(goal => `
      <div class="goal-card">
        <div>
          <div class="goal-card-top">
            <span class="goal-type-badge">${goal.type}</span>
            <span class="badge ${goal.progress >= 80 ? 'badge-neon' : 'badge-cyan'}">${goal.status}</span>
          </div>
          <h3 class="goal-title">${goal.title}</h3>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${goal.eta}</span>
        </div>

        <div>
          <div class="goal-progress-numbers">
            <span>${goal.current} ${goal.unit} of ${goal.target} ${goal.unit}</span>
            <span class="goal-percent">${goal.progress}%</span>
          </div>
          <div class="metric-progress-bar" style="margin-top: 8px;">
            <div class="metric-progress-fill" style="width: ${goal.progress}%; background: ${goal.progress >= 80 ? 'var(--accent-neon)' : 'var(--accent-cyan)'};"></div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // --- 5. Profile View Sync ---
  syncProfileView(state) {
    const user = state.user;

    // Sidebar User
    const sidebarUserName = document.getElementById('sidebarUserName');
    if (sidebarUserName) sidebarUserName.textContent = user.name;

    // Profile Page
    const pName = document.getElementById('profileDisplayName');
    const pGoal = document.getElementById('profileDisplayGoal');
    const pAge = document.getElementById('profileAge');
    const pHeight = document.getElementById('profileHeight');
    const pWeight = document.getElementById('profileWeight');
    const pBmi = document.getElementById('profileBmi');
    const pActivity = document.getElementById('profileActivityLevel');
    const pPrefWorkout = document.getElementById('profilePrefWorkout');

    if (pName) pName.textContent = user.name;
    if (pGoal) pGoal.textContent = user.goal;
    if (pAge) pAge.textContent = `${user.age} yrs`;
    if (pHeight) pHeight.textContent = `${user.height} cm`;
    if (pWeight) pWeight.textContent = `${user.weight} kg`;

    // Calculate BMI: weight / (height/100)^2
    if (pBmi && user.height && user.weight) {
      const heightInMeters = user.height / 100;
      const bmi = (user.weight / (heightInMeters * heightInMeters)).toFixed(1);
      pBmi.textContent = `${bmi} (Normal)`;
    }

    if (pActivity) pActivity.textContent = user.activityLevel;
    if (pPrefWorkout) pPrefWorkout.textContent = user.preferredWorkout;
  }

  // --- 6. Notifications Sync ---
  syncNotifications(state) {
    const listEl = document.getElementById('notificationsList');
    if (!listEl) return;

    const notifs = state.notifications || [];
    listEl.innerHTML = notifs.map(n => `
      <div class="notification-item">
        <div class="notif-icon-circle" style="background: ${n.type === 'cyan' ? 'rgba(0, 240, 255, 0.15)' : n.type === 'orange' ? 'rgba(255, 94, 54, 0.15)' : 'rgba(204, 255, 0, 0.15)'}; color: ${n.type === 'cyan' ? 'var(--accent-cyan)' : n.type === 'orange' ? 'var(--accent-orange)' : 'var(--accent-neon)'};">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </div>
        <div style="flex: 1;">
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">${n.title}</div>
          <div style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.3;">${n.text}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">${n.time}</div>
        </div>
      </div>
    `).join('');
  }

  // --- Event Bindings ---
  bindEvents() {
    // Navigation items click
    document.querySelectorAll('[data-nav-view]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-nav-view');
        this.switchView(view);
      });
    });

    // Hydration quick-adds
    document.querySelectorAll('.btn-water-quick').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const amt = parseFloat(btn.getAttribute('data-water-add'));
        window.fitTrackStore.addWater(amt);
        this.showToast(`💧 Added ${amt * 1000}ml of water!`, 'cyan');
      });
    });

    const resetWaterBtn = document.getElementById('btnResetWater');
    if (resetWaterBtn) {
      resetWaterBtn.addEventListener('click', () => {
        if (confirm('Reset today\'s hydration log to 0.0 L?')) {
          window.fitTrackStore.resetWater();
          this.showToast('Hydration tracker reset for today', 'muted');
        }
      });
    }

    // Notification dropdown toggle
    const notifBtn = document.getElementById('btnNotificationToggle');
    const notifDropdown = document.getElementById('notificationsDropdown');
    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('open');
      });

      document.addEventListener('click', (e) => {
        if (!notifDropdown.contains(e.target) && e.target !== notifBtn) {
          notifDropdown.classList.remove('open');
        }
      });
    }

    // Modal forms: Profile Edit
    this.setupProfileEditModal();

    // Modal forms: Add Meal
    this.setupAddMealModal();

    // Modal forms: Add Goal
    this.setupAddGoalModal();
  }

  setupProfileEditModal() {
    const editBtn = document.getElementById('btnOpenEditProfile');
    const modal = document.getElementById('editProfileModal');
    const closeBtn = document.getElementById('btnCloseEditProfile');
    const form = document.getElementById('editProfileForm');

    if (editBtn && modal) {
      editBtn.addEventListener('click', () => {
        const u = window.fitTrackStore.getState().user;
        document.getElementById('inputProfileName').value = u.name || '';
        document.getElementById('inputProfileAge').value = u.age || '';
        document.getElementById('inputProfileHeight').value = u.height || '';
        document.getElementById('inputProfileWeight').value = u.weight || '';
        document.getElementById('inputProfileTargetWeight').value = u.targetWeight || '';
        document.getElementById('inputProfileGoal').value = u.goal || '';
        document.getElementById('inputProfileActivity').value = u.activityLevel || '';
        document.getElementById('inputProfileWorkout').value = u.preferredWorkout || '';
        document.getElementById('inputProfileTodayGoal').value = u.todayGoal || '';
        modal.classList.add('open');
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    }

    if (form && modal) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const updated = {
          name: document.getElementById('inputProfileName').value,
          age: parseInt(document.getElementById('inputProfileAge').value, 10),
          height: parseFloat(document.getElementById('inputProfileHeight').value),
          weight: parseFloat(document.getElementById('inputProfileWeight').value),
          targetWeight: parseFloat(document.getElementById('inputProfileTargetWeight').value),
          goal: document.getElementById('inputProfileGoal').value,
          activityLevel: document.getElementById('inputProfileActivity').value,
          preferredWorkout: document.getElementById('inputProfileWorkout').value,
          todayGoal: document.getElementById('inputProfileTodayGoal').value
        };

        window.fitTrackStore.updateProfile(updated);
        modal.classList.remove('open');
        this.showToast('✅ Profile updated successfully!', 'neon');
      });
    }
  }

  setupAddMealModal() {
    const openBtn = document.getElementById('btnOpenAddMeal');
    const modal = document.getElementById('addMealModal');
    const closeBtn = document.getElementById('btnCloseAddMeal');
    const form = document.getElementById('addMealForm');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => modal.classList.add('open'));
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    }

    if (form && modal) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const cat = document.getElementById('inputMealCategory').value;
        const name = document.getElementById('inputMealName').value;
        const cals = parseInt(document.getElementById('inputMealCals').value, 10);
        const p = parseInt(document.getElementById('inputMealP').value, 10) || 0;
        const c = parseInt(document.getElementById('inputMealC').value, 10) || 0;
        const f = parseInt(document.getElementById('inputMealF').value, 10) || 0;

        window.fitTrackStore.addMeal(cat, { name, calories: cals, p, c, f });
        form.reset();
        modal.classList.remove('open');
        this.showToast(`🥗 Logged ${name} (${cals} kcal)`, 'emerald');
      });
    }
  }

  setupAddGoalModal() {
    const openBtn = document.getElementById('btnOpenAddGoal');
    const modal = document.getElementById('addGoalModal');
    const closeBtn = document.getElementById('btnCloseAddGoal');
    const form = document.getElementById('addGoalForm');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => modal.classList.add('open'));
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    }

    if (form && modal) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('inputGoalTitle').value;
        const type = document.getElementById('inputGoalType').value;
        const current = document.getElementById('inputGoalCurrent').value;
        const target = document.getElementById('inputGoalTarget').value;
        const unit = document.getElementById('inputGoalUnit').value;
        const eta = document.getElementById('inputGoalEta').value;

        window.fitTrackStore.addGoal({ title, type, current, target, unit, eta });
        form.reset();
        modal.classList.remove('open');
        this.showToast(`🎯 New goal "${title}" created!`, 'neon');
      });
    }
  }

  // --- Toast Notification Toast Manager ---
  showToast(message, colorType = 'neon') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    const borderGlow = colorType === 'cyan' ? 'var(--accent-cyan)' :
                       colorType === 'emerald' ? 'var(--accent-emerald)' :
                       colorType === 'orange' ? 'var(--accent-orange)' : 'var(--accent-neon)';
    toast.style.borderColor = borderGlow;

    toast.innerHTML = `
      <span style="font-size: 0.95rem;">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-leave');
      setTimeout(() => toast.remove(), 260);
    }, 3200);
  }
}

window.fitTrackApp = new FitTrackApp();

// Boot application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.fitTrackApp.init();
  if (window.fitTrackWorkout) window.fitTrackWorkout.init();
  if (window.fitTrackCharts) window.fitTrackCharts.init();
});
