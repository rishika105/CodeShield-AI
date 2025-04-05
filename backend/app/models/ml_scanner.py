"""
ML-based vulnerability scanner implementations.

This module provides machine learning-based approaches to detect vulnerabilities in code.
Note: This is a simplified version that simulates ML-based scanning without the actual models.
"""

import re
import logging
from typing import List, Tuple, Optional
from app.models.scanner import Vulnerability

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class VulBERTaModel:
    """
    Simulated VulBERTa model for detecting code vulnerabilities.
    VulBERTa is a transformer-based model trained on code with and without vulnerabilities.
    
    This is a simplified simulation of the model for demonstration purposes.
    """
    
    def __init__(self):
        """Initialize the VulBERTa model simulation."""
        logger.info("Initializing simulated VulBERTa model")
        
        # Keywords that might indicate vulnerabilities (simplified heuristics)
        self.vulnerability_indicators = [
            r'(?i)password\s*=\s*[\'"][^\'"]+[\'"]',
            r'(?i)eval\s*\(',
            r'(?i)exec\s*\(',
            r'(?i)open\s*\(\s*[\'"][^\'"]*[\'"]?\s*\+',
            r'(?i)innerHTML\s*=',
            r'(?i)document\.write\s*\(',
            r'(?i)sql.*?query.*?[\'"].*?\+',
            r'(?i)\\s*[\'"][\'"].*?%s',
            r'(?i)exec\s*\([\'"].*?\+',
            r'(?i)random\.rand',
            r'(?i)Math\.random',
            r'(?i)subprocess\.call\(',
            r'(?i)os\.system\s*\(',  # Add detection for os.system calls
            r'(?i)os\.popen\s*\(',   # Add detection for os.popen calls
            r'(?i)input\s*\('        # Add detection for unsanitized input
        ]
    
    def predict(self, code: str) -> Tuple[bool, float]:
        """
        Predict if the given code contains vulnerabilities.
        
        Args:
            code: The code snippet to analyze
            
        Returns:
            Tuple of (is_vulnerable, confidence_score)
        """
        # Simple simulation - check for vulnerability indicators
        confidence = 0.0
        
        # Check each indicator
        for indicator in self.vulnerability_indicators:
            if re.search(indicator, code):
                # Increase confidence if indicator is found
                confidence += 0.25
        
        # Cap confidence at 0.95
        confidence = min(confidence, 0.95)
        
        # If any indicator was found, consider it vulnerable
        is_vulnerable = confidence > 0.0
        
        return is_vulnerable, confidence


class VulDeePeckerModel:
    """
    Simulated VulDeePecker model for detecting vulnerabilities in C/C++ code.
    
    This is a simplified simulation of the model for demonstration purposes.
    """
    
    def __init__(self):
        """Initialize the VulDeePecker model simulation."""
        logger.info("Initializing simulated VulDeePecker model")
        
        # C/C++ specific vulnerability patterns (simplified)
        self.vulnerability_patterns = {
            "Buffer Overflow": [
                r'(?i)strcpy\s*\(',
                r'(?i)strcat\s*\(',
                r'(?i)gets\s*\(',
                r'(?i)sprintf\s*\('
            ],
            "Memory Leak": [
                r'(?i)malloc\s*\(',
                r'(?i)calloc\s*\(',
                r'(?i)new\s+'
            ],
            "Format String Vulnerability": [
                r'(?i)printf\s*\([^,]*[,)]',
                r'(?i)sprintf\s*\([^,]*[,)]'
            ],
            "Integer Overflow": [
                r'(?i)sizeof\s*\(\s*[^)]+\s*\)\s*\*'
            ],
            "Use After Free": [
                r'(?i)free\s*\(\s*\w+\s*\)'
            ]
        }
    
    def predict(self, code: str) -> List[Tuple[str, int, float, str]]:
        """
        Predict vulnerabilities in C/C++ code.
        
        Args:
            code: The code to analyze
            
        Returns:
            List of tuples (vulnerability_type, line_number, confidence, id)
        """
        results = []
        lines = code.split('\n')
        
        # For each line, check for vulnerability patterns
        for i, line in enumerate(lines):
            line_number = i + 1
            
            for vuln_type, patterns in self.vulnerability_patterns.items():
                for pattern in patterns:
                    if re.search(pattern, line):
                        # Generate a simulated unique ID for the vulnerability
                        vuln_id = f"VDP-{vuln_type[:3]}-{line_number:04d}"
                        # Add simulated confidence between 0.7 and 0.9
                        confidence = 0.7 + (line_number % 3) * 0.1
                        
                        results.append((vuln_type, line_number, confidence, vuln_id))
        
        return results


