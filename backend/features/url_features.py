"""
backend/features/url_features.py
Deterministic, safe static URL feature extraction module for PhishGuard.
Never visits, executes, or crawls submitted URLs.
"""

import re
import math
from urllib.parse import urlparse

SUSPICIOUS_KEYWORDS = [
    "login", "verify", "verification", "account", "secure", "security",
    "update", "password", "bank", "confirm", "signin", "authenticate",
    "wallet", "payment", "free", "bonus", "alert", "suspend", "recover",
    "unlock", "billing", "invoice", "paypal", "ebay", "amazon", "appleid"
]

SHORTENING_SERVICES = {
    "bit.ly", "goo.gl", "shorte.st", "go2l.ink", "x.co", "ow.ly", "t.co",
    "tinyurl.com", "tr.im", "is.gd", "cli.gs", "yfrog.com", "migre.me",
    "ff.im", "tiny.cc", "url4.eu", "twit.ac", "su.pr", "twurl.nl", "snipurl.com",
    "short.to", "BudURL.com", "ping.fm", "post.ly", "Just.as", "bkite.com",
    "snipr.com", "fic.kr", "loopt.us", "doiop.com", "short.ie", "kl.am",
    "wp.me", "rubyurl.com", "om.ly", "to.ly", "bit.do", "lnkd.in", "db.tt",
    "qr.ae", "adf.ly", "bitly.com", "cur.lv", "tinyurl.com", "ow.ly", "ity.im",
    "q.gs", "po.st", "bc.vc", "twitthis.com", "u.to", "j.mp", "buzurl.com",
    "cutt.us", "u.bb", "yourls.org", "prettylinkpro.com", "scrnch.me",
    "filoops.info", "vzturl.com", "qr.net", "1url.com", "tweez.me", "v.gd",
    "link.zip.net", "rb.gy", "cutt.ly"
}

SUSPICIOUS_TLDS = {
    "xyz", "tk", "ml", "ga", "cf", "gq", "pw", "top", "click", "link",
    "loan", "work", "party", "download", "win", "review", "stream", "zip", "mov"
}

FEATURE_NAMES = [
    "url_length",
    "hostname_length",
    "path_length",
    "num_dots",
    "num_hyphens",
    "num_underscores",
    "num_slashes",
    "num_question_marks",
    "num_equals",
    "num_at",
    "num_digits",
    "num_special_chars",
    "num_subdomains",
    "has_https",
    "has_ip",
    "is_shortened",
    "suspicious_keyword_count",
    "has_suspicious_keywords",
    "domain_entropy",
    "has_suspicious_tld",
    "digit_ratio",
    "special_char_ratio"
]


def calculate_entropy(text: str) -> float:
    """Calculate Shannon entropy of a string."""
    if not text:
        return 0.0
    length = len(text)
    frequencies = {c: text.count(c) / length for c in set(text)}
    return round(-sum(p * math.log2(p) for p in frequencies.values() if p > 0), 4)


def normalize_url(url: str) -> str:
    """Normalize URL string safely without network calls."""
    if not url or not isinstance(url, str):
        return ""
    cleaned = url.strip()
    if not cleaned.startswith(("http://", "https://", "ftp://")):
        cleaned = "http://" + cleaned
    return cleaned


def validate_url(url: str) -> tuple[bool, str, str]:
    """
    Validate URL syntax safely.
    Returns: (is_valid, normalized_url, error_message)
    """
    if not url or not isinstance(url, str):
        return False, "", "Please enter a valid URL."
    raw = url.strip()
    if not raw:
        return False, "", "Please enter a valid URL."
    if len(raw) > 2048:
        return False, "", "URL exceeds maximum allowed length (2048 characters)."
    if " " in raw:
        return False, "", "Invalid URL: spaces are not allowed in URLs."

    normalized = normalize_url(raw)
    try:
        parsed = urlparse(normalized)
        hostname = (parsed.netloc or "").split(":")[0].lower()
        if not hostname:
            return False, "", "Invalid URL: missing domain/hostname."
        # Must contain at least one dot or be a valid IPv4 address
        if "." not in hostname:
            return False, "", "Please enter a valid URL with a top-level domain (e.g., https://example.com)."
        if hostname.startswith(".") or hostname.endswith("."):
            return False, "", "Invalid domain format."
        return True, normalized, ""
    except Exception:
        return False, "", "Please enter a valid URL."


