import React, { Fragment } from 'react';
import { Day, SelectedSlots } from './types';
import { DAYS_OF_WEEK_ORDERED } from './constants';
import TimeSlotCell from './TimeSlotCell';

interface WeeklyPlannerProps {
  selectedSlots: SelectedSlots;
  onToggleSlot: (day: Day, timeSlot: string) => void;
  timeSlots: string[];
}

const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({
  selectedSlots,
  onToggleSlot,
  timeSlots,
}) => {
  return (
    <div className="overflow-x-auto max-h-[400px] rounded-lg shadow-md border border-border">
      <div className="grid grid-cols-[minmax(100px,auto)_repeat(7,minmax(80px,1fr))] min-w-[600px]">
        <div className="p-2 bg-background sm:p-3 border-b border-r border-border sticky top-0 left-0 z-20 text-primary font-semibold text-xs sm:text-sm">
          Horas
        </div>
        {DAYS_OF_WEEK_ORDERED.map((day) => (
          <div
            key={day}
            className="p-2 bg-background sm:p-3 border-b border-border text-center font-semibold text-primary text-xs sm:text-sm sticky top-0 z-10"
          >
            {day.substring(0, 3)}
          </div>
        ))}

        {timeSlots.map((timeSlot) => (
          <Fragment key={timeSlot}>
            <div className="p-2 sm:p-3 bg-background border-r border-b border-border text-right text-xs sm:text-sm font-medium text-muted-foreground sticky left-0 z-10 whitespace-nowrap">
              {timeSlot}
            </div>
            {DAYS_OF_WEEK_ORDERED.map((day) => (
              <TimeSlotCell
                key={`${day}-${timeSlot}`}
                day={day}
                timeSlot={timeSlot}
                isSelected={selectedSlots[day]?.[timeSlot] ?? false}
                onToggle={onToggleSlot}
              />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default WeeklyPlanner;
