import { create } from "zustand";
import { useCallback } from "react";
import { Media } from "@/types/media.types";

interface MediaStore {
  media: Media | null;
  setMedia: (media: Media) => void;
  clearMedia: () => void;
}

interface RatingStore {
  rating: number;
  setRating: (rating: number) => void;
}

interface RatingsStore {
  ratings: Record<string, number>;
  version: number;
  setRating: (mediaId: string, rating: number) => void;
  getRating: (mediaId: string) => number | undefined;
  clearRating: (mediaId: string) => void;
  clearAll: () => void;
}

interface BookmarkStore {
  bookmarks: Record<string, boolean>;
  version: number;
  getVersion: () => number;
  setBookmark: (mediaId: string, bookmark: boolean) => void;
  getBookmark: (mediaId: string) => boolean | undefined;
  clearBookmark: (mediaId: string) => void;
  clearAll: () => void;
  incrementVersion: () => void;
}

/* Simple media and rating stores (unchanged semantics) */
export const useMediaStore = create<MediaStore>((set) => ({
  media: null,
  setMedia: (media: Media) => set({ media }),
  clearMedia: () => set({ media: null }),
}));

export const useRatingStore = create<RatingStore>((set) => ({
  rating: 0,
  setRating: (rating: number) => set({ rating }),
}));

/* Ratings store using plain objects */
export const useMediaRatingsStore = create<RatingsStore>((set, get) => ({
  ratings: {},
  version: 0,

  setRating: (id, rating) =>
    set((state) => {
      const prev = state.ratings[id];
      if (prev === rating) return {}; // no change
      // immutable update
      const newRatings = { ...state.ratings, [id]: rating };
      return { ratings: newRatings, version: state.version };
    }),

  getRating: (mediaId) => get().ratings[mediaId],

  clearRating: (mediaId) =>
    set((state) => {
      if (!(mediaId in state.ratings)) return {};
      const { [mediaId]: _, ...rest } = state.ratings;
      return { ratings: rest, version: state.version };
    }),

  clearAll: () =>
    set((state) => {
      if (Object.keys(state.ratings).length === 0) return {};
      return { ratings: {}, version: state.version };
    }),
}));

/* Bookmark store using plain objects */
export const useMediaBookmarkStore = create<BookmarkStore>((set, get) => ({
  bookmarks: {},
  version: 0,
  getVersion: () => get().version,

  setBookmark: (id, bookmark) =>
    set((state) => {
      const prev = state.bookmarks[id];
      if (prev === bookmark) return {};
      const newBookmarks = { ...state.bookmarks, [id]: bookmark };
      return {
        bookmarks: newBookmarks,
        version: state.version,
      };
    }),

  getBookmark: (mediaId) => get().bookmarks[mediaId],

  clearBookmark: (mediaId) =>
    set((state) => {
      if (!(mediaId in state.bookmarks)) return {};
      const { [mediaId]: _, ...rest } = state.bookmarks;
      return { bookmarks: rest, version: state.version };
    }),

  clearAll: () => set(() => ({ bookmarks: {}, version: 0 })),

  incrementVersion: () => set((state) => ({ version: state.version + 1 })),
}));

/* Helper hooks: subscribe to a single id (keeps selectors minimal) */
export const useRatingFor = (id: string) =>
  useMediaRatingsStore(
    useCallback((s) => s.ratings[id] ?? undefined, [id])
  );

export const useBookmarkFor = (id: string) =>
  useMediaBookmarkStore(
    useCallback((s) => s.bookmarks[id] ?? false, [id])
  );