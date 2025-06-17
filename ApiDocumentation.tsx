import React, { useState, useEffect } from 'react';
import { 
  Book, 
  FileText, 
  Users, 
  Tag, 
  BarChart3, 
  Play, 
  Copy, 
  Check,
  ChevronDown,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import { apiEndpoints } from '../data/apiDocumentation';
import { LibraryApi } from '../services/mockApi';
import { ApiEndpoint } from '../types/api';

const ApiDocumentation: React.FC = () => {
  const [activeEndpoint, setActiveEndpoint] = useState<string>('');
  const [testResults, setTestResults] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    books: true,
    authors: false,
    categories: false,
    statistics: false
  });

  const methodColors = {
    GET: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    POST: 'bg-blue-100 text-blue-800 border-blue-200',
    PUT: 'bg-amber-100 text-amber-800 border-amber-200',
    DELETE: 'bg-red-100 text-red-800 border-red-200'
  };

  const sectionIcons = {
    books: Book,
    authors: Users,
    categories: Tag,
    statistics: BarChart3
  };

  const groupedEndpoints = {
    books: apiEndpoints.filter(e => e.path.startsWith('/api/books')),
    authors: apiEndpoints.filter(e => e.path.startsWith('/api/authors')),
    categories: apiEndpoints.filter(e => e.path.startsWith('/api/categories')),
    statistics: apiEndpoints.filter(e => e.path.startsWith('/api/stats'))
  };

  const filteredEndpoints = Object.entries(groupedEndpoints).reduce((acc, [key, endpoints]) => {
    const filtered = endpoints.filter(endpoint => {
      const matchesSearch = endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           endpoint.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMethod = selectedMethod === 'ALL' || endpoint.method === selectedMethod;
      return matchesSearch && matchesMethod;
    });
    if (filtered.length > 0) {
      acc[key] = filtered;
    }
    return acc;
  }, {} as { [key: string]: ApiEndpoint[] });

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const testEndpoint = async (endpoint: ApiEndpoint) => {
    const key = `${endpoint.method}-${endpoint.path}`;
    setLoading(prev => ({ ...prev, [key]: true }));
    
    try {
      let result;
      switch (endpoint.path) {
        case '/api/books':
          if (endpoint.method === 'GET') {
            result = await LibraryApi.getAllBooks();
          } else if (endpoint.method === 'POST') {
            result = await LibraryApi.createBook({
              title: 'Test Book',
              author: 'Test Author',
              isbn: `978-${Date.now()}`,
              category: 'Fiction',
              publishedYear: 2024,
              quantity: 5,
              description: 'A test book created via API'
            });
          }
          break;
        case '/api/books/:id':
          if (endpoint.method === 'GET') {
            result = await LibraryApi.getBookById('1');
          } else if (endpoint.method === 'PUT') {
            result = await LibraryApi.updateBook('1', { 
              title: 'Updated Test Book',
              quantity: 10
            });
          } else if (endpoint.method === 'DELETE') {
            result = await LibraryApi.deleteBook('999'); // Use non-existent ID for demo
          }
          break;
        case '/api/authors':
          if (endpoint.method === 'GET') {
            result = await LibraryApi.getAllAuthors();
          } else if (endpoint.method === 'POST') {
            result = await LibraryApi.createAuthor({
              name: 'Test Author',
              biography: 'A test author created via API',
              birthYear: 1980,
              nationality: 'American'
            });
          }
          break;
        case '/api/authors/:id':
          if (endpoint.method === 'GET') {
            result = await LibraryApi.getAuthorById('1');
          } else if (endpoint.method === 'PUT') {
            result = await LibraryApi.updateAuthor('1', {
              biography: 'Updated biography'
            });
          } else if (endpoint.method === 'DELETE') {
            result = await LibraryApi.deleteAuthor('999');
          }
          break;
        case '/api/categories':
          result = await LibraryApi.getAllCategories();
          break;
        case '/api/stats':
          result = await LibraryApi.getStats();
          break;
        default:
          result = { success: false, error: 'Endpoint not implemented for testing' };
      }
      
      setTestResults(prev => ({ ...prev, [key]: result }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [key]: { success: false, error: error.message } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/25">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
            Library Inventory API
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive RESTful API for managing library inventory with full CRUD operations, 
            advanced search capabilities, and real-time statistics.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/20">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search endpoints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="pl-10 pr-8 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white"
              >
                <option value="ALL">All Methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="space-y-8">
          {Object.entries(filteredEndpoints).map(([section, endpoints]) => {
            const Icon = sectionIcons[section];
            const isExpanded = expandedSections[section];
            
            return (
              <div key={section} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <button
                  onClick={() => toggleSection(section)}
                  className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/50 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-2xl font-bold text-gray-900 capitalize">{section}</h2>
                      <p className="text-gray-600">{endpoints.length} endpoint{endpoints.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-6 h-6 text-gray-400 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="w-6 h-6 text-gray-400 transition-transform duration-200" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-8 pb-8 space-y-6">
                    {endpoints.map((endpoint, index) => {
                      const key = `${endpoint.method}-${endpoint.path}`;
                      const isActive = activeEndpoint === key;
                      const testResult = testResults[key];
                      const isLoading = loading[key];
                      const isCopied = copiedStates[key];

                      return (
                        <div
                          key={index}
                          className={`border rounded-xl transition-all duration-300 ${
                            isActive 
                              ? 'border-blue-300 shadow-lg shadow-blue-500/10 bg-blue-50/50' 
                              : 'border-gray-200 hover:border-gray-300 bg-white/50'
                          }`}
                        >
                          <div
                            className="p-6 cursor-pointer"
                            onClick={() => setActiveEndpoint(isActive ? '' : key)}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-4">
                                <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${methodColors[endpoint.method]}`}>
                                  {endpoint.method}
                                </span>
                                <code className="text-lg font-mono text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">
                                  {endpoint.path}
                                </code>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  testEndpoint(endpoint);
                                }}
                                disabled={isLoading}
                                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-emerald-500/25"
                              >
                                <Play className="w-4 h-4" />
                                <span>{isLoading ? 'Testing...' : 'Test'}</span>
                              </button>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{endpoint.description}</p>
                          </div>

                          {isActive && (
                            <div className="border-t border-gray-200 bg-white/30">
                              {/* Parameters */}
                              {endpoint.parameters && endpoint.parameters.length > 0 && (
                                <div className="p-6 border-b border-gray-200">
                                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                    Parameters
                                  </h4>
                                  <div className="space-y-3">
                                    {endpoint.parameters.map((param, paramIndex) => (
                                      <div key={paramIndex} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-2 mb-1">
                                            <code className="text-sm font-mono text-blue-600">{param.name}</code>
                                            <span className="text-xs text-gray-500">({param.type})</span>
                                            {param.required && (
                                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">required</span>
                                            )}
                                          </div>
                                          <p className="text-sm text-gray-700">{param.description}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Request Body */}
                              {endpoint.requestBody && (
                                <div className="p-6 border-b border-gray-200">
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-gray-900 flex items-center">
                                      <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                                      Request Body
                                    </h4>
                                    <button
                                      onClick={() => copyToClipboard(endpoint.requestBody!, `${key}-request`)}
                                      className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                    >
                                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                      <span className="text-sm">{isCopied ? 'Copied!' : 'Copy'}</span>
                                    </button>
                                  </div>
                                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                    <code>{endpoint.requestBody}</code>
                                  </pre>
                                </div>
                              )}

                              {/* Response Example */}
                              <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-semibold text-gray-900 flex items-center">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                                    Response Example
                                  </h4>
                                  <button
                                    onClick={() => copyToClipboard(endpoint.responseExample, `${key}-response`)}
                                    className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                  >
                                    {copiedStates[`${key}-response`] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    <span className="text-sm">{copiedStates[`${key}-response`] ? 'Copied!' : 'Copy'}</span>
                                  </button>
                                </div>
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                  <code>{endpoint.responseExample}</code>
                                </pre>
                              </div>

                              {/* Test Results */}
                              {testResult && (
                                <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-3 ${testResult.success ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                    Test Result
                                  </h4>
                                  <pre className={`p-4 rounded-lg overflow-x-auto text-sm ${
                                    testResult.success 
                                      ? 'bg-emerald-900 text-emerald-100' 
                                      : 'bg-red-900 text-red-100'
                                  }`}>
                                    <code>{JSON.stringify(testResult, null, 2)}</code>
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-600 bg-white/50 px-6 py-3 rounded-full border border-white/20">
            <FileText className="w-5 h-5" />
            <span>Built with React, TypeScript, and Tailwind CSS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocumentation;