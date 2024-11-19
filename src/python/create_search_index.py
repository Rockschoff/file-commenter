from pymongo import MongoClient

# Replace with your MongoDB connection string
uri = "mongodb+srv://rdubey:3idonLy7uqjeA3ML@cluster0.ikix1hs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# Connect to the MongoDB cluster
client = MongoClient(uri)

# Access the specific database and collection
database = client["niagara"]
collection = database["documents"]

# Define the index keys and weights
index_keys = [
    ("comment", "text"),
    ("document_name", "text"),
    ("original_text", "text"),
    ("contextual_text", "text")
]

weights = {
    "comment": 20,
    "document_name": 10,
    "original_text": 7,
    "contextual_text": 7
}

# Create the text index with specified weights and capture the response
response = collection.create_index(index_keys, weights=weights, name="NewIndex")

print(f"Text index with weights created successfully. Response: {response}")
