
import React from 'react';
import { DAYS_OF_WEEK_ORDERED } from './constants';
import { SelectedSlots } from './types';
import { CheckCircle } from 'lucide-react';

interface SelectedSlotsSummaryProps {
  selectedSlots: SelectedSlots;
}

const SelectedSlotsSummary: React.FC<SelectedSlotsSummaryProps> = ({ selectedSlots }) => {
  const hasSelections = DAYS_OF_WEEK_ORDERED.some(day =>
    Object.values(selectedSlots[day] ?? {}).some(isSelected => isSelected)
  );

  return (
    <div>
      <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
       <CheckCircle className="text-sky-500 mr-2" />
        Tus bloques de estudio semanales
      </h3>
      {!hasSelections ? (
        <p className="text-slate-500">No tienes bloques de estudio aún. Haz click en el calendario para agregarlos.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAYS_OF_WEEK_ORDERED.map(day => {
            const daySlots = selectedSlots[day];
            const selectedDaySlots = daySlots ? Object.entries(daySlots)
              .filter(([, isSelected]) => isSelected)
              .map(([timeSlot]) => timeSlot) : [];

            if (selectedDaySlots.length === 0) {
              return null;
            }

            return (
              <div key={day} className="bg-slate-50 p-3 rounded-md">
                <strong className="text-slate-600 block mb-1">{day}:</strong>
                <ul className="space-y-1">
                  {selectedDaySlots.sort().map(slot => ( // Sort slots for consistency
                    <li key={slot} className="text-sky-700 bg-sky-100 px-2 py-1 rounded text-xs">
                      {slot}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SelectedSlotsSummary;
