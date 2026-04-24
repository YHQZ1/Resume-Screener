import re
import sys
import spacy  # type: ignore


def _load_spacy_model():
    try:
        return spacy.load("en_core_web_sm", disable=["ner", "parser"])
    except OSError:
        print(
            "ERROR: spaCy model 'en_core_web_sm' not found. "
            "Run: python -m spacy download en_core_web_sm",
            file=sys.stderr,
        )
        raise


nlp = _load_spacy_model()


def preprocess(text: str) -> str:
    if not text or not text.strip():
        return ""
    text = _clean(text)
    return _tokenize_and_lemmatize(text)


def _clean(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\+\#\-\.\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _tokenize_and_lemmatize(text: str) -> str:
    doc = nlp(text)
    tokens = [
        token.lemma_
        for token in doc
        if not token.is_stop
        and not token.is_punct
        and not token.is_space
        and len(token.text.strip()) > 1
    ]
    return " ".join(tokens)
