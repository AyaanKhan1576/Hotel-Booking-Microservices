import React, { useState } from 'react';
   import { Form, Button, Alert, Card } from 'react-bootstrap';
   import { BookingAPI } from '../api';

   const FeedbackForm = ({ bookingId, guestEmail, checkOut, onSubmit }) => {
     const [formData, setFormData] = useState({
       rating: '',
       comment: ''
     });
     const [message, setMessage] = useState({ type: '', content: '' });

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
       }
     };

     // Check if feedback can be submitted (after check-out)
     const canSubmit = new Date(checkOut) <= new Date();

     return (
       <Card className="p-4 shadow mt-4">
         <h3>Submit Feedback</h3>
         {message.content && <Alert variant={message.type}>{message.content}</Alert>}
         {!canSubmit ? (
           <Alert variant="info">Feedback can only be submitted after your check-out date.</Alert>
         ) : (
           <Form onSubmit={handleSubmit}>
             <Form.Group className="mb-3">
               <Form.Label>Rating (1-5)</Form.Label>
               <Form.Control
                 type="number"
                 name="rating"
                 value={formData.rating}
                 onChange={handleChange}
                 min="1"
                 max="5"
                 required
               />
             </Form.Group>
             <Form.Group className="mb-3">
               <Form.Label>Comment</Form.Label>
               <Form.Control
                 as="textarea"
                 name="comment"
                 value={formData.comment}
                 onChange={handleChange}
                 rows={4}
                 required
               />
             </Form.Group>
             <Button variant="primary" type="submit">
               Submit Feedback
             </Button>
           </Form>
         )}
       </Card>
     );
   };

   export default FeedbackForm;