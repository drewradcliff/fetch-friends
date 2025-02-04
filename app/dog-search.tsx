"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
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
  const [comboBoxValue, setComboBoxValue] = useState("");
  const { data: breeds, isLoading: isBreedsLoading } = useSWR<string[]>(
    process.env.NEXT_PUBLIC_FETCH_API_URL + "/dogs/breeds",
    fetcher
  );

  const { data: search } = useSWR<SearchResult>(
    process.env.NEXT_PUBLIC_FETCH_API_URL +
      "/dogs/search" +
      (comboBoxValue ? `?breeds=${[comboBoxValue]}` : ""),
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

  if (isLoading || isBreedsLoading || !breeds) return <div>Loading...</div>;

  return (
    <div className="max-w-screen-lg mx-auto">
      <div className="flex flex-row gap-2 items-center py-4">
        <ComboBox
          breeds={breeds}
          comboBoxValue={comboBoxValue}
          setComboBoxValue={setComboBoxValue}
        />
      </div>
      <div className="grid grid-cols-4 gap-8">
        {dogs?.map(({ id, img, name, age, breed }) => (
          <div
            key={id}
            className="border border-gray-300 rounded-xl overflow-hidden flex flex-col items-center justify-center h-[300px]"
          >
            <div className="relative w-[200px] h-[200px]">
              <Image src={img} alt={name} fill className="object-cover" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="flex flex-row gap-2 items-center">
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

function ComboBox({
  breeds,
  comboBoxValue,
  setComboBoxValue,
}: {
  breeds: string[];
  comboBoxValue: string;
  setComboBoxValue: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <span className="truncate">
            {comboBoxValue
              ? breeds.find((b) => b === comboBoxValue)
              : "Select Breed"}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search Breeds" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {breeds.map((breed) => (
              <CommandItem
                key={breed}
                value={breed}
                onSelect={() => {
                  setComboBoxValue(breed);
                  setOpen(false);
                }}
              >
                {breed}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
