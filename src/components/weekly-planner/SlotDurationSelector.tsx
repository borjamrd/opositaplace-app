import React from 'react';
import { SLOT_DURATION_OPTIONS } from './constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface SlotDurationSelectorProps {
    currentDuration: number;
    onDurationChange: (duration: number) => void;
}

const SlotDurationSelector: React.FC<SlotDurationSelectorProps> = ({
    currentDuration,
    onDurationChange,
}) => {
    return (
        <div className="mb-6 flex items-center justify-center sm:justify-start">
            <label
                htmlFor="slot-duration"
                className="mr-3 font-medium text-sm sm:text-base"
                style={{ color: 'var(--primary)' }}
            >
                Duración del espacio de estudio:
            </label>
            <Select
                value={currentDuration.toString()}
                onValueChange={(value) => onDurationChange(parseInt(value, 10))}
            >
                <SelectTrigger
                    className="w-[180px] border"
                    style={{
                        backgroundColor: 'var(--background)',
                        color: 'var(--primary)',
                        borderColor: 'var(--accent)',
                    }}
                >
                    <SelectValue placeholder="Selecciona la duración" />
                </SelectTrigger>
                <SelectContent
                    style={{
                        backgroundColor: 'var(--background)',
                        color: 'var(--primary)',
                    }}
                >
                    {SLOT_DURATION_OPTIONS.map((duration) => (
                        <SelectItem
                            key={duration}
                            value={duration.toString()}
                            style={{ color: 'var(--primary)' }}
                        >
                            {duration} minutos
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default SlotDurationSelector;
