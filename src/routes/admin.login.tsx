import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Home } from "lucide-react";
import { adminLogin } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const { ok, error } = await adminLogin(email.trim(), pw);
    setLoading(false);
    if (ok) {
      navigate({ to: "/admin/dashboard" });
    } else {
      setErr(error || "Login failed. Please check your email and password.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 bg-[var(--color-background)] text-[var(--color-text)]"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-6 p-8 rounded-2xl border border-black/10 bg-white shadow-xl"
      >
        <div className="text-center space-y-1">
          <h1
            className="text-2xl"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-accent)",
            }}
          >
            Staff Login — Stay Manila Diner
          </h1>
          <p className="text-xs text-black/60">
            Sign in with your admin account to manage the website.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-black/70">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            className="w-full px-4 py-2.5 rounded-md bg-black/5 border border-black/10 outline-none focus:border-[var(--color-accent)] text-[#1C1C1E] placeholder-black/40"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-black/70">Password</label>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Enter admin password"
            className="w-full px-4 py-2.5 rounded-md bg-black/5 border border-black/10 outline-none focus:border-[var(--color-accent)] text-[#1C1C1E] placeholder-black/40"
          />
          {err && <p className="text-sm text-red-600">{err}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-md text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "#ffffff",
          }}
        >
          {loading ? "Signing in…" : "Login"}
        </button>

        <Link
          to="/"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md text-sm font-medium border border-black/15 text-black/70 hover:bg-black/5 transition-colors"
        >
          <Home size={14} /> Go to Homepage
        </Link>
      </form>
    </div>
  );
}
