import pickle
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score

# Load the preprocessed data
with open("data/transformed_data.pkl", "rb") as file:
    data = pickle.load(file)

X_train = data["X_train"]
X_test = data["X_test"]
y_train = data["y_train"]
y_test = data["y_test"]

# Initialize and train the logistic regression model
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# Make predictions on the test set
y_pred = model.predict(X_test)

# Evaluate the model
accuracy = accuracy_score(y_test, y_pred)
report = classification_report(y_test, y_pred)

print(f"Accuracy: {accuracy}")
print("Classification Report:")
print(report)

# Save the trained model for later use
with open("model/trained_model.pkl", "wb") as file:
    pickle.dump(model, file)

# Print a message to confirm that the model has been trained and saved
print("Model has been trained and saved.")
