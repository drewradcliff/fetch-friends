"use client";

import { FormEvent, useState } from "react";
import { login } from "@/actions";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name");
    const email = formData.get("email");

    try {
      setIsLoading(true);
      await fetch(process.env.NEXT_PUBLIC_FETCH_API_URL + "/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });
      await login(formData);
    } catch (error) {
      console.error(error);
      setError("Login failed");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold pb-4">Login</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center justify-center gap-4"
      >
        <input
          className="border-2 border-gray-300 rounded-md p-2"
          type="text"
          placeholder="Name"
          required
          name="name"
        />
        <input
          type="email"
          placeholder="Email"
          className="border-2 border-gray-300 rounded-md p-2"
          required
          name="email"
        />
        <Button
          className="bg-[#ffbf54] text-white w-full hover:bg-[#ffbf54]/90"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login"}
        </Button>
      </form>
    </div>
  );
}
