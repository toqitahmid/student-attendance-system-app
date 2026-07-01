export default function StatusBadge({ status }) {
  // Pick a color based on the status text
  let color = "gray";
  if (status === "present") color = "green";
  if (status === "absent") color = "red";
  if (status === "late") color = "orange";

  return (
    <span
      style={{
        color: color,
        border: "1px solid " + color,
        borderRadius: "4px",
        padding: "2px 8px",
        fontSize: "12px",
        textTransform: "uppercase",
      }}
    >
      {status}
    </span>
  );
}
