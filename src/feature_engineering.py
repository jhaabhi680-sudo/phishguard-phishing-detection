"""
feature_engineering.py
Feature engineering module for the Phishing URL Detection System.
Extracts meaningful features from URLs for phishing detection.
Produces a dict whose keys match the PhiUSIIL dataset column names.
"""

import re
import math
from urllib.parse import urlparse
import numpy as np

# ---------------------------------------------------------------------------
# Suspicious keyword lists used for heuristic flagging
# ---------------------------------------------------------------------------
SUSPICIOUS_KEYWORDS = [
    'login', 'signin', 'verify', 'account', 'secure', 'update', 'banking',
    'confirm', 'paypal', 'ebay', 'amazon', 'support', 'password', 'credential',
    'wallet', 'crypto', 'bitcoin', 'payment', 'free', 'win', 'prize',
    'alert', 'suspend', 'unlock', 'recover', 'access', 'authenticate'
]

SUSPICIOUS_TLDS = {
    'xyz', 'tk', 'ml', 'ga', 'cf', 'gq', 'pw', 'top', 'click', 'link',
    'loan', 'work', 'party', 'download', 'win', 'racing', 'date',
    'faith', 'review', 'stream', 'zip', 'mov'
}

BANK_KEYWORDS   = ['bank', 'banking', 'finance', 'savings', 'credit']
PAY_KEYWORDS    = ['pay', 'payment', 'paypal', 'checkout', 'purchase', 'invoice']
CRYPTO_KEYWORDS = ['crypto', 'bitcoin', 'btc', 'ethereum', 'eth', 'wallet', 'coin', 'nft']


def _shannon_entropy(s: str) -> float:
    """Shannon entropy of a string (bits per character)."""
    if not s:
        return 0.0
    prob = [s.count(c) / len(s) for c in set(s)]
    return -sum(p * math.log2(p) for p in prob if p > 0)


