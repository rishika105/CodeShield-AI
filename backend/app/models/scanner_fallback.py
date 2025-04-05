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
    vulnerable_part: Optional[str] = None 


class CodeScanner:
    """
    A scanner that analyzes code for common security vulnerabilities across multiple languages.
    This is a fallback version that does not require the language parameter in scan_code.
    """
    
    def __init__(self):
        self.common_patterns = {
            "Hardcoded Password/API Key": r'(?i)(password|api_?key|secret|token|credentials?)\s*=\s*["\']([^"\']+)["\']',
            "Hardcoded Password (Alternative)": r'(?i)const\s+(password|api_?key|secret|token|credentials?)\s*=\s*["\']([^"\']+)["\']',
        }
        
        self.sql_patterns = {
            "SQL Injection Risk": r'(?i)(EXEC|EXECUTE)\s*\(\s*["\'].*?\+\s*.*?["\']',
            "Excessive Privilege": r'(?i)GRANT\s+(ALL|ALL\s+PRIVILEGES)',
            "Insecure Data Exposure": r'(?i)SELECT\s+.*?(password|credit_card|ssn|social_security|secret).*?\s+FROM',
            "Lack of Input Validation": r'(?i)INSERT\s+INTO\s+.*?VALUES\s*\([^)]*\)',
            "Missing WHERE Clause": r'(?i)(DELETE\s+FROM|UPDATE)\s+[^\s;]+\s*(SET\s+[^;]+)?\s*(;|$)(?!\s*WHERE)',
        }
        
        self.python_patterns = {
            "SQL Injection Risk": r'(?i)(execute|query|cursor\.execute)\s*\(\s*["\'][^"\']*\s*[\'"]?\s*\+',
            "Eval Usage": r'eval\s*\(',
            "Insecure Random Number Generation": r'random\.(random|randint|choice|shuffle)',
            "XSS Risk": r'(?i)((response|html|output)\s*\+=\s*.*?(request|input|param)|render\s*\(.*?(request|input|param))',
            "Command Injection Risk": r'(?i)(os\.(system|popen)|subprocess\.(call|run|Popen))\s*\(\s*[\'"][^\'"]*[\'"]?\s*\+',
        }
        
        self.javascript_patterns = {
            "SQL Injection Risk": r'(?i)(query|execute)\s*\(\s*["\'][^"\']*\s*[\'"]?\s*\+',
            "Eval Usage": r'eval\s*\(',
            "DOM-based XSS": r'(?i)(innerHTML|outerHTML|document\.write|document\.writeln)\s*=',
            "Insecure Random Number Generation": r'Math\.random\(\)',
            "Command Injection Risk": r'(?i)(exec|spawn|execFile)\s*\(\s*[\'"][^\'"]*[\'"]?\s*\+',
        }
        self.php_patterns = {
            "SQL Injection Risk": r'(?i)(mysql_query|mysqli_query|PDO::query)\s*\(\s*["\'][^"\']*\s*[\'"]?\s*\.',
            "Eval Usage": r'eval\s*\(',
            "Command Injection Risk": r'(?i)(exec|system|passthru|shell_exec|popen|proc_open)\s*\(\s*[\'"][^\'"]*[\'"]?\s*\.',
            "XSS Risk": r'(?i)echo\s+\$_',
            "Insecure File Inclusion": r'(?i)(include|require|include_once|require_once)\s*\(\s*\$',
        }
        
        self.ruby_patterns = {
            "SQL Injection Risk": r'(?i)(execute|query)\s*\(\s*["\'][^"\']*\s*[\'"]?\s*\+',
            "Eval Usage": r'eval\s*\(',
            "Command Injection Risk": r'(?i)(system|exec|spawn|\`)\s*\(\s*[\'"][^\'"]*[\'"]?\s*\+',
            "XSS Risk": r'(?i)(raw|html_safe)',
        }
        
        self.cpp_patterns = {
            "Buffer Overflow Risk": r'(?i)(strcpy|strcat|sprintf|gets)\s*\(',
            "Format String Vulnerability": r'(?i)(printf|sprintf|fprintf)\s*\([^,]*,[^)]*\)',
            "Integer Overflow": r'(?i)(malloc|alloca)\s*\(\s*sizeof\s*\(\s*[^)]+\s*\)\s*\*',
            "Use After Free": r'(?i)free\s*\(\s*\w+\s*\)',
            "Memory Leak": r'(?i)(malloc|calloc|realloc)\s*\(',
        }
        
        self.go_patterns = {
            "SQL Injection Risk": r'(?i)db\.(Query|Exec)\s*\(\s*["\'][^"\']*\s*[\'"]?\s*\+',
            "Command Injection Risk": r'(?i)(exec\.Command|os\.StartProcess)\s*\(\s*[\'"][^\'"]*[\'"]?\s*\+',
            "Insecure Random Number Generation": r'rand\.(Intn|Float64)',
            "XSS Risk": r'(?i)(fmt\.Fprintf|io\.WriteString)\s*\(\s*w\s*,',
        }
        
        self.java_patterns = {
            "SQL Injection Risk": r'(?i)(executeQuery|executeUpdate|execute)\s*\(\s*["\'][^"\']*\s*[\'"]?\s*\+',
            "Command Injection Risk": r'(?i)(Runtime\.getRuntime\(\)\.exec|ProcessBuilder)\s*\(\s*[\'"][^\'"]*[\'"]?\s*\+',
            "XSS Risk": r'(?i)(getWriter\(\)\.print|getWriter\(\)\.println|response\.getWriter\(\)\.write)',
            "Insecure Random Number Generation": r'new\s+Random\s*\(',
            "XXE Vulnerability": r'(?i)DocumentBuilderFactory|SAXParserFactory|XMLInputFactory',
        }
        
        self.language_patterns = {
            "python": self.python_patterns,
            "javascript": self.javascript_patterns,
            "php": self.php_patterns,
            "ruby": self.ruby_patterns,
            "cpp": self.cpp_patterns,
            "c++": self.cpp_patterns,
            "c": self.cpp_patterns,
            "go": self.go_patterns,
            "java": self.java_patterns,
            "sql": self.sql_patterns,
        }
    
    def detect_language(self, code: str) -> str:
        """
        Detect the programming language from code.
        
        Args:
            code: The source code to analyze
            
        Returns:
            The detected language as a string
        """
        if re.search(r'(def\s+\w+\s*\(|import\s+\w+|from\s+\w+\s+import)', code):
            return "python"
        elif re.search(r'(function\s+\w+\s*\(|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=)', code):
            return "javascript"
        elif re.search(r'(<\?php|\$\w+\s*=)', code):
            return "php"
        elif re.search(r'(#include\s*<|void\s+\w+\s*\(|int\s+\w+\s*\(|char\s+\w+\s*\()', code):
            if re.search(r'(public\s+class|private\s+class|protected\s+class|System\.out\.println)', code):
                return "java"
            return "cpp"
        elif re.search(r'(package\s+main|func\s+\w+\s*\(|import\s+")', code):
            return "go"
        elif re.search(r'(def\s+\w+\s*(\(\s*\))?|require\s+[\'\"]|puts\s+)', code):
            return "ruby"
        elif re.search(r'(SELECT\s+.*?\s+FROM|CREATE\s+TABLE|INSERT\s+INTO|UPDATE\s+.*?\s+SET)', code, re.IGNORECASE):
            return "sql"
        elif re.search(r'(public\s+class|private\s+class|protected\s+class|System\.out\.println)', code):
            return "java"
        
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
        
        language = self.detect_language(code)
        
        lang_key = language.lower()
        if lang_key == "c++":
            lang_key = "cpp"
        elif lang_key == "js":
            lang_key = "javascript"
        
        patterns = dict(self.common_patterns) 
        
        if lang_key in self.language_patterns:
            patterns.update(self.language_patterns[lang_key])
        
        lines = code.split('\n')
        for i, line in enumerate(lines):
            line_number = i + 1
            for vuln_type, pattern in patterns.items():
                match = re.search(pattern, line)
                if match:
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
        
        if language.lower() == "python":
            try:
                tree = ast.parse(code)
                vulnerabilities.extend(self._scan_ast(tree, lines))
            except SyntaxError:
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
        
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == 'eval':
                line_num = node.lineno
                line_text = lines[line_num-1].strip()
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
        
        return vulnerabilities 