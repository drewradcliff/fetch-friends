"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const name = formData.get("name");
  const email = formData.get("email");

  const response = await fetch(
    "https://frontend-take-home-service.fetch.com/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email }),
    }
  );

  const cookieStore = await cookies();
  const setCookieHeader = response.headers.get("set-cookie");
  const fetchAccessToken = setCookieHeader
    ?.split(",")
    .find((cookie) => cookie.includes("fetch-access-token"));
  const fetchAccessTokenValue = fetchAccessToken?.split(";")[0].split("=")[1];

  if (fetchAccessTokenValue) {
    cookieStore.set("fetch-access-token", fetchAccessTokenValue, {
      expires: new Date(Date.now() + 60 * 60 * 1000),
    });
  }

  if (!response.ok) {
    throw new Error("Login failed");
  }

  redirect("/");
}
