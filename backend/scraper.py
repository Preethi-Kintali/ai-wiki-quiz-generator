import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

def scrape_wikipedia(url: str):
    response = requests.get(url, headers=HEADERS, timeout=15)

    if response.status_code != 200:
        raise Exception("Unable to fetch Wikipedia page")

    soup = BeautifulSoup(response.text, "html.parser")

    # ---------- TITLE ----------
    title_tag = soup.find("h1", id="firstHeading")
    title = title_tag.get_text(strip=True) if title_tag else "Unknown Title"

    # ---------- REAL CONTENT ROOT ----------
    content_root = soup.find("div", id="mw-content-text")
    if not content_root:
        raise Exception("Wikipedia content root not found")

    # ---------- SUMMARY ----------
    summary = ""
    for p in content_root.find_all("p"):
        text = p.get_text(strip=True)
        if text:
            summary = text
            break

    # ---------- SECTIONS ----------
    sections = []
    for h2 in content_root.find_all("h2"):
        span = h2.find("span", class_="mw-headline")
        if span:
            section = span.get_text(strip=True)
            if section.lower() not in ["references", "external links", "see also"]:
                sections.append(section)

    # ---------- FULL ARTICLE TEXT ----------
    paragraphs = content_root.find_all("p")
    article_text = [p.get_text(" ", strip=True) for p in paragraphs if p.get_text(strip=True)]
    full_text = "\n".join(article_text)

    # DEBUG (MUST SHOW > 0)
    print("SCRAPER TEXT LENGTH:", len(full_text))

    return {
        "url": url,
        "title": title,
        "summary": summary,
        "sections": sections,
        "raw_text": full_text
    }
