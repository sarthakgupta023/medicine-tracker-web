import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Processing...");

  useEffect(() => {
    const token = params.get("token");
    const userId = params.get("userId");
    const email = params.get("email");
    const error = params.get("error");

    if (error) {
      setStatus("Google login failed. Redirecting...");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
      return;
    }

    if (token && userId) {
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("userEmail", email || "");
      setStatus("Login successful! Redirecting...");
      setTimeout(() => navigate("/home", { replace: true }), 500);
    } else {
      setStatus("Something went wrong. Redirecting...");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    }
  }, [params, navigate]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 20,
    }}>
      <div style={{
        width: 60, height: 60, borderRadius: 18,
        background: "linear-gradient(135deg, #4facfe, #00f2fe)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, animation: "pulse-glow 2s infinite",
      }}>💊</div>
      <p style={{ color: "var(--text2)", fontSize: 16 }}>{status}</p>
    </div>
  );
}