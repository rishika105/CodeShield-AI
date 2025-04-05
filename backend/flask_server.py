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
        'score_model': score_model_available
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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'production') == 'development'
    
    print(f"Starting Flask server on port {port}, debug={debug}")
    app.run(host='0.0.0.0', port=port, debug=debug) 