from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

# Load saved model and features
saved = joblib.load('model.pkl')
model = saved['model']
features = saved['features']

# Quality mapping same as training
quality_map = {'Ex': 5, 'Gd': 4, 'TA':3, 'Fa':2, 'Po':1}

def preprocess_input(data):
    # Map quality inputs
    for key in ['exterQual', 'bsmtQual', 'kitchenQual']:
        val = data.get(key)
        if val not in quality_map:
            raise ValueError(f"Invalid quality value for {key}: {val}")
        data[key] = quality_map[val]

    # Map neighborhood - categorical - convert to codes
    # For simplicity, map neighborhood to int by predefined map or fallback -1
    # Here is a minimal sample mapping from training data (you should expand or use full mapping)
    neighborhood_map = {
        'NAmes': 0, 'CollgCr': 1, 'OldTown': 2, 'Edwards': 3, 'Somerville': 4,
        'Gilbert': 5, 'Sawyer': 6, 'NWAmes': 7, 'SawyerW': 8, 'BrkSide': 9,
        'Crawfor': 10, 'Mitchel': 11, 'Timber': 12, 'StoneBr': 13, 'ClearCr': 14,
        'NoRidge': 15, 'NPkVill': 16, 'Blmngtn': 17, 'BrDale': 18, 'SWISU': 19,
        'IDOTRR': 20, 'MeadowV': 21, 'Blueste': 22, 'Veenker': 23, 'MtVer': 24,
        'Central': 25, 'GraVey': 26, 'Logan': 27, 'Walnut': 28, 'Landmrk': 29
    }
    neighborhood = data.get('neighborhood')
    data['neighborhood'] = neighborhood_map.get(neighborhood, -1)  # -1 if unknown

    # Prepare feature list in order
    ordered = [
        data['overallQual'],
        data['grLivArea'],
        data['garageCars'],
        data['totalBsmtSF'],
        data['fullBath'],
        data['yearBuilt'],
        data['yearRemodAdd'],
        data['lotArea'],
        data['neighborhood'],
        data['exterQual'],
        data['bsmtQual'],
        data['kitchenQual'],
        data['fireplaces'],
        data['garageArea']
    ]
    return np.array(ordered).reshape(1, -1)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        # Validate keys presence
        required_keys = ['overallQual', 'grLivArea', 'garageCars', 'totalBsmtSF',
                         'fullBath', 'yearBuilt', 'yearRemodAdd', 'lotArea',
                         'neighborhood', 'exterQual', 'bsmtQual', 'kitchenQual',
                         'fireplaces', 'garageArea']

        for key in required_keys:
            if key not in data:
                return jsonify({'error': f'Missing key: {key}'}), 400

        # Preprocess inputs
        input_data = preprocess_input(data)

        # Predict
        prediction = model.predict(input_data)[0]

        # Return with explanation (feature importances)
        feat_imp = model.feature_importances_
        explanation = {features[i]: round(feat_imp[i], 3) for i in range(len(features))}

        return jsonify({
            'predictedPrice': round(prediction, 2),
            'featureImportance': explanation
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
