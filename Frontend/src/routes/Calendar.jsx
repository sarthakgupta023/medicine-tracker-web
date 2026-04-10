import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { toYmd } from "../utils/date";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function Calendar() {
  const navigate = useNavigate();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = toYmd(now);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const cells = useMemo(() => {
    const arr = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [firstDay, daysInMonth]);

  return (
    <PageShell title={`${MONTH_NAMES[month]} ${year}`} subtitle="Tap a date to see details">
      {/* Day labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
        {DAY_LABELS.map((d) => (
          <div key={d} style={{
            textAlign: "center", fontSize: 12, fontWeight: 600,
            color: "var(--text3)", padding: "6px 0", textTransform: "uppercase", letterSpacing: "0.05em",
          }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={`empty-${i}`} />;
            const dateStr = toYmd(new Date(year, month, d));
            const isToday = dateStr === today;
            const isPast = dateStr < today;
            return (
              <button key={d} onClick={() => navigate(`/day-details?date=${dateStr}`)}
                style={{
                  aspectRatio: "1", border: "none", borderRadius: 10, cursor: "pointer",
                  fontFamily: "var(--font)", fontSize: 14, fontWeight: isToday ? 700 : 400,
                  background: isToday
                    ? "linear-gradient(135deg, var(--accent), var(--accent2))"
                    : isPast ? "var(--bg2)" : "var(--surface2)",
                  color: isToday ? "#0a0f1e" : isPast ? "var(--text3)" : "var(--text)",
                  transition: "all 0.15s",
                  boxShadow: isToday ? "0 4px 12px rgba(79,172,254,0.35)" : "none",
                }}
                onMouseOver={(e) => { if (!isToday) e.currentTarget.style.background = "var(--surface)"; }}
                onMouseOut={(e) => {
                  if (!isToday) e.currentTarget.style.background = isPast ? "var(--bg2)" : "var(--surface2)";
                }}>
                {d}
              </button>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}