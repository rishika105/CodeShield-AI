"""
Code highlighting utilities for the security analyzer.
"""

import pygments
from pygments.lexers import get_lexer_by_name, guess_lexer
from pygments.formatters import HtmlFormatter, TerminalFormatter
from pygments.util import ClassNotFound


def highlight_code(code, language=None, formatter="html"):
    """
    Highlight code using Pygments.
    
    Args:
        code: The code to highlight
        language: The programming language (optional, will be guessed if not provided)
        formatter: The formatter to use ("html" or "terminal")
        
    Returns:
        Highlighted code as HTML or with terminal colors
    """
    try:
        # Get the lexer
        if language:
            try:
                lexer = get_lexer_by_name(language.lower())
            except ClassNotFound:
                # If the specified language is not found, try to guess
                lexer = guess_lexer(code)
        else:
            lexer = guess_lexer(code)
        
        # Get the formatter
        if formatter.lower() == "html":
            pygments_formatter = HtmlFormatter(style="monokai")
        else:
            pygments_formatter = TerminalFormatter()
        
        # Highlight the code
        result = pygments.highlight(code, lexer, pygments_formatter)
        
        return result
    except Exception as e:
        # If something goes wrong, return the code without highlighting
        print(f"Error highlighting code: {str(e)}")
        if formatter.lower() == "html":
            return f"<pre>{code}</pre>"
        return code


def get_css_for_html_formatter(style="monokai"):
    """
    Get CSS styles for HTML formatter.
    
    Args:
        style: The pygments style name
        
    Returns:
        CSS styles as a string
    """
    formatter = HtmlFormatter(style=style)
    return formatter.get_style_defs('.highlight') 