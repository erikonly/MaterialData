import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  Database,
  Beaker,
  Thermometer,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import DrillDownModal from "../components/DrillDownModal";

const DashboardPage = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [drillDownData, setDrillDownData] = useState(null);
  const [showDrillDown, setShowDrillDown] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/materials/stats/overview");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts
  const compositionData = [
    { element: "C", count: 850 },
    { element: "Cr", count: 720 },
    { element: "Ni", count: 680 },
    { element: "Mn", count: 640 },
    { element: "Si", count: 580 },
    { element: "Mo", count: 420 },
    { element: "Cu", count: 380 },
    { element: "Al", count: 320 },
  ];

  const strengthDistribution = [
    { range: "0-500", count: 1200, color: "#3b82f6" },
    { range: "500-1000", count: 2800, color: "#10b981" },
    { range: "1000-1500", count: 3200, color: "#f59e0b" },
    { range: "1500-2000", count: 1800, color: "#ef4444" },
    { range: "2000+", count: 600, color: "#8b5cf6" },
  ];

  const yearlyTrends = [
    { year: "2018", publications: 180 },
    { year: "2019", publications: 220 },
    { year: "2020", publications: 280 },
    { year: "2021", publications: 350 },
    { year: "2022", publications: 420 },
    { year: "2023", publications: 480 },
  ];

  const thermalProcesses = [
    { process: "Quenching", count: 1200 },
    { process: "Tempering", count: 980 },
    { process: "Annealing", count: 850 },
    { process: "Normalizing", count: 720 },
    { process: "Aging", count: 650 },
    { process: "Solution Treatment", count: 580 },
  ];

  const handleDrillDown = (detailData, type, title) => {
    setDrillDownData({ data: detailData, type, title });
    setShowDrillDown(true);
  };

  const handleBarClick = (data, index, type, title) => {
    // Mock detailed data for drill-down
    const detailData = {
      category: data.element || data.range || data.process || data.year,
      materials: [
        {
          sample_id: "10.1007-s10853-007-1963-5_1",
          title:
            "Effect of copper additions in directly quenched titanium–boron steels",
          ref: "Springer/10853",
          doi: "10.1007/s10853-007-1963-5",
          publish_year: "2007",
          value: data.count || data.publications,
        },
        {
          sample_id: "10.1007-s10853-008-2145-3_2",
          title: "Microstructural evolution in high-strength steels",
          ref: "Springer/10853",
          doi: "10.1007/s10853-008-2145-3",
          publish_year: "2008",
          value: Math.floor((data.count || data.publications) * 0.7),
        },
        {
          sample_id: "10.1016-j.matdes-2021-109876_1",
          title: "Advanced materials processing techniques",
          ref: "Materials & Design",
          doi: "10.1016/j.matdes.2021.109876",
          publish_year: "2021",
          value: Math.floor((data.count || data.publications) * 0.5),
        },
      ],
    };
    handleDrillDown(
      detailData,
      type,
      `${title} - ${data.element || data.range || data.process || data.year}`
    );
  };

  const statCards = [
    {
      title: "Total Materials",
      value: stats.total_materials || "10,247",
      icon: Database,
      color: "bg-blue-500",
      change: "+12.5%",
    },
    {
      title: "Unique Elements",
      value: stats.unique_elements || "52",
      icon: Beaker,
      color: "bg-green-500",
      change: "+3.8%",
    },
    {
      title: "Publication Years",
      value: stats.publication_years || "25",
      icon: TrendingUp,
      color: "bg-purple-500",
      change: "+2.1%",
    },
    {
      title: "Thermal Processes",
      value: stats.thermal_processes || "8,934",
      icon: Thermometer,
      color: "bg-orange-500",
      change: "+18.2%",
    },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600">
          Comprehensive insights into materials database trends and
          distributions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    {stat.change}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Element Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Element Distribution
            </h3>
            <button className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1">
              <span>Click bars to drill down</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={compositionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="element" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="#3b82f6"
                onClick={(data, index) =>
                  handleBarClick(data, index, "element", "Element Distribution")
                }
                style={{ cursor: "pointer" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Strength Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Strength Distribution (MPa)
            </h3>
            <button className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1">
              <span>Click segments to drill down</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={strengthDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="count"
                label={({ range, count }) => `${range}: ${count}`}
                onClick={(data, index) =>
                  handleBarClick(
                    data,
                    index,
                    "strength",
                    "Strength Distribution"
                  )
                }
                style={{ cursor: "pointer" }}
              >
                {strengthDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Publication Trends */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Publication Trends
            </h3>
            <button className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1">
              <span>Click points to drill down</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={yearlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="publications"
                stroke="#10b981"
                strokeWidth={3}
                onClick={(data, index) =>
                  handleBarClick(data, index, "year", "Publication Trends")
                }
                style={{ cursor: "pointer" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Thermal Processes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Thermal Processes
            </h3>
            <button className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1">
              <span>Click bars to drill down</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={thermalProcesses} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="process" type="category" width={100} />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="#f59e0b"
                onClick={(data, index) =>
                  handleBarClick(data, index, "process", "Thermal Processes")
                }
                style={{ cursor: "pointer" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights Section */}
      <div className="mt-8 card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-2">68%</div>
            <p className="text-sm text-gray-600">
              Materials with strength &gt; 1000 MPa
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">85%</div>
            <p className="text-sm text-gray-600">
              Samples include thermal processing
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">42%</div>
            <p className="text-sm text-gray-600">
              Growth in data collection (2023)
            </p>
          </div>
        </div>
      </div>

      {/* Drill Down Modal */}
      {showDrillDown && drillDownData && (
        <DrillDownModal
          data={drillDownData}
          onClose={() => setShowDrillDown(false)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
