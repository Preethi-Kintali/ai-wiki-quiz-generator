# llm.py
import os
from huggingface_hub import InferenceClient
from prompts import (
    QUIZ_PROMPT,
    RELATED_TOPICS_PROMPT,
    KEY_ENTITIES_PROMPT
)

MODEL_NAME = "meta-llama/Meta-Llama-3-8B-Instruct"

_client = None

def get_client():
    global _client
    if _client:
        return _client

    hf_token = os.getenv("HF_TOKEN")
    if not hf_token:
        raise RuntimeError("HF_TOKEN environment variable not set")

    _client = InferenceClient(
        model=MODEL_NAME,
        token=hf_token
    )
    return _client

def _call_llm(prompt: str, max_tokens: int) -> str:
    client = get_client()

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
    return _call_llm(QUIZ_PROMPT.format(article_text=article_text), 900)

def generate_related_topics(article_text: str) -> str:
    return _call_llm(RELATED_TOPICS_PROMPT.format(article_text=article_text), 300)

def extract_key_entities(article_text: str) -> str:
    return _call_llm(KEY_ENTITIES_PROMPT.format(article_text=article_text), 300)