def extract_url_features(url: str) -> dict:
    """
    Extract a rich set of URL-based features whose keys match the
    PhiUSIIL dataset column names.  All features are computed statically
    from the URL string without visiting the website.

    Feature explanations
    --------------------
    URLLength               Longer URLs are commonly used to obfuscate the real destination.
    DomainLength            Unusually short/long domains can indicate auto-generated names.
    IsDomainIP              IP addresses instead of hostnames are a strong phishing signal.
    TLDLength               Suspicious TLDs are often short single-character or long strings.
    NoOfSubDomain           Multiple subdomains (e.g. login.secure.evil.com) are a red flag.
    NoOfDots                Dot count correlates with subdomain depth.
    NoOfHyphens             Hyphens used to mimic brands (e.g. paypal-secure.tk).
    NoOfUnderLine           Underscores are unusual in legitimate domains.
    NoOfSlash               Deep URL paths often hide the real page.
    NoOfQmark               Multiple query strings may carry payloads or tracking tokens.
    NoOfEqual               Query key=value pairs; many equals is unusual for simple pages.
    NoOfAnd                 Chained query parameters; unusual for login/landing pages.
    NoOfAt                  @ sign in URL causes browser to use the host after @.
    NoOfOtherSpecialCharsInURL  Extra special chars used for obfuscation.
    IsHTTPS                 Legitimate sites almost always use HTTPS.
    NoOfURLRedirects        Multiple redirects hide the final destination.
    URLSimilarityIndex      Shannon entropy: high entropy → obfuscated URL.
    URLCharProb             Relative probability of URL characters being normal.
    SpacialCharRatioInURL   Ratio of special characters to total URL length.
    DomainTitleMatchScore   How well the domain name matches the page title.
    URLTitleMatchScore      How well the URL matches the page title.
    HasObfuscation          Presence of obfuscation techniques (%xx encoding, hex, etc.).
    ObfuscationRatio        Fraction of the URL that is percent-encoded.
    Bank                    Banking-related keywords in URL.
    Pay                     Payment-related keywords in URL.
    Crypto                  Cryptocurrency-related keywords in URL.
    TLDLegitimateProb       Probability score of the TLD being from a legitimate registry.
    CharContinuationRate    Rate of character continuation (length-of-longest-run / total).
    NoOfLettersInURL        Count of alphabetic characters in the URL.
    LetterRatioInURL        Ratio of alphabetic characters to total URL length.
    NoOfDegitsInURL         Count of digit characters in the URL.
    DegitRatioInURL         Ratio of digits to total URL length.
    NoOfEqualsInURL         '=' count (alias for NoOfEqual for dataset compatibility).
    NoOfQMarkInURL          '?' count (alias for NoOfQmark).
    NoOfAmpersandInURL      '&' count (alias for NoOfAnd).
    """
    features: dict = {}

    # --- Parse URL ---
    try:
        if not url.startswith(('http://', 'https://', 'ftp://')):
            parsed_url = 'http://' + url
        else:
            parsed_url = url
        parsed  = urlparse(parsed_url)
        scheme  = parsed.scheme.lower()
        netloc  = parsed.netloc or ''
        path    = parsed.path or ''
        query   = parsed.query or ''
        # Remove port from netloc
        domain  = netloc.split(':')[0].lower()
    except Exception:
        scheme = domain = netloc = path = query = ''

    url_lower = url.lower()
    url_full  = url  # preserve case for length

    # -----------------------------------------------------------------------
    # URL structure features
    # -----------------------------------------------------------------------
    features['URLLength']   = len(url_full)
    features['DomainLength'] = len(domain)

    # Subdomains: parts of domain minus TLD and registrable domain (SLD+TLD)
    parts = domain.split('.')
    tld   = parts[-1] if parts else ''
    features['TLDLength']    = len(tld)
    features['NoOfSubDomain'] = max(0, len(parts) - 2)

    # Is the host an IP address?
    _ip_re = re.compile(r'^(\d{1,3}\.){3}\d{1,3}$')
    features['IsDomainIP'] = int(bool(_ip_re.match(domain)))

    # HTTPS
    features['IsHTTPS'] = int(scheme == 'https')

    # Character counts
    features['NoOfDots']      = url_full.count('.')
    features['NoOfHyphens']   = domain.count('-')     # hyphens in domain only
    features['NoOfUnderLine'] = url_full.count('_')
    features['NoOfSlash']     = path.count('/')
    features['NoOfQmark']     = url_full.count('?')
    features['NoOfEqual']     = url_full.count('=')
    features['NoOfAnd']       = url_full.count('&')
    features['NoOfAt']        = url_full.count('@')

    # Special chars (non-alphanumeric, non . / : -)
    special_chars = re.findall(r'[^a-zA-Z0-9.\-/:_=&?@%#]', url_full)
    features['NoOfOtherSpecialCharsInURL'] = len(special_chars)

    # Redirects (extra double-slash in path beyond scheme://)
    redirect_count = max(0, url_full.count('//') - 1)
    features['NoOfURLRedirects'] = redirect_count

    # Path depth
    path_segments = [p for p in path.split('/') if p]
    url_depth = len(path_segments)

    # Letter / digit ratios
    letters = re.findall(r'[a-zA-Z]', url_full)
    digits  = re.findall(r'[0-9]', url_full)
    features['NoOfLettersInURL']  = len(letters)
    features['LetterRatioInURL']  = round(len(letters) / max(len(url_full), 1), 5)
    features['NoOfDegitsInURL']   = len(digits)
    features['DegitRatioInURL']   = round(len(digits) / max(len(url_full), 1), 5)
    features['NoOfEqualsInURL']   = features['NoOfEqual']
    features['NoOfQMarkInURL']    = features['NoOfQmark']
    features['NoOfAmpersandInURL'] = features['NoOfAnd']

    # Entropy / similarity index
    features['URLSimilarityIndex'] = round(_shannon_entropy(url_full) * 10, 2)  # scale 0-50ish

    # URL character probability (inverse of entropy, normalized)
    entropy = _shannon_entropy(url_full)
    features['URLCharProb'] = round(max(0, 1 - entropy / 6) * 0.1, 5)

    # Special char ratio
    all_special = re.findall(r'[^a-zA-Z0-9]', url_full)
    features['SpacialCharRatioInURL'] = round(len(all_special) / max(len(url_full), 1), 5)

    # Obfuscation
    pct_encoded = re.findall(r'%[0-9a-fA-F]{2}', url_full)
    features['ObfuscationRatio'] = round(len(pct_encoded) * 3 / max(len(url_full), 1), 5)
    features['HasObfuscation']   = int(
        bool(pct_encoded) or '0x' in url_lower or
        any(url_lower.endswith('.' + t) or ('.' + t + '/') in url_lower
            for t in SUSPICIOUS_TLDS)
    )

    # TLD legitimacy (heuristic: common TLDs score high)
    LEGIT_TLDS = {'com', 'org', 'net', 'edu', 'gov', 'io', 'co', 'uk',
                  'de', 'fr', 'jp', 'ca', 'au', 'in', 'us', 'info'}
    features['TLDLegitimateProb'] = round(
        0.9 if tld in LEGIT_TLDS else (0.3 if tld in SUSPICIOUS_TLDS else 0.6), 5
    )

    # Char continuation rate (length of longest alphanum run / total length)
    runs = re.findall(r'[a-zA-Z0-9]+', url_full)
    longest_run = max((len(r) for r in runs), default=0)
    features['CharContinuationRate'] = round(longest_run / max(len(url_full), 1), 5)

    # Domain-title and URL-title match (static default — not available without page)
    features['DomainTitleMatchScore'] = 0.5  # neutral; web content not fetched
    features['URLTitleMatchScore']    = 0.5

    # Keyword flags
    features['Bank']   = int(any(k in url_lower for k in BANK_KEYWORDS))
    features['Pay']    = int(any(k in url_lower for k in PAY_KEYWORDS))
    features['Crypto'] = int(any(k in url_lower for k in CRYPTO_KEYWORDS))

    # -----------------------------------------------------------------------
    # Content-based features (require page loading — set to safe defaults)
    # -----------------------------------------------------------------------
    features['LineOfCode']          = 0
    features['LargestLineLength']   = 0
    features['HasTitle']            = 0
    features['HasFavicon']          = 0
    features['Robots']              = 0
    features['IsResponsive']        = 0
    features['NoOfSelfRedirects']   = 0
    features['HasDescription']      = 0
    features['NoOfPopup']           = 0
    features['NoOfiFrame']          = 0
    features['HasExternalFormSubmit'] = 0
    features['HasSocialNet']        = 0
    features['HasSubmitButton']     = 0
    features['HasHiddenFields']     = 0
    features['HasPasswordField']    = 0
    features['HasCopyrightInfo']    = 0
    features['NoOfImage']           = 0
    features['NoOfCSS']             = 0
    features['NoOfJS']              = 0
    features['NoOfSelfRef']         = 0
    features['NoOfEmptyRef']        = 0
    features['NoOfExternalRef']     = 0

    return features


