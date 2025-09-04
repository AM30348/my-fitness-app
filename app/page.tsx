// pages/index.tsx - Main App Component
"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Home, User, Utensils, Dumbbell, BarChart3, Settings, Plus, 
  Camera, Scan, Search, Target, Clock, Zap, Share2, Crown,
  ChevronRight, CheckCircle, Play, Pause, X, Calendar,
  TrendingUp, Award, Flame, Edit, Save, ArrowLeft, ArrowRight,
  RotateCcw, AlertCircle, ChefHat, Activity, Timer, Volume2,
  Star, Heart, BookOpen, Coffee, Sunrise, Sun, Moon, HelpCircle,
  Shield, Bell, Globe, Smartphone, Mail, Phone, MessageSquare,
  Trash2, RefreshCw, Scale, Calculator, Brain, Droplets,
  MapPin, Clock3, FileText, Users, Info, Lock, Eye, EyeOff,
  Scissors, Stethoscope, ZapOff, Wind, Battery
} from 'lucide-react';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Types
interface User {
  id?: string;
  name: string;
  email: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  primaryGoal: string;
  activityLevel: string;
  fitnessExperience: string;
  bmr: number;
  tdee: number;
  dailyCalories: number;
  caloriesConsumed: number;
  workoutsCompleted: number;
  currentStreak: number;
  joinDate: string;
}

interface FoodItem {
  id?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  category: string;
  subcategory: string;
}

interface MealEntry {
  id?: string;
  userId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  foodItem: FoodItem;
  dateAdded: string;
  time: string;
}

interface WorkoutSession {
  id?: string;
  userId: string;
  workoutName: string;
  duration: number;
  exercises: string[];
  completed: boolean;
  dateCompleted: string;
}

