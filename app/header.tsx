"use client";

import { logout } from "@/actions";
import Link from "next/link";

export default function Header() {
  async function handleLogout() {
    await logout();
  }

  return (
    <header className="flex items-center justify-between py-4 px-12 bg-[#6a1a62] text-white">
      <Link className="text-3xl" href="/">
        fetch friends
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/favorites">Favorites</Link>
        <Link href="/faq">FAQ</Link>
        <nav>
          <button onClick={handleLogout}>Logout</button>
        </nav>
      </div>
    </header>
  );
}
