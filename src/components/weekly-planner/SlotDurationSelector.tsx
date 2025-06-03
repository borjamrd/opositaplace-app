import React from 'react';
import { SLOT_DURATION_OPTIONS } from './constants';

interface SlotDurationSelectorProps {
  currentDuration: number;
  onDurationChange: (duration: number) => void;
}

const SlotDurationSelector: React.FC<SlotDurationSelectorProps> = ({ currentDuration, onDurationChange }) => {
  return (
    <div className="mb-6 flex items-center justify-center sm:justify-start">
      <label htmlFor="slot-duration" className="mr-3 text-slate-700 font-medium text-sm sm:text-base">
        Slot Duration:
      </label>
      <select
        id="slot-duration"
        value={currentDuration}
        onChange={(e) => onDurationChange(parseInt(e.target.value, 10))}
        className="p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-700 bg-white text-sm sm:text-base"
        aria-label="Select study slot duration"
      >
        {SLOT_DURATION_OPTIONS.map(duration => (
          <option key={duration} value={duration}>
            {duration} minutes
          </option>
        ))}
      </select>
    </div>
  );
};

export default SlotDurationSelector;