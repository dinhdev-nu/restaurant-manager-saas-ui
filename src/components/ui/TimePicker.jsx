import React, { Fragment, useState, useRef, useEffect } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ClockIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import './TimePicker.css';

/**
 * TimePicker Component - Reusable time input with dropdown selection
 * 
 * @param {string} value - Current time value in HH:MM format
 * @param {function} onChange - Callback when time changes
 * @param {string} label - Label text for the input
 * @param {string} error - Error message to display
 * @param {string} type - Type of time picker ('opening' | 'closing') - affects indicator color
 * 
 * @example
 * <TimePicker
 *   label="Giờ mở cửa"
 *   value="08:00"
 *   onChange={(time) => setOpeningTime(time)}
 *   error={errors.openingTime}
 *   type="opening"
 * />
 */
const TimePicker = ({ value, onChange, label, error, type = 'opening' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Generate hours (00-23)
    const hours = Array.from({ length: 24 }, (_, i) => ({
        value: i.toString().padStart(2, '0'),
        label: i.toString().padStart(2, '0'),
        display: `${i.toString().padStart(2, '0')} giờ`
    }));

    // Generate minutes (00-59)
    const minutes = Array.from({ length: 60 }, (_, i) => ({
        value: i.toString().padStart(2, '0'),
        label: i.toString().padStart(2, '0'),
        display: `${i.toString().padStart(2, '0')} phút`
    }));

    // Parse current value
    const [selectedHour, setSelectedHour] = useState(value?.split(':')[0] || '08');
    const [selectedMinute, setSelectedMinute] = useState(value?.split(':')[1] || '00');

    // Sync with external value changes only
    useEffect(() => {
        if (value) {
            const [h, m] = value.split(':');
            if (h !== selectedHour || m !== selectedMinute) {
                setSelectedHour(h);
                setSelectedMinute(m);
            }
        }
    }, [value]);

    // Handle hour change
    const handleHourChange = (hour) => {
        setSelectedHour(hour);
        onChange(`${hour}:${selectedMinute}`);
    };

    // Handle minute change
    const handleMinuteChange = (minute) => {
        setSelectedMinute(minute);
        onChange(`${selectedHour}:${minute}`);
    };

    const displayTime = value ? value : '--:--';
    const indicatorColor = type === 'opening' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600';

    return (
        <div ref={containerRef}>
            <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <ClockIcon className="h-3.5 w-3.5 text-gray-500" />
                {label}
            </label>

            <Listbox>
                {({ open }) => (
                    <div className="relative">
                        <Listbox.Button
                            onClick={() => setIsOpen(!isOpen)}
                            className="relative w-full px-3 py-2.5 text-left bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                        >
                            {/* Indicator Icon */}
                            <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${indicatorColor} flex items-center justify-center`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${type === 'opening' ? 'bg-green-600' : 'bg-red-600'}`}></div>
                            </div>

                            {/* Display Time */}
                            <span className={`block pl-6 text-sm font-mono ${value ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
                                {displayTime}
                            </span>

                            {/* Chevron Icon */}
                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <ChevronUpDownIcon className="h-4 w-4 text-gray-400" />
                            </span>
                        </Listbox.Button>

                        <Transition
                            show={isOpen}
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <div className="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                                <div className="p-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Hour Selector */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2 text-center">
                                                Giờ
                                            </label>
                                            <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50/50 custom-scrollbar">
                                                {hours.map((hour) => (
                                                    <button
                                                        key={hour.value}
                                                        type="button"
                                                        onClick={() => handleHourChange(hour.value)}
                                                        className={`w-full px-3 py-2.5 text-sm text-center transition-all ${selectedHour === hour.value
                                                            ? 'bg-black text-white font-bold'
                                                            : 'hover:bg-gray-100 text-gray-700'
                                                            }`}
                                                    >
                                                        <span className="font-mono text-base">{hour.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Minute Selector */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2 text-center">
                                                Phút
                                            </label>
                                            <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50/50 custom-scrollbar">
                                                {minutes.map((minute) => (
                                                    <button
                                                        key={minute.value}
                                                        type="button"
                                                        onClick={() => handleMinuteChange(minute.value)}
                                                        className={`w-full px-3 py-2.5 text-sm text-center transition-all ${selectedMinute === minute.value
                                                            ? 'bg-black text-white font-bold'
                                                            : 'hover:bg-gray-100 text-gray-700'
                                                            }`}
                                                    >
                                                        <span className="font-mono text-base">{minute.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Transition>
                    </div>
                )}
            </Listbox>

            {/* Error Message */}
            {error && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <span>⚠️</span>
                    {error}
                </p>
            )}

            {/* Success Message */}
            {!error && value && (
                <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                    <span>✓</span>
                    {type === 'opening' ? 'Quán mở' : 'Quán đóng'} lúc {value}
                </p>
            )}
        </div>
    );
};

export default TimePicker;
