#!/usr/bin/env python3
"""
Flask server for the Code Security Analyzer backend.
This server exposes the Python scanner functionality as REST APIs that can be consumed by the React frontend.
"""

import os
import sys
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

# Add the project root to the path so we can import our modules
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Import scanner models
try:
    from app.models.scanner import CodeScanner, Vulnerability
    print("Successfully imported scanner")
except ImportError as e:
    print(f"Error importing scanner: {e}")
    try:
        from app.models.scanner_fallback import CodeScanner, Vulnerability
        print("Using fallback scanner")
    except ImportError:
        print("Failed to import scanner modules")
        raise

# Import ML scanner models if available
try:
    from app.models.ml_scanner import MLScanner
    ml_scanner_available = True
    print("ML scanner models loaded successfully")
except (ImportError, ModuleNotFoundError) as e:
    print(f"Error importing ML scanner: {e}")
    ml_scanner_available = False

# Import explainer
try:
    from app.models.explainer import VulnerabilityExplainer
    explainer_available = True
    print("Vulnerability explainer loaded successfully")
except (ImportError, ModuleNotFoundError) as e:
    print(f"Error importing explainer: {e}")
    explainer_available = False

# Import score model
try:
    from app.models.score_model import ScoreModel
    score_model_available = True
    print("Score model loaded successfully")
except (ImportError, ModuleNotFoundError) as e:
    print(f"Error importing score model: {e}")
    score_model_available = False

# Import exploit simulator
try:
    from app.models.exploit_simulator import ExploitSimulator
    exploit_simulator_available = True
    print("Exploit simulator loaded successfully")
except (ImportError, ModuleNotFoundError) as e:
    print(f"Error importing exploit simulator: {e}")
    exploit_simulator_available = False

# Import advanced analyzer
try:
    from app.models.advanced_analyzer import SecurityCodeAnalyzer
    advanced_analyzer_available = True
    print("Advanced code analyzer loaded successfully")
except (ImportError, ModuleNotFoundError) as e:
    print(f"Error importing advanced analyzer: {e}")
    advanced_analyzer_available = False

# Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize scanner
scanner = CodeScanner()

# Initialize ML scanner if available
ml_scanner = None
if ml_scanner_available:
    try:
        ml_scanner = MLScanner()
        print("ML scanner initialized")
    except Exception as e:
        print(f"Error initializing ML scanner: {e}")
        ml_scanner_available = False

# Initialize explainer if available
explainer = VulnerabilityExplainer() if explainer_available else None

# Initialize score model if available
score_model = ScoreModel() if score_model_available else None

# Initialize exploit simulator if available
exploit_simulator = ExploitSimulator() if exploit_simulator_available else None

# Initialize advanced analyzer if available
advanced_analyzer = None
if advanced_analyzer_available:
    try:
        # Check if GOOGLE_API_KEY is available, and use it with higher priority
        google_api_key = os.getenv("GOOGLE_API_KEY")
        openai_api_key = os.getenv("OPENAI_API_KEY")
        
        if google_api_key:
            # Use Gemini if Google API key is available
            print("Google API key found, using Gemini API")
            api_key = google_api_key
            use_gemini = True
        elif openai_api_key:
            # Fallback to OpenAI only if no Google API key is available
            print("No Google API key found, falling back to OpenAI API")
            api_key = openai_api_key
            use_gemini = False
        else:
            raise ValueError("No API keys found for either Gemini or OpenAI")
            
        advanced_analyzer = SecurityCodeAnalyzer(api_key=api_key, use_gemini=use_gemini)
        print(f"Advanced analyzer initialized (Using {'Gemini' if use_gemini else 'OpenAI'})")
    except Exception as e:
        print(f"Error initializing advanced analyzer: {e}")
        advanced_analyzer_available = False

