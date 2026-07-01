"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  // This tells us which page we're currently on, so we can highlight it
  const currentPath = usePathname();

  const menuItems = [
    { href: "/", label: "Dashboard" },
    { href: "/attendance", label: "Mark Attendance" },
    { href: "/students", label: "Students" },
    { href: "/departments", label: "Departments" },
    { href: "/attendance-view", label: "View Attendance" },
  ];

  return (
    <aside
      style={{
        width: "220px",
        background: "#2B3A67",
        color: "white",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          padding: "24px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <h2 style={{ fontSize: "20px", margin: 0 }}>Attendance App</h2>
      </div>

      <nav style={{ padding: "16px 0" }}>
        {menuItems.map(function (item) {
          const isActive = currentPath === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "block",
                padding: "12px 20px",
                color: "white",
                textDecoration: "none",
                background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
