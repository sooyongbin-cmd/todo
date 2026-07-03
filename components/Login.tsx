"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/AuthContext";

function friendlyError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "이메일 형식이 올바르지 않습니다.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "이메일 또는 비밀번호가 올바르지 않습니다.";
    case "auth/email-already-in-use":
      return "이미 가입된 이메일입니다.";
    case "auth/weak-password":
      return "비밀번호는 6자 이상이어야 합니다.";
    case "auth/popup-closed-by-user":
      return "로그인 창이 닫혔습니다. 다시 시도해주세요.";
    default:
      return "문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
}

export default function Login() {
  const { loginWithEmail, signUpWithEmail, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        await loginWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name.trim() || undefined);
      }
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      setError(friendlyError(code));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      setError(friendlyError(code));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <p className="font-mono text-xs tracking-[0.3em] text-muted mb-1">
          NO. 001 — DAILY LEDGER
        </p>
        <h1 className="font-mono text-3xl font-bold text-ink tracking-tight">
          TASKS
        </h1>
        <p className="text-sm text-muted mt-1">
          카드를 이어서 쓰려면 로그인하세요.
        </p>
      </div>

      <div className="bg-card border border-line rounded-md shadow-sm p-5 sm:p-6">
        {/* mode tabs */}
        <div className="flex mb-5 font-mono text-xs border border-line rounded-full p-0.5">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-full transition-colors ${
              mode === "signin"
                ? "bg-forest text-paper"
                : "text-muted hover:text-ink"
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-full transition-colors ${
              mode === "signup"
                ? "bg-forest text-paper"
                : "text-muted hover:text-ink"
            }`}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름 (선택)"
              className="bg-paper border border-line rounded px-3 py-2 text-sm outline-none focus-visible:border-forest"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            autoComplete="email"
            className="bg-paper border border-line rounded px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 (6자 이상)"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="bg-paper border border-line rounded px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />

          {error && (
            <p className="text-xs text-stamp font-mono leading-relaxed">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="bg-forest hover:bg-forestDark disabled:opacity-60 transition-colors text-paper font-mono text-sm px-4 py-2.5 rounded mt-1"
          >
            {busy ? "처리 중…" : mode === "signin" ? "로그인" : "계정 만들기"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-line" />
          <span className="text-[10px] font-mono text-muted tracking-widest">
            OR
          </span>
          <div className="flex-1 h-px bg-line" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 border border-line rounded px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper transition-colors disabled:opacity-60"
        >
          <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.4 6 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.4 6 29.5 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.4 0 10.2-1.8 13.9-5l-6.4-5.3C29.5 35.5 26.9 36.4 24 36.4c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.6 16.2 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.4 5.3C41.4 35.6 44 30.2 44 24c0-1.2-.1-2.4-.4-3.5z"
            />
          </svg>
          Google로 계속하기
        </button>
      </div>

      <p className="text-center text-[10px] font-mono tracking-widest text-muted/70 mt-6">
        FIREBASE AUTH · 데이터는 사용자별로 저장됩니다
      </p>
    </div>
  );
}
