import os
from typing import List, Dict, Optional, Tuple
import openai
from openai import OpenAI
from dotenv import load_dotenv
from app.models.scanner import Vulnerability

load_dotenv()


class VulnerabilityExplainer:
    """
    A class that uses generative AI to provide natural language explanations
    and fix suggestions for security vulnerabilities.
    """
    
    def __init__(self, api_key=None):
        """
        Initialize the explainer with an OpenAI API key.
        
        Args:
            api_key: OpenAI API key (optional, defaults to env var)
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass it to the constructor.")
        
        self.client = OpenAI(api_key=self.api_key)
        
        self.explanation_templates = {
            "Hardcoded Password/API Key": (
                "This code contains a hardcoded password or API key, which is a security risk. "
                "If your code is ever exposed (e.g., on GitHub), attackers can retrieve these credentials. "
                "Always store sensitive information in environment variables or a secure key management service."
            ),
            "SQL Injection Risk": (
                "This code appears vulnerable to SQL injection attacks. By concatenating user input directly into "
                "SQL queries, attackers can manipulate the query to access or modify unauthorized data, "
                "or even execute commands on the database server."
            ),
            "Eval Usage": (
                "Using eval() with user input is extremely dangerous as it allows arbitrary code execution. "
                "An attacker could craft input that performs malicious actions with the same privileges as your application."
            ),
            "Insecure Random Number Generation": (
                "This code uses a non-cryptographically secure random number generator, which is not suitable for security-sensitive operations. "
                "For security-sensitive operations like generating tokens or passwords, you should use a "
                "cryptographically secure random number generator instead."
            ),
            "XSS Risk": (
                "This code may be vulnerable to Cross-Site Scripting (XSS) attacks. When user input is "
                "inserted into HTML without proper sanitization, attackers can inject malicious scripts "
                "that execute in users' browsers, potentially stealing data or cookies."
            ),
            "Command Injection Risk": (
                "This code is vulnerable to command injection attacks. By passing unsanitized user input to "
                "system commands, attackers can execute arbitrary commands on the server."
            ),
            "Buffer Overflow Risk": (
                "This code uses unsafe functions that can lead to buffer overflow vulnerabilities. "
                "Buffer overflows occur when a program writes more data to a buffer than it can hold, "
                "potentially allowing attackers to execute arbitrary code."
            ),
            "Format String Vulnerability": (
                "This code contains a format string vulnerability. If an attacker can control the format string, "
                "they can potentially read from or write to arbitrary memory locations."
            ),
            "Integer Overflow": (
                "This code may be susceptible to integer overflow. When arithmetic operations produce "
                "values too large for the integer type, it can lead to unexpected behavior or security vulnerabilities."
            ),
            "Use After Free": (
                "This code may have a use-after-free vulnerability, where memory is accessed after it has been freed. "
                "This can lead to crashes, data corruption, or code execution vulnerabilities."
            ),
            "Memory Leak": (
                "This code may contain a memory leak, where allocated memory is not properly freed. "
                "Over time, this can exhaust system resources and cause performance degradation or crashes."
            ),
            "Insecure File Inclusion": (
                "This code has an insecure file inclusion vulnerability. When file paths are controlled by user input, "
                "attackers may be able to include malicious files or access sensitive files on the server."
            ),
            "DOM-based XSS": (
                "This code is vulnerable to DOM-based XSS attacks. When user-controlled data is written to the DOM without "
                "proper sanitization, attackers can inject scripts that run in the user's browser."
            ),
            "XXE Vulnerability": (
                "This code may be vulnerable to XML External Entity (XXE) attacks. Improperly configured XML parsers "
                "can process external entity references in XML documents, potentially leading to file disclosure, "
                "SSRF, or denial of service."
            ),
            "Excessive Privilege": (
                "This code grants excessive privileges, which violates the principle of least privilege. "
                "Always grant only the minimum privileges necessary for the operation being performed."
            ),
            "Insecure Data Exposure": (
                "This code may expose sensitive data in database queries. Avoid selecting sensitive fields "
                "unless absolutely necessary, and ensure they are properly protected when retrieved."
            ),
            "Lack of Input Validation": (
                "This code lacks proper input validation. Always validate and sanitize user input to "
                "prevent various injection attacks and data inconsistencies."
            ),
            "Missing WHERE Clause": (
                "This SQL query is missing a WHERE clause, which could result in the operation being applied to all records in the table. "
                "This can lead to unintended data modification or deletion."
            ),
        }
        
        self.fix_templates: Dict[str, Dict[str, str]] = {
            "python": {
                "Hardcoded Password/API Key": (
                    "Store sensitive information in environment variables and access them using os.getenv(): "
                    "```python\nimport os\nfrom dotenv import load_dotenv\n\nload_dotenv()  # Load from .env file\npassword = os.getenv('PASSWORD')\n```"
                ),
                "SQL Injection Risk": (
                    "Use parameterized queries/prepared statements instead of string concatenation: "
                    "```python\n# Instead of: cursor.execute('SELECT * FROM users WHERE username = \"' + username + '\"')\n"
                    "cursor.execute('SELECT * FROM users WHERE username = %s', (username,))\n```"
                ),
                "Eval Usage": (
                    "Avoid using eval() completely. Consider safer alternatives like:\n"
                    "- For mathematical expressions: Use `ast.literal_eval()` or a dedicated parser\n"
                    "- For configuration: Use JSON or YAML parsers\n"
                    "- For dynamic imports: Use importlib\n"
                ),
                "Insecure Random Number Generation": (
                    "Replace the standard random module with the secrets module: "
                    "```python\n# Instead of: import random; token = random.randint(100000, 999999)\n"
                    "import secrets; token = secrets.randbelow(900000) + 100000\n```"
                ),
                "XSS Risk": (
                    "Always sanitize user input before including it in HTML: "
                    "```python\n# For Flask/Jinja2: {{ user_input|escape }}\n"
                    "# For Django: {{ user_input|escape }}\n"
                    "# Manual escaping: html.escape(user_input)\n```"
                ),
                "Command Injection Risk": (
                    "Use subprocess with a list of arguments instead of shell=True: "
                    "```python\n# Instead of: os.system('cat ' + user_input)\n"
                    "import subprocess\nsubprocess.run(['cat', user_input], shell=False, check=True)\n```"
                ),
            },
            "javascript": {
                "Hardcoded Password/API Key": (
                    "Store sensitive information in environment variables: "
                    "```javascript\n// Use dotenv in Node.js\nrequire('dotenv').config();\nconst apiKey = process.env.API_KEY;\n\n"
                    "// For frontend code, use a backend API to handle sensitive operations\n```"
                ),
                "SQL Injection Risk": (
                    "Use parameterized queries with prepared statements: "
                    "```javascript\n// Using node-postgres\nconst query = {\n  text: 'SELECT * FROM users WHERE username = $1',\n  values: [username],\n};\nclient.query(query);\n```"
                ),
                "Eval Usage": (
                    "Avoid using eval(). Consider safer alternatives:\n"
                    "- For JSON: Use JSON.parse()\n"
                    "- For dynamic properties: Use object[property] notation\n"
                    "- For mathematical expressions: Use a dedicated math expression parser\n"
                ),
                "DOM-based XSS": (
                    "Avoid directly inserting HTML with innerHTML. Instead, use the safer textContent or create elements properly: "
                    "```javascript\n// Instead of: element.innerHTML = userInput;\n\n"
                    "// Option 1: Set text content\nelement.textContent = userInput;\n\n"
                    "// Option 2: Create elements properly\nconst newElement = document.createElement('div');\nnewElement.textContent = userInput;\nelement.appendChild(newElement);\n```"
                ),
                "Insecure Random Number Generation": (
                    "Use a cryptographically secure random number generator: "
                    "```javascript\n// Instead of: Math.random()\n\n"
                    "// In the browser\nconst secureRandom = window.crypto.getRandomValues(new Uint32Array(1))[0] / 2**32;\n\n"
                    "// In Node.js\nconst crypto = require('crypto');\nconst secureRandom = crypto.randomBytes(4).readUInt32LE() / 2**32;\n```"
                ),
                "Command Injection Risk": (
                    "Use child_process.execFile() or spawn() instead of exec() and pass arguments as an array: "
                    "```javascript\nconst { execFile } = require('child_process');\n\n"
                    "// Instead of: exec('cat ' + userInput)\nexecFile('cat', [userInput], (error, stdout, stderr) => {\n  console.log(stdout);\n});\n```"
                ),
            },
            "cpp": {
                "Buffer Overflow Risk": (
                    "Use safer string handling functions with proper buffer size checking: "
                    "```cpp\n// Instead of: strcpy(buffer, input);\n"
                    "strncpy(buffer, input, sizeof(buffer) - 1);\nbuffer[sizeof(buffer) - 1] = '\\0'; // Ensure null termination\n\n"
                    "// Even better, use std::string instead of C-style strings\nstd::string buffer = input;\n```"
                ),
                "Format String Vulnerability": (
                    "Always use a literal format string with placeholders: "
                    "```cpp\n// Instead of: printf(userInput);\n"
                    "printf(\"%s\", userInput);\n\n"
                    "// Or better, use std::cout\nstd::cout << userInput;\n```"
                ),
                "Integer Overflow": (
                    "Check for potential overflows before performing operations, or use safe integer types: "
                    "```cpp\n// Checking before multiplication\nif (size > SIZE_MAX / sizeof(int)) {\n  // Handle error\n}\nint* arr = (int*)malloc(size * sizeof(int));\n\n"
                    "// Or use safer types (C++20)\n#include <cstdint>\nstd::size_t size = ...; // safer for sizes\n```"
                ),
                "Use After Free": (
                    "Set pointers to NULL after freeing and check before use, or better, use smart pointers: "
                    "```cpp\n// Manual approach\nfree(ptr);\nptr = NULL;\n\n"
                    "// Better: use smart pointers\nstd::unique_ptr<T> ptr = std::make_unique<T>();\n// No need to free manually\n```"
                ),
                "Memory Leak": (
                    "Ensure all allocated memory is freed, or better, use smart pointers: "
                    "```cpp\n// Instead of manual memory management:\n// T* ptr = new T;\n// ...\n// delete ptr;\n\n"
                    "// Use smart pointers\nstd::unique_ptr<T> ptr = std::make_unique<T>();\n// Memory is automatically freed when ptr goes out of scope\n```"
                ),
            },
            "php": {
                "SQL Injection Risk": (
                    "Use prepared statements with PDO: "
                    "```php\n// Instead of:\n// $query = \"SELECT * FROM users WHERE username = '\" . $username . \"'\";\n\n"
                    "$stmt = $pdo->prepare(\"SELECT * FROM users WHERE username = ?\");\n$stmt->execute([$username]);\n```"
                ),
                "XSS Risk": (
                    "Always use output escaping functions: "
                    "```php\n// Instead of: echo $_GET['input'];\n"
                    "echo htmlspecialchars($_GET['input'], ENT_QUOTES, 'UTF-8');\n```"
                ),
                "Command Injection Risk": (
                    "Use escapeshellarg() to sanitize inputs or avoid shell execution entirely: "
                    "```php\n// Instead of: exec('ls ' . $dir);\n"
                    "exec('ls ' . escapeshellarg($dir));\n```"
                ),
                "Eval Usage": (
                    "Avoid eval() entirely. Consider safer alternatives based on your use case: "
                    "```php\n// Instead of: eval($code);\n\n"
                    "// For configuration: use JSON or arrays\n$config = json_decode($jsonString, true);\n\n"
                    "// For templating: use a template engine like Twig\n```"
                ),
                "Insecure File Inclusion": (
                    "Validate and sanitize paths before inclusion, or use a whitelist approach: "
                    "```php\n// Instead of: include($_GET['page'] . '.php');\n\n"
                    "// Whitelist approach\n$allowed_pages = ['home', 'about', 'contact'];\n$page = in_array($_GET['page'], $allowed_pages) ? $_GET['page'] : 'home';\ninclude($page . '.php');\n```"
                ),
            },
            "go": {
                "SQL Injection Risk": (
                    "Use parameterized queries: "
                    "```go\n// Instead of: db.Query(\"SELECT * FROM users WHERE username = '\" + username + \"'\")\n"
                    "rows, err := db.Query(\"SELECT * FROM users WHERE username = ?\", username)\n```"
                ),
                "Command Injection Risk": (
                    "Use exec.Command with separate arguments instead of shell interpretation: "
                    "```go\n// Instead of: exec.Command(\"sh\", \"-c\", \"ls \" + userInput)\n"
                    "cmd := exec.Command(\"ls\", userInput)\n```"
                ),
                "Insecure Random Number Generation": (
                    "Use crypto/rand for security-sensitive applications: "
                    "```go\n// Instead of: rand.Intn(100)\n"
                    "import \"crypto/rand\"\n\nb := make([]byte, 8)\nrand.Read(b)\n// Use bytes in b for secure random value\n```"
                ),
                "XSS Risk": (
                    "Use proper HTML templating with automatic escaping: "
                    "```go\n// Instead of: fmt.Fprintf(w, \"<div>\" + userInput + \"</div>\")\n"
                    "import \"html/template\"\n\ntmpl := template.Must(template.New(\"page\").Parse(\"<div>{{.}}</div>\"))\ntmpl.Execute(w, userInput)\n```"
                ),
            },
            "ruby": {
                "SQL Injection Risk": (
                    "Use parameterized queries: "
                    "```ruby\n# Instead of: db.execute(\"SELECT * FROM users WHERE username = '#{username}'\")\n"
                    "db.execute(\"SELECT * FROM users WHERE username = ?\", username)\n```"
                ),
                "Command Injection Risk": (
                    "Use arrays with command arguments to avoid shell injection: "
                    "```ruby\n# Instead of: system(\"ls #{directory}\")\n"
                    "`ls #{Shellwords.escape(directory)}`\n\n# Or better:\nrequire 'open3'\nstdout, stderr, status = Open3.capture3('ls', directory)\n```"
                ),
                "Eval Usage": (
                    "Avoid eval entirely. Use safer alternatives depending on your use case: "
                    "```ruby\n# Instead of: eval(code)\n\n"
                    "# For configuration: use YAML or JSON\nrequire 'yaml'\nconfig = YAML.safe_load(yaml_text)\n\n"
                    "# For dynamic code: use blocks or procs\n```"
                ),
                "XSS Risk": (
                    "Use proper escaping or sanitization: "
                    "```ruby\n# In Rails templates, use:\n"
                    "# <%= h user_input %> or <%= user_input.html_safe %>\n"
                    "# With ERB outside Rails:\n"
                    "require 'cgi'\n"
                    "CGI.escapeHTML(user_input)\n```"
                ),
            }
        }
    
    def enrich_vulnerabilities(self, vulnerabilities: List[Vulnerability]) -> List[Vulnerability]:
        """
        Add AI-generated explanations and fix suggestions to the vulnerabilities.
        
        For speed and simplicity, it first applies template-based explanations,
        and then uses OpenAI API for customized explanations when needed.
        
        Args:
            vulnerabilities: List of detected vulnerabilities
            
        Returns:
            The same list of vulnerabilities, but with added explanations
        """
        for vuln in vulnerabilities:
            if not hasattr(vuln, 'vulnerable_part') or vuln.vulnerable_part is None:
                if hasattr(vuln, 'code_snippet'):
                    vuln.vulnerable_part = vuln.code_snippet
                
        for vuln in vulnerabilities:
            vuln_type = vuln.vulnerability_type
            base_type = vuln_type.split(" (")[0]  
            
            if base_type in self.explanation_templates:
                vuln.explanation = self.explanation_templates[base_type]
            
            language = vuln.language.lower()
            if language in ["c++", "cpp"]:
                language = "cpp"
            elif language in ["js", "javascript"]:
                language = "javascript"
                
            if language in self.fix_templates and base_type in self.fix_templates[language]:
                vuln.suggested_fix = self.fix_templates[language][base_type]
            elif "python" in self.fix_templates and base_type in self.fix_templates["python"]:
                vuln.suggested_fix = self.fix_templates["python"][base_type]
            
            if vuln.explanation is None or "_custom_" in vuln.vulnerability_type:
                self._generate_ai_explanation(vuln)
            
        return vulnerabilities
    
    def _generate_ai_explanation(self, vulnerability: Vulnerability) -> None:
        """
        Generate an AI-powered explanation for a vulnerability.
        
        Args:
            vulnerability: The vulnerability to explain
        """
        if vulnerability.vulnerability_type in self.explanation_templates:
            vulnerability.explanation = self.explanation_templates[vulnerability.vulnerability_type]
            
            if vulnerability.language in self.fix_templates and vulnerability.vulnerability_type in self.fix_templates[vulnerability.language]:
                vulnerability.suggested_fix = self.fix_templates[vulnerability.language][vulnerability.vulnerability_type]
            else:
                if vulnerability.language in ["c", "cpp", "c++"]:
                    lang_key = "cpp"
                elif vulnerability.language == "js":
                    lang_key = "javascript"
                else:
                    lang_key = vulnerability.language
                
                if lang_key in self.fix_templates and vulnerability.vulnerability_type in self.fix_templates[lang_key]:
                    vulnerability.suggested_fix = self.fix_templates[lang_key][vulnerability.vulnerability_type]
                else:
                    try:
                        fix_prompt = f"""
                        The following code in {vulnerability.language} has a security vulnerability of type "{vulnerability.vulnerability_type}":
                        
                        ```{vulnerability.language}
                        {vulnerability.code_snippet}
                        ```
                        
                        Provide a detailed explanation of how to fix this vulnerability.
                        Include a specific code example that demonstrates the fix.
                        Format your response with the fixed code example in a properly formatted code block using triple backticks.
                        
                        For example:
                        "Example fix:
                        ```{vulnerability.language}
                        // Fixed code example here
                        ```
                        Additional explanation about the fix."
                        """
                        
                        response = self.client.chat.completions.create(
                            model="gpt-3.5-turbo",
                            messages=[
                                {"role": "system", "content": "You are a security expert providing specific fix suggestions for code vulnerabilities."},
                                {"role": "user", "content": fix_prompt}
                            ],
                            max_tokens=200,
                            temperature=0.2
                        )
                        
                        vulnerability.suggested_fix = response.choices[0].message.content.strip()
                    except Exception as e:
                        vulnerability.suggested_fix = f"Fix not available due to API error: {str(e)}"
                
            return
            
        try:
            prompt = f"""
            Analyze this line of {vulnerability.language} code that has been flagged for a potential security vulnerability of type "{vulnerability.vulnerability_type}":
            
            ```{vulnerability.language}
            {vulnerability.code_snippet}
            ```
            
            1. Explain in 2-3 sentences what the security risk is.
            2. Provide a specific code example demonstrating how to fix it.
            
            Format your response with the fixed code example in a code block marked with triple backticks.
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a security expert analyzing code for vulnerabilities."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=250,
                temperature=0.2
            )
            
            ai_response = response.choices[0].message.content.strip()
            
            import re
            explanation_match = re.search(r'^(.*?)(?=```|Example fix:|$)', ai_response, re.DOTALL)
            
            if explanation_match:
                vulnerability.explanation = explanation_match.group(1).strip()
            else:
                vulnerability.explanation = "This code may contain a security vulnerability. Review and fix according to security best practices."
            
            code_block_match = re.search(r'```.*?\n(.*?)```', ai_response, re.DOTALL)
            if code_block_match:
                code_example = code_block_match.group(1).strip()
                vulnerability.suggested_fix = f"Consider using a safer approach:\n\n```\n{code_example}\n```"
            else:
                remaining_text = ai_response[len(vulnerability.explanation):].strip()
                if remaining_text:
                    vulnerability.suggested_fix = remaining_text
                else:
                    vulnerability.suggested_fix = "Review security best practices for this type of vulnerability."
                
        except Exception as e:
            vulnerability.explanation = f"This code contains a potential {vulnerability.vulnerability_type} vulnerability that could pose security risks."
            vulnerability.suggested_fix = f"Fix not available due to API error: {str(e)}"

    def generate_auto_fix(self, code: str, vulnerability: Vulnerability) -> Tuple[str, str]:
        """
        Generate an AI-powered automatic fix for the vulnerable code.
        
        Args:
            code: The original code containing the vulnerability
            vulnerability: The vulnerability to fix
            
        Returns:
            Tuple of (fixed_code, explanation_of_changes)
        """
        code_lines = code.split('\n')
        
        context_start = max(0, vulnerability.line - 5)
        context_end = min(len(code_lines), vulnerability.line + 5)
        
        vulnerable_section = '\n'.join(code_lines[context_start:context_end])
        
        prompt = f"""
        The following {vulnerability.language} code has a security vulnerability of type "{vulnerability.vulnerability_type}" on line {vulnerability.line - context_start + 1} of this snippet:
        
        ```{vulnerability.language}
        {vulnerable_section}
        ```
        
        The vulnerable part is: `{vulnerability.vulnerable_part}`
        
        Provide a fixed version of the ENTIRE code snippet above, not just the vulnerable line. The fix should address the security vulnerability while maintaining the same functionality.
        
        Respond with ONLY the fixed code snippet in a code block using triple backticks, followed by a brief explanation of what you changed.
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a security expert fixing vulnerabilities in code."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.2
            )
            
            ai_response = response.choices[0].message.content.strip()
            
            import re
            code_block_match = re.search(r'```.*?\n(.*?)```', ai_response, re.DOTALL)
            
            if code_block_match:
                fixed_section = code_block_match.group(1).strip()
                
                explanation_match = re.search(r'```.*?```\s*(.*)', ai_response, re.DOTALL)
                explanation = explanation_match.group(1).strip() if explanation_match else "Security vulnerability fixed."
                
                fixed_code_lines = code_lines.copy()
                fixed_section_lines = fixed_section.split('\n')
                
                for i in range(context_start, context_end):
                    if i - context_start < len(fixed_section_lines) and i < len(fixed_code_lines):
                        fixed_code_lines[i] = fixed_section_lines[i - context_start]
                
                fixed_code = '\n'.join(fixed_code_lines)
                
                return fixed_code, explanation
            else:
                return code, "Automatic fix could not be generated. Please review the vulnerability manually."
                
        except Exception as e:
            return code, f"Automatic fix failed due to API error: {str(e)}" 