# Utility function to convert Vulnerability objects to JSON-serializable dictionaries
def vulnerability_to_dict(vuln):
    return {
        'line': vuln.line,
        'vulnerability_type': vuln.vulnerability_type,
        'code_snippet': vuln.code_snippet,
        'explanation': vuln.explanation,
        'suggested_fix': vuln.suggested_fix,
        'language': vuln.language,
        'vulnerable_part': vuln.vulnerable_part
    }

@app.route('/api/scan', methods=['POST'])
def scan_code():
    """
    API endpoint to scan code for vulnerabilities.
    
    Expects a JSON object with:
    - code: The code to analyze
    - language: The programming language (optional)
    - useVulberta: Whether to use the VulBERTa model (optional, default: false)
    - useVuldeepecker: Whether to use the VulDeePecker model (optional, default: false)
    
    Returns:
    - success: Whether the request was successful
    - data: The analysis results
      - vulnerabilities: List of detected vulnerabilities
      - language: The detected or provided language
      - score: Security score details (if score model is available)
    """
    try:
        data = request.get_json()
        
        if not data or 'code' not in data:
            return jsonify({'success': False, 'error': 'Missing code'}), 400
        
        code = data['code']
        language = data.get('language', None)
        use_vulberta = data.get('useVulberta', False)
        use_vuldeepecker = data.get('useVuldeepecker', False)
        
        # Use regular scanner first
        vulnerabilities = []
        try:
            # Check if language parameter is supported
            import inspect
            scanner_params = inspect.signature(scanner.scan_code).parameters
            if 'language' in scanner_params:
                scanner_results = scanner.scan_code(code, language=language)
            else:
                scanner_results = scanner.scan_code(code)
                
            vulnerabilities.extend(scanner_results)
        except Exception as e:
            print(f"Error using regular scanner: {e}")
        
        # Use ML scanner if requested and available
        if ml_scanner and (use_vulberta or use_vuldeepecker):
            try:
                ml_results = ml_scanner.scan_code(code, language)
                vulnerabilities.extend(ml_results)
            except Exception as e:
                print(f"Error using ML scanner: {e}")
        
        # Convert vulnerabilities to dictionaries for JSON serialization
        vulnerability_dicts = [vulnerability_to_dict(v) for v in vulnerabilities]
        
        # Calculate score if score model is available
        score_details = None
        if score_model_available and score_model:
            try:
                score_details = score_model.get_score_details(vulnerabilities)
            except Exception as e:
                print(f"Error calculating score: {e}")
        
        # Prepare response
        response_data = {
            'vulnerabilities': vulnerability_dicts,
            'language': language or 'auto-detected'
        }
        
        # Add score details if available
        if score_details:
            response_data['score'] = score_details
        
        # Return the results
        return jsonify({
            'success': True, 
            'data': response_data
        })
    
    except Exception as e:
        print(f"Error analyzing code: {e}")
        return jsonify({
            'success': False,
            'error': 'Server error',
            'message': str(e)
        }), 500

