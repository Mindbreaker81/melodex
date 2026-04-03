"use server";

import { cookies } from "next/headers";
import { db } from "@/db";
import { families } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "melodex-family";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function createFamily(pin: string) {
  const pinHash = await bcrypt.hash(pin, 10);
  const [family] = await db.insert(families).values({ pinHash }).returning();
  await setFamilyCookie(family.id);
  return family.id;
}

export async function loginWithPin(pin: string): Promise<string | null> {
  const allFamilies = await db.select().from(families);
  for (const family of allFamilies) {
    if (await bcrypt.compare(pin, family.pinHash)) {
      await setFamilyCookie(family.id);
      return family.id;
    }
  }
  return null;
}

export async function getFamilyId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

async function setFamilyCookie(familyId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, familyId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
