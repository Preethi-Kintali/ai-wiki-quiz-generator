# llm.py
import os
import json
from huggingface_hub import InferenceClient
from prompts import (
    QUIZ_PROMPT,
    RELATED_TOPICS_PROMPT,
    KEY_ENTITIES_PROMPT
)

HF_TOKEN = os.getenv("HF_TOKEN")
if not HF_TOKEN:
    raise RuntimeError("HF_TOKEN environment variable not set")

MODEL_NAME = "meta-llama/Meta-Llama-3-8B-Instruct"

client = InferenceClient(
    model=MODEL_NAME,
    token=HF_TOKEN
)

def _call_llm(prompt: str, max_tokens: int) -> str:
    response = client.chat_completion(
        messages=[
            {"role": "system", "content": "Return ONLY valid JSON."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=max_tokens,
        temperature=0.3
    )

    text = response.choices[0].message["content"]
    if not text:
        raise RuntimeError("Empty LLM response")

    return text.strip()

def generate_quiz(article_text: str) -> str:
    return _call_llm(
        QUIZ_PROMPT.format(article_text=article_text),
        max_tokens=900
    )

def generate_related_topics(article_text: str) -> str:
    return _call_llm(
        RELATED_TOPICS_PROMPT.format(article_text=article_text),
        max_tokens=300
    )

def extract_key_entities(article_text: str) -> str:
    return _call_llm(
        KEY_ENTITIES_PROMPT.format(article_text=article_text),
        max_tokens=300
    )
