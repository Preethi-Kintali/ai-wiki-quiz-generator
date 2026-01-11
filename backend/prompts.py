# prompts.py

QUIZ_PROMPT = """
Generate 5 multiple-choice questions from the text below.

Rules:
- Use ONLY the given text
- Each question must have:
  question, options (4), answer, difficulty, explanation
- No hallucinations
- Return STRICT JSON only

JSON format:
{{
  "quiz": [
    {{
      "question": "...",
      "options": ["A","B","C","D"],
      "answer": "...",
      "difficulty": "easy|medium|hard",
      "explanation": "..."
    }}
  ]
}}

TEXT:
{article_text}
"""

RELATED_TOPICS_PROMPT = """
Suggest 3–5 related Wikipedia topics.

Rules:
- Use only the given text
- Return STRICT JSON only

JSON format:
{{
  "related_topics": ["topic1","topic2"]
}}

TEXT:
{article_text}
"""

KEY_ENTITIES_PROMPT = """
Extract key entities from the article text.

Rules:
- Use ONLY explicitly mentioned entities
- No explanations
- STRICT JSON only

JSON format:
{{
  "people": [],
  "organizations": [],
  "locations": []
}}

TEXT:
{article_text}
"""
