import streamlit as st
import os
import json
from model import SecurityCodeAnalyzer
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def main():
    st.set_page_config(
        page_title="SecureCode Analyzer",
        page_icon="🔒",
        layout="wide"
    )
    
    st.title("🔒 SecureCode Analyzer")
    st.subheader("Find and fix security vulnerabilities in your code with plain language explanations")
    
    # Sidebar for API key and settings
    with st.sidebar:
        st.header("Settings")
        
        # API selection
        api_option = st.radio(
            "Select AI Provider",
            ["Google Gemini", "OpenAI"],
            index=0
        )
        
        use_gemini = (api_option == "Google Gemini")
        
        # API key input based on selection
        if use_gemini:
            default_api_key = os.getenv("GOOGLE_API_KEY", "")
            api_key = st.text_input("Google API Key", value=default_api_key, type="password", help="Enter your Google API key")
        else:
            default_api_key = os.getenv("OPENAI_API_KEY", "")
            api_key = st.text_input("OpenAI API Key", value=default_api_key, type="password", help="Enter your OpenAI API key")
        
        st.markdown("---")
        st.markdown("### Language Selection")
        language = st.selectbox(
            "Select the programming language",
            [
                "None/Auto-detect", "Python", "JavaScript", "TypeScript", "Java", "C#", 
                "PHP", "Ruby", "Go", "Rust", "C++", "C", "SQL"
            ]
        )
        if language == "None/Auto-detect":
            language = None
            
        st.markdown("---")
        st.markdown("### About")
        st.markdown("""
        This tool analyzes your code for security vulnerabilities and provides:
        - Plain language explanations
        - Risk assessments
        - Exploit scenarios
        - Step-by-step remediation
        - Secure code examples
        """)
    
    # Main content area
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.markdown("### 📝 Input Your Code")
        code_input = st.text_area(
            "Paste your code here",
            height=400,
            placeholder="// Paste your code here to analyze for security vulnerabilities..."
        )
        
        analyze_button = st.button("🔍 Analyze Security Vulnerabilities", type="primary")
    
    # Results area (initially hidden)
    if "results" not in st.session_state:
        st.session_state.results = None
        
    # Process code when button is clicked
    if analyze_button:
        if not api_key:
            st.error(f"Please enter your {'Google' if use_gemini else 'OpenAI'} API key in the sidebar")
        elif not code_input or code_input.strip() == "":
            st.error("Please provide some code to analyze")
        else:
            with st.spinner("Analyzing code for security vulnerabilities..."):
                try:
                    # Create debug message
                    st.info("Initializing analyzer...")
                    
                    # Initialize the analyzer
                    analyzer = SecurityCodeAnalyzer(api_key=api_key, use_gemini=use_gemini)
                    
                    st.info("Analyzing code...")
                    # Analyze the code
                    results = analyzer.analyze_code(code_input, language=language)
                    st.session_state.results = results
                    
                    st.info("Analysis complete!")
                except Exception as e:
                    st.error(f"Error analyzing code: {str(e)}")
    
    # Display results if available
    with col2:
        st.markdown("### 📊 Analysis Results")
        
        if st.session_state.results:
            results = st.session_state.results
            
            if "error" in results:
                st.error(results["error"])
            elif "analysis" in results:
                # General analysis without specific vulnerabilities
                st.markdown(results["analysis"])
            else:
                vulnerabilities = results.get("vulnerabilities", [])
                if not vulnerabilities:
                    st.success("✅ No security vulnerabilities were identified in the provided code.")
                else:
                    # Display summary
                    st.error(f"⚠️ Found {len(vulnerabilities)} potential security {'vulnerability' if len(vulnerabilities) == 1 else 'vulnerabilities'}.")
                    
                    # Display each vulnerability in an expandable section
                    for i, vuln in enumerate(vulnerabilities, 1):
                        with st.expander(f"Vulnerability #{i}: {vuln['vulnerability_type']}"):
                            st.markdown("#### What's the problem?")
                            st.markdown(vuln['description'])
                            
                            st.markdown("#### Why is this dangerous?")
                            st.markdown(vuln['risk'])
                            
                            if 'exploit_scenario' in vuln and vuln['exploit_scenario']:
                                st.markdown("#### How could an attacker exploit this?")
                                st.markdown(vuln['exploit_scenario'])
                            
                            if 'vulnerable_code' in vuln and vuln['vulnerable_code']:
                                st.markdown("#### Vulnerable Code")
                                st.code(vuln['vulnerable_code'])
                            
                            if 'line_numbers' in vuln and vuln['line_numbers']:
                                st.markdown(f"**Line numbers:** {', '.join(map(str, vuln['line_numbers']))}")
                            
                            st.markdown("#### How to fix it")
                            st.markdown(vuln['remediation_steps'])
                            
                            if 'secure_code_example' in vuln and vuln['secure_code_example']:
                                st.markdown("#### Secure Code Example")
                                st.code(vuln['secure_code_example'])
                    
                    # Add option to download results as JSON
                    if st.button("Download Analysis Results"):
                        json_str = json.dumps(results, indent=2)
                        st.download_button(
                            label="Download JSON",
                            data=json_str,
                            file_name="security_analysis_results.json",
                            mime="application/json"
                        )

if __name__ == "__main__":
    main()