"""Models for code scanning and vulnerability explanation."""

# Import models to make them available when importing the package
from app.models.scanner import CodeScanner, Vulnerability
from app.models.explainer import VulnerabilityExplainer
from app.models.score_model import ScoreModel

# Import ML-based models if available
try:
    from app.models.ml_scanner import MLScanner, VulBERTaModel, VulDeePeckerModel
    ml_scanner_available = True
except (ImportError, ModuleNotFoundError):
    ml_scanner_available = False 
