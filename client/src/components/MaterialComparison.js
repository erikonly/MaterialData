import React, { useState } from 'react';
import { X, Download, BarChart3, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

const MaterialComparison = ({ materials, onClose }) => {
  const [activeTab, setActiveTab] = useState('composition');

  const tabs = [
    { id: 'composition', label: 'Composition', icon: BarChart3 },
    { id: 'properties', label: 'Properties', icon: TrendingUp },
    { id: 'thermal', label: 'Thermal Process', icon: BarChart3 }
  ];

  // Process composition data for comparison
  const getCompositionData = () => {
    const allElements = new Set();
    materials.forEach(material => {
      if (material.composition_content) {
        material.composition_content.forEach(comp => allElements.add(comp.element));
      }
    });

    return Array.from(allElements).map(element => {
      const data = { element };
      materials.forEach((material, index) => {
        const comp = material.composition_content?.find(c => c.element === element);
        data[`Material_${index + 1}`] = comp ? parseFloat(comp.content.replace('%', '')) || 0 : 0;
      });
      return data;
    });
  };

  // Process properties data for radar chart
  const getPropertiesData = () => {
    const properties = ['yield_strength', 'ultimate_strength', 'elongation'];
    
    return materials.map((material, index) => {
      const data = {
        material: `Material ${index + 1}`,
        sample_id: material.sample_id
      };
      
      properties.forEach(prop => {
        const value = material.tensile_properties?.[prop];
        if (value && value !== 'none') {
          // Extract numeric value from string like "850 MPa" or "12%"
          const numericValue = parseFloat(value.replace(/[^\d.]/g, '')) || 0;
          data[prop] = numericValue;
        } else {
          data[prop] = 0;
        }
      });
      
      return data;
    });
  };

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const renderCompositionTab = () => {
    const compositionData = getCompositionData();
    
    return (
      <div className="space-y-6">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={compositionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="element" />
              <YAxis label={{ value: 'Content (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value, name) => [`${value}%`, name]} />
              <Legend />
              {materials.map((_, index) => (
                <Bar
                  key={index}
                  dataKey={`Material_${index + 1}`}
                  fill={colors[index]}
                  name={materials[index].sample_id}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Composition Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Element
                </th>
                {materials.map((material, index) => (
                  <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {material.sample_id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getCompositionData().map((row, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.element}
                  </td>
                  {materials.map((_, matIndex) => (
                    <td key={matIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row[`Material_${matIndex + 1}`]}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPropertiesTab = () => {
    const propertiesData = getPropertiesData();
    
    return (
      <div className="space-y-6">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={propertiesData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="material" />
              <PolarRadiusAxis />
              <Tooltip />
              <Legend />
              <Radar
                name="Yield Strength"
                dataKey="yield_strength"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.1}
              />
              <Radar
                name="Ultimate Strength"
                dataKey="ultimate_strength"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.1}
              />
              <Radar
                name="Elongation"
                dataKey="elongation"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.1}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Properties Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                {materials.map((material, index) => (
                  <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {material.sample_id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Yield Strength
                </td>
                {materials.map((material, index) => (
                  <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {material.tensile_properties?.yield_strength || 'N/A'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Ultimate Strength
                </td>
                {materials.map((material, index) => (
                  <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {material.tensile_properties?.ultimate_strength || 'N/A'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Elongation
                </td>
                {materials.map((material, index) => (
                  <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {material.tensile_properties?.elongation || 'N/A'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderThermalTab = () => {
    return (
      <div className="space-y-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parameter
                </th>
                {materials.map((material, index) => (
                  <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {material.sample_id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Temperature
                </td>
                {materials.map((material, index) => (
                  <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {material.thermal_process?.[0]?.temperature || 'N/A'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Time
                </td>
                {materials.map((material, index) => (
                  <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {material.thermal_process?.[0]?.time || 'N/A'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Cooling Method
                </td>
                {materials.map((material, index) => (
                  <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {material.thermal_process?.[0]?.cooling_method || 'N/A'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Atmosphere
                </td>
                {materials.map((material, index) => (
                  <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {material.thermal_process?.[0]?.atmosphere || 'N/A'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Publication References */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Publication References</h4>
          <div className="space-y-2">
            {materials.map((material, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium text-gray-700">{material.sample_id}:</span>
                <span className="text-gray-600 ml-2">
                  {material.ref} ({material.publish_year})
                  {material.doi && (
                    <a
                      href={`https://doi.org/${material.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 ml-2"
                    >
                      DOI: {material.doi}
                    </a>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Material Comparison</h2>
            <p className="text-gray-600 mt-1">
              Comparing {materials.length} materials side by side
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

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'composition' && renderCompositionTab()}
          {activeTab === 'properties' && renderPropertiesTab()}
          {activeTab === 'thermal' && renderThermalTab()}
        </div>
      </div>
    </div>
  );
};

export default MaterialComparison;