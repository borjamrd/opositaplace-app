import { Day } from './types';

export const DAYS_OF_WEEK_ORDERED: Day[] = [
  Day.Monday,
  Day.Tuesday,
  Day.Wednesday,
  Day.Thursday,
  Day.Friday,
  Day.Saturday,
  Day.Sunday,
];

export const SLOT_DURATION_OPTIONS: number[] = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
export const PLANNER_START_HOUR = 8; // 8 AM
export const PLANNER_END_HOUR = 22; // 10 PM (slots will end at 22:00)

export const formatTime = (hours: number, minutes: number): string => {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const generateTimeSlots = (durationInMinutes: number): string[] => {
  const slots: string[] = [];
  if (durationInMinutes <= 0) return slots;

  let currentHour = PLANNER_START_HOUR;
  let currentMinute = 0;

  // Loop while the start of a new slot is before the PLANNER_END_HOUR
  while (currentHour < PLANNER_END_HOUR) {
    const slotStartHour = currentHour;
    const slotStartMinute = currentMinute;

    let slotEndHour = slotStartHour;
    let slotEndMinute = slotStartMinute + durationInMinutes;

    // Normalize end time (e.g., 8:70 becomes 9:10)
    slotEndHour += Math.floor(slotEndMinute / 60);
    slotEndMinute %= 60;

    // If the calculated end time exceeds PLANNER_END_HOUR, cap it
    if (slotEndHour > PLANNER_END_HOUR || (slotEndHour === PLANNER_END_HOUR && slotEndMinute > 0)) {
      slots.push(
        `${formatTime(slotStartHour, slotStartMinute)} - ${formatTime(PLANNER_END_HOUR, 0)}`
      );
      break; // This is the last slot
    } else {
      slots.push(
        `${formatTime(slotStartHour, slotStartMinute)} - ${formatTime(slotEndHour, slotEndMinute)}`
      );
    }

    // Move to the start of the next slot
    currentHour = slotEndHour;
    currentMinute = slotEndMinute;

    // Safety break for very small durations or unexpected loops
    const maxSlots =
      (PLANNER_END_HOUR - PLANNER_START_HOUR) *
        (60 / Math.max(1, Math.min(...SLOT_DURATION_OPTIONS))) +
      10;
    if (slots.length > maxSlots) {
      console.warn('generateTimeSlots: Exceeded maximum expected slots, breaking loop.', {
        durationInMinutes,
        slotsCount: slots.length,
      });
      break;
    }
  }
  return slots;
};
