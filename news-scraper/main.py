# import pandas as pd
# from scrapers.onlinekhabar_scraper import scrape_onlinekhabar
# from scrapers.risingnepal_scraper import scrape_risingnepal
# from config.db_config import get_db
# from scrapers.translate import translate_to_english

# news_collection = get_db()

# def save_to_csv(data, filename):
#     df = pd.DataFrame(data)
#     df.to_csv(f"data/{filename}.csv", index=False)
    
# def save_to_mongodb(data):
#     if data:
#         news_collection.insert_many(data)
    
# def run_scraper():
#     ok_data = scrape_onlinekhabar()
#     save_to_csv(ok_data, "onlinekhabar_news")
#     # save_to_mongodb(ok_data)
    
#     # rn_data = scrape_risingnepal()
#     # save_to_csv(rn_data, "risingnepal_news")
#     # save_to_mongodb(rn_data)
    
#     print("Main ran")

# if __name__ == "__main__":
#     run_scraper()




from transformers import T5Tokenizer, T5Model

article_ne = "वैदेशिक रोजगारका डीजी फेरेको फेर्‍यै"

tokenizer = T5Tokenizer.from_pretrained("t5-base")
model = T5Model.from_pretrained("t5-base")

input_ids = tokenizer(
    article_ne, return_tensors="pt"
).input_ids  # Batch size 1
decoder_input_ids = tokenizer("Studies show that", return_tensors="pt").input_ids  # Batch size 1

# forward pass
outputs = model(input_ids=input_ids, decoder_input_ids=decoder_input_ids)
last_hidden_states = outputs.last_hidden_state
