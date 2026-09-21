"""Small server-side translation adapter for AB Agri content."""

import html
import json
import re
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from .config import settings

MYMEMORY_URL = "https://api.mymemory.translated.net/get"
SUPPORTED_LANGUAGES = {"en", "ta", "kn"}


def _split_paragraph(paragraph: str, max_bytes: int = 450) -> list[str]:
    """Split a paragraph into requests small enough for the free translator."""
    if len(paragraph.encode("utf-8")) <= max_bytes:
        return [paragraph]

    chunks: list[str] = []
    current = ""
    for token in re.split(r"(\s+)", paragraph):
        if not token:
            continue
        candidate = current + token
        if current and len(candidate.encode("utf-8")) > max_bytes:
            chunks.append(current.strip())
            current = token.lstrip()
        else:
            current = candidate
    if current.strip():
        chunks.append(current.strip())
    return chunks or [paragraph]


def _translate_segment(text: str, source_language: str, target_language: str) -> str:
    params = {
        "q": text,
        "langpair": f"{source_language}|{target_language}",
        "mt": "1",
    }
    contact_email = settings.smtp_from_email or settings.smtp_username
    if contact_email:
        params["de"] = contact_email

    request = Request(
        f"{MYMEMORY_URL}?{urlencode(params)}",
        headers={"Accept": "application/json", "User-Agent": "AB-Agri/1.0"},
    )
    try:
        with urlopen(request, timeout=20) as response:
            result = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as error:
        raise RuntimeError("The translation service is temporarily unavailable.") from error

    if str(result.get("responseStatus")) != "200":
        message = result.get("responseDetails") or "The translation service could not translate this text."
        raise RuntimeError(str(message))
    translated = (result.get("responseData") or {}).get("translatedText", "").strip()
    if not translated:
        raise RuntimeError("The translation service returned an empty result.")
    return html.unescape(translated)


def translate_text(text: str, source_language: str, target_language: str) -> str:
    source_language = source_language.lower().strip()
    target_language = target_language.lower().strip()
    if source_language not in SUPPORTED_LANGUAGES or target_language not in SUPPORTED_LANGUAGES:
        raise ValueError("Only English, Tamil, and Kannada translation is supported.")
    if not text.strip() or source_language == target_language:
        return text

    translated_paragraphs = []
    for paragraph in text.split("\n"):
        if not paragraph.strip():
            translated_paragraphs.append("")
            continue
        segments = _split_paragraph(paragraph)
        translated_paragraphs.append(" ".join(_translate_segment(segment, source_language, target_language) for segment in segments))
    return "\n".join(translated_paragraphs)