import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import { supabase } from "../lib/supabase";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkExistingSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: admin, error: adminError } =
          await supabase
            .from("admin_users")
            .select("user_id")
            .eq("user_id", session.user.id)
            .maybeSingle();

        if (admin && !adminError) {
          navigate("/admin", { replace: true });
          return;
        }
      }

      setCheckingSession(false);
    }

    checkExistingSession();
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        console.error("Login error:", loginError);

        setError(
          "Invalid email or password."
        );

        return;
      }

      const user = data.user;

      if (!user) {
        setError("Unable to authenticate.");
        return;
      }

      const { data: admin, error: adminError } =
        await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

      if (adminError) {
        console.error(
          "Admin verification error:",
          adminError
        );

        await supabase.auth.signOut();

        setError(
          "Unable to verify administrator access."
        );

        return;
      }

      if (!admin) {
        await supabase.auth.signOut();

        setError(
          "This account does not have administrator access."
        );

        return;
      }

      navigate("/admin", { replace: true });
    } catch (error) {
      console.error("Unexpected login error:", error);

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <>
        <AdminNavbar />

        <main className="admin-auth-page">
          <div className="admin-auth-loading">
            Checking access...
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />

      <main className="admin-auth-page">
        <section className="admin-auth-card">

          <p className="section-eyebrow">
            THE M TOUCH
          </p>

          <h1>Admin</h1>

          <p className="admin-auth-description">
            Sign in to manage your store.
          </p>

          <form
            className="admin-login-form"
            onSubmit={handleSubmit}
          >

            <div className="form-group">
              <label htmlFor="admin-email">
                Email
              </label>

              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Admin email"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-password">
                Password
              </label>

              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Password"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="admin-auth-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="admin-login-button"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign in"}

              <span>→</span>
            </button>

          </form>

          <Link
            to="/"
            className="admin-back-link"
          >
            ← Back to store
          </Link>

        </section>
      </main>
    </>
  );
}

export default AdminLogin;