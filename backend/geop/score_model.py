import json
from typing import Dict, Any, List, Optional, Tuple

class SecurityScoreCalculator:
    """
    A model for calculating security scores based on vulnerability analysis results.
    """
    
    def __init__(self, base_score: int = 50, points_per_vulnerability: int = 5):
        """
        Initialize the security score calculator.
        
        Args:
            base_score: The starting score for code with no vulnerabilities
            points_per_vulnerability: Points to deduct for each vulnerability found
        """
        self.base_score = base_score
        self.points_per_vulnerability = points_per_vulnerability
    
    def calculate_score(self, analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate security score based on analysis results.
        
        Args:
            analysis_results: The results from the SecurityCodeAnalyzer
            
        Returns:
            Dictionary containing score information
        """
        # Extract vulnerabilities from results
        vulnerabilities = analysis_results.get("vulnerabilities", [])
        vuln_count = len(vulnerabilities)
        
        # Calculate raw score
        raw_score = self.base_score - (vuln_count * self.points_per_vulnerability)
        
        # Get score category and color
        category, color = self._get_score_category(raw_score)
        
        # Create score object
        score_data = {
            "score": raw_score,
            "max_score": self.base_score,
            "vulnerability_count": vuln_count,
            "category": category,
            "color": color,
            "deduction_per_vulnerability": self.points_per_vulnerability
        }
        
        # Add score to results
        results_with_score = analysis_results.copy()
        results_with_score["security_score"] = score_data
        
        return results_with_score
    
    def _get_score_category(self, score: int) -> Tuple[str, str]:
        """
        Get the category and color for a given score.
        
        Args:
            score: The calculated security score
            
        Returns:
            Tuple of (category, color)
        """
        if score >= 50:
            return "Perfect", "#00cc00"  # Bright green
        elif score >= 40:
            return "Good", "#4caf50"  # Green
        elif score >= 30:
            return "Moderate", "#ff9800"  # Orange
        elif score >= 10:
            return "Poor", "#f44336"  # Red
        elif score >= 0:
            return "Critical", "#d32f2f"  # Dark red
        else:
            return "Severe", "#b71c1c"  # Very dark red
    
    def get_score_feedback(self, score: int) -> str:
        """
        Get feedback message based on score.
        
        Args:
            score: The calculated security score
            
        Returns:
            Feedback message
        """
        if score >= 50:
            return "🎉 Perfect! Your code has no detected vulnerabilities."
        elif score >= 40:
            return "✅ Good job! Your code has few vulnerabilities."
        elif score >= 30:
            return "⚠️ Caution! Your code has several vulnerabilities."
        elif score >= 10:
            return "🚨 High Risk! Your code has many vulnerabilities."
        elif score >= 0:
            return "☠️ Critical Risk! Your code has serious security issues."
        else:
            return "☢️ Severe Risk! Your code has severe security vulnerabilities."