@app.route('/api/languages', methods=['GET'])
def get_supported_languages():
    """
    API endpoint to get supported programming languages.
    
    Returns:
    - success: Whether the request was successful
    - data: List of supported languages
    """
    try:
        # Get supported languages from scanner
        supported_languages = [
            "python",
            "javascript",
            "typescript",
            "java",
            "c",
            "cpp",
            "csharp",
            "php",
            "ruby",
            "go"
        ]
        
        return jsonify({
            'success': True,
            'data': supported_languages
        })
    
    except Exception as e:
        print(f"Error getting supported languages: {e}")
        return jsonify({
            'success': False,
            'error': 'Server error',
            'message': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    API endpoint to check if the server is running.
    """
    return jsonify({
        'status': 'healthy',
        'scanner': 'available',
        'ml_scanner': ml_scanner_available,
        'explainer': explainer_available,
        'score_model': score_model_available,
        'exploit_simulator': exploit_simulator_available,
        'advanced_analyzer': advanced_analyzer_available
    })

@app.route('/api/score', methods=['POST'])
def get_score():
    """
    API endpoint to get the security score for previously analyzed code.
    
    Expects a JSON object with:
    - vulnerabilities: List of vulnerabilities from a previous scan
    
    Returns:
    - success: Whether the request was successful
    - data: The score details
    """
    try:
        data = request.get_json()
        
        if not data or 'vulnerabilities' not in data:
            return jsonify({'success': False, 'error': 'Missing vulnerabilities data'}), 400
        
        vulnerabilities_data = data['vulnerabilities']
        
        # Convert dictionary data back to Vulnerability objects
        vulnerabilities = []
        for vuln_dict in vulnerabilities_data:
            vuln = Vulnerability(
                line=vuln_dict.get('line', 0),
                vulnerability_type=vuln_dict.get('vulnerability_type', 'Unknown'),
                code_snippet=vuln_dict.get('code_snippet', ''),
                language=vuln_dict.get('language', 'unknown'),
                explanation=vuln_dict.get('explanation'),
                suggested_fix=vuln_dict.get('suggested_fix'),
                vulnerable_part=vuln_dict.get('vulnerable_part')
            )
            vulnerabilities.append(vuln)
        
        # Calculate score if score model is available
        if score_model_available and score_model:
            try:
                score_details = score_model.get_score_details(vulnerabilities)
                return jsonify({
                    'success': True,
                    'data': score_details
                })
            except Exception as e:
                print(f"Error calculating score: {e}")
                return jsonify({
                    'success': False,
                    'error': 'Error calculating score',
                    'message': str(e)
                }), 500
        else:
            return jsonify({
                'success': False,
                'error': 'Score model not available'
            }), 500
    
    except Exception as e:
        print(f"Error getting score: {e}")
        return jsonify({
            'success': False,
            'error': 'Server error',
            'message': str(e)
        }), 500

@app.route('/api/playground/supported_vulnerabilities', methods=['GET'])
def get_supported_vulnerability_types():
    """
    API endpoint to get vulnerability types supported by the exploit simulator.
    
    Returns:
    - success: Whether the request was successful
    - data: List of supported vulnerability types
    """
    try:
        if not exploit_simulator_available or not exploit_simulator:
            return jsonify({
                'success': False,
                'error': 'Exploit simulator not available'
            }), 500
            
        supported_vulnerabilities = exploit_simulator.get_supported_vulnerabilities()
        
        return jsonify({
            'success': True,
            'data': supported_vulnerabilities
        })
    
    except Exception as e:
        print(f"Error getting supported vulnerabilities: {e}")
        return jsonify({
            'success': False,
            'error': 'Server error',
            'message': str(e)
        }), 500

@app.route('/api/playground/simulate', methods=['POST'])
def simulate_exploit():
    """
    API endpoint to simulate an exploit against a piece of code.
    
    Expects a JSON object with:
    - code: The vulnerable code
    - vulnerability_type: Type of vulnerability to exploit
    - language: Programming language of the code
    - input: Optional input data to simulate user input (for some vulnerabilities)
    
    Returns:
    - success: Whether the request was successful
    - data: The simulation results
    """
    try:
        if not exploit_simulator_available or not exploit_simulator:
            return jsonify({
                'success': False,
                'error': 'Exploit simulator not available'
            }), 500
            
        data = request.get_json()
        
        if not data or 'code' not in data or 'vulnerability_type' not in data:
            return jsonify({
                'success': False, 
                'error': 'Missing required parameters (code, vulnerability_type)'
            }), 400
        
        code = data['code']
        vulnerability_type = data['vulnerability_type']
        language = data.get('language', 'python')
        
        # Simulate the exploit
        simulation_result = exploit_simulator.simulate_exploit(code, vulnerability_type, language)
        
        # Return the results
        return jsonify({
            'success': True,
            'data': simulation_result
        })
    
    except Exception as e:
        print(f"Error simulating exploit: {e}")
        return jsonify({
            'success': False,
            'error': 'Server error',
            'message': str(e)
        }), 500

@app.route('/api/playground/examples', methods=['GET'])
def get_vulnerability_examples():
    """
    API endpoint to get example vulnerable code for different vulnerability types.
    
    Query parameters:
    - vulnerability_type: Type of vulnerability to get examples for
    - language: Programming language (default: python)
    
    Returns:
    - success: Whether the request was successful
    - data: Example code and metadata
    """
    try:
        vulnerability_type = request.args.get('vulnerability_type')
        language = request.args.get('language', 'python')
        
        if not vulnerability_type:
            return jsonify({
                'success': False, 
                'error': 'Missing vulnerability_type parameter'
            }), 400
            
        # Examples for different vulnerability types
        examples = {
            "SQL Injection Risk": {
                "python": {
                    "code": """
# Vulnerable to SQL Injection
import sqlite3

def authenticate(username, password):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # Vulnerable: Directly inserting user input into query
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    cursor.execute(query)
    
    user = cursor.fetchone()
    conn.close()
    
    return user is not None
                    """,
                    "description": "This function is vulnerable to SQL injection because it directly concatenates user input into the SQL query string."
                },
                "javascript": {
                    "code": """
// Vulnerable to SQL Injection
const mysql = require('mysql');

function authenticateUser(username, password) {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'dbuser',
    password: 'dbpass',
    database: 'users'
  });
  
  // Vulnerable: Directly inserting user input into query
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  connection.query(query, (error, results) => {
    if (error) throw error;
    return results.length > 0;
  });
}
                    """,
                    "description": "This function is vulnerable to SQL injection because it directly concatenates user input into the SQL query string using template literals."
                }
            },
            "XSS Risk": {
                "python": {
                    "code": """
