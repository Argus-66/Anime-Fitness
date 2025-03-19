import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaFire, FaCalendarAlt, FaDragon, FaTrophy } from 'react-icons/fa';

interface ActivityHeatmapProps {
  workouts: Array<{
    date: string;
    name: string;
    duration: number;
    xpGained: number;
  }>;
}

export default function ActivityHeatmap({ workouts }: ActivityHeatmapProps) {
  const [activityData, setActivityData] = useState<Record<string, number>>({});
  const [maxActivity, setMaxActivity] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  useEffect(() => {
    // Process workout data into a format suitable for the heatmap
    const activityMap: Record<string, number> = {};
    let max = 0;
    
    workouts.forEach(workout => {
      const dateStr = new Date(workout.date).toISOString().split('T')[0];
      
      if (activityMap[dateStr]) {
        activityMap[dateStr] += workout.duration;
      } else {
        activityMap[dateStr] = workout.duration;
      }
      
      if (activityMap[dateStr] > max) {
        max = activityMap[dateStr];
      }
    });
    
    setActivityData(activityMap);
    setMaxActivity(max || 60); // Default to 60 if max is 0
  }, [workouts]);
  
  // Get activity level (0-4) based on the workout duration
  const getActivityLevel = (date: string) => {
    if (!activityData[date]) return 0;
    
    const duration = activityData[date];
    if (maxActivity === 0) return 0;
    
    const percentage = duration / maxActivity;
    
    if (percentage < 0.25) return 1;
    if (percentage < 0.5) return 2;
    if (percentage < 0.75) return 3;
    return 4;
  };
  
  // Get color class based on activity level
  const getColorClass = (level: number) => {
    switch (level) {
      case 0: return 'bg-solo-purple/20 border border-solo-purple/30'; // Darker empty cells
      case 1: return 'bg-solo-purple/30 border border-solo-purple/40 shadow-glow-sm';
      case 2: return 'bg-solo-purple/50 border border-solo-purple/60 shadow-glow-sm';
      case 3: return 'bg-solo-accent/70 border border-solo-accent/80 shadow-glow';
      case 4: return 'bg-gradient-to-br from-solo-accent to-solo-purple border border-solo-accent/80 shadow-glow-lg';
      default: return 'bg-solo-purple/20 border border-solo-purple/30'; // Darker empty cells
    }
  };
  
  // Check if a year is a leap year
  const isLeapYear = (year: number) => {
    return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
  };
  
  // Generate all days for the selected year
  const generateYearData = () => {
    const daysInYear = isLeapYear(selectedYear) ? 366 : 365;
    const firstDayOfYear = new Date(selectedYear, 0, 1);
    const yearData = [];
    
    // Create a date for each day of the year
    for (let dayOfYear = 0; dayOfYear < daysInYear; dayOfYear++) {
      const date = new Date(firstDayOfYear);
      date.setDate(firstDayOfYear.getDate() + dayOfYear);
      
      const dateStr = date.toISOString().split('T')[0];
      yearData.push({
        date,
        dateStr,
        dayOfWeek: date.getDay(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        activityLevel: getActivityLevel(dateStr),
        duration: activityData[dateStr] || 0
      });
    }
    
    return yearData;
  };
  
  // Organize days into weeks for the grid
  const organizeIntoWeeks = (yearData: any[]) => {
    const weeks: any[][] = [];
    let currentWeek: any[] = [];
    
    // Fill in days before the first day of the year to complete the week
    const firstDayOfWeek = yearData[0].dayOfWeek;
    if (firstDayOfWeek !== 0) { // If the year doesn't start on Sunday
      for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push(null); // Empty cell
      }
    }
    
    // Add each day to the weeks
    yearData.forEach(day => {
      currentWeek.push(day);
      
      if (day.dayOfWeek === 6) { // Saturday, end of week
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    // Add the last week if it's not complete
    if (currentWeek.length > 0) {
      // Fill in remaining days to complete the week
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  };
  
  // Generate month labels
  const generateMonthLabels = () => {
    const months = [];
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(selectedYear, i, 1);
      months.push({
        name: date.toLocaleString('default', { month: 'short' }),
        index: i
      });
    }
    
    return months;
  };
  
  const yearData = generateYearData();
  const weeks = organizeIntoWeeks(yearData);
  const monthLabels = generateMonthLabels();
  
  // Calculate positions for month labels
  const calculateMonthLabelPositions = () => {
    const positions: Array<{
      name: string;
      index: number;
      position: string;
    }> = [];
    let currentWeek = 0;
    
    monthLabels.forEach((month, index) => {
      // Find the week that contains the first day of this month
      const firstDayOfMonth = new Date(selectedYear, month.index, 1);
      const dayOfYear = Math.floor((firstDayOfMonth.getTime() - new Date(selectedYear, 0, 1).getTime()) / (24 * 60 * 60 * 1000));
      
      // Calculate which week this day falls into
      let weekOfYear = Math.floor(dayOfYear / 7);
      
      // Adjust for the days before the first day of the year
      const firstDayOfWeekInYear = new Date(selectedYear, 0, 1).getDay();
      if (firstDayOfWeekInYear > 0) {
        weekOfYear += 1;
      }
      
      positions.push({
        ...month,
        position: `${(weekOfYear / weeks.length) * 100}%`
      });
    });
    
    return positions;
  };
  
  const monthPositions = calculateMonthLabelPositions();
  
  // Handle year navigation
  const handlePreviousYear = () => {
    setSelectedYear(prev => prev - 1);
  };
  
  const handleNextYear = () => {
    setSelectedYear(prev => prev + 1);
  };
  
  // Calculate streak information
  const calculateCurrentStreak = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    // Check backwards from today
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (activityData[dateStr]) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  const currentStreak = calculateCurrentStreak();
  
  // Calculate total workouts this year
  const calculateTotalWorkoutsThisYear = () => {
    let count = 0;
    const yearStart = new Date(selectedYear, 0, 1).toISOString().split('T')[0];
    const yearEnd = new Date(selectedYear, 11, 31).toISOString().split('T')[0];
    
    Object.keys(activityData).forEach(dateStr => {
      if (dateStr >= yearStart && dateStr <= yearEnd) {
        count++;
      }
    });
    
    return count;
  };
  
  const totalWorkoutsThisYear = calculateTotalWorkoutsThisYear();
  
  return (
    <div className="bg-solo-dark/40 backdrop-blur-lg rounded-lg border border-solo-purple/30 p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <button 
            onClick={handlePreviousYear}
            className="p-1.5 rounded-full bg-solo-purple/20 hover:bg-solo-purple/40 text-solo-light transition-colors duration-200 shadow-glow-sm"
            aria-label="Previous Year"
          >
            <FaChevronLeft size={14} />
          </button>
          
          <span className="text-solo-accent font-medium px-3 py-1.5 bg-solo-purple/10 rounded-md border border-solo-purple/30 shadow-glow-sm">
            {selectedYear}
          </span>
          
          <button 
            onClick={handleNextYear}
            className="p-1.5 rounded-full bg-solo-purple/20 hover:bg-solo-purple/40 text-solo-light transition-colors duration-200 shadow-glow-sm"
            aria-label="Next Year"
          >
            <FaChevronRight size={14} />
          </button>
        </div>
      </div>
      
      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-solo-dark/60 to-solo-purple/20 backdrop-blur-lg rounded-lg border border-solo-purple/30 p-4 flex items-center shadow-glow-sm">
          <div className="bg-gradient-to-br from-red-500 to-solo-accent rounded-full p-2.5 mr-3 shadow-glow">
            <FaFire className="text-white" size={18} />
          </div>
          <div>
            <div className="text-xs text-solo-light/80">Current Streak</div>
            <div className="text-xl font-bold text-white">{currentStreak} days</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-solo-dark/60 to-solo-purple/20 backdrop-blur-lg rounded-lg border border-solo-purple/30 p-4 flex items-center shadow-glow-sm">
          <div className="bg-gradient-to-br from-blue-500 to-solo-purple rounded-full p-2.5 mr-3 shadow-glow">
            <FaCalendarAlt className="text-white" size={18} />
          </div>
          <div>
            <div className="text-xs text-solo-light/80">Workouts in {selectedYear}</div>
            <div className="text-xl font-bold text-white">{totalWorkoutsThisYear}</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-solo-dark/60 to-solo-purple/20 backdrop-blur-lg rounded-lg border border-solo-purple/30 p-4 flex items-center shadow-glow-sm">
          <div className="bg-gradient-to-br from-green-500 to-solo-accent rounded-full p-2.5 mr-3 shadow-glow">
            <FaTrophy className="text-white" size={18} />
          </div>
          <div>
            <div className="text-xs text-solo-light/80">Best Streak</div>
            <div className="text-xl font-bold text-white">{Math.max(currentStreak, 7)} days</div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-solo-dark/40 backdrop-blur-md rounded-lg border border-solo-purple/30 p-4 shadow-glow-sm">
        <div className="min-w-max">
          {/* Month labels */}
          <div className="relative h-5 mb-2 ml-8">
            {monthPositions.map((month, i) => (
              <div 
                key={i} 
                className="absolute text-xs text-solo-light/90 font-medium"
                style={{ left: month.position }}
              >
                {month.name}
              </div>
            ))}
          </div>
          
          {/* Activity grid with day labels */}
          <div className="flex">
            {/* Day labels */}
            <div className="w-8 flex flex-col mr-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-xs text-solo-light/80 h-4 flex items-center justify-center mb-1">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Activity cells */}
            <div className="flex-1">
              <div className="grid grid-flow-col gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={day ? `h-4 w-4 rounded-sm ${getColorClass(day.activityLevel)} cursor-pointer transition-all duration-200 hover:scale-110 hover:z-10 hover:border-solo-accent` : 'h-4 w-4'}
                        title={day ? `${day.date.toLocaleDateString()}: ${day.duration} minutes` : ''}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex justify-end items-center mt-6 text-xs text-solo-light/80">
            <span className="mr-2">Less</span>
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className={`h-3 w-3 rounded-sm ${getColorClass(level)} mx-0.5`}
              />
            ))}
            <span className="ml-2 text-solo-accent font-medium">More</span>
          </div>
        </div>
      </div>
      
      {/* Motivational message */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center space-x-2 bg-solo-dark/40 backdrop-blur-md px-4 py-2 rounded-lg border border-solo-purple/30 shadow-glow-sm">
          <FaDragon className="text-solo-accent" />
          <span className="text-solo-light/90 italic text-sm">
            {totalWorkoutsThisYear > 0 
              ? "Your consistency is building your legend. Keep going!" 
              : "Start your journey today. Every workout counts!"}
          </span>
        </div>
      </div>
    </div>
  );
} 