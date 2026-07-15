"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  adminPublicPath,
  encodeAdminSession,
  verifyAdminCredentials,
} from "@/lib/admin";

export type AdminLoginState = {
  error: string | null;
};

export async function adminLogin(
  _prev: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  try {
    if (!verifyAdminCredentials(username, password)) {
      return { error: "Invalid username or password" };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Configuration error";
    return { error: message };
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, encodeAdminSession(), await adminCookieOptions());
  redirect(adminPublicPath());
}

export async function adminLogout() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, "", { ...(await adminCookieOptions(0)), maxAge: 0 });
  redirect(adminPublicPath());
}
