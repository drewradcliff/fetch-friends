"use client";

import { useState, useEffect } from "react";
import { useSprings, animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { useFavorites } from "@/providers/favorites-context";
import { fetcher } from "@/lib/utils";
import { Dog, Match } from "@/types";
import useSWRImmutable from "swr/immutable";
import Header from "../header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon } from "lucide-react";

const to = (i: number) => ({
  x: 0,
  y: i * -10,
  scale: 1,
  rot: -10 + Math.random() * 20,
  delay: i * 100,
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });
const trans = (r: number, s: number) =>
  `perspective(1500px) rotateX(30deg) rotateY(${
    r / 10
  }deg) rotateZ(${r}deg) scale(${s})`;

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
  const { data, isLoading } = useSWRImmutable<Dog[]>(
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
  const [gone] = useState(() => new Set());
  const { favorites, removeFavorite, matches, addMatch, removeMatch } =
    useFavorites();
  const [swipeList, setSwipeList] = useState<Dog[]>(dogs);
  const matchList = swipeList.filter((dog) => {
    if (dog.id && !matches.includes(dog.id)) {
      return dog;
    }
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiCount = 50;
  const confettiSpring = useSprings(
    confettiCount,
    Array.from({ length: confettiCount }).map(() => ({
      from: {
        top: "50%",
        left: "50%",
        transform: "scale(0) rotate(0deg)",
      },
      to: {
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        transform: `scale(1) rotate(${Math.random() * 360}deg)`,
      },
      config: {
        duration: 1000,
        friction: 30,
      },
    }))
  );

  const { data } = useSWRImmutable<Match>(
    ["/dogs/match", matchList],
    ([url, matchList]) =>
      fetcher(url, { method: "POST", body: JSON.stringify(matchList) }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }
  );

  const [props, api] = useSprings(swipeList.length, (i) => ({
    ...to(i),
    from: from(i),
  }));

  useEffect(() => {
    api.start((i) => to(i));
  }, [api]);

  const bind = useDrag(
    ({
      args: [index],
      active,
      movement: [mx],
      direction: [xDir],
      velocity,
    }) => {
      const trigger =
        Math.abs(mx) > window.innerWidth / 5 || Math.abs(velocity[0]) > 0.2;
      const dir = xDir < 0 ? -1 : 1;
      if (!active && trigger) {
        gone.add(index);
      }
      api.start((i) => {
        if (index !== i) return;
        const isGone = gone.has(index);
        const x = isGone ? (200 + window.innerWidth) * dir : active ? mx : 0;
        const rot = mx / 100 + (isGone ? dir * 10 * velocity[0] : 0);
        const scale = active ? 1.1 : 1;
        if (isGone) {
          if (dir === 1) {
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
            setSwipeList((prev) =>
              prev.filter((dog) => dog.id !== swipeList[index].id)
            );
            removeFavorite(swipeList[index].id);
            removeMatch(swipeList[index].id);
          }
        }
        return {
          x,
          rot,
          scale,
          delay: undefined,
          config: { friction: 50, tension: active ? 800 : isGone ? 200 : 500 },
        };
      });
      if (!active && gone.size === favorites.length)
        setTimeout(() => {
          gone.clear();
          api.start((i) => to(i));
        }, 600);
    }
  );
  return (
    <div className="relative h-[500px] w-full max-w-[300px] mx-auto">
      {showConfetti &&
        confettiSpring.map((props, i) => (
          <animated.div
            key={i}
            style={{
              position: "fixed",
              width: "10px",
              height: "10px",
              backgroundColor: `hsl(${Math.random() * 360}, 80%, 60%)`,
              borderRadius: "50%",
              pointerEvents: "none",
              zIndex: 1000,
              ...props,
            }}
          />
        ))}
      {props.map(({ x, y, rot, scale }, i) => (
        <animated.div
          className="absolute w-full h-full will-change-transform"
          key={i}
          style={{ x, y }}
        >
          <animated.div
            {...bind(i)}
            style={{
              transform: rot.to(trans),
              scale,
              backgroundImage: `url(${swipeList[i].img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="absolute w-full h-full rounded-lg overflow-hidden shadow-md cursor-grab"
          >
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent text-white">
              {matches.includes(swipeList[i].id) && (
                <p className="text-md text-blue-500 flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  Match
                </p>
              )}
              <h2 className="text-xl font-bold">{swipeList[i].name}</h2>
              <p>{swipeList[i].breed}</p>
              <p>{swipeList[i].age} years old</p>
            </div>
          </animated.div>
        </animated.div>
      ))}
    </div>
  );
}
