"use server";

import { cookies } from "next/headers";

export async function loginAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const res = await fetch(process.env.API_URL + "/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();

  if (!res.ok) return { error: data.error };

  (await cookies()).set("token", data.token, { httpOnly: true });
  (await cookies()).set("role", data.role, { httpOnly: true });

  return { success: true };
}
