import React from 'react';
import { Day } from './types';

interface TimeSlotCellProps {
  day: Day;
  timeSlot: string;
  isSelected: boolean;
  onToggle: (day: Day, timeSlot: string) => void;
}

const TimeSlotCell: React.FC<TimeSlotCellProps> = ({ day, timeSlot, isSelected, onToggle }) => {
  const baseClasses =
    "border-b border-r border-slate-300 cursor-pointer min-h-[40px] sm:min-h-[50px] flex items-center justify-center text-xs transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:z-5";
  const selectedClasses =
    "bg-primary hover:bg-secondary text-white";
  const unselectedClasses =
    "bg-[var(--background)] hover:bg-secondary text-slate-700";

  return (
    <div
      className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
      onClick={() => onToggle(day, timeSlot)}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onToggle(day, timeSlot);
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Toggle study slot for ${day}, ${timeSlot}. Currently ${isSelected ? 'selected' : 'not selected'}.`}
    >
      {isSelected && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-4 h-4 sm:w-5 sm:h-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      )}
    </div>
  );
};

export default TimeSlotCell;
