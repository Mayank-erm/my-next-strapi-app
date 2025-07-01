// src/components/cms/ActiveFilterPills.tsx (New Component)
import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
interface ActiveFilterPillsProps {
    searchTerm: string;
    dateRange: [Date | null, Date | null];
    valueRange: [number, number];
    proposalStatuses: string[];
    proposedByUsers: string[];
    contentTypes: string[];
    serviceLines: string[];
    industries: string[];
    regions: string[];
    onClearFilter: () => void;
    // Add individual clear handlers
    onClearSearchTerm?: () => void;
    onClearDateRange?: () => void;
    onClearValueRange?: () => void;
    onClearProposalStatus?: (status: string) => void;
    onClearProposedByUser?: (user: string) => void;
    onClearContentType?: (type: string) => void;
    onClearServiceLine?: (line: string) => void;
    onClearIndustry?: (industry: string) => void;
    onClearRegion?: (region: string) => void;
}

const ActiveFilterPills: React.FC<ActiveFilterPillsProps> = ({
    searchTerm,
    dateRange,
    valueRange,
    proposalStatuses,
    proposedByUsers,
    contentTypes,
    serviceLines,
    industries,
    regions,
    onClearFilter,
    onClearSearchTerm,
    onClearDateRange,
    onClearValueRange,
    onClearProposalStatus,
    onClearProposedByUser,
    onClearContentType,
    onClearServiceLine,
    onClearIndustry,
    onClearRegion,
}) => {
    const activeFilters: { label: string; value: string; type: string; onClear: () => void }[] = [];

    if (searchTerm) {
        activeFilters.push({ 
            label: 'Search', 
            value: searchTerm, 
            type: 'searchTerm',
            onClear: onClearSearchTerm || onClearFilter
        });
    }
    if (dateRange[0] && dateRange[1]) {
        activeFilters.push({ 
            label: 'Date', 
            value: `${dateRange[0].toLocaleDateString()} - ${dateRange[1].toLocaleDateString()}`, 
            type: 'dateRange',
            onClear: onClearDateRange || onClearFilter
        });
    }
    // Check if value range is different from default (0-1000000)
    if (valueRange[0] !== 0 || valueRange[1] !== 1000000) {
        const formatCurrency = (value: number) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
            return `${value.toLocaleString()}`;
        };
        activeFilters.push({ 
            label: 'Value', 
            value: `${formatCurrency(valueRange[0])} - ${formatCurrency(valueRange[1])}`, 
            type: 'valueRange',
            onClear: onClearValueRange || onClearFilter
        });
    }
    
    proposalStatuses.forEach(status => activeFilters.push({ 
        label: 'Status', 
        value: status, 
        type: 'status',
        onClear: () => onClearProposalStatus ? onClearProposalStatus(status) : onClearFilter()
    }));
    proposedByUsers.forEach(user => activeFilters.push({ 
        label: 'Proposed By', 
        value: user, 
        type: 'proposedBy',
        onClear: () => onClearProposedByUser ? onClearProposedByUser(user) : onClearFilter()
    }));
    contentTypes.forEach(type => activeFilters.push({ 
        label: 'Content Type', 
        value: type, 
        type: 'contentType',
        onClear: () => onClearContentType ? onClearContentType(type) : onClearFilter()
    }));
    serviceLines.forEach(line => activeFilters.push({ 
        label: 'Service Line', 
        value: line, 
        type: 'serviceLine',
        onClear: () => onClearServiceLine ? onClearServiceLine(line) : onClearFilter()
    }));
    industries.forEach(industry => activeFilters.push({ 
        label: 'Industry', 
        value: industry, 
        type: 'industry',
        onClear: () => onClearIndustry ? onClearIndustry(industry) : onClearFilter()
    }));
    regions.forEach(region => activeFilters.push({ 
        label: 'Region', 
        value: region, 
        type: 'region',
        onClear: () => onClearRegion ? onClearRegion(region) : onClearFilter()
    }));

    if (activeFilters.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-2 py-3 px-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
            <span className="text-sm font-semibold text-gray-700">Active Filters:</span>
            {activeFilters.map((filter, index) => (
                <span
                    key={index}
                    className="flex items-center bg-strapi-green-light text-white text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer hover:bg-strapi-green-dark transition-colors"
                    onClick={filter.onClear}
                    title={`Clear filter: ${filter.label}: ${filter.value}`}
                >
                    {filter.label}: {filter.value}
                    <XMarkIcon className="h-3 w-3 ml-1" />
                </span>
            ))}
        </div>
    );
};

export default ActiveFilterPills;