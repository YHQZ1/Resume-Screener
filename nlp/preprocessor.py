import re
import spacy # type: ignore

try:
    nlp = spacy.load("en_core_web_sm", disable=["ner", "parser"])
except OSError:
    raise OSError("spaCy model missing. Run: python -m spacy download en_core_web_sm")


def preprocess(text: str) -> str:
    text = _clean(text)
    text = _tokenize(text)
    return text


def _clean(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\+\#\-\.\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _tokenize(text: str) -> str:
    doc = nlp(text)
    tokens = [
        token.text
        for token in doc
        if not token.is_stop
        and not token.is_punct
        and not token.is_space
        and len(token.text.strip()) > 1
    ]
    return " ".join(tokens)
