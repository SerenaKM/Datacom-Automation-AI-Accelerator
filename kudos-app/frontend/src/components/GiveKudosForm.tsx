import React, { useState, useEffect } from "react";
import api from "../services/api";
import { User } from "../types";

interface GiveKudosFormProps {
  onKudosCreated: () => void;
}

const GiveKudosForm: React.FC<GiveKudosFormProps> = ({ onKudosCreated }) => {
  const [recipientId, setRecipientId] = useState("");
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      searchUsers(searchTerm);
    } else {
      setUsers([]);
    }
  }, [searchTerm]);

  const searchUsers = async (search: string) => {
    try {
      const response = await api.listUsers(search);
      setUsers(response.data);
      setShowDropdown(true);
    } catch (error) {
      console.error("Failed to search users:", error);
      setError("Failed to search users");
    }
  };

  const selectUser = (user: User) => {
    setRecipientId(user.id);
    setSearchTerm(user.fullName);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!recipientId) {
      setError("Please select a recipient");
      return;
    }

    if (message.trim().length === 0) {
      setError("Please enter a message");
      return;
    }

    setLoading(true);
    try {
      await api.createKudos(recipientId, message);
      setSuccess("Kudos sent successfully!");
      setRecipientId("");
      setMessage("");
      setSearchTerm("");
      onKudosCreated();

      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to send kudos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="give-kudos-form">
      <h2>Give Kudos</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="recipient">Select Recipient</label>
          <div className="recipient-search">
            <input
              type="text"
              id="recipient"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              autoComplete="off"
              required
            />
            {showDropdown && users.length > 0 && (
              <ul className="user-dropdown">
                {users.map((user) => (
                  <li key={user.id} onClick={() => selectUser(user)}>
                    <div className="user-item">
                      <strong>{user.fullName}</strong>
                      <span className="email">{user.email}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="message">Message ({message.length}/280)</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 280))}
            placeholder="Write a message of appreciation..."
            maxLength={280}
            rows={4}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !recipientId || message.trim().length === 0}
          className="submit-btn"
        >
          {loading ? "Sending..." : "Send Kudos"}
        </button>
      </form>
    </div>
  );
};

export default GiveKudosForm;
