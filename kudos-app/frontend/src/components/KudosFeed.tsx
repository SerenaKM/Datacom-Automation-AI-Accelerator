import React, { useState, useEffect } from "react";
import api from "../services/api";
import { Kudos } from "../types";
import KudosCard from "./KudosCard";

const KudosFeed: React.FC = () => {
  const [kudos, setKudos] = useState<Kudos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadFeed();
  }, [page]);

  const loadFeed = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.getKudosFeed(page);
      setKudos(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to load feed");
      console.error("Failed to load feed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    loadFeed();
  };

  if (loading && kudos.length === 0) {
    return <div className="loading">Loading feed...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="kudos-feed">
      <div className="feed-header">
        <h2>Kudos Feed</h2>
        <button onClick={handleRefresh} className="refresh-btn">
          Refresh
        </button>
      </div>

      {kudos.length === 0 ? (
        <div className="empty-state">
          <p>No kudos yet. Start by giving kudos to a colleague!</p>
        </div>
      ) : (
        <div className="kudos-list">
          {kudos.map((k) => (
            <KudosCard key={k.id} kudos={k} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="page-info">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default KudosFeed;
