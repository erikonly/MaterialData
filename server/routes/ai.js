const express = require('express');
const router = express.Router();

// Import materials data for RAG-like functionality
const { mockMaterials } = require('./materials');

// Helper function to search materials database
const searchMaterials = (query, filters = {}) => {
  let results = mockMaterials;
  
  // Text search in title and composition
  if (query) {
    const searchTerms = query.toLowerCase().split(' ');
    results = results.filter(material => {
      const searchableText = [
        material.title,
        material.alloy_designation_name,
        ...material.composition_content.map(c => c.element),
        ...(material.microstructure.phase_fraction || []).map(p => p.phase_name)
      ].join(' ').toLowerCase();
      
      return searchTerms.some(term => searchableText.includes(term));
    });
  }
  
  // Filter by element
  if (filters.element) {
    results = results.filter(material =>
      material.composition_content.some(c => 
        c.element.toLowerCase() === filters.element.toLowerCase()
      )
    );
  }
  
  // Filter by strength range
  if (filters.minStrength || filters.maxStrength) {
    results = results.filter(material => {
      const yieldStr = material.tensile_properties.yield_strength;
      if (!yieldStr || yieldStr === 'none') return false;
      
      const strength = parseFloat(yieldStr.replace(/[^\d.]/g, ''));
      if (filters.minStrength && strength < filters.minStrength) return false;
      if (filters.maxStrength && strength > filters.maxStrength) return false;
      return true;
    });
  }
  
  return results;
};

// Helper function to analyze materials for specific properties
const analyzeMaterialProperty = (materials, property) => {
  return materials.map(material => {
    let value = null;
    let unit = '';
    
    switch (property) {
      case 'yield_strength':
        const yieldStr = material.tensile_properties.yield_strength;
        if (yieldStr && yieldStr !== 'none') {
          value = parseFloat(yieldStr.replace(/[^\d.]/g, ''));
          unit = 'MPa';
        }
        break;
      case 'elongation':
        const elongStr = material.tensile_properties.elongation;
        if (elongStr && elongStr !== 'none') {
          value = parseFloat(elongStr.replace(/[^\d.]/g, ''));
          unit = '%';
        }
        break;
      case 'ultimate_strength':
        const ultStr = material.tensile_properties.ultimate_strength;
        if (ultStr && ultStr !== 'none') {
          value = parseFloat(ultStr.replace(/[^\d.]/g, ''));
          unit = 'MPa';
        }
        break;
    }
    
    return {
      sample_id: material.sample_id,
      title: material.title,
      alloy: material.alloy_designation_name,
      value: value,
      unit: unit,
      ref: material.ref,
      doi: material.doi,
      year: material.publish_year
    };
  }).filter(item => item.value !== null);
};

