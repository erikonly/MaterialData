import React, { useState } from "react";
import { X, ExternalLink, Download, Filter, Search } from "lucide-react";
import { Link } from "react-router-dom";

const DrillDownModal = ({ data, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("value");
  const [sortOrder, setSortOrder] = useState("desc");

  // Add null checks and default values
  if (!data || !data.data || !data.data.materials) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">No Data Available</h2>
            <p className="text-gray-600 mb-4">Unable to load drill-down data.</p>
            <button onClick={onClose} className="btn-primary">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const materials = data.data.materials || [];

  const filteredMaterials = materials
    .filter(
      (material) =>
        material.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.sample_id?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = sortBy === "value" ? a.value : a[sortBy];
      const bVal = sortBy === "value" ? b.value : b[sortBy];

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const getTypeLabel = (type) => {
    switch (type) {
      case "element":
        return "Element";
      case "strength":
        return "Strength Range (MPa)";
      case "process":
        return "Thermal Process";
      case "year":
        return "Publication Year";
      default:
        return "Category";
    }
  };

  const getValueLabel = (type) => {
    switch (type) {
      case "element":
        return "Materials Count";
      case "strength":
        return "Materials Count";
      case "process":
        return "Usage Count";
      case "year":
        return "Publications";
      default:
        return "Count";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{data.title}</h2>
            <p className="text-gray-600 mt-1">
              {getTypeLabel(data.type)}:{" "}
              <span className="font-medium">{data.data?.category || 'Unknown'}</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-secondary flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search materials..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="value">{getValueLabel(data?.type)}</option>
                <option value="title">Title</option>
                <option value="publish_year">Year</option>
                <option value="sample_id">Sample ID</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredMaterials.length}
              </div>
              <div className="text-sm text-blue-800">Total Materials</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredMaterials.reduce((sum, m) => sum + m.value, 0)}
              </div>
              <div className="text-sm text-green-800">
                Total {getValueLabel(data?.type)}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(filteredMaterials.map((m) => m.publish_year)).size}
              </div>
              <div className="text-sm text-purple-800">Unique Years</div>
            </div>
          </div>

          {/* Materials List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Materials in this category ({filteredMaterials.length})
            </h3>

            {filteredMaterials.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No materials found matching your search criteria.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMaterials.map((material, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          {material.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span className="font-medium">
                            ID: {material.sample_id}
                          </span>
                          <span>•</span>
                          <span>Year: {material.publish_year}</span>
                          <span>•</span>
                          <span>
                            {getValueLabel(data?.type)}: {material.value}
                          </span>
                          <span>•</span>
                          <span>Ref: {material.ref}</span>
                        </div>

                        {/* Data Reference */}
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium text-gray-700">
                                Data Reference:{" "}
                              </span>
                              <span className="text-sm text-gray-600">
                                {material.ref}
                              </span>
                            </div>
                            {material.doi && (
                              <a
                                href={`https://doi.org/${material.doi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700 flex items-center space-x-1 text-sm"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>DOI: {material.doi}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex space-x-2">
                        <Link
                          to={`/material/${material.sample_id}`}
                          className="btn-secondary text-sm"
                          onClick={onClose}
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredMaterials.length} of {materials.length}{" "}
              materials
            </div>
            <div className="flex space-x-2">
              <button onClick={onClose} className="btn-secondary">
                Close
              </button>
              <Link to="/database" className="btn-primary" onClick={onClose}>
                View All Materials
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrillDownModal;
