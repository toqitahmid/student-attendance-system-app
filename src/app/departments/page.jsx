"use client";

import { useEffect, useState } from "react";
import { departmentsApi } from "@/lib/api";
import { Button, Modal, Surface } from "@heroui/react";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState(""); // 1. Added state for department code
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadDepartments() {
      setLoading(true);
      try {
        const data = await departmentsApi.getAll();
        if (!cancelled) setDepartments(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDepartments();

    return () => {
      cancelled = true;
    };
  }, [refreshCount]);

  async function handleSubmit(e) {
    e.preventDefault();
    // Validate both name and code are filled
    if (name.trim() === "" || code.trim() === "") {
      alert("Please enter both a Department Name and a Department Code");
      return;
    }

    try {
      // 2. Sending both name and code to match backend validation requirements
      await departmentsApi.create({
        name: name,
        code: code.trim().toUpperCase(), // Formats code nicely (e.g., cse -> CSE)
      });

      setName("");
      setCode(""); // Clear code field on success
      setRefreshCount((prev) => prev + 1);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    const confirmDelete = confirm("Delete this department?");
    if (!confirmDelete) return;

    try {
      await departmentsApi.delete(id);
      setRefreshCount((prev) => prev + 1);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="text-center text-3xl font-semibold mb-30">Departments</h1>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <div className="flex justify-end">
        <Modal>
          <Button className="" variant="secondary">
            Add Department
          </Button>
          <Modal.Backdrop>
            <Modal.Container placement="auto">
              <Modal.Dialog className="w-full">
                <Modal.CloseTrigger />
                <Modal.Header></Modal.Header>
                <Modal.Body className="p-6">
                  <Surface variant="default">
                    {/* --- ADD DEPARTMENT FORM --- */}
                    <form
                      onSubmit={handleSubmit}
                      style={{
                        marginBottom: "24px",
                        display: "flex",
                        flexDirection: "column", // 👈 Arranges children in a vertical column
                        gap: "12px", // 👈 Clean, uniform spacing between fields
                        maxWidth: "320px", // 👈 Prevents inputs from stretching across the entire screen
                      }}
                    >
                      <input
                        className="border-2 rounded-2xl"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Department name"
                        style={{ padding: "8px" }} // Added padding for better look
                      />

                      {/* 3. New input field for Code */}
                      <input
                        className="border-2 rounded-2xl"
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Code (e.g., CSE)"
                        style={{ padding: "8px" }}
                      />

                      <button
                        className="border-2 rounded-md"
                        type="submit"
                        style={{
                          padding: "8px 16px",
                          alignSelf: "flex-start", // 👈 Keeps button native sized instead of expanding full-width
                          cursor: "pointer",
                        }}
                      >
                        Add Department
                      </button>
                    </form>
                  </Surface>
                </Modal.Body>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </div>

      {/* --- DEPARTMENTS LIST --- */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="mt-10" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th style={{ padding: "8px" }}>Department</th>
              <th style={{ padding: "8px" }}>Code</th>
              <th style={{ padding: "8px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((department) => (
              <tr key={department._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px" }}>{department.name}</td>
                <td className="" style={{ padding: "8px" }}>
                  {department.code}
                </td>
                
                <td style={{ padding: "8px" }}>
                  <button
                    onClick={() => handleDelete(department._id)}
                    style={{ color: "red" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
