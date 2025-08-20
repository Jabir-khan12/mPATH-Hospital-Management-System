// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000",
// });

// export default api;

// src/utils/api.js
import axios from "axios";

export default axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// fetch(`http://localhost:5000/users/${patientId}`, {
//   method: "PUT",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   body: JSON.stringify(updatedData),
// });
