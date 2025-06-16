import React, { useEffect, useState } from 'react';
import { getAllCommentsBySellProduct } from '../../../services/api.comment';

const CommentSection = ({ sellProductId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div>Loading comments...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!comments.length) return <div>No comments yet.</div>;

  return (
    <div>
      {comments.map((comment) => (
        <div key={comment.id} className="mb-4 p-3 border rounded">
          <div className="font-semibold">{comment.username}</div>
          <div className="text-gray-700">{comment.content}</div>
          <div className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
};

export default CommentSection;
