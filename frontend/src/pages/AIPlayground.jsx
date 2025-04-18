import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FaInfoCircle, FaExclamationTriangle, FaCheckCircle, FaSearch, FaTimes } from 'react-icons/fa';
import Navbar from '../components/Navbar';

// Custom CSS for highlighted lines
const customStyle = `
  /* Enhance vulnerable line highlighting */
  .vulnerable-line {
    background-color: rgba(255, 51, 51, 0.8) !important;
    border-left: 4px solid #ff0000 !important;
    margin-left: -4px;
    position: relative;
    display: block;
    cursor: pointer;
  }
  
  .vulnerable-line:hover {
    background-color: rgba(255, 102, 102, 0.9) !important;
  }

  /* Fix for syntax highlighter alignment */
  .linenumber {
    display: inline-block;
    min-width: 30px;
  }
  
  /* Make line numbers more visible */
  span.linenumber {
    opacity: 0.8;
    padding-right: 1em;
  }
  
  /* Enhanced vulnerable line styling */
  .prism-code span[style*="background-color: #ff3333"] {
    border-left: 4px solid #ff0000;
    padding-left: 4px;
    margin-left: -4px;
    border-radius: 0;
  }
`;

const AIPlayground = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [languages, setLanguages] = useState(['javascript', 'python', 'java', 'php']);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);
  const [isEditing, setIsEditing] = useState(true);
  const codeContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const [vulnerableLines, setVulnerableLines] = useState(new Set());

  const [exampleCode, setExampleCode] = useState({
    javascript: `// Example vulnerable code
function processUserData(userData) {
  const userId = userData.id;
  // Vulnerable to SQL injection
  const query = "SELECT * FROM users WHERE id = " + userId;
  
  // Vulnerable to XSS
  document.getElementById('username').innerHTML = userData.name;
  
  // Vulnerable to command injection
  const cmd = "grep " + userData.search + " /var/log/app.log";
  exec(cmd);
  
  return query;
}`,
    python: `# Example vulnerable code
def process_user_data(user_data):
    user_id = user_data.get('id')
    # Vulnerable to SQL injection
    query = "SELECT * FROM users WHERE id = " + user_id
    
    # Vulnerable to command injection
    cmd = f"grep {user_data.get('search')} /var/log/app.log"
    os.system(cmd)
    
    # Vulnerable to path traversal
    file_path = user_data.get('file')
    with open(file_path, 'r') as f:
        data = f.read()
    
    return query`
  });

  // Check backend status on component mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/health');
        if (response.data && response.data.status === 'healthy') {
          setBackendStatus('connected');
          setCode(exampleCode[language] || '');
        } else {
          setBackendStatus('error');
        }
      } catch (err) {
        console.error('Backend connection error:', err);
        setBackendStatus('error');
      }
    };

    checkBackend();
  }, [language]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [code]);

  const analyzeCode = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setSelectedVulnerability(null);
      setIsEditing(false);

      console.log('Analyzing code:', code);

      const response = await fetch('http://localhost:5000/api/advanced-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          language: language
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const apiResponse = await response.json() || {};
      console.log('Full API response:', apiResponse);

      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'API returned unsuccessful response');
      }

      // Get the result data from the API response
      const result = apiResponse.data || {};
      console.log('Processing data:', result);

      // Reset vulnerable lines
      const newVulnerableLines = new Set();

      // Check if we have vulnerabilities directly in result or in result.vulnerabilities
      let vulnerabilities = [];

      if (Array.isArray(result)) {
        // If the result itself is an array of vulnerabilities
        console.log('Result is an array, treating as vulnerabilities');
        vulnerabilities = result;
      } else if (result.vulnerabilities && Array.isArray(result.vulnerabilities)) {
        // If vulnerabilities are in result.vulnerabilities
        console.log('Using result.vulnerabilities');
        vulnerabilities = result.vulnerabilities;
      } else if (typeof result === 'object') {
        // Search for any array property that might contain vulnerabilities
        console.log('Searching for vulnerability arrays in result object');
        for (const key in result) {
          if (Array.isArray(result[key]) && result[key].length > 0) {
            const firstItem = result[key][0];
            if (firstItem && (
              firstItem.vulnerability_type ||
              firstItem.type ||
              firstItem.description ||
              firstItem.line_number ||
              firstItem.lineNumber)) {
              console.log(`Found potential vulnerabilities array in property: ${key}`);
              vulnerabilities = result[key];
              break;
            }
          }
        }
      }

      console.log('Final vulnerabilities array:', vulnerabilities);
      console.log('Vulnerabilities array length:', vulnerabilities.length);

      try {
        // Process vulnerabilities if they exist
        if (Array.isArray(vulnerabilities) && vulnerabilities.length > 0) {
          console.log('Processing vulnerabilities:', vulnerabilities);

          // First pass: try to extract exact line numbers
          vulnerabilities.forEach(vuln => {
            if (!vuln) return;

            // Direct line number properties
            if (typeof vuln.line_number === 'number' && vuln.line_number > 0) {
              newVulnerableLines.add(vuln.line_number);
              return;
            }

            if (typeof vuln.lineNumber === 'number' && vuln.lineNumber > 0) {
              newVulnerableLines.add(vuln.lineNumber);
              return;
            }

            // Array of line numbers
            if (Array.isArray(vuln.line_numbers) && vuln.line_numbers.length > 0) {
              vuln.line_numbers.forEach(num => {
                if (typeof num === 'number' && num > 0) {
                  newVulnerableLines.add(num);
                } else if (typeof num === 'string' && !isNaN(parseInt(num))) {
                  newVulnerableLines.add(parseInt(num));
                }
              });
              if (newVulnerableLines.size > 0) return;
            }

            // Single line number as string
            if (typeof vuln.line_number === 'string') {
              const num = parseInt(vuln.line_number);
              if (!isNaN(num) && num > 0) {
                newVulnerableLines.add(num);
                return;
              }
            }

            if (typeof vuln.lineNumber === 'string') {
              const num = parseInt(vuln.lineNumber);
              if (!isNaN(num) && num > 0) {
                newVulnerableLines.add(num);
                return;
              }
            }

            // Line property as string possibly containing numbers
            if (typeof vuln.line === 'string') {
              const matches = vuln.line.match(/\d+/g);
              if (matches) {
                matches.forEach(match => {
                  const num = parseInt(match);
                  if (!isNaN(num) && num > 0) newVulnerableLines.add(num);
                });
                if (newVulnerableLines.size > 0) return;
              }
            }

            // Extract from description as last resort
            if (typeof vuln.description === 'string') {
              const matches = vuln.description.match(/line\s+(\d+)/gi);
              if (matches) {
                matches.forEach(match => {
                  const numMatch = match.match(/\d+/);
                  if (numMatch) {
                    const num = parseInt(numMatch[0]);
                    if (!isNaN(num) && num > 0) newVulnerableLines.add(num);
                  }
                });
              }
            }
          });

          // If we couldn't extract any line numbers, use targeted lines from the code
          if (newVulnerableLines.size === 0) {
            // Find common vulnerable patterns in the code
            const lines = code.split('\n');
            lines.forEach((line, index) => {
              const lineNum = index + 1;
              // SQL Injection patterns
              if (line.includes('SELECT') &&
                (line.includes(' + ') || line.includes('${') || line.includes("'+"))) {
                newVulnerableLines.add(lineNum);
              }
              // XSS patterns
              if (line.includes('innerHTML') || line.includes('document.write(')) {
                newVulnerableLines.add(lineNum);
              }
              // Command injection patterns
              if ((line.includes('exec(') || line.includes('system(') || line.includes('os.system') ||
                line.includes('subprocess')) &&
                (line.includes(' + ') || line.includes('${') || line.includes("'+"))) {
                newVulnerableLines.add(lineNum);
              }
            });
          }

          // If still no line numbers, assign to the most relevant line
          if (newVulnerableLines.size === 0) {
            vulnerabilities.forEach(vuln => {
              const vulnType = vuln.vulnerability_type || vuln.type || '';
              const lines = code.split('\n');

              // Try to find a relevant line based on vulnerability type
              for (let i = 0; i < lines.length; i++) {
                const lineNum = i + 1;
                const line = lines[i].toLowerCase();
                const matchesPattern =
                  (vulnType.includes('sql') && line.includes('select')) ||
                  (vulnType.includes('xss') && (line.includes('innerhtml') || line.includes('document.write'))) ||
                  (vulnType.includes('command') && (line.includes('exec') || line.includes('system'))) ||
                  (vulnType.includes('path') && line.includes('open('));

                if (matchesPattern) {
                  newVulnerableLines.add(lineNum);
                  break;
                }
              }

              // If still nothing, add a default line
              if (newVulnerableLines.size === 0 && lines.length > 0) {
                // Try to find a non-comment, non-empty line
                for (let i = 0; i < lines.length; i++) {
                  const lineNum = i + 1;
                  const line = lines[i].trim();
                  if (line && !line.startsWith('//') && !line.startsWith('#')) {
                    newVulnerableLines.add(lineNum);
                    break;
                  }
                }

                // If still nothing, default to line 1
                if (newVulnerableLines.size === 0) {
                  newVulnerableLines.add(1);
                }
              }
            });
          }
        } else {
          console.warn('No vulnerabilities found in the response');
        }
      } catch (vulnError) {
        console.error('Error processing vulnerabilities:', vulnError);
      }

      console.log('Final vulnerable lines:', [...newVulnerableLines]);

      // If result has vulnerabilities but we couldn't extract line numbers,
      // force at least one line to be marked as vulnerable
      if (vulnerabilities.length > 0 && newVulnerableLines.size === 0) {
        console.log('Found vulnerabilities but no line numbers, adding default line');
        newVulnerableLines.add(1);
      }

      // Store the vulnerabilities in state for later use
      if (Array.isArray(result.vulnerabilities)) {
        // Keep the original structure
        setAnalysisResult(result);
      } else {
        // Create a compatible structure
        setAnalysisResult({
          ...result,
          vulnerabilities: vulnerabilities
        });
      }

      console.log('Setting vulnerable lines:', [...newVulnerableLines]);
      setVulnerableLines(newVulnerableLines);

    } catch (err) {
      console.error('Error analyzing code:', err);
      setError(err.message || 'An error occurred while analyzing the code');
      // Even on error, render the original code without highlights
      setAnalysisResult({});
      setVulnerableLines(new Set());
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    // Don't automatically change the code if the user has already input something
    if (!code.trim() || code === exampleCode[language]) {
      setCode(exampleCode[newLang] || '');
    }
  };

  // Load example code
  const loadExample = () => {
    setCode(exampleCode[language] || '');
    setIsEditing(true);
    setAnalysisResult(null);
    setSelectedVulnerability(null);
  };

  const clearCode = () => {
    setCode('');
    setAnalysisResult(null);
    setIsEditing(true);
    setSelectedVulnerability(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const editCode = () => {
    setIsEditing(true);
    setAnalysisResult(null);
    setSelectedVulnerability(null);
  };

  const handleLineClick = (lineNumber) => {
    if (!vulnerableLines.has(lineNumber)) return;

    console.log(`Clicked on vulnerable line ${lineNumber}`);

    // Get the current line of code for display
    const lines = code.split('\n');
    const lineCode = lineNumber <= lines.length ? lines[lineNumber - 1] : '';

    // Try to find a vulnerability associated with this line number
    let relatedVulnerability = null;

    try {
      relatedVulnerability = findVulnerabilityForLine(lineNumber);

      // Default vulnerability if none found
      if (!relatedVulnerability) {
        console.log('No exact vulnerability match, creating generic vulnerability');
        // Create a generic vulnerability object
        relatedVulnerability = {
          vulnerability_type: "Security Vulnerability",
          description: "This line contains potentially vulnerable code that could expose your application to security risks.",
          code_snippet: lineCode,
          lineNumber: lineNumber,
          suggested_fix: "Review the code for proper input validation, sanitization, and use of secure coding practices."
        };
      }

      console.log('Setting vulnerability details:', relatedVulnerability);

      const vulnerabilityToShow = {
        ...relatedVulnerability,
        lineNumber: lineNumber, // Always use the clicked line number
        // Use the current line code for display
        code_snippet: lineCode
      };

      setSelectedVulnerability(vulnerabilityToShow);
    } catch (error) {
      console.error("Error handling line click:", error);
      // Create a fallback vulnerability with the correct line
      const fallbackVulnerability = {
        vulnerability_type: "Security Vulnerability",
        description: "This line contains potentially vulnerable code that could expose your application to security risks.",
        code_snippet: lineCode,
        lineNumber: lineNumber,
        suggested_fix: "Review the code for proper input validation, sanitization, and use of secure coding practices."
      };
      setSelectedVulnerability(fallbackVulnerability);
    }
  };

  // Helper function to find a vulnerability for a specific line
  const findVulnerabilityForLine = (lineNumber) => {
    if (!analysisResult) return null;

    // Check if we have vulnerabilities directly in result or in result.vulnerabilities
    let vulnerabilities = [];

    if (Array.isArray(analysisResult)) {
      vulnerabilities = analysisResult;
    } else if (analysisResult.vulnerabilities && Array.isArray(analysisResult.vulnerabilities)) {
      vulnerabilities = analysisResult.vulnerabilities;
    } else if (typeof analysisResult === 'object') {
      // Use the first array property that might be vulnerabilities
      for (const key in analysisResult) {
        if (Array.isArray(analysisResult[key])) {
          vulnerabilities = analysisResult[key];
          break;
        }
      }
    }

    return vulnerabilities.find(vuln => {
      if (!vuln) return false;

      // Direct line number match
      if (vuln.line_number === lineNumber || vuln.lineNumber === lineNumber) {
        return true;
      }

      // Check line_numbers array
      if (Array.isArray(vuln.line_numbers) &&
        vuln.line_numbers.some(num => Number(num) === lineNumber)) {
        return true;
      }

      // Check lines array
      if (Array.isArray(vuln.lines) &&
        vuln.lines.some(num => Number(num) === lineNumber)) {
        return true;
      }

      // Check line property for number match
      if (vuln.line && typeof vuln.line === 'string') {
        const matches = vuln.line.match(/\d+/g);
        if (matches && matches.some(match => parseInt(match) === lineNumber)) {
          return true;
        }
      }

      // Check description for line mentions
      if (vuln.description && typeof vuln.description === 'string') {
        const regex = new RegExp(`line\\s+${lineNumber}\\b`, 'i');
        if (regex.test(vuln.description)) {
          return true;
        }
      }

      return false;
    });
  };

  const getLineClassName = (lineNumber) => {
    // Convert to number to ensure proper comparison
    lineNumber = Number(lineNumber);
    if (vulnerableLines.has(lineNumber)) {
      return 'bg-red-600/40 cursor-pointer';
    }
    return '';
  };

  // Handle line props for the SyntaxHighlighter component
  const handleLineProps = (lineNumber) => {
    // Convert line number to a number type
    const num = Number(lineNumber);
    const isVulnerable = vulnerableLines.has(num);

    if (isVulnerable) {
      console.log(`Line ${num} is vulnerable`);
      return {
        style: {
          backgroundColor: "#ff3333",
          display: "block",
          cursor: "pointer"
        },
        onClick: () => handleLineClick(num)
      };
    }

    return {};
  };

  const closeVulnerabilityPopup = () => {
    setSelectedVulnerability(null);
  };

  const getSecurityScore = () => {
    // If no analysis result, return null
    if (!analysisResult) return null;

    // If the API returns a score directly, use it
    if (analysisResult.security_score !== undefined) return analysisResult.security_score;
    if (analysisResult.score !== undefined) return analysisResult.score;

    // Get vulnerabilities with fallbacks
    const vulnerabilities = analysisResult.vulnerabilities || [];

    // Calculate a simple score based on number of vulnerabilities
    const vulnerabilityCount = vulnerabilities.length;

    if (vulnerabilityCount === 0) return 100;

    // Deduct points for each vulnerability
    // More severe deductions for higher counts
    // Minimum score of 10
    if (vulnerabilityCount > 10) return 10;
    if (vulnerabilityCount > 5) return 30 - (vulnerabilityCount - 5) * 4;
    return Math.max(10, 100 - (vulnerabilityCount * 15));
  };

  // Debug and log vulnerabilities to console
  const debugResponse = (response) => {
    console.log("Full API response:", response);
    if (response?.vulnerabilities) {
      console.log("Vulnerabilities detected:", response.vulnerabilities.length);
      response.vulnerabilities.forEach((v, i) => {
        console.log(`Vulnerability ${i + 1}:`, v.vulnerability_type);
        console.log(`Line numbers:`, v.line_numbers);
      });
    }
  };

  return (
    <>
      <div className='absolute top-8 left-10'>
        <Navbar />
      </div>
      <div className="min-h-screen bg-indigoDark-900 flex flex-col mt-12">
        <style>{customStyle}</style>

        <div className="flex-grow flex flex-col p-6">
          <header className="mb-4">
            <div className="flex flex-col justify-between items-center">
              <h1 className="flex text-2xl font-bold text-white text-center">AI Security Analyzer</h1>
              <br></br>

              <div className="flex space-x-4">
                <div className="flex items-center">
                  <label className="text-gray-300 mr-2">Language:</label>
                  <select
                    className="bg-indigoDark-700 border border-indigoDark-600 rounded-md p-1 text-white text-sm"
                    value={language}
                    onChange={handleLanguageChange}
                  >
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-2">
                  <button
                    className="px-3 py-1 bg-indigoDark-700 hover:bg-indigoDark-600 rounded-md text-indigo-300 font-medium text-sm"
                    onClick={loadExample}
                  >
                    Load Example
                  </button>
                  <button
                    className="px-3 py-1 bg-indigoDark-700 hover:bg-indigoDark-600 rounded-md text-indigo-300 font-medium text-sm"
                    onClick={clearCode}
                  >
                    Clear
                  </button>
                  {!isEditing && (
                    <button
                      className="px-3 py-1 bg-indigo-700 hover:bg-indigo-600 rounded-md text-white font-medium text-sm"
                      onClick={editCode}
                    >
                      Edit Code
                    </button>
                  )}
                </div>

                {/* <span className={`px-3 py-1 rounded-full text-xs flex items-center ${backendStatus === 'connected'
                  ? 'bg-green-900 text-green-300'
                  : backendStatus === 'checking'
                    ? 'bg-yellow-900 text-yellow-300'
                    : 'bg-red-900 text-red-300'
                  }`}>
                  {backendStatus === 'connected' ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-green-400 mr-2"></span>
                      Connected
                    </>
                  ) : backendStatus === 'checking' ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-yellow-400 mr-2"></span>
                      Checking...
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-red-400 mr-2"></span>
                      Not Connected
                    </>
                  )}
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
            </div>

            {analysisResult && !isAnalyzing && !isEditing && (
              <div className="mt-2 flex items-center space-x-4">
                <div className="px-3 py-1 bg-indigoDark-800 rounded-md text-white text-sm flex items-center">
                  <span className="font-medium mr-2">Security Score:</span>
                  <span className="font-bold" style={{ color: getScoreColor(getSecurityScore()) }}>
                    {getSecurityScore()}/100
                  </span>
                </div>

                <div className="px-3 py-1 bg-indigoDark-800 rounded-md text-white text-sm flex items-center">
                  <span className="font-medium mr-2">Vulnerabilities:</span>
                  <span className="font-bold text-red-400">
                    {analysisResult.vulnerabilities?.length || 0}
                  </span>
                </div>

                <div className="px-3 py-1 bg-indigoDark-800 rounded-md text-white text-sm flex items-center">
                  <FaInfoCircle className="text-indigo-400 mr-2" />
                  <span>Click on red highlighted lines to see vulnerability details</span>
                </div>
              </div>
            )}
          </header>

          {backendStatus === 'error' && (
            <div className="bg-red-900 border border-red-700 text-white p-4 rounded-md mb-6">
              <p className="font-bold">Backend Connection Error</p>
              <p>Please ensure the Flask backend server is running with the Advanced Analyzer module.</p>
              <code className="block bg-red-950 p-2 mt-2 rounded text-sm">
                cd backend && python flask_server.py
              </code>
            </div>
          )}

          {error && (
            <div className="bg-red-900 border border-red-700 text-white p-4 rounded-md mb-4">
              <h4 className="text-lg font-semibold flex items-center">
                <FaExclamationTriangle className="mr-2" /> Error
              </h4>
              <p className="mt-2">{error}</p>
            </div>
          )}

          {isAnalyzing ? (
            <div className="text-center py-8 flex-grow flex items-center justify-center">
              <div>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-4 text-gray-300">Analyzing code for security issues...</p>
              </div>
            </div>
          ) : isEditing ? (
            <div className="flex-grow flex flex-col">
              <div className="">
                <textarea
                  ref={textareaRef}
                  className="w-full lg:w-[700px] 2xl:w-[900px] h-full min-h-[300px] bg-indigoDark-800 text-white font-mono text-sm p-4 rounded-lg resize-none border border-indigoDark-600 focus:outline-none focus:border-indigo-500"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter or paste your code here..."
                />
              </div>
              <div className="flex justify-center mt-4">
                <button
                  className="px-6 py-2 bg-indigo-700 hover:bg-indigo-600 text-white font-medium rounded-md flex items-center"
                  onClick={() => {
                    console.log('Analyze button clicked');
                    analyzeCode();
                  }}
                  disabled={!code.trim() || backendStatus !== 'connected'}
                >
                  <FaSearch className="mr-2" />
                  Analyze Security Vulnerabilities
                </button>
              </div>
            </div>
          ) : vulnerableLines.size > 0 ? (
            <div className="flex-grow relative" ref={codeContainerRef}>
              <SyntaxHighlighter
                language={language}
                style={oneDark}
                showLineNumbers={true}
                wrapLines={true}
                lineProps={handleLineProps}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  fontSize: '0.875rem',
                  height: '100%',
                  overflow: 'auto',
                  background: '#1a1a2e',
                  borderRadius: '0.375rem'
                }}
              >
                {code}
              </SyntaxHighlighter>

              {selectedVulnerability && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
                  <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-70" onClick={closeVulnerabilityPopup}></div>
                  <div className="bg-indigoDark-800 rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-10">
                    <button
                      className="absolute right-4 top-4 text-gray-400 hover:text-white"
                      onClick={closeVulnerabilityPopup}
                    >
                      <FaTimes className="text-xl" />
                    </button>

                    <h3 className="text-xl font-bold text-red-400 mb-3 pr-6">
                      {selectedVulnerability.vulnerability_type || selectedVulnerability.type || "Security Vulnerability"}
                    </h3>

                    <div className="bg-indigoDark-900 p-3 rounded mb-4">
                      <h4 className="text-white font-medium mb-1">Vulnerable Code (Line {selectedVulnerability.lineNumber}):</h4>
                      <pre className="bg-red-900/30 p-2 rounded text-red-300 font-mono text-sm overflow-x-auto">
                        {selectedVulnerability.code_snippet || selectedVulnerability.vulnerable_code || selectedVulnerability.code || "Code not available"}
                      </pre>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-white font-medium mb-1">Description:</h4>
                      <p className="text-gray-300">{selectedVulnerability.description || selectedVulnerability.explanation || "No description available"}</p>
                    </div>

                    {(selectedVulnerability.risk || selectedVulnerability.severity) && (
                      <div className="mb-4">
                        <h4 className="text-white font-medium mb-1">Risk Level:</h4>
                        <p className="text-yellow-300">{selectedVulnerability.risk || selectedVulnerability.severity}</p>
                      </div>
                    )}

                    {(selectedVulnerability.exploit_scenario || selectedVulnerability.attack_vector) && (
                      <div className="mb-4">
                        <h4 className="text-white font-medium mb-1">How an Attacker Might Exploit This:</h4>
                        <p className="text-gray-300">{selectedVulnerability.exploit_scenario || selectedVulnerability.attack_vector}</p>
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="text-white font-medium mb-1">How to Fix:</h4>
                      <p className="text-gray-300">{selectedVulnerability.remediation_steps || selectedVulnerability.suggested_fix || selectedVulnerability.remediation || "No fix suggestion available"}</p>
                    </div>

                    {(selectedVulnerability.secure_code_example || selectedVulnerability.fixed_code) && (
                      <div>
                        <h4 className="text-white font-medium mb-1">Secure Code Example:</h4>
                        <pre className="bg-green-900/30 p-2 rounded text-green-300 font-mono text-sm overflow-x-auto">
                          {selectedVulnerability.secure_code_example || selectedVulnerability.fixed_code}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-grow relative" ref={codeContainerRef}>
              <div className="bg-indigoDark-800 rounded-lg p-4 h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <p className="text-xl mb-4">No vulnerabilities detected</p>
                  <p>Your code appears to be secure, or try analyzing a different snippet</p>
                  <button
                    className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 rounded-md text-white font-medium mt-6"
                    onClick={editCode}
                  >
                    Edit Code
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div></>
  );
};

// Helper function to get score color based on the score value
const getScoreColor = (score) => {
  if (!score) return '#f87171'; // red if no score
  if (score >= 80) return '#4ade80'; // green
  if (score >= 60) return '#facc15'; // yellow
  return '#f87171'; // red
};

export default AIPlayground; 