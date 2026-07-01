"use client";

import { useEffect, useState } from "react";
import { departmentsApi, studentsApi } from "@/lib/api";
import { Birdhouse, CircleAlert, CircleCheckBig, UserRound } from 'lucide-react';

export default function DashboardPage() {
  // useState = a variable that, when changed, re-renders the page
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // useEffect runs once when the page loads
  useEffect(function () {
    async function loadData() {
      try {
        const deptData = await departmentsApi.getAll();
        const studentData = await studentsApi.getAll();
        setDepartments(deptData);
        setStudents(studentData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []); // empty array = only run once

  if (loading) {
    return <p className="h-screen flex items-center justify-center">Loading dashboard...</p>;
  }

  return (
    <div>
      <h1 className="text-center text-3xl font-semibold">Dashboard</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <div className="mt-50 flex justify-center items-center gap-5 text-center">
        <div className="bg-blue-950 border-2 rounded-2xl w-80 shadow-sm hover-3d">
          <h1 className="p-5 text-xl flex justify-center items-center gap-2">
            <CircleCheckBig />
            <span className="text-xl opacity-70">Departments:</span>{" "}
            <span className="font-bold">{departments.length}</span>
          </h1>
        </div>
        <div className="bg-blue-950 border-2 rounded-2xl w-80 shadow-sm hover-3d">
          <h1 className="p-5 text-xl  flex justify-center items-center gap-2">
            <UserRound></UserRound>
            <span className="text-xl opacity-70">Total Students:</span>{" "}
            <span className="font-bold">{students.length}</span>
          </h1>
        </div>
      </div>
      <div className="flex justify-self-center bg-blue-950 border-2 rounded-2xl p-5 text-xl opacity-70 mt-10 shadow-sm hover-3d">
        <div>
          {departments.map((department, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <Birdhouse></Birdhouse>
              <ul className="">{department.name}</ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
