import { useState } from 'react';
import { Star } from 'lucide-react';
import api from '../services/api';

export default function RatingPrompt({ ticketId, onRated }) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    setError(null);
    try {
      await api.post('/tickets/rate', {
        ticket_id: ticketId,
        rating,
        feedback: feedback.trim() || null,
      });
      setSubmitted(true);
      if (onRated) onRated(rating);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
        <p className="text-green-700 dark:text-green-300 font-medium">
          Thank you for your feedback! ⭐
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm">
      <p className="text-gray-700 dark:text-gray-300 font-medium mb-3 text-center">
        How was your support experience?
      </p>

      {/* Star rating */}
      <div className="flex justify-center gap-1 mb-4" role="radiogroup" aria-label="Satisfaction rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => setRating(star)}
            className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
            role="radio"
            aria-checked={rating === star}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          >
            <Star
              size={28}
              className={
                star <= (hoveredStar || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              }
            />
          </button>
        ))}
      </div>

      {rating > 0 && (
        <>
          {/* Optional feedback */}
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us more (optional)..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       placeholder-gray-400 dark:placeholder-gray-500
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       resize-none text-sm"
            rows={3}
            maxLength={500}
            aria-label="Feedback (optional)"
          />

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-3 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                       text-white font-medium rounded-lg transition-colors
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading ? 'Submitting...' : 'Submit Rating'}
          </button>
        </>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
      )}
    </div>
  );
}
