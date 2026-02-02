"""
Corpay Newsroom Scraper
Fetches the latest items from the public Corpay corporate newsroom.

Source: `https://www.corpay.com/corporate-newsroom?limit=10&years=&categories=&search=`
"""
from typing import List, Dict
import json
import re
import time

import httpx
from bs4 import BeautifulSoup

CORPAY_NEWSROOM_URL = "https://www.corpay.com/corporate-newsroom?limit=10&years=&categories=&search="
CORPAY_RESOURCES_NEWSROOM_URL = "https://www.corpay.com/resources/newsroom?page=2"
DEBUG_LOG_PATH = "/Users/madhujitharumugam/Desktop/latest_corpgit/corpay/.cursor/debug.log"


def _debug_log(run_id: str, hypothesis_id: str, location: str, message: str, data: Dict) -> None:
  # region agent log
  try:
    with open(DEBUG_LOG_PATH, "a") as f:
      f.write(json.dumps({
        "sessionId": "debug-session",
        "runId": run_id,
        "hypothesisId": hypothesis_id,
        "location": location,
        "message": message,
        "data": data,
        "timestamp": int(time.time() * 1000),
      }) + "\n")
  except Exception:
    # Logging must never break main logic
    pass
  # endregion agent log


async def fetch_corpay_newsroom(limit: int = 5) -> List[Dict]:
  """
  Fetch and parse the latest newsroom items from corpay.com.

  The HTML structure of the site may evolve over time, so this parser is written
  to be defensive and tolerate minor changes. If parsing fails we simply
  return an empty list so the frontend can fall back gracefully.
  """
  items: List[Dict] = []

  try:
    _debug_log("newsroom-pre", "N1", "newsroom_scraper.py:fetch_corpay_newsroom:start",
               "Starting fetch_corpay_newsroom", {"limit": limit, "url": CORPAY_NEWSROOM_URL})

    # 5s connect timeout (fail fast if unreachable), 10s read timeout
    async with httpx.AsyncClient(timeout=httpx.Timeout(5.0, read=10.0)) as client:
      response = await client.get(CORPAY_NEWSROOM_URL)
      _debug_log("newsroom-pre", "N2", "newsroom_scraper.py:fetch_corpay_newsroom:response",
                 "Fetched newsroom HTML", {"status": response.status_code})
      response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # On the corporate newsroom page, each entry is headed by an <h2>.
    # This is similar to the /resources/newsroom structure and is more
    # robust than relying on specific <article> wrappers, which may not
    # be present or may change.
    main = soup.find("main") or soup
    h2_nodes = list(main.find_all("h2"))
    _debug_log("newsroom-pre", "N3", "newsroom_scraper.py:fetch_corpay_newsroom:parsed",
               "Parsed newsroom HTML", {"h2Count": len(h2_nodes)})

    for h2 in h2_nodes:
      title = (h2.get_text(strip=True) or "").strip()
      if not title:
        continue

      # Find the first sibling link that points to the full article.
      link = h2.find_next("a", href=True)
      href = link["href"] if link else ""
      if not href:
        continue

      container = h2.find_parent("article") or h2.parent
      date_text = ""
      category = ""
      excerpt = ""

      if container:
        # Date: prefer <time> text, then datetime attribute, then any element with date-like class/text.
        time_el = container.find("time")
        if time_el:
          date_text = time_el.get_text(strip=True) or ""
          if not date_text and time_el.get("datetime"):
            # e.g. datetime="2025-01-15" -> "Jan 15, 2025"
            try:
              from datetime import datetime
              dt = datetime.fromisoformat(time_el["datetime"].replace("Z", "+00:00")[:10])
              date_text = dt.strftime("%b %d, %Y")
            except Exception:
              date_text = time_el["datetime"][:10]
        if not date_text:
          for el in container.find_all(class_=re.compile(r"date|time|meta", re.I)):
            t = (el.get_text(strip=True) or "").strip()
            if t and re.search(r"\d{1,2}[\s/\-]\d{1,2}[\s/\-]\d{2,4}|\d{4}[\s/\-]\d{1,2}[\s/\-]\d{1,2}|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}", t):
              date_text = t
              break
        if not date_text:
          full_text = container.get_text(separator=" ", strip=True) or ""
          m = re.search(r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}|\d{1,2}[\s/\-]\d{1,2}[\s/\-]\d{2,4}", full_text)
          if m:
            date_text = m.group(0).strip()
        # If still no date, search the block from this h2 up to the next h2 (siblings).
        if not date_text:
          sibling = h2.find_next_sibling()
          next_h2 = h2.find_next("h2")
          while sibling and sibling != next_h2:
            time_el = sibling.find("time") if hasattr(sibling, "find") else None
            if time_el:
              date_text = time_el.get_text(strip=True) or ""
              if not date_text and time_el.get("datetime"):
                try:
                  from datetime import datetime
                  dt = datetime.fromisoformat(time_el["datetime"].replace("Z", "+00:00")[:10])
                  date_text = dt.strftime("%b %d, %Y")
                except Exception:
                  date_text = time_el["datetime"][:10]
              if date_text:
                break
            if hasattr(sibling, "get_text"):
              t = sibling.get_text(separator=" ", strip=True) or ""
              m = re.search(r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}|\d{1,2}[\s/\-]\d{1,2}[\s/\-]\d{2,4}", t)
              if m:
                date_text = m.group(0).strip()
                break
            sibling = sibling.find_next_sibling() if hasattr(sibling, "find_next_sibling") else None

        # Category label (e.g. "Press Releases") often appears in a nearby span/a.
        cat_el = container.find(
          ["span", "a"],
          string=lambda s: isinstance(s, str) and "Press Releases" in s,
        )
        if cat_el:
          category = cat_el.get_text(strip=True)

        # First paragraph of the article listing as short excerpt.
        para = container.find("p")
        if para:
          excerpt = para.get_text(strip=True)

      items.append(
        {
          "title": title,
          "url": href if href.startswith("http") else f"https://www.corpay.com{href}",
          "date": date_text,
          "category": category or "Press Releases",
          "excerpt": excerpt,
        }
      )

      if len(items) >= limit:
        break

  except Exception as e:
    _debug_log("newsroom-pre", "N4", "newsroom_scraper.py:fetch_corpay_newsroom:exception",
               "Exception in fetch_corpay_newsroom", {"error": str(e)})
    # Fail quietly – the dashboard can still render without newsroom content.
    return []

  _debug_log("newsroom-pre", "N5", "newsroom_scraper.py:fetch_corpay_newsroom:end",
             "Returning newsroom items", {"returnedCount": len(items)})

  # Keep original page order (already newest-first on corpay.com)
  return items


