import React, { useState, useEffect } from "react";
import api from "../services/api";
import { ALLOWED_EMOJIS } from "../utils/constants";

interface ReactionBarProps {
  kudosId: string;
}

interface ReactionSummary {
  emoji: string;
  count: number;
  users: Array<{ id: string; username: string }>;
}

const ReactionBar: React.FC<ReactionBarProps> = ({ kudosId }) => {
  const [reactions, setReactions] = useState<ReactionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(null);

  useEffect(() => {
    loadReactions();
  }, [kudosId]);

  const loadReactions = async () => {
    setLoading(true);
    try {
      const response = await api.getReactionsForKudos(kudosId);
      setReactions(response.data.reactions);

      // Check if current user has reacted
      const currentUser = localStorage.getItem("currentUserId");
      const userReactionData = response.data.allReactions.find(
        (r: any) => r.userId === currentUser,
      );
      setUserReaction(userReactionData?.emoji || null);
    } catch (error) {
      console.error("Failed to load reactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReaction = async (emoji: string) => {
    try {
      await api.addReaction(kudosId, emoji);
      setUserReaction(emoji);
      loadReactions();
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  };

  const handleRemoveReaction = async () => {
    if (!userReaction) return;

    try {
      await api.removeReaction(kudosId, userReaction);
      setUserReaction(null);
      loadReactions();
    } catch (error) {
      console.error("Failed to remove reaction:", error);
    }
  };

  const ALLOWED_EMOJIS_LIST = ["👍", "❤️", "🎉", "😊", "😂"];

  return (
    <div className="reaction-bar">
      <div className="reactions-display">
        {reactions.map((reaction) => (
          <div key={reaction.emoji} className="reaction-item">
            <span className="emoji">{reaction.emoji}</span>
            <span className="count">{reaction.count}</span>
          </div>
        ))}
      </div>

      <div className="reaction-input">
        <div className="emoji-picker">
          {ALLOWED_EMOJIS_LIST.map((emoji) => (
            <button
              key={emoji}
              className={`emoji-btn ${userReaction === emoji ? "active" : ""}`}
              onClick={() => {
                if (userReaction === emoji) {
                  handleRemoveReaction();
                } else {
                  handleAddReaction(emoji);
                }
              }}
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReactionBar;
