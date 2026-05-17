import React, { useState, useEffect } from "react";
import "./App.css";
import api from "./services/api";
import { Kudos } from "./types";
import KudosFeed from "./components/KudosFeed";
import GiveKudosForm from "./components/GiveKudosForm";
import Navigation from "./components/Navigation";

function App() {
  const [currentPage, setCurrentPage] = useState<
    "feed" | "sent" | "received" | "admin"
  >("feed");
  const [kudos, setKudos] = useState<Kudos[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await api.getUserProfile();
      setUser(response.data);
    } catch (error) {
      console.error("Failed to load user profile:", error);
    }
  };

  const handlePageChange = (page: "feed" | "sent" | "received" | "admin") => {
    setCurrentPage(page);
  };

  const handleKudosCreated = async () => {
    // Refresh the feed
    if (currentPage === "feed") {
      await loadFeed();
    }
  };

  const loadFeed = async () => {
    setLoading(true);
    try {
      const response = await api.getKudosFeed(1, 20);
      setKudos(response.data.data);
    } catch (error) {
      console.error("Failed to load feed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Navigation
        currentPage={currentPage}
        onPageChange={handlePageChange}
        user={user}
      />

      <main className="main-content">
        {currentPage === "feed" && (
          <>
            <GiveKudosForm onKudosCreated={handleKudosCreated} />
            <KudosFeed />
          </>
        )}

        {currentPage === "sent" && <div>Sent Kudos</div>}
        {currentPage === "received" && <div>Received Kudos</div>}
        {currentPage === "admin" && <div>Admin Dashboard</div>}
      </main>
    </div>
  );
}

export default App;
