from typing import List, Dict, Tuple
from app.models.scanner import Vulnerability

class ScoreModel:
    """
    A model that calculates security scores based on detected vulnerabilities.
    The scoring system starts with 50 points and deducts 5 points for each vulnerability.
    Scores can go negative if there are many vulnerabilities.
    """
    
    def __init__(self, base_score: int = 50, deduction_per_vulnerability: int = 5):
        """
        Initialize the score model with configurable scoring parameters.
        
        Args:
            base_score: The starting score for code with no vulnerabilities (default: 50)
            deduction_per_vulnerability: Points to deduct for each vulnerability (default: 5)
        """
        self.base_score = base_score
        self.deduction_per_vulnerability = deduction_per_vulnerability
    
    def calculate_score(self, vulnerabilities: List[Vulnerability]) -> int:
        """
        Calculate a security score based on the number of vulnerabilities.
        
        Args:
            vulnerabilities: List of detected vulnerabilities
            
        Returns:
            The calculated security score (can be negative)
        """
        # Start with base score and deduct points for each vulnerability
        score = self.base_score - (len(vulnerabilities) * self.deduction_per_vulnerability)
        
        # Score can go negative
        return score
    
    def get_score_details(self, vulnerabilities: List[Vulnerability]) -> Dict:
        """
        Get detailed information about the score calculation.
        
        Args:
            vulnerabilities: List of detected vulnerabilities
            
        Returns:
            Dictionary with score details
        """
        score = self.calculate_score(vulnerabilities)
        
        return {
            "score": score,
            "base_score": self.base_score,
            "total_vulnerabilities": len(vulnerabilities),
            "deduction_per_vulnerability": self.deduction_per_vulnerability,
            "total_deduction": len(vulnerabilities) * self.deduction_per_vulnerability,
            "vulnerability_types": self._count_vulnerability_types(vulnerabilities)
        }
    
    def _count_vulnerability_types(self, vulnerabilities: List[Vulnerability]) -> Dict[str, int]:
        """
        Count occurrences of each vulnerability type.
        
        Args:
            vulnerabilities: List of detected vulnerabilities
            
        Returns:
            Dictionary mapping vulnerability types to their counts
        """
        type_counts = {}
        
        for vuln in vulnerabilities:
            vuln_type = vuln.vulnerability_type
            if vuln_type in type_counts:
                type_counts[vuln_type] += 1
            else:
                type_counts[vuln_type] = 1
        
        return type_counts
