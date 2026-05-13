import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return NextResponse.json({ error: "Email already exists." }, { status: 409 });
    const passwordHash = await hashPassword(body.password);
    await prisma.user.create({
      data: { name: body.name, email: body.email, passwordHash, role: "USER" }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid registration data." }, { status: 400 });
    }
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
