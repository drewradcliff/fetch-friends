"use client";

import { ComboBox } from "@/components/combobox";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFavorites } from "@/providers/favorites-context";
import { Heart } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import useSWR from "swr";
import Header from "./header";
import { fetcher } from "@/lib/utils";
import { SearchResult, Dog } from "@/types";

export default function Home() {
  const [comboBoxValue, setComboBoxValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState("asc");
  const { favorites, addFavorite, removeFavorite } = useFavorites();

  const { data: breeds, isLoading: isBreedsLoading } = useSWR<string[]>(
    "/dogs/breeds",
    fetcher
  );

  const { data: search, isLoading: isSearchLoading } = useSWR<SearchResult>(
    ["/dogs/search", comboBoxValue, currentPage, sort],
    ([url, comboBoxValue, currentPage, sort]: [
      string,
      string,
      number,
      string
    ]) =>
      fetcher(
        url +
          (comboBoxValue ? `?breeds=${[comboBoxValue]}` : "") +
          `${comboBoxValue ? "&" : "?"}size=25&from=${
            (currentPage - 1) * 25
          }&sort=name:${sort}`
      )
  );

  const totalPages = Math.ceil((search?.total ?? 0) / 25);

  const { data: dogs, isLoading } = useSWR<Dog[]>(
    () => (search?.resultIds.length ? ["/dogs", search.resultIds] : null),
    ([url, resultIds]) =>
      fetcher(url, {
        method: "POST",
        body: JSON.stringify(resultIds),
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
    <>
      <Header />
      <div className="max-w-screen-xl mx-auto flex flex-col gap-4 py-4">
        <div className="flex flex-row gap-2 items-center py-4">
          <ComboBox
            data={breeds}
            placeholder="Select Breed"
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
              className="border border-gray-300 rounded-xl flex flex-col gap-2 justify-center bg-white py-2"
            >
              <div className="flex items-center justify-between px-3">
                <span className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{name}</h3>
                  <p>{age}</p>
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (favorites.includes(id)) {
                      removeFavorite(id);
                    } else {
                      addFavorite(id);
                    }
                  }}
                  className={`p-2 hover:bg-gray-50 rounded-full transition-colors group`}
                >
                  <Heart
                    fill={favorites.includes(id) ? "currentColor" : "none"}
                    className={`w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors ${
                      favorites.includes(id) ? "text-red-500" : ""
                    }`}
                  />
                </Button>
              </div>
              <div className="relative w-[200px] h-[200px] mx-auto">
                <Image
                  src={img}
                  alt={name}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-2 px-3">
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
    </>
  );
}
