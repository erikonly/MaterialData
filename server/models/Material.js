const mongoose = require('mongoose');

const CompositionSchema = new mongoose.Schema({
  element: { type: String, required: true },
  content: { type: String, required: true }
});

const ThermalProcessSchema = new mongoose.Schema({
  temperature: String,
  time: String,
  cooling_method: String,
  pressure: String,
  atmosphere: String
});

const TensileConditionSchema = new mongoose.Schema({
  tensile_standard: String,
  tensile_temperature: String,
  tensile_speed: String,
  tensile_strategy: String,
  sample_shape: String
});

const TensilePropertiesSchema = new mongoose.Schema({
  stress_strain_curve: String,
  stress_strain_curve_target: String,
  yield_strength: String,
  ultimate_strength: String,
  elongation: String,
  fracture_toughness: String
});

const PhaseFractionSchema = new mongoose.Schema({
  phase_name: String,
  phase_content: String
});

const MicrostructureSchema = new mongoose.Schema({
  microscope: [String],
  microscope_target: [String],
  EBSD_image: [String],
  EBSD_image_target: [String],
  phase_fraction: [PhaseFractionSchema]
});

const MaterialSchema = new mongoose.Schema({
  ref: { type: String, required: true, unique: true },
  doi: String,
  title: { type: String, required: true },
  publish_year: String,
  publish_date: String,
  sample_id: { type: String, required: true },
  composition_content: [CompositionSchema],
  alloy_designation_name: String,
  printing_parameters: String,
  thermal_process: [ThermalProcessSchema],
  other_process: String,
  tensile_condition: TensileConditionSchema,
  tensile_properties: TensilePropertiesSchema,
  microstructure: MicrostructureSchema,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Indexes for better search performance
MaterialSchema.index({ title: 'text', 'composition_content.element': 1 });
MaterialSchema.index({ sample_id: 1 });
MaterialSchema.index({ publish_year: 1 });

module.exports = mongoose.model('Material', MaterialSchema);