// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Option = {
  id: number;
  option_text: string;
  point: number;
};

export type Question = {
  id: number;
  question_text: string;
  options: Option[];
  quiz?: { id: number; title: string };
};

export type Quiz = {
  id: number;
  title: string;
  description: string | null;
  questions: Question[];
  questions_count?: number;
  author?: { name: string };
};

export type QuizGrade = {
  id: number;
  quiz_id: number;
  label: string;
  min_point: number;
  max_point: number;
};

export type PublicQuizListItem = {
  id: number;
  title: string;
  description: string | null;
  questions_count: number;
  has_grades: boolean;
  author?: { name: string };
};

export type PublicQuizResult = {
  score: number;
  grade_label?: string;
  min_point?: number;
  max_point?: number;
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

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  banned_at?: string | null;
};

export type AdminLoginResponse = {
  token: string;
  user: AdminUser;
};

export type AdminEntry = {
  id: number;
  name: string;
  email: string;
  role: string;
  banned_at: string | null;
};

export type EmailPayload = {
  email: string;
  score: number;
  total: number;
  grade: string;
};

// ---------------------------------------------------------------------------
// Core fetch helpers
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

function adminFetch<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  return apiFetch<T>(path, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init?.headers as Record<string, string> | undefined) },
  });
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export async function getProfile(token: string): Promise<AdminUser> {
  const body = await adminFetch<{ user: AdminUser }>("/api/profile", token);
  return body.user;
}

export async function updateProfile(
  token: string,
  payload: {
    name: string;
    email: string;
    current_password?: string;
    new_password?: string;
    new_password_confirmation?: string;
  }
): Promise<AdminUser> {
  const body = await adminFetch<{ user: AdminUser }>("/api/profile", token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return body.user;
}

export async function deleteProfile(token: string): Promise<void> {
  await adminFetch("/api/profile", token, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Quizzes — admin
// ---------------------------------------------------------------------------

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

export async function adminUpdateQuiz(
  token: string,
  id: number,
  payload: { title: string; description?: string }
): Promise<Quiz> {
  const body = await adminFetch<{ status: string; data: Quiz }>(`/api/admin/quizzes/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return body.data;
}

export async function adminDeleteQuiz(token: string, id: number): Promise<void> {
  await adminFetch(`/api/admin/quizzes/${id}`, token, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Quiz Grades — admin
// ---------------------------------------------------------------------------

export async function adminGetQuizGrades(token: string, quizId: number): Promise<QuizGrade[]> {
  const body = await adminFetch<{ status: string; data: QuizGrade[] }>(`/api/admin/quizzes/${quizId}/grades`, token);
  return body.data;
}

export async function adminCreateQuizGrade(
  token: string,
  payload: { quiz_id: number; label: string; min_point: number; max_point: number }
): Promise<QuizGrade> {
  const { quiz_id, ...rest } = payload;
  const body = await adminFetch<{ status: string; data: QuizGrade }>(`/api/admin/quizzes/${quiz_id}/grades`, token, {
    method: "POST",
    body: JSON.stringify(rest),
  });
  return body.data;
}

export async function adminUpdateQuizGrade(
  token: string,
  id: number,
  payload: { label?: string; min_point?: number; max_point?: number }
): Promise<QuizGrade> {
  const body = await adminFetch<{ status: string; data: QuizGrade }>(`/api/admin/grades/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return body.data;
}

export async function adminDeleteQuizGrade(token: string, id: number): Promise<void> {
  await adminFetch(`/api/admin/grades/${id}`, token, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Questions — admin
// ---------------------------------------------------------------------------

export async function adminGetQuestions(token: string): Promise<Question[]> {
  const body = await adminFetch<{ status: string; data: Question[] }>("/api/admin/questions", token);
  return body.data;
}

export async function adminGetQuestion(token: string, id: number): Promise<Question> {
  const body = await adminFetch<{ status: string; data: Question }>(`/api/admin/questions/${id}`, token);
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

export async function adminDeleteQuestion(token: string, id: number): Promise<void> {
  await adminFetch(`/api/admin/questions/${id}`, token, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Options — admin
// ---------------------------------------------------------------------------

export async function adminCreateOption(
  token: string,
  payload: { question_id: number; option_text: string; point: number }
): Promise<Option> {
  const body = await adminFetch<{ status: string; data: Option }>("/api/admin/options", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return body.data;
}

export async function adminUpdateOption(
  token: string,
  id: number,
  payload: { option_text: string; point?: number }
): Promise<Option> {
  const body = await adminFetch<{ status: string; data: Option }>(`/api/admin/options/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return body.data;
}

export async function adminDeleteOption(token: string, id: number): Promise<void> {
  await adminFetch(`/api/admin/options/${id}`, token, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Superadmin — Admin management
// ---------------------------------------------------------------------------

export async function superadminGetAdmins(token: string): Promise<AdminEntry[]> {
  const body = await adminFetch<{ status: string; data: AdminEntry[] }>("/api/superadmin/admins", token);
  return body.data;
}

export async function superadminCreateAdmin(
  token: string,
  payload: { name: string; email: string; password: string; password_confirmation: string }
): Promise<AdminEntry> {
  const body = await adminFetch<{ status: string; data: AdminEntry }>("/api/superadmin/admins", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return body.data;
}

export async function superadminGetAdmin(token: string, id: number): Promise<AdminEntry> {
  const body = await adminFetch<{ status: string; data: AdminEntry }>(`/api/superadmin/admins/${id}`, token);
  return body.data;
}

export async function superadminDeleteAdmin(token: string, id: number): Promise<void> {
  await adminFetch(`/api/superadmin/admins/${id}`, token, { method: "DELETE" });
}

export async function superadminGetAdminQuizzes(token: string, id: number): Promise<Quiz[]> {
  const body = await adminFetch<{ status: string; data: Quiz[] }>(`/api/superadmin/admins/${id}/quizzes`, token);
  return body.data;
}

export async function superadminToggleBan(token: string, id: number): Promise<AdminEntry> {
  const body = await adminFetch<{ status: string; data: AdminEntry }>(`/api/superadmin/admins/${id}/ban`, token, {
    method: "PATCH",
  });
  return body.data;
}

export async function superadminDeleteAdminQuiz(token: string, id: number): Promise<void> {
  await adminFetch(`/api/superadmin/admins/quizzes/${id}`, token, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Public quiz
// ---------------------------------------------------------------------------

export async function getPublicQuizzes(): Promise<PublicQuizListItem[]> {
  const body = await apiFetch<{ status: string; data: PublicQuizListItem[] }>("/api/public/quizzes");
  return body.data;
}

export async function getPublicQuiz(id: number): Promise<Quiz> {
  const body = await apiFetch<{ status: string; data: Quiz }>(`/api/public/quizzes/${id}`);
  return body.data;
}

export async function submitPublicQuiz(id: number, answers: number[]): Promise<PublicQuizResult> {
  const body = await apiFetch<{ status: string; data: PublicQuizResult }>(`/api/public/quizzes/${id}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
  return body.data;
}

export async function sendResultEmail(payload: EmailPayload): Promise<{ status: string }> {
  return apiFetch<{ status: string }>("/api/send-result", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ---------------------------------------------------------------------------
// Quiz Grades — public
// ---------------------------------------------------------------------------

export async function getQuizGrades(quizId: number): Promise<QuizGrade[]> {
  const body = await apiFetch<{ status: string; data: QuizGrade[] }>(`/api/public/quizzes/${quizId}/grades`);
  return body.data;
}