// RAG-based AI conversation endpoint with Chain of Thought
router.post('/chat', async (req, res) => {
  try {
    const { message, context = [] } = req.body;
    
    let response = "";
    let references = [];
    let relevantMaterials = [];
    let chainOfThought = [];
    
    // Analyze query and search database
    if (message.toLowerCase().includes('yield strength') || message.toLowerCase().includes('屈服强度')) {
      chainOfThought.push({
        step: 1,
        title: "Query Analysis",
        description: "Detected yield strength analysis request",
        status: "completed",
        details: "Parsing query for yield strength keywords and analysis requirements"
      });
      
      chainOfThought.push({
        step: 2,
        title: "Database Search",
        description: "Searching materials database for yield strength data",
        status: "in_progress",
        details: "Querying all materials with available yield strength measurements"
      });
      
      // Search for materials with yield strength data
      relevantMaterials = searchMaterials('', {});
      const yieldData = analyzeMaterialProperty(relevantMaterials, 'yield_strength');
      
      chainOfThought[1].status = "completed";
      chainOfThought[1].details = `Found ${yieldData.length} materials with yield strength data`;
      
      chainOfThought.push({
        step: 3,
        title: "Data Processing",
        description: "Analyzing and categorizing yield strength values",
        status: "in_progress",
        details: "Sorting materials by strength levels and calculating statistics"
      });
      
      // Sort by yield strength
      yieldData.sort((a, b) => b.value - a.value);
      
      const highStrength = yieldData.filter(m => m.value > 1000);
      const mediumStrength = yieldData.filter(m => m.value >= 400 && m.value <= 1000);
      const lowStrength = yieldData.filter(m => m.value < 400);
      
      chainOfThought[2].status = "completed";
      chainOfThought[2].details = `Categorized: ${highStrength.length} ultra-high, ${mediumStrength.length} medium, ${lowStrength.length} low strength materials`;
      
      chainOfThought.push({
        step: 4,
        title: "Insight Generation",
        description: "Generating analysis and insights from processed data",
        status: "in_progress",
        details: "Identifying patterns and correlations in yield strength data"
      });
      
      response = `Based on analysis of ${yieldData.length} materials in our database, yield strength varies significantly across different alloy systems and processing conditions:

**Ultra-High Strength Materials (>1000 MPa):**
${highStrength.slice(0, 3).map(m => `- ${m.alloy}: ${m.value} ${m.unit} (${m.title.substring(0, 60)}...)`).join('\n')}

**Medium Strength Materials (400-1000 MPa):**
${mediumStrength.slice(0, 3).map(m => `- ${m.alloy}: ${m.value} ${m.unit} (${m.title.substring(0, 60)}...)`).join('\n')}

**Key Observations:**
1. **Maraging steels** show the highest yield strengths (1940-2050 MPa) due to precipitation hardening
2. **Advanced high-strength steels** achieve 1200+ MPa through Q&P processing
3. **Titanium alloys** provide excellent strength-to-weight ratios (1050+ MPa)
4. **Heat treatment** significantly affects final properties across all systems

The data shows clear correlations between alloy composition, processing parameters, and final yield strength values.`;

      chainOfThought[3].status = "completed";
      chainOfThought[3].details = "Generated comprehensive analysis with material categorization and key insights";

      references = yieldData.slice(0, 5).map(m => ({
        sample_id: m.sample_id,
        title: m.title,
        ref: m.ref,
        doi: m.doi,
        publish_year: m.year,
        relevance: `Yield strength: ${m.value} ${m.unit}`,
        data_point: `${m.value} ${m.unit}`
      }));
      
      chainOfThought.push({
        step: 5,
        title: "Reference Compilation",
        description: "Compiling data sources and references",
        status: "completed",
        details: `Selected ${references.length} most relevant materials as supporting evidence`
      });
    } else if (message.toLowerCase().includes('martensite') || message.toLowerCase().includes('马氏体')) {
      chainOfThought.push({
        step: 1,
        title: "Microstructure Query Analysis",
        description: "Analyzing martensite-related query",
        status: "completed",
        details: "Detected request for martensite effects on material properties"
      });
      
      chainOfThought.push({
        step: 2,
        title: "Phase Identification",
        description: "Searching for martensitic and non-martensitic materials",
        status: "in_progress",
        details: "Filtering materials by microstructure phase fractions"
      });
      
      // Search for materials with martensite in microstructure
      relevantMaterials = mockMaterials.filter(m => 
        m.microstructure.phase_fraction.some(p => 
          p.phase_name.toLowerCase().includes('martensite')
        )
      );
      
      const nonMartensitic = mockMaterials.filter(m => 
        !m.microstructure.phase_fraction.some(p => 
          p.phase_name.toLowerCase().includes('martensite')
        )
      );
      
      chainOfThought[1].status = "completed";
      chainOfThought[1].details = `Found ${relevantMaterials.length} martensitic and ${nonMartensitic.length} non-martensitic materials`;
      
      chainOfThought.push({
        step: 3,
        title: "Property Extraction",
        description: "Extracting elongation data for comparison",
        status: "in_progress",
        details: "Analyzing elongation values for both material groups"
      });
      
      const martensiteElongation = analyzeMaterialProperty(relevantMaterials, 'elongation');
      const nonMartensiteElongation = analyzeMaterialProperty(nonMartensitic, 'elongation');
      
      chainOfThought[2].status = "completed";
      chainOfThought[2].details = `Extracted elongation data: ${martensiteElongation.length} martensitic, ${nonMartensiteElongation.length} non-martensitic samples`;
      
      chainOfThought.push({
        step: 4,
        title: "Statistical Analysis",
        description: "Calculating averages and comparing groups",
        status: "in_progress",
        details: "Computing statistical differences between material groups"
      });
      
      const avgMartensiteElong = martensiteElongation.reduce((sum, m) => sum + m.value, 0) / martensiteElongation.length;
      const avgNonMartensiteElong = nonMartensiteElongation.reduce((sum, m) => sum + m.value, 0) / nonMartensiteElongation.length;
      
      chainOfThought[3].status = "completed";
      chainOfThought[3].details = `Calculated averages: Martensitic ${avgMartensiteElong.toFixed(1)}%, Non-martensitic ${avgNonMartensiteElong.toFixed(1)}%`;
      
      response = `Analysis of ${relevantMaterials.length} martensitic materials vs ${nonMartensitic.length} non-martensitic materials in our database reveals significant differences in elongation:

**Martensitic Materials:**
${martensiteElongation.map(m => `- ${m.alloy}: ${m.value}% elongation (${m.title.substring(0, 50)}...)`).join('\n')}
*Average elongation: ${avgMartensiteElong.toFixed(1)}%*

**Non-Martensitic Materials:**
${nonMartensiteElongation.slice(0, 3).map(m => `- ${m.alloy}: ${m.value}% elongation (${m.title.substring(0, 50)}...)`).join('\n')}
*Average elongation: ${avgNonMartensiteElong.toFixed(1)}%*

**Key Findings:**
1. **Significant difference**: Non-martensitic materials show ${((avgNonMartensiteElong/avgMartensiteElong - 1) * 100).toFixed(0)}% higher elongation on average
2. **Martensite trade-off**: High strength comes at the cost of ductility
3. **Material design**: Retained austenite and multi-phase structures can improve ductility

The data confirms that martensite formation significantly reduces material ductility due to its hard, brittle nature and restricted dislocation movement.`;

      references = [...martensiteElongation, ...nonMartensiteElongation.slice(0, 2)].map(m => ({
        sample_id: m.sample_id,
        title: m.title,
        ref: m.ref,
        doi: m.doi,
        publish_year: m.year,
        relevance: `Elongation: ${m.value}% (${martensiteElongation.includes(m) ? 'Martensitic' : 'Non-martensitic'})`,
        data_point: `${m.value}% elongation`
      }));
    } else if (message.toLowerCase().includes('composition') || message.toLowerCase().includes('成分')) {
      // Analyze composition effects
      const steels = mockMaterials.filter(m => 
        m.composition_content.some(c => c.element === 'Fe' && c.content.includes('balance')) ||
        m.alloy_designation_name.toLowerCase().includes('steel')
      );
      
      const carbonSteels = steels.filter(m => 
        m.composition_content.some(c => c.element === 'C')
      );
      
      const chromiumSteels = steels.filter(m => 
        m.composition_content.some(c => c.element === 'Cr')
      );
      
      response = `Analysis of ${steels.length} steel materials in our database reveals complex composition-property relationships:

**Carbon Content Effects:**
${carbonSteels.map(m => {
        const cContent = m.composition_content.find(c => c.element === 'C')?.content || 'N/A';
        const yieldStr = m.tensile_properties.yield_strength;
        const yield = yieldStr !== 'none' ? yieldStr : 'N/A';
        return `- ${m.alloy_designation_name}: C=${cContent}, Yield=${yield}`;
      }).join('\n')}

**Chromium Content Effects:**
${chromiumSteels.map(m => {
        const crContent = m.composition_content.find(c => c.element === 'Cr')?.content || 'N/A';
        const yieldStr = m.tensile_properties.yield_strength;
        const yield = yieldStr !== 'none' ? yieldStr : 'N/A';
        return `- ${m.alloy_designation_name}: Cr=${crContent}, Yield=${yield}`;
      }).join('\n')}

**Key Insights:**
1. **Low-carbon, high-strength**: Maraging steel (C=0.03%) achieves 1940 MPa through Ni-Co-Mo precipitation
2. **Stainless steels**: High Cr content (17-22%) provides corrosion resistance but moderate strength
3. **Carbon-chromium synergy**: Advanced steels balance C and Cr for optimal strength-toughness
4. **Alloying strategy**: Multi-element systems outperform simple C+Cr combinations

The data shows that modern alloy design relies on complex multi-element interactions rather than simple binary relationships.`;

      references = [...carbonSteels, ...chromiumSteels].slice(0, 6).map(m => {
        const cContent = m.composition_content.find(c => c.element === 'C')?.content || 'N/A';
        const crContent = m.composition_content.find(c => c.element === 'Cr')?.content || 'N/A';
        return {
          sample_id: m.sample_id,
          title: m.title,
          ref: m.ref,
          doi: m.doi,
          publish_year: m.publish_year,
          relevance: `C=${cContent}, Cr=${crContent}`,
          data_point: `C: ${cContent}, Cr: ${crContent}`
        };
      });
    } else if (message.toLowerCase().includes('heat treatment') || message.toLowerCase().includes('thermal') || message.toLowerCase().includes('temperature')) {
      // Analyze heat treatment effects
      const heatTreatedMaterials = mockMaterials.filter(m => 
        m.thermal_process && m.thermal_process.length > 0
      );
      
      const tempRanges = {
        low: heatTreatedMaterials.filter(m => {
          const temp = parseInt(m.thermal_process[0].temperature);
          return temp < 500;
        }),
        medium: heatTreatedMaterials.filter(m => {
          const temp = parseInt(m.thermal_process[0].temperature);
          return temp >= 500 && temp < 800;
        }),
        high: heatTreatedMaterials.filter(m => {
          const temp = parseInt(m.thermal_process[0].temperature);
          return temp >= 800;
        })
      };
      
      response = `Analysis of ${heatTreatedMaterials.length} heat-treated materials in our database shows distinct temperature-property relationships:

**Low Temperature Processing (<500°C):**
${tempRanges.low.map(m => `- ${m.alloy_designation_name}: ${m.thermal_process[0].temperature} for ${m.thermal_process[0].time} (${m.tensile_properties.yield_strength})`).join('\n')}

**Medium Temperature Processing (500-800°C):**
${tempRanges.medium.map(m => `- ${m.alloy_designation_name}: ${m.thermal_process[0].temperature} for ${m.thermal_process[0].time} (${m.tensile_properties.yield_strength})`).join('\n')}

**High Temperature Processing (>800°C):**
${tempRanges.high.slice(0, 3).map(m => `- ${m.alloy_designation_name}: ${m.thermal_process[0].temperature} for ${m.thermal_process[0].time} (${m.tensile_properties.yield_strength})`).join('\n')}

**Processing Insights:**
1. **Aging treatments** (400-500°C) optimize precipitation hardening in Al and Ni alloys
2. **Solution treatments** (800-1050°C) dissolve precipitates and homogenize structure
3. **Cooling method** significantly affects final microstructure and properties
4. **Time-temperature combinations** must be optimized for each alloy system`;

      references = heatTreatedMaterials.slice(0, 5).map(m => ({
        sample_id: m.sample_id,
        title: m.title,
        ref: m.ref,
        doi: m.doi,
        publish_year: m.publish_year,
        relevance: `Heat treatment: ${m.thermal_process[0].temperature} for ${m.thermal_process[0].time}`,
        data_point: `${m.thermal_process[0].temperature}, ${m.thermal_process[0].time}`
      }));
      
    } else if (message.toLowerCase().includes('additive') || message.toLowerCase().includes('3d print') || message.toLowerCase().includes('lpbf') || message.toLowerCase().includes('slm')) {
      // Analyze additive manufacturing materials
      const amMaterials = mockMaterials.filter(m => 
        m.printing_parameters !== 'none'
      );
      
      response = `Analysis of ${amMaterials.length} additively manufactured materials in our database:

**Additive Manufacturing Processes:**
${amMaterials.map(m => `- ${m.alloy_designation_name}: ${m.printing_parameters} (Yield: ${m.tensile_properties.yield_strength})`).join('\n')}

**Key Findings:**
1. **LPBF Ti-6Al-4V**: Achieves 1050 MPa yield strength with proper heat treatment
2. **SLM 316L**: Shows 497 MPa yield with excellent ductility (45.2% elongation)
3. **EBM Inconel 718**: Reaches 1100 MPa yield strength after aging treatment

**AM vs Conventional Processing:**
- AM materials often require post-processing heat treatment
- Rapid cooling rates create unique microstructures
- Layer-by-layer building affects mechanical anisotropy
- Powder characteristics influence final properties`;

      references = amMaterials.map(m => ({
        sample_id: m.sample_id,
        title: m.title,
        ref: m.ref,
        doi: m.doi,
        publish_year: m.publish_year,
        relevance: `AM Process: ${m.printing_parameters}`,
        data_point: m.printing_parameters
      }));
      
    } else {
      // General database overview
      const totalMaterials = mockMaterials.length;
      const alloyTypes = [...new Set(mockMaterials.map(m => m.alloy_designation_name).filter(name => name !== 'none'))];
      const elements = [...new Set(mockMaterials.flatMap(m => m.composition_content.map(c => c.element)))];
      
      response = `I can analyze materials data from our comprehensive database containing ${totalMaterials} materials across ${alloyTypes.length} alloy systems.

**Database Coverage:**
- **Alloy Systems**: ${alloyTypes.slice(0, 5).join(', ')}, and more
- **Elements**: ${elements.length} unique elements (${elements.slice(0, 10).join(', ')}, etc.)
- **Properties**: Mechanical, thermal, and microstructural data
- **Processing**: Conventional and additive manufacturing

**Available Analyses:**
- **Composition Effects**: "How does carbon content affect strength?"
- **Heat Treatment**: "Compare different thermal processing methods"
- **Microstructure**: "Analyze martensite effects on ductility"
- **Material Selection**: "Best materials for high-temperature applications"
- **Processing Optimization**: "Additive manufacturing parameter effects"

Ask me specific questions about materials properties, processing, or performance comparisons!`;

      references = mockMaterials.slice(0, 3).map(m => ({
        sample_id: m.sample_id,
        title: m.title,
        ref: m.ref,
        doi: m.doi,
        publish_year: m.publish_year,
        relevance: "Database sample material",
        data_point: `${m.alloy_designation_name} sample`
      }));
    }

    res.json({
      response,
      references,
      chainOfThought,
      context: [...context, { user: message, ai: response }],
      timestamp: new Date().toISOString(),
      confidence: 0.85
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get AI analysis suggestions based on database content
router.get('/suggestions', async (req, res) => {
  try {
    const totalMaterials = mockMaterials.length;
    const amMaterials = mockMaterials.filter(m => m.printing_parameters !== 'none').length;
    const heatTreated = mockMaterials.filter(m => m.thermal_process.length > 0).length;
    
    const suggestions = [
      {
        category: "Strength & Mechanical Properties",
        questions: [
          `Compare yield strength across all ${totalMaterials} materials in the database`,
          "Which materials show the best strength-to-weight ratio?",
          "How does martensite affect elongation in different alloys?",
          "Analyze the strength-ductility trade-off in steels vs titanium alloys"
        ]
      },
      {
        category: "Heat Treatment & Processing", 
        questions: [
          `Analyze heat treatment effects in ${heatTreated} processed materials`,
          "Compare solution treatment temperatures across different alloys",
          "How does cooling method affect final microstructure?",
          "What are the optimal aging parameters for precipitation hardening?"
        ]
      },
      {
        category: "Additive Manufacturing",
        questions: [
          `Compare properties of ${amMaterials} additively manufactured materials`,
          "How do LPBF parameters affect Ti-6Al-4V properties?",
          "What post-processing is needed for AM materials?",
          "Compare AM vs conventional processing for same alloys"
        ]
      },
      {
        category: "Composition Analysis",
        questions: [
          "How does carbon content affect steel properties?",
          "Compare chromium effects in stainless vs duplex steels",
          "Which alloying elements provide the best strengthening?",
          "Analyze multi-element interactions in superalloys"
        ]
      }
    ];

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Streaming Chain of Thought endpoint
router.post('/chat-stream', async (req, res) => {
  try {
    const { message, context = [] } = req.body;
    
    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    const sendStep = (step) => {
      res.write(`data: ${JSON.stringify({ type: 'step', data: step })}\n\n`);
    };

    const sendFinalResponse = (response, references) => {
      res.write(`data: ${JSON.stringify({ 
        type: 'final', 
        data: { response, references, timestamp: new Date().toISOString(), confidence: 0.85 }
      })}\n\n`);
      res.end();
    };

    // Simulate Chain of Thought with delays
    if (message.toLowerCase().includes('yield strength') || message.toLowerCase().includes('屈服强度')) {
      // Step 1
      sendStep({
        step: 1,
        title: "Query Analysis",
        description: "Detected yield strength analysis request",
        status: "in_progress",
        details: "Parsing query for yield strength keywords and analysis requirements"
      });
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      sendStep({
        step: 1,
        title: "Query Analysis",
        description: "Detected yield strength analysis request",
        status: "completed",
        details: "Successfully identified yield strength analysis requirements"
      });

      // Step 2
      sendStep({
        step: 2,
        title: "Database Search",
        description: "Searching materials database for yield strength data",
        status: "in_progress",
        details: "Querying all materials with available yield strength measurements"
      });
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const relevantMaterials = searchMaterials('', {});
      const yieldData = analyzeMaterialProperty(relevantMaterials, 'yield_strength');
      
      sendStep({
        step: 2,
        title: "Database Search",
        description: "Searching materials database for yield strength data",
        status: "completed",
        details: `Found ${yieldData.length} materials with yield strength data`
      });

      // Step 3
      sendStep({
        step: 3,
        title: "Data Processing",
        description: "Analyzing and categorizing yield strength values",
        status: "in_progress",
        details: "Sorting materials by strength levels and calculating statistics"
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      yieldData.sort((a, b) => b.value - a.value);
      const highStrength = yieldData.filter(m => m.value > 1000);
      const mediumStrength = yieldData.filter(m => m.value >= 400 && m.value <= 1000);
      
      sendStep({
        step: 3,
        title: "Data Processing",
        description: "Analyzing and categorizing yield strength values",
        status: "completed",
        details: `Categorized: ${highStrength.length} ultra-high, ${mediumStrength.length} medium strength materials`
      });

      // Step 4
      sendStep({
        step: 4,
        title: "Insight Generation",
        description: "Generating analysis and insights from processed data",
        status: "in_progress",
        details: "Identifying patterns and correlations in yield strength data"
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      sendStep({
        step: 4,
        title: "Insight Generation",
        description: "Generating analysis and insights from processed data",
        status: "completed",
        details: "Generated comprehensive analysis with material categorization and key insights"
      });

      // Final response
      const response = `Based on analysis of ${yieldData.length} materials in our database, yield strength varies significantly across different alloy systems and processing conditions:

**Ultra-High Strength Materials (>1000 MPa):**
${highStrength.slice(0, 3).map(m => `- ${m.alloy}: ${m.value} ${m.unit} (${m.title.substring(0, 60)}...)`).join('\n')}

**Medium Strength Materials (400-1000 MPa):**
${mediumStrength.slice(0, 3).map(m => `- ${m.alloy}: ${m.value} ${m.unit} (${m.title.substring(0, 60)}...)`).join('\n')}

**Key Observations:**
1. **Maraging steels** show the highest yield strengths (1940-2050 MPa) due to precipitation hardening
2. **Advanced high-strength steels** achieve 1200+ MPa through Q&P processing
3. **Titanium alloys** provide excellent strength-to-weight ratios (1050+ MPa)
4. **Heat treatment** significantly affects final properties across all systems

The data shows clear correlations between alloy composition, processing parameters, and final yield strength values.`;

      const references = yieldData.slice(0, 5).map(m => ({
        sample_id: m.sample_id,
        title: m.title,
        ref: m.ref,
        doi: m.doi,
        publish_year: m.year,
        relevance: `Yield strength: ${m.value} ${m.unit}`,
        data_point: `${m.value} ${m.unit}`
      }));

      sendFinalResponse(response, references);
    } else {
      // Default response for other queries
      sendStep({
        step: 1,
        title: "Query Processing",
        description: "Analyzing your question",
        status: "completed",
        details: "Processing general materials science query"
      });
      
      const response = "I can analyze materials data from our comprehensive database. Please ask specific questions about yield strength, martensite effects, composition analysis, or heat treatment for detailed Chain of Thought analysis.";
      sendFinalResponse(response, []);
    }

  } catch (error) {
    res.write(`data: ${JSON.stringify({ type: 'error', data: { error: error.message } })}\n\n`);
    res.end();
  }
});

module.exports = router;