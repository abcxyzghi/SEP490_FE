import React, { useEffect, useState } from 'react';
import { getAllCommentsBySellProduct, createComment } from '../../../services/api.comment';

// Utility to remove Vietnamese accents
function removeVietnameseTones(str) {
  return str.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

const BAD_WORDS = [
  // English & Vietnamese offensive words
  'anal','cứt', 'anus', 'arse', 'ass', 'asshole', 'ballsack', 'bastard', 'bdsm', 'bimbo', 'bitch', 'blow job', 'blowjob', 'blue waffle', 'bondage', 'boner', 'boob', 'booobs', 'booty call', 'breasts', 'bullshit', 'burn in hell', 'busty', 'butthole', 'bố mày nhịn mày lâu lắm rồi đấy', 'cawk', 'cc', 'chets', 'ching chong', 'chink', 'chó', 'cink', 'clit', 'cnut', 'cock', 'cockmuncher', 'con bóng long xiên', 'con chó', 'con cặk', 'con cẹc', 'cowgirl', 'crap', 'crotch', 'cuc', 'cum', 'cumbag', 'cumdump', 'cunt', 'cuts', 'cái địt mẹ cuộc đời', 'còn cái nịt', 'có làm thì mới có ăn, không làm mà muốn có ăn thì ăn đầu bùi ăn cứt', 'cằk', 'cặc', 'cức', 'damn', 'dmm', 'dm', 'deep throat', 'deepthroat', 'dick', 'dickhead', 'dildo', 'dink', 'dm', 'dog style', 'doggie style', 'doggy style', 'doosh', 'douche', 'duche', 'ejaculate', 'ejaculating', 'ejaculation', 'ejakulate', 'erotic', 'erotism', 'f.y.m', 'fag', 'faggots', 'fatass', 'fcuk', 'femdom', 'fingerfuck', 'fingering', 'fistfuck', 'fook', 'fooker', 'foot job', 'footjob', 'fuck', 'fuck you mean', 'fuk', 'gang bang', 'gangbang', 'gaysex', 'gay', 'goddammit', 'hand job', 'handjob', 'hentai', 'hoer', 'homo', 'hooker', 'hope your family dies', 'horny', 'incest', 'i’ll find you and kill you', 'jack off', 'jackoff', 'jerk off', 'jerkoff', 'jizz', 'k.y.s', 'khôn lỏi', 'khốn nạn', 'kill yourself', 'lót tích', 'masturbate', 'milf', 'mofo', 'mom jokes', 'mothafuck', 'motherfuck', 'motherfucker', 'muff', 'mày có biết bố mày là ai không', 'mày không thoát được đâu con trai à', 'mày đừng có bốc phép, mồm điêu', 'mẹ mày', 'n!99@', 'nazi', 'ngu', 'ngu dốt', 'ni99a', 'nigga', 'nigger', 'nipple', 'nob', 'nude', 'numbnuts', 'nutsack', 'orgasm', 'orgy', 'pajeet', 'panties', 'panty', 'papist', 'penis', 'pimp', 'playboy', 'porn', 'pussies', 'pussy', 'rape', 'raping', 'rapist', 'rectum', 'retard', 'rimming', 'sadism', 'sadist', 'sao mày ngu thế hả', 'scrotum', 'semen', 'sex', 'saygex', 'she male', 'shemale', 'shibaiii', 'shit', 'slut', 'sluts', 'son of a bitch', 'spinhand', 'spunk', 'strip club', 'stripclub', 'sợ sợ quá phải ban nó thôi', 'three some', 'threesome', 'throating', 'tit', 'towelhead', 'tranny', 'trời ơi ghê chưa', 'twat', 'tôi năm nay 70 tuổi rồi chưa từng gặp trường hợp nào như vậy', 'vagina', 'vai lon', 'vail*n', 'vailon', 'vcl', 'viagra', 'vkl', 'vl', 'vãi lồn', 'vô học', 'vô liêm sỹ', 'w.t.f', 'w.t.h', 'wank', 'wanker', 'ashole', 'ashol', 'what the fuck', 'what the hell', 'whoar', 'whore', 'xxx', 'lz', 'xà lách kim cương', 'xàm lol', 'you should’ve been aborted', 'à thì ra mày chọn cái chết', 'đàn ông mặc váy', 'đéo hiểu kiểu gì', 'địt mẹ', 'địt mẹ mày ảo thật đấy', 'đồ ngu đồ ăn hại cút mẹ mày đi', 'đụ má', 'ối giời ơi dễ vãi lồn'
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
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null); // Separate fetch error
  const [inputError, setInputError] = useState(null); // Separate input error
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem('token'));

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

  if (loading) return <div>Loading comments...</div>;
  return (
    <div>
      {fetchError && <div className="text-red-500 mb-2">{fetchError}</div>}
      <form onSubmit={handleCommentSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded px-2 py-1"
          placeholder="Add a comment..."
          value={newComment}
          onChange={handleInputChange}
          disabled={submitting || !isLoggedIn}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-1 rounded"
          disabled={submitting || !isLoggedIn || !newComment.trim() || inputError}
        >
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </form>
      {/* Always show error message if input is invalid */}
      {inputError && (
        <div className="text-red-500 text-sm mb-2">{inputError}</div>
      )}
      {!isLoggedIn && (
        <div className="text-sm text-gray-500 mb-2">You must be logged in to comment.</div>
      )}
      {comments.length === 0 ? (
        <div>No comments yet.</div>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="mb-4 p-3 border rounded">
            <div className="font-semibold">{comment.username}</div>
            <div className="text-gray-700">{censorBadWords(comment.content)}</div>
            <div className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default CommentSection;
