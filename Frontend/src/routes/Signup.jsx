import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { client } from "../api/client";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password.trim()) return setError("Please fill all fields");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      const res = await client.post("/user/signup", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });
      if (res.status === 200 || res.status === 201) {
        navigate("/login", { replace: true, state: { message: "Account created! Please login." } });
      } else {
        setError("User already exists");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: 20,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 18, margin: "0 auto 16px",
            background: "linear-gradient(135deg, #43e97b, #38f9d7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, boxShadow: "0 0 20px rgba(67,233,123,0.3)",
          }}>🌱</div>
          <h1 style={{
            fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #43e97b, #38f9d7)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Create account</h1>
          <p style={{ color: "var(--text3)", marginTop: 6, fontSize: 14 }}>
            Start tracking your medicines today
          </p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={handleSignup}>
            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: "var(--radius-sm)",
                background: "var(--red-soft)", border: "1px solid rgba(245,87,108,0.25)",
                color: "var(--red)", fontSize: 13, marginBottom: 14,
              }}>{error}</div>
            )}

            <label style={{ fontSize: 13, color: "var(--text2)", display: "block", marginBottom: 6 }}>Full Name</label>
            <input className="input" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />

            <label style={{ fontSize: 13, color: "var(--text2)", display: "block", marginBottom: 6 }}>Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />

            <label style={{ fontSize: 13, color: "var(--text2)", display: "block", marginBottom: 6 }}>Password</label>
            <input className="input" type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", padding: "12px", fontSize: 15, marginTop: 4,
                background: "linear-gradient(135deg, #43e97b, #38f9d7)", color: "#0a2a1a" }}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, color: "var(--text3)", fontSize: 14 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}