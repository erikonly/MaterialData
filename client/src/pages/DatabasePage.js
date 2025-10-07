import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Plus,
  BarChart3,
  X,
  Send,
  Bot,
  User,
  Lightbulb,
  Loader,
  ExternalLink,
  FileText,
  CheckCircle,
  Clock,
  Play,
  ChevronDown,
  ChevronUp,
  Brain,
  MessageSquare,
  Database as DatabaseIcon,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import MaterialComparison from "../components/MaterialComparison";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

const DatabasePage = () => {
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

  // AI Chat states
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const [streamingSteps, setStreamingSteps] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [expandedCoT, setExpandedCoT] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  // Resizable panel states
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);

  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/materials?page=${currentPage}&limit=10`
      );
      setMaterials(response.data.materials);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast.error(t("errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [currentPage, t]);

  const fetchSuggestions = useCallback(async () => {
    try {
      const response = await axios.get("/api/ai/suggestions");
      setSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      // Use local suggestions as fallback
      setSuggestions(t("database.suggestions"));
    }
  }, [t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchMaterials();
    fetchSuggestions();
  }, [fetchMaterials, fetchSuggestions]);

  // Initialize AI welcome message when translations are loaded
  useEffect(() => {
    if (messages.length === 0 && t("database.aiWelcome")) {
      setMessages([
        {
          type: "ai",
          content: t("database.aiWelcome"),
          timestamp: new Date(),
        },
      ]);
    }
  }, [t, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

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
      toast.success(
        t("database.searchSuccess", { count: response.data.total_results })
      );
    } catch (error) {
      console.error("Error searching materials:", error);
      toast.error(t("database.searchFailed"));
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
        toast.error(t("database.maxComparison"));
        return prev;
      }
    });
  };

  const clearComparison = () => {
    setSelectedMaterials([]);
    setShowComparison(false);
  };

  // AI Chat functions
  const toggleCoTExpansion = (messageIndex) => {
    setExpandedCoT((prev) => ({
      ...prev,
      [messageIndex]: !prev[messageIndex],
    }));
  };

  const updateMaterialsFromAI = (references) => {
    if (references && references.length > 0) {
      // Filter materials based on AI response references
      const referencedSampleIds = references.map((ref) => ref.sample_id);
      const filteredMaterials = materials.filter((material) =>
        referencedSampleIds.includes(material.sample_id)
      );

      if (filteredMaterials.length > 0) {
        setMaterials(filteredMaterials);
        toast.success(
          t("database.materialsUpdated", { count: filteredMaterials.length })
        );
      }
    }
  };

  // Progressive materials loading during CoT
  const updateMaterialsProgressively = (step, allMaterials) => {
    switch (step.step) {
      case 1: // Query Analysis step
        if (step.status === "completed") {
          // Show initial loading state
          const loadingMaterials = Array(8)
            .fill(null)
            .map((_, index) => ({
              sample_id: `skeleton-${index}`,
              title: "Analyzing query requirements...",
              isLoading: true,
              loadingPhase: "query",
              composition_content: [],
              tensile_properties: {},
            }));
          setMaterials(loadingMaterials);
        }
        break;
      case 2: // Database Search step
        if (step.status === "in_progress") {
          const searchingMaterials = Array(8)
            .fill(null)
            .map((_, index) => ({
              sample_id: `searching-${index}`,
              title: "Searching materials database...",
              isLoading: true,
              loadingPhase: "search",
              composition_content: [],
              tensile_properties: {},
            }));
          setMaterials(searchingMaterials);
        } else if (step.status === "completed") {
          const foundMaterials = Array(6)
            .fill(null)
            .map((_, index) => ({
              sample_id: `found-${index}`,
              title: "Found relevant materials, processing...",
              isLoading: true,
              loadingPhase: "found",
              composition_content: [],
              tensile_properties: {},
            }));
          setMaterials(foundMaterials);
        }
        break;
      case 3: // Data Processing step
        if (step.status === "in_progress") {
          // Show first batch of actual materials
          const relevantMaterials = allMaterials.filter(
            (m) =>
              m.tensile_properties?.yield_strength &&
              m.tensile_properties.yield_strength !== "none"
          );

          const firstBatch = relevantMaterials.slice(0, 4).map((material) => ({
            ...material,
            isProcessing: true,
          }));
          setMaterials(firstBatch);
        } else if (step.status === "completed") {
          // Show more materials
          const relevantMaterials = allMaterials.filter(
            (m) =>
              m.tensile_properties?.yield_strength &&
              m.tensile_properties.yield_strength !== "none"
          );

          const moreMaterials = relevantMaterials
            .slice(0, 7)
            .map((material) => ({
              ...material,
              isProcessing: true,
            }));
          setMaterials(moreMaterials);
        }
        break;
      case 4: // Insight Generation step
        if (step.status === "in_progress") {
          // Show all relevant materials
          const relevantMaterials = allMaterials.filter(
            (m) =>
              m.tensile_properties?.yield_strength &&
              m.tensile_properties.yield_strength !== "none"
          );
          setMaterials(relevantMaterials);
        }
        break;
      default:
        break;
    }
  };

  const sendAIMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      type: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    // Check if this is a complex query that should use streaming
    const isComplexQuery =
      message.toLowerCase().includes("yield strength") ||
      message.toLowerCase().includes("martensite") ||
      message.toLowerCase().includes("composition") ||
      message.toLowerCase().includes("heat treatment");

    if (isComplexQuery) {
      await sendStreamingAIMessage(message);
    } else {
      await sendRegularAIMessage(message);
    }
  };

  const sendStreamingAIMessage = async (message) => {
    setIsStreaming(true);
    setStreamingSteps([]);

    // Store original materials for progressive updates
    const originalMaterials = [...materials];

    try {
      const response = await fetch("/api/ai/chat-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          context: messages.slice(-5),
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "step") {
                setStreamingSteps((prev) => {
                  const newSteps = [...prev];
                  const existingIndex = newSteps.findIndex(
                    (s) => s.step === data.data.step
                  );
                  if (existingIndex >= 0) {
                    newSteps[existingIndex] = data.data;
                  } else {
                    newSteps.push(data.data);
                  }

                  // Update materials progressively based on current step
                  updateMaterialsProgressively(data.data, originalMaterials);

                  return newSteps;
                });
              } else if (data.type === "final") {
                const aiMessage = {
                  type: "ai",
                  content: data.data.response,
                  references: data.data.references || [],
                  chainOfThought: streamingSteps,
                  timestamp: new Date(),
                  confidence: data.data.confidence,
                };
                setMessages((prev) => [...prev, aiMessage]);

                // Update materials list based on AI response
                updateMaterialsFromAI(data.data.references);

                setStreamingSteps([]);
                setIsStreaming(false);
              } else if (data.type === "error") {
                throw new Error(data.data.error);
              }
            } catch (parseError) {
              console.error("Error parsing streaming data:", parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error with streaming:", error);
      toast.error("Failed to get AI response");
      setIsStreaming(false);
      setStreamingSteps([]);
      // Restore original materials on error
      setMaterials(originalMaterials);
    }
  };

  const sendRegularAIMessage = async (message) => {
    setIsAILoading(true);

    try {
      const response = await axios.post("/api/ai/chat", {
        message: message,
        context: messages.slice(-5),
      });

      const aiMessage = {
        type: "ai",
        content: response.data.response,
        references: response.data.references || [],
        chainOfThought: response.data.chainOfThought || [],
        timestamp: new Date(),
        confidence: response.data.confidence,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Update materials list based on AI response
      updateMaterialsFromAI(response.data.references);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get AI response");

      const errorMessage = {
        type: "ai",
        content:
          "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAILoading(false);
    }
  };

  const handleAISubmit = (e) => {
    e.preventDefault();
    sendAIMessage();
  };

  const handleSuggestionClick = (question) => {
    sendAIMessage(question);
  };

  // Resizable panel handlers
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Constrain between 25% and 75%
      const constrainedWidth = Math.min(Math.max(newLeftWidth, 25), 75);
      setLeftPanelWidth(constrainedWidth);
    },
    [isResizing]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Keyboard shortcuts for layout changes
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "1":
            e.preventDefault();
            setLeftPanelWidth(30);
            toast.success(
              t("database.layoutChanged", { layout: t("database.layoutChat") })
            );
            break;
          case "2":
            e.preventDefault();
            setLeftPanelWidth(50);
            toast.success(
              t("database.layoutChanged", {
                layout: t("database.layoutBalanced"),
              })
            );
            break;
          case "3":
            e.preventDefault();
            setLeftPanelWidth(70);
            toast.success(
              t("database.layoutChanged", { layout: t("database.layoutData") })
            );
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [t]);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <DatabaseIcon className="w-6 h-6 text-primary-600" />
              <span>{t("database.title")}</span>
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {t("database.subtitle")}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <div className="text-sm text-gray-500">
              {t("database.materialsLoaded", { count: materials.length })}
            </div>

            {/* Layout presets */}
            <div className="flex items-center space-x-1 border-l border-gray-300 pl-4">
              <span className="text-xs text-gray-500">
                {t("database.layout")}:
              </span>
              <button
                onClick={() => setLeftPanelWidth(30)}
                className={`px-2 py-1 text-xs rounded transition-colors duration-200 ${
                  Math.abs(leftPanelWidth - 30) < 5
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title={t("database.layoutChat")}
              >
                {t("database.layoutChat")}
              </button>
              <button
                onClick={() => setLeftPanelWidth(50)}
                className={`px-2 py-1 text-xs rounded transition-colors duration-200 ${
                  Math.abs(leftPanelWidth - 50) < 5
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title={t("database.layoutBalanced")}
              >
                {t("database.layoutBalanced")}
              </button>
              <button
                onClick={() => setLeftPanelWidth(70)}
                className={`px-2 py-1 text-xs rounded transition-colors duration-200 ${
                  Math.abs(leftPanelWidth - 70) < 5
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title={t("database.layoutData")}
              >
                {t("database.layoutData")}
              </button>
            </div>

            {selectedMaterials.length > 0 && (
              <button
                onClick={() => setShowComparison(true)}
                disabled={selectedMaterials.length < 2}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>
                  {t("common.compare")} ({selectedMaterials.length})
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div
        className={`flex-1 flex overflow-hidden ${
          isResizing ? "select-none" : ""
        }`}
        ref={containerRef}
      >
        {/* Left Side - Materials List */}
        <div
          className={`flex flex-col border-r border-gray-200 bg-gray-50 ${
            isResizing
              ? "transition-none"
              : "transition-all duration-300 ease-out"
          }`}
          style={{ width: `${leftPanelWidth}%` }}
        >
          {/* Search and Filters */}
          <div className="bg-white border-b border-gray-200 p-4">
            <form onSubmit={handleSearch} className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("database.searchPlaceholder")}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-1"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Filters */}
              <div className="flex gap-2 text-xs">
                <input
                  type="text"
                  value={filters.element}
                  onChange={(e) =>
                    setFilters({ ...filters, element: e.target.value })
                  }
                  placeholder={t("database.elementPlaceholder")}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                />
                <input
                  type="number"
                  value={filters.yearRange.min}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      yearRange: { ...filters.yearRange, min: e.target.value },
                    })
                  }
                  placeholder={t("database.yearFrom")}
                  className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
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
                  placeholder={t("database.yearTo")}
                  className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </form>
          </div>

          {/* Materials List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2 text-sm">
                    {t("database.loadingMaterials")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {materials.map((material, index) => {
                  const isSelected = selectedMaterials.some(
                    (m) => m.sample_id === material.sample_id
                  );

                  // Render skeleton/loading state
                  if (material.isLoading) {
                    return (
                      <div
                        key={material.sample_id || index}
                        className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-4 h-4 bg-gray-200 rounded mt-1"></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <div className="space-y-2 flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              </div>
                              <div className="flex space-x-1 ml-2">
                                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div>
                                <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                                <div className="flex gap-1">
                                  <div className="h-5 bg-gray-200 rounded-full w-12"></div>
                                  <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                                  <div className="h-5 bg-gray-200 rounded-full w-14"></div>
                                </div>
                              </div>
                              <div>
                                <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-32"></div>
                              </div>
                            </div>

                            {/* Loading phase indicator */}
                            <div className="mt-3 flex items-center space-x-2">
                              <Loader className="w-3 h-3 animate-spin text-primary-600" />
                              <span className="text-xs text-primary-600 font-medium">
                                {material.loadingPhase === "query" &&
                                  t("database.analyzingQuery")}
                                {material.loadingPhase === "search" &&
                                  t("database.searchingDatabase")}
                                {material.loadingPhase === "found" &&
                                  t("database.foundMaterials")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Render actual material
                  return (
                    <div
                      key={material.sample_id || index}
                      className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all duration-200 ${
                        isSelected
                          ? "ring-2 ring-primary-500 bg-primary-50"
                          : "border-gray-200"
                      } ${
                        material.isProcessing
                          ? "ring-1 ring-yellow-300 bg-yellow-50"
                          : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleMaterialSelect(material)}
                          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          disabled={material.isProcessing}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                              {material.title}
                              {material.isProcessing && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Loader className="w-3 h-3 animate-spin mr-1" />
                                  {t("database.processing")}
                                </span>
                              )}
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

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-xs font-medium text-gray-700 mb-1">
                                {t("database.composition")}
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {material.composition_content &&
                                material.composition_content.length > 0 ? (
                                  material.composition_content
                                    .slice(0, 4)
                                    .map((comp, compIndex) => (
                                      <span
                                        key={compIndex}
                                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full mr-1 mb-1"
                                      >
                                        {comp.element}: {comp.content}
                                      </span>
                                    ))
                                ) : (
                                  <span className="text-gray-500 text-xs">
                                    {t("repository.noData")}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-xs font-medium text-gray-700 mb-1">
                                {t("database.properties")}
                              </h4>
                              <div className="text-xs text-gray-600 space-x-3">
                                {material.tensile_properties?.yield_strength !== "none" && (
                                  <span>
                                    {t("database.yieldStrength")}: {material.tensile_properties.yield_strength}
                                  </span>
                                )}
                                {material.tensile_properties?.elongation !== "none" && (
                                  <span>
                                    {t("database.elongation")}: {material.tensile_properties.elongation}
                                  </span>
                                )}
                                {!material.tensile_properties && (
                                  <span className="text-gray-500 text-xs">
                                    {t("repository.noData")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex justify-between items-center">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="text-sm text-gray-600">
                  Page {pagination.current_page} of {pagination.total_pages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, pagination.total_pages)
                    )
                  }
                  disabled={currentPage === pagination.total_pages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Resizable Divider */}
        <div
          className={`relative w-1 bg-gray-300 hover:bg-primary-400 cursor-col-resize flex items-center justify-center group transition-all duration-200 ${
            isResizing ? "bg-primary-500 w-2" : ""
          }`}
          onMouseDown={handleMouseDown}
          title="Drag to resize panels"
        >
          {/* Visual indicator */}
          <div className="absolute inset-y-0 flex flex-col justify-center space-y-1">
            <div className="w-0.5 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <div className="w-0.5 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <div className="w-0.5 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </div>

          {/* Resize tooltip */}
          {isResizing && (
            <div className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg z-10">
              {Math.round(leftPanelWidth)}% | {Math.round(100 - leftPanelWidth)}
              %
            </div>
          )}
        </div>

        {/* Right Side - AI Chat */}
        <div
          className={`flex flex-col bg-white ${
            isResizing
              ? "transition-none"
              : "transition-all duration-300 ease-out"
          }`}
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          {/* Chat Header */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                AI Materials Assistant
              </h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Ask questions about materials properties, and I'll filter the
              results on the left
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex space-x-3 max-w-4xl ${
                    message.type === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === "user"
                        ? "bg-primary-600"
                        : message.isError
                        ? "bg-red-500"
                        : "bg-gray-600"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  <div
                    className={`rounded-lg p-4 ${
                      message.type === "user"
                        ? "bg-primary-600 text-white"
                        : message.isError
                        ? "bg-red-50 text-red-800 border border-red-200"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {/* Chain of Thought Section */}
                    {message.chainOfThought &&
                      message.chainOfThought.length > 0 && (
                        <div className="mb-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                          {/* CoT Header - Always Visible and Clickable */}
                          <button
                            onClick={() => toggleCoTExpansion(index)}
                            className="w-full p-3 flex items-center justify-between hover:bg-purple-100 rounded-lg transition-colors duration-200"
                          >
                            <div className="flex items-center space-x-2">
                              <Brain className="w-4 h-4 text-purple-600" />
                              <div className="text-left">
                                <div className="text-sm font-semibold text-gray-800">
                                  Chain of Thought Analysis
                                </div>
                                <div className="text-xs text-gray-600">
                                  {message.chainOfThought.length} steps • Click
                                  to{" "}
                                  {expandedCoT[index] ? "collapse" : "expand"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                {message.chainOfThought.map(
                                  (step, stepIndex) => (
                                    <div
                                      key={stepIndex}
                                      className={`w-2 h-2 rounded-full ${
                                        step.status === "completed"
                                          ? "bg-green-500"
                                          : step.status === "in_progress"
                                          ? "bg-yellow-500 animate-pulse"
                                          : "bg-gray-300"
                                      }`}
                                    />
                                  )
                                )}
                              </div>
                              {expandedCoT[index] ? (
                                <ChevronUp className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              )}
                            </div>
                          </button>

                          {/* CoT Details - Expandable */}
                          {expandedCoT[index] && (
                            <div className="px-3 pb-3 border-t border-purple-200 bg-white rounded-b-lg">
                              <div className="pt-3">
                                <div className="space-y-3">
                                  {message.chainOfThought.map(
                                    (step, stepIndex) => (
                                      <div
                                        key={stepIndex}
                                        className="flex items-start space-x-3"
                                      >
                                        <div
                                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                            step.status === "completed"
                                              ? "bg-green-100 text-green-700 border border-green-300"
                                              : step.status === "in_progress"
                                              ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                              : "bg-gray-100 text-gray-500 border border-gray-300"
                                          }`}
                                        >
                                          {step.step}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="bg-white rounded p-2 border border-gray-200">
                                            <h4 className="text-xs font-semibold text-gray-900 mb-1">
                                              {step.title}
                                            </h4>
                                            <p className="text-xs text-gray-700 mb-1">
                                              {step.description}
                                            </p>
                                            <div className="bg-blue-50 rounded p-1 border-l-2 border-blue-400">
                                              <p className="text-xs text-blue-800">
                                                💡 {step.details}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>

                    {/* References Section */}
                    {message.references && message.references.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-semibold text-gray-800">
                            Data Sources ({message.references.length} materials)
                          </span>
                        </div>
                        <div className="space-y-2">
                          {message.references
                            .slice(0, 3)
                            .map((ref, refIndex) => (
                              <div
                                key={refIndex}
                                className="bg-blue-50 rounded p-2 border border-blue-200"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h4 className="text-xs font-semibold text-gray-900 mb-1">
                                      {ref.title.substring(0, 50)}...
                                    </h4>
                                    <div className="text-xs text-gray-700">
                                      <div>ID: {ref.sample_id}</div>
                                      <div className="text-blue-700">
                                        Data: {ref.data_point}
                                      </div>
                                    </div>
                                  </div>
                                  <Link
                                    to={`/material/${ref.sample_id}`}
                                    className="ml-2 text-xs bg-primary-600 hover:bg-primary-700 text-white px-2 py-1 rounded"
                                  >
                                    View
                                  </Link>
                                </div>
                              </div>
                            ))}
                          {message.references.length > 3 && (
                            <div className="text-xs text-gray-600 text-center">
                              +{message.references.length - 3} more materials
                              referenced
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {message.confidence && (
                      <div className="text-xs text-gray-500 mt-2">
                        Confidence: {Math.round(message.confidence * 100)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {(isAILoading || isStreaming) && (
              <div className="flex justify-start">
                <div className="flex space-x-3 max-w-full w-full">
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    {isStreaming ? (
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                        {/* Live Analysis Header */}
                        <div className="p-3 border-b border-purple-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Brain className="w-4 h-4 text-purple-600" />
                              <div>
                                <div className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                                  <span>Live Chain of Thought Analysis</span>
                                  <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                    <div
                                      className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                                      style={{ animationDelay: "0.2s" }}
                                    ></div>
                                    <div
                                      className="w-2 h-2 bg-purple-300 rounded-full animate-pulse"
                                      style={{ animationDelay: "0.4s" }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-600">
                                  {
                                    streamingSteps.filter(
                                      (s) => s.status === "completed"
                                    ).length
                                  }{" "}
                                  / {streamingSteps.length} steps completed
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              {streamingSteps.map((step, stepIndex) => (
                                <div
                                  key={stepIndex}
                                  className={`w-2 h-2 rounded-full ${
                                    step.status === "completed"
                                      ? "bg-green-500"
                                      : step.status === "in_progress"
                                      ? "bg-yellow-500 animate-pulse"
                                      : "bg-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Detailed Steps Display */}
                        <div className="p-3 bg-white rounded-b-lg max-h-80 overflow-y-auto">
                          <div className="space-y-3">
                            {streamingSteps.map((step, stepIndex) => (
                              <div key={stepIndex} className="relative">
                                {/* Connection Line */}
                                {stepIndex < streamingSteps.length - 1 && (
                                  <div className="absolute left-4 top-8 w-0.5 h-6 bg-gray-200" />
                                )}

                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0 relative">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                        step.status === "completed"
                                          ? "bg-green-100 text-green-700 border-2 border-green-300"
                                          : step.status === "in_progress"
                                          ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-300 shadow-lg"
                                          : "bg-gray-100 text-gray-500 border-2 border-gray-300"
                                      }`}
                                    >
                                      {step.step}
                                    </div>
                                    {step.status === "in_progress" && (
                                      <div className="absolute -inset-1">
                                        <div className="w-10 h-10 border-2 border-yellow-400 rounded-full animate-ping opacity-75"></div>
                                      </div>
                                    )}
                                    {step.status === "completed" && (
                                      <div className="absolute -top-1 -right-1">
                                        <CheckCircle className="w-3 h-3 text-green-600" />
                                      </div>
                                    )}
                                    {step.status === "in_progress" && (
                                      <div className="absolute -top-1 -right-1">
                                        <Loader className="w-3 h-3 animate-spin text-yellow-600" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div
                                      className={`rounded-lg p-3 border transition-all duration-300 ${
                                        step.status === "completed"
                                          ? "bg-green-50 border-green-200"
                                          : step.status === "in_progress"
                                          ? "bg-yellow-50 border-yellow-200 shadow-sm"
                                          : "bg-gray-50 border-gray-200"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-semibold text-gray-900">
                                          {step.title}
                                        </h4>
                                        <span
                                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                                            step.status === "completed"
                                              ? "bg-green-100 text-green-700"
                                              : step.status === "in_progress"
                                              ? "bg-yellow-100 text-yellow-700"
                                              : "bg-gray-100 text-gray-600"
                                          }`}
                                        >
                                          {step.status === "completed"
                                            ? "✓ Completed"
                                            : step.status === "in_progress"
                                            ? "⏳ Processing..."
                                            : "⏸ Pending"}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-700 mb-2">
                                        {step.description}
                                      </p>
                                      <div
                                        className={`rounded p-2 border-l-4 ${
                                          step.status === "completed"
                                            ? "bg-blue-50 border-blue-400"
                                            : step.status === "in_progress"
                                            ? "bg-yellow-50 border-yellow-400"
                                            : "bg-gray-50 border-gray-400"
                                        }`}
                                      >
                                        <p
                                          className={`text-xs font-medium ${
                                            step.status === "completed"
                                              ? "text-blue-800"
                                              : step.status === "in_progress"
                                              ? "text-yellow-800"
                                              : "text-gray-600"
                                          }`}
                                        >
                                          💡 {step.details}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-100 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <Loader className="w-4 h-4 animate-spin text-gray-600" />
                          <span className="text-gray-600">Analyzing...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="mb-2">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Try asking:
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {suggestions.slice(0, 2).map((category, categoryIndex) => (
                  <div key={categoryIndex}>
                    <div className="flex flex-wrap gap-1">
                      {category.questions
                        .slice(0, 2)
                        .map((question, questionIndex) => (
                          <button
                            key={questionIndex}
                            onClick={() => handleSuggestionClick(question)}
                            className="text-xs text-primary-600 hover:text-primary-800 hover:bg-primary-50 px-2 py-1 rounded border border-primary-200 transition-colors duration-200"
                          >
                            {question.length > 40
                              ? question.substring(0, 40) + "..."
                              : question}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <form onSubmit={handleAISubmit} className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={t("database.aiPlaceholder")}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isAILoading || isStreaming}
              />
              <button
                type="submit"
                disabled={isAILoading || isStreaming || !inputMessage.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isStreaming ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="text-sm">Send</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
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

export default DatabasePage;
