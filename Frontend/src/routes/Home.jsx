import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { client } from "../api/client";
import PageShell from "../components/PageShell";

export default function Home() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const email = localStorage.getItem("userEmail") || "";
  const [medicines, setMedicines] = useState([]);
  const [scheduleMap, setScheduleMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState({});

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const medRes = await client.get(`/medicine/${userId}`);
      setMedicines(medRes.data || []);
      const schRes = await client.get(`/schedule/user/${userId}`);
      const map = {};
      (schRes.data || []).forEach((s) => { map[s.medicineId] = s; });
      setScheduleMap(map);
    } catch (e) {
      if (e.response?.status === 404) { setMedicines([]); setScheduleMap({}); }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return navigate("/login", { replace: true });
    fetchAll();
  }, [userId, navigate, fetchAll]);

  const handleDelete = async (medicineId) => {
    if (!window.confirm("Delete this medicine and its schedule?")) return;
    try {
      await client.delete(`/schedule/delete/${medicineId}`);
      await client.delete(`/medicine/delete/${medicineId}`);
      fetchAll();
    } catch (e) {
      alert(e.response?.data?.message || "Delete failed");
    }
  };

  const activeMeds = medicines.filter((m) => m.active !== false);

  return (
    <PageShell
      title="My Medicines"
      subtitle={email}
      right={
        <>
          <Link className="btn" to="/today" style={{ fontSize: 13 }}>Today</Link>
          <Link className="btn" to="/calendar" style={{ fontSize: 13 }}>Calendar</Link>
          <button className="btn btn-danger" style={{ fontSize: 13 }}
            onClick={() => { localStorage.clear(); navigate("/login", { replace: true }); }}>
            Logout
          </button>
        </>
      }
    >
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Medicines</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>{medicines.length}</div>
        </div>
        <div className="card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Active</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--green)" }}>{activeMeds.length}</div>
        </div>
      </div>

      {loading && (
        <div style={{ display: "grid", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 72, borderRadius: "var(--radius)" }} />
          ))}
        </div>
      )}

      {!loading && medicines.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💊</div>
          <h3 style={{ color: "var(--text2)", fontWeight: 500 }}>No medicines added yet</h3>
          <p style={{ color: "var(--text3)", fontSize: 14, marginTop: 8 }}>Add your first medicine to get started</p>
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {medicines.map((m) => {
          const sch = scheduleMap[m.id];
          const expanded = !!open[m.id];
          const isLowStock = m.quantity <= 5;
          return (
            <div key={m.id} className="card" style={{
              padding: 16, cursor: "pointer",
              borderLeft: `3px solid ${isLowStock ? "var(--red)" : "var(--accent)"}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: isLowStock ? "var(--red-soft)" : "var(--accent-soft)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18,
                  }}>💊</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{m.name}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                      <span className={`badge ${isLowStock ? "badge-red" : "badge-blue"}`}>
                        {m.quantity} left
                      </span>
                      {isLowStock && <span className="badge badge-red">Low Stock</span>}
                    </div>
                  </div>
                </div>
                <button className="btn" style={{ fontSize: 12 }}
                  onClick={() => setOpen((p) => ({ ...p, [m.id]: !p[m.id] }))}>
                  {expanded ? "▲" : "▼"}
                </button>
              </div>

              {expanded && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)", animation: "fadeIn 0.2s ease" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    <div style={{ background: "var(--bg2)", borderRadius: "var(--radius-sm)", padding: "10px 12px" }}>
                      <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Start Date</div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{m.startDate || "—"}</div>
                    </div>
                    <div style={{ background: "var(--bg2)", borderRadius: "var(--radius-sm)", padding: "10px 12px" }}>
                      <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Days</div>
                      <div style={{ fontSize: 13, fontWeight: 500, wordBreak: "break-word" }}>
                        {(sch?.days || []).map(d => d.slice(0, 3)).join(", ") || "—"}
                      </div>
                    </div>
                  </div>
                  <div style={{ background: "var(--bg2)", borderRadius: "var(--radius-sm)", padding: "10px 12px", marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Timings</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {(sch?.times || []).length > 0
                        ? (sch.times || []).map((t) => <span key={t} className="badge badge-blue">{t}</span>)
                        : <span style={{ color: "var(--text3)", fontSize: 13 }}>No timings set</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link className="btn" style={{ flex: 1, justifyContent: "center", fontSize: 13 }}
                      to={`/add-medicine?editMode=true&medicineId=${m.id}&name=${encodeURIComponent(m.name)}&quantity=${m.quantity}&startDate=${m.startDate}&days=${encodeURIComponent(JSON.stringify(sch?.days || []))}&dayTimesMap=${encodeURIComponent(JSON.stringify(sch?.dayTimesMap || {}))}`}>
                      ✏️ Edit
                    </Link>
                    <button className="btn btn-danger" style={{ flex: 1, fontSize: 13 }} onClick={() => handleDelete(m.id)}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FAB */}
      <Link to="/add-medicine" style={{
        position: "fixed", right: 20, bottom: 24,
        display: "flex", alignItems: "center", gap: 8,
        padding: "12px 20px",
        background: "linear-gradient(135deg, var(--accent), var(--accent2))",
        color: "#0a0f1e", fontWeight: 700, fontSize: 15,
        borderRadius: 50, textDecoration: "none",
        boxShadow: "0 8px 25px rgba(79,172,254,0.4)",
        transition: "all 0.2s",
      }}>
        + Add Medicine
      </Link>
    </PageShell>
  );
}