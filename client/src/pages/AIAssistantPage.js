import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Lightbulb, Loader, ExternalLink, FileText, CheckCircle, Clock, Play, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AIAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: 'Hello! I\'m your AI materials science assistant. I can help you analyze materials data, understand property relationships, and answer questions about heat treatment, composition effects, and microstructure correlations. What would you like to explore?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [streamingSteps, setStreamingSteps] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [expandedCoT, setExpandedCoT] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get('/api/ai/suggestions');
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    // Check if this is a complex query that should use streaming
    const isComplexQuery = message.toLowerCase().includes('yield strength') || 
                          message.toLowerCase().includes('martensite') ||
                          message.toLowerCase().includes('composition') ||
                          message.toLowerCase().includes('heat treatment');

    if (isComplexQuery) {
      await sendStreamingMessage(message);
    } else {
      await sendRegularMessage(message);
    }
  };

  const sendStreamingMessage = async (message) => {
    setIsStreaming(true);
    setStreamingSteps([]);

    try {
      const response = await fetch('/api/ai/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          context: messages.slice(-5)
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'step') {
                setStreamingSteps(prev => {
                  const newSteps = [...prev];
                  const existingIndex = newSteps.findIndex(s => s.step === data.data.step);
                  if (existingIndex >= 0) {
                    newSteps[existingIndex] = data.data;
                  } else {
                    newSteps.push(data.data);
                  }
                  return newSteps;
                });
              } else if (data.type === 'final') {
                const aiMessage = {
                  type: 'ai',
                  content: data.data.response,
                  references: data.data.references || [],
                  chainOfThought: streamingSteps,
                  timestamp: new Date(),
                  confidence: data.data.confidence
                };
                setMessages(prev => [...prev, aiMessage]);
                setStreamingSteps([]);
                setIsStreaming(false);
              } else if (data.type === 'error') {
                throw new Error(data.data.error);
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error with streaming:', error);
      toast.error('Failed to get AI response');
      setIsStreaming(false);
      setStreamingSteps([]);
    }
  };

  const sendRegularMessage = async (message) => {
    setIsLoading(true);

    try {
      const response = await axios.post('/api/ai/chat', {
        message: message,
        context: messages.slice(-5)
      });

      const aiMessage = {
        type: 'ai',
        content: response.data.response,
        references: response.data.references || [],
        chainOfThought: response.data.chainOfThought || [],
        timestamp: new Date(),
        confidence: response.data.confidence
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get AI response');
      
      const errorMessage = {
        type: 'ai',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleSuggestionClick = (question) => {
    sendMessage(question);
  };

  const toggleCoTExpansion = (messageIndex) => {
    setExpandedCoT(prev => ({
      ...prev,
      [messageIndex]: !prev[messageIndex]
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Materials Assistant</h1>
        <p className="text-gray-600">
          Ask questions about materials properties, heat treatment effects, composition analysis, and more.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Suggestions Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <div className="flex items-center space-x-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-900">Suggested Questions</h3>
            </div>
            
            <div className="space-y-4">
              {suggestions.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {category.category}
                  </h4>
                  <div className="space-y-2">
                    {category.questions.map((question, questionIndex) => (
                      <button
                        key={questionIndex}
                        onClick={() => handleSuggestionClick(question)}
                        className="text-left text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 p-2 rounded-md transition-colors duration-200 w-full"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <div className="card h-[600px] flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-primary-600' 
                        : message.isError 
                          ? 'bg-red-500' 
                          : 'bg-gray-600'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    
                    <div className={`rounded-lg p-4 ${
                      message.type === 'user'
                        ? 'bg-primary-600 text-white'
                        : message.isError
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : 'bg-gray-100 text-gray-900'
                    }`}>
                      {/* Chain of Thought Section */}
                      {message.chainOfThought && message.chainOfThought.length > 0 && (
                        <div className="mb-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                          {/* CoT Header - Always Visible and Clickable */}
                          <button
                            onClick={() => toggleCoTExpansion(index)}
                            className="w-full p-4 flex items-center justify-between hover:bg-purple-100 rounded-lg transition-colors duration-200"
                          >
                            <div className="flex items-center space-x-3">
                              <Brain className="w-5 h-5 text-purple-600" />
                              <div className="text-left">
                                <div className="text-sm font-semibold text-gray-800">
                                  Chain of Thought Analysis
                                </div>
                                <div className="text-xs text-gray-600">
                                  {message.chainOfThought.length} reasoning steps • Click to {expandedCoT[index] ? 'collapse' : 'expand'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                {message.chainOfThought.map((step, stepIndex) => (
                                  <div
                                    key={stepIndex}
                                    className={`w-2 h-2 rounded-full ${
                                      step.status === 'completed' 
                                        ? 'bg-green-500' 
                                        : step.status === 'in_progress'
                                          ? 'bg-yellow-500 animate-pulse'
                                          : 'bg-gray-300'
                                    }`}
                                  />
                                ))}
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
                            <div className="px-4 pb-4 border-t border-purple-200 bg-white rounded-b-lg">
                              <div className="pt-4">
                                <div className="text-xs font-medium text-purple-700 mb-3 uppercase tracking-wide">
                                  Detailed Reasoning Process
                                </div>
                                <div className="space-y-4">
                                  {message.chainOfThought.map((step, stepIndex) => (
                                    <div key={stepIndex} className="relative">
                                      {/* Step Connection Line */}
                                      {stepIndex < message.chainOfThought.length - 1 && (
                                        <div className="absolute left-4 top-8 w-0.5 h-8 bg-gray-200" />
                                      )}
                                      
                                      <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 relative">
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                            step.status === 'completed' 
                                              ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                                              : step.status === 'in_progress'
                                                ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                                                : 'bg-gray-100 text-gray-500 border-2 border-gray-300'
                                          }`}>
                                            {step.step}
                                          </div>
                                          {step.status === 'in_progress' && (
                                            <div className="absolute -top-1 -right-1">
                                              <Loader className="w-3 h-3 animate-spin text-yellow-600" />
                                            </div>
                                          )}
                                          {step.status === 'completed' && (
                                            <div className="absolute -top-1 -right-1">
                                              <CheckCircle className="w-3 h-3 text-green-600" />
                                            </div>
                                          )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                              <h4 className="text-sm font-semibold text-gray-900">
                                                {step.title}
                                              </h4>
                                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                step.status === 'completed' 
                                                  ? 'bg-green-100 text-green-700' 
                                                  : step.status === 'in_progress'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-gray-100 text-gray-600'
                                              }`}>
                                                {step.status === 'completed' ? 'Completed' : 
                                                 step.status === 'in_progress' ? 'Processing' : 'Pending'}
                                              </span>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-2">
                                              {step.description}
                                            </p>
                                            <div className="bg-blue-50 rounded p-2 border-l-4 border-blue-400">
                                              <p className="text-xs text-blue-800 font-medium">
                                                💡 {step.details}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Summary Footer */}
                                <div className="mt-4 pt-3 border-t border-gray-200">
                                  <div className="flex items-center justify-between text-xs text-gray-600">
                                    <span>
                                      Analysis completed in {message.chainOfThought.length} steps
                                    </span>
                                    <span>
                                      {message.chainOfThought.filter(s => s.status === 'completed').length} / {message.chainOfThought.length} steps completed
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      
                      {/* References Section */}
                      {message.references && message.references.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <div className="flex items-center space-x-2 mb-3">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-semibold text-gray-800">
                              Data Sources ({message.references.length} materials analyzed)
                            </span>
                          </div>
                          <div className="space-y-3">
                            {message.references.map((ref, refIndex) => (
                              <div key={refIndex} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                      {ref.title}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-700">
                                      <div><span className="font-medium">Sample ID:</span> {ref.sample_id}</div>
                                      <div><span className="font-medium">Year:</span> {ref.publish_year}</div>
                                      <div><span className="font-medium">Reference:</span> {ref.ref}</div>
                                      {ref.data_point && (
                                        <div><span className="font-medium">Data Point:</span> {ref.data_point}</div>
                                      )}
                                    </div>
                                    <div className="mt-2 p-2 bg-blue-100 rounded text-xs">
                                      <span className="font-medium text-blue-800">Relevance:</span>
                                      <span className="text-blue-700 ml-1">{ref.relevance}</span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col space-y-1 ml-3">
                                    {ref.sample_id !== 'database-overview' && !ref.sample_id.includes('analysis') && (
                                      <Link
                                        to={`/material/${ref.sample_id}`}
                                        className="bg-primary-600 hover:bg-primary-700 text-white text-xs px-2 py-1 rounded flex items-center space-x-1"
                                      >
                                        <span>View Details</span>
                                      </Link>
                                    )}
                                    {ref.doi && ref.doi !== 'internal-reference' && (
                                      <a
                                        href={`https://doi.org/${ref.doi}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded flex items-center space-x-1"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>DOI</span>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Note:</strong> All responses are based on analysis of actual materials data from peer-reviewed publications in our database.
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
              
              {(isLoading || isStreaming) && (
                <div className="flex justify-start">
                  <div className="flex space-x-3 max-w-5xl w-full">
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      {isStreaming ? (
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                          {/* Live Analysis Header */}
                          <div className="p-4 border-b border-purple-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Brain className="w-5 h-5 text-purple-600" />
                                <div>
                                  <div className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                                    <span>Live Chain of Thought Analysis</span>
                                    <div className="flex space-x-1">
                                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                      <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {streamingSteps.filter(s => s.status === 'completed').length} / {streamingSteps.length} steps completed
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-1">
                                {streamingSteps.map((step, stepIndex) => (
                                  <div
                                    key={stepIndex}
                                    className={`w-3 h-3 rounded-full ${
                                      step.status === 'completed' 
                                        ? 'bg-green-500' 
                                        : step.status === 'in_progress'
                                          ? 'bg-yellow-500 animate-pulse'
                                          : 'bg-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Live Steps Display */}
                          <div className="p-4 bg-white rounded-b-lg">
                            <div className="space-y-4">
                              {streamingSteps.map((step, stepIndex) => (
                                <div key={stepIndex} className="relative">
                                  {/* Connection Line */}
                                  {stepIndex < streamingSteps.length - 1 && (
                                    <div className="absolute left-4 top-10 w-0.5 h-8 bg-gray-200" />
                                  )}
                                  
                                  <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 relative">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                        step.status === 'completed' 
                                          ? 'bg-green-100 text-green-700 border-2 border-green-300 scale-110' 
                                          : step.status === 'in_progress'
                                            ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300 scale-110 shadow-lg'
                                            : 'bg-gray-100 text-gray-500 border-2 border-gray-300'
                                      }`}>
                                        {step.step}
                                      </div>
                                      {step.status === 'in_progress' && (
                                        <div className="absolute -inset-1">
                                          <div className="w-10 h-10 border-2 border-yellow-400 rounded-full animate-ping opacity-75"></div>
                                        </div>
                                      )}
                                      {step.status === 'completed' && (
                                        <div className="absolute -top-1 -right-1">
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                      )}
                                      {step.status === 'in_progress' && (
                                        <div className="absolute -top-1 -right-1">
                                          <Loader className="w-4 h-4 animate-spin text-yellow-600" />
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <div className={`rounded-lg p-3 border transition-all duration-300 ${
                                        step.status === 'completed' 
                                          ? 'bg-green-50 border-green-200 shadow-sm' 
                                          : step.status === 'in_progress'
                                            ? 'bg-yellow-50 border-yellow-200 shadow-md'
                                            : 'bg-gray-50 border-gray-200'
                                      }`}>
                                        <div className="flex items-center justify-between mb-2">
                                          <h4 className="text-sm font-semibold text-gray-900">
                                            {step.title}
                                          </h4>
                                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                            step.status === 'completed' 
                                              ? 'bg-green-100 text-green-700' 
                                              : step.status === 'in_progress'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-gray-100 text-gray-600'
                                          }`}>
                                            {step.status === 'completed' ? '✓ Completed' : 
                                             step.status === 'in_progress' ? '⏳ Processing...' : '⏸ Pending'}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2">
                                          {step.description}
                                        </p>
                                        <div className={`rounded p-2 border-l-4 ${
                                          step.status === 'completed' 
                                            ? 'bg-blue-50 border-blue-400' 
                                            : step.status === 'in_progress'
                                              ? 'bg-yellow-50 border-yellow-400'
                                              : 'bg-gray-50 border-gray-400'
                                        }`}>
                                          <p className={`text-xs font-medium ${
                                            step.status === 'completed' 
                                              ? 'text-blue-800' 
                                              : step.status === 'in_progress'
                                                ? 'text-yellow-800'
                                                : 'text-gray-600'
                                          }`}>
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
                            <span className="text-gray-600">Analyzing your question...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSubmit} className="flex space-x-4">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about materials properties, heat treatment, composition effects..."
                  className="flex-1 input-field"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || isStreaming || !inputMessage.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isStreaming ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;