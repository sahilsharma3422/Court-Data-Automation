import React, { useState } from 'react';
import { Search, Download, AlertCircle, CheckCircle, Loader2, FileText, Calendar, Users, Scale } from 'lucide-react';

export default function CourtDataFetcher() {
  const [formData, setFormData] = useState({
    caseType: '',
    caseNumber: '',
    year: ''
  });
  const [loading, setLoading] = useState(false);
  const [caseData, setCaseData] = useState(null);
  const [error, setError] = useState(null);
  const [queries, setQueries] = useState([]);

  const caseTypes = [
    'Civil Appeal',
    'Criminal Appeal',
    'Writ Petition',
    'Special Leave Petition',
    'Transfer Petition',
    'Civil Suit',
    'Criminal Case'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.caseType || !formData.caseNumber || !formData.year) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    setCaseData(null);

    try {
      // Simulating API call to backend
      const response = await fetch('http://localhost:3001/api/fetch-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch case data');
      }

      const data = await response.json();
      setCaseData(data);
      
      // Add to queries history
      setQueries(prev => [{
        ...formData,
        timestamp: new Date().toISOString(),
        status: 'success'
      }, ...prev.slice(0, 4)]);

    } catch (err) {
      setError(err.message || 'Failed to fetch case data. Please check your inputs and try again.');
      setQueries(prev => [{
        ...formData,
        timestamp: new Date().toISOString(),
        status: 'error'
      }, ...prev.slice(0, 4)]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJudgment = async () => {
    if (!caseData?.judgmentUrl) {
      alert('No judgment available for download');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/download-judgment?url=${encodeURIComponent(caseData.judgmentUrl)}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `judgment_${formData.caseNumber}_${formData.year}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download judgment');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Scale className="w-12 h-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Court Data Fetcher</h1>
          </div>
          <p className="text-gray-600">Fetch case details and judgments from Indian eCourts portals</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <Search className="w-6 h-6 mr-2 text-indigo-600" />
                Search Case
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Case Type
                  </label>
                  <select
                    name="caseType"
                    value={formData.caseType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Case Type</option>
                    {caseTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Case Number
                  </label>
                  <input
                    type="text"
                    name="caseNumber"
                    value={formData.caseNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., 12345"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="e.g., 2024"
                    min="1950"
                    max="2025"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Fetching Data...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Fetch Case Details
                    </>
                  )}
                </button>
              </form>

              {/* Error Message */}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-800">Error</h3>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Case Data Display */}
              {caseData && (
                <div className="mt-6 space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-green-800 font-semibold">Case details fetched successfully!</span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="flex items-start">
                      <FileText className="w-5 h-5 text-indigo-600 mr-3 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-700 mb-1">Case Number</h3>
                        <p className="text-gray-900">{caseData.caseNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Users className="w-5 h-5 text-indigo-600 mr-3 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-700 mb-1">Parties</h3>
                        <p className="text-gray-900">{caseData.parties}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Calendar className="w-5 h-5 text-indigo-600 mr-3 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-700 mb-1">Filing Date</h3>
                        <p className="text-gray-900">{caseData.filingDate}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Calendar className="w-5 h-5 text-indigo-600 mr-3 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-700 mb-1">Next Hearing</h3>
                        <p className="text-gray-900">{caseData.nextHearing}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-indigo-600 mr-3 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-700 mb-1">Status</h3>
                        <p className="text-gray-900">{caseData.status}</p>
                      </div>
                    </div>

                    {caseData.judgmentUrl && (
                      <button
                        onClick={handleDownloadJudgment}
                        className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download Judgment (PDF)
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Queries Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Queries</h2>
              
              {queries.length === 0 ? (
                <p className="text-gray-500 text-sm">No queries yet</p>
              ) : (
                <div className="space-y-3">
                  {queries.map((query, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        query.status === 'success'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-800">{query.caseType}</p>
                          <p className="text-xs text-gray-600">Case: {query.caseNumber}/{query.year}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(query.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {query.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-indigo-50 rounded-lg shadow-lg p-6 mt-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">How to Use</h3>
              <ul className="text-sm text-indigo-800 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span>Select the case type from dropdown</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span>Enter the case number</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span>Enter the year of filing</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">4.</span>
                  <span>Click fetch to get case details</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}