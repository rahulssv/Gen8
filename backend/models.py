from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from typing import Optional, Dict

Base = declarative_base()

class Article(Base):
    __tablename__ = 'article'
    id = Column(Integer, primary_key=True)
    pmid = Column(String(20), unique=True)
    title = Column(String(500))
    authors = Column(ARRAY(String(200)))
    journal = Column(String(200))
    year = Column(Integer)
    url = Column(String(500))
    abstract = Column(Text)
    source = Column(String(50))
    relevance_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class Entity(Base):
    __tablename__ = 'entity'
    id = Column(Integer, primary_key=True)
    name = Column(String(200), index=True)
    type = Column(String(50), index=True)
    mentions = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

class Relation(Base):
    __tablename__ = 'relation'
    id = Column(Integer, primary_key=True)
    subject_id = Column(Integer, ForeignKey('entity.id'))
    predicate = Column(String(200))
    object_id = Column(Integer, ForeignKey('entity.id'))
    confidence = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    subject = relationship('Entity', foreign_keys=[subject_id], backref='relations_as_subject')
    object = relationship('Entity', foreign_keys=[object_id], backref='relations_as_object')

class StatisticalData(Base):
    __tablename__ = 'statistical_data'
    id = Column(Integer, primary_key=True)
    type = Column(String(50))
    value = Column(String(100))
    unit = Column(String(50))
    context = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class NormalRange(Base):
    __tablename__ = "normal_ranges"

    id = Column(Integer, primary_key=True, index=True)
    min = Column(Float, nullable=True)
    max = Column(Float, nullable=True)

    def __init__(self, min=0.0, max=0.0):
        self.min = min
        self.max = max

class Biomarker:
    __tablename__ = "biomarker"
    def __init__(self, id, name, value, unit, normal_range, description):
        self.id = id
        self.name = name
        self.value = value
        self.unit = unit
        self.normal_range = NormalRange(**normal_range)
        self.description = description


class Drug(Base):
    __tablename__ = 'drugs'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)
    mechanism = Column(String)
    efficacy = Column(String)
    approval_status = Column(String)
    url = Column(String)

class AIQuestions(Base):
    __tablename__ = 'AI_questions'
    id = Column(Integer, primary_key=True)
    question = Column(String(50))
    answer = Column(String(100))


# filepath: /workspaces/Gen8/backend/models.py
class Disease:
    def __init__(self, disease, relationship, strength, evidence, notes):
        self.disease = disease
        self.relationship = relationship
        self.strength = strength
        self.evidence = evidence
        self.notes = notes

    def to_dict(self):
        return {
            "disease": self.disease,
            "relationship": self.relationship,
            "strength": self.strength,
            "evidence": self.evidence,
            "notes": self.notes
        }