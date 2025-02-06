"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const name = formData.get("name");
  const email = formData.get("email");

  const response = await fetch(process.env.FETCH_API_URL + "/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email }),
  });

  const cookieStore = await cookies();
  const setCookieHeader = response.headers.get("set-cookie");
  const fetchAccessToken = setCookieHeader
    ?.split(",")
    .find((cookie) => cookie.includes("fetch-access-token"));
  const fetchAccessTokenValue = fetchAccessToken?.split(";")[0].split("=")[1];

  if (fetchAccessTokenValue) {
    cookieStore.set("fetch-access-token", fetchAccessTokenValue, {
      expires: new Date(Date.now() + 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "none",
    });
  }

  if (response.ok) {
    redirect("/");
  }
}

export async function logout() {
  const cookieStore = await cookies();
  await fetch(process.env.FETCH_API_URL + "/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  cookieStore.delete("fetch-access-token");
  redirect("/login");
}
