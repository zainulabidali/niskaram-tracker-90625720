import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const LoginPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-5xl">🕌</div>
          <h1 className="text-2xl font-display font-bold text-foreground">നിസ്കാരം ട്രാക്കർ</h1>
          <p className="text-xs text-muted-foreground">Daily Prayer Tracker</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-lg space-y-4">
          <h2 className="text-lg font-bold text-foreground text-center">
            {isSignup ? "അക്കൗണ്ട് ഉണ്ടാക്കുക" : "ലോഗിൻ"}
          </h2>

          {error && (
            <div className="text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2">{error}</div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">ഇമെയിൽ</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">പാസ്‌വേഡ്</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              minLength={6}
              className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
              placeholder="••••••"
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-lg transition-all active:scale-[0.97] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {isSignup ? "സൈൻ അപ്പ് ✨" : "ലോഗിൻ ✨"}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            {isSignup ? "ഇതിനകം അക്കൗണ്ട് ഉണ്ടോ?" : "അക്കൗണ്ട് ഇല്ലേ?"}{" "}
            <button type="button" onClick={() => { setIsSignup(!isSignup); setError(""); }}
              className="text-primary font-semibold hover:underline"
            >
              {isSignup ? "ലോഗിൻ" : "സൈൻ അപ്പ്"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
