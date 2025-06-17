import React, { useEffect, useState } from 'react';
import { getAllCommentsBySellProduct, createComment } from '../../../services/api.comment';

const CommentSection = ({ sellProductId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      const result = await getAllCommentsBySellProduct(sellProductId);
      if (result && result.status) {
        setComments(result.data);
      } else {
        setError('Failed to load comments');
      }
      setLoading(false);
    };
    if (sellProductId) {
      fetchComments();
    }
  }, [sellProductId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to comment.');
        setSubmitting(false);
        return;
      }
      // You may want to get userId from your auth context or decode the token
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User information not found. Please log in again.');
        setSubmitting(false);
        return;
      }
      const result = await createComment({ sellProductId, userId, content: newComment, rating: -1 });
      if (result && result.status) {
        setComments((prev) => [result.data, ...prev]);
        setNewComment('');
        setError(null);
      } else {
        setError('Failed to post comment.');
      }
    } catch (err) {
      setError('Failed to post comment.');
    }
    setSubmitting(false);
  };

  if (loading) return <div>Loading comments...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <form onSubmit={handleCommentSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded px-2 py-1"
          placeholder="Add a comment..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          disabled={submitting}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded" disabled={submitting}>
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </form>
      {comments.length === 0 ? (
        <div>No comments yet.</div>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="mb-4 p-3 border rounded">
            <div className="font-semibold">{comment.username}</div>
            <div className="text-gray-700">{comment.content}</div>
            <div className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default CommentSection;
