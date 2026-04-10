import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isSessionValid } from "../utils/session";

export default function Splash() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setProgress((p) => Math.min(p + 8, 95)), 80);

    const t = setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      setTimeout(() => {
        if (isSessionValid(token, userId)) {
          navigate("/home", { replace: true });
        } else {
          localStorage.clear();
          navigate("/login", { replace: true });
        }
      }, 300);
    }, 1400);

    return () => { clearTimeout(t); clearInterval(interval); };
  }, [navigate]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 32,
      background: "var(--bg)",
    }}>
      {/* Logo */}
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 80, height: 80, borderRadius: 24, margin: "0 auto 20px",
          background: "linear-gradient(135deg, #4facfe, #00f2fe)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, boxShadow: "0 0 40px rgba(79,172,254,0.4)",
          animation: "pulse-glow 2s infinite",
        }}>💊</div>
        <h1 style={{
          fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em",
          background: "linear-gradient(135deg, #4facfe, #00f2fe)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          MediTrack
        </h1>
        <p style={{ color: "var(--text3)", fontSize: 14, marginTop: 6 }}>
          Your personal medicine companion
        </p>
      </div>

      {/* Progress */}
      <div style={{ width: 200 }}>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}