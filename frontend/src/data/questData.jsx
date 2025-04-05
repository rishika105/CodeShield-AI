export const questCategories = [
    { id: 'web', name: 'Web Security' },
    { id: 'api', name: 'API Security' },
    { id: 'cloud', name: 'Cloud Security' },
    { id: 'mobile', name: 'Mobile Security' },
    { id: 'crypto', name: 'Cryptography' },
    { id: 'network', name: 'Network Security' },
    { id: 'forensics', name: 'Digital Forensics' }
  ];
  
  export const userBadges = [
    { id: 1, name: 'Rookie Securer', earned: '2023-05-15', icon: '🛡️' },
    { id: 2, name: 'SQL Guardian', earned: '2023-06-02', icon: '💉' },
    { id: 3, name: 'XSS Slayer', earned: '2023-06-18', icon: '🎯' },
    { id: 4, name: 'Auth Master', earned: '2023-07-05', icon: '🔑' },
    { id: 5, name: 'Cloud Defender', earned: '2023-07-22', icon: '☁️' },
    { id: 6, name: 'Crypto Wizard', earned: '2023-08-10', icon: '🔐' },
    { id: 7, name: 'Bug Hunter', earned: '2023-08-28', icon: '🐛' },
    { id: 8, name: 'Secure Coder', earned: '2023-09-14', icon: '💻' },
    { id: 9, name: 'Pentest Pro', earned: null, icon: '✖️' },
    { id: 10, name: 'Red Team Elite', earned: null, icon: '🟥' }
  ];
  
  export const quests = [
    {
      id: 1,
      title: "SQL Injection Fundamentals",
      description: "Learn to identify and prevent basic SQL injection vulnerabilities",
      difficulty: 1,
      category: 'web',
      points: 150,
      timeEstimate: "15 mins",
      learningObjectives: [
        "Understand how SQL injection works",
        "Learn parameterized queries",
        "Identify vulnerable code patterns"
      ],
      scenario: "You're reviewing an e-commerce application's user authentication system. Find and fix the SQL injection vulnerability in the login function.",
      vulnerableCode: `async function login(username, password) {
    const query = \`SELECT * FROM users WHERE username = '\${username}' AND password = '\${password}'\`;
    const result = await db.query(query);
    return result.rows[0];
  }`,
      solutionHints: [
        "Never concatenate user input directly into SQL queries",
        "Use parameterized queries or prepared statements",
        "Most database libraries have built-in protection"
      ],
      validationRegex: "/db\\.query\\(.*\\?.*\\)|prepared|parameterized/i"
    },
    {
      id: 2,
      title: "XSS Attack Prevention",
      description: "Defend against Cross-Site Scripting attacks in web applications",
      difficulty: 2,
      category: 'web',
      points: 250,
      timeEstimate: "20 mins",
      learningObjectives: [
        "Identify DOM-based and reflected XSS",
        "Implement proper output encoding",
        "Use Content Security Policy (CSP)"
      ],
      scenario: "A blog platform allows users to post comments. The comments are displayed without sanitization, making it vulnerable to XSS.",
      vulnerableCode: `function displayComment(comment) {
    document.getElementById('comment-section').innerHTML = comment;
  }`,
      solutionHints: [
        "Always sanitize user input before rendering",
        "Use textContent instead of innerHTML when possible",
        "Consider using DOMPurify or similar libraries"
      ],
      validationRegex: "/innerHTML.*=.*(escape|encode|sanitize)|textContent|DOMPurify/i"
    },
    {
      id: 3,
      title: "JWT Authentication Security",
      description: "Secure your JWT implementation against common vulnerabilities",
      difficulty: 2,
      category: 'api',
      points: 300,
      timeEstimate: "25 mins",
      learningObjectives: [
        "Understand JWT security best practices",
        "Implement proper token validation",
        "Handle token storage securely"
      ],
      scenario: "Your API uses JWT for authentication but has several security weaknesses in the implementation.",
      vulnerableCode: `function verifyToken(token) {
    const decoded = jwt.decode(token);
    if (decoded.exp > Date.now() / 1000) {
      return decoded;
    }
    return null;
  }`,
      solutionHints: [
        "Always verify the token signature",
        "Check the algorithm used matches your expectation",
        "Validate all standard claims (exp, iss, etc.)"
      ],
      validationRegex: "/jwt\\.verify|algorithm.*check|signature.*verif/i"
    },
    {
      id: 4,
      title: "S3 Bucket Misconfiguration",
      description: "Identify and fix common AWS S3 bucket security issues",
      difficulty: 3,
      category: 'cloud',
      points: 400,
      timeEstimate: "30 mins",
      learningObjectives: [
        "Understand S3 bucket policies",
        "Implement least privilege access",
        "Enable security logging"
      ],
      scenario: "Your company's marketing site stores assets in an S3 bucket that's publicly accessible and has no logging enabled.",
      vulnerableCode: `{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::marketing-bucket/*"
      }
    ]
  }`,
      solutionHints: [
        "Never use Principal '*' in production",
        "Implement IP-based restrictions when possible",
        "Enable S3 access logging"
      ],
      validationRegex: "/Principal.*\\*.*deny|Condition|Logging/i"
    },
    {
      id: 5,
      title: "Secure Password Storage",
      description: "Implement proper password hashing and storage",
      difficulty: 1,
      category: 'web',
      points: 200,
      timeEstimate: "15 mins",
      learningObjectives: [
        "Understand password hashing best practices",
        "Implement bcrypt or similar",
        "Prevent timing attacks"
      ],
      scenario: "Your user database stores passwords in plaintext. Implement proper password hashing.",
      vulnerableCode: `function createUser(username, password) {
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', 
      [username, password]);
  }`,
      solutionHints: [
        "Never store passwords in plaintext",
        "Use a modern hashing algorithm like bcrypt",
        "Include a salt and appropriate work factor"
      ],
      validationRegex: "/bcrypt|argon2|scrypt|password_hash/i"
    },
    {
      id: 6,
      title: "CSRF Protection",
      description: "Implement defenses against Cross-Site Request Forgery",
      difficulty: 2,
      category: 'web',
      points: 250,
      timeEstimate: "20 mins",
      learningObjectives: [
        "Understand CSRF attack vectors",
        "Implement anti-CSRF tokens",
        "Configure SameSite cookies"
      ],
      scenario: "Your banking application's money transfer endpoint is vulnerable to CSRF attacks.",
      vulnerableCode: `// Express route without CSRF protection
  app.post('/transfer', (req, res) => {
    const { amount, toAccount } = req.body;
    // Process transfer...
  });`,
      solutionHints: [
        "Generate unique tokens for each session",
        "Validate tokens on state-changing requests",
        "Consider SameSite cookie attributes"
      ],
      validationRegex: "/csrf|sameSite|lax|strict|token.*validat/i"
    },
    {
      id: 7,
      title: "Insecure Direct Object Reference",
      description: "Prevent IDOR vulnerabilities in your API",
      difficulty: 2,
      category: 'api',
      points: 300,
      timeEstimate: "25 mins",
      learningObjectives: [
        "Identify IDOR vulnerabilities",
        "Implement proper access controls",
        "Use indirect object references"
      ],
      scenario: "Your document sharing API exposes internal IDs in URLs, allowing users to access unauthorized documents.",
      vulnerableCode: `app.get('/documents/:id', (req, res) => {
    const doc = db.getDocument(req.params.id);
    res.send(doc);
  });`,
      solutionHints: [
        "Always verify the user has permission to access the resource",
        "Consider using UUIDs instead of sequential IDs",
        "Implement access control checks"
      ],
      validationRegex: "/permission.*check|access.*control|verify.*user/i"
    },
    {
      id: 8,
      title: "Secure API Rate Limiting",
      description: "Implement protection against brute force and DDoS attacks",
      difficulty: 3,
      category: 'api',
      points: 350,
      timeEstimate: "30 mins",
      learningObjectives: [
        "Understand rate limiting strategies",
        "Implement sliding window counters",
        "Configure adaptive rate limiting"
      ],
      scenario: "Your login endpoint is vulnerable to brute force attacks with no rate limiting in place.",
      vulnerableCode: `app.post('/login', (req, res) => {
    // No rate limiting
    const user = authenticate(req.body);
    if (user) {
      res.send({ token: generateToken(user) });
    } else {
      res.status(401).send();
    }
  });`,
      solutionHints: [
        "Limit requests per IP/user",
        "Implement exponential backoff for failed attempts",
        "Consider using Redis for distributed rate limiting"
      ],
      validationRegex: "/rate.*limit|throttle|express-rate-limit/i"
    }
  ];