# Vulnerable to XSS (Cross-Site Scripting)
from flask import Flask, request

app = Flask(__name__)

@app.route('/welcome')
def welcome():
    username = request.args.get('username', '')
    
    # Vulnerable: Directly inserting user input into HTML
    return f'''
        <html>
            <body>
                <h1>Welcome, {username}!</h1>
            </body>
        </html>
    '''

if __name__ == '__main__':
    app.run()
                    """,
                    "description": "This Flask route is vulnerable to XSS because it directly inserts user input into the HTML response without escaping it."
                },
                "javascript": {
                    "code": """
// Vulnerable to XSS (Cross-Site Scripting)
const express = require('express');
const app = express();

app.get('/welcome', (req, res) => {
  const username = req.query.username || '';
  
  // Vulnerable: Directly inserting user input into HTML
  res.send(`
    <html>
      <body>
        <h1>Welcome, ${username}!</h1>
      </body>
    </html>
  `);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
                    """,
                    "description": "This Express route is vulnerable to XSS because it directly inserts user input into the HTML response without escaping it."
                }
            },
            "Command Injection Risk": {
                "python": {
                    "code": """
# Vulnerable to Command Injection
import os
import subprocess

def ping_host(hostname):
    # Vulnerable: Directly using user input in a command
    command = f"ping -c 1 {hostname}"
    
    # Execute the command
    result = subprocess.check_output(command, shell=True)
    return result.decode('utf-8')
                    """,
                    "description": "This function is vulnerable to command injection because it directly uses user input in a shell command without proper validation."
                },
                "javascript": {
                    "code": """
// Vulnerable to Command Injection
const { exec } = require('child_process');

function pingHost(hostname) {
  // Vulnerable: Directly using user input in a command
  const command = `ping -c 1 ${hostname}`;
  
  // Execute the command
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}
                    """,
                    "description": "This function is vulnerable to command injection because it directly uses user input in a shell command without proper validation."
                }
            },
            "Eval Usage": {
                "python": {
                    "code": """
# Vulnerable to Code Injection via eval()
def calculate(expression):
    # Vulnerable: Directly executing user input as code
    result = eval(expression)
    return result

def process_user_input():
    expr = input("Enter a mathematical expression: ")
    result = calculate(expr)
    print(f"Result: {result}")
                    """,
                    "description": "This function is vulnerable to code injection because it directly passes user input to the eval() function, which executes arbitrary Python code."
                },
                "javascript": {
                    "code": """
// Vulnerable to Code Injection via eval()
function calculate(expression) {
  // Vulnerable: Directly executing user input as code
  const result = eval(expression);
  return result;
}

function processUserInput() {
  const expr = prompt("Enter a mathematical expression:");
  const result = calculate(expr);
  console.log(`Result: ${result}`);
}
                    """,
                    "description": "This function is vulnerable to code injection because it directly passes user input to the eval() function, which executes arbitrary JavaScript code."
                }
            },
            "Hardcoded Password/API Key": {
                "python": {
                    "code": """
# Vulnerable to Credential Disclosure
import requests

def fetch_weather_data(city):
    # Vulnerable: Hardcoded API key in source code
    api_key = "a1b2c3d4e5f6g7h8i9j0"
    
    url = f"https://api.weather.com/data?city={city}&key={api_key}"
    response = requests.get(url)
    
    if response.status_code == 200:
        return response.json()
    else:
        return None
                    """,
                    "description": "This function contains a hardcoded API key in the source code, which is a security risk if the code is accessible to unauthorized individuals."
                },
                "javascript": {
                    "code": """
// Vulnerable to Credential Disclosure
const axios = require('axios');

async function fetchWeatherData(city) {
  // Vulnerable: Hardcoded API key in source code
  const apiKey = "a1b2c3d4e5f6g7h8i9j0";
  
  const url = `https://api.weather.com/data?city=${city}&key=${apiKey}`;
  
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}
                    """,
                    "description": "This function contains a hardcoded API key in the source code, which is a security risk if the code is accessible to unauthorized individuals."
                }
            }
        }
        
        # Get examples for the requested vulnerability type and language
        if vulnerability_type in examples:
            if language in examples[vulnerability_type]:
                return jsonify({
                    'success': True,
                    'data': examples[vulnerability_type][language]
                })
            else:
                # Default to python if the requested language is not available
                return jsonify({
                    'success': True,
                    'data': examples[vulnerability_type]['python']
                })
        else:
            return jsonify({
                'success': False,
                'error': f"No examples available for {vulnerability_type}"
            }), 404
    
    except Exception as e:
        print(f"Error getting vulnerability examples: {e}")
        return jsonify({
            'success': False,
            'error': 'Server error',
            'message': str(e)
        }), 500

# Add the advanced analyzer endpoint
@app.route('/api/advanced-scan', methods=['POST'])
def advanced_scan_code():
    """
    API endpoint to analyze code using the advanced AI-based analyzer.
    
    Expects a JSON object with:
    - code: The code to analyze
    - language: The programming language (optional)
    
    Returns:
    - success: Whether the request was successful
    - data: The analysis results including detailed vulnerability information
    """
    try:
        if not advanced_analyzer_available or not advanced_analyzer:
            return jsonify({
                'success': False,
                'error': 'Advanced analyzer not available'
            }), 500
            
        data = request.get_json()
        
        if not data or 'code' not in data:
            return jsonify({'success': False, 'error': 'Missing code'}), 400
        
        code = data['code']
        language = data.get('language', None)
        
        # Use the advanced analyzer
        analysis_result = advanced_analyzer.analyze_code(code, language)
        
        # Check if there was an error
        if 'error' in analysis_result:
            return jsonify({
                'success': False, 
                'error': analysis_result['error']
            }), 500
            
        # Return the analysis results
        return jsonify({
            'success': True,
            'data': analysis_result
        })
    
    except Exception as e:
        print(f"Error analyzing code with advanced analyzer: {e}")
        return jsonify({
            'success': False,
            'error': 'Server error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'production') == 'development'
    
    print(f"Starting Flask server on port {port}, debug={debug}")
    app.run(host='0.0.0.0', port=port, debug=debug) 