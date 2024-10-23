import requests
from bs4 import BeautifulSoup
from scrapers.translate import translate_to_english

def scrape_risingnepal():
    """Scrape news from Rising Nepal and return a list of articles."""
    url = "https://risingnepaldaily.com/"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, "html.parser")

    articles = []
    for article in soup.find_all("div", class_="card-body"):
        title = article.find("h5", class_="card-title").text.strip()
        link = article.find("a")["href"]
        summary = article.find("p", class_="card-text").text.strip()

        original_content = summary or title
        translated_content = translate_to_english(original_content)

        articles.append({
            "source": "Rising Nepal",
            "title": title,
            "link": link,
            "original": original_content,
            "translated": translated_content
        })

    return articles
