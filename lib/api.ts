// ---------------------------------------------------------------------------
// Types — mirror the Laravel DB schema
// ---------------------------------------------------------------------------

export type Option = {
  id: number;
  option_text: string;
  point: number;        // 0 or 1; A-options (kuliah) = 1, B-options (kerja) = 0
};

export type Question = {
  id: number;
  question_text: string;
  options: Option[];
};

export type Quiz = {
  id: number;
  title: string;
  description: string | null;
  questions: Question[];
};

export type QuizGrade = {
  id: number;
  min_point: number;
  label: string;         // e.g. "Kuliah" | "Kerja"
};

export type SubmitPayload = {
  quiz_id: number;
  answers: { option_id: number }[];
  total_point: number;
};

export type SubmitResult = {
  status: string;
  grade: string;
  total_point: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { headers: extra, ...rest } = init ?? {};
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(extra as Record<string, string> | undefined),
    },
    ...rest,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Public quiz endpoints
// NOTE: These routes do not exist yet on the backend.
// The backend team needs to add:
//   GET  /api/quizzes/{id}    → returns Quiz with nested questions + options (no auth)
//   POST /api/quiz-results    → accepts SubmitPayload, returns SubmitResult (no auth / nullable user_id)
// ---------------------------------------------------------------------------

/** Fetch a quiz with all its questions and options. Throws if the endpoint is not available. */
export async function getQuiz(quizId: number): Promise<Quiz> {
  const body = await apiFetch<{ status: string; data: Quiz }>(`/api/public/quizzes/${quizId}`);
  return body.data;
}

/** Submit quiz answers to the backend. Throws if the endpoint is not available. */
export async function submitQuizResult(payload: SubmitPayload): Promise<SubmitResult> {
  return apiFetch<SubmitResult>("/api/quiz-results", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ---------------------------------------------------------------------------
// Admin API
// ---------------------------------------------------------------------------

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: number;
};

export type AdminLoginResponse = {
  token: string;
  user: AdminUser;
};

function adminFetch<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  return apiFetch<T>(path, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init?.headers as Record<string, string> | undefined) },
  });
}

export async function adminLogin(email: string, password: string): Promise<AdminLoginResponse> {
  const body = await apiFetch<{ status: string; data: AdminLoginResponse }>("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return body.data;
}

export async function adminLogout(token: string): Promise<void> {
  await adminFetch("/api/logout", token, { method: "POST" });
}

export async function adminGetQuizzes(token: string): Promise<Quiz[]> {
  const body = await adminFetch<{ status: string; data: Quiz[] }>("/api/admin/quizzes", token);
  return body.data;
}

export async function adminGetQuiz(token: string, id: number): Promise<Quiz> {
  const body = await adminFetch<{ status: string; data: Quiz }>(`/api/admin/quizzes/${id}`, token);
  return body.data;
}

export async function adminCreateQuiz(
  token: string,
  payload: { title: string; description?: string }
): Promise<Quiz> {
  const body = await adminFetch<{ status: string; data: Quiz }>("/api/admin/quizzes", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return body.data;
}

export async function adminCreateQuestion(
  token: string,
  payload: { quiz_id: number; question_text: string; options: { option_text: string; point: number }[] }
): Promise<Question> {
  const body = await adminFetch<{ status: string; data: Question }>("/api/admin/questions", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return body.data;
}

export async function adminUpdateQuestion(
  token: string,
  id: number,
  payload: { question_text: string }
): Promise<Question> {
  const body = await adminFetch<{ status: string; data: Question }>(`/api/admin/questions/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return body.data;
}

export async function adminUpdateOption(
  token: string,
  id: number,
  payload: { option_text: string }
): Promise<Option> {
  const body = await adminFetch<{ status: string; data: Option }>(`/api/admin/options/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return body.data;
}

export type EmailPayload = {
  email: string;
  score: number;
  total: number;
  grade: string;
};

/** Send quiz result to user's email. Throws if the endpoint is not available. */
export async function sendResultEmail(payload: EmailPayload): Promise<{ status: string }> {
  return apiFetch<{ status: string }>("/api/send-result", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
