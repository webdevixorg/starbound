'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, usePathname } from 'next/navigation';
import {
  Entity,
  fetchEntityBySlug,
  fetchModelsByBrandSlug,
} from '@/services/entities';

const ModelPage: React.FC = () => {
  const [brand, setBrand] = useState<Entity | null>(null);
  const [model, setModel] = useState<Entity | null>(null);
  const [allModels, setAllModels] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  // Break down URL segments
  const urlSegments = (pathname ?? '').split('/').filter(Boolean);

  // Extract brand and model from URL segments
  const brandSlug = (params?.brand as string) || urlSegments[1];
  const modelSlug = (params?.slug as string) || urlSegments[2];

  useEffect(() => {
    console.log('Effect triggered with:', { brandSlug, modelSlug });
    if (brandSlug && modelSlug) {
      console.log('Both slugs available, calling loadModelData...');
      loadModelData();
    } else {
      console.log('Missing slugs:', { brandSlug, modelSlug });
      setError('Invalid URL structure');
      setLoading(false);
    }
  }, [brandSlug, modelSlug]);

  const loadModelData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading data for:', brandSlug, modelSlug);

      // Load brand, model, and all models in parallel for better performance
      const [currentBrand, currentModel, modelsResponse] = await Promise.all([
        fetchEntityBySlug(brandSlug, 'brand'),
        fetchEntityBySlug(modelSlug, 'model'),
        fetchModelsByBrandSlug(brandSlug, { pageSize: 1000 }).catch(() => ({
          results: [],
        })),
      ]);

      // Set the data
      setBrand(currentBrand.results[0]);
      setModel(currentModel.results[0]);

      // Process models response
      let modelList: Entity[] = [];
      if (modelsResponse?.results && Array.isArray(modelsResponse.results)) {
        modelList = modelsResponse.results;
      } else if (Array.isArray(modelsResponse)) {
        modelList = modelsResponse;
      }

      setAllModels(modelList);
    } catch (error: unknown) {
      const err = error as {
        message?: string;
        response?: { status?: number; data?: unknown };
      };
      console.error('Error loading model data:', error);
      console.error('Error details:', err.response?.data);

      if (err.response?.status === 404) {
        setError('Model or brand not found');
      } else {
        setError(`Failed to load data: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Get other models from the same brand (excluding current model)
  const otherModels = allModels.filter((m) => m.slug !== modelSlug).slice(0, 6);

  if (loading) {
    return (
      <div className="container mx-auto py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="ml-4 text-gray-600">
            Loading {brandSlug} {modelSlug}...
          </p>
        </div>
      </div>
    );
  }

  if (error || !brand || !model) {
    return (
      <div className="container mx-auto py-4 sm:py-6 lg:py-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm p-8 text-center">
          <div className="text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Model Not Found
            </h3>
            <p className="text-gray-500 mb-4">
              {error || "The model you're looking for doesn't exist."}
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600">Debug Info:</p>
              <p className="text-xs font-mono text-gray-500">URL: {pathname}</p>
              <p className="text-xs font-mono text-gray-500">
                Brand: {brandSlug}
              </p>
              <p className="text-xs font-mono text-gray-500">
                Model: {modelSlug}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {brandSlug && (
                <Link
                  href={`/entities/${brandSlug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
                >
                  Back to {brandSlug}
                </Link>
              )}
              <Link
                href="/entities"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
              >
                Back to Brands
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-8">
      <div className="space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link
            href="/entities"
            className="hover:text-blue-600 transition-colors"
          >
            Entities
          </Link>
          <ChevronRightIcon />
          <Link
            href={`/entities/${brand.slug}`}
            className="hover:text-blue-600 transition-colors"
          >
            {brand.name}
          </Link>
          <ChevronRightIcon />
          <span className="text-gray-900 font-medium">{model.name}</span>
        </nav>

        {/* Model Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-50/50 to-blue-100/30 border-b border-blue-200/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                  {model.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-blue-900">
                    {brand.name} {model.name}
                  </h1>
                  <p className="text-blue-700 mt-1">Vehicle Model</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/entities/${brand.slug}`}
                  className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm font-medium"
                >
                  View All {brand.name} Models
                </Link>
              </div>
            </div>
          </div>

          {model.description && (
            <div className="p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                About the {model.name}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {model.description}
              </p>
            </div>
          )}
        </div>

        {/* Model Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Model Information
              </h2>

              <div className="space-y-4">
                <InfoRow
                  label="Full Name"
                  value={`${brand.name} ${model.name}`}
                />
                <InfoRow
                  label="Brand"
                  value={
                    <Link
                      href={`/entities/${brand.slug}`}
                      className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
                    >
                      {brand.name}
                    </Link>
                  }
                />
                <InfoRow label="Model" value={model.name} />
                <InfoRow
                  label="URL Path"
                  value={
                    <code className="font-mono text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                      /entities/{brand.slug}/{model.slug}
                    </code>
                  }
                />
                {model.description && (
                  <InfoRow
                    label="Description"
                    value={model.description}
                    isLast
                  />
                )}
              </div>
            </div>

            {/* Parts/Applications Section */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Available Parts & Components
              </h2>
              <div className="text-center py-8">
                <PartsIcon />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Parts Coming Soon
                </h3>
                <p className="text-gray-500 mb-4">
                  Parts and components for the {brand.name} {model.name} will be
                  available soon.
                </p>
                <button
                  onClick={() =>
                    router.push(
                      `/search?brand=${brand.slug}&model=${model.slug}`
                    )
                  }
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                >
                  Search Parts for this Model
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Model Statistics */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Model Details
              </h3>
              <div className="space-y-4">
                <StatItem
                  icon="blue"
                  label="Brand ID"
                  value={brand.id.toString()}
                />
                <StatItem
                  icon="green"
                  label="Model ID"
                  value={model.id.toString()}
                />
                <StatItem icon="purple" label="Model Slug" value={model.slug} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <ActionButton
                  href={`/entities/${brand.slug}`}
                  color="blue"
                  text={`View All ${brand.name} Models`}
                />
                <ActionButton
                  href="/entities"
                  color="gray"
                  text="Browse All Brands"
                />
                <ActionButton
                  onClick={() =>
                    router.push(
                      `/search?brand=${brand.slug}&model=${model.slug}`
                    )
                  }
                  color="green"
                  text="Search Parts for this Model"
                />
              </div>
            </div>

            {/* Parent Brand Info */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Brand Information
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
                  {brand.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <Link
                    href={`/entities/${brand.slug}`}
                    className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {brand.name}
                  </Link>
                  <p className="text-sm text-gray-600">Automotive Brand</p>
                </div>
              </div>
              {brand.description && (
                <p className="text-sm text-gray-600 line-clamp-3">
                  {brand.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Other Models from Same Brand */}
        {otherModels.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50/50 to-gray-100/30 border-b border-gray-200/50">
              <h2 className="text-2xl font-bold text-gray-900">
                Other {brand.name} Models
              </h2>
              <p className="text-gray-600 mt-1">
                Explore more models from {brand.name}
              </p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherModels.map((otherModel) => (
                  <ModelCard
                    key={otherModel.id}
                    model={otherModel}
                    brandSlug={brand.slug}
                  />
                ))}
              </div>

              {allModels.length > 6 && (
                <div className="mt-6 text-center">
                  <Link
                    href={`/entities/${brand.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                  >
                    View All {allModels.length} {brand.name} Models
                    <ChevronRightIcon />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            <NavigationButton
              href="/entities"
              color="gray"
              text="All Brands"
              icon="left"
            />
            <NavigationButton
              href={`/entities/${brand.slug}`}
              color="blue"
              text={`${brand.name} Models`}
              icon="left"
            />
          </div>
          <NavigationButton
            onClick={() =>
              router.push(`/search?brand=${brand.slug}&model=${model.slug}`)
            }
            color="green"
            text={`Search Parts for ${model.name}`}
            icon="search"
          />
        </div>
      </div>
    </div>
  );
};

// Helper Components
const ChevronRightIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

const PartsIcon = () => (
  <svg
    className="w-12 h-12 mx-auto mb-4 text-gray-300"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
    />
  </svg>
);

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  isLast?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, isLast = false }) => (
  <div className={`${!isLast ? 'border-b border-gray-200 pb-4' : ''}`}>
    <h3 className="font-semibold text-gray-900 mb-2">{label}</h3>
    <div className="text-gray-600">{value}</div>
  </div>
);

interface StatItemProps {
  icon: 'blue' | 'green' | 'purple';
  label: string;
  value: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 ${colorClasses[icon]} rounded-lg flex items-center justify-center`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      </div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="font-mono text-sm text-gray-900">{value}</p>
      </div>
    </div>
  );
};

interface ActionButtonProps {
  href?: string;
  onClick?: () => void;
  color: 'blue' | 'gray' | 'green';
  text: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  href,
  onClick,
  color,
  text,
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-700',
    gray: 'bg-gray-50 hover:bg-gray-100 text-gray-700',
    green: 'bg-green-50 hover:bg-green-100 text-green-700',
  };

  const baseClasses = `block w-full px-4 py-2 ${colorClasses[color]} rounded-lg transition-colors text-center font-medium`;

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {text}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {text}
    </button>
  );
};

interface ModelCardProps {
  model: Entity;
  brandSlug: string;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, brandSlug }) => (
  <Link
    href={`/entities/${brandSlug}/${model.slug}`}
    className="group bg-gradient-to-br from-gray-50/50 to-gray-100/30 hover:from-blue-50/50 hover:to-blue-100/30 
             rounded-xl border border-gray-200/50 hover:border-blue-200/50 p-4 
             transition-all duration-200 hover:shadow-md hover:shadow-blue-500/10"
  >
    <div className="flex items-center justify-between mb-3">
      <div
        className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center 
                      text-white font-bold text-sm group-hover:scale-105 transition-transform"
      >
        {model.name.charAt(0).toUpperCase()}
      </div>
      <ChevronRightIcon />
    </div>

    <h3 className="font-medium text-gray-900 group-hover:text-blue-900 transition-colors">
      {model.name}
    </h3>

    {model.description && (
      <p className="text-sm text-gray-600 group-hover:text-blue-700 transition-colors mt-1 line-clamp-2">
        {model.description}
      </p>
    )}
  </Link>
);

interface NavigationButtonProps {
  href?: string;
  onClick?: () => void;
  color: 'gray' | 'blue' | 'green';
  text: string;
  icon: 'left' | 'search';
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  href,
  onClick,
  color,
  text,
  icon,
}) => {
  const colorClasses = {
    gray: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    blue: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
    green: 'bg-green-500 hover:bg-green-600 text-white',
  };

  const baseClasses = `inline-flex items-center justify-center gap-2 px-6 py-3 ${colorClasses[color]} rounded-xl transition-all duration-200 font-medium`;

  const iconElement =
    icon === 'left' ? (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    );

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {iconElement}
        {text}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {iconElement}
      {text}
    </button>
  );
};

export default ModelPage;
