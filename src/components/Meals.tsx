'use client';

import React, { useState, useEffect } from 'react';
import { contentService } from '../services/api';
import { ShoppingBag, ChevronRight, Apple, Check, BookOpen } from 'lucide-react';

export default function Meals() {
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [weeklyPlan, setWeeklyPlan] = useState<any[]>([]);
  const [selectedDayIdx, setSelectedDayIdx] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1); // 0 = Mon, 6 = Sun
  const [groceryList, setGroceryList] = useState<string[]>([]);
  const [checkedGroceries, setCheckedGroceries] = useState<Record<string, boolean>>({});
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fetchMeals = async () => {
    setLoading(true);
    try {
      const data = await contentService.getWeeklyMeals(selectedWeek);
      setWeeklyPlan(data.meals || []);
      
      // Generate grocery list from ingredients
      const ingredientsSet = new Set<string>();
      (data.meals || []).forEach((meal: any) => {
        if (Array.isArray(meal.ingredients)) {
          meal.ingredients.forEach((ing: string) => ingredientsSet.add(ing.trim()));
        }
      });
      setGroceryList(Array.from(ingredientsSet));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, [selectedWeek]);

  const toggleGrocery = (item: string) => {
    setCheckedGroceries(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  // Filter meals for the selected day of the week
  const dayMeals = weeklyPlan.filter(meal => meal.day_of_week === selectedDayIdx);
  
  // Calculate daily nutrition totals
  const totalCalories = dayMeals.reduce((acc, meal) => acc + (meal.calories || 0), 0);
  const totalCarbs = dayMeals.reduce((acc, meal) => acc + parseFloat(meal.carbs_g || 0), 0).toFixed(1);
  const totalProtein = dayMeals.reduce((acc, meal) => acc + parseFloat(meal.protein_g || 0), 0).toFixed(1);
  const totalFat = dayMeals.reduce((acc, meal) => acc + parseFloat(meal.fat_g || 0), 0).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div>
          <h2 className="font-quicksand text-3xl font-bold tracking-tight text-on-surface">
            PCOS Anti-Inflammatory Meal Plan
          </h2>
          <p className="text-sm text-on-surface-variant/80 font-medium">
            Rotating meal structures designed to regulate insulin levels and reduce inflammation.
          </p>
        </div>
        
        {/* Rotation Week Selector */}
        <div className="flex bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/20 shadow-sm flex-shrink-0">
          {[1, 2].map((weekNum) => (
            <button
              key={weekNum}
              onClick={() => setSelectedWeek(weekNum)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                selectedWeek === weekNum
                  ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Week {weekNum}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-80 bg-white rounded-[2rem] border border-outline-variant/20">
          <span className="text-xs text-outline font-semibold animate-pulse uppercase tracking-wider">Loading meal plans...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Day of the Week Selector Menu (Left / Top column) */}
          <div className="lg:col-span-3 flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 gap-2 select-none custom-scrollbar">
            {days.map((day, idx) => (
              <button
                key={day}
                onClick={() => setSelectedDayIdx(idx)}
                className={`w-32 lg:w-full flex-shrink-0 text-left flex items-center justify-between px-5 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider border transition-all ${
                  selectedDayIdx === idx
                    ? 'bg-primary-fixed text-on-primary-fixed-variant border-primary-fixed/40 scale-[1.02] shadow-sm'
                    : 'bg-white text-on-surface-variant hover:bg-surface-container-low border-outline-variant/30'
                }`}
              >
                <span>{day}</span>
                <ChevronRight className={`hidden lg:block w-4 h-4 transition-transform ${selectedDayIdx === idx ? 'translate-x-1 text-primary' : 'text-outline'}`} />
              </button>
            ))}
          </div>

          {/* Meals Display (Middle Column) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-[2rem] border border-outline-variant/20 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-quicksand text-lg font-bold text-on-surface">{days[selectedDayIdx]} Summary</h3>
                <p className="text-[10px] text-outline font-bold uppercase tracking-widest mt-0.5">Nutritional Totals</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary font-quicksand">{totalCalories}</span>
                <span className="text-[9px] text-outline font-bold uppercase tracking-wider block">Total kcal</span>
              </div>
            </div>

            <div className="space-y-4">
              {dayMeals.map((meal) => (
                <div key={meal.id} className="bg-white p-6 rounded-[2rem] border border-outline-variant/20 shadow-sm space-y-4 hover:border-primary-fixed-dim/40 transition-colors">
                  <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-primary-fixed/40 text-primary">
                        <Apple className="w-4 h-4 fill-primary/10" />
                      </span>
                      <div>
                        <span className="text-[9px] font-bold text-primary uppercase tracking-widest block">{meal.meal_type}</span>
                        <h4 className="text-sm font-bold text-on-surface">{meal.name}</h4>
                      </div>
                    </div>
                    {meal.calories && (
                      <div className="text-right">
                        <span className="text-xs font-bold text-primary block">{meal.calories}</span>
                        <span className="text-[8px] text-outline uppercase tracking-wider block">kcal</span>
                      </div>
                    )}
                  </div>

                  {meal.description && (
                    <p className="text-xs text-on-surface-variant/90 leading-relaxed font-medium">
                      {meal.description}
                    </p>
                  )}

                  {meal.ingredients && meal.ingredients.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-outline uppercase tracking-wider block">Ingredients</span>
                      <div className="flex flex-wrap gap-1.5">
                        {meal.ingredients.map((ing: string, i: number) => (
                          <span key={i} className="text-[10px] bg-surface-container-low text-on-surface-variant px-3 py-1 rounded-xl border border-outline-variant/30 font-medium">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Micro macronutrients stats */}
                  <div className="grid grid-cols-3 gap-2 bg-surface-container-low/40 p-3 rounded-2xl border border-outline-variant/20 text-center text-[10px] font-bold text-outline uppercase tracking-wider">
                    <div>
                      <span className="block text-on-surface-variant font-quicksand text-xs">{meal.protein_g || '0'}g</span>
                      <span>Protein</span>
                    </div>
                    <div>
                      <span className="block text-on-surface-variant font-quicksand text-xs">{meal.carbs_g || '0'}g</span>
                      <span>Carbs</span>
                    </div>
                    <div>
                      <span className="block text-on-surface-variant font-quicksand text-xs">{meal.fat_g || '0'}g</span>
                      <span>Fat</span>
                    </div>
                  </div>
                </div>
              ))}
              {dayMeals.length === 0 && (
                <div className="text-center py-12 bg-white rounded-[2rem] border border-dashed border-outline-variant/40 text-xs text-outline font-medium">
                  No meals set for {days[selectedDayIdx]}.
                </div>
              )}
            </div>
          </div>

          {/* Grocery Shopping List (Right Column) */}
          <div className="lg:col-span-4 bg-white p-6 md:p-8 rounded-[2rem] border border-outline-variant/20 shadow-sm space-y-6 flex flex-col max-h-[80vh]">
            <div className="border-b border-outline-variant/25 pb-4 flex items-center gap-3">
              <span className="p-2 bg-tertiary-fixed text-tertiary rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-quicksand text-lg font-bold">Grocery list</h3>
                <p className="text-[10px] text-outline font-bold uppercase tracking-widest mt-0.5">Week {selectedWeek} Ingredients</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 select-none">
              {groceryList.map((item) => {
                const isChecked = !!checkedGroceries[item];
                return (
                  <div
                    key={item}
                    onClick={() => toggleGrocery(item)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-primary-fixed/20 border-primary-fixed/40 text-outline line-through'
                        : 'bg-surface-container-low/40 border-outline-variant/35 text-on-surface hover:bg-surface-container-low/70'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                      isChecked
                        ? 'bg-primary border-primary text-white'
                        : 'bg-white border-outline-variant/60'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                    </div>
                    <span className="text-xs font-semibold">{item}</span>
                  </div>
                );
              })}
              {groceryList.length === 0 && (
                <div className="text-center py-12 text-xs text-outline font-medium">
                  No ingredients found.
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
