import { cookies } from "next/headers";

const COOKIE = "todo_uid";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// Each browser gets an anonymous id so visitors only ever see their own tasks.
export async function getUserId() {
  const jar = await cookies();
  const existing = jar.get(COOKIE)?.value;
  if (existing && UUID_RE.test(existing)) return { uid: existing, isNew: false };

  const uid = crypto.randomUUID();
  jar.set(COOKIE, uid, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return { uid, isNew: true };
}
