import pandas as pd
import torch
from transformers import AutoTokenizer, AutoModelForQuestionAnswering
from transformers import pipeline
import numpy as np
from tqdm import tqdm

class FootballNewsAnalyzer:
    def __init__(self):
        # Load BERT model and tokenizer for question answering
        self.qa_tokenizer = AutoTokenizer.from_pretrained('deepset/roberta-base-squad2')
        self.qa_model = AutoModelForQuestionAnswering.from_pretrained('deepset/roberta-base-squad2')
        
        # Create question-answering pipeline
        self.qa_pipeline = pipeline(
            'question-answering',
            model=self.qa_model,
            tokenizer=self.qa_tokenizer,
            device=0 if torch.cuda.is_available() else -1
        )
        
        # Load and preprocess the news data
        print("Loading news data...")
        self.news_df = pd.read_csv('NLP/90minFootballTransferNewsNLP.csv')
        print("\nDataFrame columns:", self.news_df.columns.tolist())
        print("\nFirst few rows:")
        print(self.news_df.head())
        
        self.news_df = self.news_df.dropna()
        
        # Create a combined text field for each article
        self.news_df['full_text'] = self.news_df['Title'] + ' ' + self.news_df['Content']
        
        # Create player index
        self.create_player_index()
    
    def create_player_index(self):
        """Create an index of players mentioned in articles"""
        self.player_articles = {}
        
        # Simple player name extraction (can be enhanced with NER)
        for idx, row in tqdm(self.news_df.iterrows(), total=len(self.news_df)):
            text = row['full_text'].lower()
            # Store article index for each player
            if idx not in self.player_articles:
                self.player_articles[idx] = text
    
    def find_relevant_articles(self, player_name):
        """Find articles relevant to a specific player"""
        player_name = player_name.lower()
        relevant_indices = []
        
        for idx, text in self.player_articles.items():
            if player_name in text:
                relevant_indices.append(idx)
        
        return relevant_indices
    
    def answer_question(self, question, player_name):
        """Answer questions about a specific player using the news articles"""
        # Find relevant articles
        relevant_indices = self.find_relevant_articles(player_name)
        
        if not relevant_indices:
            return f"No information found about {player_name}"
        
        # Combine relevant articles
        context = ""
        for idx in relevant_indices[:5]:  # Use top 5 articles to keep context within token limits
            context += self.news_df.iloc[idx]['full_text'] + " "
        
        # Prepare question with player context
        question_with_context = f"{question} about {player_name}"
        
        # Get answer using BERT
        try:
            answer = self.qa_pipeline(
                question=question_with_context,
                context=context,
                max_answer_length=100
            )
            
            return {
                'answer': answer['answer'],
                'confidence': answer['score'],
                'source': 'Based on football news articles'
            }
        except Exception as e:
            return f"Error processing question: {str(e)}"
    
    def get_player_summary(self, player_name):
        """Get a summary of recent news about a player"""
        relevant_indices = self.find_relevant_articles(player_name)
        
        if not relevant_indices:
            return f"No recent news found about {player_name}"
        
        # Get most recent articles
        recent_articles = self.news_df.iloc[relevant_indices[:3]]
        
        summary = f"Recent news about {player_name}:\n\n"
        for _, article in recent_articles.iterrows():
            summary += f"- {article['Title']}\n"
            summary += f"  Date: {article['Date']}\n\n"
        
        return summary

# Example usage
if __name__ == "__main__":
    analyzer = FootballNewsAnalyzer()
    
    # Example questions
    player = "Erling Haaland"
    questions = [
        "What team does he play for?",
        "What are his recent performances?",
        "Are there any transfer rumors?"
    ]
    
    print(f"\nAnalyzing information about {player}:")
    print("-" * 50)
    
    # Get player summary
    print(analyzer.get_player_summary(player))
    
    # Answer specific questions
    for question in questions:
        print(f"\nQ: {question}")
        answer = analyzer.answer_question(question, player)
        print(f"A: {answer}") 