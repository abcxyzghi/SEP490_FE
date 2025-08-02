import React, { useEffect, useState, useRef, useCallback } from 'react';
import "./CommentSection.css";
import { getAllCommentsBySellProduct, createComment, getAllBadwords } from '../../../services/api.comment';
import { buildImageUrl } from '../../../services/api.imageproxy';
import ProfileHolder from "../../../assets/others/mmbAvatar.png";

// Utility to remove Vietnamese accents
function removeVietnameseTones(str) {
  return str.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

// BAD_WORDS will be fetched from API

function censorBadWords(text, badWords) {
  if (!badWords || !Array.isArray(badWords)) return text;
  let censored = text;
  badWords.forEach(word => {
    if (!word) return;
    const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    censored = censored.replace(pattern, '****');
    const patternNoAccent = new RegExp(`\\b${removeVietnameseTones(word).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    censored = censored.replace(patternNoAccent, '****');
  });
  return censored;
}

function validateCommentInput(content) {
  if (!content || !content.trim()) {
    return 'Comment content cannot be empty.';
  }
  if (content.length > 1000) {
    return 'Comment content too long (max 1000 characters).';
  }
  // Only check for bad words, not meaningless content
  return null;
}


const CommentSection = ({ sellProductId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState([]);
  const [useBackupImg, setUseBackupImg] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null); // Separate fetch error
  const [inputError, setInputError] = useState(null); // Separate input error
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sortOrder, setSortOrder] = useState('latest');
  const isLoggedIn = Boolean(localStorage.getItem('token'));

  const [badWords, setBadWords] = useState([]);

  const COMMENTS_PER_PAGE = 22;
  const [visibleCount, setVisibleCount] = useState(COMMENTS_PER_PAGE);
  const observerRef = useRef();
  // Fetch bad words from API on mount
  useEffect(() => {
    const fetchBadWords = async () => {
      const result = await getAllBadwords();
      if (result && result.status && Array.isArray(result.data)) {
        setBadWords(result.data.map(w => w.word || w));
      } else if (Array.isArray(result)) {
        setBadWords(result);
      }
    };
    fetchBadWords();
  }, []);

  // Live validation as user types
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewComment(value);
    const validationError = validateCommentInput(value);
    setInputError(validationError);
  };

  const fetchComments = async () => {
    setLoading(true);
    setFetchError(null);
    const result = await getAllCommentsBySellProduct(sellProductId);
    if (result && result.status) {
      setComments(result.data);
    } else {
      setFetchError('Failed to load comments');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [sellProductId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    // Add sellProductId validation before submitting
    if (!sellProductId || !sellProductId.trim()) {
      setInputError('SellProductId must not be empty.');
      return;
    }
    const validationError = validateCommentInput(newComment);
    if (validationError) {
      setInputError(validationError);
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setInputError('You must be logged in to comment.');
        setSubmitting(false);
        return;
      }
      // Allow posting any comment, but censor bad words only for display
      const result = await createComment({ sellProductId, content: newComment });
      if (result && result.status) {
        setNewComment('');
        setInputError(null);
        await fetchComments();
      } else {
        setInputError('Failed to post comment.');
      }
    } catch (err) {
      setInputError('Failed to post comment.');
    }
    setSubmitting(false);
  };


  // Sort comments by updatedAt
  const sortedComments = [...comments].sort((a, b) =>
    sortOrder === 'latest'
      ? new Date(b.updatedAt) - new Date(a.updatedAt)
      : new Date(a.updatedAt) - new Date(b.updatedAt)
  );

  // Lazy load handler
  const lastCommentRef = useCallback(
    (node) => {
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && visibleCount < sortedComments.length) {
          setVisibleCount((prev) => prev + COMMENTS_PER_PAGE);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [visibleCount, sortedComments.length]
  );

  if (loading) {
    return (
      <>
        {/* Comment header */}
        <div class="comment-wrapper">
          <div class="comment-tab oleo-script-bold">Comment</div>
        </div>

        {/* Form and List of comments */}
        <div className="skeleton h-16 w-1/3 rounded bg-gray-600/40 mx-auto" />

        <div className="comment-list-container">
          <div className="comment-list-header">
            <div className="comment-list-title oleo-script-bold">
              All Comments <span className="comment-count">(…)</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="comment-card animate-pulse flex items-start gap-3"
              >
                <div className="avatar">
                  <div className="skeleton w-10 h-10 rounded-full bg-gray-700/40 backdrop-blur-sm" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-1/3 rounded bg-gray-600/40" />
                  <div className="skeleton h-3 w-full rounded bg-gray-600/30" />
                  <div className="skeleton h-3 w-5/6 rounded bg-gray-600/20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }


  return (
    <>
      {/* Comment header */}
      <div class="comment-wrapper">
        <div class="comment-tab oleo-script-bold">Comment</div>
      </div>

      {/* Form and List of comments */}
      <div className='comment-listNform'>
        {fetchError && <div className="text-red-500 mb-2">{fetchError}</div>}
        <form onSubmit={handleCommentSubmit} className={`comment-form-wrapper max-w-2xl mx-auto ${isExpanded ? 'expanded' : 'collapsed'}`}>
          <input
            type="text"
            className="comment-input oxanium-regular"
            placeholder="Add a comment..."
            value={newComment}
            onChange={handleInputChange}
            onFocus={() => setIsExpanded(true)}
            disabled={submitting || !isLoggedIn}
          />

          {isExpanded && (
            <div className="comment-controls">
              <hr className="comment-divider" />
              <div className="comment-button-group">
                <button
                  type="button"
                  className="comment-cancel-btn oxanium-semibold"
                  onClick={() => {
                    setIsExpanded(false);
                    setNewComment('');
                    setInputError(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="comment-post-btn oxanium-semibold"
                  disabled={submitting || !isLoggedIn || !newComment.trim() || inputError}
                >
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          )}
        </form>
        {/* Always show error message if input is invalid */}
        {inputError && (
          <div className="text-red-500 text-sm mb-2 text-center">{inputError}</div>
        )}
        {!isLoggedIn && (
          <div className="text-sm text-gray-500 mb-2 text-center">You must be logged in to comment.</div>
        )}

        <div className="comment-list-container">
          {/* Comment list header */}
          <div className="comment-list-header">
            <div className="comment-list-title oleo-script-bold">
              All Comments <span className="comment-count">({comments.length})</span>
            </div>

            {/* Sort toggle */}
            <div className="comment-btn-container">
              <label className="switch btn-color-mode-switch oleo-script-regular">
                <input
                  type="checkbox"
                  id="sort_toggle"
                  checked={sortOrder === 'latest'}
                  onChange={() =>
                    setSortOrder((prev) => (prev === 'latest' ? 'oldest' : 'latest'))
                  }
                />
                <label
                  className="btn-color-mode-switch-inner "
                  data-off="Oldest"
                  data-on="Latest"
                  htmlFor="sort_toggle"
                ></label>
              </label>
            </div>
          </div>

          {/* Comment list */}
          {sortedComments.length === 0 ? (
            <div className="no-comments oxanium-light">No comments yet.</div>
          ) : (
            sortedComments.slice(0, visibleCount).map((comment, index) => (
              <div
                key={comment.id}
                ref={index + 1 === visibleCount ? lastCommentRef : null}
                className="comment-card"
              >
                <div className='comment-card-content-wrapper'>
                  <div className="comment-author-pic avatar">
                    <div className='w-8 sm:w-10 lg:w-12 rounded-full border-2 border-white relative'>
                      <img
                        src={
                          comment.profileImage
                            ? buildImageUrl(comment.profileImage, useBackupImg)
                            : ProfileHolder
                        }
                        onError={() => setUseBackupImg(true)}
                        alt="Profile"
                        className="comment-er-avatar"
                      />
                    </div>
                  </div>

                  <div className='comment-content-info'>
                    <div className="comment-author oxanium-bold">{comment.username}</div>
                    <div className="comment-content oxanium-regular">
                      {censorBadWords(comment.content, badWords)}
                    </div>
                    <div className="comment-date oxanium-light">
                      {new Date(comment.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </>
  );
};

export default CommentSection;
