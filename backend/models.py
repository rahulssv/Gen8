from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from typing import Optional, Dict
from pydantic import Base

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

class Biomarker(BaseModel):
    id: str
    name: str
    value: str
    unit: Optional[str] = None
    normal_range: Optional[Dict[str, float]] = None
    description: Optional[str] = None  # Made optional to prevent validation issues

class Config:
        orm_mode = True 

class Biomarker(Base):
    __tablename__ = 'biomarker'
    id = Column(Integer, primary_key=True)
    type = Column(String(50))
    value = Column(String(100))
    unit = Column(String(50))
    normal_range: Optional[dict]
    description: str
