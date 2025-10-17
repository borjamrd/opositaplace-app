import { DAYS_OF_WEEK_ORDERED, PLANNER_END_HOUR } from './constants';
import { SelectedSlots } from './types';

export const parseSlotToMinutes = (
  slotString: string
): { startMinutes: number; endMinutes: number } | null => {
  const parts = slotString.split(' - ');
  if (parts.length !== 2) return null;

  const [startTimeStr, endTimeStr] = parts;

  const parseTime = (timeStr: string): number | null => {
    const timeParts = timeStr.split(':');
    if (timeParts.length !== 2) return null;
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return null;
    return hours * 60 + minutes;
  };

  const startMinutes = parseTime(startTimeStr);
  const endMinutes = parseTime(endTimeStr);

  if (startMinutes === null || endMinutes === null) return null;

  if (endMinutes === 0 && endTimeStr === `${String(PLANNER_END_HOUR).padStart(2, '0')}:00`) {
    return { startMinutes, endMinutes: PLANNER_END_HOUR * 60 };
  }

  return { startMinutes, endMinutes };
};

export const initializeSelectedSlots = (timeSlotsArray: string[]): SelectedSlots => {
  const slots = {} as SelectedSlots;
  DAYS_OF_WEEK_ORDERED.forEach((day) => {
    slots[day] = {};
    timeSlotsArray.forEach((slot) => {
      slots[day][slot] = false;
    });
  });
  return slots;
};
