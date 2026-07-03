"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

type Priority = "low" | "normal" | "high";

type Todo = {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
  createdAt: number;
};

type Filter = "all" | "active" | "done";

const PRIORITY_LABEL: Record<Priority, string> = {
  low: "낮음",
  normal: "보통",
  high: "긴급",
};

const PRIORITY_COLOR: Record<Priority, string> = {
  low: "bg-muted/20 text-muted",
  normal: "bg-forest/10 text-forest",
  high: "bg-stamp/10 text-stamp",
};

function todayStamp() {
  const d = new Date();
  const weekday = d.toLocaleDateString("ko-KR", { weekday: "short" });
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    weekday,
    year: d.getFullYear(),
  };
}

export default function TodoApp() {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loadingTodos, setLoadingTodos] = useState(true);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const stamp = useMemo(todayStamp, []);

  // subscribe to this user's todos in real time: users/{uid}/todos
  useEffect(() => {
    if (!user) return;
    const todosRef = collection(db, "users", user.uid, "todos");
    const q = query(todosRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Todo[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            text: data.text ?? "",
            done: Boolean(data.done),
            priority: (data.priority as Priority) ?? "normal",
            createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
          };
        });
        setTodos(items);
        setLoadingTodos(false);
      },
      () => setLoadingTodos(false)
    );
    return unsubscribe;
  }, [user]);

  const filtered = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((t) => !t.done);
      case "done":
        return todos.filter((t) => t.done);
      default:
        return todos;
    }
  }, [todos, filter]);

  const remaining = todos.filter((t) => !t.done).length;
  const doneCount = todos.length - remaining;

  async function addTodo(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const text = input.trim();
    if (!text) return;
    setInput("");
    const preservedPriority = priority;
    setPriority("normal");
    await addDoc(collection(db, "users", user.uid, "todos"), {
      text,
      done: false,
      priority: preservedPriority,
      createdAt: serverTimestamp(),
    });
  }

  async function toggleTodo(id: string, done: boolean) {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid, "todos", id), { done: !done });
  }

  async function deleteTodo(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "todos", id));
  }

  async function clearDone() {
    if (!user) return;
    const batch = writeBatch(db);
    todos
      .filter((t) => t.done)
      .forEach((t) => batch.delete(doc(db, "users", user.uid, "todos", t.id)));
    await batch.commit();
  }

  function startEdit(t: Todo) {
    setEditingId(t.id);
    setEditingText(t.text);
  }

  async function commitEdit(id: string) {
    if (!user) return;
    const text = editingText.trim();
    setEditingId(null);
    if (!text) {
      setEditingText("");
      return;
    }
    await updateDoc(doc(db, "users", user.uid, "todos", id), { text });
    setEditingText("");
  }

  return (
    <div className="w-full max-w-xl">
      {/* header / masthead */}
      <header className="flex items-start justify-between mb-8 gap-4">
        <div>
          <p className="font-mono text-xs tracking-[0.3em] text-muted mb-1">
            NO. 001 — DAILY LEDGER
          </p>
          <h1 className="font-mono text-3xl sm:text-4xl font-bold text-ink tracking-tight">
            TASKS
          </h1>
          <p className="text-sm text-muted mt-1">
            {user?.displayName || user?.email} 님의 카드
          </p>
        </div>

        {/* signature element: library due-date stamp */}
        <div
          className="stamp-mark shrink-0 select-none border-2 border-stamp text-stamp rounded-full w-20 h-20 sm:w-24 sm:h-24 flex flex-col items-center justify-center font-mono leading-none"
          aria-hidden="true"
        >
          <span className="text-[9px] tracking-widest">{stamp.weekday}</span>
          <span className="text-xl sm:text-2xl font-bold">{stamp.day}</span>
          <span className="text-[9px] tracking-widest">{stamp.month} {stamp.year}</span>
        </div>
      </header>

      {/* add form */}
      <form
        onSubmit={addTodo}
        className="bg-card border border-line rounded-md shadow-sm p-3 sm:p-4 mb-6 flex flex-col sm:flex-row gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="할 일을 입력하세요…"
          className="flex-1 bg-transparent outline-none text-ink placeholder:text-muted/70 px-1 py-2 font-sans"
          maxLength={200}
        />
        <div className="flex gap-2">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="bg-paper border border-line rounded px-2 py-2 text-sm font-mono text-ink"
            aria-label="우선순위"
          >
            <option value="low">낮음</option>
            <option value="normal">보통</option>
            <option value="high">긴급</option>
          </select>
          <button
            type="submit"
            className="bg-forest hover:bg-forestDark transition-colors text-paper font-mono text-sm px-4 py-2 rounded whitespace-nowrap"
          >
            추가
          </button>
        </div>
      </form>

      {/* filter / meta strip */}
      <div className="perforated pt-4 flex items-center justify-between mb-4 font-mono text-xs text-muted">
        <div className="flex gap-1">
          {(["all", "active", "done"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-full transition-colors ${
                filter === f
                  ? "bg-forest text-paper"
                  : "hover:bg-forest/10 text-muted"
              }`}
            >
              {f === "all" ? "전체" : f === "active" ? "진행중" : "완료"}
            </button>
          ))}
        </div>
        <span>
          {remaining}건 남음 · {doneCount}건 완료
        </span>
      </div>

      {/* list */}
      <ul className="flex flex-col gap-2">
        {loadingTodos && (
          <li className="text-center text-muted text-sm py-14">
            불러오는 중…
          </li>
        )}

        {!loadingTodos && filtered.length === 0 && (
          <li className="text-center text-muted text-sm py-14 border border-dashed border-line rounded-md">
            {todos.length === 0
              ? "카드가 비어 있습니다. 첫 번째 할 일을 적어보세요."
              : "이 목록에는 표시할 항목이 없습니다."}
          </li>
        )}

        {filtered.map((t) => (
          <li
            key={t.id}
            className="task-enter relative bg-card border border-line rounded-md px-3 sm:px-4 py-3 flex items-center gap-3 overflow-hidden"
          >
            <button
              onClick={() => toggleTodo(t.id, t.done)}
              aria-pressed={t.done}
              aria-label={t.done ? "완료 취소" : "완료로 표시"}
              className={`shrink-0 w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-colors ${
                t.done
                  ? "bg-forest border-forest text-paper"
                  : "border-ink/40 hover:border-forest"
              }`}
            >
              {t.done && (
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none">
                  <path
                    d="M3 8.5L6.2 11.5L13 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            <div className="flex-1 min-w-0">
              {editingId === t.id ? (
                <input
                  autoFocus
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={() => commitEdit(t.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit(t.id);
                    if (e.key === "Escape") {
                      setEditingId(null);
                      setEditingText("");
                    }
                  }}
                  className="w-full bg-transparent outline-none border-b border-forest text-ink py-0.5"
                />
              ) : (
                <button
                  onClick={() => startEdit(t)}
                  className={`text-left w-full truncate py-0.5 ${
                    t.done ? "text-muted line-through" : "text-ink"
                  }`}
                  title="클릭하여 수정"
                >
                  {t.text}
                </button>
              )}
              <span
                className={`inline-block mt-1 text-[10px] font-mono px-1.5 py-0.5 rounded ${PRIORITY_COLOR[t.priority]}`}
              >
                {PRIORITY_LABEL[t.priority]}
              </span>
            </div>

            <button
              onClick={() => deleteTodo(t.id)}
              aria-label="삭제"
              className="shrink-0 text-muted hover:text-stamp transition-colors font-mono text-sm px-1"
            >
              ×
            </button>

            {t.done && (
              <span
                aria-hidden="true"
                className="stamp-pop pointer-events-none absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 stamp-mark border-2 border-stamp text-stamp text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-sm opacity-70"
              >
                DONE
              </span>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => logout()}
          className="font-mono text-xs text-muted hover:text-stamp transition-colors underline underline-offset-2"
        >
          로그아웃
        </button>
        {doneCount > 0 && (
          <button
            onClick={clearDone}
            className="font-mono text-xs text-muted hover:text-stamp transition-colors underline underline-offset-2"
          >
            완료된 항목 지우기
          </button>
        )}
      </div>

      <footer className="mt-10 text-center font-mono text-[10px] tracking-widest text-muted/70">
        FIRESTORE · 사용자별로 안전하게 저장됩니다
      </footer>
    </div>
  );
}
