import React, { useEffect, useState, useRef, useCallback } from 'react';
import "./CommentSection.css";
import { getAllCommentsBySellProduct, createComment } from '../../../services/api.comment';
import ProfileHolder from "../../../assets/others/mmbAvatar.png";

// Utility to remove Vietnamese accents
function removeVietnameseTones(str) {
  return str.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

const BAD_WORDS = [
  // English & Vietnamese offensive words
  'anal', 'cứt', 'anus', 'arse', 'ass', 'asshole', 'ballsack', 'bastard', 'bdsm', 'bimbo', 'bitch', 'blow job', 'blowjob', 'blue waffle', 'bondage', 'boner', 'boob', 'booobs', 'booty call', 'breasts', 'bullshit', 'burn in hell', 'busty', 'butthole', 'bố mày nhịn mày lâu lắm rồi đấy', 'cawk', 'cc', 'chets', 'ching chong', 'chink', 'chó', 'cink', 'clit', 'cnut', 'cock', 'cockmuncher', 'con bóng long xiên', 'con chó', 'con cặk', 'con cẹc', 'cowgirl', 'crap', 'crotch', 'cuc', 'cum', 'cumbag', 'cumdump', 'cunt', 'cuts', 'cái địt mẹ cuộc đời', 'còn cái nịt', 'có làm thì mới có ăn, không làm mà muốn có ăn thì ăn đầu bùi ăn cứt', 'cằk', 'cặc', 'cức', 'damn', 'dmm', 'dm', 'deep throat', 'deepthroat', 'dick', 'dickhead', 'dildo', 'dink', 'dm', 'dog style', 'doggie style', 'doggy style', 'doosh', 'douche', 'duche', 'ejaculate', 'ejaculating', 'ejaculation', 'ejakulate', 'erotic', 'erotism', 'f.y.m', 'fag', 'faggots', 'fatass', 'fcuk', 'femdom', 'fingerfuck', 'fingering', 'fistfuck', 'fook', 'fooker', 'foot job', 'footjob', 'fuck', 'fuck you mean', 'fuk', 'gang bang', 'gangbang', 'gaysex', 'gay', 'goddammit', 'hand job', 'handjob', 'hentai', 'hoer', 'homo', 'hooker', 'hope your family dies', 'horny', 'incest', 'i’ll find you and kill you', 'jack off', 'jackoff', 'jerk off', 'jerkoff', 'jizz', 'k.y.s', 'khôn lỏi', 'khốn nạn', 'kill yourself', 'lót tích', 'masturbate', 'milf', 'mofo', 'mom jokes', 'mothafuck', 'motherfuck', 'motherfucker', 'muff', 'mày có biết bố mày là ai không', 'mày không thoát được đâu con trai à', 'mày đừng có bốc phép, mồm điêu', 'mẹ mày', 'n!99@', 'nazi', 'ngu', 'ngu dốt', 'ni99a', 'nigga', 'nigger', 'nipple', 'nob', 'nude', 'numbnuts', 'nutsack', 'orgasm', 'orgy', 'pajeet', 'panties', 'panty', 'papist', 'penis', 'pimp', 'playboy', 'porn', 'pussies', 'pussy', 'rape', 'raping', 'rapist', 'rectum', 'retard', 'rimming', 'sadism', 'sadist', 'sao mày ngu thế hả', 'scrotum', 'semen', 'sex', 'saygex', 'she male', 'shemale', 'shibaiii', 'shit', 'slut', 'sluts', 'son of a bitch', 'spinhand', 'spunk', 'strip club', 'stripclub', 'sợ sợ quá phải ban nó thôi', 'three some', 'threesome', 'throating', 'tit', 'towelhead', 'tranny', 'trời ơi ghê chưa', 'twat', 'tôi năm nay 70 tuổi rồi chưa từng gặp trường hợp nào như vậy', 'vagina', 'vai lon', 'vail*n', 'vailon', 'vcl', 'viagra', 'vkl', 'vl', 'vãi lồn', 'vô học', 'vô liêm sỹ', 'w.t.f', 'w.t.h', 'wank', 'wanker', 'ashole', 'ashol', 'what the fuck', 'what the hell', 'whoar', 'whore', 'xxx', 'lz', 'xà lách kim cương', 'xàm lol', 'you should’ve been aborted', 'à thì ra mày chọn cái chết', 'đàn ông mặc váy', 'đéo hiểu kiểu gì', 'địt mẹ', 'địt mẹ mày ảo thật đấy', 'đồ ngu đồ ăn hại cút mẹ mày đi', 'đụ má', 'ối giời ơi dễ vãi lồn'
];

function censorBadWords(text) {
  let censored = text;
  BAD_WORDS.forEach(word => {
    const pattern = new RegExp(`\\b${word}\\b`, 'gi');
    // Replace both original and accent-removed forms
    censored = censored.replace(pattern, '****');
    const patternNoAccent = new RegExp(`\\b${removeVietnameseTones(word)}\\b`, 'gi');
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
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null); // Separate fetch error
  const [inputError, setInputError] = useState(null); // Separate input error
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sortOrder, setSortOrder] = useState('latest');
  const isLoggedIn = Boolean(localStorage.getItem('token'));

  const COMMENTS_PER_PAGE = 22;
  const [visibleCount, setVisibleCount] = useState(COMMENTS_PER_PAGE);
  const observerRef = useRef();

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
                            ? `https://mmb-be-dotnet.onrender.com/api/ImageProxy/${comment.profileImage}`
                            : ProfileHolder
                        }
                        alt="Profile"
                        className="comment-er-avatar"
                      />
                    </div>
                  </div>

                  <div className='comment-content-info'>
                    <div className="comment-author oxanium-bold">{comment.username}</div>
                    <div className="comment-content oxanium-regular">
                      {censorBadWords(comment.content)}
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
