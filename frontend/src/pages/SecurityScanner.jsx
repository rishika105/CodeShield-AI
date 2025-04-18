import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const SecurityScanner = () => {
  const [code, setCode] = useState(`def vulnerable_function():\n    password = "hardcoded123"\n    return eval(input("Enter code: "))`);
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [useVulberta, setUseVulberta] = useState(true);
  const [useVuldeepecker, setUseVuldeepecker] = useState(true);
  const [activeTab, setActiveTab] = useState('vulnerabilities');
  const [secureCode, setSecureCode] = useState('');

  // Check backend status
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/health');
        if (response.data && response.data.status === 'healthy') {
          setBackendStatus('connected');
          fetchLanguages();
        } else {
          setBackendStatus('error');
        }
      } catch (err) {
        console.error('Backend connection error:', err);
        setBackendStatus('error');
      }
    };

    checkBackend();
  }, []);

  // Fetch supported languages
  const fetchLanguages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/languages');
      if (response.data && response.data.success) {
        setLanguages(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching languages:', err);
    }
  };

  const analyzeCode = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setSecureCode('');

    try {
      const response = await axios.post('http://localhost:5000/api/scan', {
        code,
        language,
        useVulberta,
        useVuldeepecker
      });

      if (response.data && response.data.success) {
        setResults(response.data.data);

        // Generate secure code from the suggestions
        if (response.data.data.vulnerabilities.length > 0) {
          generateSecureCode(response.data.data.vulnerabilities);
        }
      } else {
        setError(response.data.message || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to connect to the server');
      console.error('Error analyzing code:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate secure code based on suggestions
  const generateSecureCode = (vulnerabilities) => {
    let secureCodeText = code;

    // Extract the suggested fixes that have specific code snippets
    const fixes = vulnerabilities
      .filter(vuln => vuln.suggested_fix && vuln.suggested_fix.includes('```'))
      .map(vuln => {
        // Extract code from markdown code blocks
        const codeMatch = vuln.suggested_fix.match(/```(?:\w+)?\n([\s\S]*?)```/);
        return {
          line: vuln.line,
          originalCode: vuln.code_snippet,
          fixCode: codeMatch ? codeMatch[1].trim() : null,
          type: vuln.vulnerability_type
        };
      })
      .filter(fix => fix.fixCode);

    // Add comments to suggest fixes that don't have specific code
    const codeLines = secureCodeText.split('\n');

    // First pass: Mark lines with vulnerabilities
    const lineMap = new Map();
    vulnerabilities.forEach(vuln => {
      if (vuln.line > 0 && vuln.line <= codeLines.length) {
        if (!lineMap.has(vuln.line)) {
          lineMap.set(vuln.line, []);
        }
        lineMap.get(vuln.line).push(vuln);
      }
    });

    // Second pass: Apply fixes and add comments
    const secureLines = [];

    codeLines.forEach((line, index) => {
      const lineNumber = index + 1;

      if (lineMap.has(lineNumber)) {
        const vulns = lineMap.get(lineNumber);
        const specificFix = fixes.find(fix => fix.line === lineNumber);

        // Add comments for all vulnerabilities on this line
        vulns.forEach(vuln => {
          // Don't add comment if we're going to replace the line with a fix
          if (!specificFix) {
            const commentText = `# SECURITY: ${vuln.vulnerability_type} - ${vuln.suggested_fix ?
              vuln.suggested_fix.replace(/```[\s\S]*?```/g, '').trim() :
              'Consider revising this code for security'
              }`;

            // Wrap long comments
            const wrappedComment = commentText.length > 80 ?
              commentText.match(/.{1,80}(\s|$)/g).join('\n# ') :
              commentText;

            secureLines.push(wrappedComment);
          }
        });

        // If there's a specific code fix, use it, otherwise keep the original line
        if (specificFix) {
          secureLines.push(`# FIXED: ${specificFix.type}`);
          const fixLines = specificFix.fixCode.split('\n');

          // Preserve indentation from the original line if possible
          const originalIndentation = line.match(/^(\s*)/)[0];

          if (fixLines.length === 1) {
            // For single-line fixes, try to maintain the same indentation
            secureLines.push(originalIndentation + fixLines[0].trim());
          } else {
            // For multi-line fixes, add each line with proper indentation
            fixLines.forEach(fixLine => {
              // If the fix line has its own indentation, preserve it relative to the original
              const fixIndentation = fixLine.match(/^(\s*)/)[0];
              const fixContent = fixLine.trimStart();

              if (fixContent) {
                secureLines.push(originalIndentation + fixLine);
              } else {
                // For empty lines in the fix, just add them as is
                secureLines.push(fixLine);
              }
            });
          }
        } else {
          secureLines.push(line);
        }
      } else {
        // No vulnerabilities on this line, keep it as is
        secureLines.push(line);
      }
    });

    // Format the final secure code
    const formattedSecureCode = secureLines.join('\n')
      // Remove any leading whitespace at the start of the code
      .trimStart()
      // Ensure there are no more than two consecutive empty lines
      .replace(/\n{3,}/g, '\n\n');

    setSecureCode(formattedSecureCode);
  };

  return (
    <>
      <div className='absolute top-8 left-10'>
        <Navbar />
      </div>
      <div className="min-h-screen bg-indigoDark-900 flex flex-col">

        <div className="flex-grow p-6 pt-12 mt-5">
          <div className="max-w-6xl mx-auto">
            <header className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white">Code Security Scanner</h1>
              <p className="text-gray-400 mt-2">
                Analyze your code for potential security vulnerabilities
              </p>
              <div className="mt-2">
                {/* <span className={`px-3 py-1 rounded-full text-xs ${backendStatus === 'connected'
                    ? 'bg-green-900 text-green-300'
                    : backendStatus === 'checking'
                      ? 'bg-yellow-900 text-yellow-300'
                      : 'bg-red-900 text-red-300'
                  }`}>
                  Backend: {backendStatus === 'connected'
                    ? 'Connected'
                    : backendStatus === 'checking'
                      ? 'Checking...'
                      : 'Not Connected'}
                </span> */}
                {(() => {
                  if (backendStatus === 'connected') {
                    console.log('🟢 Connected');
                  } else if (backendStatus === 'checking') {
                    console.log('🟡 Checking...');
                  } else {
                    console.log('🔴 Not Connected');
                  }
                })()}

              </div>
            </header>

            {backendStatus === 'error' && (
              <div className="bg-red-900 border border-red-700 text-white p-4 rounded-md mb-6">
                <p className="font-bold">Backend Connection Error</p>
                <p>Please ensure the Flask backend server is running on port 5000.</p>
                <code className="block bg-red-950 p-2 mt-2 rounded text-sm">
                  cd backend && python flask_server.py
                </code>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-indigoDark-800 rounded-xl p-6 border border-indigoDark-600">
                <h2 className="text-xl font-semibold text-white mb-4">Code Input</h2>

                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Programming Language</label>
                  <select
                    className="w-full bg-indigoDark-700 border border-indigoDark-600 rounded-md p-2 text-white"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    {languages.length > 0 ? (
                      languages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))
                    ) : (
                      <option value="python">Python</option>
                    )}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Code</label>
                  <textarea
                    className="w-full bg-indigoDark-700 border border-indigoDark-600 rounded-md p-3 text-white font-mono h-64"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste your code here..."
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Detection Models</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="vulberta"
                        className="mr-2 h-4 w-4"
                        checked={useVulberta}
                        onChange={(e) => setUseVulberta(e.target.checked)}
                      />
                      <label htmlFor="vulberta" className="text-white">
                        VulBERTa Model (Transformer-based vulnerability detection)
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="vuldeepecker"
                        className="mr-2 h-4 w-4"
                        checked={useVuldeepecker}
                        onChange={(e) => setUseVuldeepecker(e.target.checked)}
                      />
                      <label htmlFor="vuldeepecker" className="text-white">
                        VulDeePecker Model (Deep learning-based pattern recognition)
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full py-2 bg-neonBlue-600 hover:bg-neonBlue-500 rounded-md text-white font-medium"
                  onClick={analyzeCode}
                  disabled={loading || backendStatus !== 'connected'}
                >
                  {loading ? 'Analyzing...' : 'Analyze Code'}
                </button>
              </div>

              <div className="bg-indigoDark-800 rounded-xl p-6 border border-indigoDark-600">
                <h2 className="text-xl font-semibold text-white mb-4">Analysis Results</h2>

                {loading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neonBlue-500 mx-auto"></div>
                    <p className="text-gray-400 mt-4">Analyzing your code...</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-900 border border-red-700 text-white p-4 rounded-md">
                    <p className="font-medium">Error</p>
                    <p>{error}</p>
                  </div>
                )}

                {results && (
                  <div>
                    <div className="mb-4 p-3 bg-indigoDark-700 rounded-md">
                      <p className="text-gray-400">Language: <span className="text-white">{results.language}</span></p>
                      <p className="text-gray-400">Vulnerabilities Found: <span className="text-white">{results.vulnerabilities.length}</span></p>

                      {results.score && (
                        <div className="mt-3 pt-3 border-t border-indigoDark-600">
                          <div className="flex justify-between items-center">
                            <p className="text-gray-400">Security Score:</p>
                            <div className="flex items-center">
                              <div className={`text-xl font-bold ${results.score.score > 30 ? 'text-green-400' :
                                results.score.score > 10 ? 'text-yellow-400' :
                                  'text-red-400'
                                }`}>
                                {results.score.score}
                              </div>
                              <span className="text-gray-500 ml-1">/ {results.score.base_score}</span>
                            </div>
                          </div>

                          <div className="w-full bg-indigoDark-900 rounded-full h-2.5 mt-2">
                            <div
                              className={`h-2.5 rounded-full ${results.score.score > 30 ? 'bg-green-500' :
                                results.score.score > 10 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                              style={{ width: `${Math.max(0, Math.min(100, (results.score.score / results.score.base_score) * 100))}%` }}
                            ></div>
                          </div>

                          <div className="mt-3 text-xs text-gray-400">
                            <p>Base Score: {results.score.base_score}</p>
                            <p>Total Deduction: -{results.score.total_deduction} ({results.score.deduction_per_vulnerability} × {results.score.total_vulnerabilities} vulnerabilities)</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {results.vulnerabilities.length === 0 ? (
                      <div className="bg-green-900 text-green-300 p-4 rounded-md">
                        <p className="font-medium">No vulnerabilities detected!</p>
                        <p>Your code looks secure based on our analysis.</p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex border-b border-indigoDark-600 mb-4">
                          <button
                            className={`px-4 py-2 ${activeTab === 'vulnerabilities' ? 'text-neonBlue-400 border-b-2 border-neonBlue-400' : 'text-gray-400'}`}
                            onClick={() => setActiveTab('vulnerabilities')}
                          >
                            Vulnerabilities
                          </button>
                          <button
                            className={`px-4 py-2 ${activeTab === 'fixes' ? 'text-neonBlue-400 border-b-2 border-neonBlue-400' : 'text-gray-400'}`}
                            onClick={() => setActiveTab('fixes')}
                          >
                            Suggested Fixes
                          </button>
                          <button
                            className={`px-4 py-2 ${activeTab === 'secure-code' ? 'text-neonBlue-400 border-b-2 border-neonBlue-400' : 'text-gray-400'}`}
                            onClick={() => setActiveTab('secure-code')}
                          >
                            Secure Code
                          </button>
                        </div>

                        {activeTab === 'vulnerabilities' && (
                          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {results.score && results.score.vulnerability_types && (
                              <div className="bg-indigoDark-700 p-3 rounded-md mb-4">
                                <p className="text-white font-medium mb-2">Vulnerability Breakdown:</p>
                                <div className="grid grid-cols-2 gap-2">
                                  {Object.entries(results.score.vulnerability_types).map(([type, count]) => (
                                    <div key={type} className="flex justify-between">
                                      <span className="text-gray-300 truncate">{type}:</span>
                                      <span className="text-red-400 font-medium ml-2">{count}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {results.vulnerabilities.map((vuln, index) => (
                              <div key={index} className="bg-indigoDark-700 border-l-4 border-red-500 rounded-md p-4">
                                <h3 className="text-lg font-semibold text-white">{vuln.vulnerability_type}</h3>
                                <p className="text-gray-400 mt-1">Line {vuln.line}</p>
                                <pre className="bg-indigoDark-900 p-2 rounded mt-2 text-red-300 overflow-x-auto">
                                  {vuln.code_snippet}
                                </pre>
                                {vuln.explanation && (
                                  <div className="mt-2 text-gray-300">
                                    <p className="font-medium">Explanation:</p>
                                    <p>{vuln.explanation}</p>
                                  </div>
                                )}
                                {vuln.vulnerable_part && (
                                  <div className="mt-2 text-gray-300">
                                    <p className="font-medium">Vulnerable Part:</p>
                                    <code className="bg-red-900/30 px-2 py-1 rounded text-red-300">{vuln.vulnerable_part}</code>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {activeTab === 'fixes' && (
                          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {results.vulnerabilities.map((vuln, index) => (
                              <div key={index} className="bg-indigoDark-700 border-l-4 border-green-500 rounded-md p-4">
                                <h3 className="text-lg font-semibold text-white">{vuln.vulnerability_type}</h3>
                                <p className="text-gray-400 mt-1">Line {vuln.line}</p>
                                <pre className="bg-indigoDark-900 p-2 rounded mt-2 text-red-300 overflow-x-auto">
                                  {vuln.code_snippet}
                                </pre>
                                {vuln.suggested_fix ? (
                                  <div className="mt-2 text-gray-300">
                                    <p className="font-medium">Suggested Fix:</p>
                                    <pre className="bg-green-900/30 p-2 rounded mt-1 text-green-300 overflow-x-auto whitespace-pre-wrap">
                                      {vuln.suggested_fix}
                                    </pre>
                                  </div>
                                ) : (
                                  <div className="mt-2 text-gray-300">
                                    <p className="font-medium">Suggested Fix:</p>
                                    <p className="italic text-gray-400">No specific fix suggestion available for this vulnerability type.</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {activeTab === 'secure-code' && (
                          <div className="space-y-4">
                            <div className="bg-indigoDark-700 rounded-md p-4">
                              <h3 className="text-lg font-semibold text-white mb-2">Secure Version of Your Code</h3>
                              <p className="text-gray-300 text-sm mb-4">
                                This is a suggested secure version with applied fixes. Review and adapt as needed.
                              </p>
                              <div className="bg-indigoDark-900 rounded overflow-auto max-h-[500px]">
                                <table className="min-w-full border-collapse">
                                  <tbody>
                                    {secureCode.split('\n').map((line, i) => (
                                      <tr key={i} className="hover:bg-indigoDark-700">
                                        <td className="py-0 px-2 text-right select-none text-gray-500 border-r border-indigoDark-700 font-mono text-xs w-10">
                                          {i + 1}
                                        </td>
                                        <td className="py-0 px-4 font-mono text-green-300 text-sm whitespace-pre">
                                          {line}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <button
                                className="px-4 py-2 bg-green-700 hover:bg-green-600 rounded-md text-white font-medium"
                                onClick={() => {
                                  setCode(secureCode);
                                  setActiveTab('vulnerabilities');
                                }}
                                disabled={!secureCode}
                              >
                                Apply Secure Code
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!loading && !error && !results && (
                  <div className="text-center py-12 text-gray-400">
                    <p>No analysis results yet.</p>
                    <p>Enter your code and click "Analyze Code" to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div></>
  );
};

export default SecurityScanner; 