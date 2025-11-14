import { NextRequest, NextResponse } from "next/server";

type LoginBody = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

const users = [
  { email: "trainee@example.com", password: "123456", role: "trainee" },
  { email: "supervisor@example.com", password: "123456", role: "supervisor" },
  { email: "admin@example.com", password: "123456", role: "admin" },
];

export async function POST(req: NextRequest) {
  const body: LoginBody = await req.json();

  const user = users.find(
    (u) => u.email === body.email && u.password === body.password
  );

  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ message: "Login success", role: user.role });

  const maxAge = body.rememberMe ? 60 * 60 * 24 * 7 : 60 * 60;
  const token = `${user.email}-${Date.now()}`;

  res.cookies.set({
    name: "role",
    value: user.role,
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    maxAge,
  });

  res.cookies.set({
    name: "token",
    value: token,
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    maxAge,
  });

  return res;
}
