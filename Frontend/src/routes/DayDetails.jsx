import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { client } from "../api/client";
import PageShell from "../components/PageShell";
import { DAY_KEYS, DAY_SHORT, formatDate, parseYmdToLocalDate } from "../utils/date";

export default function DayDetails() {
  const [params] = useSearchParams();
  const selectedDate = params.get("date");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const selected = parseYmdToLocalDate(selectedDate);
      if (!selected) { setItems([]); setLoading(false); return; }

      const full = DAY_KEYS[selected.getDay()];
      const short = DAY_SHORT[full];

      try {
        const meds = (await client.get(`/medicine/${userId}`)).data || [];
        const schedules = (await client.get(`/schedule/user/${userId}`)).data || [];
        const smap = {};
        schedules.forEach((s) => { smap[s.medicineId] = s; });

        let logs = [];
        try { logs = (await client.get(`/logs/${userId}/${selectedDate}`)).data || []; } catch {}

        const taken = {};
        logs.forEach((l) => {
          if (!taken[l.medicineId]) taken[l.medicineId] = [];
          taken[l.medicineId].push(l.timing);
        });

        const result = [];
        meds.forEach((m) => {
          const sch = smap[m.id];
          if (!sch || !sch.days?.includes(full)) return;
          const start = parseYmdToLocalDate(m.startDate);
          if (start && start > selected) return;

          const times = sch.dayTimesMap?.[short]?.length
            ? sch.dayTimesMap[short]
            : (sch.times || []);

          times.forEach((t) => result.push({
            name: m.name,
            timing: t,
            status: (taken[m.id] || []).includes(t) ? "Taken" : "Missed",
          }));
        });

        setItems(result);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [selectedDate]);

  const takenCount = items.filter((i) => i.status === "Taken").length;
  const missedCount = items.filter((i) => i.status === "Missed").length;

  return (
    <PageShell title={formatDate(selectedDate)} subtitle={`${takenCount} taken · ${missedCount} missed`}>
      {loading && (
        <div style={{ display: "grid", gap: 10 }}>
          {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 64, borderRadius: "var(--radius)" }} />)}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
          <div style={{ color: "var(--text2)", fontWeight: 500 }}>No medicines scheduled for this day</div>
        </div>
      )}

      {/* Summary */}
      {!loading && items.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div className="card" style={{ padding: "12px 16px", borderLeft: "3px solid var(--green)" }}>
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Taken</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--green)" }}>{takenCount}</div>
          </div>
          <div className="card" style={{ padding: "12px 16px", borderLeft: "3px solid var(--red)" }}>
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Missed</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--red)" }}>{missedCount}</div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {items.map((it, idx) => (
          <div key={`${it.name}-${it.timing}-${idx}`} className="card" style={{
            padding: 14,
            borderLeft: `3px solid ${it.status === "Taken" ? "var(--green)" : "var(--red)"}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{it.name}</div>
                <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 3 }}>{it.timing}</div>
              </div>
              <span className={`badge ${it.status === "Taken" ? "badge-green" : "badge-red"}`}>
                {it.status === "Taken" ? "✓ Taken" : "✗ Missed"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}