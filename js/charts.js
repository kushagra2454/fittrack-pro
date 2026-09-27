/**
 * FitTrack Chart.js Visualizations & Progress Tracking
 * Provides interactive charts with dark aesthetic, neon gradients, and time filters
 */

class FitTrackChartsManager {
  constructor() {
    this.charts = {};
    this.currentPeriod = 'weekly'; // 'weekly' or 'monthly'
  }

  init() {
    if (typeof Chart === 'undefined') {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (typeof Chart !== 'undefined') {
          clearInterval(interval);
          this.setupChartDefaults();
          this.renderAllCharts();
          this.setupFilterButtons();
          this.renderStrengthProgress();
        } else if (attempts > 6) {
          clearInterval(interval);
          console.warn('Chart.js CDN unavailable, rendering responsive SVG charts fallback.');
          this.renderSvgFallbacks();
          this.setupFilterButtons();
          this.renderStrengthProgress();
        }
      }, 300);
      return;
    }

    this.setupChartDefaults();
    this.renderAllCharts();
    this.setupFilterButtons();
    this.renderStrengthProgress();
  }

  setupChartDefaults() {
    Chart.defaults.color = '#9BA3B5';
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.plugins.tooltip.backgroundColor = '#151A26';
    Chart.defaults.plugins.tooltip.titleColor = '#FFFFFF';
    Chart.defaults.plugins.tooltip.bodyColor = '#9BA3B5';
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.12)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.legend.display = false;
  }

  renderSvgFallbacks() {
    // Elegant fallback SVG charts when offline
    const hist = window.fitTrackStore.getState().chartHistory[this.currentPeriod];
    const weightEl = document.getElementById('weightProgressChart');
    if (weightEl && weightEl.parentElement) {
      weightEl.parentElement.innerHTML = `
        <div style="display: flex; height: 100%; align-items: flex-end; justify-content: space-between; gap: 8px; padding-top: 20px;">
          ${hist.weight.map((w, i) => `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;">
              <div style="height: ${(w - 70) * 14}%; width: 100%; max-width: 28px; background: linear-gradient(180deg, #00F0FF, rgba(0, 240, 255, 0.2)); border-radius: 6px 6px 0 0;"></div>
              <span style="font-size: 0.75rem; color: #9BA3B5; margin-top: 6px;">${hist.labels[i]}</span>
              <span style="font-size: 0.7rem; color: #00F0FF; font-weight: 700;">${w}</span>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  renderAllCharts() {
    this.renderWeightChart();
    this.renderStepsChart();
    this.renderCaloriesChart();
    this.renderFrequencyChart();
  }

  setPeriod(period) {
    if (this.currentPeriod === period) return;
    this.currentPeriod = period;

    // Update active button state
    document.querySelectorAll('.filter-pill[data-period]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.period === period);
    });

    const data = window.fitTrackStore.getState().chartHistory[period];
    if (!data) return;

    // Update Weight Chart
    if (this.charts.weight) {
      this.charts.weight.data.labels = data.labels;
      this.charts.weight.data.datasets[0].data = data.weight;
      this.charts.weight.update();
    }

    // Update Steps Chart
    if (this.charts.steps) {
      this.charts.steps.data.labels = data.labels;
      this.charts.steps.data.datasets[0].data = data.steps;
      this.charts.steps.update();
    }

    // Update Calories Chart
    if (this.charts.calories) {
      this.charts.calories.data.labels = data.labels;
      this.charts.calories.data.datasets[0].data = data.calories;
      this.charts.calories.update();
    }

    // Update Frequency Chart
    if (this.charts.frequency) {
      this.charts.frequency.data.labels = data.labels;
      this.charts.frequency.data.datasets[0].data = data.frequency;
      this.charts.frequency.update();
    }
  }

  setupFilterButtons() {
    document.querySelectorAll('.filter-pill[data-period]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const period = e.currentTarget.dataset.period;
        this.setPeriod(period);
      });
    });
  }

  // 1. Weight Progress Line Chart
  renderWeightChart() {
    const canvas = document.getElementById('weightProgressChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (this.charts.weight) this.charts.weight.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
    gradient.addColorStop(1, 'rgba(0, 240, 255, 0.0)');

    const hist = window.fitTrackStore.getState().chartHistory[this.currentPeriod];

    this.charts.weight = new Chart(ctx, {
      type: 'line',
      data: {
        labels: hist.labels,
        datasets: [{
          label: 'Weight (kg)',
          data: hist.weight,
          borderColor: '#00F0FF',
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#00F0FF',
          pointBorderColor: '#080A0F',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: { color: '#9BA3B5' }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#9BA3B5',
              callback: (val) => `${val} kg`
            },
            min: 71,
            max: 77
          }
        }
      }
    });
  }

  // 2. Daily Steps Chart
  renderStepsChart() {
    const canvas = document.getElementById('stepsProgressChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (this.charts.steps) this.charts.steps.destroy();

    const hist = window.fitTrackStore.getState().chartHistory[this.currentPeriod];

    this.charts.steps = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: hist.labels,
        datasets: [{
          label: 'Steps',
          data: hist.steps,
          backgroundColor: '#CCFF00',
          hoverBackgroundColor: '#E2FF4F',
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#9BA3B5' }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#9BA3B5',
              callback: (val) => val >= 1000 ? `${val / 1000}k` : val
            }
          }
        }
      }
    });
  }

  // 3. Calories Burned Chart
  renderCaloriesChart() {
    const canvas = document.getElementById('caloriesProgressChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (this.charts.calories) this.charts.calories.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, 'rgba(255, 94, 54, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 94, 54, 0.0)');

    const hist = window.fitTrackStore.getState().chartHistory[this.currentPeriod];

    this.charts.calories = new Chart(ctx, {
      type: 'line',
      data: {
        labels: hist.labels,
        datasets: [{
          label: 'Calories Burned (kcal)',
          data: hist.calories,
          borderColor: '#FF5E36',
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#FF5E36',
          pointBorderColor: '#080A0F',
          pointBorderWidth: 2,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: { color: '#9BA3B5' }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#9BA3B5' }
          }
        }
      }
    });
  }

  // 4. Workout Frequency Chart
  renderFrequencyChart() {
    const canvas = document.getElementById('frequencyProgressChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (this.charts.frequency) this.charts.frequency.destroy();

    const hist = window.fitTrackStore.getState().chartHistory[this.currentPeriod];

    this.charts.frequency = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: hist.labels,
        datasets: [{
          label: 'Workouts',
          data: hist.frequency,
          backgroundColor: '#10E599',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#9BA3B5' }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              stepSize: 1,
              color: '#9BA3B5'
            },
            min: 0,
            max: this.currentPeriod === 'weekly' ? 2 : 7
          }
        }
      }
    });
  }

  // Render Strength PR Cards
  renderStrengthProgress() {
    const container = document.getElementById('strengthProgressList');
    if (!container) return;

    const data = window.fitTrackStore.getState().chartHistory.strengthProgress;
    container.innerHTML = data.map(item => `
      <div class="card" style="display: flex; align-items: center; justify-content: space-between; padding: 18px 22px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 42px; height: 42px; border-radius: var(--radius-md); background: rgba(204, 255, 0, 0.1); display: flex; align-items: center; justify-content: center; color: var(--accent-neon);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 5v14M18 5v14M2 9h4M2 15h4M18 9h4M18 15h4M6 12h12"/>
            </svg>
          </div>
          <div>
            <h4 style="font-size: 1.05rem; font-weight: 700;">${item.name}</h4>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Previous PR: ${item.previous} ${item.unit}</span>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; color: var(--text-primary);">
            ${item.current} <span style="font-size: 0.9rem; font-weight: 500; color: var(--text-secondary);">${item.unit}</span>
          </div>
          <span class="badge badge-neon" style="font-size: 0.75rem;">${item.change}</span>
        </div>
      </div>
    `).join('');
  }
}

window.fitTrackCharts = new FitTrackChartsManager();
