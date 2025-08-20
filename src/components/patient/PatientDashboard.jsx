// src/components/patient/PatientDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/recommendations?patientId=${user.id}`);
        setRecommendations(res.data);
      } catch (err) {
        console.error("Failed to load recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchRecommendations();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-4 md:mb-0">
          Welcome back, {user?.name.split(" ")[0]}!
        </h1>
        <button
          onClick={logout}
          className="inline-block bg-red-600 hover:bg-red-700 transition-colors text-white font-semibold px-5 py-2 rounded-md shadow-md"
          aria-label="Logout"
        >
          Logout
        </button>
      </header>

      {/* Main content grid */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <section className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b border-gray-300 pb-2">
            Your Profile
          </h2>
          <div className="space-y-4 text-gray-700 text-base">
            <div>
              <p className="text-gray-500 uppercase tracking-wide font-semibold text-sm">
                Full Name
              </p>
              <p>{user?.name || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500 uppercase tracking-wide font-semibold text-sm">
                Email Address
              </p>
              <p>{user?.email || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500 uppercase tracking-wide font-semibold text-sm">
                Contact Number
              </p>
              <p>{user?.contact || "Not Provided"}</p>
            </div>
            <div>
              <p className="text-gray-500 uppercase tracking-wide font-semibold text-sm">
                Date of Birth
              </p>
              <p>{user?.dob ? new Date(user.dob).toLocaleDateString() : "-"}</p>
            </div>
          </div>
        </section>

        {/* Upcoming Visits */}
        <section className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b border-gray-300 pb-2">
            Upcoming Visits
          </h2>
          <div className="text-gray-700 text-base space-y-3">
            <p>
              <span className="font-semibold text-gray-900">Next Visit:</span>{" "}
              {user?.nextVisit
                ? new Date(user.nextVisit).toLocaleDateString()
                : "No upcoming visit scheduled"}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Last Visit:</span>{" "}
              {user?.lastVisit
                ? new Date(user.lastVisit).toLocaleDateString()
                : "No previous visit recorded"}
            </p>
          </div>
        </section>

        {/* Recommendations */}
        <section className="bg-white rounded-lg shadow-md p-6 border border-gray-200 flex flex-col">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b border-gray-300 pb-2">
            Doctor's Recommendations
          </h2>

          {loading ? (
            <p className="text-gray-600 italic">Loading recommendations...</p>
          ) : recommendations.length === 0 ? (
            <p className="text-gray-600 italic">
              No recommendations available.
            </p>
          ) : (
            <ul className="flex-1 overflow-auto space-y-4 max-h-[350px] pr-2">
              {recommendations.map((rec) => (
                <li
                  key={rec.id}
                  className="p-4 bg-blue-50 rounded-md border border-blue-200 shadow-sm"
                >
                  <p className="text-gray-800">{rec.note}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(rec.date).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
