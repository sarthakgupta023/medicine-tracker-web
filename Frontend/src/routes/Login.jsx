import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { client } from "../api/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) return setError("Please enter email and password");
    setLoading(true);
    try {
      const { data } = await client.post("/user/login", {
        email: email.trim(),
        password: password.trim(),
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userEmail", data.email || email.trim());
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/oauth2/authorization/google`;
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: 20,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 18, margin: "0 auto 16px",
            background: "linear-gradient(135deg, #4facfe, #00f2fe)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, boxShadow: "var(--accent-glow)",
          }}>💊</div>
          <h1 style={{
            fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #4facfe, #00f2fe)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Welcome back</h1>
          <p style={{ color: "var(--text3)", marginTop: 6, fontSize: 14 }}>
            Sign in to your MediTrack account
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 28 }}>
          {/* Google OAuth2 */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            style={{
              width: "100%", padding: "12px 16px",
              background: "var(--bg2)", border: "1px solid var(--border2)",
              borderRadius: "var(--radius-sm)", color: "var(--text)",
              fontFamily: "var(--font)", fontSize: 15, fontWeight: 500,
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 10, marginBottom: 20,
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
            onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--border2)"}
          >
            {googleLoading ? (
              <span style={{ color: "var(--text2)" }}>Redirecting...</span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="divider">or sign in with email</div>

          <form onSubmit={handleLogin}>
            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: "var(--radius-sm)",
                background: "var(--red-soft)", border: "1px solid rgba(245,87,108,0.25)",
                color: "var(--red)", fontSize: 13, marginBottom: 14,
              }}>
                {error}
              </div>
            )}

            <label style={{ fontSize: 13, color: "var(--text2)", display: "block", marginBottom: 6 }}>Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <label style={{ fontSize: 13, color: "var(--text2)", display: "block", marginBottom: 6 }}>Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", padding: "12px", fontSize: 15, marginTop: 4 }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, color: "var(--text3)", fontSize: 14 }}>
          No account?{" "}
          <Link to="/signup" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}