import os
from typing import List, Dict, Optional, Tuple
import openai
from openai import OpenAI
from dotenv import load_dotenv
from app.models.scanner import Vulnerability

# Load environment variables
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
        # Use provided API key or get from environment variables
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass it to the constructor.")
        
        # Initialize OpenAI client with the newer client library
        self.client = OpenAI(api_key=self.api_key)
        
        # Templates for explanations by vulnerability type (language-agnostic)
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
                "This code may be vulnerable to command injection attacks. When user input is used in system "
                "commands without proper validation, attackers can inject malicious commands that execute "
                "with the privileges of your application."
            ),
            "Buffer Overflow Risk": (
                "This code is vulnerable to buffer overflow attacks. It copies data into a buffer without "
                "checking if the destination buffer is large enough to hold it. An attacker could send "
                "input that exceeds the buffer size, potentially overwriting adjacent memory and executing arbitrary code."
            ),
            "Format String Vulnerability": (
                "This code contains a format string vulnerability. When user input is directly used as a format string "
                "in functions like printf(), an attacker can use format specifiers (%s, %x, etc.) to leak memory contents "
                "or potentially execute arbitrary code."
            ),
            "Memory Management Issues": (
                "This code may have memory management issues that could lead to memory leaks, use-after-free, "
                "or double-free vulnerabilities. Proper allocation and deallocation of memory is crucial for security."
            ),
            "Reflection Usage": (
                "This code uses reflection, which can be risky if used with untrusted input. Reflection allows "
                "for dynamic loading and execution of code, which could lead to class injection or arbitrary code execution."
            ),
            "Unsafe Deserialization": (
                "This code performs unsafe deserialization of potentially untrusted data. Deserializing untrusted "
                "data can allow attackers to execute arbitrary code, manipulate application logic, or conduct denial of service attacks."
            ),
            "Path Traversal": (
                "This code may be vulnerable to path traversal attacks. If user input is used to construct file paths "
                "without proper validation, attackers could access files outside of the intended directory."
            ),
            "DOM-based XSS": (
                "This code contains a DOM-based XSS vulnerability. It takes user input from the URL or other "
                "sources and directly inserts it into the DOM, allowing attackers to inject and execute malicious scripts."
            ),
            "Prototype Pollution": (
                "This code may be vulnerable to prototype pollution. When recursively merging objects with "
                "untrusted input, an attacker could modify the JavaScript Object prototype, affecting the "
                "behavior of all objects in the application."
            ),
            "Insecure Cookie": (
                "This code sets a cookie without secure attributes. Cookies without the Secure and HttpOnly "
                "flags are vulnerable to theft via man-in-the-middle attacks or cross-site scripting."
            ),
            "File Inclusion Vulnerability": (
                "This code contains a file inclusion vulnerability. It includes files based on user input "
                "without proper validation, which could allow attackers to include malicious files and execute arbitrary code."
            ),
            "Remote Code Execution": (
                "This code may be vulnerable to remote code execution. Functions like eval() or assert() "
                "with user input can allow attackers to execute arbitrary code on the server."
            ),
            "Insecure File Upload": (
                "This code handles file uploads insecurely. Without proper validation of file types, size, and content, "
                "attackers could upload malicious files that may be executed on the server."
            ),
        }
        
        # Language-specific templates for suggested fixes
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
                    "Avoid using shell=True and validate all inputs. Use safer alternatives like:\n"
                    "```python\n# Instead of: os.system('rm ' + user_input)\n"
                    "import shutil; shutil.rmtree(validated_path)  # For specific operations\n"
                    "# Or for running commands: subprocess.run(['program', 'arg1'], check=True)\n```"
                ),
            },
            "java": {
                "SQL Injection Risk": (
                    "Use PreparedStatement instead of concatenating strings: "
                    "```java\n// Instead of: String query = \"SELECT * FROM users WHERE username = '\" + username + \"'\";\n"
                    "String query = \"SELECT * FROM users WHERE username = ?\";\n"
                    "PreparedStatement stmt = connection.prepareStatement(query);\n"
                    "stmt.setString(1, username);\n"
                    "ResultSet rs = stmt.executeQuery();\n```"
                ),
                "Hardcoded Password/API Key": (
                    "Use environment variables or a secure configuration system: "
                    "```java\n// Instead of hardcoding:\nString apiKey = System.getenv(\"API_KEY\");\n"
                    "// Or use a properties file loaded securely\n```"
                ),
                "Command Injection Risk": (
                    "Avoid passing unsanitized input to exec methods: "
                    "```java\n// Instead of: Runtime.getRuntime().exec(\"ls \" + userInput);\n"
                    "// Use ProcessBuilder with a list (no shell interpretation):\n"
                    "List<String> commands = new ArrayList<>();\n"
                    "commands.add(\"ls\");\n"
                    "commands.add(validatedPath); // Validate input first\n"
                    "ProcessBuilder pb = new ProcessBuilder(commands);\n"
                    "Process p = pb.start();\n```"
                ),
                "Insecure Random Number Generation": (
                    "Use SecureRandom instead of Random: "
                    "```java\n// Instead of: Random random = new Random();\n"
                    "import java.security.SecureRandom;\nSecureRandom secureRandom = new SecureRandom();\n"
                    "int token = secureRandom.nextInt(900000) + 100000; // 6-digit token\n```"
                ),
                "Path Traversal": (
                    "Validate file paths and use canonical paths: "
                    "```java\n// Normalize and validate the path\n"
                    "File file = new File(basePath, userInput);\n"
                    "String canonicalPath = file.getCanonicalPath();\n"
                    "if (!canonicalPath.startsWith(new File(basePath).getCanonicalPath())) {\n"
                    "    throw new SecurityException(\"Invalid path\");\n"
                    "}\n```"
                ),
                "Unsafe Deserialization": (
                    "Avoid deserializing untrusted data. Consider alternatives: "
                    "```java\n// Instead of ObjectInputStream, use safer alternatives:\n"
                    "// 1. Use JSON/XML for data exchange (Jackson, Gson)\n"
                    "// 2. If you must use serialization, implement custom validateObject() methods\n"
                    "// 3. Consider using filtering mechanisms\n```"
                ),
            },
            "cpp": {
                "Buffer Overflow Risk": (
                    "Use safer string handling functions and containers: "
                    "```cpp\n// Instead of: char buffer[10]; strcpy(buffer, input);\n"
                    "// Use std::string or bounded copy functions:\n"
                    "std::string buffer = input; // Safe automatic resizing\n"
                    "// Or with C-style strings:\n"
                    "char buffer[10];\n"
                    "strncpy(buffer, input, sizeof(buffer)-1);\n"
                    "buffer[sizeof(buffer)-1] = '\\0'; // Ensure null termination\n```"
                ),
                "Format String Vulnerability": (
                    "Never use user input as a format string: "
                    "```cpp\n// Instead of: printf(userInput);\n"
                    "printf(\"%s\", userInput); // Always use format specifiers\n```"
                ),
                "Memory Management Issues": (
                    "Use smart pointers and RAII principles: "
                    "```cpp\n// Instead of: int* data = new int[size]; /* ... */ delete[] data;\n"
                    "// Use smart pointers:\n"
                    "#include <memory>\n"
                    "std::unique_ptr<int[]> data = std::make_unique<int[]>(size);\n"
                    "// Or use containers:\n"
                    "std::vector<int> data(size);\n```"
                ),
                "Command Injection Risk": (
                    "Avoid system() calls with user input: "
                    "```cpp\n// Instead of: system((\"ls \" + userInput).c_str()));\n"
                    "// Use safer alternatives or properly validate and sanitize input\n"
                    "// Consider using libraries for specific operations instead of shell commands\n```"
                ),
                "Unsafe Input": (
                    "Use safer input methods with bounds checking: "
                    "```cpp\n// Instead of: scanf(\"%s\", buffer);\n"
                    "// Use bounded input:\n"
                    "scanf(\"%9s\", buffer); // Limit to 9 chars + null terminator\n"
                    "// Or better, use C++ streams with std::string:\n"
                    "std::string input;\n"
                    "std::getline(std::cin, input); // Safe, no buffer overflow\n```"
                ),
            },
            "javascript": {
                "Eval Usage": (
                    "Avoid eval() completely. Consider safer alternatives: "
                    "```javascript\n// Instead of: eval(userInput);\n"
                    "// For JSON parsing: JSON.parse(userInput);\n"
                    "// For dynamic property access: object[property];\n"
                    "// For dynamic function calls: const fn = allowedFunctions[name]; fn();\n```"
                ),
                "XSS Risk": (
                    "Use safe DOM methods and sanitize input: "
                    "```javascript\n// Instead of: element.innerHTML = userInput;\n"
                    "// Use textContent for text: element.textContent = userInput;\n"
                    "// Or use a sanitization library:\n"
                    "// import DOMPurify from 'dompurify';\n"
                    "// element.innerHTML = DOMPurify.sanitize(userInput);\n```"
                ),
                "DOM-based XSS": (
                    "Sanitize URL parameters and never insert them into HTML: "
                    "```javascript\n// Instead of inserting URL params directly into HTML:\n"
                    "// Use textContent or proper escaping\n"
                    "const userId = new URLSearchParams(window.location.search).get('id');\n"
                    "document.getElementById('user').textContent = userId;\n```"
                ),
                "Prototype Pollution": (
                    "Use safer object merging techniques: "
                    "```javascript\n// Instead of recursively assigning properties:\n"
                    "// Use Object.assign with a new object:\n"
                    "const config = Object.assign({}, defaultConfig, sanitizedUserInput);\n"
                    "// Or use spread operator with sanitization:\n"
                    "const config = { ...defaultConfig, ...sanitizedUserInput };\n```"
                ),
                "Insecure Cookie": (
                    "Set secure attributes on cookies: "
                    "```javascript\n// Instead of: document.cookie = \"sessionId=abc123\";\n"
                    "document.cookie = \"sessionId=abc123; Secure; HttpOnly; SameSite=Strict\";\n```"
                ),
            },
            "php": {
                "SQL Injection Risk": (
                    "Use prepared statements with PDO: "
                    "```php\n// Instead of: $query = \"SELECT * FROM users WHERE username = '\" . $username . \"'\";\n"
                    "$stmt = $pdo->prepare(\"SELECT * FROM users WHERE username = ?\");\n"
                    "$stmt->execute([$username]);\n"
                    "$user = $stmt->fetch();\n```"
                ),
                "Command Injection Risk": (
                    "Avoid shell execution functions with user input: "
                    "```php\n// Instead of: exec(\"ls \" . $userInput);\n"
                    "// Use escapeshellarg to sanitize input:\n"
                    "$safeInput = escapeshellarg($userInput);\n"
                    "$output = exec(\"ls \" . $safeInput);\n"
                    "// Or better, avoid shell commands entirely\n```"
                ),
                "XSS Risk": (
                    "Always escape output with htmlspecialchars: "
                    "```php\n// Instead of: echo $_GET['name'];\n"
                    "echo htmlspecialchars($_GET['name'], ENT_QUOTES, 'UTF-8');\n```"
                ),
                "File Inclusion Vulnerability": (
                    "Validate and whitelist included files: "
                    "```php\n// Instead of: include($_GET['page'] . '.php');\n"
                    "$allowedPages = ['home', 'about', 'contact'];\n"
                    "$page = in_array($_GET['page'], $allowedPages) ? $_GET['page'] : 'home';\n"
                    "include($page . '.php');\n```"
                ),
                "Remote Code Execution": (
                    "Never use eval() or similar functions with user input: "
                    "```php\n// Instead of: eval($_GET['code']);\n"
                    "// Completely avoid evaluating user input\n"
                    "// Use safer alternatives specific to your use case\n```"
                ),
                "Insecure File Upload": (
                    "Properly validate uploads and store them safely: "
                    "```php\n// Validate file type, size, and content\n"
                    "$allowedTypes = ['image/jpeg', 'image/png'];\n"
                    "if (in_array($_FILES['upload']['type'], $allowedTypes)) {\n"
                    "    // Generate a random filename\n"
                    "    $newName = bin2hex(random_bytes(16)) . '.jpg';\n"
                    "    // Store outside web root or restrict access\n"
                    "    move_uploaded_file($_FILES['upload']['tmp_name'], '/safe/path/' . $newName);\n"
                    "}\n```"
                ),
            },
        }
        
        # Add C to share C++ templates
        self.fix_templates["c"] = self.fix_templates["cpp"]
        
        # Add Go templates
        self.fix_templates["go"] = {
            "SQL Injection Risk": (
                "Use parameterized queries with the database/sql package: "
                "```go\n// Instead of: db.Query(\"SELECT * FROM users WHERE username = '\" + username + \"'\")\n"
                "rows, err := db.Query(\"SELECT * FROM users WHERE username = ?\", username)\n```"
            ),
            "Command Injection Risk": (
                "Avoid passing user input to command execution: "
                "```go\n// Instead of: exec.Command(\"ls\", \"-l\", userInput).Run()\n"
                "// Validate and sanitize input carefully\n"
                "// Or use specific libraries for the operation you need\n```"
            ),
            "Insecure Random Number Generation": (
                "Use crypto/rand instead of math/rand: "
                "```go\n// Instead of: import \"math/rand\"; token := rand.Intn(100000)\n"
                "import \"crypto/rand\"\n"
                "// Generate a random byte slice\n"
                "b := make([]byte, 16)\n"
                "_, err := rand.Read(b)\n"
                "// Or use a higher-level helper function\n```"
            ),
        }
        
        # Add SQL templates
        self.fix_templates["sql"] = {
            "SQL Injection Risk": (
                "Use parameterized queries instead of string concatenation: "
                "```sql\n-- Instead of executing dynamically built SQL like:\n"
                "-- EXEC('SELECT * FROM users WHERE username = ''' + @username + '''');\n\n"
                "-- Use parameterized queries:\n"
                "PREPARE stmt FROM 'SELECT * FROM users WHERE username = ?';\n"
                "SET @username = 'user_input';\n"
                "EXECUTE stmt USING @username;\n"
                "DEALLOCATE PREPARE stmt;\n```"
            ),
            "Excessive Privilege": (
                "Apply principle of least privilege: "
                "```sql\n-- Instead of granting excessive privileges:\n"
                "-- GRANT ALL PRIVILEGES ON database.* TO 'app_user'@'localhost';\n\n"
                "-- Grant only the specific privileges needed:\n"
                "GRANT SELECT, INSERT, UPDATE ON database.table1 TO 'app_user'@'localhost';\n"
                "GRANT SELECT ON database.table2 TO 'app_user'@'localhost';\n```"
            ),
            "Insecure Data Exposure": (
                "Avoid exposing sensitive data directly: "
                "```sql\n-- Instead of returning sensitive data directly:\n"
                "-- SELECT username, password, credit_card FROM users;\n\n"
                "-- Return only necessary data, using hashing or masking for sensitive fields:\n"
                "SELECT username, 'REDACTED' AS password,\n"
                "CONCAT(LEFT(credit_card, 4), '********', RIGHT(credit_card, 4)) AS credit_card_masked\n"
                "FROM users;\n```"
            ),
            "Lack of Input Validation": (
                "Validate inputs using database constraints: "
                "```sql\n-- Add proper constraints to your tables:\n"
                "CREATE TABLE users (\n"
                "  id INT PRIMARY KEY,\n"
                "  username VARCHAR(50) NOT NULL CHECK (LENGTH(username) >= 3),\n"
                "  email VARCHAR(100) NOT NULL CHECK (email LIKE '%_@_%.__%'),\n"
                "  age INT CHECK (age >= 18),\n"
                "  UNIQUE (username),\n"
                "  UNIQUE (email)\n"
                ");\n```"
            ),
        }
        
        # Add Ruby templates
        self.fix_templates["ruby"] = {
            "SQL Injection Risk": (
                "Use parameterized queries with placeholders: "
                "```ruby\n# Instead of: query = \"SELECT * FROM users WHERE username = '#{username}'\"\n"
                "query = \"SELECT * FROM users WHERE username = ?\"\n"
                "results = db.execute(query, [username])\n```"
            ),
            "Command Injection Risk": (
                "Avoid backticks, system() and exec() with user input: "
                "```ruby\n# Instead of: system(\"ls #{user_input}\")\n"
                "# Use safer alternatives or properly escape:\n"
                "require 'shellwords'\n"
                "system(\"ls\", Shellwords.escape(user_input))\n```"
            ),
            "Unsafe Deserialization": (
                "Avoid Marshal.load with untrusted data: "
                "```ruby\n# Instead of: Marshal.load(data)\n"
                "# Use JSON or YAML for untrusted data\n"
                "require 'json'\n"
                "parsed_data = JSON.parse(data)\n```"
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
        # Check if any of the vulnerabilities are using old-style Vulnerability class (without vulnerable_part)
        # If so, update them to include the vulnerable_part field
        for vuln in vulnerabilities:
            # Add vulnerable_part if it doesn't exist
            if not hasattr(vuln, 'vulnerable_part') or vuln.vulnerable_part is None:
                # Create the vulnerable_part if needed
                if hasattr(vuln, 'code_snippet'):
                    # Use the whole code snippet as the vulnerable part if no specific part is identified
                    vuln.vulnerable_part = vuln.code_snippet
                
        for vuln in vulnerabilities:
            # Get the base vulnerability type without any suffixes
            vuln_type = vuln.vulnerability_type
            base_type = vuln_type.split(" (")[0]  # Remove the "(AST)" suffix if present
            
            # Apply template explanation if available
            if base_type in self.explanation_templates:
                vuln.explanation = self.explanation_templates[base_type]
            
            # Apply language-specific fix suggestion if available
            language = vuln.language.lower()
            # Handle C++ variations
            if language in ["c++", "cpp"]:
                language = "cpp"
            # Handle JavaScript variations
            elif language in ["js", "javascript"]:
                language = "javascript"
                
            if language in self.fix_templates and base_type in self.fix_templates[language]:
                vuln.suggested_fix = self.fix_templates[language][base_type]
            elif "python" in self.fix_templates and base_type in self.fix_templates["python"]:
                # Fallback to Python fixes if language-specific fix is not available
                vuln.suggested_fix = self.fix_templates["python"][base_type]
            
            # For customized explanations, use OpenAI API
            if vuln.explanation is None or "_custom_" in vuln.vulnerability_type:
                self._generate_ai_explanation(vuln)
            
        return vulnerabilities
    
    def _generate_ai_explanation(self, vulnerability: Vulnerability) -> None:
        """
        Generate an AI-powered explanation for a vulnerability.
        
        Args:
            vulnerability: The vulnerability to explain
        """
        # Check if we have a predefined template for this vulnerability type
        if vulnerability.vulnerability_type in self.explanation_templates:
            # Use predefined explanation
            vulnerability.explanation = self.explanation_templates[vulnerability.vulnerability_type]
            
            # Use language-specific fix suggestion if available
            if vulnerability.language in self.fix_templates and vulnerability.vulnerability_type in self.fix_templates[vulnerability.language]:
                vulnerability.suggested_fix = self.fix_templates[vulnerability.language][vulnerability.vulnerability_type]
            else:
                # Get the appropriate language map
                if vulnerability.language in ["c", "cpp", "c++"]:
                    lang_key = "cpp"
                elif vulnerability.language == "js":
                    lang_key = "javascript"
                else:
                    lang_key = vulnerability.language
                
                # Try to get a fix suggestion for the detected language
                if lang_key in self.fix_templates and vulnerability.vulnerability_type in self.fix_templates[lang_key]:
                    vulnerability.suggested_fix = self.fix_templates[lang_key][vulnerability.vulnerability_type]
                else:
                    # Fall back to AI-generated fix suggestion
                    try:
                        # Prepare the prompt for the fix suggestion
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
                        
                        # Call the OpenAI API
                        response = self.client.chat.completions.create(
                            model="gpt-3.5-turbo",
                            messages=[
                                {"role": "system", "content": "You are a security expert providing guidance on fixing code vulnerabilities."},
                                {"role": "user", "content": fix_prompt}
                            ],
                            max_tokens=300,
                            temperature=0.2
                        )
                        
                        # Extract the generated fix from the new client response format
                        ai_fix = response.choices[0].message.content.strip()
                        
                        # Ensure the response has "Example fix:" prefix and code blocks
                        if "Example fix:" not in ai_fix:
                            ai_fix = "Example fix:\n" + ai_fix
                        
                        # Ensure code is wrapped in code blocks if not already
                        if "```" not in ai_fix:
                            ai_fix = f"Example fix:\n```{vulnerability.language}\n{ai_fix}\n```"
                        
                        vulnerability.suggested_fix = ai_fix
                        
                    except Exception as e:
                        # If AI generation fails, provide a generic suggestion
                        vulnerability.suggested_fix = f"To fix this vulnerability, review security best practices for {vulnerability.vulnerability_type} in {vulnerability.language}."
            
            return
            
        # For unknown vulnerability types, generate explanation with AI
        try:
            # Prepare the prompt
            prompt = f"""
            Analyze this line of {vulnerability.language} code that has been flagged for a potential security vulnerability of type "{vulnerability.vulnerability_type}":
            
            ```{vulnerability.language}
            {vulnerability.code_snippet}
            ```
            
            1. Explain in 2-3 sentences what the security risk is.
            2. Provide a specific code example demonstrating how to fix it.
            
            Format your response with the fixed code example in a code block marked with triple backticks.
            """
            
            # Call the OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a security expert analyzing code for vulnerabilities."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=250,
                temperature=0.2
            )
            
            # Extract the generated explanation from the new client response format
            ai_response = response.choices[0].message.content.strip()
            
            # Split the response into explanation and fix
            import re
            explanation_match = re.search(r'^(.*?)(?=```|Example fix:|$)', ai_response, re.DOTALL)
            
            if explanation_match:
                vulnerability.explanation = explanation_match.group(1).strip()
            else:
                vulnerability.explanation = "This code may contain a security vulnerability. Review and fix according to security best practices."
            
            # Try to extract the fix suggestion with code example
            code_block_match = re.search(r'```.*?\n(.*?)```', ai_response, re.DOTALL)
            if code_block_match:
                code_example = code_block_match.group(1).strip()
                vulnerability.suggested_fix = f"Example fix:\n```{vulnerability.language}\n{code_example}\n```"
            else:
                # If no code block, use the rest of the response as the fix
                fix_match = re.search(r'(?:Example fix:|```)(.*?)$', ai_response, re.DOTALL)
                if fix_match:
                    fix_text = fix_match.group(1).strip()
                    # Wrap in code block if it's not already
                    vulnerability.suggested_fix = f"Example fix:\n```{vulnerability.language}\n{fix_text}\n```"
                else:
                    vulnerability.suggested_fix = "Review security best practices for fixing this type of vulnerability."
            
        except Exception as e:
            # Fallback for API failures
            vulnerability.explanation = f"This code may contain a {vulnerability.vulnerability_type} vulnerability."
            vulnerability.suggested_fix = f"Review security best practices for {vulnerability.vulnerability_type} in {vulnerability.language}."

    def generate_auto_fix(self, code: str, vulnerability: Vulnerability) -> Tuple[str, str]:
        """
        Generate an AI-powered automatic fix for the vulnerable code.
        
        Args:
            code: The original code containing the vulnerability
            vulnerability: The vulnerability to fix
            
        Returns:
            Tuple of (fixed_code, explanation_of_changes)
        """
        # Split code into lines to isolate the vulnerable section
        code_lines = code.split('\n')
        
        # Determine the context range - for better AI understanding
        context_start = max(0, vulnerability.line - 5)
        context_end = min(len(code_lines), vulnerability.line + 5)
        
        # Get the vulnerable section with surrounding context
        vulnerable_section = '\n'.join(code_lines[context_start:context_end])
        
        try:
            # Prepare the prompt for auto-fixing
            fix_prompt = f"""
            You are a security expert. I have code in {vulnerability.language} with a "{vulnerability.vulnerability_type}" vulnerability at line {vulnerability.line - context_start + 1} in the following code snippet:
            
            ```{vulnerability.language}
            {vulnerable_section}
            ```
            
            The specific vulnerable part is: {vulnerability.vulnerable_part if hasattr(vulnerability, 'vulnerable_part') and vulnerability.vulnerable_part else code_lines[vulnerability.line-1]}
            
            Please provide TWO things:
            1. The COMPLETE fixed version of the EXACT code snippet shown above (including all context lines)
            2. A brief explanation of the changes you made
            
            Format your response exactly like this, with the fixed code inside the code block:
            
            ```{vulnerability.language}
            [Your fixed code goes here - include ALL lines from the original snippet]
            ```
            
            EXPLANATION: [Your brief explanation of the fix]
            """
            
            # Call the OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a security expert who fixes code vulnerabilities. Provide the complete fixed code and a brief explanation."},
                    {"role": "user", "content": fix_prompt}
                ],
                max_tokens=1000,
                temperature=0.2
            )
            
            # Extract the generated fix from the new client response format
            ai_response = response.choices[0].message.content.strip()
            
            # Parse the response to extract the fixed code and explanation
            import re
            
            # Extract the fixed code
            code_match = re.search(r'```.*?\n(.*?)```', ai_response, re.DOTALL)
            if not code_match:
                return code, "Could not generate an automatic fix for this vulnerability."
                
            fixed_section = code_match.group(1).strip()
            
            # Extract the explanation
            explanation_match = re.search(r'EXPLANATION:\s*(.*?)$', ai_response, re.DOTALL)
            explanation = explanation_match.group(1).strip() if explanation_match else "Fixed the security vulnerability."
            
            # Now replace the vulnerable section in the original code
            fixed_code_lines = code_lines.copy()
            fixed_section_lines = fixed_section.split('\n')
            
            # Replace the corresponding section in the code
            fixed_code_lines[context_start:context_end] = fixed_section_lines
            
            # Return the complete fixed code and explanation
            return '\n'.join(fixed_code_lines), explanation
            
        except Exception as e:
            # If the AI fix generation fails, return the original code with an error message
            return code, f"Could not automatically fix this vulnerability: {str(e)}"
            
    def apply_all_fixes(self, code: str, vulnerabilities: List[Vulnerability]) -> Tuple[str, List[str]]:
        """
        Apply fixes for all vulnerabilities in the code.
        
        Args:
            code: The original code
            vulnerabilities: List of detected vulnerabilities
            
        Returns:
            Tuple of (fixed_code, list_of_change_explanations)
        """
        if not vulnerabilities:
            return code, []
        
        # Sort vulnerabilities by line number in descending order
        # This ensures we fix from bottom to top to avoid line number shifting
        sorted_vulnerabilities = sorted(vulnerabilities, key=lambda v: v.line, reverse=True)
        
        fixed_code = code
        explanations = []
        
        # Apply fixes one by one
        for vuln in sorted_vulnerabilities:
            fixed_code, explanation = self.generate_auto_fix(fixed_code, vuln)
            explanations.append(f"Line {vuln.line}: {vuln.vulnerability_type} - {explanation}")
        
        return fixed_code, explanations