def extract_features_dict(url: str) -> dict:
    """
    Extract all 22 deterministic URL features for ML inference and training.
    """
    raw_trimmed = (url or "").strip()
    explicit_https = 1 if raw_trimmed.lower().startswith("https://") else 0

    normalized = normalize_url(raw_trimmed)
    try:
        parsed = urlparse(normalized)
        hostname = (parsed.netloc or "").split(":")[0].lower()
        path = parsed.path or ""
        query = parsed.query or ""
    except Exception:
        hostname = ""
        path = ""
        query = ""

    full_path = f"{path}?{query}" if query else path
    url_lower = normalized.lower()

    url_length = len(raw_trimmed)
    hostname_length = len(hostname)
    path_length = len(full_path)

    num_dots = raw_trimmed.count(".")
    num_hyphens = hostname.count("-") + path.count("-")
    num_underscores = raw_trimmed.count("_")
    # Count slashes after scheme
    scheme_removed = re.sub(r"^[a-zA-Z]+://", "", raw_trimmed)
    num_slashes = scheme_removed.count("/")
    num_question_marks = raw_trimmed.count("?")
    num_equals = raw_trimmed.count("=")
    num_at = raw_trimmed.count("@")
    num_digits = sum(c.isdigit() for c in raw_trimmed)
    num_special_chars = sum(not c.isalnum() and c not in ":/.-" for c in raw_trimmed)

    # IP address check
    ip_pattern = r"^(\d{1,3}\.){3}\d{1,3}$"
    hex_ip_pattern = r"^0x[0-9a-f]+$"
    has_ip = 1 if (re.match(ip_pattern, hostname) or re.match(hex_ip_pattern, hostname)) else 0

    # Subdomain count (0 if hostname is a raw IP address)
    host_parts = [p for p in hostname.split(".") if p]
    if host_parts and host_parts[0] == "www":
        host_parts = host_parts[1:]
    num_subdomains = 0 if has_ip else max(0, len(host_parts) - 2)

    # Shortening service check
    clean_host = hostname[4:] if hostname.startswith("www.") else hostname
    is_shortened = 1 if clean_host in SHORTENING_SERVICES else 0

    # Suspicious keywords
    matched_keywords = [kw for kw in SUSPICIOUS_KEYWORDS if kw in url_lower]
    suspicious_keyword_count = len(matched_keywords)
    has_suspicious_keywords = 1 if suspicious_keyword_count > 0 else 0

    # Domain entropy
    domain_entropy = calculate_entropy(hostname)

    # TLD check
    tld = "" if has_ip else (host_parts[-1] if host_parts else "")
    has_suspicious_tld = 1 if tld in SUSPICIOUS_TLDS else 0

    digit_ratio = round(num_digits / max(url_length, 1), 4)
    special_char_ratio = round((num_special_chars + num_hyphens + num_underscores) / max(url_length, 1), 4)

    return {
        "url_length": url_length,
        "hostname_length": hostname_length,
        "path_length": path_length,
        "num_dots": num_dots,
        "num_hyphens": num_hyphens,
        "num_underscores": num_underscores,
        "num_slashes": num_slashes,
        "num_question_marks": num_question_marks,
        "num_equals": num_equals,
        "num_at": num_at,
        "num_digits": num_digits,
        "num_special_chars": num_special_chars,
        "num_subdomains": num_subdomains,
        "has_https": explicit_https,
        "has_ip": has_ip,
        "is_shortened": is_shortened,
        "suspicious_keyword_count": suspicious_keyword_count,
        "has_suspicious_keywords": has_suspicious_keywords,
        "domain_entropy": domain_entropy,
        "has_suspicious_tld": has_suspicious_tld,
        "digit_ratio": digit_ratio,
        "special_char_ratio": special_char_ratio,
    }


def extract_features_vector(url: str) -> list:
    """Return ordered list of numeric features matching FEATURE_NAMES."""
    feat_dict = extract_features_dict(url)
    return [feat_dict[name] for name in FEATURE_NAMES]


def generate_explanations(url: str, features: dict, is_phishing: bool) -> list[str]:
    """
    Generate deterministic, human-readable explanations from actual URL characteristics.
    """
    reasons = []
    url_lower = url.lower()
    matched_kws = [kw for kw in SUSPICIOUS_KEYWORDS if kw in url_lower]

    if is_phishing:
        if features["has_ip"] == 1:
            reasons.append("Raw IP address used instead of a standard domain name")
        if matched_kws:
            reasons.append(f"Suspicious keywords detected ({', '.join(matched_kws[:4])})")
        if features["url_length"] > 75:
            reasons.append(f"Unusually long URL ({features['url_length']} characters)")
        if features["num_hyphens"] >= 2:
            reasons.append(f"Multiple hyphens ({features['num_hyphens']}) - common brand spoofing pattern")
        if features["has_https"] == 0:
            reasons.append("HTTP used instead of encrypted HTTPS protocol")
        if features["num_subdomains"] >= 2:
            reasons.append(f"Suspicious subdomain chain ({features['num_subdomains']} subdomains)")
        if features["is_shortened"] == 1:
            reasons.append("URL shortening service detected - obscures final destination")
        if features["has_suspicious_tld"] == 1:
            reasons.append("High-risk top-level domain (TLD) frequently abused in phishing")
        if features["num_at"] > 0:
            reasons.append("Contains '@' symbol - browser credential redirect trick")
        if features["domain_entropy"] > 3.7:
            reasons.append(f"High hostname entropy ({features['domain_entropy']}) indicating random/generated characters")
        if features["num_special_chars"] >= 3 or features["num_equals"] >= 2:
            reasons.append("Multiple query parameters and special characters detected")
        if not reasons:
            reasons.append("Structural URL feature combination matches known phishing patterns")
    else:
        if features["has_https"] == 1:
            reasons.append("HTTPS enabled - encrypted communication protocol")
        if features["url_length"] <= 75:
            reasons.append(f"Normal URL length ({features['url_length']} characters)")
        if features["suspicious_keyword_count"] == 0:
            reasons.append("No suspicious phishing or credential-harvesting keywords detected")
        if features["num_subdomains"] <= 1 and features["num_hyphens"] <= 1:
            reasons.append("Clean domain and subdomain structure")
        if features["has_ip"] == 0 and features["has_suspicious_tld"] == 0:
            reasons.append("Standard registered top-level domain format")
        if not reasons:
            reasons.append("Overall lexical signature aligns with legitimate websites")

    return reasons
