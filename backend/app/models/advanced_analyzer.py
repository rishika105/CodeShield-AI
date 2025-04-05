import os
import json
import time
from typing import Dict, Any, List
import requests
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()

class SecurityCodeAnalyzer:
    """
    A tool for analyzing code for security vulnerabilities using Google's Gemini API
    to provide plain-language explanations and remediation steps.
    """
    
    def __init__(self, api_key: str = None, use_gemini: bool = True):
        """Initialize the analyzer with API credentials."""
        # Use provided key or get from environment
        self.use_gemini = use_gemini
        
        if use_gemini:
            self.google_api_key = api_key or os.getenv("GOOGLE_API_KEY")
            if not self.google_api_key:
                raise ValueError("Google API key is required for Gemini")
            
            # Configure the Gemini API
            genai.configure(api_key=self.google_api_key)
            
            # Set up the model - using the newer recommended model
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            # Fallback to OpenAI if needed
            self.openai_api_key = api_key or os.getenv("OPENAI_API_KEY")
            if not self.openai_api_key:
                raise ValueError("OpenAI API key is required")
            
            # Define the model to use
            self.openai_model = "gpt-3.5-turbo"
            
            # Use the standard OpenAI API endpoint
            self.api_url = "https://api.openai.com/v1/chat/completions"
            
            # Rate limiting parameters
            self.max_retries = 3
            self.retry_delay = 5  # seconds
    
    def analyze_code(self, code: str, language: str = None) -> Dict[str, Any]:
        """
        Analyze code for security vulnerabilities using Gemini API.
        
        Args:
            code: The source code to analyze
            language: Programming language of the code (optional)
            
        Returns:
            Dictionary containing analysis results
        """
        if self.use_gemini:
            return self._analyze_with_gemini(code, language)
        else:
            return self._analyze_with_openai(code, language)
    
    def _analyze_with_gemini(self, code: str, language: str = None) -> Dict[str, Any]:
        """Use Google's Gemini API for code analysis"""
        
        # Create prompt for Gemini
        prompt = f"""You are a security code analyzer specialized in identifying security vulnerabilities in code.
        Your task is to thoroughly analyze the provided code and identify any security vulnerabilities.
        
        For each vulnerability you find:
        1. Identify the type of vulnerability (e.g., SQL Injection, XSS, Command Injection)
        2. Explain the vulnerability in plain, conversational language
        3. Describe why this vulnerability is dangerous
        4. Explain how a hacker might exploit this vulnerability
        5. Provide clear steps to fix the vulnerability
        6. Give examples of secure code to replace the vulnerable parts
        7. MOST IMPORTANTLY: Specify the exact line numbers where the vulnerability exists
        
        Format your response as a JSON object with the following structure:
        {{
            "vulnerabilities": [
                {{
                    "vulnerability_type": "Type of vulnerability",
                    "description": "Plain language description",
                    "risk": "Why this is dangerous",
                    "exploit_scenario": "How an attacker might exploit this",
                    "vulnerable_code": "The specific vulnerable code",
                    "line_numbers": [10, 11, 12],
                    "remediation_steps": "Steps to fix the vulnerability",
                    "secure_code_example": "Example of secure code"
                }}
            ]
        }}
        
        The line_numbers field MUST be an array of numbers indicating which lines contain the vulnerability. This is essential.
        If a vulnerability spans multiple lines, include all affected line numbers.
        
        If no vulnerabilities are found, return an empty array for "vulnerabilities".
        Be thorough and identify all potential vulnerabilities, but avoid false positives.
        
        Here is the {''+language+' ' if language else ''}code to analyze:
        
        ```
        {code}
        ```
        
        IMPORTANT: Make sure to include accurate line numbers for each vulnerability in your response.
        """
        
        # Make the API request to Gemini
        try:
            response = self.model.generate_content(prompt)
            
            # Extract the text from the response
            content = response.text
            
            # Try to extract JSON from the response
            try:
                # Find JSON in the response
                json_start = content.find('{')
                json_end = content.rfind('}') + 1
                if json_start >= 0 and json_end > json_start:
                    json_str = content[json_start:json_end]
                    result = json.loads(json_str)
                    return result
                else:
                    return {"analysis": content, "vulnerabilities": []}
            except json.JSONDecodeError:
                return {"analysis": content, "vulnerabilities": []}
                
        except Exception as e:
            return {"error": f"Gemini API request failed: {str(e)}"}
    
    def _analyze_with_openai(self, code: str, language: str = None) -> Dict[str, Any]:
        """Fallback to OpenAI API for code analysis"""
        # Create messages for the API request
        messages = [
            {"role": "system", "content": """You are a security code analyzer specialized in identifying security vulnerabilities in code.
            Your task is to thoroughly analyze the provided code and identify any security vulnerabilities.
            
            For each vulnerability you find:
            1. Identify the type of vulnerability (e.g., SQL Injection, XSS, Command Injection)
            2. Explain the vulnerability in plain, conversational language
            3. Describe why this vulnerability is dangerous
            4. Explain how a hacker might exploit this vulnerability
            5. Provide clear steps to fix the vulnerability
            6. Give examples of secure code to replace the vulnerable parts
            7. MOST IMPORTANTLY: Specify the exact line numbers where the vulnerability exists
            
            Format your response as a JSON object with the following structure:
            {
                "vulnerabilities": [
                    {
                        "vulnerability_type": "Type of vulnerability",
                        "description": "Plain language description",
                        "risk": "Why this is dangerous",
                        "exploit_scenario": "How an attacker might exploit this",
                        "vulnerable_code": "The specific vulnerable code",
                        "line_numbers": [10, 11, 12],
                        "remediation_steps": "Steps to fix the vulnerability",
                        "secure_code_example": "Example of secure code"
                    }
                ]
            }
            
            The line_numbers field MUST be an array of numbers indicating which lines contain the vulnerability. This is essential.
            If a vulnerability spans multiple lines, include all affected line numbers.
            
            If no vulnerabilities are found, return an empty array for "vulnerabilities".
            Be thorough and identify all potential vulnerabilities, but avoid false positives."""},
            {"role": "user", "content": f"Please analyze the following {''+language+' ' if language else ''}code for security vulnerabilities. Make sure to include accurate line numbers for each vulnerability in your response:\n\n```\n{code}\n```"}
        ]

        # Prepare the request payload
        payload = {
            "model": self.openai_model,
            "messages": messages,
            "temperature": 0.2
        }
        
        # Set up headers with API key
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.openai_api_key}"
        }
        
        # Make the API request with retry logic
        for attempt in range(self.max_retries):
            try:
                response = requests.post(
                    self.api_url,
                    headers=headers,
                    json=payload
                )
                
                # Handle rate limiting
                if response.status_code == 429:
                    if attempt < self.max_retries - 1:
                        wait_time = self.retry_delay * (attempt + 1)
                        print(f"Rate limit exceeded. Waiting {wait_time} seconds before retrying...")
                        time.sleep(wait_time)
                        continue
                    else:
                        return {"error": "Rate limit exceeded. Please try again later."}
                
                response.raise_for_status()  # Raise exception for other HTTP errors
                response_data = response.json()
                
                # Process the response
                if "choices" in response_data and len(response_data["choices"]) > 0:
                    content = response_data["choices"][0]["message"]["content"]
                    
                    # Try to extract JSON from the response
                    try:
                        # Find JSON in the response
                        json_start = content.find('{')
                        json_end = content.rfind('}') + 1
                        if json_start >= 0 and json_end > json_start:
                            json_str = content[json_start:json_end]
                            result = json.loads(json_str)
                            return result
                        else:
                            return {"analysis": content, "vulnerabilities": []}
                    except json.JSONDecodeError:
                        return {"analysis": content, "vulnerabilities": []}
                
                return {"error": "Unexpected API response format"}
                
            except requests.exceptions.RequestException as e:
                if attempt < self.max_retries - 1:
                    wait_time = self.retry_delay * (attempt + 1)
                    print(f"API request failed. Waiting {wait_time} seconds before retrying...")
                    time.sleep(wait_time)
                else:
                    return {"error": f"API request failed after {self.max_retries} attempts: {str(e)}"}
        
        return {"error": "Failed to get a response from the API"} 