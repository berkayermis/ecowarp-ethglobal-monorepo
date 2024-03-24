import os
from dotenv import load_dotenv
import requests
import json
import pandas as pd

# Load environment variables from .env file
load_dotenv()

pinata_jwt = os.getenv("PINATA_JWT")

categories = {
    "electronics": ["apple", "vision", "gadgets"],
    "books": ["books"],
    "arts": ["artworks", "art", "flora", "nature"],
}


url = "https://api.pinata.cloud/v3/farcaster/casts?channel="

headers = {"Authorization": f"Bearer {pinata_jwt}"}


def fetch_data():
    category_keys = categories.keys()
    all_casts = []
    for category in category_keys:
        channels = categories[category]
        for channel in channels:
            channel_url = f"{url}https://warpcast.com/~/channel/{channel}"
            response = requests.get(channel_url, headers=headers)
            res_json = json.loads(response.text)
            casts = res_json["data"]["casts"]
            for cast in casts:
                all_casts.append(
                    {
                        "category": category,
                        "content": cast["content"],
                    }
                )
    df = pd.DataFrame(all_casts)
    df.to_csv("data/casts.csv", index=False)


if __name__ == "__main__":
    fetch_data()
