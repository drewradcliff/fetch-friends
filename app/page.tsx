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
      <header className="flex items-center justify-between p-4 bg-gray-100">
        <Link className="text-2xl font-bold" href="/">
          Fetch Friends
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
