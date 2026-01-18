import React, { Fragment } from 'react';
import { Day, SelectedSlots } from './types';
import { DAYS_OF_WEEK_ORDERED } from './constants';
import TimeSlotCell from './TimeSlotCell';

interface WeeklyPlannerProps {
  selectedSlots: SelectedSlots;
  onToggleSlot: (day: Day, timeSlot: string) => void;
  timeSlots: string[];
}

const WeeklyPlanner: React.FC<WeeklyPlannerProps & { compact?: boolean }> = ({
  selectedSlots,
  onToggleSlot,
  timeSlots,
  compact = false,
}) => {
  const cellPadding = compact ? 'p-1' : 'p-2 sm:p-3';
  const fontSize = compact ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm';
  const headerFontSize = compact
    ? 'text-[10px] sm:text-xs font-semibold'
    : 'text-xs sm:text-sm font-semibold';
  const minWidth = compact ? 'min-w-[300px]' : 'min-w-[500px]';

  const gridColsClass = compact
    ? 'grid-cols-[minmax(40px,auto)_repeat(7,minmax(40px,1fr))]'
    : 'grid-cols-[minmax(50px,auto)_repeat(7,minmax(70px,1fr))]';

  return (
    <div
      className={`overflow-x-auto rounded-lg shadow-md border border-border ${
        compact ? 'max-h-[400px]' : 'max-h-[300px]'
      }`}
    >
      <div className={`grid ${gridColsClass} ${minWidth}`}>
        <div
          className={`${cellPadding} bg-background border-b border-r border-border sticky top-0 left-0 z-20 text-primary ${headerFontSize}`}
        >
          Horas
        </div>
        {DAYS_OF_WEEK_ORDERED.map((day) => (
          <div
            key={day}
            className={`${cellPadding} bg-background border-b border-border text-center text-primary ${headerFontSize} sticky top-0 z-10`}
          >
            {day.substring(0, 3)}
          </div>
        ))}

        {timeSlots.map((timeSlot) => (
          <Fragment key={timeSlot}>
            <div
              className={`${cellPadding} bg-background border-r border-b border-border text-right ${fontSize} font-medium text-muted-foreground sticky left-0 z-10 whitespace-nowrap`}
            >
              {timeSlot}
            </div>
            {DAYS_OF_WEEK_ORDERED.map((day) => (
              <TimeSlotCell
                key={`${day}-${timeSlot}`}
                day={day}
                timeSlot={timeSlot}
                isSelected={selectedSlots[day]?.[timeSlot] ?? false}
                onToggle={onToggleSlot}
                compact={compact}
              />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default WeeklyPlanner;
