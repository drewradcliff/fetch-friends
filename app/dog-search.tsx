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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState("asc");

  const { data: breeds, isLoading: isBreedsLoading } = useSWR<string[]>(
    process.env.NEXT_PUBLIC_FETCH_API_URL + "/dogs/breeds",
    fetcher
  );

  const { data: search, isLoading: isSearchLoading } = useSWR<SearchResult>(
    process.env.NEXT_PUBLIC_FETCH_API_URL +
      "/dogs/search" +
      (comboBoxValue ? `?breeds=${[comboBoxValue]}` : "") +
      `${comboBoxValue ? "&" : "?"}size=25&from=${
        (currentPage - 1) * 25
      }&sort=name:${sort}`,
    fetcher
  );

  const totalPages = Math.ceil((search?.total ?? 0) / 25);

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

  if (isLoading || isBreedsLoading || isSearchLoading || !breeds) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#f48852] border-t-transparent rounded-full animate-spin" />
          <p className="text-lg text-gray-600">Loading dogs...</p>
        </div>
      </div>
    );
  }

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className="max-w-screen-xl mx-auto flex flex-col gap-4 py-4">
      <div className="flex flex-row gap-2 items-center py-4">
        <ComboBox
          breeds={breeds}
          comboBoxValue={comboBoxValue}
          setComboBoxValue={setComboBoxValue}
        />
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-24 bg-white">
            <SelectValue placeholder="A-Z" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">A-Z</SelectItem>
            <SelectItem value="desc">Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-5 gap-8">
        {dogs?.map(({ id, img, name, age, breed }) => (
          <div
            key={id}
            className="border border-gray-300 rounded-xl overflow-hidden flex flex-col items-center justify-center h-[300px] bg-white"
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
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => {
                if (currentPage > 1) setCurrentPage(currentPage - 1);
              }}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {getPageNumbers().map((pageNum) => (
            <PaginationItem key={pageNum}>
              <PaginationLink
                className="cursor-pointer"
                onClick={() => setCurrentPage(pageNum)}
                isActive={currentPage === pageNum}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          ))}

          {currentPage < totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => {
                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
              }}
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
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
