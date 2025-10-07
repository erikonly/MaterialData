const express = require('express');
const router = express.Router();

// Mock data for demonstration - replace with actual database queries
const mockMaterials = [
  {
    "ref": "Springer/10853",
    "doi": "10.1007/s10853-007-1963-5",
    "title": "Effect of copper additions in directly quenched titanium–boron steels",
    "publish_year": "2007",
    "publish_date": "NOV",
    "sample_id": "10.1007-s10853-007-1963-5_1",
    "composition_content": [
      {"element": "C", "content": "0.04%"},
      {"element": "Mn", "content": "1.60%"},
      {"element": "Si", "content": "0.48%"},
      {"element": "S", "content": "0.022%"},
      {"element": "P", "content": "0.014%"},
      {"element": "Cu", "content": "1.51%"},
      {"element": "N", "content": "0.0051%"}
    ],
    "alloy_designation_name": "Ti-B Steel",
    "printing_parameters": "none",
    "thermal_process": [{
      "temperature": "750 °C",
      "time": "2 hours",
      "cooling_method": "water-quenching",
      "pressure": "atmospheric",
      "atmosphere": "air"
    }],
    "other_process": "Forging and hot-rolling process with spectroscopic analysis",
    "tensile_condition": {
      "tensile_standard": "ASTM E8",
      "tensile_temperature": "room temperature",
      "tensile_speed": "0.5 mm/min",
      "tensile_strategy": "Computer-controlled Instron testing",
      "sample_shape": "standard tensile specimen"
    },
    "tensile_properties": {
      "stress_strain_curve": "Available",
      "stress_strain_curve_target": "assets/curve_1.jpg",
      "yield_strength": "485 MPa",
      "ultimate_strength": "720 MPa",
      "elongation": "18.5%",
      "fracture_toughness": "45 MPa√m"
    },
    "microstructure": {
      "microscope": ["Optical microscopy"],
      "microscope_target": ["assets/micro_1.jpg"],
      "EBSD_image": [],
      "EBSD_image_target": [],
      "phase_fraction": [
        {"phase_name": "ferrite", "phase_content": "65%"},
        {"phase_name": "martensite", "phase_content": "35%"}
      ]
    }
  },
  {
    "ref": "Springer/00170",
    "doi": "10.1007/s00170-022-09004-7",
    "title": "Heat treatment optimization of 18Ni300 maraging steel for aerospace applications",
    "publish_year": "2022",
    "publish_date": "MAR",
    "sample_id": "10.1007-s00170-022-09004-7_1",
    "composition_content": [
      {"element": "Ni", "content": "18.5%"},
      {"element": "Co", "content": "9.0%"},
      {"element": "Mo", "content": "5.0%"},
      {"element": "Ti", "content": "0.7%"},
      {"element": "Al", "content": "0.1%"},
      {"element": "C", "content": "0.03%"},
      {"element": "Fe", "content": "balance"}
    ],
    "alloy_designation_name": "18Ni300 Maraging Steel",
    "printing_parameters": "none",
    "thermal_process": [{
      "temperature": "490 °C",
      "time": "6 hours",
      "cooling_method": "air cooling",
      "pressure": "atmospheric",
      "atmosphere": "protective"
    }],
    "other_process": "Solution treatment at 820°C followed by aging treatment",
    "tensile_condition": {
      "tensile_standard": "ASTM E8",
      "tensile_temperature": "room temperature",
      "tensile_speed": "1.0 mm/min",
      "tensile_strategy": "Universal testing machine with extensometer",
      "sample_shape": "cylindrical tensile specimen"
    },
    "tensile_properties": {
      "stress_strain_curve": "Available",
      "stress_strain_curve_target": "assets/curve_2.jpg",
      "yield_strength": "1940 MPa",
      "ultimate_strength": "2050 MPa",
      "elongation": "8.2%",
      "fracture_toughness": "85 MPa√m"
    },
    "microstructure": {
      "microscope": ["SEM", "TEM"],
      "microscope_target": ["assets/micro_2.jpg"],
      "EBSD_image": ["EBSD_1"],
      "EBSD_image_target": ["assets/ebsd_1.jpg"],
      "phase_fraction": [
        {"phase_name": "martensite", "phase_content": "95%"},
        {"phase_name": "austenite", "phase_content": "5%"}
      ]
    }
  },
  {
    "ref": "Materials & Design",
    "doi": "10.1016/j.matdes.2021.109876",
    "title": "Microstructural evolution and mechanical properties of Ti-6Al-4V manufactured by LPBF",
    "publish_year": "2021",
    "publish_date": "JUL",
    "sample_id": "10.1016-j.matdes-2021-109876_1",
    "composition_content": [
      {"element": "Ti", "content": "balance"},
      {"element": "Al", "content": "6.2%"},
      {"element": "V", "content": "4.1%"},
      {"element": "O", "content": "0.18%"},
      {"element": "N", "content": "0.02%"},
      {"element": "C", "content": "0.08%"},
      {"element": "H", "content": "0.003%"}
    ],
    "alloy_designation_name": "Ti-6Al-4V",
    "printing_parameters": "LPBF: 275W, 1200mm/s, 0.03mm layer thickness",
    "thermal_process": [{
      "temperature": "650 °C",
      "time": "4 hours",
      "cooling_method": "furnace cooling",
      "pressure": "vacuum",
      "atmosphere": "argon"
    }],
    "other_process": "Laser powder bed fusion followed by stress relief annealing",
    "tensile_condition": {
      "tensile_standard": "ASTM E8",
      "tensile_temperature": "room temperature",
      "tensile_speed": "0.5 mm/min",
      "tensile_strategy": "Digital image correlation for strain measurement",
      "sample_shape": "dog-bone specimen"
    },
    "tensile_properties": {
      "stress_strain_curve": "Available",
      "stress_strain_curve_target": "assets/curve_3.jpg",
      "yield_strength": "1050 MPa",
      "ultimate_strength": "1180 MPa",
      "elongation": "12.8%",
      "fracture_toughness": "65 MPa√m"
    },
    "microstructure": {
      "microscope": ["Optical", "SEM"],
      "microscope_target": ["assets/micro_3.jpg"],
      "EBSD_image": ["EBSD_2"],
      "EBSD_image_target": ["assets/ebsd_2.jpg"],
      "phase_fraction": [
        {"phase_name": "alpha", "phase_content": "85%"},
        {"phase_name": "beta", "phase_content": "15%"}
      ]
    }
  },
  {
    "ref": "Acta Materialia",
    "doi": "10.1016/j.actamat.2020.116432",
    "title": "Strengthening mechanisms in 316L stainless steel processed by selective laser melting",
    "publish_year": "2020",
    "publish_date": "DEC",
    "sample_id": "10.1016-j.actamat-2020-116432_1",
    "composition_content": [
      {"element": "Fe", "content": "balance"},
      {"element": "Cr", "content": "17.5%"},
      {"element": "Ni", "content": "12.0%"},
      {"element": "Mo", "content": "2.5%"},
      {"element": "Mn", "content": "1.8%"},
      {"element": "Si", "content": "0.6%"},
      {"element": "C", "content": "0.012%"}
    ],
    "alloy_designation_name": "316L Stainless Steel",
    "printing_parameters": "SLM: 200W, 800mm/s, 0.02mm layer thickness",
    "thermal_process": [{
      "temperature": "1050 °C",
      "time": "1 hour",
      "cooling_method": "water quenching",
      "pressure": "atmospheric",
      "atmosphere": "argon"
    }],
    "other_process": "Selective laser melting with solution annealing treatment",
    "tensile_condition": {
      "tensile_standard": "ASTM E8",
      "tensile_temperature": "room temperature",
      "tensile_speed": "1.0 mm/min",
      "tensile_strategy": "Servo-hydraulic testing machine",
      "sample_shape": "miniature tensile specimen"
    },
    "tensile_properties": {
      "stress_strain_curve": "Available",
      "stress_strain_curve_target": "assets/curve_4.jpg",
      "yield_strength": "497 MPa",
      "ultimate_strength": "685 MPa",
      "elongation": "45.2%",
      "fracture_toughness": "180 MPa√m"
    },
    "microstructure": {
      "microscope": ["Optical", "SEM", "TEM"],
      "microscope_target": ["assets/micro_4.jpg"],
      "EBSD_image": ["EBSD_3"],
      "EBSD_image_target": ["assets/ebsd_3.jpg"],
      "phase_fraction": [
        {"phase_name": "austenite", "phase_content": "100%"}
      ]
    }
  },
  {
    "ref": "Journal of Alloys",
    "doi": "10.1016/j.jallcom.2023.169845",
    "title": "High-strength aluminum alloy 7075-T6 for automotive applications",
    "publish_year": "2023",
    "publish_date": "APR",
    "sample_id": "10.1016-j.jallcom-2023-169845_1",
    "composition_content": [
      {"element": "Al", "content": "balance"},
      {"element": "Zn", "content": "5.8%"},
      {"element": "Mg", "content": "2.4%"},
      {"element": "Cu", "content": "1.6%"},
      {"element": "Cr", "content": "0.23%"},
      {"element": "Fe", "content": "0.15%"},
      {"element": "Si", "content": "0.12%"}
    ],
    "alloy_designation_name": "7075-T6 Aluminum",
    "printing_parameters": "none",
    "thermal_process": [{
      "temperature": "480 °C",
      "time": "1 hour",
      "cooling_method": "water quenching",
      "pressure": "atmospheric",
      "atmosphere": "air"
    }, {
      "temperature": "120 °C",
      "time": "24 hours",
      "cooling_method": "air cooling",
      "pressure": "atmospheric",
      "atmosphere": "air"
    }],
    "other_process": "Solution treatment followed by artificial aging (T6 condition)",
    "tensile_condition": {
      "tensile_standard": "ASTM E8",
      "tensile_temperature": "room temperature",
      "tensile_speed": "2.0 mm/min",
      "tensile_strategy": "Electro-mechanical testing machine",
      "sample_shape": "flat tensile specimen"
    },
    "tensile_properties": {
      "stress_strain_curve": "Available",
      "stress_strain_curve_target": "assets/curve_5.jpg",
      "yield_strength": "520 MPa",
      "ultimate_strength": "580 MPa",
      "elongation": "11.5%",
      "fracture_toughness": "25 MPa√m"
    },
    "microstructure": {
      "microscope": ["Optical", "SEM"],
      "microscope_target": ["assets/micro_5.jpg"],
      "EBSD_image": [],
      "EBSD_image_target": [],
      "phase_fraction": [
        {"phase_name": "aluminum matrix", "phase_content": "92%"},
        {"phase_name": "precipitates", "phase_content": "8%"}
      ]
    }
  },
  {
    "ref": "Materials Science",
    "doi": "10.1007/s11661-019-05234-9",
    "title": "Duplex stainless steel 2205: microstructure and corrosion resistance",
    "publish_year": "2019",
    "publish_date": "SEP",
    "sample_id": "10.1007-s11661-019-05234-9_1",
    "composition_content": [
      {"element": "Fe", "content": "balance"},
      {"element": "Cr", "content": "22.5%"},
      {"element": "Ni", "content": "5.8%"},
      {"element": "Mo", "content": "3.2%"},
      {"element": "N", "content": "0.18%"},
      {"element": "Mn", "content": "1.5%"},
      {"element": "Si", "content": "0.4%"}
    ],
    "alloy_designation_name": "2205 Duplex Stainless Steel",
    "printing_parameters": "none",
    "thermal_process": [{
      "temperature": "1050 °C",
      "time": "30 minutes",
      "cooling_method": "water quenching",
      "pressure": "atmospheric",
      "atmosphere": "nitrogen"
    }],
    "other_process": "Solution annealing to achieve balanced austenite-ferrite structure",
    "tensile_condition": {
      "tensile_standard": "ASTM E8",
      "tensile_temperature": "room temperature",
      "tensile_speed": "1.0 mm/min",
      "tensile_strategy": "Computer-controlled universal testing machine",
      "sample_shape": "round tensile specimen"
    },
    "tensile_properties": {
      "stress_strain_curve": "Available",
      "stress_strain_curve_target": "assets/curve_6.jpg",
      "yield_strength": "450 MPa",
      "ultimate_strength": "680 MPa",
      "elongation": "28.5%",
      "fracture_toughness": "120 MPa√m"
    },
    "microstructure": {
      "microscope": ["Optical", "SEM"],
      "microscope_target": ["assets/micro_6.jpg"],
      "EBSD_image": ["EBSD_4"],
      "EBSD_image_target": ["assets/ebsd_4.jpg"],
      "phase_fraction": [
        {"phase_name": "austenite", "phase_content": "52%"},
        {"phase_name": "ferrite", "phase_content": "48%"}
      ]
    }
  },
  {
    "ref": "Advanced Materials",
    "doi": "10.1002/adma.202108847",
    "title": "Ultra-high strength steel with excellent toughness through novel heat treatment",
    "publish_year": "2021",
    "publish_date": "NOV",
    "sample_id": "10.1002-adma.202108847_1",
    "composition_content": [
      {"element": "Fe", "content": "balance"},
      {"element": "C", "content": "0.25%"},
      {"element": "Mn", "content": "2.1%"},
      {"element": "Si", "content": "1.8%"},
      {"element": "Cr", "content": "1.2%"},
      {"element": "Ni", "content": "0.8%"},
      {"element": "Mo", "content": "0.3%"}
    ],
    "alloy_designation_name": "Advanced High Strength Steel",
    "printing_parameters": "none",
    "thermal_process": [{
      "temperature": "900 °C",
      "time": "10 minutes",
      "cooling_method": "controlled cooling",
      "pressure": "atmospheric",
      "atmosphere": "protective"
    }, {
      "temperature": "400 °C",
      "time": "2 hours",
      "cooling_method": "air cooling",
      "pressure": "atmospheric",
      "atmosphere": "air"
    }],
    "other_process": "Quenching and partitioning (Q&P) heat treatment process",
    "tensile_condition": {
      "tensile_standard": "ASTM E8",
      "tensile_temperature": "room temperature",
      "tensile_speed": "0.5 mm/min",
      "tensile_strategy": "High-resolution extensometry",
      "sample_shape": "sub-size tensile specimen"
    },
    "tensile_properties": {
      "stress_strain_curve": "Available",
      "stress_strain_curve_target": "assets/curve_7.jpg",
      "yield_strength": "1200 MPa",
      "ultimate_strength": "1450 MPa",
      "elongation": "15.8%",
      "fracture_toughness": "95 MPa√m"
    },
    "microstructure": {
      "microscope": ["SEM", "TEM"],
      "microscope_target": ["assets/micro_7.jpg"],
      "EBSD_image": ["EBSD_5"],
      "EBSD_image_target": ["assets/ebsd_5.jpg"],
      "phase_fraction": [
        {"phase_name": "martensite", "phase_content": "70%"},
        {"phase_name": "retained austenite", "phase_content": "20%"},
        {"phase_name": "bainite", "phase_content": "10%"}
      ]
    }
  },
  {
    "ref": "Nature Materials",
    "doi": "10.1038/s41563-022-01234-x",
    "title": "Nanostructured copper alloy with exceptional strength and conductivity",
    "publish_year": "2022",
    "publish_date": "JUN",
    "sample_id": "10.1038-s41563-022-01234-x_1",
    "composition_content": [
      {"element": "Cu", "content": "balance"},
      {"element": "Zr", "content": "0.15%"},
      {"element": "Cr", "content": "0.8%"},
      {"element": "Ag", "content": "0.1%"},
      {"element": "P", "content": "0.02%"},
      {"element": "O", "content": "0.001%"}
    ],
    "alloy_designation_name": "CuCrZr Alloy",
    "printing_parameters": "none",
    "thermal_process": [{
      "temperature": "980 °C",
      "time": "1 hour",
      "cooling_method": "water quenching",
      "pressure": "atmospheric",
      "atmosphere": "hydrogen"
    }, {
      "temperature": "450 °C",
      "time": "4 hours",
      "cooling_method": "air cooling",
      "pressure": "atmospheric",
      "atmosphere": "air"
    }],
    "other_process": "Solution treatment and precipitation hardening",
    "tensile_condition": {
      "tensile_standard": "ASTM E8",
      "tensile_temperature": "room temperature",
      "tensile_speed": "1.0 mm/min",
      "tensile_strategy": "Micro-tensile testing with in-situ monitoring",
      "sample_shape": "micro-tensile specimen"
    },
    "tensile_properties": {
      "stress_strain_curve": "Available",
      "stress_strain_curve_target": "assets/curve_8.jpg",
      "yield_strength": "420 MPa",
      "ultimate_strength": "480 MPa",
      "elongation": "22.5%",
      "fracture_toughness": "55 MPa√m"
    },
    "microstructure": {
      "microscope": ["TEM", "HRTEM"],
      "microscope_target": ["assets/micro_8.jpg"],
      "EBSD_image": [],
      "EBSD_image_target": [],
      "phase_fraction": [
        {"phase_name": "copper matrix", "phase_content": "97%"},
        {"phase_name": "Cr precipitates", "phase_content": "3%"}
      ]
    }
  },
  {
    "ref": "Scripta Materialia",
    "doi": "10.1016/j.scriptamat.2023.115432",
    "title": "Magnesium alloy AZ91 with improved mechanical properties through grain refinement",
    "publish_year": "2023",
    "publish_date": "FEB",
    "sample_id": "10.1016-j.scriptamat-2023-115432_1",
    "composition_content": [
      {"element": "Mg", "content": "balance"},
      {"element": "Al", "content": "9.2%"},
      {"element": "Zn", "content": "0.8%"},
      {"element": "Mn", "content": "0.25%"},
      {"element": "Si", "content": "0.05%"},
      {"element": "Cu", "content": "0.02%"},
      {"element": "Fe", "content": "0.003%"}
    ],
    "alloy_designation_name": "AZ91 Magnesium Alloy",
    "printing_parameters": "none",
    "thermal_process": [{
      "temperature": "415 °C",
      "time": "16 hours",
      "cooling_method": "air cooling",
      "pressure": "atmospheric",
      "atmosphere": "protective"
    }],
    "other_process": "T6 heat treatment with grain refinement additives",
    "tensile_condition": {
      "tensile_standard": "ASTM E8",
      "tensile_temperature": "room temperature",
      "tensile_speed": "1.0 mm/min",
      "tensile_strategy": "Digital extensometer measurement",
      "sample_shape": "standard tensile bar"
    },
    "tensile_properties": {
      "stress_strain_curve": "Available",
      "stress_strain_curve_target": "assets/curve_9.jpg",
      "yield_strength": "165 MPa",
      "ultimate_strength": "285 MPa",
      "elongation": "8.5%",
      "fracture_toughness": "18 MPa√m"
    },
    "microstructure": {
      "microscope": ["Optical", "SEM"],
      "microscope_target": ["assets/micro_9.jpg"],
      "EBSD_image": ["EBSD_6"],
      "EBSD_image_target": ["assets/ebsd_6.jpg"],
      "phase_fraction": [
        {"phase_name": "alpha-Mg", "phase_content": "85%"},
        {"phase_name": "Mg17Al12", "phase_content": "15%"}
      ]
    }
  },
  {
    "ref": "Materials Today",
    "doi": "10.1016/j.mattod.2022.11.023",
    "title": "Inconel 718 superalloy: additive manufacturing and post-processing effects",
    "publish_year": "2022",
    "publish_date": "DEC",
    "sample_id": "10.1016-j.mattod-2022-11023_1",
    "composition_content": [
      {"element": "Ni", "content": "balance"},
      {"element": "Cr", "content": "19.0%"},
      {"element": "Fe", "content": "18.5%"},
      {"element": "Nb", "content": "5.1%"},
      {"element": "Mo", "content": "3.0%"},
      {"element": "Ti", "content": "0.9%"},
      {"element": "Al", "content": "0.5%"}
    ],
    "alloy_designation_name": "Inconel 718",
    "printing_parameters": "EBM: 60mA, 60kV, 0.05mm layer thickness",
    "thermal_process": [{
      "temperature": "980 °C",
      "time": "1 hour",
      "cooling_method": "air cooling",
      "pressure": "atmospheric",
      "atmosphere": "argon"
    }, {
      "temperature": "720 °C",
      "time": "8 hours",
      "cooling_method": "furnace cooling",
      "pressure": "atmospheric",
      "atmosphere": "air"
    }],
    "other_process": "Electron beam melting followed by solution and aging treatment",
    "tensile_condition": {
      "tensile_standard": "ASTM E8",
      "tensile_temperature": "room temperature",
      "tensile_speed": "0.5 mm/min",
      "tensile_strategy": "High-temperature capable testing system",
      "sample_shape": "cylindrical specimen"
    },
    "tensile_properties": {
      "stress_strain_curve": "Available",
      "stress_strain_curve_target": "assets/curve_10.jpg",
      "yield_strength": "1100 MPa",
      "ultimate_strength": "1350 MPa",
      "elongation": "18.2%",
      "fracture_toughness": "110 MPa√m"
    },
    "microstructure": {
      "microscope": ["SEM", "TEM"],
      "microscope_target": ["assets/micro_10.jpg"],
      "EBSD_image": ["EBSD_7"],
      "EBSD_image_target": ["assets/ebsd_7.jpg"],
      "phase_fraction": [
        {"phase_name": "gamma matrix", "phase_content": "85%"},
        {"phase_name": "gamma prime", "phase_content": "10%"},
        {"phase_name": "gamma double prime", "phase_content": "5%"}
      ]
    }
  }
];

// Get all materials with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Mock pagination
    const materials = mockMaterials.slice(skip, skip + limit);
    const total = mockMaterials.length;

    res.json({
      materials,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get material by ID
router.get('/:id', async (req, res) => {
  try {
    const material = mockMaterials.find(m => m.sample_id === req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    res.json(material);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get materials by composition
router.get('/composition/:element', async (req, res) => {
  try {
    const element = req.params.element.toUpperCase();
    const materials = mockMaterials.filter(material => 
      material.composition_content.some(comp => comp.element === element)
    );
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get materials statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = {
      total_materials: mockMaterials.length,
      unique_elements: [...new Set(mockMaterials.flatMap(m => 
        m.composition_content.map(c => c.element)
      ))].length,
      publication_years: [...new Set(mockMaterials.map(m => m.publish_year))].length,
      thermal_processes: mockMaterials.filter(m => m.thermal_process.length > 0).length,
      alloy_systems: [...new Set(mockMaterials.map(m => m.alloy_designation_name).filter(name => name !== 'none'))].length,
      additive_manufacturing: mockMaterials.filter(m => m.printing_parameters !== 'none').length
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
module.exports.mockMaterials = mockMaterials;