import React, { useEffect, useState } from 'react';
import { getAllCommentsBySellProduct, createComment } from '../../../services/api.comment';

const CommentSection = ({ sellProductId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem('token'));

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
    // Expose fetchComments for use in handleCommentSubmit
    CommentSection.fetchComments = fetchComments;
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
      // Call API without userId
      const result = await createComment({ sellProductId, content: newComment });
      if (result && result.status) {
        setNewComment('');
        setError(null);
        // Fetch comments again after successful comment creation
        fetchComments();
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
          disabled={submitting || !isLoggedIn}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded" disabled={submitting || !isLoggedIn}>
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </form>
      {!isLoggedIn && (
        <div className="text-sm text-gray-500 mb-2">You must be logged in to comment.</div>
      )}
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
