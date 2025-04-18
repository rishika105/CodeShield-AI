import re
import ast
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class Vulnerability:
    line: int
    vulnerability_type: str
    code_snippet: str
    language: str = "unknown"
    explanation: Optional[str] = None
    suggested_fix: Optional[str] = None
    vulnerable_part: Optional[str] = None  # Specific part of the line that is vulnerable


class CodeScanner:
    """
    A scanner that analyzes code for common security vulnerabilities across multiple languages.
    This is a fallback version without the language parameter.
    """
    
    def __init__(self):
        # Initialize patterns for regex-based vulnerability detection
        # Cross-language patterns
        self.common_patterns = {
            "Hardcoded Password/API Key": r'(?i)(password|api_?key|secret|token|credentials?)\s*=\s*["\']([^"\']+)["\']',
            "Hardcoded Password (Alternative)": r'(?i)const\s+(password|api_?key|secret|token|credentials?)\s*=\s*["\']([^"\']+)["\']',
        }
        
        # SQL-specific patterns
        self.sql_patterns = {
            "SQL Injection Risk": r'(?i)(EXEC|EXECUTE)\s*\(\s*["\'].*?\+\s*.*?["\']',
            "Excessive Privilege": r'(?i)GRANT\s+(ALL|ALL\s+PRIVILEGES)',
            "Insecure Data Exposure": r'(?i)SELECT\s+.*?(password|credit_card|ssn|social_security|secret).*?\s+FROM',
            "Lack of Input Validation": r'(?i)INSERT\s+INTO\s+.*?VALUES\s*\([^)]*\)',
            "Missing WHERE Clause": r'(?i)(DELETE\s+FROM|UPDATE)\s+[^\s;]+\s*(SET\s+[^;]+)?\s*(;|$)(?!\s*WHERE)',
        }
        
        # Python-specific patterns
        self.python_patterns = {
            "SQL Injection Risk": r'(?i)(execute|query|cursor\.execute)\s*\(\s*["\'][^"\']*\s*[\'"]?\s*\+',
            "Eval Usage": r'eval\s*\(',
            "Insecure Random Number Generation": r'random\.(random|randint|choice|shuffle)',
            "XSS Risk": r'(?i)((response|html|output)\s*\+=\s*.*?(request|input|param)|render\s*\(.*?(request|input|param))',
            "Command Injection Risk": r'(?i)(os\.(system|popen)|subprocess\.(call|run|Popen))\s*\(\s*[\'"][^\'"]*[\'"]?\s*\+',
        }
        
        # Java-specific patterns
        self.java_patterns = {
            "SQL Injection Risk": r'(?i)(executeQuery|executeUpdate|execute)\s*\(\s*["\'][^"\']*\s*[\'"]?\s*\+',
            "Reflection Usage": r'(?i)(Class\.forName|getMethod|invoke)\s*\(',
            "Insecure Random Number Generation": r'(?i)(new\s+Random\(\)|Math\.random\(\))',
            "XSS Risk": r'(?i)(PrintWriter|response\.getWriter)\s*\.\s*(print|println|write)\s*\(\s*[^\)]*request',
            "Command Injection Risk": r'(?i)(Runtime\.getRuntime\(\)\.exec|ProcessBuilder)\s*\(',
            "Path Traversal": r'(?i)new\s+File\s*\(\s*[^\)]*\+',
            "Unsafe Deserialization": r'(?i)(ObjectInputStream|readObject)\s*\(',
        }
        
        # C/C++-specific patterns
        self.c_cpp_patterns = {
            "Buffer Overflow Risk": r'(?i)(strcpy|strcat|sprintf|gets)\s*\(',
            "Format String Vulnerability": r'(?i)(printf|sprintf|fprintf)\s*\([^,]*,[^)]*\)',
            "Memory Management Issues": r'(?i)(malloc|free|realloc)\s*\(',
            "Command Injection Risk": r'(?i)(system|exec|popen)\s*\(',
            "Unsafe Input": r'(?i)(scanf)\s*\([^,]*,[^)]*\)',
        }
        
        # JavaScript-specific patterns
        self.javascript_patterns = {
            "Eval Usage": r'(?i)(eval|setTimeout|setInterval)\s*\(\s*["\'][^"\']*\s*[\'"]?\s*\+',
            "SQL Injection Risk": r'(?i)(query|execute)\s*\(\s*["\'][^"\']*\s*[\'"]?\s*\+',
            "XSS Risk": r'(?i)(innerHTML|outerHTML|document\.write)\s*=',
            "DOM-based XSS": r'(?i)(location\.search|location\.hash|document\.referrer|document\.URL)\s*',
            "Prototype Pollution": r'(?i)Object\.assign\s*\(\s*[^,]*,[^)]*\)',
            "Insecure Cookie": r'(?i)document\.cookie\s*=\s*["\'][^"\']*(?<!secure)(?<!httpOnly)["\']',
        }
        
        # PHP-specific patterns
        self.php_patterns = {
            "SQL Injection Risk": r'(?i)(mysql_query|mysqli_query|query|execute)\s*\(\s*["\'][^"\']*\s*[\'"]?\s*\.',
            "Command Injection Risk": r'(?i)(exec|system|passthru|shell_exec)\s*\(',
            "XSS Risk": r'(?i)(echo|print)\s+\$_(GET|POST|REQUEST)',
            "File Inclusion Vulnerability": r'(?i)(include|require|include_once|require_once)\s*\(\s*\$_(GET|POST|REQUEST)',
            "Insecure File Upload": r'(?i)move_uploaded_file\s*\(',
            "Remote Code Execution": r'(?i)(eval|assert)\s*\(\s*\$_(GET|POST|REQUEST)',
        }
        
        # Go-specific patterns
        self.go_patterns = {
            "SQL Injection Risk": r'(?i)db\.(Query|Exec)\s*\(\s*["\'][^"\']*\s*[\'"]?\s*\+',
            "Command Injection Risk": r'(?i)(exec\.Command|os\.StartProcess)\s*\(',
            "XSS Risk": r'(?i)(template\.HTML|template\.JS|template\.CSS)\s*\(',
            "Insecure Random Number Generation": r'(?i)(math/rand\.)',
        }
        
        # Ruby-specific patterns
        self.ruby_patterns = {
            "SQL Injection Risk": r'(?i)(execute|query)\s*\(\s*["\'][^"\']*\s*[\'"]?\s*\+',
            "Command Injection Risk": r'(?i)(system|exec|`) ',
            "Unsafe Deserialization": r'(?i)(Marshal\.load)',
            "XSS Risk": r'(?i)(\.html_safe|raw)',
        }
        
        # Language-specific pattern dictionary
        self.language_patterns = {
            "python": self.python_patterns,
            "java": self.java_patterns,
            "c": self.c_cpp_patterns,
            "cpp": self.c_cpp_patterns,
            "c++": self.c_cpp_patterns,
            "javascript": self.javascript_patterns,
            "js": self.javascript_patterns,
            "php": self.php_patterns,
            "go": self.go_patterns,
            "ruby": self.ruby_patterns,
            "sql": self.sql_patterns,
        }
    
    def detect_language(self, code: str) -> str:
        """
        Attempt to detect the programming language from the code.
        
        Args:
            code: The source code to analyze
            
        Returns:
            The detected language as a string
        """
        # Look for language-specific markers
        if re.search(r'import\s+[a-zA-Z0-9_]+|from\s+[a-zA-Z0-9_\.]+\s+import|def\s+[a-zA-Z0-9_]+\s*\(|class\s+[a-zA-Z0-9_]+:', code):
            return "python"
        elif re.search(r'#include\s*<[a-zA-Z0-9_\.]+>|\s+main\s*\(\s*(?:void|int|char)', code) and re.search(r'printf|scanf|malloc', code):
            return "c"
        elif re.search(r'#include\s*<[a-zA-Z0-9_\.]+>|\s+main\s*\(\s*(?:void|int|char)', code) and re.search(r'std::|cout|cin|namespace', code):
            return "cpp"
        elif re.search(r'function\s+[a-zA-Z0-9_]+\s*\(|const\s+[a-zA-Z0-9_]+\s*=|let\s+[a-zA-Z0-9_]+\s*=|var\s+[a-zA-Z0-9_]+\s*=', code):
            return "javascript"
        elif re.search(r'<\?php|\$[a-zA-Z0-9_]+\s*=', code):
            return "php"
        elif re.search(r'package\s+main|import\s+\(|func\s+[a-zA-Z0-9_]+\s*\(', code):
            return "go"
        elif re.search(r'require\s+[\'"][a-zA-Z0-9_]+[\'"]|def\s+[a-zA-Z0-9_]+\s*(\(\s*\))?|class\s+[A-Z][a-zA-Z0-9_]*\s*<', code):
            return "ruby"
        else:
            # Default to generic detection
            return "unknown"
    
    def scan_code(self, code: str) -> List[Vulnerability]:
        """
        Scan code for vulnerabilities using language-specific patterns.
        
        Args:
            code: The source code to analyze
            
        Returns:
            A list of detected vulnerabilities
        """
        vulnerabilities = []
        
        # Detect language
        language = self.detect_language(code)
        
        # Clean language name for mapping
        lang_key = language.lower()
        if lang_key == "c++":
            lang_key = "cpp"
        elif lang_key == "js":
            lang_key = "javascript"
        
        # Get language-specific patterns
        patterns = dict(self.common_patterns)  # Start with common patterns
        
        # Add language-specific patterns if available
        if lang_key in self.language_patterns:
            patterns.update(self.language_patterns[lang_key])
        
        # Run regex-based scans
        lines = code.split('\n')
        for i, line in enumerate(lines):
            line_number = i + 1
            for vuln_type, pattern in patterns.items():
                match = re.search(pattern, line)
                if match:
                    # Extract the specific part of the line that matches the vulnerability pattern
                    vulnerable_part = match.group(0)
                    vulnerabilities.append(
                        Vulnerability(
                            line=line_number,
                            vulnerability_type=vuln_type,
                            code_snippet=line.strip(),
                            language=language,
                            vulnerable_part=vulnerable_part
                        )
                    )
        
        # Run AST-based analysis for Python code
        if language.lower() == "python":
            try:
                tree = ast.parse(code)
                vulnerabilities.extend(self._scan_ast(tree, lines))
            except SyntaxError:
                # If code is not valid Python, we'll just rely on regex results
                pass
            
        return vulnerabilities
    
    def _scan_ast(self, tree: ast.AST, lines: List[str]) -> List[Vulnerability]:
        """
        Scan Python AST for additional vulnerabilities that are better detected with AST parsing.
        
        Args:
            tree: The AST of the code
            lines: The code split into lines for context
            
        Returns:
            A list of detected vulnerabilities
        """
        vulnerabilities = []
        
        # Visit all nodes in the AST
        for node in ast.walk(tree):
            # Check for eval calls
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == 'eval':
                line_num = node.lineno
                line_text = lines[line_num-1].strip()
                # Try to extract the exact eval call from the line
                eval_match = re.search(r'eval\s*\([^)]*\)', line_text)
                vulnerable_part = eval_match.group(0) if eval_match else "eval(...)"
                vulnerabilities.append(
                    Vulnerability(
                        line=line_num,
                        vulnerability_type="Eval Usage (AST)",
                        code_snippet=line_text,
                        language="python",
                        vulnerable_part=vulnerable_part
                    )
                )
                
            # Check for os.system and subprocess calls (potential command injection)
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
                if hasattr(node.func, 'attr') and node.func.attr in ['system', 'popen', 'call', 'check_output', 'run']:
                    if hasattr(node.func, 'value') and hasattr(node.func.value, 'id'):
                        if node.func.value.id in ['os', 'subprocess']:
                            line_num = node.lineno
                            line_text = lines[line_num-1].strip()
                            # Try to extract the exact system call from the line
                            cmd_match = re.search(r'(os|subprocess)\.\w+\s*\([^)]*\)', line_text)
                            vulnerable_part = cmd_match.group(0) if cmd_match else f"{node.func.value.id}.{node.func.attr}(...)"
                            vulnerabilities.append(
                                Vulnerability(
                                    line=line_num,
                                    vulnerability_type="Command Injection Risk",
                                    code_snippet=line_text,
                                    language="python",
                                    vulnerable_part=vulnerable_part
                                )
                            )
                    
        return vulnerabilities 