// src/components/admin/RecommendationForm.jsx
import React, { useEffect, useState } from "react";
// import axios from "axios";
// import api from "../utils/api";
import api from "../../utils/api";

const RecommendationForm = () => {
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPatients = async () => {
    try {
      // const res = await axios.get("http://localhost:5000/users?role=patient");
      const res = await api.get("/users?role=patient");

      setPatients(res.data);
    } catch (err) {
      console.error("Failed to load patients:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId || !note)
      return alert("Please select a patient and write a note.");

    setLoading(true);
    try {
      await api.post("/recommendations", {
        patientId: parseInt(patientId),
        note,
        date: new Date().toISOString(),
      });
      alert("Recommendation added successfully!");
      setNote("");
      setPatientId("");
    } catch (err) {
      console.error("Failed to submit recommendation:", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-green-600">
        Add Recommendation
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="patientId" className="block mb-1 text-sm font-medium">
            Select Patient
          </label>
          <select
            id="patientId"
            name="patientId"
            className="w-full border px-3 py-2 rounded"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
          >
            <option value="">-- Select --</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="note" className="block mb-1 text-sm font-medium">
            Recommendation Note
          </label>
          <textarea
            id="note"
            name="note"
            className="w-full border px-3 py-2 rounded"
            rows="4"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Saving..." : "Add Recommendation"}
        </button>
      </form>
    </div>
  );
};

export default RecommendationForm;
