import React, { useState } from 'react';
import { Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { BookingAPI } from '../api';

const FeedbackForm = ({ bookingId, guestEmail, checkOut, onSubmit }) => {
  const [formData, setFormData] = useState({
    rating: '',
    comment: ''
  });
  const [message, setMessage] = useState({ type: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.rating || !formData.comment) {
      setMessage({ type: 'danger', content: 'Please provide a rating and comment' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await BookingAPI.post('/feedback', {
        bookingId,
        rating: Number(formData.rating),
        comment: formData.comment
      }, {
        params: { email: guestEmail }
      });
      setMessage({ type: 'success', content: res.data.msg });
      setFormData({ rating: '', comment: '' });
      if (onSubmit) onSubmit();
    } catch (err) {
      setMessage({ type: 'danger', content: err.response?.data?.msg || 'Error submitting feedback' });
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = new Date(checkOut) <= new Date();

  return (
    <Card className="feedback-form shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">Submit Feedback</h5>
      </Card.Header>
      <Card.Body>
        {message.content && <Alert variant={message.type}>{message.content}</Alert>}
        {!canSubmit ? (
          <Alert variant="info" className="mb-0">
            Feedback can only be submitted after your check-out date ({new Date(checkOut).toLocaleDateString()}).
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Rating (1-5 stars)</Form.Label>
              <div className="d-flex align-items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant={formData.rating >= star ? 'warning' : 'outline-secondary'}
                    className="me-2 p-0"
                    style={{ width: '2.5rem', height: '2.5rem' }}
                    onClick={() => setFormData({ ...formData, rating: star })}
                    type="button"
                  >
                    {star}
                  </Button>
                ))}
                <input
                  type="hidden"
                  name="rating"
                  value={formData.rating}
                  required
                />
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Your Feedback</Form.Label>
              <Form.Control
                as="textarea"
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                rows={4}
                placeholder="Share your experience..."
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? (
                  <Spinner as="span" size="sm" animation="border" />
                ) : (
                  'Submit Feedback'
                )}
              </Button>
            </div>
          </Form>
        )}
      </Card.Body>
    </Card>
  );
};

export default FeedbackForm;