async def fetch_corpay_resources_newsroom(limit: int = 4) -> List[Dict]:
  """
  Fetch and parse the latest items from Corpay Resources » Newsroom.

  Source: https://www.corpay.com/resources/newsroom?page=2
  We only return lightweight text content (no images) for the Resources box.
  """
  items: List[Dict] = []

  try:
    _debug_log("resources-pre", "R1", "newsroom_scraper.py:fetch_corpay_resources_newsroom:start",
               "Starting fetch_corpay_resources_newsroom", {"limit": limit, "url": CORPAY_RESOURCES_NEWSROOM_URL})

    # 5s connect timeout (fail fast if unreachable), 10s read timeout
    async with httpx.AsyncClient(timeout=httpx.Timeout(5.0, read=10.0)) as client:
      response = await client.get(CORPAY_RESOURCES_NEWSROOM_URL)
      _debug_log("resources-pre", "R2", "newsroom_scraper.py:fetch_corpay_resources_newsroom:response",
                 "Fetched resources HTML", {"status": response.status_code})
      response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # Articles are listed under the main content area; titles are in <h2> tags.
    # We pair each title with its nearest "Read more" link and optional
    # category / short excerpt when available.
    main = soup.find("main") or soup
    h2_nodes = list(main.find_all("h2"))
    _debug_log("resources-pre", "R3", "newsroom_scraper.py:fetch_corpay_resources_newsroom:parsed",
               "Parsed resources HTML", {"h2Count": len(h2_nodes)})
    for h2 in h2_nodes:
      title = (h2.get_text(strip=True) or "").strip()
      if not title:
        continue

      # Find the first sibling link that points to a newsroom article.
      link = h2.find_next("a", href=True)
      href = link["href"] if link else ""
      if not href:
        continue

      container = h2.find_parent("article") or h2.parent
      category = ""
      excerpt = ""
      date_text = ""

      if container:
        # Date: <time> text, datetime attribute, or date-like class/text.
        time_el = container.find("time")
        if time_el:
          date_text = time_el.get_text(strip=True) or ""
          if not date_text and time_el.get("datetime"):
            try:
              from datetime import datetime
              dt = datetime.fromisoformat(time_el["datetime"].replace("Z", "+00:00")[:10])
              date_text = dt.strftime("%b %d, %Y")
            except Exception:
              date_text = time_el["datetime"][:10]
        if not date_text:
          for el in container.find_all(class_=re.compile(r"date|time|meta", re.I)):
            t = (el.get_text(strip=True) or "").strip()
            if t and re.search(r"\d{1,2}[\s/\-]\d{1,2}[\s/\-]\d{2,4}|\d{4}[\s/\-]\d{1,2}[\s/\-]\d{1,2}|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}", t):
              date_text = t
              break
        if not date_text:
          full_text = container.get_text(separator=" ", strip=True) or ""
          m = re.search(r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}|\d{1,2}[\s/\-]\d{1,2}[\s/\-]\d{2,4}", full_text)
          if m:
            date_text = m.group(0).strip()
        if not date_text:
          sibling = h2.find_next_sibling()
          next_h2 = h2.find_next("h2")
          while sibling and sibling != next_h2:
            time_el = sibling.find("time") if hasattr(sibling, "find") else None
            if time_el:
              date_text = time_el.get_text(strip=True) or ""
              if not date_text and time_el.get("datetime"):
                try:
                  from datetime import datetime
                  dt = datetime.fromisoformat(time_el["datetime"].replace("Z", "+00:00")[:10])
                  date_text = dt.strftime("%b %d, %Y")
                except Exception:
                  date_text = time_el["datetime"][:10]
              if date_text:
                break
            if hasattr(sibling, "get_text"):
              t = sibling.get_text(separator=" ", strip=True) or ""
              m = re.search(r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}|\d{1,2}[\s/\-]\d{1,2}[\s/\-]\d{2,4}", t)
              if m:
                date_text = m.group(0).strip()
                break
            sibling = sibling.find_next_sibling() if hasattr(sibling, "find_next_sibling") else None

        # Category text like "Payments Automation" is often in a nearby element.
        cat_el = container.find(
          ["span", "a"],
          string=lambda s: isinstance(s, str) and len(s.strip()) > 0
        )
        if cat_el:
          category = cat_el.get_text(strip=True)

        # Excerpt paragraph, if present.
        para = container.find("p")
        if para:
          excerpt = para.get_text(strip=True)

      items.append(
        {
          "title": title,
          "url": href if href.startswith("http") else f"https://www.corpay.com{href}",
          "date": date_text,
          "category": category,
          "excerpt": excerpt,
        }
      )

      if len(items) >= limit:
        break

  except Exception as e:
    _debug_log("resources-pre", "R4", "newsroom_scraper.py:fetch_corpay_resources_newsroom:exception",
               "Exception in fetch_corpay_resources_newsroom", {"error": str(e)})
    return []

  _debug_log("resources-pre", "R5", "newsroom_scraper.py:fetch_corpay_resources_newsroom:end",
             "Returning resources items", {"returnedCount": len(items)})

  # Keep original page order (already newest-first on corpay.com)
  return items

