"use client";

import { FormEvent, useState } from "react";
import { login } from "@/actions";

export default function Login() {
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    // const name = formData.get("name");
    // const email = formData.get("email");

    try {
      await login(formData);
      // const response = await fetch(
      //   process.env.NEXT_PUBLIC_FETCH_API_URL + "/auth/login",
      //   {
      //     credentials: "include",
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({ name, email }),
      //   }
      // );
      // console.log(response);
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
          type="text"
          placeholder="Email"
          className="border-2 border-gray-300 rounded-md p-2"
          required
          name="email"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
          Login
        </button>
      </form>
    </div>
  );
}