class MLScanner:
    """
    Integrates machine learning-based vulnerability detection models (VulBERTa and VulDeePecker)
    with the existing code scanner.
    """
    def __init__(self, use_vulberta: bool = True, use_vuldeepecker: bool = True):
        """
        Initialize the ML-based scanner.
        
        Args:
            use_vulberta: Whether to use the VulBERTa model
            use_vuldeepecker: Whether to use the VulDeePecker model
        """
        self.models = []
        self.model_names = []
        
        # Initialize VulBERTa if requested
        if use_vulberta:
            try:
                logger.info("Initializing VulBERTa model")
                self.vulberta = VulBERTaModel()
                self.models.append(self.vulberta)
                self.model_names.append("VulBERTa")
            except Exception as e:
                logger.error(f"Error initializing VulBERTa: {str(e)}")
        
        # Initialize VulDeePecker if requested
        if use_vuldeepecker:
            try:
                logger.info("Initializing VulDeePecker model")
                self.vuldeepecker = VulDeePeckerModel()
                self.models.append(self.vuldeepecker)
                self.model_names.append("VulDeePecker")
            except Exception as e:
                logger.error(f"Error initializing VulDeePecker: {str(e)}")
        
        logger.info(f"ML Scanner initialized with models: {', '.join(self.model_names)}")
    
    def scan_with_vulberta(self, code: str, language: str) -> List[Vulnerability]:
        """
        Scan code for vulnerabilities using the VulBERTa model.
        
        Args:
            code: The code to analyze
            language: The programming language
            
        Returns:
            List of detected vulnerabilities
        """
        vulnerabilities = []
        
        try:
            # Split code into functions/methods for analysis
            functions = self._split_into_functions(code)
            
            for func_info in functions:
                func_code, start_line = func_info
                
                # If the function is too small, skip it
                if len(func_code.strip().split('\n')) < 3:
                    continue
                
                # Predict vulnerability
                is_vulnerable, confidence = self.vulberta.predict(func_code)
                
                if is_vulnerable:
                    # For each vulnerable function, identify the most suspicious line
                    suspicious_line_offset = self._find_suspicious_line(func_code)
                    line_number = start_line + suspicious_line_offset
                    
                    # Get the code snippet from the function
                    func_lines = func_code.split('\n')
                    if suspicious_line_offset < len(func_lines):
                        code_snippet = func_lines[suspicious_line_offset]
                        
                        # Create a vulnerability object
                        vulnerability = Vulnerability(
                            line=line_number,
                            vulnerability_type=f"Potential Security Vulnerability (VulBERTa, {confidence:.2f})",
                            code_snippet=code_snippet,
                            language=language,
                            explanation="The ML model detected a potential security vulnerability in this code. Review for unsafe practices.",
                            vulnerable_part=code_snippet
                        )
                        
                        vulnerabilities.append(vulnerability)
            
            return vulnerabilities
            
        except Exception as e:
            logger.error(f"Error scanning with VulBERTa: {str(e)}")
            return []
    
    def scan_with_vuldeepecker(self, code: str, language: str) -> List[Vulnerability]:
        """
        Scan code for vulnerabilities using the VulDeePecker model.
        
        Args:
            code: The code to analyze
            language: The programming language
            
        Returns:
            List of detected vulnerabilities
        """
        vulnerabilities = []
        
        try:
            # Only process certain languages that VulDeePecker supports
            if language.lower() not in ['c', 'cpp', 'c++']:
                return []
            
            # Get predictions from VulDeePecker
            predictions = self.vuldeepecker.predict(code)
            
            for vuln_type, line_number, confidence, vuln_id in predictions:
                # Get the code line
                lines = code.split('\n')
                if 0 <= line_number - 1 < len(lines):
                    code_snippet = lines[line_number - 1]
                    
                    # Create vulnerability object
                    vulnerability = Vulnerability(
                        line=line_number,
                        vulnerability_type=f"{vuln_type} (VulDeePecker, {confidence:.2f})",
                        code_snippet=code_snippet,
                        language=language,
                        explanation=f"The VulDeePecker model detected a potential {vuln_type} vulnerability in this line.",
                        vulnerable_part=code_snippet
                    )
                    
                    vulnerabilities.append(vulnerability)
            
            return vulnerabilities
            
        except Exception as e:
            logger.error(f"Error scanning with VulDeePecker: {str(e)}")
            return []
    
    def scan_code(self, code: str, language: str = None) -> List[Vulnerability]:
        """
        Scan code for vulnerabilities using all available ML models.
        
        Args:
            code: The code to analyze
            language: The programming language (optional)
            
        Returns:
            List of detected vulnerabilities
        """
        # Use a default language if none provided
        if language is None:
            language = self._detect_language(code)
        
        all_vulnerabilities = []
        
        # Scan with VulBERTa if available
        if hasattr(self, 'vulberta'):
            vulberta_results = self.scan_with_vulberta(code, language)
            all_vulnerabilities.extend(vulberta_results)
        
        # Scan with VulDeePecker if available
        if hasattr(self, 'vuldeepecker'):
            vuldeepecker_results = self.scan_with_vuldeepecker(code, language)
            all_vulnerabilities.extend(vuldeepecker_results)
        
        return all_vulnerabilities
    
    def _split_into_functions(self, code: str) -> List[Tuple[str, int]]:
        """
        Split the code into functions/methods for analysis.
        
        Args:
            code: The full source code
            
        Returns:
            List of tuples containing (function_code, start_line)
        """
        lines = code.split('\n')
        functions = []
        current_function = []
        start_line = 0
        in_function = False
        
        for i, line in enumerate(lines):
            # Simplified function detection for various languages
            if re.search(r'(def|class|function|void|int|char|double|float|public|private)\s+\w+\s*\(', line):
                if in_function:
                    # Save previous function
                    functions.append(('\n'.join(current_function), start_line))
                
                # Start a new function
                current_function = [line]
                start_line = i + 1
                in_function = True
            elif in_function:
                current_function.append(line)
        
        # Add the last function if it exists
        if in_function:
            functions.append(('\n'.join(current_function), start_line))
        
        # If no functions were found, use the entire code as one block
        if not functions:
            functions.append((code, 1))
        
        return functions
    
    def _find_suspicious_line(self, code: str) -> int:
        """
        Heuristically find the most suspicious line in a function.
        
        Args:
            code: The function code
            
        Returns:
            Line offset from the function start
        """
        lines = code.strip().split('\n')
        
        # Simple heuristics to find suspicious patterns
        suspicious_patterns = [
            r'eval\s*\(',                          # eval usage
            r'exec\s*\(',                          # exec usage
            r'system\s*\(',                        # system calls
            r'(strcpy|strcat|sprintf|gets)\s*\(',  # unsafe string functions
            r'mysql.*\+',                          # potential SQL injection
            r'shell_exec',                         # shell execution
            r'innerHTML',                          # potential XSS
            r'cookie',                             # cookie handling
            r'password.*=',                        # hardcoded password
            r'api_?key.*=',                        # hardcoded API key
            r'random\.',                           # random number generation
            r'malloc\s*\(',                        # memory allocation
            r'free\s*\(',                          # memory freeing
        ]
        
        # Score each line based on suspicious patterns
        line_scores = [0] * len(lines)
        
        for i, line in enumerate(lines):
            for pattern in suspicious_patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    line_scores[i] += 1
        
        # Find the line with the highest score
        if max(line_scores) > 0:
            return line_scores.index(max(line_scores))
        
        # If no suspicious patterns, return the middle of the function as a fallback
        return len(lines) // 2
    
    def _detect_language(self, code: str) -> str:
        """
        Simple language detection based on file patterns.
        
        Args:
            code: The code to analyze
            
        Returns:
            Detected language as a string
        """
        if re.search(r'(def\s+\w+\s*\(|import\s+\w+|from\s+\w+\s+import)', code):
            return "python"
        elif re.search(r'(function\s+\w+\s*\(|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=)', code):
            return "javascript"
        elif re.search(r'(#include\s*<|void\s+\w+\s*\(|int\s+\w+\s*\(|char\s+\w+\s*\()', code):
            return "cpp"
        elif re.search(r'(<\?php|\$\w+\s*=)', code):
            return "php"
        
        # Default
        return "unknown" 