import { useCallback, useEffect, useMemo, useState } from "react";
import { client } from "../api/client";
import PageShell from "../components/PageShell";
import { DAY_KEYS, DAY_SHORT, toYmd } from "../utils/date";

export default function Today() {
  const userId = localStorage.getItem("userId");
  const [rows, setRows] = useState([]);
  const [scheduleMap, setScheduleMap] = useState({});
  const [takenMap, setTakenMap] = useState({});
  const [loading, setLoading] = useState(true);
  const todayDate = toYmd(new Date());
  const todayKey = DAY_KEYS[new Date().getDay()];
  const todayShort = DAY_SHORT[todayKey];

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const medRes = await client.get(`/medicine/${userId}`);
      const meds = medRes.data || [];
      const schRes = await client.get(`/schedule/user/${userId}`);
      const map = {};
      (schRes.data || []).forEach((s) => { map[s.medicineId] = s; });
      setScheduleMap(map);

      let logs = [];
      try {
        const logRes = await client.get(`/logs/${userId}/${todayDate}`);
        logs = logRes.data || [];
      } catch {}

      const tk = {};
      logs.forEach((l) => {
        if (!tk[l.medicineId]) tk[l.medicineId] = new Set();
        tk[l.medicineId].add(l.timing);
      });
      setTakenMap(tk);
      setRows(meds.filter((m) => map[m.id]?.days?.includes(todayKey)));
    } catch (e) {
      if (e.response?.status === 404) setRows([]);
    } finally {
      setLoading(false);
    }
  }, [todayDate, todayKey, userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const total = useMemo(() => {
    let t = 0;
    rows.forEach((m) => {
      const sch = scheduleMap[m.id];
      const times = sch?.dayTimesMap?.[todayShort]?.length
        ? sch.dayTimesMap[todayShort]
        : (sch?.times || []);
      t += times.length;
    });
    return t;
  }, [rows, scheduleMap, todayShort]);

  const taken = useMemo(() => {
    let t = 0;
    rows.forEach((m) => {
      const sch = scheduleMap[m.id];
      const times = sch?.dayTimesMap?.[todayShort]?.length
        ? sch.dayTimesMap[todayShort]
        : (sch?.times || []);
      const tk = takenMap[m.id] || new Set();
      t += times.filter((x) => tk.has(x)).length;
    });
    return t;
  }, [rows, scheduleMap, takenMap, todayShort]);

  const pct = total > 0 ? Math.round((taken / total) * 100) : 0;

  const markTaken = async (m, timing) => {
    try {
      await client.post("/logs/taken", { userId, medicineId: m.id, takenDate: todayDate, timing });
      await client.put(`/medicine/update/${m.id}`, { quantity: m.quantity - 1 });
      fetchAll();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to mark as taken");
    }
  };

  return (
    <PageShell title="Today's Dose" subtitle={new Date().toDateString()}>
      {/* Progress card */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 4 }}>Daily progress</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: pct === 100 ? "var(--green)" : "var(--accent)" }}>
              {taken} <span style={{ fontSize: 14, color: "var(--text3)", fontWeight: 400 }}>of {total} doses</span>
            </div>
          </div>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: pct === 100 ? "var(--green-soft)" : "var(--accent-soft)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 700,
            color: pct === 100 ? "var(--green)" : "var(--accent)",
          }}>
            {pct}%
          </div>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%`,
            background: pct === 100 ? "linear-gradient(90deg, #43e97b, #38f9d7)" : undefined }} />
        </div>
        {pct === 100 && total > 0 && (
          <div style={{ marginTop: 10, fontSize: 13, color: "var(--green)", textAlign: "center" }}>
            🎉 All doses completed for today!
          </div>
        )}
      </div>

      {loading && (
        <div style={{ display: "grid", gap: 12 }}>
          {[1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: "var(--radius)" }} />)}
        </div>
      )}

      {!loading && rows.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <div style={{ color: "var(--text2)", fontWeight: 500 }}>No medicines scheduled for today</div>
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {rows.map((m) => {
          const sch = scheduleMap[m.id];
          const times = sch?.dayTimesMap?.[todayShort]?.length
            ? sch.dayTimesMap[todayShort]
            : (sch?.times || []);
          const tk = takenMap[m.id] || new Set();
          const pending = times.filter((t) => !tk.has(t));
          const allDone = pending.length === 0 && times.length > 0;

          return (
            <div key={m.id} className="card" style={{
              padding: 16,
              borderLeft: `3px solid ${allDone ? "var(--green)" : "var(--accent)"}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{m.name}</div>
                  <span className="badge badge-blue">{m.quantity} remaining</span>
                </div>
                {allDone && <span className="badge badge-green">✓ Done</span>}
              </div>

              {allDone ? (
                <div style={{ color: "var(--green)", fontSize: 14 }}>All timings completed today</div>
              ) : (
                <div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 8 }}>Pending doses:</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {pending.map((t) => (
                      <button key={t} className="btn btn-success" style={{ fontSize: 13 }}
                        onClick={() => markTaken(m, t)}>
                        ✓ {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}