/**
 * FitTrack Workout Planner & Active Session Player
 * Handles filtering, exercise checklists, real-time timer, and celebration summaries
 */

class FitTrackWorkoutManager {
  constructor() {
    this.activeType = 'All';
    this.activeDifficulty = 'All';
    this.activeSession = null;
    this.timerInterval = null;
  }

  init() {
    this.renderWorkoutsGrid();
    this.setupFilters();
    this.setupActiveSessionListeners();
  }

  setupFilters() {
    document.querySelectorAll('.filter-type-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-type-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.activeType = e.currentTarget.dataset.type;
        this.renderWorkoutsGrid();
      });
    });

    document.querySelectorAll('.filter-diff-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-diff-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.activeDifficulty = e.currentTarget.dataset.difficulty;
        this.renderWorkoutsGrid();
      });
    });
  }

  renderWorkoutsGrid() {
    const container = document.getElementById('workoutsListGrid');
    if (!container) return;

    const allWorkouts = window.fitTrackStore.getState().workouts || [];
    const filtered = allWorkouts.filter(w => {
      const matchType = this.activeType === 'All' || w.type.toLowerCase() === this.activeType.toLowerCase();
      const matchDiff = this.activeDifficulty === 'All' || w.difficulty.toLowerCase() === this.activeDifficulty.toLowerCase();
      return matchType && matchDiff;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-muted);">
          <p>No workouts found matching the selected filters.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(workout => {
      const typeBadgeClass = workout.type === 'Strength' ? 'badge-neon' :
                             workout.type === 'Cardio' ? 'badge-cyan' :
                             workout.type === 'HIIT' ? 'badge-orange' : 'badge-emerald';

      return `
        <div class="workout-item-card">
          <div>
            <div class="workout-card-top">
              <span class="badge ${typeBadgeClass}">${workout.type}</span>
              <span class="badge" style="background: rgba(255, 255, 255, 0.08); color: var(--text-secondary);">${workout.difficulty}</span>
            </div>
            <h3 class="workout-card-title">${workout.title}</h3>
            <p class="workout-card-desc">${workout.description}</p>
            
            <div class="exercise-tag-list">
              ${workout.exercises.map(ex => `<span class="exercise-tag">${ex.name}</span>`).join('')}
            </div>
          </div>

          <div>
            <div class="workout-meta-pills">
              <div class="workout-meta-pill">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>${workout.duration} mins</span>
              </div>
              <div class="workout-meta-pill">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                </svg>
                <span>~${workout.calories} kcal</span>
              </div>
              <div class="workout-meta-pill">
                <span>${workout.exercises.length} Exercises</span>
              </div>
            </div>

            <button class="btn btn-primary" style="width: 100%; margin-top: 18px;" onclick="window.fitTrackWorkout.startWorkoutSession('${workout.id}')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Start Workout
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- Active Workout Session Controller ---
  startWorkoutSession(workoutId) {
    const workouts = window.fitTrackStore.getState().workouts || [];
    const workout = workouts.find(w => w.id === workoutId) || workouts[0];
    if (!workout) return;

    this.activeSession = {
      workout,
      elapsedSeconds: 0,
      isPaused: false,
      completedExercises: new Set()
    };

    // Render Modal Content
    document.getElementById('activeWorkoutModalTitle').textContent = workout.title;
    document.getElementById('activeWorkoutModalMeta').textContent = `${workout.type} • ${workout.difficulty} • Target: ${workout.duration} mins`;
    
    this.renderExerciseChecklist(workout);
    this.updateTimerDisplay();
    this.updateSessionProgress();

    // Start Timer Interval
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.activeSession && !this.activeSession.isPaused) {
        this.activeSession.elapsedSeconds++;
        this.updateTimerDisplay();
      }
    }, 1000);

    // Open Modal
    const modal = document.getElementById('activeWorkoutModal');
    modal.classList.add('open');

    // Update play/pause button state
    const playBtn = document.getElementById('btnWorkoutPauseResume');
    if (playBtn) {
      playBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
        </svg>
        Pause
      `;
    }
  }

  renderExerciseChecklist(workout) {
    const listContainer = document.getElementById('activeWorkoutChecklist');
    if (!listContainer) return;

    listContainer.innerHTML = workout.exercises.map((ex, index) => `
      <div class="exercise-check-item" data-ex-id="${ex.id}" onclick="window.fitTrackWorkout.toggleExercise('${ex.id}')">
        <div style="display: flex; align-items: center; gap: 14px;">
          <input type="checkbox" id="check-${ex.id}" style="width: 20px; height: 20px; accent-color: var(--accent-neon); cursor: pointer;" onclick="event.stopPropagation(); window.fitTrackWorkout.toggleExercise('${ex.id}')">
          <div>
            <div class="exercise-name" style="font-weight: 600; font-size: 0.95rem;">${index + 1}. ${ex.name}</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">${ex.sets} sets × ${ex.reps} ${ex.defaultKg ? `(@ ${ex.defaultKg}kg)` : ''}</div>
          </div>
        </div>
        <span class="badge" style="background: var(--bg-primary); color: var(--text-muted); font-size: 0.75rem;">Rest: ${ex.rest}</span>
      </div>
    `).join('');
  }

  toggleExercise(exerciseId) {
    if (!this.activeSession) return;
    const checkbox = document.getElementById(`check-${exerciseId}`);
    const itemEl = document.querySelector(`.exercise-check-item[data-ex-id="${exerciseId}"]`);

    if (this.activeSession.completedExercises.has(exerciseId)) {
      this.activeSession.completedExercises.delete(exerciseId);
      if (checkbox) checkbox.checked = false;
      if (itemEl) itemEl.classList.remove('completed');
    } else {
      this.activeSession.completedExercises.add(exerciseId);
      if (checkbox) checkbox.checked = true;
      if (itemEl) itemEl.classList.add('completed');
    }

    this.updateSessionProgress();
  }

  updateSessionProgress() {
    if (!this.activeSession) return;
    const total = this.activeSession.workout.exercises.length;
    const done = this.activeSession.completedExercises.size;
    const percent = Math.round((done / total) * 100);

    const progressFill = document.getElementById('activeWorkoutProgressFill');
    const progressLabel = document.getElementById('activeWorkoutProgressLabel');

    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressLabel) progressLabel.textContent = `${done} of ${total} exercises completed (${percent}%)`;
  }

  togglePauseResume() {
    if (!this.activeSession) return;
    this.activeSession.isPaused = !this.activeSession.isPaused;

    const playBtn = document.getElementById('btnWorkoutPauseResume');
    if (playBtn) {
      if (this.activeSession.isPaused) {
        playBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Resume
        `;
      } else {
        playBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
          </svg>
          Pause
        `;
      }
    }
  }

  updateTimerDisplay() {
    if (!this.activeSession) return;
    const totalSecs = this.activeSession.elapsedSeconds;
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const timerEl = document.getElementById('activeWorkoutTimerDigits');
    if (timerEl) timerEl.textContent = formatted;
  }

  finishWorkoutSession() {
    if (!this.activeSession) return;

    clearInterval(this.timerInterval);
    const session = this.activeSession;
    const totalSecs = Math.max(session.elapsedSeconds, 45); // min 45s for demo realism
    const mins = Math.max(1, Math.round(totalSecs / 60));
    
    // Pro-rate calories based on duration and completion
    const baseCal = session.workout.calories;
    const completionFactor = Math.max(0.6, session.completedExercises.size / session.workout.exercises.length);
    const caloriesBurned = Math.round(baseCal * completionFactor);

    // Save in store
    const summaryData = {
      workoutId: session.workout.id,
      workoutTitle: session.workout.title,
      type: session.workout.type,
      durationSeconds: totalSecs,
      durationMinutes: mins,
      caloriesBurned: caloriesBurned,
      exercisesDone: session.completedExercises.size,
      totalExercises: session.workout.exercises.length,
      avgHeartRate: 142 + Math.floor(Math.random() * 18)
    };

    window.fitTrackStore.completeWorkout(summaryData);

    // Close active modal
    document.getElementById('activeWorkoutModal').classList.remove('open');

    // Trigger celebration confetti
    this.triggerConfetti();

    // Show Workout Summary Receipt Modal
    this.showWorkoutSummaryModal(summaryData);

    this.activeSession = null;
  }

  cancelWorkoutSession() {
    if (confirm("Are you sure you want to exit? Your progress in this session won't be saved.")) {
      clearInterval(this.timerInterval);
      this.activeSession = null;
      document.getElementById('activeWorkoutModal').classList.remove('open');
    }
  }

  showWorkoutSummaryModal(summary) {
    const mins = Math.floor(summary.durationSeconds / 60);
    const secs = summary.durationSeconds % 60;
    const timeFormatted = `${mins}m ${secs}s`;

    document.getElementById('sumWorkoutTitle').textContent = summary.workoutTitle;
    document.getElementById('sumDuration').textContent = timeFormatted;
    document.getElementById('sumCalories').textContent = `${summary.caloriesBurned} kcal`;
    document.getElementById('sumExercises').textContent = `${summary.exercisesDone} / ${summary.totalExercises}`;
    document.getElementById('sumHeartRate').textContent = `${summary.avgHeartRate} bpm`;

    const user = window.fitTrackStore.getState().user;
    document.getElementById('sumStreakBadge').textContent = `${user.streak} Days Streak 🔥`;

    document.getElementById('workoutSummaryModal').classList.add('open');
  }

  triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#CCFF00', '#00F0FF', '#FF5E36', '#FFFFFF']
      });
    }
  }

  setupActiveSessionListeners() {
    const pauseBtn = document.getElementById('btnWorkoutPauseResume');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.togglePauseResume());
    }

    const finishBtn = document.getElementById('btnWorkoutFinish');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => this.finishWorkoutSession());
    }

    const cancelBtn = document.getElementById('btnWorkoutCancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.cancelWorkoutSession());
    }

    const closeSummaryBtn = document.getElementById('btnCloseSummaryModal');
    if (closeSummaryBtn) {
      closeSummaryBtn.addEventListener('click', () => {
        document.getElementById('workoutSummaryModal').classList.remove('open');
        // Switch to dashboard view to see the updated streak and charts
        window.fitTrackApp.switchView('dashboard');
      });
    }
  }
}

window.fitTrackWorkout = new FitTrackWorkoutManager();
