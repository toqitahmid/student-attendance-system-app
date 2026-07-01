"use client";

import { useEffect, useState } from "react";
import { attendanceApi, departmentsApi, studentsApi } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function AttendancePage() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [date, setDate] = useState(getTodayDate());
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  // Load departments once, on page load
  useEffect(function () {
    let cancelled = false;

    departmentsApi.getAll().then(function (data) {
      if (cancelled) return;
      setDepartments(data);
      if (data.length > 0) setSelectedDept(data[0]._id);
    });

    return function () {
      cancelled = true;
    };
  }, []);

  // Load students + attendance whenever department, semester, date, or refreshCount changes
  useEffect(
    function () {
      // 1. FIXED: Simply return early if selections are incomplete. No synchronous setStates!
      if (!selectedDept || !selectedSemester) return;

      let cancelled = false;

      async function loadRosterAndAttendance() {
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

          const recordsMap = {};
          attendanceList.forEach(function (record) {
            recordsMap[record.student] = record;
          });
          setRecords(recordsMap);
        } catch (err) {
          if (!cancelled) setError(err.message);
        } finally {
          if (!cancelled) setLoading(false);
        }
      }

      loadRosterAndAttendance();

      return function () {
        cancelled = true;
      };
    },
    [selectedDept, selectedSemester, date, refreshCount],
  );

  // 2. DERIVED STATE: Safely fallback to empty data layouts on the fly without breaking lint rules
  const isFilterReady = Boolean(selectedDept && selectedSemester);
  const visibleStudents = isFilterReady ? students : [];

  async function markStudent(student, status) {
    try {
      const existingRecord = records[student._id];
      let updatedRecord;

      if (existingRecord) {
        // 1. Updating an existing student
        updatedRecord = await attendanceApi.update(
          existingRecord._id,
          student._id,
          status,
        );
      } else {
        // 2. Marking the very first student of a new session
        const responseData = await attendanceApi.mark({
          date: date,
          departmentId: selectedDept,
          semester: selectedSemester,
          students: [{ studentId: student._id, status: status }],
        });

        // 🔄 FIX: Format the master response object so the frontend state map
        // can read the keys cleanly without losing tracking references
        updatedRecord = {
          _id: responseData._id,
          student: student._id, // Normalizes key to match your GET data mapping
          status: status,
        };
      }

      // Update your local state map immediately
      const newRecords = { ...records };
      newRecords[student._id] = updatedRecord;
      setRecords(newRecords);

      // Optional: Only use refreshCount if you want to force a background reload
      // setRefreshCount(function(prev) { return prev + 1; });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Mark Attendance</h1>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {/* --- FILTERS LAYOUT CONTAINER --- */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
        }}
      >
        {/* --- DEPARTMENT SELECT --- */}
        <select
          value={selectedDept}
          onChange={function (e) {
            setSelectedDept(e.target.value);
            setStudents([]);
            setRecords({});
          }}
          style={{ padding: "8px" }}
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

        {/* --- SEMESTER SELECT --- */}
        <select
          value={selectedSemester}
          onChange={function (e) {
            const val = e.target.value ? parseInt(e.target.value, 10) : "";
            setSelectedSemester(val);
            setStudents([]);
            setRecords({});
          }}
          style={{ padding: "8px" }}
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

        {/* --- DATE INPUT --- */}
        <input
          type="date"
          value={date}
          onChange={function (e) {
            setDate(e.target.value);
            // 🔄 FIXED: Wipes cached memory allocations so changing days behaves correctly
            setStudents([]);
            setRecords({});
          }}
          style={{ padding: "8px" }}
        />
      </div>

      {/* --- MAIN ROSTER CONDITIONAL DISPLAY --- */}
      {!isFilterReady ? (
        <p style={{ color: "#666" }}>
          Please select both a Department and a Semester to view the attendance
          sheet.
        </p>
      ) : loading ? (
        <p>Loading roster data...</p>
      ) : visibleStudents.length === 0 ? (
        <p>No students found matching this selection.</p>
      ) : (
        visibleStudents.map(function (student) {
          const record = records[student._id];
          const currentStatus = record ? record.status : null;

          return (
            <div
              key={student._id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <div>
                <p style={{ margin: 0 }}>{student.name}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>
                  Roll: {student.roll || student.rollNumber}
                </p>
              </div>

              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                {currentStatus && <StatusBadge status={currentStatus} />}

                <button
                  onClick={function () {
                    markStudent(student, "Present");
                  }}
                  style={{ padding: "6px 12px", cursor: "pointer" }}
                >
                  Present
                </button>
                <button
                  onClick={function () {
                    markStudent(student, "Late");
                  }}
                  style={{ padding: "6px 12px", cursor: "pointer" }}
                >
                  Late
                </button>
                <button
                  onClick={function () {
                    markStudent(student, "Absent");
                  }}
                  style={{ padding: "6px 12px", cursor: "pointer" }}
                >
                  Absent
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
