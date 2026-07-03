"use client";

import { useAuth } from "@/lib/AuthContext";
import Login from "@/components/Login";
import TodoApp from "@/components/TodoApp";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <main className="min-h-screen flex justify-center px-4 py-10 sm:py-16">
      {loading ? (
        <p className="font-mono text-sm text-muted self-center">
          불러오는 중…
        </p>
      ) : user ? (
        <TodoApp />
      ) : (
        <Login />
      )}
    </main>
  );
}
