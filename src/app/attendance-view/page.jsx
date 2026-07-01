"use client";

import { useEffect, useState } from "react";
import { attendanceApi, departmentsApi, studentsApi } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function AttendanceViewPage() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [date, setDate] = useState(getTodayDate());
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  // Load departments dropdown list
  useEffect(function () {
    let cancelled = false;
    departmentsApi.getAll().then(function (data) {
      if (cancelled) return;
      setDepartments(data);
    });
    return function () {
      cancelled = true;
    };
  }, []);

  // Fetch student roster and matching records when options shuffle
  useEffect(
    function () {
      if (!selectedDept || !selectedSemester) return;

      let cancelled = false;

      async function loadViewData() {
        setLoading(true);
        setError("");
        try {
          const studentList = await studentsApi.getByFilters({
            department: selectedDept,
            semester: selectedSemester,
          });

          const attendanceList = await attendanceApi.getAll(
            date,
            selectedDept,
            selectedSemester,
          );

          if (cancelled) return;

          setStudents(studentList);

          // 🔄 UNIFIED FEEDS MAP GENERATION
          const recordsMap = {};
          attendanceList.forEach(function (record) {
            const sId = record.student || record.studentId;
            if (sId) {
              // Store just the status string value indexed by the student's ID
              recordsMap[sId.toString().toLowerCase()] = record.status;
            }
          });

          setRecords(recordsMap);
        } catch (err) {
          if (!cancelled) setError(err.message);
        } finally {
          if (!cancelled) setLoading(false);
        }
      }

      loadViewData();

      return function () {
        cancelled = true;
      };
    },
    [selectedDept, selectedSemester, date],
  );

  const isFilterReady = Boolean(selectedDept && selectedSemester);
  const visibleStudents = isFilterReady ? students : [];

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <header
        style={{
          borderBottom: "2px solid #eaeaea",
          paddingBottom: "10px",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ margin: 0, color: "#333" }}>Student Attendance Portal</h1>
        <p style={{ margin: "5px 0 0 0", color: "#666" }}>
          View daily classroom attendance reports
        </p>
      </header>

      {error && (
        <p style={{ color: "red", fontWeight: "bold" }}>Error: {error}</p>
      )}

      {/* --- SELECTION FILTERS --- */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label
            style={{ fontSize: "14px", fontWeight: "bold", color: "#555" }}
          >
            Department
          </label>
          <select
            value={selectedDept}
            onChange={function (e) {
              setSelectedDept(e.target.value);
              setStudents([]);
              setRecords({});
            }}
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              minWidth: "180px",
            }}
          >
            <option value="">Select Department</option>
            {departments.map(function (dept) {
              return (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              );
            })}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label
            style={{ fontSize: "14px", fontWeight: "bold", color: "#555" }}
          >
            Semester
          </label>
          <select
            value={selectedSemester}
            onChange={function (e) {
              const val = e.target.value ? parseInt(e.target.value, 10) : "";
              setSelectedSemester(val);
              setStudents([]);
              setRecords({});
            }}
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              minWidth: "150px",
            }}
          >
            <option value="">Select Semester</option>
            {semesters.map(function (sem) {
              return (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              );
            })}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label
            style={{ fontSize: "14px", fontWeight: "bold", color: "#555" }}
          >
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={function (e) {
              setDate(e.target.value);
              setStudents([]);
              setRecords({});
            }}
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>
      </div>

      {/* --- ATTENDANCE REPORT LAYOUT --- */}
      {!isFilterReady ? (
        <div
          style={{
            padding: "30px",
            background: "#f9f9f9",
            borderRadius: "8px",
            textAlign: "center",
            color: "#777",
          }}
        >
          Please choose a Department and Semester to track daily attendance
          logs.
        </div>
      ) : loading ? (
        <p>Loading class roster database...</p>
      ) : visibleStudents.length === 0 ? (
        <p style={{ color: "#666" }}>
          No registered students found matching this class division.
        </p>
      ) : (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              background: "#f5f5f5",
              padding: "12px 16px",
              fontWeight: "bold",
              borderBottom: "1px solid #ddd",
            }}
          >
            <div style={{ flex: 1 }}>Student Details</div>
            <div style={{ width: "120px", textAlign: "right" }}>
              Attendance Status
            </div>
          </div>

          {visibleStudents.map(function (student) {
            // Safe, uniform lower-cased lookup strings
            const lookupId = student._id
              ? student._id.toString().toLowerCase()
              : "";
            const currentStatus = records[lookupId];

            return (
              <div
                key={student._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 16px",
                  borderBottom: "1px solid #eee",
                  background: "#fff",
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: "500", color: "#222" }}>
                    {student.name}
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0 0",
                      fontSize: "12px",
                      color: "#777",
                    }}
                  >
                    Roll Number: {student.roll || student.rollNumber}
                  </p>
                </div>

                <div
                  style={{
                    width: "120px",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  {currentStatus ? (
                    <StatusBadge status={currentStatus} />
                  ) : (
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#999",
                        fontStyle: "italic",
                      }}
                    >
                      Not Marked Yet
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
