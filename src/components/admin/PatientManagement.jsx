import React, { useState, useEffect } from "react";

export default function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [error, setError] = useState(null);
  const [activeNav, setActiveNav] = useState("Dashboard");

  const [patientForm, setPatientForm] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
    dob: "",
    lastVisit: "",
    nextVisit: "",
    disabled: false,
  });

  const [recForm, setRecForm] = useState({
    patientId: "",
    note: "",
  });

  const [editingPatientId, setEditingPatientId] = useState(null);
  const [editingPatientData, setEditingPatientData] = useState({});
  const [editingRecs, setEditingRecs] = useState([]);

  useEffect(() => {
    const savedPosition = sessionStorage.getItem("scrollPosition");
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition, 10));
      sessionStorage.removeItem("scrollPosition");
    }
    const saveScroll = () => {
      sessionStorage.setItem("scrollPosition", window.scrollY);
    };
    window.addEventListener("beforeunload", saveScroll);
    return () => {
      window.removeEventListener("beforeunload", saveScroll);
    };
  }, []);

  useEffect(() => {
    fetchPatients();
    fetchRecommendations();
  }, []);

  useEffect(() => {
    const savedPosition = sessionStorage.getItem("scrollPosition");
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition, 10));
      sessionStorage.removeItem("scrollPosition");
    }
    const saveScroll = () => {
      sessionStorage.setItem("scrollPosition", window.scrollY);
    };
    window.addEventListener("beforeunload", saveScroll);
    return () => window.removeEventListener("beforeunload", saveScroll);
  }, []);

  async function fetchPatients() {
    setLoadingPatients(true);
    try {
      const res = await fetch("http://localhost:5000/users?role=patient");
      const data = await res.json();
      setPatients(data);
    } catch (e) {
      setError("Failed to load patients");
    } finally {
      setLoadingPatients(false);
    }
  }

  async function fetchRecommendations() {
    setLoadingRecs(true);
    try {
      const res = await fetch("http://localhost:5000/recommendations");
      const data = await res.json();
      setRecommendations(data);
    } catch (e) {
      setError("Failed to load recommendations");
    } finally {
      setLoadingRecs(false);
    }
  }

  const handlePatientInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPatientForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  async function handleAddPatient(e) {
    e.preventDefault();
    const newPatient = { ...patientForm, role: "patient" };
    if (!newPatient.name || !newPatient.email || !newPatient.password) {
      alert("Name, Email and Password are required");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPatient),
      });
      if (!res.ok) throw new Error("Failed to add patient");
      await fetchPatients();
      setPatientForm({
        name: "",
        email: "",
        password: "",
        contact: "",
        dob: "",
        lastVisit: "",
        nextVisit: "",
        disabled: false,
      });
    } catch (e) {
      alert(e.message);
    }
  }

  const handleRecInputChange = (e) => {
    const { name, value } = e.target;
    setRecForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function handleAddRecommendation(e) {
    e.preventDefault();
    if (!recForm.patientId || !recForm.note) {
      alert("Please select patient and enter recommendation");
      return;
    }
    const newRec = { ...recForm, date: new Date().toISOString() };
    try {
      const res = await fetch("http://localhost:5000/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRec),
      });
      if (!res.ok) throw new Error("Failed to add recommendation");
      await fetchRecommendations();
      setRecForm({ patientId: "", note: "" });
    } catch (e) {
      alert(e.message);
    }
  }

  async function togglePatientStatus(patient) {
    const updatedPatient = { ...patient, disabled: !patient.disabled };
    try {
      const res = await fetch(`http://localhost:5000/users/${patient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled: updatedPatient.disabled }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      await fetchPatients();
    } catch (e) {
      alert(e.message);
    }
  }

  async function startEditingPatient(patient) {
    setEditingPatientId(patient.id);
    setEditingPatientData({ ...patient });
    try {
      setLoadingRecs(true);
      const res = await fetch(
        `http://localhost:5000/recommendations?patientId=${patient.id}`
      );
      const data = await res.json();
      setEditingRecs(data);
    } catch {
      setEditingRecs([]);
    } finally {
      setLoadingRecs(false);
    }
  }

  function cancelEditingPatient() {
    setEditingPatientId(null);
    setEditingPatientData({});
    setEditingRecs([]);
  }

  const changeEditingPatientData = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingPatientData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const changeEditingRecNote = (recId, newNote) => {
    setEditingRecs((prev) =>
      prev.map((rec) => (rec.id === recId ? { ...rec, note: newNote } : rec))
    );
  };

  async function saveEditingPatient() {
    try {
      const resPatient = await fetch(
        `http://localhost:5000/users/${editingPatientId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingPatientData),
        }
      );
      if (!resPatient.ok) throw new Error("Failed to update patient");

      for (const rec of editingRecs) {
        const resRec = await fetch(
          `http://localhost:5000/recommendations/${rec.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rec),
          }
        );
        if (!resRec.ok) throw new Error("Failed to update recommendation");
      }

      await fetchPatients();
      await fetchRecommendations();
      cancelEditingPatient();
    } catch (e) {
      alert(e.message);
    }
  }

  async function deletePatient(patientId) {
    if (
      !window.confirm(
        "Are you sure you want to delete this patient and all their recommendations?"
      )
    )
      return;
    try {
      const recsToDelete = recommendations.filter(
        (rec) => rec.patientId === patientId
      );
      for (const rec of recsToDelete) {
        await fetch(`http://localhost:5000/recommendations/${rec.id}`, {
          method: "DELETE",
        });
      }
      const res = await fetch(`http://localhost:5000/users/${patientId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete patient");
      await fetchPatients();
      await fetchRecommendations();
      if (editingPatientId === patientId) cancelEditingPatient();
    } catch (e) {
      alert(e.message);
    }
  }

  function getPatientRecs(patientId) {
    return recommendations.filter((rec) => rec.patientId === patientId);
  }

  return (
    <div className="min-h-screen bg-white text-blue-900 p-6">
      <nav className="flex justify-between items-center bg-gray-100 px-6 py-3 rounded-md shadow mb-8 sticky top-0 z-10">
        <div className="font-bold text-xl select-none">mPATH</div>
        <ul className="flex space-x-6 text-sm font-semibold">
          {[
            "Dashboard",
            "Attendance",
            "Leaves",
            "Peoples",
            "Teams",
            "Assessment",
          ].map((nav) => (
            <li
              key={nav}
              onClick={() => setActiveNav(nav)}
              className={`cursor-pointer px-3 py-1 rounded select-none ${
                activeNav === nav
                  ? "bg-blue-600 text-white"
                  : "hover:bg-blue-100 hover:text-blue-700"
              }`}
            >
              {nav}
            </li>
          ))}
        </ul>
      </nav>

      {activeNav === "Dashboard" ? (
        <>
          <section className="flex flex-wrap gap-6 mb-10 max-w-full">
            <form
              onSubmit={handleAddPatient}
              className="bg-blue-50 border border-blue-300 rounded p-5 flex-1 min-w-[320px] max-w-xl"
            >
              <h2 className="font-semibold mb-4 text-lg">Add Patient</h2>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <label className="flex flex-col">
                  Name*
                  <input
                    name="name"
                    value={patientForm.name}
                    onChange={handlePatientInputChange}
                    className="border border-blue-300 rounded p-1 text-xs"
                    required
                  />
                </label>
                <label className="flex flex-col">
                  Email*
                  <input
                    name="email"
                    type="email"
                    value={patientForm.email}
                    onChange={handlePatientInputChange}
                    className="border border-blue-300 rounded p-1 text-xs"
                    required
                  />
                </label>
                <label className="flex flex-col">
                  Password*
                  <input
                    name="password"
                    type="password"
                    value={patientForm.password}
                    onChange={handlePatientInputChange}
                    className="border border-blue-300 rounded p-1 text-xs"
                    required
                  />
                </label>
                <label className="flex flex-col">
                  Contact
                  <input
                    name="contact"
                    value={patientForm.contact}
                    onChange={handlePatientInputChange}
                    className="border border-blue-300 rounded p-1 text-xs"
                  />
                </label>
                <label className="flex flex-col">
                  DOB
                  <input
                    name="dob"
                    type="date"
                    value={patientForm.dob}
                    onChange={handlePatientInputChange}
                    className="border border-blue-300 rounded p-1 text-xs"
                  />
                </label>
                <label className="flex flex-col">
                  Last Visit
                  <input
                    name="lastVisit"
                    type="date"
                    value={patientForm.lastVisit}
                    onChange={handlePatientInputChange}
                    className="border border-blue-300 rounded p-1 text-xs"
                  />
                </label>
                <label className="flex flex-col">
                  Next Visit
                  <input
                    name="nextVisit"
                    type="date"
                    value={patientForm.nextVisit}
                    onChange={handlePatientInputChange}
                    className="border border-blue-300 rounded p-1 text-xs"
                  />
                </label>
                <label className="flex items-center space-x-2 mt-5 cursor-pointer select-none">
                  <input
                    name="disabled"
                    type="checkbox"
                    checked={patientForm.disabled}
                    onChange={handlePatientInputChange}
                    className="w-4 h-4"
                  />
                  <span className="text-xs">Disable Patient</span>
                </label>
              </div>
              <button
                type="submit"
                className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm font-semibold"
              >
                Add Patient
              </button>
            </form>
            <form
              onSubmit={handleAddRecommendation}
              className="bg-blue-50 border border-blue-300 rounded p-5 flex-1 min-w-[280px] max-w-md"
            >
              <h2 className="font-semibold mb-4 text-lg">Add Recommendation</h2>
              <label className="flex flex-col mb-3 text-xs">
                Select Patient*
                <select
                  name="patientId"
                  value={recForm.patientId}
                  onChange={handleRecInputChange}
                  className="border border-blue-300 rounded p-1 text-xs"
                  required
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col mb-3 text-xs">
                Recommendation*
                <input
                  name="note"
                  value={recForm.note}
                  onChange={handleRecInputChange}
                  className="border border-blue-300 rounded p-1 text-xs"
                  required
                />
              </label>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm font-semibold"
              >
                Add Recommendation
              </button>
            </form>
          </section>
          <section className="overflow-x-auto">
            <h2 className="font-semibold mb-3 text-lg">Patients List</h2>
            {loadingPatients ? (
              <p>Loading patients...</p>
            ) : (
              <table className="table-auto border-collapse w-full text-xs">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="border border-blue-300 px-2 py-1 text-left">
                      ID
                    </th>
                    <th className="border border-blue-300 px-2 py-1 text-left">
                      Name
                    </th>
                    <th className="border border-blue-300 px-2 py-1 text-left">
                      Email
                    </th>
                    <th className="border border-blue-300 px-2 py-1 text-left">
                      Contact
                    </th>
                    <th className="border border-blue-300 px-2 py-1 text-left">
                      Last Visit
                    </th>
                    <th className="border border-blue-300 px-2 py-1 text-left">
                      Next Visit
                    </th>
                    <th className="border border-blue-300 px-2 py-1 text-center">
                      Status
                    </th>
                    <th className="border border-blue-300 px-2 py-1 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <React.Fragment key={patient.id}>
                      <tr>
                        <td className="border border-blue-300 px-2 py-1">
                          {patient.id}
                        </td>
                        <td className="border border-blue-300 px-2 py-1">
                          {editingPatientId === patient.id ? (
                            <input
                              name="name"
                              value={editingPatientData.name || ""}
                              onChange={changeEditingPatientData}
                              className="border border-blue-300 rounded p-1 text-xs w-full"
                            />
                          ) : (
                            patient.name
                          )}
                        </td>
                        <td className="border border-blue-300 px-2 py-1">
                          {editingPatientId === patient.id ? (
                            <input
                              name="email"
                              type="email"
                              value={editingPatientData.email || ""}
                              onChange={changeEditingPatientData}
                              className="border border-blue-300 rounded p-1 text-xs w-full"
                            />
                          ) : (
                            patient.email
                          )}
                        </td>
                        <td className="border border-blue-300 px-2 py-1">
                          {editingPatientId === patient.id ? (
                            <input
                              name="contact"
                              value={editingPatientData.contact || ""}
                              onChange={changeEditingPatientData}
                              className="border border-blue-300 rounded p-1 text-xs w-full"
                            />
                          ) : (
                            patient.contact || "-"
                          )}
                        </td>
                        <td className="border border-blue-300 px-2 py-1">
                          {editingPatientId === patient.id ? (
                            <input
                              name="lastVisit"
                              type="date"
                              value={editingPatientData.lastVisit || ""}
                              onChange={changeEditingPatientData}
                              className="border border-blue-300 rounded p-1 text-xs w-full"
                            />
                          ) : (
                            patient.lastVisit || "-"
                          )}
                        </td>
                        <td className="border border-blue-300 px-2 py-1">
                          {editingPatientId === patient.id ? (
                            <input
                              name="nextVisit"
                              type="date"
                              value={editingPatientData.nextVisit || ""}
                              onChange={changeEditingPatientData}
                              className="border border-blue-300 rounded p-1 text-xs w-full"
                            />
                          ) : (
                            patient.nextVisit || "-"
                          )}
                        </td>
                        <td className="border border-blue-300 px-2 py-1 text-center">
                          {editingPatientId === patient.id ? (
                            <button
                              onClick={() =>
                                setEditingPatientData((prev) => ({
                                  ...prev,
                                  disabled: !prev.disabled,
                                }))
                              }
                              className={`relative inline-flex items-center h-6 rounded-full w-12 transition-colors duration-300 focus:outline-none ${
                                editingPatientData.disabled
                                  ? "bg-gray-300"
                                  : "bg-green-500"
                              }`}
                              aria-pressed={!editingPatientData.disabled}
                            >
                              <span
                                className={`transform transition-transform duration-300 inline-block w-5 h-5 bg-white rounded-full ${
                                  editingPatientData.disabled
                                    ? "translate-x-0"
                                    : "translate-x-6"
                                }`}
                              />
                            </button>
                          ) : (
                            <button
                              onClick={() => togglePatientStatus(patient)}
                              className={`relative inline-flex items-center h-6 rounded-full w-12 transition-colors duration-300 focus:outline-none ${
                                patient.disabled
                                  ? "bg-gray-300"
                                  : "bg-green-500"
                              }`}
                              aria-pressed={!patient.disabled}
                            >
                              <span
                                className={`transform transition-transform duration-300 inline-block w-5 h-5 bg-white rounded-full ${
                                  patient.disabled
                                    ? "translate-x-0"
                                    : "translate-x-6"
                                }`}
                              />
                            </button>
                          )}
                        </td>
                        <td className="border border-blue-300 px-2 py-1 text-center space-x-2">
                          {editingPatientId === patient.id ? (
                            <>
                              <button
                                onClick={saveEditingPatient}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditingPatient}
                                className="bg-gray-400 text-white px-3 py-1 rounded text-xs"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditingPatient(patient)}
                                className="bg-yellow-400 text-white px-3 py-1 rounded text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deletePatient(patient.id)}
                                className="bg-red-600 text-white px-3 py-1 rounded text-xs"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                      {editingPatientId === patient.id && (
                        <tr>
                          <td
                            colSpan={8}
                            className="bg-blue-50 border border-blue-300 p-3"
                          >
                            <h3 className="font-semibold mb-2 text-sm">
                              Recommendations
                            </h3>
                            {loadingRecs ? (
                              <p>Loading recommendations...</p>
                            ) : editingRecs.length === 0 ? (
                              <p className="text-xs italic">
                                No recommendations found.
                              </p>
                            ) : (
                              editingRecs.map((rec) => (
                                <div key={rec.id} className="mb-2">
                                  <textarea
                                    value={rec.note}
                                    onChange={(e) =>
                                      changeEditingRecNote(
                                        rec.id,
                                        e.target.value
                                      )
                                    }
                                    rows={2}
                                    className="w-full border border-blue-300 rounded p-1 text-xs"
                                  />
                                </div>
                              ))
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      ) : (
        <div className="mt-20 text-center text-blue-700 font-semibold text-xl">
          {activeNav} page content will be here.
        </div>
      )}
    </div>
  );
}
