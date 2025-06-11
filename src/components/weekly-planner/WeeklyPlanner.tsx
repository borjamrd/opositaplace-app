import React from 'react';
import { Day, SelectedSlots } from './types';
import { DAYS_OF_WEEK_ORDERED } from './constants';
import TimeSlotCell from './TimeSlotCell';

interface WeeklyPlannerProps {
  selectedSlots: SelectedSlots;
  onToggleSlot: (day: Day, timeSlot: string) => void;
  timeSlots: string[]; 
}

const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({ selectedSlots, onToggleSlot, timeSlots }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow-md border border-slate-300">
      <div className="grid grid-cols-[minmax(100px,auto)_repeat(7,minmax(80px,1fr))] min-w-[700px]"> {/* Ensures minimum width for usability */}
        <div className="p-2 sm:p-3 bg-slate-200 border-b border-r border-slate-300 sticky top-0 left-0 z-20 text-slate-700 font-semibold text-xs sm:text-sm">Time</div>
        {DAYS_OF_WEEK_ORDERED.map(day => (
          <div key={day} className="p-2 sm:p-3 bg-slate-200 border-b border-slate-300 text-center font-semibold text-slate-700 text-xs sm:text-sm sticky top-0 z-10">
            {day.substring(0,3)} 
          </div>
        ))}

        {timeSlots.map(timeSlot => (
          <React.Fragment key={timeSlot}>
            <div className="p-2 sm:p-3 bg-slate-50 border-r border-b border-slate-300 text-right text-xs sm:text-sm font-medium text-slate-600 sticky left-0 z-10 whitespace-nowrap">
              {timeSlot}
            </div>
            {DAYS_OF_WEEK_ORDERED.map(day => (
              <TimeSlotCell
                key={`${day}-${timeSlot}`}
                day={day}
                timeSlot={timeSlot}
                isSelected={selectedSlots[day]?.[timeSlot] ?? false}
                onToggle={onToggleSlot}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default WeeklyPlanner;