"use client";

import { useState } from "react";
import { useFavorites } from "@/providers/favorites-context";
import { fetcher } from "@/lib/utils";
import { Dog, Match } from "@/types";
import useSWRImmutable from "swr/immutable";
import Header from "../header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon } from "lucide-react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";

export default function Favorites() {
  const { favorites } = useFavorites();
  const [showMatches, setShowMatches] = useState(false);
  const { data, isLoading } = useSWRImmutable<Dog[]>(
    favorites.length > 0 ? ["/dogs", favorites] : null,
    ([url, favorites]) =>
      fetcher(url, {
        method: "POST",
        body: JSON.stringify(favorites),
      })
  );

  return (
    <>
      <Header />
      <div className="max-w-screen-sm mx-auto flex flex-col py-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold py-4">
            {showMatches ? "Your Matches" : "Find your match"}
          </h1>
          <Button
            variant="outline"
            onClick={() => setShowMatches(!showMatches)}
          >
            {showMatches ? "Back to Swiping" : "View Matches"}
          </Button>
        </div>
        {!showMatches && (
          <p className="text-gray-600">
            Swipe left to remove, swipe right to check if you match
          </p>
        )}
      </div>
      {showMatches ? (
        <MatchesList />
      ) : isLoading ? (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-[#f48852] border-t-transparent rounded-full animate-spin" />
            <p className="text-lg text-gray-600">Loading favorites...</p>
          </div>
        </div>
      ) : data ? (
        <DogList dogs={data} />
      ) : (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4">
          <p className="text-lg text-gray-600">No favorites</p>
          <Link href="/">
            <Button variant="outline">Go to dogs list</Button>
          </Link>
        </div>
      )}
    </>
  );
}

function MatchesList() {
  const { matches, removeMatch } = useFavorites();
  const { data, isLoading } = useSWR<Dog[]>(
    matches.length > 0 ? ["/dogs", matches] : null,
    ([url, matches]) =>
      fetcher(url, {
        method: "POST",
        body: JSON.stringify(matches),
      })
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#f48852] border-t-transparent rounded-full animate-spin" />
          <p className="text-lg text-gray-600">Loading matches...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4">
        <p className="text-lg text-gray-600">No matches yet</p>
        <p className="text-gray-500">
          Keep swiping to find your perfect match!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-screen-sm mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 pb-8">
      {data.map((dog) => (
        <div
          key={dog.id}
          className="bg-white rounded-lg shadow-md overflow-hidden relative group"
        >
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => removeMatch(dog.id)}
          >
            Remove Match
          </Button>
          <div
            className="h-48 bg-cover bg-center"
            style={{ backgroundImage: `url(${dog.img})` }}
          />
          <div className="p-4">
            <h2 className="text-xl font-bold">{dog.name}</h2>
            <p className="text-gray-600">{dog.breed}</p>
            <p className="text-gray-600">{dog.age} years old</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DogList({ dogs }: { dogs: Dog[] }) {
  const { matches, addMatch, removeMatch, removeFavorite } = useFavorites();
  const [swipeList, setSwipeList] = useState<Dog[]>(dogs);
  const [showConfetti, setShowConfetti] = useState(false);

  const { data } = useSWRImmutable<Match>(
    ["/dogs/match", swipeList],
    ([url, matchList]) =>
      fetcher(url, { method: "POST", body: JSON.stringify(matchList) })
  );

  const handleDragEnd = async (
    event: unknown,
    info: { offset: { x: number } },
    index: number
  ) => {
    const swipe = info.offset.x;
    const swipeThreshold = window.innerWidth / 4;

    if (Math.abs(swipe) > swipeThreshold) {
      if (swipe > 0) {
        // Swiped right
        if (data?.match.id === swipeList[index].id) {
          setShowConfetti(true);
          setTimeout(() => {
            setShowConfetti(false);
            addMatch(swipeList[index].id);
            setSwipeList((prev) =>
              prev.filter((dog) => dog.id !== swipeList[index].id)
            );
            removeFavorite(swipeList[index].id);
          }, 2000);
        } else {
          setSwipeList((prev) =>
            prev.filter((dog) => dog.id !== swipeList[index].id)
          );
          removeFavorite(swipeList[index].id);
        }
      } else {
        // Swiped left
        setSwipeList((prev) =>
          prev.filter((dog) => dog.id !== swipeList[index].id)
        );
        removeFavorite(swipeList[index].id);
        removeMatch(swipeList[index].id);
      }
    }
  };

  return (
    <div className="relative h-[500px] w-full max-w-[300px] mx-auto">
      {showConfetti && (
        <motion.div className="fixed inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2.5 h-2.5 rounded-full"
              initial={{
                top: "50%",
                left: "50%",
                scale: 0,
                backgroundColor: `hsl(${Math.random() * 360}, 80%, 60%)`,
              }}
              animate={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                scale: 1,
                rotate: Math.random() * 360,
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {swipeList.map((dog, index) => (
          <motion.div
            key={dog.id}
            className="absolute w-full h-full"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              x: Math.random() > 0.5 ? 1000 : -1000,
              opacity: 0,
              transition: { duration: 0.3 },
            }}
          >
            <motion.div
              className="w-full h-full rounded-lg overflow-hidden shadow-md cursor-grab"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(_, info) => handleDragEnd(_, info, index)}
              style={{
                backgroundImage: `url(${dog.img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              whileDrag={{ scale: 1.1 }}
            >
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent text-white">
                {matches.includes(dog.id) && (
                  <p className="text-md text-blue-500 flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    Match
                  </p>
                )}
                <h2 className="text-xl font-bold">{dog.name}</h2>
                <p>{dog.breed}</p>
                <p>{dog.age} years old</p>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
