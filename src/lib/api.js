// src/lib/api.js

// Change the fallback key name to ensure Vercel reads the absolute URL
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function request(path, options) {
  // If the environment variable isn't loaded yet, fall back cleanly
  const apiBase = BASE_URL || "http://localhost:5000/api";

  const cleanBase = apiBase.replace(/\/+$/, "");
  const cleanPath = "/" + path.replace(/^\/+/, "");
  const url = `${cleanBase}${cleanPath}`;

  console.log("Sending request to:", url); // This will let you inspect the final URL in your browser console

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Something went wrong: " + response.status);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// ---------------- DEPARTMENTS ----------------
export const departmentsApi = {
  // Get all departments
  getAll: function () {
    return request("/departments");
  },
  // Create a new department
  create: function (data) {
    return request("/departments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  // Delete a department by its id
  delete: function (id) {
    return request("/departments/" + id, {
      method: "DELETE",
    });
  },
};

// ---------------- STUDENTS ----------------
export const studentsApi = {
  // Get all students, or only students in one department
  getAll: function (departmentId) {
    if (departmentId) {
      return request("/students?departmentId=" + departmentId);
    }
    return request("/students");
  },

  // 1. ADDED NEATLY INSIDE THE OBJECT 👇
  getByFilters: function ({ department, semester }) {
    // This utilizes your existing request helper and constructs the query string
    return request(`/students?departmentId=${department}&semester=${semester}`);
  },

  create: function (data) {
    return request("/students", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  delete: function (id) {
    return request("/students/" + id, {
      method: "DELETE",
    });
  },
};

// ---------------- ATTENDANCE ----------------
export const attendanceApi = {
  // 1. Used by both Admin page and View page to pull records safely
  getAll: function (date, departmentId, semester) {
    let path = `/attendance?date=${date}`;

    if (departmentId) {
      path += `&departmentId=${departmentId}`;
    }
    if (semester) {
      path += `&semester=${semester}`;
    }

    return request(path);
  },

  // 2. Submits master container initialization
  mark: function (data) {
    return request("/attendance", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // 3. Modifies status safely on backend container array structure
  update: function (id, studentId, status) {
    // 🔄 FIXED: Matches the router .patch() method on your backend file!
    return request("/attendance/" + id, {
      method: "PATCH",
      body: JSON.stringify({ studentId: studentId, status: status }),
    });
  },

  // 4. Fallback route helper mapped precisely to the backend query variables
  getByFilters: function (departmentId, semester, date) {
    let url = `/attendance?departmentId=${departmentId}&semester=${semester}`;
    if (date) {
      url += `&date=${date}`;
    }
    return request(url);
  },
};
