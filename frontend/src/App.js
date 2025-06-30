import React, { useState } from 'react';
import './styles.css';

const QUALITY_OPTIONS = ['Ex', 'Gd', 'TA', 'Fa', 'Po'];

const NEIGHBORHOODS = [
  'NAmes', 'CollgCr', 'OldTown', 'Edwards', 'Somerville',
  'Gilbert', 'Sawyer', 'NWAmes', 'SawyerW', 'BrkSide',
  'Crawfor', 'Mitchel', 'Timber', 'StoneBr', 'ClearCr',
  'NoRidge', 'NPkVill', 'Blmngtn', 'BrDale', 'SWISU',
  'IDOTRR', 'MeadowV', 'Blueste', 'Veenker', 'MtVer',
  'Central', 'GraVey', 'Logan', 'Walnut', 'Landmrk'
];

function App() {
  const [formData, setFormData] = useState({
    overallQual: '',
    grLivArea: '',
    garageCars: '',
    totalBsmtSF: '',
    fullBath: '',
    yearBuilt: '',
    yearRemodAdd: '',
    lotArea: '',
    neighborhood: NEIGHBORHOODS[0],
    exterQual: QUALITY_OPTIONS[2],
    bsmtQual: QUALITY_OPTIONS[2],
    kitchenQual: QUALITY_OPTIONS[2],
    fireplaces: '',
    garageArea: ''
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    // Basic validation
    for (const key in formData) {
      if (formData[key] === '') {
        setLoading(false);
        setError('Please fill in all fields');
        return;
      }
    }

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overallQual: parseInt(formData.overallQual),
          grLivArea: parseInt(formData.grLivArea),
          garageCars: parseInt(formData.garageCars),
          totalBsmtSF: parseInt(formData.totalBsmtSF),
          fullBath: parseInt(formData.fullBath),
          yearBuilt: parseInt(formData.yearBuilt),
          yearRemodAdd: parseInt(formData.yearRemodAdd),
          lotArea: parseInt(formData.lotArea),
          neighborhood: formData.neighborhood,
          exterQual: formData.exterQual,
          bsmtQual: formData.bsmtQual,
          kitchenQual: formData.kitchenQual,
          fireplaces: parseInt(formData.fireplaces),
          garageArea: parseInt(formData.garageArea)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Prediction failed');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🏠 House Price Predictor</h1>
      <form onSubmit={handleSubmit}>

        <input
          type="number" min="1" max="10" name="overallQual" placeholder="Overall Quality (1-10)"
          value={formData.overallQual} onChange={handleChange} required
        />

        <input
          type="number" min="100" name="grLivArea" placeholder="Ground Living Area (sq ft)"
          value={formData.grLivArea} onChange={handleChange} required
        />

        <input
          type="number" min="0" max="5" name="garageCars" placeholder="Garage Cars"
          value={formData.garageCars} onChange={handleChange} required
        />

        <input
          type="number" min="0" name="totalBsmtSF" placeholder="Total Basement Area (sq ft)"
          value={formData.totalBsmtSF} onChange={handleChange} required
        />

        <input
          type="number" min="0" max="10" name="fullBath" placeholder="Full Bathrooms"
          value={formData.fullBath} onChange={handleChange} required
        />

        <input
          type="number" min="1800" max="2025" name="yearBuilt" placeholder="Year Built"
          value={formData.yearBuilt} onChange={handleChange} required
        />

        <input
          type="number" min="1800" max="2025" name="yearRemodAdd" placeholder="Year Remodeled"
          value={formData.yearRemodAdd} onChange={handleChange} required
        />

        <input
          type="number" min="100" name="lotArea" placeholder="Lot Area (sq ft)"
          value={formData.lotArea} onChange={handleChange} required
        />

        <select name="neighborhood" value={formData.neighborhood} onChange={handleChange} required>
          {NEIGHBORHOODS.map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <select name="exterQual" value={formData.exterQual} onChange={handleChange} required>
          {QUALITY_OPTIONS.map(q => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>

        <select name="bsmtQual" value={formData.bsmtQual} onChange={handleChange} required>
          {QUALITY_OPTIONS.map(q => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>

        <select name="kitchenQual" value={formData.kitchenQual} onChange={handleChange} required>
          {QUALITY_OPTIONS.map(q => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>

        <input
          type="number" min="0" max="5" name="fireplaces" placeholder="Fireplaces"
          value={formData.fireplaces} onChange={handleChange} required
        />

        <input
          type="number" min="0" name="garageArea" placeholder="Garage Area (sq ft)"
          value={formData.garageArea} onChange={handleChange} required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Predicting...' : 'Predict Price'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result">
          <h2>Predicted Price: <span className="price">${result.predictedPrice}</span></h2>
          <h3>Feature Importance:</h3>
          <ul>
            {Object.entries(result.featureImportance).map(([feat, imp]) => (
              <li key={feat}><b>{feat}</b>: {imp}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
