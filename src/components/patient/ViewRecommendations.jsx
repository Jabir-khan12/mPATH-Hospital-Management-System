import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const ViewRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    try {
      const res = await api.get(`/recommendations?patientId=${user.id}`);
      setRecommendations(res.data);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchRecommendations();
    }
  }, [user]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-green-600 mb-4">
        Your Recommendations
      </h2>
      {recommendations.length === 0 ? (
        <p className="text-gray-600">No recommendations yet.</p>
      ) : (
        <ul className="space-y-4">
          {recommendations.map((rec) => (
            <li key={rec.id} className="bg-white shadow-md rounded p-4">
              <p className="text-sm text-gray-500">
                {new Date(rec.date).toLocaleDateString()}
              </p>
              <p className="mt-1 text-gray-800">{rec.note}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ViewRecommendations;
