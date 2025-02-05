import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fetcher = (url: string, options: RequestInit = {}) =>
  fetch(process.env.NEXT_PUBLIC_FETCH_API_URL + url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  }).then((res) => res.json());
