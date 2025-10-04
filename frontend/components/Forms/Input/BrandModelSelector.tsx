import React, { useState, useEffect, useCallback } from 'react';
import { Entity } from '@/services/apiEntities';
import {
  fetchBrands,
  fetchModelsByBrand,
  searchEntities,
} from '@/services/apiEntities';

interface BrandModelSelectorProps {
  selectedBrandId?: number | null;
  selectedModelId?: number | null;
  onBrandChange: (brand: Entity | null) => void;
  onModelChange: (model: Entity | null) => void;
  className?: string;
  disabled?: boolean;
}

export default function BrandModelSelector({
  selectedBrandId,
  selectedModelId,
  onBrandChange,
  onModelChange,
  className = '',
  disabled = false,
}: BrandModelSelectorProps) {
  const [brands, setBrands] = useState<Entity[]>([]);
  const [models, setModels] = useState<Entity[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [brandSearchTerm, setBrandSearchTerm] = useState('');
  const [modelSearchTerm, setModelSearchTerm] = useState('');
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const loadBrands = async () => {
    setLoadingBrands(true);
    try {
      const brandsData = await fetchBrands();
      setBrands(brandsData);
    } catch (error) {
      console.error('Failed to load brands:', error);
    } finally {
      setLoadingBrands(false);
    }
  };

  // Load brands on component mount
  useEffect(() => {
    loadBrands();
  }, []);

  const loadModelsForBrand = useCallback(
    async (brandId: number) => {
      setLoadingModels(true);
      try {
        const brand = brands.find((b) => b.id === brandId);
        if (brand) {
          const modelsData = await fetchModelsByBrand(brand.slug);
          setModels(modelsData);
        }
      } catch (error) {
        console.error('Failed to load models:', error);
        setModels([]);
      } finally {
        setLoadingModels(false);
      }
    },
    [brands]
  );

  // Load models when brand changes
  useEffect(() => {
    if (selectedBrandId) {
      loadModelsForBrand(selectedBrandId);
    } else {
      setModels([]);
      onModelChange(null);
    }
  }, [selectedBrandId, loadModelsForBrand, onModelChange]);

  const searchBrands = async (term: string) => {
    if (!term.trim()) {
      await loadBrands();
      return;
    }

    setLoadingBrands(true);
    try {
      const results = await searchEntities(term, 'brand');
      setBrands(results);
    } catch (error) {
      console.error('Failed to search brands:', error);
    } finally {
      setLoadingBrands(false);
    }
  };

  const searchModels = async (term: string) => {
    if (!term.trim()) {
      if (selectedBrandId) {
        await loadModelsForBrand(selectedBrandId);
      } else {
        setModels([]);
      }
      return;
    }

    setLoadingModels(true);
    try {
      const results = await searchEntities(term, 'model');
      setModels(results);
    } catch (error) {
      console.error('Failed to search models:', error);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleBrandSelect = (brand: Entity) => {
    onBrandChange(brand);
    setBrandSearchTerm(brand.name);
    setShowBrandDropdown(false);
    setModelSearchTerm('');
    onModelChange(null);
  };

  const handleModelSelect = (model: Entity) => {
    onModelChange(model);
    setModelSearchTerm(model.name);
    setShowModelDropdown(false);
  };

  const selectedBrand = brands.find((b) => b.id === selectedBrandId);
  const selectedModel = models.find((m) => m.id === selectedModelId);

  return (
    <div className={`brand-model-selector ${className}`}>
      {/* Brand Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Brand
        </label>
        <div className="relative">
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search brands..."
            value={brandSearchTerm || selectedBrand?.name || ''}
            onChange={(e) => {
              setBrandSearchTerm(e.target.value);
              searchBrands(e.target.value);
              setShowBrandDropdown(true);
            }}
            onFocus={() => setShowBrandDropdown(true)}
            disabled={disabled}
          />

          {showBrandDropdown && !disabled && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {loadingBrands ? (
                <div className="px-3 py-2 text-gray-500">Loading brands...</div>
              ) : brands.length > 0 ? (
                brands.map((brand) => (
                  <div
                    key={brand.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleBrandSelect(brand)}
                  >
                    {brand.name}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500">No brands found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Model Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Model
        </label>
        <div className="relative">
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={
              selectedBrandId ? 'Search models...' : 'Select a brand first'
            }
            value={modelSearchTerm || selectedModel?.name || ''}
            onChange={(e) => {
              setModelSearchTerm(e.target.value);
              searchModels(e.target.value);
              setShowModelDropdown(true);
            }}
            onFocus={() => setShowModelDropdown(true)}
            disabled={disabled || !selectedBrandId}
          />

          {showModelDropdown && !disabled && selectedBrandId && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {loadingModels ? (
                <div className="px-3 py-2 text-gray-500">Loading models...</div>
              ) : models.length > 0 ? (
                models.map((model) => (
                  <div
                    key={model.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleModelSelect(model)}
                  >
                    {model.name}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500">No models found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Display */}
      {selectedBrand && selectedModel && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <div className="text-sm text-blue-800">
            <strong>Selected:</strong> {selectedBrand.name} {selectedModel.name}
          </div>
        </div>
      )}
    </div>
  );
}
