import React, { useState, useEffect } from "react";
import api from "../services/api";
import { KudosComment } from "../types";

interface CommentSectionProps {
  kudosId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ kudosId }) => {
  const [comments, setComments] = useState<KudosComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadComments();
  }, [kudosId, page]);

  const loadComments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.getCommentsForKudos(kudosId, page);
      setComments(response.data.data);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim().length === 0) {
      setError("Please enter a comment");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.addComment(kudosId, newComment);
      setNewComment("");
      setPage(1);
      loadComments();
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await api.deleteComment(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to delete comment");
    }
  };

  const handleFlagComment = async (commentId: string) => {
    const reason = prompt(
      "Select flag reason:\n1. OFFENSIVE_LANGUAGE\n2. HARASSMENT\n3. SPAM\n4. INAPPROPRIATE\n5. OTHER",
    );
    if (!reason) return;

    try {
      await api.flagComment(commentId, reason);
      alert("Comment flagged successfully");
      loadComments();
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to flag comment");
    }
  };

  return (
    <div className="comment-section">
      <h4>Comments</h4>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value.slice(0, 150))}
          placeholder="Add a comment... (max 150 chars)"
          maxLength={150}
          rows={3}
        />
        <div className="form-footer">
          <span className="char-count">{newComment.length}/150</span>
          <button
            onClick={handleAddComment}
            disabled={loading || newComment.trim().length === 0}
            className="submit-btn"
          >
            {loading ? "Adding..." : "Add Comment"}
          </button>
        </div>
      </div>

      {comments.length === 0 ? (
        <p className="no-comments">No comments yet</p>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <span className="author">{comment.author.fullName}</span>
                {comment.isFlagged && (
                  <span className="flagged-badge">🚩 Flagged</span>
                )}
              </div>
              <p className="comment-text">{comment.commentText}</p>
              <div className="comment-actions">
                <button
                  className="action-link"
                  onClick={() => handleFlagComment(comment.id)}
                >
                  🚩 Flag
                </button>
                <button
                  className="action-link delete"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
