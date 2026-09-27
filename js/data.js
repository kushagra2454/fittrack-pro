/**
 * FitTrack Seed & Default Realistic Fitness Data
 * Configured specifically for Kushagra
 */

const FITTRACK_DEFAULT_DATA = {
  user: {
    name: "Kushagra",
    age: 26,
    height: 178, // in cm
    weight: 74.5, // in kg
    targetWeight: 72.0,
    goal: "Lean Muscle & Athletic Endurance",
    activityLevel: "Very Active (5-6 days/week)",
    preferredWorkout: "Strength & HIIT",
    streak: 5,
    todayGoal: "Complete Upper Body Hypertrophy & 10,000 steps"
  },
  metrics: {
    steps: { current: 8432, target: 10000 },
    calories: { burned: 640, target: 750, consumed: 1850, intakeTarget: 2400 },
    water: { current: 1.8, target: 3.0, unit: "L" },
    workoutTime: { minutes: 48, target: 60 },
    weeklyWorkouts: { completed: 4, target: 5 }
  },
  workouts: [
    {
      id: "w-1",
      title: "Upper Body Hypertrophy",
      type: "Strength",
      difficulty: "Intermediate",
      duration: 45,
      calories: 380,
      description: "Target chest, back, and shoulders with high mechanical tension and controlled eccentrics.",
      isRecommended: true,
      exercises: [
        { id: "e-1", name: "Bench Press", sets: 4, reps: "10 reps", rest: "90s", defaultKg: 85 },
        { id: "e-2", name: "Incline Dumbbell Press", sets: 3, reps: "12 reps", rest: "75s", defaultKg: 28 },
        { id: "e-3", name: "Bent-Over Barbell Rows", sets: 4, reps: "10 reps", rest: "90s", defaultKg: 70 },
        { id: "e-4", name: "Overhead Shoulder Press", sets: 3, reps: "10 reps", rest: "75s", defaultKg: 50 },
        { id: "e-5", name: "Push-ups (Finisher)", sets: 3, reps: "20 reps", rest: "60s", defaultKg: 0 }
      ]
    },
    {
      id: "w-2",
      title: "Full Body HIIT Shred",
      type: "HIIT",
      difficulty: "Advanced",
      duration: 35,
      calories: 460,
      description: "High intensity interval protocol boosting EPOC, cardiovascular power and core stability.",
      isRecommended: false,
      exercises: [
        { id: "e-6", name: "Burpees", sets: 4, reps: "45 sec", rest: "30s" },
        { id: "e-7", name: "Jump Squats", sets: 4, reps: "45 sec", rest: "30s" },
        { id: "e-8", name: "Mountain Climbers", sets: 4, reps: "45 sec", rest: "30s" },
        { id: "e-9", name: "Plank to Push-ups", sets: 4, reps: "45 sec", rest: "30s" },
        { id: "e-10", name: "High Knees Sprint", sets: 4, reps: "45 sec", rest: "30s" }
      ]
    },
    {
      id: "w-3",
      title: "Lower Body Power & Core",
      type: "Strength",
      difficulty: "Advanced",
      duration: 50,
      calories: 440,
      description: "Heavy squat compounds combined with posterior chain development and deep abdominal bracing.",
      isRecommended: false,
      exercises: [
        { id: "e-11", name: "Barbell Back Squats", sets: 5, reps: "5 reps", rest: "120s", defaultKg: 120 },
        { id: "e-12", name: "Romanian Deadlifts", sets: 4, reps: "8 reps", rest: "90s", defaultKg: 110 },
        { id: "e-13", name: "Walking Dumbbell Lunges", sets: 3, reps: "12 / leg", rest: "60s", defaultKg: 20 },
        { id: "e-14", name: "Hanging Leg Raises", sets: 4, reps: "15 reps", rest: "60s" },
        { id: "e-15", name: "Weighted Plank", sets: 3, reps: "60 sec", rest: "45s", defaultKg: 15 }
      ]
    },
    {
      id: "w-4",
      title: "5K Aerobic Tempo Run",
      type: "Cardio",
      difficulty: "Intermediate",
      duration: 30,
      calories: 340,
      description: "Sustained lactate threshold tempo conditioning to elevate VO2 max and running economy.",
      isRecommended: false,
      exercises: [
        { id: "e-16", name: "Warm-up Dynamic Jog", sets: 1, reps: "5 mins", rest: "0s" },
        { id: "e-17", name: "Tempo Pace Interval", sets: 1, reps: "20 mins @ 5:10/km", rest: "0s" },
        { id: "e-18", name: "Cool-down Recovery Walk", sets: 1, reps: "5 mins", rest: "0s" }
      ]
    },
    {
      id: "w-5",
      title: "Dynamic Mobility & Decompression",
      type: "Mobility",
      difficulty: "Beginner",
      duration: 25,
      calories: 120,
      description: "Joint articulation, hip opener sequence, and thoracic spine release for athletic recovery.",
      isRecommended: false,
      exercises: [
        { id: "e-19", name: "World's Greatest Stretch", sets: 3, reps: "5 each side", rest: "30s" },
        { id: "e-20", name: "Cat-Cow Spine Waves", sets: 3, reps: "10 reps", rest: "20s" },
        { id: "e-21", name: "Deep Squat Hold & Pry", sets: 3, reps: "45 sec", rest: "30s" },
        { id: "e-22", name: "Thoracic Windmills", sets: 3, reps: "10 each side", rest: "20s" },
        { id: "e-23", name: "Pigeon Hip Opener", sets: 3, reps: "60s / side", rest: "30s" }
      ]
    },
    {
      id: "w-6",
      title: "High Cadence Cycling Intervals",
      type: "Cardio",
      difficulty: "Advanced",
      duration: 40,
      calories: 480,
      description: "Power sprints interspersed with high RPM recovery to maximize anaerobic capacity.",
      isRecommended: false,
      exercises: [
        { id: "e-24", name: "Spin Warm-up", sets: 1, reps: "6 mins", rest: "0s" },
        { id: "e-25", name: "Tabata Sprint Bursts", sets: 8, reps: "20s ON / 10s OFF", rest: "60s" },
        { id: "e-26", name: "Hill Resistance Climb", sets: 1, reps: "15 mins", rest: "0s" },
        { id: "e-27", name: "Cool-down Flush", sets: 1, reps: "5 mins", rest: "0s" }
      ]
    }
  ],
  goals: [
    {
      id: "g-1",
      title: "Lose Weight & Cut Body Fat",
      current: 74.5,
      target: 72.0,
      unit: "kg",
      progress: 68,
      type: "Weight Loss",
      status: "On Track",
      eta: "3 weeks remaining"
    },
    {
      id: "g-2",
      title: "Build Lean Muscle Mass",
      current: 35.8,
      target: 37.5,
      unit: "kg (Skeletal)",
      progress: 76,
      type: "Hypertrophy",
      status: "Ahead",
      eta: "5 weeks remaining"
    },
    {
      id: "g-3",
      title: "Improve 5K Endurance Pace",
      current: 24.2,
      target: 21.0,
      unit: "min",
      progress: 80,
      type: "Cardio",
      status: "On Track",
      eta: "2 weeks remaining"
    },
    {
      id: "g-4",
      title: "Hit 100 kg Bench Press PR",
      current: 92.5,
      target: 100.0,
      unit: "kg",
      progress: 88,
      type: "Strength",
      status: "Almost There",
      eta: "Next PR session"
    },
    {
      id: "g-5",
      title: "Consistency: 5 Workouts / Week",
      current: 4,
      target: 5,
      unit: "sessions",
      progress: 80,
      type: "Habit",
      status: "On Track",
      eta: "1 session left this week"
    }
  ],
  nutrition: {
    dailyTarget: 2400,
    dailyConsumed: 1850,
    macros: {
      protein: { current: 145, target: 165, unit: "g", color: "#10E599" },
      carbs: { current: 195, target: 240, unit: "g", color: "#00F0FF" },
      fats: { current: 52, target: 65, unit: "g", color: "#FFB800" }
    },
    meals: {
      breakfast: [
        { id: "m-1", name: "Rolled Oats with Whey Isolate & Blueberries", calories: 480, p: 38, c: 56, f: 10 },
        { id: "m-2", name: "Black Espresso & 15g Raw Almonds", calories: 110, p: 4, c: 3, f: 9 }
      ],
      lunch: [
        { id: "m-3", name: "Grilled Chicken Breast, Quinoa & Steamed Broccoli", calories: 650, p: 58, c: 62, f: 14 }
      ],
      dinner: [
        { id: "m-4", name: "Wild Alaskan Salmon, Roasted Sweet Potato & Asparagus", calories: 510, p: 42, c: 45, f: 16 }
      ],
      snacks: [
        { id: "m-5", name: "Greek Yogurt with Chia Seeds & Manuka Honey", calories: 100, p: 3, c: 29, f: 3 }
      ]
    }
  },
  chartHistory: {
    weekly: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      weight: [75.2, 75.0, 74.8, 74.7, 74.5, 74.5, 74.4],
      steps: [9420, 10850, 8100, 11400, 8432, 12100, 7800],
      calories: [680, 720, 590, 810, 640, 780, 450],
      frequency: [1, 1, 0, 1, 1, 1, 0]
    },
    monthly: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      weight: [76.2, 75.6, 75.0, 74.5],
      steps: [68500, 74200, 71800, 73500],
      calories: [4600, 5100, 4850, 5200],
      frequency: [4, 5, 4, 5]
    },
    strengthProgress: [
      { name: "Barbell Bench Press", current: 92.5, previous: 85.0, change: "+7.5 kg", unit: "kg", icon: "dumbbell" },
      { name: "Barbell Back Squat", current: 125.0, previous: 115.0, change: "+10.0 kg", unit: "kg", icon: "activity" },
      { name: "Conventional Deadlift", current: 160.0, previous: 145.0, change: "+15.0 kg", unit: "kg", icon: "zap" },
      { name: "Weighted Pull-ups", current: 16, previous: 12, change: "+4 reps", unit: "reps", icon: "trending-up" }
    ]
  },
  notifications: [
    {
      id: "n-1",
      title: "Hydration Check",
      text: "You've logged 1.8 L! Just 1.2 L remaining to hit today's 3.0 L goal.",
      time: "15 min ago",
      icon: "droplet",
      type: "cyan"
    },
    {
      id: "n-2",
      title: "5-Day Streak Active 🔥",
      text: "Outstanding commitment, Kushagra! Complete today's workout to extend.",
      time: "2 hours ago",
      icon: "flame",
      type: "orange"
    },
    {
      id: "n-3",
      title: "Today's Recommended Workout",
      text: "Upper Body Hypertrophy (45m) is ready for your high energy level.",
      time: "8:00 AM",
      icon: "dumbbell",
      type: "neon"
    }
  ]
};

window.FITTRACK_DEFAULT_DATA = FITTRACK_DEFAULT_DATA;
