import pandas as pd
from scrapers.onlinekhabar_scraper import scrape_onlinekhabar
from scrapers.risingnepal_scraper import scrape_risingnepal
from config.db_config import get_db
from scrapers.translate import translate_to_english

news_collection = get_db()

def save_to_csv(data, filename):
    df = pd.DataFrame(data)
    df.to_csv(f"data/{filename}.csv", index=False)
    
def save_to_mongodb(data):
    if data:
        news_collection.insert_many(data)
    
def run_scraper():
    ok_data = scrape_onlinekhabar()
    save_to_csv(ok_data, "onlinekhabar_news")
    # save_to_mongodb(ok_data)
    
    # rn_data = scrape_risingnepal()
    # save_to_csv(rn_data, "risingnepal_news")
    # save_to_mongodb(rn_data)
    
    print("Main ran")

if __name__ == "__main__":
    run_scraper()