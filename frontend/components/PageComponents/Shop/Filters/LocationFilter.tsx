'use client';

import React from 'react';
import CollapsibleSection from '@/components/PageComponents/Sidebar/ProfileSidebar/CollapsibleSection';
import { Location, SubLocation, Filter } from '@/types/types';

interface LocationFilterProps {
  locations: Location[];
  subLocations: SubLocation[];
  filters: Filter[];
  isOpen: boolean;
  onToggle: React.Dispatch<React.SetStateAction<boolean>>;
  onFilterChange: (type: string, id: number) => void;
  onBack: (type: 'locations') => void;
}

const LocationFilter: React.FC<LocationFilterProps> = ({
  locations,
  subLocations,
  filters,
  isOpen,
  onToggle,
  onFilterChange,
  onBack,
}) => {
  return (
    <CollapsibleSection title="Location" open={isOpen} setOpen={onToggle}>
      <div className="max-h-96 overflow-y-auto rounded-md scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 dark:scrollbar-track-gray-800 dark:scrollbar-thumb-gray-600 hover:dark:scrollbar-thumb-gray-500 transition-all duration-200">
        <ul>
          {filters.some((filter) => filter.type === 'locations') ? (
            <>
              <li>
                <button
                  onClick={() => onBack('locations')}
                  className="text-blue-500 hover:underline cursor-pointer"
                >
                  Back to All Locations
                </button>
              </li>
              {filters
                .filter((filter) => filter.type === 'locations')
                .map((filterLocation) => (
                  <li key={filterLocation.id}>
                    <span
                      className="text-sm font-bold text-gray-800 cursor-pointer"
                      onClick={() =>
                        onFilterChange('locations', filterLocation.id)
                      }
                    >
                      {
                        locations.find((loc) => loc.id === filterLocation.id)
                          ?.name
                      }
                    </span>
                  </li>
                ))}

              {filters.some((filter) => filter.type === 'sublocations') ? (
                <>
                  {filters
                    .filter((filter) => filter.type === 'sublocations')
                    .map((filterSubLocation) => (
                      <li key={filterSubLocation.id}>
                        <span className="flex text-sm ml-4 text-gray-800">
                          {
                            subLocations.find(
                              (subloc) => subloc.id === filterSubLocation.id
                            )?.name
                          }
                        </span>
                      </li>
                    ))}
                </>
              ) : (
                subLocations.map((subLocation) => (
                  <li
                    key={subLocation.id}
                    className="mb-1"
                    onClick={() =>
                      onFilterChange('sublocations', subLocation.id)
                    }
                  >
                    <span className="flex text-sm ml-4 text-gray-800 cursor-pointer">
                      {subLocation.name}
                    </span>
                  </li>
                ))
              )}
            </>
          ) : (
            locations.map((location) => (
              <li
                key={location.id}
                className="mb-1"
                onClick={() => onFilterChange('locations', location.id)}
              >
                <span className="flex text-sm text-gray-800 cursor-pointer">
                  {location.name}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </CollapsibleSection>
  );
};

export default LocationFilter;
