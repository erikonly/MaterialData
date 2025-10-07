export default {
  // Common
  common: {
    loading: 'Loading...',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    download: 'Download',
    compare: 'Compare',
    next: 'Next',
    previous: 'Previous',
    page: 'Page {{current}} of {{total}}',
    noData: 'No data',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info'
  },

  // Navigation
  nav: {
    database: 'Interactive Database',
    repository: 'Data Repository',
    materials: 'Materials',
    comparison: 'Comparison',
    analysis: 'Analysis'
  },

  // Database Page (Interactive)
  database: {
    title: 'Interactive Materials Database',
    subtitle: 'Explore materials data with AI-powered analysis and real-time filtering',
    materialsLoaded: '{{count}} materials loaded',
    layout: 'Layout',
    layoutChat: 'Chat',
    layoutBalanced: 'Balanced',
    layoutData: 'Data',
    searchPlaceholder: 'Search materials...',
    elementPlaceholder: 'Element (e.g., C, Cr)',
    yearFrom: 'Year from',
    yearTo: 'Year to',
    
    // AI Chat
    aiWelcome: 'Hello! I can help you analyze the materials in this database. Ask me about yield strength, composition effects, heat treatment, or any materials science questions. The materials list will update to show relevant data as we chat.',
    aiPlaceholder: 'Ask materials science questions...',
    aiSend: 'Send',
    aiThinking: 'AI is thinking...',
    aiAnalyzing: 'Analyzing query requirements...',
    aiSearching: 'Searching materials database...',
    aiProcessing: 'Processing results...',
    aiGenerating: 'Generating insights...',
    
    // Chain of Thought
    cotTitle: 'Chain of Thought Process',
    cotExpand: 'Expand detailed process',
    cotCollapse: 'Collapse detailed process',
    cotStep1: 'Query Analysis',
    cotStep2: 'Database Search',
    cotStep3: 'Data Processing',
    cotStep4: 'Insight Generation',
    cotInProgress: 'In Progress',
    cotCompleted: 'Completed',
    
    // Materials List
    composition: 'Composition',
    properties: 'Properties',
    thermalProcess: 'Thermal Process',
    yieldStrength: 'Yield Strength',
    elongation: 'Elongation',
    processing: 'Processing',
    
    // Suggestions
    suggestions: [
      'Which materials have the highest yield strength?',
      'What are typical properties of martensitic steels?',
      'How does composition affect mechanical properties?',
      'Show the effect of heat treatment on strength',
      'Compare ductility across different alloy systems'
    ],
    
    // Messages
    searchSuccess: 'Found {{count}} results',
    searchFailed: 'Search failed',
    materialsUpdated: 'Updated materials list to show {{count}} relevant materials',
    maxComparison: 'Maximum 5 materials can be compared at once',
    layoutChanged: 'Layout: {{layout}}',
    
    // Loading states
    loadingMaterials: 'Loading materials data...',
    analyzingQuery: 'Analyzing query requirements...',
    searchingDatabase: 'Searching materials database...',
    foundMaterials: 'Found relevant materials, processing...',
    processingData: 'Processing data...'
  },

  // Data Repository Page
  repository: {
    title: 'Materials Data Repository',
    subtitle: 'Browse and explore comprehensive materials science data',
    materials: 'materials',
    
    // Summary Cards
    totalMaterials: 'Total Materials',
    uniqueElements: 'Unique Elements',
    publicationYears: 'Publication Years',
    heatTreated: 'Heat Treated',
    amProcessed: 'AM Processed',
    avgYield: 'Avg Yield (MPa)',
    
    // Search and Filters
    searchPlaceholder: 'Search materials by title, composition, or properties...',
    advancedFilters: 'Advanced Filters',
    element: 'Element',
    elementPlaceholder: 'e.g., C, Cr, Ni',
    yearRange: 'Year Range',
    yearFrom: 'From',
    yearTo: 'To',
    strengthRange: 'Strength (MPa)',
    strengthMin: 'Min',
    strengthMax: 'Max',
    sortBy: 'Sort By',
    sortTitle: 'Title',
    sortYear: 'Year',
    sortYieldStrength: 'Yield Strength',
    
    // View Controls
    viewMode: 'View',
    listView: 'List',
    gridView: 'Grid',
    selected: '{{count}} selected',
    clearSelection: 'Clear selection',
    
    // Material Properties
    composition: 'Composition',
    properties: 'Properties',
    yieldStrength: 'Yield',
    elongation: 'Elongation',
    noData: 'No data',
    
    // Messages
    filtersCleared: 'Filters cleared',
    searchResults: 'Found {{count}} results',
    loadingMaterials: 'Loading materials...'
  },

  // Material Comparison
  comparison: {
    title: 'Material Comparison',
    close: 'Close',
    export: 'Export',
    composition: 'Composition',
    properties: 'Properties',
    thermal: 'Thermal Processing',
    processing: 'Processing Parameters',
    charts: 'Charts',
    table: 'Table',
    barChart: 'Bar Chart',
    radarChart: 'Radar Chart',
    
    // Properties
    yieldStrength: 'Yield Strength',
    tensileStrength: 'Tensile Strength',
    elongation: 'Elongation',
    hardness: 'Hardness',
    density: 'Density',
    
    // Units
    mpa: 'MPa',
    percent: '%',
    hv: 'HV',
    gcm3: 'g/cm³'
  },

  // Language Switcher
  language: {
    switch: 'Switch Language',
    chinese: '中文',
    english: 'English',
    current: 'Current: {{lang}}'
  },

  // Error Messages
  errors: {
    loadFailed: 'Failed to load',
    searchFailed: 'Search failed',
    networkError: 'Network error',
    serverError: 'Server error',
    notFound: 'Not found',
    unauthorized: 'Unauthorized',
    forbidden: 'Forbidden',
    timeout: 'Request timeout',
    unknown: 'Unknown error'
  },

  // Material Detail Page
  materialDetail: {
    title: 'Material Details',
    backToDatabase: 'Back to Database',
    composition: 'Composition',
    properties: 'Properties',
    thermalProcessing: 'Thermal Processing',
    additiveManufacturing: 'Additive Manufacturing',
    testConditions: 'Test Conditions',
    publication: 'Publication Info',
    doi: 'DOI Link',
    downloadData: 'Download Data',
    yieldStrength: 'Yield Strength',
    tensileStrength: 'Tensile Strength',
    elongation: 'Elongation',
    hardness: 'Hardness',
    density: 'Density',
    temperature: 'Temperature',
    coolingMethod: 'Cooling Method',
    heatingRate: 'Heating Rate',
    holdingTime: 'Holding Time'
  }
};