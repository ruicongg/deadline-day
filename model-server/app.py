from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import pickle
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
with open("pl_model.pkl", "rb") as f:
    model = pickle.load(f)

@app.post("/predict")
async def predict(request: Request):
    input_data = await request.json()

    input_df = pd.DataFrame([input_data])
    input_df = input_df.loc[:, input_df.columns != ""]

    try:
        expected_features = model.feature_names_in_
    except AttributeError:
        print("Attribute Error")

    input_features = input_df.columns

    # Print mismatched features to console
    unseen_features = set(input_features) - set(expected_features)
    missing_features = set(expected_features) - set(input_features)

    if unseen_features:
        print("Unseen features:")
        for f in unseen_features:
            print(f"  - {f}")

    if missing_features:
        print("Missing features:")
        for f in missing_features:
            print(f"  - {f}")

    prediction = model.predict(input_df)[0]
    return {"prediction": prediction}