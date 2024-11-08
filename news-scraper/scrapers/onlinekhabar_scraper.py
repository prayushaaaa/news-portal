import requests
from bs4 import BeautifulSoup
from scrapers.translate import translate_to_english
from scrapers.convert_datetime import convert_nepali_datetime_to_english

def scrape_onlinekhabar():
    base_url = "https://www.onlinekhabar.com/content/"
    
    # Categories with corresponding URLs
    urls = {
        "local":"business/market",
        "national": "news/rastiya", 
        "entertainment": "entertainment/ent-news", 
        "technology": "technology-news", 
        "business": "business/business-feature",    
    }
    
    articles = []
    count = 0
    
    for category, link in urls.items():
        response = requests.get(base_url + link)
        soup = BeautifulSoup(response.content, "html.parser")

        span_divs = soup.find_all("div", class_="span-4")
        print(f"Found {len(span_divs)} articles in category: {category}")
        
        for div in span_divs:
            a_tag = div.find('a')  
            if a_tag:  
                article_link = a_tag['href'] 
                
                article_response = requests.get(article_link)
                article_soup = BeautifulSoup(article_response.content, "html.parser")
                
                # Extracting details from the article page
                original_title = article_soup.find('h1').text.strip() if article_soup.find('h1') else print("entry_title not found" + article_link)
                
                original_content = article_soup.find('div', class_='ok18-single-post-content-wrap').text.strip() if article_soup.find('div', class_='ok18-single-post-content-wrap') else print("original content not found"+ article_link)
                
                # Extracting the image or iframe source safely
                image_div = article_soup.find('div', class_='post-thumbnail')

                image_source = None  # Default to None if no valid source is found

                if image_div:
                    # Try to find an <img> tag first
                    img_tag = image_div.find('img')
                    if img_tag and 'src' in img_tag.attrs:
                        image_source = img_tag['src']
                    else:
                        # If no <img> is found, try to find an <iframe> tag
                        iframe_tag = image_div.find('iframe')
                        if iframe_tag and 'src' in iframe_tag.attrs:
                            image_source = iframe_tag['src']
                        else:
                            print(f"Neither <img> nor <iframe> found in: {article_link}")
                else:
                    print(f"'post-thumbnail' div not found in: {article_link}")

                                
                timestamp = article_soup.find('div', class_='ok-news-post-hour').find('span').text.strip() if article_soup.find('div', class_='ok-news-post-hour') else article_soup.find('div', class_='article-posted-date').text.strip()
                
                translated_title = translate_to_english(original_title)
                translated_content = translate_to_english(original_content)

                count = count+1
                print("scraped..", count )
                
                article = {
                    "source": "OnlineKhabar",
                    "category": category,
                    "link": article_link,
                    "nep_timestamp": timestamp,
                    "en_timestamp": convert_nepali_datetime_to_english(timestamp) if timestamp else None,
                    "original_title": original_title,
                    "translated_title": translated_title,
                    "original_content": original_content,
                    "translated_content": translated_content,
                    "image_source": image_source
                }

                # Check if any attribute is None and print a message
                for key, value in article.items():
                    if value is None:
                        print(f"Missing {key} in article: {article.get('link', 'unknown link')}")

                # Append the article to the list
                articles.append(article)
                   
    return articles