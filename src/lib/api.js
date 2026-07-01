// This file is the ONLY place that talks to your backend.
// If your backend routes are different, just change the URLs below.

// Change this to match your backend server address
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// A helper function that does the actual fetch() call
// Every API function below uses this, so we don't repeat ourselves
async function request(path, options) {
  const response = await fetch(BASE_URL + path, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options, // this lets us pass method: "POST", body: ... etc.
  });

  if (!response.ok) {
    // Something went wrong (like a 404 or 500 error)
    const errorText = await response.text();
    throw new Error(errorText || "Something went wrong: " + response.status);
  }

  // If the server sent back "no content", don't try to parse JSON
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
  // 1. Updated to call your Express mount router point cleanly
  getAll: function (date, departmentId, semester) {
    // 🔄 FIXED: Path should be relative to your BASE_URL wrapper!
    // If your BASE_URL is "https://students-attendence-system.onrender.com/api",
    // then this turns into: /api/attendance?date=...
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
    return request("/attendance/" + id, {
      method: "PUT",
      body: JSON.stringify({ studentId: studentId, status: status }),
    });
  },

  // 4. View filters utility fallback
  getByFilters: function (departmentId, semester, date) {
    // 🔄 FIXED: Ensured route matches your standard getAll architecture paths
    let url = `/attendance?departmentId=${departmentId}&semester=${semester}`;
    if (date) {
      url += `&date=${date}`;
    }
    return request(url);
  },
};

