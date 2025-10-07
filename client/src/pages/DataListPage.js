import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  X,
  Database as DatabaseIcon,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Beaker,
  Calendar,
  Zap,
  Thermometer,
  TrendingUp,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import MaterialComparison from "../components/MaterialComparison";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

const DataListPage = () => {
  const { t } = useLanguage();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    element: "",
    yearRange: { min: "", max: "" },
    strengthRange: { min: "", max: "" },
  });
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [summaryStats, setSummaryStats] = useState({});

  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/materials?page=${currentPage}&limit=20`
      );
      setMaterials(response.data.materials);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast.error(t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [currentPage, t]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchMaterials();
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/api/search", {
        query: searchQuery,
        filters,
      });

      // Transform search results to match materials format
      const searchResults = response.data.results.map((result) => ({
        sample_id: result.sample_id,
        title: result.title,
        composition_content:
          result.composition_summary?.map((comp) => {
            const [element, content] = comp.split(": ");
            return { element, content };
          }) || [],
        thermal_process: [{ temperature: result.thermal_process_summary }],
      }));

      setMaterials(searchResults);
      calculateSummaryStats(searchResults);
      toast.success(t('repository.searchResults', { count: response.data.total_results }));
    } catch (error) {
      console.error("Error searching materials:", error);
      toast.error(t('errors.searchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const renderComposition = (composition) => {
    return composition.slice(0, 4).map((comp, index) => (
      <span
        key={index}
        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full mr-1 mb-1"
      >
        {comp.element}: {comp.content}
      </span>
    ));
  };

  const renderThermalProcess = (thermalProcess) => {
    if (!thermalProcess || thermalProcess.length === 0) return "N/A";
    const process = thermalProcess[0];
    return `${process.temperature || "N/A"} - ${
      process.cooling_method || "N/A"
    }`;
  };

  const handleMaterialSelect = (material) => {
    setSelectedMaterials((prev) => {
      const isSelected = prev.some((m) => m.sample_id === material.sample_id);
      if (isSelected) {
        return prev.filter((m) => m.sample_id !== material.sample_id);
      } else if (prev.length < 5) {
        // Limit to 5 materials for comparison
        return [...prev, material];
      } else {
        toast.error(t('database.maxComparison'));
        return prev;
      }
    });
  };

  const clearComparison = () => {
    setSelectedMaterials([]);
    setShowComparison(false);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      element: "",
      yearRange: { min: "", max: "" },
      strengthRange: { min: "", max: "" },
    });
    setCurrentPage(1);
    fetchMaterials();
    toast.success(t('repository.filtersCleared'));
  };

  // Calculate dynamic summary statistics based on current materials
  const calculateSummaryStats = useCallback((materialsData) => {
    const stats = {
      totalMaterials: materialsData.length,
      uniqueElements: [...new Set(materialsData.flatMap(m => 
        m.composition_content?.map(c => c.element) || []
      ))].length,
      publicationYears: [...new Set(materialsData.map(m => m.publish_year).filter(Boolean))].length,
      thermalProcessed: materialsData.filter(m => 
        m.thermal_process && m.thermal_process.length > 0
      ).length,
      additiveManufactured: materialsData.filter(m => 
        m.printing_parameters && m.printing_parameters !== 'none'
      ).length,
      averageYieldStrength: (() => {
        const yieldValues = materialsData
          .map(m => parseFloat(m.tensile_properties?.yield_strength?.replace(/[^\d.]/g, '') || 0))
          .filter(v => v > 0);
        return yieldValues.length > 0 ? 
          Math.round(yieldValues.reduce((sum, v) => sum + v, 0) / yieldValues.length) : 0;
      })(),
      strengthRange: (() => {
        const yieldValues = materialsData
          .map(m => parseFloat(m.tensile_properties?.yield_strength?.replace(/[^\d.]/g, '') || 0))
          .filter(v => v > 0);
        if (yieldValues.length === 0) return { min: 0, max: 0 };
        return {
          min: Math.min(...yieldValues),
          max: Math.max(...yieldValues)
        };
      })(),
      alloyTypes: [...new Set(materialsData.map(m => 
        m.alloy_designation_name
      ).filter(name => name && name !== 'none'))].length
    };
    
    setSummaryStats(stats);
    return stats;
  }, []);

  // Update summary stats whenever materials change
  useEffect(() => {
    if (materials.length > 0) {
      calculateSummaryStats(materials);
    }
  }, [materials, calculateSummaryStats]);

  const sortedMaterials = [...materials].sort((a, b) => {
    let aVal, bVal;
    
    switch (sortBy) {
      case "title":
        aVal = a.title || "";
        bVal = b.title || "";
        break;
      case "year":
        aVal = parseInt(a.publish_year) || 0;
        bVal = parseInt(b.publish_year) || 0;
        break;
      case "yield_strength":
        aVal = parseFloat(a.tensile_properties?.yield_strength?.replace(/[^\d.]/g, "")) || 0;
        bVal = parseFloat(b.tensile_properties?.yield_strength?.replace(/[^\d.]/g, "")) || 0;
        break;
      default:
        aVal = a.sample_id || "";
        bVal = b.sample_id || "";
    }

    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const renderMaterialCard = (material, index) => {
    const isSelected = selectedMaterials.some(
      (m) => m.sample_id === material.sample_id
    );

    if (viewMode === "grid") {
      return (
        <div
          key={material.sample_id || index}
          className={`bg-white rounded-lg border p-4 hover:shadow-lg transition-all duration-200 ${
            isSelected
              ? "ring-2 ring-primary-500 bg-primary-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleMaterialSelect(material)}
              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <div className="flex space-x-1">
              <Link
                to={`/material/${material.sample_id}`}
                className="p-1 text-gray-400 hover:text-primary-600 rounded"
              >
                <Eye className="w-4 h-4" />
              </Link>
              <button className="p-1 text-gray-400 hover:text-primary-600 rounded">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-2 line-clamp-2">
            {material.title}
          </h3>

          <p className="text-xs text-gray-600 mb-3">
            ID: {material.sample_id} • {material.publish_year}
          </p>

          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-1">
                {t('repository.composition')}
              </h4>
              <div className="flex flex-wrap gap-1">
                {material.composition_content &&
                material.composition_content.length > 0 ? (
                  renderComposition(material.composition_content)
                ) : (
                  <span className="text-gray-500 text-xs">{t('repository.noData')}</span>
                )}
              </div>
            </div>

            {material.tensile_properties && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">
                  {t('repository.properties')}
                </h4>
                <div className="text-xs text-gray-600 space-y-1">
                  {material.tensile_properties.yield_strength !== "none" && (
                    <div>{t('repository.yieldStrength')}: {material.tensile_properties.yield_strength}</div>
                  )}
                  {material.tensile_properties.elongation !== "none" && (
                    <div>{t('repository.elongation')}: {material.tensile_properties.elongation}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // List view (default)
    return (
      <div
        key={material.sample_id || index}
        className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all duration-200 ${
          isSelected
            ? "ring-2 ring-primary-500 bg-primary-50"
            : "border-gray-200"
        }`}
      >
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleMaterialSelect(material)}
            className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                {material.title}
              </h3>
              <div className="flex space-x-1 ml-2">
                <Link
                  to={`/material/${material.sample_id}`}
                  className="p-1 text-gray-400 hover:text-primary-600 rounded"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <button className="p-1 text-gray-400 hover:text-primary-600 rounded">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-2">
              ID: {material.sample_id} • {material.publish_year}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">
                  {t('repository.composition')}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {material.composition_content &&
                  material.composition_content.length > 0 ? (
                    renderComposition(material.composition_content)
                  ) : (
                    <span className="text-gray-500 text-xs">{t('repository.noData')}</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">
                  {t('repository.properties')}
                </h4>
                <div className="text-xs text-gray-600 space-x-3">
                  {material.tensile_properties?.yield_strength !== "none" && (
                    <span>
                      {t('repository.yieldStrength')}: {material.tensile_properties.yield_strength}
                    </span>
                  )}
                  {material.tensile_properties?.elongation !== "none" && (
                    <span>
                      {t('repository.elongation')}: {material.tensile_properties.elongation}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <DatabaseIcon className="w-6 h-6 text-primary-600" />
                <span>{t('repository.title')}</span>
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                {t('repository.subtitle')}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <div className="text-sm text-gray-500">
                {materials.length} {t('repository.materials')}
              </div>
              {selectedMaterials.length > 0 && (
                <button
                  onClick={() => setShowComparison(true)}
                  disabled={selectedMaterials.length < 2}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>{t('common.compare')} ({selectedMaterials.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Dynamic Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('repository.totalMaterials')}</p>
                <p className="text-2xl font-bold text-primary-600">
                  {summaryStats.totalMaterials || 0}
                </p>
              </div>
              <DatabaseIcon className="w-8 h-8 text-primary-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('repository.uniqueElements')}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {summaryStats.uniqueElements || 0}
                </p>
              </div>
              <Beaker className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('repository.publicationYears')}</p>
                <p className="text-2xl font-bold text-green-600">
                  {summaryStats.publicationYears || 0}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('repository.heatTreated')}</p>
                <p className="text-2xl font-bold text-red-600">
                  {summaryStats.thermalProcessed || 0}
                </p>
              </div>
              <Thermometer className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('repository.amProcessed')}</p>
                <p className="text-2xl font-bold text-purple-600">
                  {summaryStats.additiveManufactured || 0}
                </p>
              </div>
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('repository.avgYield')}</p>
                <p className="text-2xl font-bold text-orange-600">
                  {summaryStats.averageYieldStrength || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('repository.searchPlaceholder')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>{t('common.search')}</span>
              </button>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('repository.element')}
                </label>
                <input
                  type="text"
                  value={filters.element}
                  onChange={(e) =>
                    setFilters({ ...filters, element: e.target.value })
                  }
                  placeholder={t('repository.elementPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('repository.yearRange')}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={filters.yearRange.min}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        yearRange: { ...filters.yearRange, min: e.target.value },
                      })
                    }
                    placeholder={t('repository.yearFrom')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={filters.yearRange.max}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        yearRange: { ...filters.yearRange, max: e.target.value },
                      })
                    }
                    placeholder={t('repository.yearTo')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('repository.strengthRange')}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={filters.strengthRange.min}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        strengthRange: {
                          ...filters.strengthRange,
                          min: e.target.value,
                        },
                      })
                    }
                    placeholder={t('repository.strengthMin')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={filters.strengthRange.max}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        strengthRange: {
                          ...filters.strengthRange,
                          max: e.target.value,
                        },
                      })
                    }
                    placeholder={t('repository.strengthMax')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('repository.sortBy')}
                </label>
                <div className="flex space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="title">{t('repository.sortTitle')}</option>
                    <option value="year">{t('repository.sortYear')}</option>
                    <option value="yield_strength">{t('repository.sortYieldStrength')}</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* View Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{t('repository.viewMode')}:</span>
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 text-sm rounded-l-lg ${
                  viewMode === "list"
                    ? "bg-primary-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 text-sm rounded-r-lg ${
                  viewMode === "grid"
                    ? "bg-primary-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {selectedMaterials.length > 0 && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {t('repository.selected', { count: selectedMaterials.length })}
              </span>
              <button
                onClick={clearComparison}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {t('repository.clearSelection')}
              </button>
            </div>
          )}
        </div>

        {/* Materials List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">{t('repository.loadingMaterials')}</p>
            </div>
          </div>
        ) : (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {sortedMaterials.map((material, index) =>
                renderMaterialCard(material, index)
              )}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t('common.previous')}</span>
                </button>

                <span className="text-sm text-gray-600">
                  {t('common.page', { current: pagination.current_page, total: pagination.total_pages })}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, pagination.total_pages)
                    )
                  }
                  disabled={currentPage === pagination.total_pages}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 hover:bg-gray-50"
                >
                  <span>{t('common.next')}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Material Comparison Modal */}
      {showComparison && (
        <MaterialComparison
          materials={selectedMaterials}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
};

export default DataListPage;