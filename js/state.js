/**
 * FitTrack Reactive State Store
 * Manages local persistence and dispatches updates across components
 */

class FitTrackStore {
  constructor() {
    this.storageKey = 'fittrack_app_state_v1';
    this.subscribers = {};
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using default data.', e);
    }
    // Deep clone default data
    return JSON.parse(JSON.stringify(window.FITTRACK_DEFAULT_DATA || {}));
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.error('Could not save to localStorage', e);
    }
  }

  getState() {
    return this.state;
  }

  on(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }
    this.subscribers[event].push(callback);
    return () => {
      this.subscribers[event] = this.subscribers[event].filter(cb => cb !== callback);
    };
  }

  emit(event, payload) {
    if (this.subscribers[event]) {
      this.subscribers[event].forEach(cb => {
        try { cb(payload, this.state); } catch (err) { console.error(`Error in subscriber for ${event}:`, err); }
      });
    }
    if (this.subscribers['*']) {
      this.subscribers['*'].forEach(cb => {
        try { cb(event, payload, this.state); } catch (err) { console.error('Error in wildcard subscriber:', err); }
      });
    }
  }

  // --- Hydration Actions ---
  addWater(liters) {
    const cur = parseFloat(this.state.metrics.water.current);
    const target = parseFloat(this.state.metrics.water.target);
    const newTotal = Math.min(Math.round((cur + liters) * 10) / 10, target + 2.0); // allow slight excess
    this.state.metrics.water.current = newTotal;
    this.saveState();
    this.emit('water_updated', { current: newTotal, target });
    return newTotal;
  }

  resetWater() {
    this.state.metrics.water.current = 0.0;
    this.saveState();
    this.emit('water_updated', { current: 0.0, target: this.state.metrics.water.target });
  }

  // --- Profile Actions ---
  updateProfile(profileData) {
    this.state.user = { ...this.state.user, ...profileData };
    this.saveState();
    this.emit('profile_updated', this.state.user);
  }

  // --- Nutrition Actions ---
  addMeal(category, mealItem) {
    if (!this.state.nutrition.meals[category]) {
      this.state.nutrition.meals[category] = [];
    }
    const item = {
      id: 'm-' + Date.now(),
      name: mealItem.name,
      calories: parseInt(mealItem.calories, 10) || 0,
      p: parseInt(mealItem.p, 10) || 0,
      c: parseInt(mealItem.c, 10) || 0,
      f: parseInt(mealItem.f, 10) || 0
    };
    this.state.nutrition.meals[category].push(item);
    
    // Recalculate totals
    this.recalculateNutritionTotals();
    this.saveState();
    this.emit('nutrition_updated', this.state.nutrition);
    return item;
  }

  recalculateNutritionTotals() {
    let totalCals = 0;
    let totalP = 0;
    let totalC = 0;
    let totalF = 0;

    Object.values(this.state.nutrition.meals).forEach(mealList => {
      mealList.forEach(m => {
        totalCals += m.calories || 0;
        totalP += m.p || 0;
        totalC += m.c || 0;
        totalF += m.f || 0;
      });
    });

    this.state.nutrition.dailyConsumed = totalCals;
    this.state.nutrition.macros.protein.current = totalP;
    this.state.nutrition.macros.carbs.current = totalC;
    this.state.nutrition.macros.fats.current = totalF;
    this.state.metrics.calories.consumed = totalCals;
  }

  // --- Goals Actions ---
  addGoal(goalData) {
    const newGoal = {
      id: 'g-' + Date.now(),
      title: goalData.title,
      current: parseFloat(goalData.current) || 0,
      target: parseFloat(goalData.target) || 100,
      unit: goalData.unit || '',
      progress: Math.min(100, Math.round(((parseFloat(goalData.current) || 0) / (parseFloat(goalData.target) || 100)) * 100)),
      type: goalData.type || 'Fitness',
      status: 'Active',
      eta: goalData.eta || 'In progress'
    };
    this.state.goals.push(newGoal);
    this.saveState();
    this.emit('goals_updated', this.state.goals);
    return newGoal;
  }

  updateGoalProgress(goalId, newCurrent) {
    const goal = this.state.goals.find(g => g.id === goalId);
    if (goal) {
      goal.current = parseFloat(newCurrent);
      goal.progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
      this.saveState();
      this.emit('goals_updated', this.state.goals);
    }
  }

  // --- Workout Session Actions ---
  completeWorkout(workoutSummary) {
    // Increment streak
    this.state.user.streak = (this.state.user.streak || 0) + 1;
    
    // Add workout time
    const durationMinutes = Math.round((workoutSummary.durationSeconds || 0) / 60) || 30;
    this.state.metrics.workoutTime.minutes = (this.state.metrics.workoutTime.minutes || 0) + durationMinutes;

    // Add calories burned
    const cals = workoutSummary.caloriesBurned || 350;
    this.state.metrics.calories.burned = (this.state.metrics.calories.burned || 0) + cals;

    // Increment weekly workouts
    this.state.metrics.weeklyWorkouts.completed = Math.min(
      (this.state.metrics.weeklyWorkouts.completed || 0) + 1,
      this.state.metrics.weeklyWorkouts.target || 5
    );

    // Add notification
    this.state.notifications.unshift({
      id: 'n-' + Date.now(),
      title: `Workout Completed: ${workoutSummary.workoutTitle}`,
      text: `Burned ${cals} kcal over ${durationMinutes} mins! 5-day streak extended to ${this.state.user.streak} days 🔥`,
      time: 'Just now',
      icon: 'check-circle',
      type: 'neon'
    });

    this.saveState();
    this.emit('workout_completed', workoutSummary);
    this.emit('state_sync', this.state);
  }

  resetAllData() {
    this.state = JSON.parse(JSON.stringify(window.FITTRACK_DEFAULT_DATA));
    this.saveState();
    this.emit('state_sync', this.state);
  }
}

window.fitTrackStore = new FitTrackStore();
