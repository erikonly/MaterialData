import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, ExternalLink, Thermometer, Zap, Microscope } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const MaterialDetailPage = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMaterial = useCallback(async () => {
    try {
      const response = await axios.get(`/api/materials/${id}`);
      setMaterial(response.data);
    } catch (error) {
      console.error('Error fetching material:', error);
      toast.error(t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchMaterial();
  }, [fetchMaterial]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">{t('errors.notFound')}</p>
          <Link to="/database" className="btn-primary mt-4">
            {t('nav.database')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/database"
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('materialDetail.backToDatabase')}</span>
            </Link>
            <button className="btn-primary flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>{t('materialDetail.downloadData')}</span>
            </button>
          </div>
          <LanguageSwitcher />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{material.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span>Sample ID: {material.sample_id}</span>
          <span>•</span>
          <span>{t('materialDetail.published')}: {material.publish_date} {material.publish_year}</span>
          <span>•</span>
          <span>DOI: {material.doi}</span>
          {material.doi && (
            <a
              href={`https://doi.org/${material.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 flex items-center space-x-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>{t('materialDetail.viewPaper')}</span>
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Composition */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900">{t('materialDetail.composition')}</h2>
            </div>
            
            {material.composition_content && material.composition_content.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {material.composition_content.map((comp, index) => (
                  <div key={index} className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{comp.element}</div>
                    <div className="text-sm text-gray-600">{comp.content}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">{t('repository.noData')}</p>
            )}
            
            {material.alloy_designation_name && material.alloy_designation_name !== 'none' && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{t('materialDetail.alloyDesignation')}: </span>
                <span className="text-sm text-gray-600">{material.alloy_designation_name}</span>
              </div>
            )}
          </div>

          {/* Thermal Processing */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <Thermometer className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-900">{t('materialDetail.thermalProcessing')}</h2>
            </div>
            
            {material.thermal_process && material.thermal_process.length > 0 ? (
              <div className="space-y-4">
                {material.thermal_process.map((process, index) => (
                  <div key={index} className="p-4 bg-red-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">{t('materialDetail.temperature')}: </span>
                        <span className="text-sm text-gray-600">{process.temperature || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">{t('materialDetail.holdingTime')}: </span>
                        <span className="text-sm text-gray-600">{process.time || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">{t('materialDetail.coolingMethod')}: </span>
                        <span className="text-sm text-gray-600">{process.cooling_method || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">{t('materialDetail.atmosphere')}: </span>
                        <span className="text-sm text-gray-600">{process.atmosphere || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">{t('repository.noData')}</p>
            )}
            
            {material.other_process && material.other_process !== 'none' && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{t('materialDetail.otherProcesses')}: </span>
                <p className="text-sm text-gray-600 mt-1">{material.other_process}</p>
              </div>
            )}
          </div>

          {/* Additive Manufacturing Parameters */}
          {material.printing_parameters && material.printing_parameters !== 'none' && (
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-5 h-5 text-green-500" />
                <h2 className="text-xl font-semibold text-gray-900">{t('materialDetail.additiveManufacturing')}</h2>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-sm font-semibold text-green-800 mb-2">{t('materialDetail.processingParameters')}</h3>
                <p className="text-sm text-green-700 leading-relaxed">
                  {material.printing_parameters}
                </p>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  {t('materialDetail.manufacturingMethod')}
                </h4>
                <div className="text-xs text-gray-600">
                  <div className="mb-1">
                    <span className="font-medium">{t('materialDetail.process')}:</span> {
                      material.printing_parameters.includes('LPBF') ? 'Laser Powder Bed Fusion (LPBF)' :
                      material.printing_parameters.includes('SLM') ? 'Selective Laser Melting (SLM)' :
                      material.printing_parameters.includes('EBM') ? 'Electron Beam Melting (EBM)' :
                      t('materialDetail.additiveManufacturing')
                    }
                  </div>
                  <div>
                    <span className="font-medium">{t('materialDetail.parameters')}:</span> {material.printing_parameters}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Microstructure */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <Microscope className="w-5 h-5 text-purple-500" />
              <h2 className="text-xl font-semibold text-gray-900">{t('materialDetail.microstructure')}</h2>
            </div>
            
            {material.microstructure && (
              <div className="space-y-4">
                {/* Phase Fractions */}
                {material.microstructure.phase_fraction && material.microstructure.phase_fraction.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">{t('materialDetail.phaseFractions')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {material.microstructure.phase_fraction.map((phase, index) => (
                        <div key={index} className="flex justify-between p-2 bg-purple-50 rounded">
                          <span className="text-sm text-gray-700">{phase.phase_name}</span>
                          <span className="text-sm text-gray-600">{phase.phase_content}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Microscope Images */}
                {material.microstructure.microscope && material.microstructure.microscope.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">{t('materialDetail.microscopeReferences')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {material.microstructure.microscope.map((ref, index) => (
                        <span key={index} className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                          {ref}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tensile Properties */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('materialDetail.tensileProperties')}</h2>
            
            {material.tensile_properties ? (
              <div className="space-y-4">
                {/* Key Properties Grid */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center py-3 px-4 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-sm font-medium text-green-800">{t('materialDetail.yieldStrength')}</span>
                    <span className="text-sm font-bold text-green-900">
                      {material.tensile_properties.yield_strength !== 'none' ? 
                        material.tensile_properties.yield_strength : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 px-4 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-sm font-medium text-blue-800">{t('materialDetail.tensileStrength')}</span>
                    <span className="text-sm font-bold text-blue-900">
                      {material.tensile_properties.ultimate_strength !== 'none' ? 
                        material.tensile_properties.ultimate_strength : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 px-4 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="text-sm font-medium text-purple-800">{t('materialDetail.elongation')}</span>
                    <span className="text-sm font-bold text-purple-900">
                      {material.tensile_properties.elongation !== 'none' ? 
                        material.tensile_properties.elongation : 'N/A'}
                    </span>
                  </div>
                  
                  {material.tensile_properties.fracture_toughness && material.tensile_properties.fracture_toughness !== 'none' && (
                    <div className="flex justify-between items-center py-3 px-4 bg-orange-50 rounded-lg border border-orange-200">
                      <span className="text-sm font-medium text-orange-800">{t('materialDetail.fractureToughness')}</span>
                      <span className="text-sm font-bold text-orange-900">
                        {material.tensile_properties.fracture_toughness}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stress-Strain Curve Reference */}
                {material.tensile_properties.stress_strain_curve && material.tensile_properties.stress_strain_curve !== 'none' && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">{t('materialDetail.stressStrainData')}</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>
                        <span className="font-medium">{t('materialDetail.curveReference')}:</span> {material.tensile_properties.stress_strain_curve}
                      </div>
                      {material.tensile_properties.stress_strain_curve_target && (
                        <div>
                          <span className="font-medium">{t('materialDetail.dataLocation')}:</span> {material.tensile_properties.stress_strain_curve_target}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Properties Summary */}
                <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Mechanical Performance Summary
                  </h4>
                  <div className="text-xs text-gray-600">
                    {material.tensile_properties.yield_strength !== 'none' && material.tensile_properties.ultimate_strength !== 'none' ? (
                      <div className="mb-1">
                        <span className="font-medium">Strength Ratio (YS/UTS):</span> {
                          (() => {
                            const ys = parseFloat(material.tensile_properties.yield_strength?.replace(/[^\d.]/g, '')) || 0;
                            const uts = parseFloat(material.tensile_properties.ultimate_strength?.replace(/[^\d.]/g, '')) || 0;
                            return uts > 0 ? (ys/uts).toFixed(2) : 'N/A';
                          })()
                        }
                      </div>
                    ) : null}
                    
                    {material.tensile_properties.elongation !== 'none' && (
                      <div className="mb-1">
                        <span className="font-medium">Ductility:</span> {
                          (() => {
                            const elongation = parseFloat(material.tensile_properties.elongation?.replace(/[^\d.]/g, '')) || 0;
                            return elongation > 20 ? 'High' : elongation > 10 ? 'Moderate' : elongation > 5 ? 'Limited' : 'Low';
                          })()
                        } ({material.tensile_properties.elongation})
                      </div>
                    )}
                    
                    <div>
                      <span className="font-medium">Material Class:</span> {
                        (() => {
                          const ys = parseFloat(material.tensile_properties.yield_strength?.replace(/[^\d.]/g, '')) || 0;
                          return ys > 1500 ? 'Ultra-High Strength' : 
                                 ys > 1000 ? 'High Strength' : 
                                 ys > 500 ? 'Medium Strength' : 
                                 ys > 200 ? 'Low Strength' : 'Not Classified';
                        })()
                      }
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">{t('repository.noData')}</p>
              </div>
            )}
          </div>

          {/* Test Conditions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('materialDetail.testConditions')}</h2>
            
            {material.tensile_condition ? (
              <div className="space-y-4">
                {/* Basic Test Parameters */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">{t('materialDetail.standard')}:</span>
                    <span className="text-sm text-gray-900">
                      {material.tensile_condition.tensile_standard || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">{t('materialDetail.temperature')}:</span>
                    <span className="text-sm text-gray-900">
                      {material.tensile_condition.tensile_temperature || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">{t('materialDetail.speed')}:</span>
                    <span className="text-sm text-gray-900">
                      {material.tensile_condition.tensile_speed || 'N/A'}
                    </span>
                  </div>
                  {material.tensile_condition.sample_shape && material.tensile_condition.sample_shape !== 'none' && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-700">{t('materialDetail.sampleShape')}:</span>
                      <span className="text-sm text-gray-900">
                        {material.tensile_condition.sample_shape}
                      </span>
                    </div>
                  )}
                </div>

                {/* Test Strategy */}
                {material.tensile_condition.tensile_strategy && material.tensile_condition.tensile_strategy !== 'none' && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Testing Strategy</h4>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {material.tensile_condition.tensile_strategy}
                    </p>
                  </div>
                )}

                {/* Additional Test Details */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Test Configuration Summary
                  </h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>
                      <span className="font-medium">Standard:</span> {material.tensile_condition.tensile_standard || 'Not specified'}
                    </div>
                    <div>
                      <span className="font-medium">Environment:</span> {material.tensile_condition.tensile_temperature || 'Not specified'}
                    </div>
                    <div>
                      <span className="font-medium">Loading Rate:</span> {material.tensile_condition.tensile_speed || 'Not specified'}
                    </div>
                    {material.tensile_condition.sample_shape && material.tensile_condition.sample_shape !== 'none' && (
                      <div>
                        <span className="font-medium">Specimen:</span> {material.tensile_condition.sample_shape}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">{t('repository.noData')}</p>
              </div>
            )}
          </div>

          {/* Publication Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('materialDetail.publication')}</h2>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">{t('materialDetail.reference')}: </span>
                <span className="text-sm text-gray-900">{material.ref}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('materialDetail.year')}: </span>
                <span className="text-sm text-gray-900">{material.publish_year}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('materialDetail.month')}: </span>
                <span className="text-sm text-gray-900">{material.publish_date}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetailPage;