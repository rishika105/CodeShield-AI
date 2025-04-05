"""
ML-based vulnerability scanner implementations.

This module provides machine learning-based approaches to detect vulnerabilities in code.
Note: This is a simplified version that simulates ML-based scanning without the actual models.
"""

import re
import logging
from typing import List, Tuple, Optional
from .scanner import Vulnerability

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VulBERTaModel:
    """
    Dummy implementation of VulBERTa model which is based on RoBERTa for vulnerability detection.
    This is a simplified version for demonstration purposes.
    """
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the VulBERTa model.
        
        Args:
            model_path: Path to the pre-trained model or model name from HuggingFace (optional)
        """
        try:
            # Default model if no path is provided
            self.model_name = model_path or "huggingface/CodeBERTa-small-v1"  
            
            # Load tokenizer and model (dummy implementation)
            logger.info(f"Loading VulBERTa model from {self.model_name}")
            logger.info("Using dummy implementation for demonstration")
            
            # Mapping of vulnerability indices to types
            self.vuln_type_mapping = {
                0: "No vulnerability detected",
                1: "SQL Injection (VulBERTa)",
                2: "Cross-Site Scripting (VulBERTa)",
                3: "Command Injection (VulBERTa)",
                4: "Hardcoded Credentials (VulBERTa)",
                5: "Buffer Overflow (VulBERTa)",
                6: "Insecure Cryptographic Storage (VulBERTa)"
            }
            
            # Explanations for different vulnerability types
            self.explanations = {
                "SQL Injection (VulBERTa)": "SQL injection is a code injection technique that exploits a security vulnerability occurring in the database layer of an application. The vulnerability occurs when user input is incorrectly filtered or sanitized before being used in SQL statements.",
                "Cross-Site Scripting (VulBERTa)": "Cross-Site Scripting (XSS) attacks are a type of injection where malicious scripts are injected into trusted websites. An attacker can use XSS to send a malicious script to an unsuspecting user.",
                "Command Injection (VulBERTa)": "Command injection is an attack in which the goal is to execute arbitrary commands on the host operating system via a vulnerable application. This type of attack is possible when an application passes unsafe user-supplied data to a system shell.",
                "Hardcoded Credentials (VulBERTa)": "Hardcoded credentials refer to the practice of embedding authentication credentials (username, password, API key, etc.) directly into the source code. This is a security risk as these credentials are accessible to anyone who has access to the code.",
                "Buffer Overflow (VulBERTa)": "A buffer overflow occurs when a program writes more data to a buffer than it can hold. This can corrupt adjacent memory, lead to crashes, or allow code execution with elevated privileges.",
                "Insecure Cryptographic Storage (VulBERTa)": "Insecure cryptographic storage refers to the improper protection of sensitive data. This includes using weak algorithms, improper key management, or insufficient encryption strength."
            }
            
            # Suggested fixes for different vulnerability types
            self.suggested_fixes = {
                "SQL Injection (VulBERTa)": "Use parameterized queries or prepared statements instead of building SQL queries through string concatenation. Implement proper input validation and use an ORM (Object-Relational Mapping) library if applicable.",
                "Cross-Site Scripting (VulBERTa)": "Sanitize and validate all user input before including it in the page content. Use context-specific escaping and consider implementing Content Security Policy (CSP).",
                "Command Injection (VulBERTa)": "Avoid calling system commands if possible. If necessary, use a library function rather than the system shell. Validate and sanitize all inputs, and use allowlists for permitted characters or commands.",
                "Hardcoded Credentials (VulBERTa)": "Store credentials in environment variables, configuration files outside the codebase, or a secure credential management system. Never commit sensitive information to version control.",
                "Buffer Overflow (VulBERTa)": "Use safe functions that perform bounds checking automatically. Consider using languages with automatic memory management. If you must use C/C++, use safer alternatives like strncpy() instead of strcpy().",
                "Insecure Cryptographic Storage (VulBERTa)": "Use strong, industry-standard cryptographic algorithms. Implement proper key management practices and consider using established cryptographic libraries instead of implementing your own."
            }
            
        except Exception as e:
            logger.error(f"Failed to load VulBERTa model: {str(e)}")
            raise RuntimeError(f"Failed to load VulBERTa model: {str(e)}")
    
    def preprocess_code(self, code_snippet: str) -> str:
        """
        Preprocess the code snippet for VulBERTa model.
        
        Args:
            code_snippet: Raw code snippet
            
        Returns:
            Preprocessed code snippet
        """
        # Remove extra whitespace and normalize
        code_snippet = re.sub(r'\s+', ' ', code_snippet.strip())
        return code_snippet
    
    def predict(self, code_snippet: str) -> Tuple[bool, float, int]:
        """
        Predict if a code snippet contains vulnerabilities.
        
        Args:
            code_snippet: The code snippet to analyze
            
        Returns:
            Tuple of (is_vulnerable, confidence_score, vulnerability_type_id)
        """
        try:
            # Dummy implementation - look for common vulnerability patterns
            is_vulnerable = False
            confidence = 0.0
            vuln_type_id = 0
            
            # Pattern-based detection
            if 'exec(' in code_snippet.lower() or 'eval(' in code_snippet.lower():
                is_vulnerable = True
                confidence = 0.89
                vuln_type_id = 3  # Command Injection
            elif 'password' in code_snippet.lower() or 'secret' in code_snippet.lower() or 'api_key' in code_snippet.lower():
                is_vulnerable = True
                confidence = 0.85
                vuln_type_id = 4  # Hardcoded Credentials
            elif 'select' in code_snippet.lower() and 'from' in code_snippet.lower():
                is_vulnerable = True
                confidence = 0.78
                vuln_type_id = 1  # SQL Injection
            elif 'innerHTML' in code_snippet.lower() or 'document.write' in code_snippet.lower():
                is_vulnerable = True
                confidence = 0.82
                vuln_type_id = 2  # Cross-Site Scripting
            elif 'strcpy' in code_snippet.lower() or 'memcpy' in code_snippet.lower():
                is_vulnerable = True
                confidence = 0.91
                vuln_type_id = 5  # Buffer Overflow
            elif 'md5' in code_snippet.lower() or 'sha1' in code_snippet.lower():
                is_vulnerable = True
                confidence = 0.75
                vuln_type_id = 6  # Insecure Cryptographic Storage
                
            return is_vulnerable, confidence, vuln_type_id
                
        except Exception as e:
            logger.error(f"Error predicting with VulBERTa: {str(e)}")
            return False, 0.0, 0

class VulDeePeckerModel:
    """
    Dummy implementation of VulDeePecker model for vulnerability detection.
    """
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the VulDeePecker model.
        
        Args:
            model_path: Path to the pre-trained model (optional)
        """
        try:
            # Since VulDeePecker is not directly available in HuggingFace,
            # we would normally load a custom model from disk.
            # For this example, we'll simulate the model behavior
            self.model_path = model_path
            logger.info("Initializing VulDeePecker model (dummy implementation)")
            
            # Vulnerability types that VulDeePecker can detect
            self.vuln_type_mapping = {
                0: "Buffer Error (VulDeePecker)",
                1: "Resource Management Error (VulDeePecker)",
                2: "Numeric Error (VulDeePecker)",
                3: "Pointer Error (VulDeePecker)",
                4: "Memory Leak (VulDeePecker)",
                5: "Race Condition (VulDeePecker)"
            }
            
            # Explanations for different vulnerability types
            self.explanations = {
                "Buffer Error (VulDeePecker)": "Buffer errors occur when operations performed on buffers exceed their allocated size. This can lead to memory corruption, crashes, or even code execution with attacker-controlled data.",
                "Resource Management Error (VulDeePecker)": "Resource management errors happen when resources like memory, file handles, or network connections are not properly allocated, used, or released, leading to resource leaks or vulnerabilities.",
                "Numeric Error (VulDeePecker)": "Numeric errors include integer overflow, underflow, division by zero, or other arithmetic errors that can lead to unexpected behavior, crashes, or security vulnerabilities.",
                "Pointer Error (VulDeePecker)": "Pointer errors involve improper use of pointers, such as null pointer dereferences, use-after-free, or pointer arithmetic errors that can lead to crashes or memory corruption.",
                "Memory Leak (VulDeePecker)": "Memory leaks occur when allocated memory is not properly freed, leading to resource exhaustion and potential denial of service conditions.",
                "Race Condition (VulDeePecker)": "Race conditions occur when the timing or ordering of events affects the correctness of a program. In security contexts, they can lead to time-of-check-time-of-use (TOCTOU) vulnerabilities."
            }
            
            # Suggested fixes for different vulnerability types
            self.suggested_fixes = {
                "Buffer Error (VulDeePecker)": "Use length-checking functions (e.g., strncpy instead of strcpy). Validate input lengths. Consider using safe languages or libraries that perform automatic bounds checking.",
                "Resource Management Error (VulDeePecker)": "Implement proper resource acquisition and release patterns. Use RAII (Resource Acquisition Is Initialization) in C++ or try-with-resources in Java. Ensure all resources are properly released in all code paths, including error conditions.",
                "Numeric Error (VulDeePecker)": "Check for potential overflow/underflow before performing arithmetic operations. Use appropriate data types that can handle the expected range of values. Consider using libraries that provide safe arithmetic operations.",
                "Pointer Error (VulDeePecker)": "Always validate pointers before dereferencing them. Use smart pointers when available. Avoid raw pointer manipulation when possible. Check for null pointers and ensure proper lifetime management of dynamically allocated objects.",
                "Memory Leak (VulDeePecker)": "Ensure every malloc/new has a corresponding free/delete. Use smart pointers or garbage collection when available. Consider using static analysis tools to detect memory leaks.",
                "Race Condition (VulDeePecker)": "Use proper synchronization mechanisms like mutexes, semaphores, or atomic operations. Minimize shared mutable state. Consider using higher-level concurrency abstractions like thread-safe collections or actor models."
            }
            
            # In a real implementation, the model would be loaded here
            # For this example, we'll simulate the model
            self.loaded = True
            logger.info("VulDeePecker model initialized")
            
        except Exception as e:
            logger.error(f"Failed to load VulDeePecker model: {str(e)}")
            self.loaded = False
    
    def extract_code_gadget(self, code: str) -> List[str]:
        """
        Extract code gadgets (slices) from the code for analysis.
        
        Args:
            code: The full source code
            
        Returns:
            List of code gadgets/slices
        """
        # In a real implementation, this would extract relevant code slices
        # For simplicity, we'll just split the code into functions/methods
        lines = code.split('\n')
        gadgets = []
        current_gadget = []
        
        for line in lines:
            if re.search(r'(def|class|function|void|int|char|double|float|public|private)\s+\w+\s*\(', line):
                if current_gadget:
                    gadgets.append('\n'.join(current_gadget))
                    current_gadget = []
            
            if line.strip():  # Skip empty lines
                current_gadget.append(line)
        
        # Add the last gadget if it exists
        if current_gadget:
            gadgets.append('\n'.join(current_gadget))
            
        return gadgets
    
    def predict(self, code: str) -> List[Tuple[str, int, float, int]]:
        """
        Predict vulnerabilities in the code using VulDeePecker.
        
        Args:
            code: The code to analyze
            
        Returns:
            List of tuples containing (vulnerability_type, line_number, confidence, vuln_type_id)
        """
        if not self.loaded:
            return []
        
        try:
            # Extract code gadgets
            gadgets = self.extract_code_gadget(code)
            results = []
            
            # In a real implementation, each gadget would be processed by the model
            # Here we'll simulate the predictions based on patterns
            for gadget in gadgets:
                lines = gadget.split('\n')
                
                # Simple heuristics for demonstration purposes
                for i, line in enumerate(lines):
                    line_number = i + 1
                    
                    if 'strcpy' in line or 'memcpy' in line or 'strcat' in line:
                        results.append(("Buffer Error (VulDeePecker)", line_number, 0.89, 0))
                    elif 'malloc' in line and not any('free' in l for l in lines):
                        results.append(("Memory Leak (VulDeePecker)", line_number, 0.75, 4))
                    elif 'scanf' in line and '%s' in line and not re.search(r'sizeof\s*\(', line):
                        results.append(("Buffer Error (VulDeePecker)", line_number, 0.92, 0))
                    elif 'free' in line and any('free' in l for l in lines[i+1:]):
                        results.append(("Pointer Error (VulDeePecker)", line_number, 0.81, 3))
                    elif 'pthread_mutex_lock' in line and not any('pthread_mutex_unlock' in l for l in lines[i+1:]):
                        results.append(("Resource Management Error (VulDeePecker)", line_number, 0.77, 1))
                    elif '+' in line and re.search(r'[a-zA-Z_]+\s*\+\s*[0-9]+', line):
                        results.append(("Numeric Error (VulDeePecker)", line_number, 0.65, 2))
                    elif 'if' in line and any('if ' + re.escape(line.split('if')[1].strip()) in l for l in lines[i+1:]):
                        results.append(("Race Condition (VulDeePecker)", line_number, 0.70, 5))
            
            return results
            
        except Exception as e:
            logger.error(f"Error predicting with VulDeePecker: {str(e)}")
            return []

