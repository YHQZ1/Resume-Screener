import io
import pdfplumber
from docx import Document # type: ignore
import re


def extract_text(file_bytes: bytes, filename: str) -> str:
    ext = filename.lower().split(".")[-1]
    if ext == "pdf":
        return _extract_from_pdf(file_bytes)
    if ext in ["docx", "doc"]:
        return _extract_from_docx(file_bytes)
    return _extract_from_txt(file_bytes)


def _extract_from_pdf(file_bytes: bytes) -> str:
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            return "\n".join(
                [p.extract_text(layout=True) or "" for p in pdf.pages]
            ).strip()
    except Exception:
        return ""


def _extract_from_docx(file_bytes: bytes) -> str:
    try:
        doc = Document(io.BytesIO(file_bytes))
        parts = [p.text for p in doc.paragraphs]
        for t in doc.tables:
            for r in t.rows:
                parts.extend([c.text for c in r.cells])
        return "\n".join(parts).strip()
    except Exception:
        return ""


def _extract_from_txt(file_bytes: bytes) -> str:
    try:
        return file_bytes.decode("utf-8", errors="ignore").strip()
    except Exception:
        return ""


def extract_entities(text: str) -> dict:
    email = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
    phone = re.search(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text)
    return {
        "email": email.group(0) if email else "Not Found",
        "phone": phone.group(0) if phone else "Not Found",
    }
