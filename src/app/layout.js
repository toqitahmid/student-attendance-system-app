import Sidebar from "@/components/Sidebar";
import "./globals.css";

export const metadata = {
  title: "Attendance App",
  description: "Manage departments, students, and daily attendance",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en"
    color-theme='light'
    >
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif" }}>
        <div style={{ display: "flex" }}>
          <Sidebar />
          <main style={{ flex: 1, padding: "32px" }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
