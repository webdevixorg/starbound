'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface UserManual {
  id: number;
  title: string;
  description: string;
  category: string;
  file_size: string;
  file_type: 'PDF' | 'DOC' | 'DOCX';
  download_count: number;
  version: string;
  last_updated: string;
  language: string;
  pages: number;
  download_url: string;
  preview_available: boolean;
  tags: string[];
}

const UserManualsPage: React.FC = () => {
  const [manuals, setManuals] = useState<UserManual[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    // Simulate API call - replace with actual API
    const fetchManuals = async () => {
      try {
        // Mock data - replace with actual API call
        const mockManuals: UserManual[] = [
          {
            id: 1,
            title: "Complete Car Audio Installation Manual",
            description: "Comprehensive guide covering all aspects of car audio installation including wiring diagrams, speaker placement, and troubleshooting.",
            category: "Audio Systems",
            file_size: "12.5 MB",
            file_type: "PDF",
            download_count: 5420,
            version: "3.2",
            last_updated: "2024-01-15",
            language: "English",
            pages: 84,
            download_url: "/manuals/audio-installation-manual.pdf",
            preview_available: true,
            tags: ["audio", "installation", "wiring", "speakers", "amplifiers"]
          },
          {
            id: 2,
            title: "LED Lighting Installation Guide",
            description: "Step-by-step instructions for installing various LED lighting solutions in vehicles. Includes safety guidelines and technical specifications.",
            category: "Lighting",
            file_size: "8.2 MB",
            file_type: "PDF",
            download_count: 3180,
            version: "2.1",
            last_updated: "2024-01-12",
            language: "English",
            pages: 56,
            download_url: "/manuals/led-lighting-guide.pdf",
            preview_available: true,
            tags: ["LED", "lighting", "installation", "safety", "specifications"]
          },
          {
            id: 3,
            title: "Performance Parts Installation Handbook",
            description: "Professional guide for installing performance parts including cold air intakes, exhaust systems, and turbochargers.",
            category: "Performance Parts",
            file_size: "15.7 MB",
            file_type: "PDF",
            download_count: 4890,
            version: "4.0",
            last_updated: "2024-01-10",
            language: "English",
            pages: 128,
            download_url: "/manuals/performance-parts-handbook.pdf",
            preview_available: true,
            tags: ["performance", "turbo", "exhaust", "intake", "tuning"]
          },
          {
            id: 4,
            title: "Interior Detailing Professional Manual",
            description: "Advanced techniques for professional interior detailing. Covers all materials and surfaces with product recommendations.",
            category: "Interior",
            file_size: "22.1 MB",
            file_type: "PDF",
            download_count: 2760,
            version: "1.8",
            last_updated: "2024-01-08",
            language: "English",
            pages: 156,
            download_url: "/manuals/interior-detailing-manual.pdf",
            preview_available: true,
            tags: ["detailing", "interior", "cleaning", "materials", "techniques"]
          },
          {
            id: 5,
            title: "Exterior Modification Guide",
            description: "Complete guide for exterior modifications including body kits, spoilers, and custom paint work. Legal considerations included.",
            category: "Exterior",
            file_size: "18.9 MB",
            file_type: "PDF",
            download_count: 3650,
            version: "2.5",
            last_updated: "2024-01-05",
            language: "English",
            pages: 102,
            download_url: "/manuals/exterior-modification-guide.pdf",
            preview_available: false,
            tags: ["exterior", "body kit", "paint", "modifications", "legal"]
          },
          {
            id: 6,
            title: "Vehicle Maintenance Schedule & Procedures",
            description: "Essential maintenance guide with detailed schedules and step-by-step procedures for keeping your vehicle in optimal condition.",
            category: "Maintenance",
            file_size: "9.8 MB",
            file_type: "PDF",
            download_count: 7230,
            version: "3.1",
            last_updated: "2024-01-03",
            language: "English",
            pages: 74,
            download_url: "/manuals/maintenance-procedures.pdf",
            preview_available: true,
            tags: ["maintenance", "schedule", "procedures", "oil", "filters"]
          },
          {
            id: 7,
            title: "Troubleshooting Common Issues",
            description: "Diagnostic guide for identifying and resolving common vehicle problems. Includes flowcharts and diagnostic procedures.",
            category: "Troubleshooting",
            file_size: "11.3 MB",
            file_type: "DOC",
            download_count: 4120,
            version: "2.0",
            last_updated: "2024-01-01",
            language: "English",
            pages: 68,
            download_url: "/manuals/troubleshooting-guide.doc",
            preview_available: false,
            tags: ["troubleshooting", "diagnostic", "problems", "repair", "flowcharts"]
          }
        ];
        
        setManuals(mockManuals);
      } catch (error) {
        console.error('Error fetching manuals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchManuals();
  }, []);

  const categories = ['all', 'Audio Systems', 'Lighting', 'Performance Parts', 'Interior', 'Exterior', 'Maintenance', 'Troubleshooting'];
  const fileTypes = ['all', 'PDF', 'DOC', 'DOCX'];
  
  const filteredManuals = manuals.filter(manual => {
    const matchesCategory = selectedCategory === 'all' || manual.category === selectedCategory;
    const matchesFileType = selectedFileType === 'all' || manual.file_type === selectedFileType;
    const matchesSearch = searchTerm === '' || 
      manual.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manual.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manual.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesFileType && matchesSearch;
  });

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'PDF':
        return (
          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'DOC':
      case 'DOCX':
        return (
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const formatDownloadCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleDownload = (manual: UserManual) => {
    // In a real app, this would trigger the actual download
    console.log(`Downloading: ${manual.title}`);
    // window.open(manual.download_url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading user manuals...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <svg
                className="w-6 h-6 text-white"
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
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              User Manuals
            </h1>
          </div>
          <p className="text-lg text-gray-600 ml-11">
            Download comprehensive guides and documentation for all your automotive needs
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6 mb-8">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search manuals, topics, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-gray-700">Categories:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1.5 bg-white/50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* File Type Filter */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-gray-700">File Type:</span>
                  <select
                    value={selectedFileType}
                    onChange={(e) => setSelectedFileType(e.target.value)}
                    className="px-3 py-1.5 bg-white/50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {fileTypes.map((fileType) => (
                      <option key={fileType} value={fileType}>
                        {fileType === 'all' ? 'All Types' : fileType}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 bg-white/50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="popular">Most Downloads</option>
                  <option value="title">Title A-Z</option>
                  <option value="size">File Size</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Manuals Grid */}
        <div className="grid gap-6">
          {filteredManuals.map((manual) => (
            <div
              key={manual.id}
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* File Icon and Basic Info */}
                <div className="lg:w-1/4">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-white rounded-lg border-2 border-gray-100 flex items-center justify-center shadow-sm">
                      {getFileTypeIcon(manual.file_type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{manual.file_type}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{manual.file_size}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{manual.pages} pages</span>
                        <span>•</span>
                        <span>v{manual.version}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Manual Details */}
                <div className="lg:w-1/2">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">{manual.title}</h3>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {manual.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">{manual.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {manual.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                    {manual.tags.length > 4 && (
                      <span className="text-xs text-gray-400">
                        +{manual.tags.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Updated: {manual.last_updated}</span>
                    <span>•</span>
                    <span>{formatDownloadCount(manual.download_count)} downloads</span>
                    <span>•</span>
                    <span>{manual.language}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:w-1/4 flex flex-col justify-center space-y-3">
                  <button
                    onClick={() => handleDownload(manual)}
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download</span>
                  </button>
                  
                  {manual.preview_available && (
                    <button className="flex items-center justify-center space-x-2 bg-white/50 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-white/80 transition-all duration-200 border border-gray-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>Preview</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredManuals.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No manuals found</h3>
            <p className="text-gray-500">Try adjusting your search terms or filters to see more results.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManualsPage;