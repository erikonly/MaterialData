export default {
  // Common
  common: {
    loading: '加载中...',
    search: '搜索',
    filter: '筛选',
    clear: '清除',
    cancel: '取消',
    confirm: '确认',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    view: '查看',
    download: '下载',
    compare: '比较',
    next: '下一页',
    previous: '上一页',
    page: '第 {{current}} 页，共 {{total}} 页',
    noData: '暂无数据',
    error: '错误',
    success: '成功',
    warning: '警告',
    info: '信息'
  },

  // Navigation
  nav: {
    database: '交互式数据库',
    repository: '数据仓库',
    materials: '材料',
    comparison: '比较',
    analysis: '分析'
  },

  // Database Page (Interactive)
  database: {
    title: '交互式材料数据库',
    subtitle: '通过AI驱动的分析和实时筛选探索材料数据',
    materialsLoaded: '已加载 {{count}} 种材料',
    layout: '布局',
    layoutChat: '聊天',
    layoutBalanced: '平衡',
    layoutData: '数据',
    searchPlaceholder: '搜索材料...',
    elementPlaceholder: '元素 (例如: C, Cr)',
    yearFrom: '年份从',
    yearTo: '年份到',
    
    // AI Chat
    aiWelcome: '您好！我可以帮助您分析此数据库中的材料。询问我关于屈服强度、成分效应、热处理或任何材料科学问题。材料列表将根据我们的对话更新以显示相关数据。',
    aiPlaceholder: '询问材料科学问题...',
    aiSend: '发送',
    aiThinking: 'AI正在思考...',
    aiAnalyzing: '分析查询要求...',
    aiSearching: '搜索材料数据库...',
    aiProcessing: '处理结果...',
    aiGenerating: '生成见解...',
    
    // Chain of Thought
    cotTitle: '思维链过程',
    cotExpand: '展开详细过程',
    cotCollapse: '收起详细过程',
    cotStep1: '查询分析',
    cotStep2: '数据库搜索',
    cotStep3: '数据处理',
    cotStep4: '见解生成',
    cotInProgress: '进行中',
    cotCompleted: '已完成',
    
    // Materials List
    composition: '成分',
    properties: '性能',
    thermalProcess: '热处理',
    yieldStrength: '屈服强度',
    elongation: '延伸率',
    processing: '处理中',
    
    // Suggestions
    suggestions: [
      '哪些材料具有最高的屈服强度？',
      '马氏体钢的典型性能是什么？',
      '成分如何影响机械性能？',
      '显示热处理对强度的影响',
      '比较不同合金系统的延展性'
    ],
    
    // Messages
    searchSuccess: '找到 {{count}} 个结果',
    searchFailed: '搜索失败',
    materialsUpdated: '材料列表已更新，显示 {{count}} 个相关材料',
    maxComparison: '最多只能同时比较5种材料',
    layoutChanged: '布局: {{layout}}',
    
    // Loading states
    loadingMaterials: '加载材料数据...',
    analyzingQuery: '分析查询要求...',
    searchingDatabase: '搜索材料数据库...',
    foundMaterials: '找到相关材料，正在处理...',
    processingData: '处理数据中...'
  },

  // Data Repository Page
  repository: {
    title: '材料数据仓库',
    subtitle: '浏览和探索全面的材料科学数据',
    materials: '材料',
    
    // Summary Cards
    totalMaterials: '材料总数',
    uniqueElements: '独特元素',
    publicationYears: '发表年份',
    heatTreated: '热处理',
    amProcessed: 'AM工艺',
    avgYield: '平均屈服强度 (MPa)',
    
    // Search and Filters
    searchPlaceholder: '按标题、成分或性能搜索材料...',
    advancedFilters: '高级筛选',
    element: '元素',
    elementPlaceholder: '例如: C, Cr, Ni',
    yearRange: '年份范围',
    yearFrom: '从',
    yearTo: '到',
    strengthRange: '强度 (MPa)',
    strengthMin: '最小值',
    strengthMax: '最大值',
    sortBy: '排序方式',
    sortTitle: '标题',
    sortYear: '年份',
    sortYieldStrength: '屈服强度',
    
    // View Controls
    viewMode: '视图',
    listView: '列表',
    gridView: '网格',
    selected: '已选择 {{count}} 个',
    clearSelection: '清除选择',
    
    // Material Properties
    composition: '成分',
    properties: '性能',
    yieldStrength: '屈服强度',
    elongation: '延伸率',
    noData: '无数据',
    
    // Messages
    filtersCleared: '筛选条件已清除',
    searchResults: '找到 {{count}} 个结果',
    loadingMaterials: '加载材料中...'
  },

  // Material Comparison
  comparison: {
    title: '材料比较',
    close: '关闭',
    export: '导出',
    composition: '成分',
    properties: '性能',
    thermal: '热处理',
    processing: '加工参数',
    charts: '图表',
    table: '表格',
    barChart: '柱状图',
    radarChart: '雷达图',
    
    // Properties
    yieldStrength: '屈服强度',
    tensileStrength: '抗拉强度',
    elongation: '延伸率',
    hardness: '硬度',
    density: '密度',
    
    // Units
    mpa: 'MPa',
    percent: '%',
    hv: 'HV',
    gcm3: 'g/cm³'
  },

  // Language Switcher
  language: {
    switch: '切换语言',
    chinese: '中文',
    english: 'English',
    current: '当前语言: {{lang}}'
  },

  // Error Messages
  errors: {
    loadFailed: '加载失败',
    searchFailed: '搜索失败',
    networkError: '网络错误',
    serverError: '服务器错误',
    notFound: '未找到',
    unauthorized: '未授权',
    forbidden: '禁止访问',
    timeout: '请求超时',
    unknown: '未知错误'
  },

  // Material Detail Page
  materialDetail: {
    title: '材料详情',
    backToDatabase: '返回数据库',
    downloadData: '下载数据',
    published: '发表时间',
    viewPaper: '查看论文',
    composition: '成分',
    alloyDesignation: '合金牌号',
    thermalProcessing: '热处理',
    temperature: '温度',
    holdingTime: '保温时间',
    coolingMethod: '冷却方式',
    atmosphere: '气氛',
    otherProcesses: '其他工艺',
    additiveManufacturing: '增材制造',
    processingParameters: '工艺参数',
    manufacturingMethod: '制造方法',
    process: '工艺',
    parameters: '参数',
    microstructure: '显微组织',
    phaseFractions: '相分数',
    microscopeReferences: '显微镜参考',
    tensileProperties: '拉伸性能',
    yieldStrength: '屈服强度',
    tensileStrength: '抗拉强度',
    elongation: '延伸率',
    fractureToughness: '断裂韧性',
    testConditions: '测试条件',
    standard: '标准',
    speed: '速度',
    sampleShape: '试样形状',
    publication: '发表信息',
    reference: '参考文献',
    year: '年份',
    month: '月份',
    hardness: '硬度',
    density: '密度',
    heatingRate: '加热速率',
    stressStrainData: '应力-应变数据',
    curveReference: '曲线参考',
    dataLocation: '数据位置'
  }
};