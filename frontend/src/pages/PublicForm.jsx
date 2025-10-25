import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './PublicForm.css';

function PublicForm() {
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [responses, setResponses] = useState({ name: '', number: '', pan: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/${id}`);
        if (response.ok) {
          const data = await response.json();
          setFormData(data);
        } else {
          setError('Form not found');
        }
      } catch (err) {
        setError('Error loading form');
        console.error(err);
      }
    };

    fetchForm();
  }, [id]);

  const handleInputChange = (field, value) => {
    setResponses({ ...responses, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/forms/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(responses)
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.redirect_url;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Submission failed');
      }
    } catch (err) {
      setError('Error submitting form');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (error) return (
    <div className="public-form-container">
      <div className="form-card">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    </div>
  );

  if (!formData) return (
    <div className="public-form-container">
      <div className="form-card">
        <div className="loading-message">
          <h2>Loading form...</h2>
        </div>
      </div>
    </div>
  );

  return (
    <div className="public-form-container">
      <div className="form-card">
        <div className="form-header">
          <h2>{formData.title}</h2>
        </div>

        <div className="form-body">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                type="text"
                className="form-input"
                value={responses.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Number *</label>
              <input
                type="text"
                className="form-input"
                value={responses.number}
                onChange={(e) => handleInputChange('number', e.target.value)}
                placeholder="Enter your number"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">PAN *</label>
              <input
                type="text"
                className="form-input"
                value={responses.pan}
                onChange={(e) => handleInputChange('pan', e.target.value)}
                placeholder="Enter your PAN number"
                required
              />
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Form'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PublicForm;