def get_interpretable_features(url: str) -> dict:
    """
    Returns a human-readable feature summary for display in the web UI.
    Includes the most meaningful features for phishing risk explanation.
    """
    raw = extract_url_features(url)
    try:
        parsed  = urlparse(url if url.startswith('http') else 'http://' + url)
        domain  = parsed.netloc.split(':')[0]
        scheme  = parsed.scheme
    except Exception:
        domain  = ''
        scheme  = ''

    kw_found = [kw for kw in SUSPICIOUS_KEYWORDS if kw in url.lower()]

    return {
        'url_length':               raw['URLLength'],
        'domain_length':            raw['DomainLength'],
        'num_subdomains':           raw['NoOfSubDomain'],
        'has_https':                bool(raw['IsHTTPS']),
        'num_special_chars':        raw['NoOfOtherSpecialCharsInURL'],
        'num_digits':               raw['NoOfDegitsInURL'],
        'num_dots':                 raw['NoOfDots'],
        'num_hyphens':              raw['NoOfHyphens'],
        'num_at_signs':             raw['NoOfAt'],
        'num_redirects':            raw['NoOfURLRedirects'],
        'path_depth':               len([p for p in (urlparse(url if url.startswith('http') else 'http://'+url).path or '').split('/') if p]),
        'entropy':                  round(raw['URLSimilarityIndex'] / 10, 4),  # convert back
        'has_suspicious_keywords':  len(kw_found) > 0,
        'suspicious_keywords':      kw_found,
        'has_obfuscation':          bool(raw['HasObfuscation']),
        'has_bank_keywords':        bool(raw['Bank']),
        'has_pay_keywords':         bool(raw['Pay']),
        'has_crypto_keywords':      bool(raw['Crypto']),
        'tld':                      domain.split('.')[-1] if '.' in domain else '',
        'scheme':                   scheme,
        'domain':                   domain,
    }


FEATURE_EXPLANATIONS = {
    'URLLength':               'Total URL character length. Longer URLs are often used to obfuscate the real destination.',
    'DomainLength':            'Length of the domain name. Very short or very long domains can be suspicious.',
    'NoOfSubDomain':           'Number of subdomains. Many subdomains (e.g., login.verify.bank.evil.com) are a red flag.',
    'IsHTTPS':                 'Whether the site uses HTTPS. Legitimate sites almost always use HTTPS.',
    'NoOfOtherSpecialCharsInURL': 'Count of special characters. Used to confuse users and evade filters.',
    'NoOfDegitsInURL':         'Number of digit characters. Auto-generated phishing domains often contain many digits.',
    'NoOfDots':                'Number of dots in the URL. Many dots suggest subdomain stacking.',
    'NoOfHyphens':             'Hyphens in domain. Phishers use them to mimic brands (e.g., paypal-secure.com).',
    'NoOfAt':                  '@ symbol in URL causes the browser to use what follows as the actual host.',
    'NoOfURLRedirects':        'Number of redirects encoded in the URL path.',
    'URLSimilarityIndex':      'Shannon entropy of the URL scaled ×10. High entropy suggests obfuscation.',
    'HasObfuscation':          'Presence of obfuscation techniques like % encoding, hex values, or suspicious TLDs.',
    'Bank':                    'URL contains banking-related keywords used by phishers to appear legitimate.',
    'Pay':                     'URL contains payment-related keywords used to lure victims.',
    'Crypto':                  'URL contains cryptocurrency-related keywords, common in crypto scams.',
    'DomainTitleMatchScore':   'How well the domain matches the page title. Low score indicates spoofing.',
    'URLTitleMatchScore':      'How well the URL matches the page title.',
    'SpacialCharRatioInURL':   'Ratio of special characters to URL length — high ratio indicates obfuscation.',
    'TLDLegitimateProb':       'Probability that the TLD belongs to a legitimate registry.',
    'CharContinuationRate':    'Length of the longest alphanumeric run relative to URL length.',
}
