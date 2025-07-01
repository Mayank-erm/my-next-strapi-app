// src/components/cms/DateRangeFilter.tsx (UPDATED: Custom Date Range Filter with native HTML inputs)
import React from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline'; // Still useful for visual consistency
interface DateRangeFilterProps {
  dateRange: [Date | null, Date | null];
  setDateRange: (range: [Date | null, Date | null]) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ dateRange, setDateRange }) => {
  const [startDate, endDate] = dateRange;

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value ? new Date(e.target.value) : null;
    setDateRange([newDate, endDate]);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value ? new Date(e.target.value) : null;
    setDateRange([startDate, newDate]);
  };

  const formatDateForInput = (date: Date | null) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 font-medium w-12">From:</span>
          <input
            type="date"
            value={formatDateForInput(startDate)}
            onChange={handleStartDateChange}
            className="flex-1 py-2 px-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-strapi-green-light focus:border-strapi-green-light text-sm"
            aria-label="Start Date"
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 font-medium w-12">To:</span>
          <input
            type="date"
            value={formatDateForInput(endDate)}
            onChange={handleEndDateChange}
            className="flex-1 py-2 px-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-strapi-green-light focus:border-strapi-green-light text-sm"
            aria-label="End Date"
          />
        </div>
      </div>
      {startDate && endDate && (
        <div className="mt-2 text-center">
          <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full border">
            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;