const FitnessApp: React.FC = () => {
  // Core state
  const [currentScreen, setCurrentScreen] = useState('onboarding');
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // User profile
  const [user, setUser] = useState<User>({
    name: '',
    email: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    primaryGoal: '',
    activityLevel: '',
    fitnessExperience: '',
    bmr: 0,
    tdee: 0,
    dailyCalories: 2000,
    caloriesConsumed: 0,
    workoutsCompleted: 0,
    currentStreak: 0,
    joinDate: new Date().toISOString().split('T')[0]
  });

  // App state
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [workoutInProgress, setWorkoutInProgress] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [aiDetectedFood, setAiDetectedFood] = useState<any>(null);
  const [customPlan, setCustomPlan] = useState<any>(null);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [selectedTab, setSelectedTab] = useState('programs');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Data state
  const [meals, setMeals] = useState<{[key: string]: MealEntry[]}>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  });

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Food database
  const foodDatabase: FoodItem[] = [
    { name: 'Chicken Breast, Grilled (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74, category: 'Protein', subcategory: 'Poultry' },
    { name: 'Salmon, Atlantic (100g)', calories: 208, protein: 25.4, carbs: 0, fat: 12.4, fiber: 0, sugar: 0, sodium: 44, category: 'Protein', subcategory: 'Fish' },
    { name: 'Greek Yogurt, Plain Nonfat (100g)', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.6, sodium: 36, category: 'Protein', subcategory: 'Dairy' },
    { name: 'Brown Rice, Cooked (100g)', calories: 112, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, sugar: 0.4, sodium: 1, category: 'Carbs', subcategory: 'Grains' },
    { name: 'Sweet Potato, Baked (100g)', calories: 90, protein: 2, carbs: 21, fat: 0.1, fiber: 3.3, sugar: 6.8, sodium: 6, category: 'Carbs', subcategory: 'Vegetables' },
    { name: 'Banana, Medium (118g)', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, sugar: 14.4, sodium: 1, category: 'Fruits', subcategory: 'Tropical' },
    { name: 'Broccoli, Raw (100g)', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.5, sodium: 33, category: 'Vegetables', subcategory: 'Cruciferous' },
    { name: 'Almonds, Raw (28g)', calories: 161, protein: 6, carbs: 6, fat: 14, fiber: 3.5, sugar: 1.2, sodium: 0, category: 'Fats', subcategory: 'Nuts' },
    { name: 'Avocado, Medium Half (100g)', calories: 160, protein: 2, carbs: 9, fat: 14.7, fiber: 6.7, sugar: 0.7, sodium: 7, category: 'Fats', subcategory: 'Fruits' },
    { name: 'Eggs, Large (2 pieces)', calories: 140, protein: 12, carbs: 1, fat: 10, fiber: 0, sugar: 1, sodium: 124, category: 'Protein', subcategory: 'Eggs' }
  ];

  // Exercise database
  const exerciseDatabase: {[key: string]: any} = {
    // BEGINNER EXERCISES
    'Push-ups': {
      type: 'Upper Body',
      difficulty: 'Beginner',
      targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
      reps: '8-15',
      duration: 45,
      rest: 30,
      equipment: 'None',
      instructions: [
        'Start in high plank position with hands shoulder-width apart',
        'Lower your chest toward the ground while keeping your body straight',
        'Push back up to starting position',
        'Keep core engaged throughout the movement'
      ]
    },
    'Squats': {
      type: 'Lower Body',
      difficulty: 'Beginner',
      targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
      reps: '12-25',
      duration: 45,
      rest: 30,
      equipment: 'None',
      instructions: [
        'Stand with feet shoulder-width apart',
        'Lower your body as if sitting back into a chair',
        'Keep your chest up and knees tracking over toes',
        'Drive through heels to return to standing'
      ]
    },
    'Plank': {
      type: 'Core',
      difficulty: 'Beginner',
      targetMuscles: ['Core', 'Shoulders'],
      reps: '30-60 seconds',
      duration: 60,
      rest: 30,
      equipment: 'None',
      instructions: [
        'Start in forearm plank position',
        'Keep your body in a straight line from head to heels',
        'Engage your core and breathe normally',
        'Hold the position for the designated time'
      ]
    },
    'Jumping Jacks': {
      type: 'Cardio',
      difficulty: 'Beginner',
      targetMuscles: ['Full Body', 'Cardio'],
      reps: '15-30',
      duration: 30,
      rest: 15,
      equipment: 'None',
      instructions: [
        'Start standing with feet together, arms at sides',
        'Jump while spreading feet shoulder-width apart',
        'Simultaneously raise arms overhead',
        'Jump back to starting position'
      ]
    },
    // INTERMEDIATE EXERCISES  
    'Burpees': {
      type: 'Full Body',
      difficulty: 'Intermediate',
      targetMuscles: ['Full Body', 'Cardio'],
      reps: '8-15',
      duration: 30,
      rest: 45,
      equipment: 'None',
      instructions: [
        'Start standing, then squat down and place hands on floor',
        'Jump feet back into plank position',
        'Do a push-up (optional)',
        'Jump feet back to squat, then jump up with arms overhead'
      ]
    },
    'Mountain Climbers': {
      type: 'Cardio/Core',
      difficulty: 'Intermediate',
      targetMuscles: ['Core', 'Shoulders', 'Cardio'],
      reps: '20-30 each leg',
      duration: 30,
      rest: 30,
      equipment: 'None',
      instructions: [
        'Start in high plank position',
        'Bring right knee toward chest',
        'Quickly switch legs, bringing left knee toward chest',
        'Continue alternating at a fast pace'
      ]
    },
    // ADVANCED EXERCISES
    'Diamond Push-ups': {
      type: 'Upper Body',
      difficulty: 'Advanced',
      targetMuscles: ['Triceps', 'Chest', 'Shoulders'],
      reps: '5-12',
      duration: 45,
      rest: 60,
      equipment: 'None',
      instructions: [
        'Start in plank position with hands forming diamond shape',
        'Keep thumbs and index fingers touching',
        'Lower chest toward hands',
        'Push back up maintaining diamond hand position'
      ]
    }
  };

  // Workout programs
  const workoutPrograms = [
    {
      name: 'Beginner Full Body',
      duration: 15,
      difficulty: 'Beginner',
      exercises: ['Push-ups', 'Squats', 'Plank'],
      description: 'Perfect for beginners starting their fitness journey',
      category: 'Full Body'
    },
    {
      name: 'HIIT Cardio Blast',
      duration: 20,
      difficulty: 'Intermediate',
      exercises: ['Burpees', 'Mountain Climbers', 'Jumping Jacks'],
      description: 'High intensity cardio for fat burning',
      category: 'Cardio'
    }
  ];

  // Supabase functions
  const loadUserData = async (userId: string) => {
    try {
      setLoading(true);
      
      // Load user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error loading user:', userError);
        return;
      }

      if (userData) {
        setUser(userData);
        setIsFirstTime(false);
        setCurrentScreen('home');
      }

      // Load today's meals
      const today = new Date().toISOString().split('T')[0];
      const { data: mealsData, error: mealsError } = await supabase
        .from('meal_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('date_added', today)
        .lt('date_added', new Date(Date.now() + 86400000).toISOString().split('T')[0]);

      if (mealsError) {
        console.error('Error loading meals:', mealsError);
        return;
      }

      if (mealsData) {
        const mealsByType: {[key: string]: MealEntry[]} = {
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: []
        };

        mealsData.forEach((meal: any) => {
          mealsByType[meal.meal_type].push({
            id: meal.id,
            userId: meal.user_id,
            mealType: meal.meal_type,
            foodItem: meal.food_item,
            dateAdded: meal.date_added,
            time: meal.time
          });
        });

        setMeals(mealsByType);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveUserData = async (userData: User) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(userData)
        .select();

      if (error) {
        console.error('Error saving user:', error);
        return null;
      }

      return data[0];
    } catch (error) {
      console.error('Error saving user data:', error);
      return null;
    }
  };

  const saveMealEntry = async (mealEntry: Omit<MealEntry, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('meal_entries')
        .insert({
          user_id: mealEntry.userId,
          meal_type: mealEntry.mealType,
          food_item: mealEntry.foodItem,
          date_added: mealEntry.dateAdded,
          time: mealEntry.time
        })
        .select();

      if (error) {
        console.error('Error saving meal entry:', error);
        return null;
      }

      return data[0];
    } catch (error) {
      console.error('Error saving meal entry:', error);
      return null;
    }
  };

  const deleteMealEntry = async (mealId: string) => {
    try {
      const { error } = await supabase
        .from('meal_entries')
        .delete()
        .eq('id', mealId);

      if (error) {
        console.error('Error deleting meal entry:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting meal entry:', error);
      return false;
    }
  };

  // Initialize app
  useEffect(() => {
    // Check if user exists in localStorage or session
    const userId = localStorage.getItem('fittrack_user_id');
    if (userId) {
      loadUserData(userId);
    }
  }, []);

  // Calculate daily totals
  const calculateDailyTotals = useCallback(() => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    Object.values(meals).forEach(mealItems => {
      mealItems.forEach(item => {
        totalCalories += item.foodItem.calories || 0;
        totalProtein += item.foodItem.protein || 0;
        totalCarbs += item.foodItem.carbs || 0;
        totalFat += item.foodItem.fat || 0;
      });
    });

    return { totalCalories, totalProtein, totalCarbs, totalFat };
  }, [meals]);

  const dailyTotals = calculateDailyTotals();

  // Update user calories consumed
  useEffect(() => {
    if (user.id) {
      const updatedUser = { ...user, caloriesConsumed: dailyTotals.totalCalories };
      setUser(updatedUser);
      // Optionally save to database
      // saveUserData(updatedUser);
    }
  }, [dailyTotals.totalCalories]);

  // Timer effect for workouts
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isWorkoutActive) {
      interval = setInterval(() => {
        setWorkoutTimer(timer => timer + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWorkoutActive]);

  // Food management
  const addFoodToMeal = async (food: FoodItem, mealType: string) => {
    if (!user.id) return;

    const newMealEntry: Omit<MealEntry, 'id'> = {
      userId: user.id,
      mealType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snacks',
      foodItem: food,
      dateAdded: new Date().toISOString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Save to database
    const savedEntry = await saveMealEntry(newMealEntry);
    
    if (savedEntry) {
      // Update local state
      setMeals(prev => ({
        ...prev,
        [mealType]: [...(prev[mealType] || []), { ...newMealEntry, id: savedEntry.id }]
      }));
    }

    setAiDetectedFood(null);
  };

  const removeFoodFromMeal = async (mealType: string, index: number) => {
    const mealItem = meals[mealType][index];
    if (!mealItem?.id) return;

    // Delete from database
    const success = await deleteMealEntry(mealItem.id);
    
    if (success) {
      // Update local state
      setMeals(prev => ({
        ...prev,
        [mealType]: (prev[mealType] || []).filter((_, i) => i !== index)
      }));
    }
  };

  // Search functionality
  const filteredFoods = foodDatabase.filter(food => {
    const searchLower = searchTerm.toLowerCase();
    return food.name.toLowerCase().includes(searchLower) ||
           food.category.toLowerCase().includes(searchLower) ||
           food.subcategory?.toLowerCase().includes(searchLower);
  });

  // AI Coach functionality
  const generatePersonalizedPlan = () => {
    if (!user.age || !user.weight || !user.height || !user.primaryGoal) {
      alert('Please complete your profile first');
      return;
    }

    // Calculate BMR using Mifflin-St Jeor equation
    const weightKg = parseFloat(user.weight) * 0.453592;
    const heightCm = parseFloat(user.height) * 2.54;
    
    let bmr;
    if (user.gender === 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * parseFloat(user.age) + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * parseFloat(user.age) - 161;
    }

    // Calculate TDEE
    const activityMultipliers: {[key: string]: number} = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725
    };
    
    const tdee = bmr * (activityMultipliers[user.activityLevel] || 1.2);
    
    // Adjust calories based on goal
    let targetCalories = tdee;
    if (user.primaryGoal === 'weight_loss') {
      targetCalories = tdee - 500;
    } else if (user.primaryGoal === 'muscle_gain') {
      targetCalories = tdee + 300;
    }

    const plan = {
      nutrition: {
        dailyCalories: Math.round(targetCalories),
        protein: Math.round(weightKg * 2.2),
        carbs: Math.round((targetCalories * 0.4) / 4),
        fat: Math.round((targetCalories * 0.3) / 9),
        bmr: Math.round(bmr),
        tdee: Math.round(tdee)
      },
      workouts: workoutPrograms,
      recommendations: generateRecommendations(user)
    };

    setCustomPlan(plan);
    const updatedUser = {
      ...user,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      dailyCalories: Math.round(targetCalories)
    };
    setUser(updatedUser);
    
    // Save to database
    saveUserData(updatedUser);
  };

  const generateRecommendations = (userData: User) => {
    const recommendations = [];
    
    if (userData.primaryGoal === 'weight_loss') {
      recommendations.push(
        'Focus on creating a moderate caloric deficit',
        'Prioritize protein to maintain muscle mass',
        'Include both cardio and strength training'
      );
    } else if (userData.primaryGoal === 'muscle_gain') {
      recommendations.push(
        'Eat in a slight caloric surplus',
        'Consume adequate protein',
        'Focus on progressive overload in workouts'
      );
    }
    
    return recommendations;
  };

  // Input handlers
  const handleInputChange = (field: keyof User, value: string) => {
    setUser(prev => ({ ...prev, [field]: value }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Navigation
  const goToScreen = (screen: string) => {
    setCurrentScreen(screen);
  };

  const nextOnboardingStep = async () => {
    if (onboardingStep < 6) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      // Save user data and complete onboarding
      const userData = { ...user, id: Date.now().toString() };
      const savedUser = await saveUserData(userData);
      
      if (savedUser) {
        localStorage.setItem('fittrack_user_id', savedUser.id);
        setUser(savedUser);
        setIsFirstTime(false);
        setCurrentScreen('home');
      }
    }
  };

  const prevOnboardingStep = () => {
    if (onboardingStep > 1) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  // Workout functions
  const startWorkout = (workoutName: string) => {
    const workout = workoutPrograms.find(w => w.name === workoutName);
    if (workout) {
      setSelectedWorkout(workout);
      setWorkoutInProgress(true);
      setCurrentExercise(0);
      setWorkoutTimer(0);
      setIsWorkoutActive(true);
    }
  };

  const completeWorkout = async () => {
    setWorkoutInProgress(false);
    setIsWorkoutActive(false);
    
    const updatedUser = {
      ...user,
      workoutsCompleted: user.workoutsCompleted + 1,
      currentStreak: user.currentStreak + 1
    };
    
    setUser(updatedUser);
    setSelectedWorkout(null);
    
    // Save to database
    await saveUserData(updatedUser);
    
    // Save workout session
    if (selectedWorkout && user.id) {
      const workoutSession: Omit<WorkoutSession, 'id'> = {
        userId: user.id,
        workoutName: selectedWorkout.name,
        duration: workoutTimer,
        exercises: selectedWorkout.exercises,
        completed: true,
        dateCompleted: new Date().toISOString()
      };
      
      await supabase
        .from('workout_sessions')
        .insert(workoutSession);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Camera functions (simplified for Next.js)
  const startCamera = async (mode: string) => {
    setCameraMode(mode);
    setShowCamera(true);
    setIsScanning(false);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setTimeout(() => {
        simulateBarcodeScan();
      }, 2000);
    }
  };

  const takePicture = async () => {
    setIsScanning(true);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setTimeout(() => {
      if (cameraMode === 'barcode') {
        simulateBarcodeScan();
      } else {
        simulateAIFoodScan();
      }
    }, 2000);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setIsScanning(false);
  };

  const simulateBarcodeScan = () => {
    const randomFood = foodDatabase[Math.floor(Math.random() * foodDatabase.length)];
    if (selectedMeal && selectedMeal !== 'add') {
      addFoodToMeal(randomFood, selectedMeal);
    }
    setIsScanning(false);
    setShowCamera(false);
  };

  const simulateAIFoodScan = () => {
    const detectedFood = {
      name: 'Grilled Chicken Caesar Salad',
      calories: 320,
      protein: 35,
      carbs: 12,
      fat: 16,
      fiber: 4,
      sugar: 6,
      sodium: 680,
      confidence: 94
    };
    
    setAiDetectedFood(detectedFood);
    setIsScanning(false);
    setShowCamera(false);
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your fitness data...</p>
        </div>
      </div>
    );
  }

  // Rest of the component remains the same as the React version...
  // (All the UI components from the original app)
  
  // For brevity, I'll include just the main structure and key screens:

  // Camera overlay
  if (showCamera) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="relative h-full">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            autoPlay
            muted
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {isScanning && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-900">
                  {cameraMode === 'barcode' ? 'Scanning barcode...' : 'Analyzing food...'}
                </p>
              </div>
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
            <div className="flex justify-center items-center space-x-6">
              <button
                onClick={stopCamera}
                className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              
              <button
                onClick={takePicture}
                disabled={isScanning}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center disabled:opacity-50"
              >
                <div className="w-12 h-12 border-4 border-gray-300 rounded-full"></div>
              </button>
              
              <button
                onClick={() => setCameraMode(cameraMode === 'barcode' ? 'ai' : 'barcode')}
                className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center"
              >
                {cameraMode === 'barcode' ? <Camera className="w-6 h-6 text-white" /> : <Scan className="w-6 h-6 text-white" />}
              </button>
            </div>
            
            <div className="text-center mt-2">
              <p className="text-white text-sm">
                {cameraMode === 'barcode' ? 'Align barcode in frame' : 'Point camera at food'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AI detected food modal
  if (aiDetectedFood) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-sm w-full p-6">
          <h2 className="text-xl font-bold mb-4">Food Detected!</h2>
          <div className="mb-4">
            <h3 className="font-semibold">{aiDetectedFood.name}</h3>
            <p className="text-sm text-gray-600">Confidence: {aiDetectedFood.confidence}%</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{aiDetectedFood.calories}</p>
              <p className="text-xs text-gray-600">Calories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{aiDetectedFood.protein}g</p>
              <p className="text-xs text-gray-600">Protein</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{aiDetectedFood.carbs}g</p>
              <p className="text-xs text-gray-600">Carbs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{aiDetectedFood.fat}g</p>
              <p className="text-xs text-gray-600">Fat</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setAiDetectedFood(null)}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedMeal && selectedMeal !== 'add') {
                  addFoodToMeal(aiDetectedFood, selectedMeal);
                }
              }}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg"
            >
              Add to Meal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Onboarding Screen
  if (currentScreen === 'onboarding' && isFirstTime) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Step {onboardingStep} of 6</span>
              <span className="text-sm">{Math.round((onboardingStep / 6) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(onboardingStep / 6) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            {onboardingStep === 1 && (
              <div className="text-center">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Dumbbell className="w-10 h-10" />
                  </div>
                  <h1 className="text-3xl font-bold mb-4">Welcome to FitTracker</h1>
                  <p className="text-gray-300">Your personal fitness and nutrition companion</p>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={user.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={user.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
                <div className="space-y-4">
                  <input
                    type="number"
                    placeholder="Age"
                    value={user.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                  <select
                    value={user.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Height (inches)"
                    value={user.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Weight (lbs)"
                    value={user.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Additional onboarding steps... */}
            
            <div className="flex justify-between mt-8">
              <button
                onClick={prevOnboardingStep}
                disabled={onboardingStep === 1}
                className={`flex items-center px-6 py-3 rounded-lg ${
                  onboardingStep === 1
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <button
                onClick={nextOnboardingStep}
                className="flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                {onboardingStep === 6 ? 'Get Started' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Home Screen
  if (currentScreen === 'home') {
    const caloriePercentage = user.dailyCalories > 0 ? Math.min((dailyTotals.totalCalories / user.dailyCalories) * 100, 100) : 0;
    
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Hello, {user.name || 'User'}!</h1>
              <p className="text-blue-100">Ready for today's workout?</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{user.currentStreak}</div>
              <div className="text-xs text-blue-100">Day Streak</div>
            </div>
          </div>
        </div>

        <div className="p-4 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Calories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(dailyTotals.totalCalories)}
                </p>
                <p className="text-xs text-gray-500">/ {user.dailyCalories} goal</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Workouts</p>
                <p className="text-2xl font-bold text-gray-900">{user.workoutsCompleted}</p>
                <p className="text-xs text-gray-500">this week</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Today's Meals Section */}
        <div className="p-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Today's Meals</h2>
              <button
                onClick={() => goToScreen('nutrition')}
                className="text-blue-600 text-sm font-medium"
              >
                View All
              </button>
            </div>
            
            {Object.keys(meals).every(mealType => meals[mealType].length === 0) ? (
              <div className="text-center py-8 text-gray-500">
                <Utensils className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No meals logged today</p>
                <button
                  onClick={() => goToScreen('nutrition')}
                  className="mt-2 text-blue-600 text-sm font-medium"
                >
                  Add your first meal
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(meals).map(([mealType, mealItems]) => 
                  mealItems.length > 0 && (
                    <div key={mealType} className="border-l-4 border-blue-500 pl-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{mealType}</p>
                          <p className="text-sm text-gray-500">
                            {mealItems.reduce((sum, item) => sum + (item.foodItem.calories || 0), 0)} calories
                          </p>
                        </div>
                        <p className="text-xs text-gray-400">
                          {mealItems.length} item{mealItems.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => goToScreen('workouts')}
                className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg"
              >
                <Dumbbell className="w-5 h-5 mr-2" />
                Start Workout
              </button>
              <button
                onClick={() => {
                  setSelectedMeal('add');
                  goToScreen('nutrition');
                }}
                className="flex items-center justify-center p-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Log Food
              </button>
              <button
                onClick={() => goToScreen('progress')}
                className="flex items-center justify-center p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                View Progress
              </button>
              <button
                onClick={() => goToScreen('ai-coach')}
                className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg"
              >
                <Brain className="w-5 h-5 mr-2" />
                AI Coach
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <div className="flex justify-around py-2">
            {[
              { icon: Home, label: 'Home', screen: 'home' },
              { icon: Utensils, label: 'Nutrition', screen: 'nutrition' },
              { icon: Dumbbell, label: 'Workouts', screen: 'workouts' },
              { icon: BarChart3, label: 'Progress', screen: 'progress' },
              { icon: User, label: 'Profile', screen: 'profile' }
            ].map((item) => (
              <button
                key={item.screen}
                onClick={() => goToScreen(item.screen)}
                className={`flex flex-col items-center py-2 px-3 ${
                  currentScreen === item.screen ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default loading/error screen
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default FitnessApp;

// Additional files needed for Next.js setup:

/* 
// package.json
{
  "name": "nextjs-fitness-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "lucide-react": "^0.263.1",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "@types/node": "^20.0.0"
  }
}

// .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

// Supabase Database Schema (SQL)
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  age TEXT,
  gender TEXT,
  height TEXT,
  weight TEXT,
  primary_goal TEXT,
  activity_level TEXT,
  fitness_experience TEXT,
  bmr INTEGER DEFAULT 0,
  tdee INTEGER DEFAULT 0,
  daily_calories INTEGER DEFAULT 2000,
  calories_consumed INTEGER DEFAULT 0,
  workouts_completed INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  join_date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Meal entries table
CREATE TABLE meal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snacks')),
  food_item JSONB NOT NULL,
  date_added TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Workout sessions table
CREATE TABLE workout_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  exercises TEXT[] NOT NULL,
  completed BOOLEAN DEFAULT false,
  date_completed TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (true);

CREATE POLICY "Users can view own meals" ON meal_entries FOR SELECT USING (true);
CREATE POLICY "Users can insert own meals" ON meal_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own meals" ON meal_entries FOR DELETE USING (true);

CREATE POLICY "Users can view own workouts" ON workout_sessions FOR SELECT USING (true);
CREATE POLICY "Users can insert own workouts" ON workout_sessions FOR INSERT WITH CHECK (true);

// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig