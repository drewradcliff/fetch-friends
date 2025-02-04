"use client";

import Image from "next/image";
import useSWR from "swr";

type SearchResult = {
  next: string;
  prev?: string;
  resultIds: string[];
  total: number;
};

type Dog = {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
};

const fetcher = (url: string, options: RequestInit = {}) =>
  fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  }).then((res) => res.json());

export default function DogSearch() {
  // const { data: breeds } = useSWR<string[]>(
  //   process.env.NEXT_PUBLIC_FETCH_API_URL + "/dogs/breeds",
  //   fetcher
  // );

  const { data: search } = useSWR<SearchResult>(
    process.env.NEXT_PUBLIC_FETCH_API_URL + "/dogs/search",
    fetcher
  );

  const { data: dogs, isLoading } = useSWR<Dog[]>(
    () =>
      search?.resultIds.length
        ? process.env.NEXT_PUBLIC_FETCH_API_URL + "/dogs"
        : null,
    (url: string) =>
      fetcher(url, {
        method: "POST",
        body: JSON.stringify(search?.resultIds),
      })
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="grid grid-cols-5 gap-4">
        {dogs?.map(({ id, img, name, age, breed }) => (
          <div
            key={id}
            className="border border-gray-300 rounded-md overflow-hidden p-4 flex flex-col items-center justify-center h-[300px]"
          >
            <div className="relative w-[200px] h-[200px]">
              <Image src={img} alt={name} fill className="object-cover" />
            </div>
            <div className="flex flex-col gap-2">
              <span>
                <h3 className="text-lg font-bold">{name}</h3>
                <p>{age}</p>
              </span>
              <p className="text-sm text-gray-500">{breed}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
