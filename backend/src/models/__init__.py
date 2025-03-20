from src.extensions.database import db

# Import all models
from .article import Article
from .entity import Entity
from .relation import Relation
from .statistical_data import StatisticalData

__all__ = ['Article', 'Entity', 'Relation', 'StatisticalData']