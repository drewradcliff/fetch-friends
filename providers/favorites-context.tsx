"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  matches: string[];
  addMatch: (id: string) => void;
  removeMatch: (id: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [matches, setMatches] = useState<string[]>([]);
  useEffect(() => {
    const storedFavorites = localStorage.getItem("favorites");
    const storedMatches = localStorage.getItem("matches");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
    if (storedMatches) {
      setMatches(JSON.parse(storedMatches));
    }
  }, []);

  const addFavorite = (id: string) => {
    const newFavorites = [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
  };

  const removeFavorite = (id: string) => {
    const newFavorites = favorites.filter((favoriteId) => favoriteId !== id);
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
  };

  const addMatch = (id: string) => {
    const newMatches = [...matches, id];
    setMatches(newMatches);
    localStorage.setItem("matches", JSON.stringify(newMatches));
  };

  const removeMatch = (id: string) => {
    const newMatches = matches.filter((matchId) => matchId !== id);
    setMatches(newMatches);
    localStorage.setItem("matches", JSON.stringify(newMatches));
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        matches,
        addMatch,
        removeMatch,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
