from pymongo import MongoClient

def get_db():
    client = MongoClient("mongodb+srv://prayusha000:admin123@newsportal.xvhdm.mongodb.net/?retryWrites=true&w=majority&appName=NewsPortal")
    db = client["NewsPortal"]
    return db["news"]