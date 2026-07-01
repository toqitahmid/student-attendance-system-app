"use client";

import { useEffect, useState } from "react";
import { departmentsApi, studentsApi } from "@/lib/api";
import { Button, Modal, Surface, Dropdown, Label } from "@heroui/react";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  // Filter Selection Fields
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  // Form fields for adding a student
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [formDeptId, setFormDeptId] = useState("");
  const [formSemester, setFormSemester] = useState("");

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  // 1. Load departments on mount
  useEffect(() => {
    let cancelled = false;
    departmentsApi.getAll().then((data) => {
      if (!cancelled) setDepartments(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Fetch students ONLY when both parameters are present
  useEffect(() => {
    // If selections are incomplete, do nothing (Table won't render anyway)
    if (!selectedDept || !selectedSemester) return;

    let cancelled = false;

    async function loadFilteredStudents() {
      setLoading(true);
      setError("");
      try {
        const data = await studentsApi.getByFilters({
          department: selectedDept,
          semester: selectedSemester,
        });
        if (!cancelled) setStudents(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFilteredStudents();

    return () => {
      cancelled = true;
    };
  }, [selectedDept, selectedSemester, refreshCount]);

  // Derived State: Are filters valid?
  // This makes sure we don't accidentally display stale data
  const isFilterSelected = Boolean(selectedDept && selectedSemester);
  const visibleStudents = isFilterSelected ? students : [];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !rollNumber.trim() || !formDeptId || !formSemester) {
      alert("Please fill in all form fields");
      return;
    }
    try {
      await studentsApi.create({
        name: name,
        roll: rollNumber,
        departmentId: formDeptId,
        semester: formSemester,
      });
      setName("");
      setRollNumber("");
      setFormDeptId("");
      setFormSemester("");

      if (formDeptId === selectedDept && formSemester === selectedSemester) {
        setRefreshCount((prev) => prev + 1);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    const confirmDelete = confirm("Delete this student?");
    if (!confirmDelete) return;
    try {
      await studentsApi.delete(id);
      setRefreshCount((prev) => prev + 1);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="text-center font-semibold text-3xl mb-40">
        Students Management
      </h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <div className="flex justify-between items-center">
        {/* --- FILTER SECTION --- */}
        <fieldset
          style={{ marginBottom: "24px", padding: "16px", borderRadius: "6px" }}
        >
          <legend>
            <strong>Filter Students List</strong>
          </legend>
          <div style={{ display: "flex", gap: "12px" }}>
            <select
              className="bg-black rounded-2xl"
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setStudents([]); // Safely clear state during event handler execution
              }}
              style={{ padding: "8px" }}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>

            <select
              className="bg-black rounded-2xl"
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                setStudents([]); // Safely clear state during event handler execution
              }}
              style={{ padding: "8px" }}
            >
              <option value="">Select Semester</option>
              {semesters.map((sem) => (
                <option key={sem} value={sem}>
                  {sem} Semester
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        <Modal>
          <Button variant="secondary">Add Student</Button>
          <Modal.Backdrop>
            <Modal.Container placement="auto">
              <Modal.Dialog className="sm:max-w-md">
                <Modal.CloseTrigger />
                <Modal.Header></Modal.Header>
                <Modal.Body className="p-6">
                  <Surface variant="default">
                    {/* --- ADD STUDENT FORM --- */}
                    <fieldset
                      style={{
                        marginBottom: "24px",
                        padding: "16px",
                        borderRadius: "6px",
                      }}
                    >
                      <legend>
                        <strong>Add New Student</strong>
                      </legend>
                      <form
                        onSubmit={handleSubmit}
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        <input
                          className="bg-blue-50 rounded-2xl"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Student name"
                          style={{ padding: "8px" }}
                        />
                        <input
                          className="bg-blue-50 rounded-2xl"
                          type="text"
                          value={rollNumber}
                          onChange={(e) => setRollNumber(e.target.value)}
                          placeholder="Roll number"
                          style={{ padding: "8px" }}
                        />
                        <select
                          className="bg-blue-50 rounded-2xl"
                          value={formDeptId}
                          onChange={(e) => setFormDeptId(e.target.value)}
                          style={{ padding: "8px" }}
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                        {/* <Dropdown>
                          <Button
                            aria-label="Menu"
                            className="bg-blue-50 rounded-2xl text-black"
                          >
                            Select Semester
                          </Button>
                          <Dropdown.Popover>
                            <Dropdown.Menu
                              value={formSemester}
                              onChange={(e) => setFormSemester(e.target.value)}
                            >
                              {semesters.map((sem) => (
                                <Dropdown.Item
                                  className="rounded-2xl"
                                  key={sem}
                                  value={sem}
                                >
                                  {sem} Semester
                                </Dropdown.Item>
                              ))}
                            </Dropdown.Menu>
                          </Dropdown.Popover>
                        </Dropdown> */}
                        <select
                          className="bg-blue-50 rounded-2xl"
                          value={formSemester}
                          onChange={(e) => setFormSemester(e.target.value)}
                          style={{ padding: "8px" }}
                        >
                          <option className="rounded-2xl" value="">
                            Select Semester
                          </option>
                          {semesters.map((sem) => (
                            <option
                              className="rounded-2xl"
                              key={sem}
                              value={sem}
                            >
                              {sem} Semester
                            </option>
                          ))}
                        </select>
                        <button
                          className="rounded-2xl border-2"
                          variant="outline"
                          type="submit"
                          style={{ padding: "8px 16px" }}
                        >
                          Add Student
                        </button>
                      </form>
                    </fieldset>
                  </Surface>
                </Modal.Body>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </div>

      {/* --- DATA TABLE --- */}
      {!isFilterSelected ? (
        <p className="text-center mt-30" style={{ color: "#666" }}>
          Please select both a Department and a Semester to view students.
        </p>
      ) : loading ? (
        <p className="text-center">Loading students...</p>
      ) : visibleStudents.length === 0 ? (
        <p className="text-center">No students found for this selection.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th style={{ padding: "8px" }}>Name</th>
              <th style={{ padding: "8px" }}>Semester</th>
              <th style={{ padding: "8px" }}>Roll No.</th>
              <th style={{ padding: "8px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleStudents.map((student) => (
              <tr key={student._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px" }}>{student.name}</td>
                <td className="" style={{ padding: "8px" }}>
                  {student.semester}
                </td>
                <td style={{ padding: "8px" }}>{student.roll}</td>
                <td style={{ padding: "8px" }}>
                  <button
                    onClick={() => handleDelete(student._id)}
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
