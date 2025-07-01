import React from 'react';

interface RangeSliderFilterProps {
  label: string;
  min: number;
  max: number;
  step: number;
  range: [number, number];
  setRange: (range: [number, number]) => void;
  isCurrency?: boolean; // New prop to handle currency formatting
}

const RangeSliderFilter: React.FC<RangeSliderFilterProps> = ({
  label,
  min,
  max,
  step,
  range,
  setRange,
  isCurrency = false,
}) => {
  const [localMin, localMax] = range;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Number(e.target.value);
    setRange([newMin, Math.max(newMin, localMax)]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Number(e.target.value);
    setRange([localMin, Math.max(localMin, newMax)]);
  };

  const formatValue = (value: number) => {
    if (isCurrency) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return value.toLocaleString();
  };

  const formatDisplayValue = (value: number) => {
    if (isCurrency) {
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
      }
      return `$${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };

  // Calculate percentage for background fill
  const minPercentage = ((localMin - min) / (max - min)) * 100;
  const maxPercentage = ((localMax - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-3">{label}</label>
      
      {/* Number inputs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 font-medium">Min:</span>
          <input
            type="number"
            value={localMin}
            onChange={handleMinChange}
            min={min}
            max={max}
            className="w-20 py-1.5 px-2 text-sm text-center border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-strapi-green-light focus:border-strapi-green-light"
            aria-label={`${label} minimum value`}
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 font-medium">Max:</span>
          <input
            type="number"
            value={localMax}
            onChange={handleMaxChange}
            min={min}
            max={max}
            className="w-20 py-1.5 px-2 text-sm text-center border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-strapi-green-light focus:border-strapi-green-light"
            aria-label={`${label} maximum value`}
          />
        </div>
      </div>

      {/* Range slider container */}
      <div className="relative px-3 py-4 mb-2">
        {/* Background track */}
        <div className="absolute top-1/2 left-3 right-3 h-2 bg-gray-200 rounded-full transform -translate-y-1/2"></div>
        
        {/* Active range track */}
        <div
          className="absolute top-1/2 h-2 bg-strapi-green-light rounded-full transform -translate-y-1/2"
          style={{
            left: `calc(0.75rem + ${minPercentage}% * (100% - 1.5rem) / 100%)`,
            width: `calc((${maxPercentage - minPercentage}%) * (100% - 1.5rem) / 100%)`,
          }}
        ></div>
        
        {/* Min range input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMin}
          onChange={handleMinChange}
          className="absolute top-0 left-0 w-full h-8 appearance-none bg-transparent cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-600 
                     [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white 
                     [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-track]:appearance-none [&::-webkit-slider-track]:h-2 
                     [&::-webkit-slider-track]:bg-transparent
                     [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 
                     [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-green-600 
                     [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white 
                     [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none
                     [&::-moz-range-track]:bg-transparent [&::-moz-range-track]:h-2"
          style={{ zIndex: 2 }}
          aria-label={`${label} range slider minimum`}
        />
        
        {/* Max range input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onChange={handleMaxChange}
          className="absolute top-0 left-0 w-full h-8 appearance-none bg-transparent cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-700 
                     [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white 
                     [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-track]:appearance-none [&::-webkit-slider-track]:h-2 
                     [&::-webkit-slider-track]:bg-transparent
                     [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 
                     [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-green-700 
                     [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white 
                     [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none
                     [&::-moz-range-track]:bg-transparent [&::-moz-range-track]:h-2"
          style={{ zIndex: 1 }}
          aria-label={`${label} range slider maximum`}
        />
      </div>
      
      {/* Value display */}
      <div className="flex items-center justify-center">
        <span className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full border">
          {formatDisplayValue(localMin)} - {formatDisplayValue(localMax)}
        </span>
      </div>
    </div>
  );
};

export default RangeSliderFilter;