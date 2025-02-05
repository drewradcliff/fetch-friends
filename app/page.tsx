import Link from "next/link";
import { logout } from "@/actions";
import DogSearch from "./dog-search";

export default async function Home() {
  async function handleLogout() {
    "use server";
    await logout();
  }

  return (
    <div>
      <header className="flex items-center justify-between py-4 px-8 bg-[#6a1a62] text-white">
        <Link className="text-3xl" href="/">
          fetch friends
        </Link>
        <nav>
          <button onClick={handleLogout}>Logout</button>
        </nav>
      </header>
      <main>
        <DogSearch />
      </main>
    </div>
  );
}