class MLScanner:
    """
    Combines multiple ML-based vulnerability scanners.
    """
    def __init__(self):
        """Initialize ML scanner models."""
        self.vulberta = VulBERTaModel()
        self.vuldeepecker = VulDeePeckerModel()
    
    def scan_code(self, code: str, language: Optional[str] = None) -> List[Vulnerability]:
        """
        Scan code for vulnerabilities using ML-based models.
        
        Args:
            code: The code to analyze
            language: The programming language (optional)
            
        Returns:
            List of detected vulnerabilities
        """
        vulnerabilities = []
        
        # Process code with VulBERTa
        lines = code.split('\n')
        for i, line in enumerate(lines):
            is_vulnerable, confidence, vuln_type_id = self.vulberta.predict(line)
            
            if is_vulnerable and confidence > 0.7:
                vuln_type = self.vulberta.vuln_type_mapping.get(vuln_type_id, "Unknown Vulnerability")
                explanation = self.vulberta.explanations.get(vuln_type, "No explanation available")
                suggested_fix = self.vulberta.suggested_fixes.get(vuln_type, "No suggested fix available")
                
                vulnerabilities.append(
                    Vulnerability(
                        line=i+1,
                        vulnerability_type=vuln_type,
                        code_snippet=line.strip(),
                        language=language or "unknown",
                        explanation=explanation,
                        suggested_fix=suggested_fix
                    )
                )
        
        # Process code with VulDeePecker
        vuldeepecker_results = self.vuldeepecker.predict(code)
        for vuln_type, line_number, confidence, vuln_type_id in vuldeepecker_results:
            if confidence > 0.6:  # Confidence threshold
                explanation = self.vuldeepecker.explanations.get(vuln_type, "No explanation available")
                suggested_fix = self.vuldeepecker.suggested_fixes.get(vuln_type, "No suggested fix available")
                
                # Get the code snippet for the line
                if 0 <= line_number-1 < len(lines):
                    code_snippet = lines[line_number-1].strip()
                else:
                    code_snippet = "Unknown code"
                
                vulnerabilities.append(
                    Vulnerability(
                        line=line_number,
                        vulnerability_type=vuln_type,
                        code_snippet=code_snippet,
                        language=language or "unknown",
                        explanation=explanation,
                        suggested_fix=suggested_fix
                    )
                )
        
        return vulnerabilities 