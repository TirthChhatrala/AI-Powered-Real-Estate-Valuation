import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
import joblib

# Load dataset
df = pd.read_csv('AmesHousing.csv')

# Select important features (expanded)
features = [
    'Overall Qual', 'Gr Liv Area', 'Garage Cars', 'Total Bsmt SF',
    'Full Bath', 'Year Built', 'Year Remod/Add', 'Lot Area',
    'Neighborhood', 'Exter Qual', 'Bsmt Qual', 'Kitchen Qual',
    'Fireplaces', 'Garage Area'
]

target = 'SalePrice'

# Keep rows without missing values in selected features
df = df[features + [target]].dropna()

# Encode categorical variables (Neighborhood, Exter Qual, Bsmt Qual, Kitchen Qual)
# Use simple ordinal encoding for quality ratings
quality_map = {'Ex': 5, 'Gd': 4, 'TA':3, 'Fa':2, 'Po':1}

df['Neighborhood'] = df['Neighborhood'].astype('category').cat.codes
df['Exter Qual'] = df['Exter Qual'].map(quality_map)
df['Bsmt Qual'] = df['Bsmt Qual'].map(quality_map)
df['Kitchen Qual'] = df['Kitchen Qual'].map(quality_map)

# Features and target split
X = df[features]
y = df[target]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Hyperparameter tuning with GridSearchCV (optional - faster without this)
params = {
    'n_estimators': [100, 200],
    'max_depth': [10, 20, None],
    'min_samples_split': [2, 5],
}

rf = RandomForestRegressor(random_state=42)
grid_search = GridSearchCV(rf, params, cv=3, n_jobs=-1, verbose=1)
grid_search.fit(X_train, y_train)
best_model = grid_search.best_estimator_

# Predictions & metrics
y_pred = best_model.predict(X_test)
r2 = r2_score(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mae = mean_absolute_error(y_test, y_pred)

print("Model Performance on Test Set:")
print(f"R² Score: {r2:.4f}")
print(f"RMSE: {rmse:.2f}")
print(f"MAE: {mae:.2f}")

# Feature importance for explainability
importances = best_model.feature_importances_
feat_imp = sorted(zip(features, importances), key=lambda x: x[1], reverse=True)
print("\nFeature Importances:")
for feat, imp in feat_imp:
    print(f"{feat}: {imp:.3f}")

# Save model and feature order
joblib.dump({'model': best_model, 'features': features}, 'model.pkl')
