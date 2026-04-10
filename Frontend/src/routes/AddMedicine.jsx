import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { client } from "../api/client";
import PageShell from "../components/PageShell";

const ALL_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const DAY_FULL = { MON:"MONDAY", TUE:"TUESDAY", WED:"WEDNESDAY", THU:"THURSDAY", FRI:"FRIDAY", SAT:"SATURDAY", SUN:"SUNDAY" };
const MEAL_TIMES = ["Before Breakfast","After Breakfast","Before Lunch","After Lunch","Before Dinner","After Dinner"];

export default function AddMedicine() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const isEditMode = params.get("editMode") === "true";
  const medicineId = params.get("medicineId");

  const initDays = (() => {
    try { return JSON.parse(params.get("days") || "[]").map((d) => Object.keys(DAY_FULL).find((k) => DAY_FULL[k] === d) || d); }
    catch { return []; }
  })();
  const initMap = (() => {
    try { return JSON.parse(params.get("dayTimesMap") || "{}"); } catch { return {}; }
  })();

  const [name, setName] = useState(params.get("name") || "");
  const [quantity, setQuantity] = useState(params.get("quantity") || "");
  const [startDate, setStartDate] = useState(params.get("startDate") || "");
  const [selectedDays, setSelectedDays] = useState(initDays);
  const [dayTimes, setDayTimes] = useState(initMap);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
    setDayTimes((prev) => ({ ...prev, [day]: prev[day] || [] }));
  };

  const toggleTime = (day, t) => {
    setDayTimes((prev) => {
      const current = prev[day] || [];
      return { ...prev, [day]: current.includes(t) ? current.filter((x) => x !== t) : [...current, t] };
    });
  };

  const handleSubmit = async () => {
    setError("");
    if (!name.trim()) return setError("Medicine name is required");
    if (!quantity || isNaN(quantity) || Number(quantity) < 1) return setError("Enter a valid quantity");
    if (!isEditMode && !startDate) return setError("Start date is required");
    if (selectedDays.length === 0) return setError("Select at least one day");
    const hasTime = selectedDays.some((d) => (dayTimes[d] || []).length > 0);
    if (!hasTime) return setError("Select at least one timing for a day");

    const userId = localStorage.getItem("userId");
    setLoading(true);
    try {
      const payload = {
        userId,
        days: selectedDays.map((d) => DAY_FULL[d]),
        times: [...new Set(Object.values(dayTimes).flat())],
        dayTimesMap: dayTimes,
      };

      if (isEditMode) {
        await client.put(`/medicine/update/${medicineId}`, { quantity: Number(quantity) });
        await client.post("/schedule/add", { ...payload, medicineId });
      } else {
        const medRes = await client.post("/medicine/add", {
          userId,
          name: name.trim(),
          quantity: Number(quantity),
          startDate,
          active: true,
          createdAt: new Date().toISOString(),
        });
        await client.post("/schedule/add", { ...payload, medicineId: medRes.data.id });
      }
      navigate("/home", { replace: true });
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title={isEditMode ? "Edit Medicine" : "Add Medicine"}>
      <div className="card" style={{ padding: 20 }}>
        {error && (
          <div style={{
            padding: "10px 14px", borderRadius: "var(--radius-sm)",
            background: "var(--red-soft)", border: "1px solid rgba(245,87,108,0.25)",
            color: "var(--red)", fontSize: 13, marginBottom: 16,
          }}>{error}</div>
        )}

        <label style={{ fontSize: 13, color: "var(--text2)", display: "block", marginBottom: 6 }}>Medicine Name</label>
        <input className="input" placeholder="e.g. Paracetamol 500mg" value={name}
          onChange={(e) => setName(e.target.value)} disabled={isEditMode} />

        <label style={{ fontSize: 13, color: "var(--text2)", display: "block", marginBottom: 6 }}>Quantity (tablets/units)</label>
        <input className="input" type="number" placeholder="e.g. 30" value={quantity}
          onChange={(e) => setQuantity(e.target.value)} />

        {!isEditMode && (
          <>
            <label style={{ fontSize: 13, color: "var(--text2)", display: "block", marginBottom: 6 }}>Start Date</label>
            <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </>
        )}

        {/* Day selector */}
        <label style={{ fontSize: 13, color: "var(--text2)", display: "block", marginBottom: 10 }}>Select Days</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {ALL_DAYS.map((d) => {
            const active = selectedDays.includes(d);
            return (
              <button key={d} onClick={() => toggleDay(d)} style={{
                padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                fontFamily: "var(--font)", fontSize: 13, fontWeight: 600,
                background: active ? "linear-gradient(135deg, var(--accent), var(--accent2))" : "var(--bg2)",
                color: active ? "#0a0f1e" : "var(--text3)",
                transition: "all 0.15s",
                boxShadow: active ? "0 4px 12px rgba(79,172,254,0.25)" : "none",
              }}>{d}</button>
            );
          })}
        </div>

        {/* Time selector per day */}
        {selectedDays.map((d) => (
          <div key={d} style={{ marginBottom: 16, padding: 14, background: "var(--bg2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", marginBottom: 10 }}>
              {DAY_FULL[d]}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {MEAL_TIMES.map((t) => {
                const active = (dayTimes[d] || []).includes(t);
                return (
                  <button key={t} onClick={() => toggleTime(d, t)} style={{
                    padding: "6px 12px", borderRadius: 6, cursor: "pointer",
                    fontFamily: "var(--font)", fontSize: 12, fontWeight: 500,
                    background: active ? "var(--amber-soft)" : "var(--surface2)",
                    color: active ? "var(--amber)" : "var(--text3)",
                    border: active ? "1px solid rgba(249,168,37,0.35)" : "1px solid var(--border)",
                    transition: "all 0.15s",
                  }}>{t}</button>
                );
              })}
            </div>
          </div>
        ))}

        <button className="btn btn-primary" disabled={loading} onClick={handleSubmit}
          style={{ width: "100%", padding: "13px", fontSize: 15, marginTop: 8 }}>
          {loading ? "Saving..." : isEditMode ? "Update Medicine" : "Save Medicine"}
        </button>
      </div>
    </PageShell>
  );
}