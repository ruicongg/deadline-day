import pandas as pd
import torch
from transformers import AutoTokenizer, AutoModelForQuestionAnswering
from transformers import pipeline
import numpy as np
from tqdm import tqdm
import logging
import os
from typing import Dict, List, Optional, Union, Tuple
from dataclasses import dataclass
import json
from functools import lru_cache
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class Config:
    model_name: str = 'deepset/roberta-base-squad2'
    max_context_articles: int = 5
    max_summary_articles: int = 3
    max_answer_length: int = 100
    data_path: str = 'NLP/90minFootballTransferNewsNLP.csv'
    device: str = 'cuda' if torch.cuda.is_available() else 'cpu'
    cache_dir: str = 'cache'

class ModelManager:
    """Singleton class to manage the QA model and tokenizer."""
    _instance = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not self._initialized:
            self.qa_tokenizer = None
            self.qa_model = None
            self.qa_pipeline = None
            self._initialized = True

    def initialize(self, config: Config) -> None:
        """Initialize the model and tokenizer if not already done."""
        if self.qa_pipeline is None:
            try:
                logger.info(f"Loading model {config.model_name}...")
                self.qa_tokenizer = AutoTokenizer.from_pretrained(config.model_name)
                self.qa_model = AutoModelForQuestionAnswering.from_pretrained(config.model_name)
                
                self.qa_pipeline = pipeline(
                    'question-answering',
                    model=self.qa_model,
                    tokenizer=self.qa_tokenizer,
                    device=0 if config.device == 'cuda' else -1
                )
                logger.info("Model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load model: {str(e)}")
                raise

    def get_pipeline(self) -> pipeline:
        """Get the QA pipeline."""
        if self.qa_pipeline is None:
            raise RuntimeError("Model not initialized. Call initialize() first.")
        return self.qa_pipeline

class DataManager:
    """Singleton class to manage the news data and player index."""
    _instance = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DataManager, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not self._initialized:
            self.news_df = None
            self.player_articles = None
            self._initialized = True

    def initialize(self, config: Config) -> None:
        """Initialize the data and create player index if not already done."""
        if self.news_df is None:
            self._load_data(config)
        if self.player_articles is None:
            self._create_player_index()

    def _load_data(self, config: Config) -> None:
        """Load and preprocess the news data."""
        try:
            logger.info(f"Loading news data from {config.data_path}...")
            self.news_df = pd.read_csv(config.data_path)
            logger.info(f"Loaded {len(self.news_df)} articles")
            
            # Validate required columns
            required_columns = ['Title', 'Content', 'Date']
            missing_columns = [col for col in required_columns if col not in self.news_df.columns]
            if missing_columns:
                raise ValueError(f"Missing required columns: {missing_columns}")
            
            self.news_df = self.news_df.dropna()
            self.news_df['full_text'] = self.news_df['Title'] + ' ' + self.news_df['Content']
            logger.info(f"Preprocessed {len(self.news_df)} articles")
        except Exception as e:
            logger.error(f"Failed to load data: {str(e)}")
            raise

    def _create_player_index(self) -> None:
        """Create an index of players mentioned in articles."""
        try:
            logger.info("Creating player index...")
            self.player_articles = {}
            
            for idx, row in tqdm(self.news_df.iterrows(), total=len(self.news_df)):
                text = row['full_text'].lower()
                self.player_articles[idx] = text
            
            logger.info(f"Created index for {len(self.player_articles)} articles")
        except Exception as e:
            logger.error(f"Failed to create player index: {str(e)}")
            raise

    @lru_cache(maxsize=1000)
    def find_relevant_articles(self, player_name: str) -> List[int]:
        """Find articles relevant to a specific player with caching."""
        if not player_name or not isinstance(player_name, str):
            raise ValueError("Player name must be a non-empty string")
        
        player_name = player_name.lower()
        relevant_indices = []
        
        for idx, text in self.player_articles.items():
            if player_name in text:
                relevant_indices.append(idx)
        
        logger.info(f"Found {len(relevant_indices)} relevant articles for {player_name}")
        return relevant_indices

    def get_article_texts(self, indices: List[int], max_articles: int) -> str:
        """Get combined text from articles by indices."""
        context = ""
        for idx in indices[:max_articles]:
            context += self.news_df.iloc[idx]['full_text'] + " "
        return context

    def get_recent_articles(self, indices: List[int], max_articles: int) -> pd.DataFrame:
        """Get recent articles by indices."""
        return self.news_df.iloc[indices[:max_articles]]

class FootballNewsAnalyzer:
    def __init__(self, config: Optional[Config] = None):
        self.config = config or Config()
        self.model_manager = ModelManager()
        self.data_manager = DataManager()
        self._initialize()

    def _initialize(self) -> None:
        """Initialize the model and data managers."""
        self.model_manager.initialize(self.config)
        self.data_manager.initialize(self.config)

    def answer_question(self, question: str, player_name: str) -> Dict[str, Union[str, float]]:
        """Answer questions about a specific player using the news articles."""
        if not question or not isinstance(question, str):
            raise ValueError("Question must be a non-empty string")
        
        relevant_indices = self.data_manager.find_relevant_articles(player_name)
        
        if not relevant_indices:
            logger.warning(f"No information found about {player_name}")
            return {
                'answer': f"No information found about {player_name}",
                'confidence': 0.0,
                'source': 'No relevant articles found'
            }
        
        context = self.data_manager.get_article_texts(
            relevant_indices, 
            self.config.max_context_articles
        )
        
        question_with_context = f"{question} about {player_name}"
        
        try:
            answer = self.model_manager.get_pipeline()(
                question=question_with_context,
                context=context,
                max_answer_length=self.config.max_answer_length
            )
            
            return {
                'answer': answer['answer'],
                'confidence': answer['score'],
                'source': 'Based on football news articles'
            }
        except Exception as e:
            logger.error(f"Error processing question: {str(e)}")
            return {
                'answer': f"Error processing question: {str(e)}",
                'confidence': 0.0,
                'source': 'Error in processing'
            }
    
    def get_player_summary(self, player_name: str) -> str:
        """Get a summary of recent news about a player."""
        if not player_name or not isinstance(player_name, str):
            raise ValueError("Player name must be a non-empty string")
        
        relevant_indices = self.data_manager.find_relevant_articles(player_name)
        
        if not relevant_indices:
            logger.warning(f"No recent news found about {player_name}")
            return f"No recent news found about {player_name}"
        
        recent_articles = self.data_manager.get_recent_articles(
            relevant_indices, 
            self.config.max_summary_articles
        )
        
        summary = f"Recent news about {player_name}:\n\n"
        for _, article in recent_articles.iterrows():
            summary += f"- {article['Title']}\n"
            summary += f"  Date: {article['Date']}\n\n"
        
        return summary

# Example usage
if __name__ == "__main__":
    try:
        config = Config()
        analyzer = FootballNewsAnalyzer(config)
        
        player = "Erling Haaland"
        questions = [
            "What team does he play for?",
            "What are his recent performances?",
            "Are there any transfer rumors?"
        ]
        
        logger.info(f"Analyzing information about {player}")
        print(f"\nAnalyzing information about {player}:")
        print("-" * 50)
        
        print(analyzer.get_player_summary(player))
        
        for question in questions:
            print(f"\nQ: {question}")
            answer = analyzer.answer_question(question, player)
            print(f"A: {answer}")
    except Exception as e:
        logger.error(f"Application error: {str(e)}")
        raise 