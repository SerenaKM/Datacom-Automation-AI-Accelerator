import React, { useState, useEffect } from "react";
import api from "../services/api";
import { Kudos, KudosComment } from "../types";
import CommentSection from "./CommentSection";
import ReactionBar from "./ReactionBar";

interface KudosCardProps {
  kudos: Kudos;
}

const KudosCard: React.FC<KudosCardProps> = ({ kudos: initialKudos }) => {
  const [kudos, setKudos] = useState(initialKudos);
  const [showComments, setShowComments] = useState(false);
  const [showFlagForm, setShowFlagForm] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagComment, setFlagComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleFlag = async () => {
    if (!flagReason) {
      setError("Please select a flag reason");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.flagKudos(kudos.id, flagReason, flagComment);
      setFlagReason("");
      setFlagComment("");
      setShowFlagForm(false);

      // Reload kudos to show updated flag count
      const response = await api.getKudosById(kudos.id);
      setKudos(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to flag kudos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kudos-card">
      <div className="card-header">
        <div className="sender-info">
          <span className="name">{kudos.sender.fullName}</span>
          <span className="username">@{kudos.sender.username}</span>
        </div>
        <span className="date">{formatDate(kudos.createdAt)}</span>
      </div>

      <div className="card-body">
        <p className="message">{kudos.message}</p>

        <div className="card-recipient">
          <strong>To:</strong> {kudos.recipient.fullName}
        </div>
      </div>

      <div className="card-footer">
        <button
          className="action-btn"
          onClick={() => setShowComments(!showComments)}
        >
          💬 Comments ({kudos.comments?.length || 0})
        </button>

        <div className="flags-info">
          {kudos.flagCount > 0 && (
            <span className="flag-count">🚩 {kudos.flagCount}</span>
          )}
        </div>

        <button
          className="action-btn flag-btn"
          onClick={() => setShowFlagForm(!showFlagForm)}
        >
          🚩 Flag
        </button>
      </div>

      {showFlagForm && (
        <div className="flag-form">
          <h4>Flag this Kudos</h4>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor={`reason-${kudos.id}`}>Reason</label>
            <select
              id={`reason-${kudos.id}`}
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
            >
              <option value="">Select a reason...</option>
              <option value="OFFENSIVE_LANGUAGE">Offensive Language</option>
              <option value="HARASSMENT">Harassment</option>
              <option value="SPAM">Spam</option>
              <option value="INAPPROPRIATE">Inappropriate</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor={`comment-${kudos.id}`}>
              Additional Comment (optional)
            </label>
            <textarea
              id={`comment-${kudos.id}`}
              value={flagComment}
              onChange={(e) => setFlagComment(e.target.value)}
              placeholder="Explain why you're flagging this..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button
              onClick={handleFlag}
              disabled={loading || !flagReason}
              className="submit-btn"
            >
              {loading ? "Flagging..." : "Submit Flag"}
            </button>
            <button
              onClick={() => {
                setShowFlagForm(false);
                setFlagReason("");
                setFlagComment("");
              }}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showComments && <CommentSection kudosId={kudos.id} />}
    </div>
  );
};

export default KudosCard;
