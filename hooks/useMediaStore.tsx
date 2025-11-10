import { Media } from "@/types/media.types";
import { create } from "zustand";

interface MediaStore {
  media: Media | null;
  setMedia: (media: Media) => void;
  clearMedia: () => void;
}

interface RatingStore {
  rating: number;
  setRating: (rating: number) => void;
}

export const useMediaStore = create<MediaStore>((set) => ({
  media: null,
  setMedia: (media: Media) => set({ media }),
  clearMedia: () => set({ media: null })
}));

export const useRatingStore = create<RatingStore>((set) => ({
  rating: 0,
  setRating: (rating: number) => set({ rating }),
}));

interface RatingsStore {
  ratings: Map<string, number>;
  version: number;
  setRating: (mediaId: string, rating: number) => void;
  getRating: (mediaId: string) => number | undefined;
  clearRating: (mediaId: string) => void;
  clearAll: () => void;
}

interface BookmarkStore {
  bookmarks: Map<string, boolean>;
  version: number;
  getVersion: () => number;
  setBookmark: (mediaId: string, bookmark: boolean) => void;
  getBookmark: (mediaId: string) => boolean | undefined;
  clearBookmark: (mediaId: string) => void;
  clearAll: () => void;
  incrementVersion: () => void;
}

export const useMediaRatingsStore = create<RatingsStore>((set, get) => ({
  ratings: new Map(),
  version: 0,

  setRating: (id, rating) =>
    set((state) => {
      // Check if the rating is different before updating
      if (state.ratings.get(id) === rating) return {}; // No change

      // Mutate the Map in-place (cheap) and bump the version for shallow re-render
      state.ratings.set(id, rating);
      const newVersion = state.version + 1;
      return { ratings: state.ratings, version: newVersion };
    }),

  getRating: (mediaId) => get().ratings.get(mediaId),

  clearRating: (mediaId) =>
    set((state) => {
      if (!state.ratings.has(mediaId)) return {};
      state.ratings.delete(mediaId);
      return { version: state.version + 1 };
    }),

  clearAll: () =>
    set((state) => {
      if (state.ratings.size === 0) return {};
      state.ratings.clear();
      return { version: state.version + 1 };
    }),
}));

export const useMediaBookmarkStore = create<BookmarkStore>((set, get) => ({
  bookmarks: new Map(),
  version: 0,
  getVersion: () => get().version,

  setBookmark: (id, bookmark) =>
    set((state) => {
      if (state.bookmarks.get(id) === bookmark) return {};

      const newBookmarks = new Map(state.bookmarks);
      newBookmarks.set(id, bookmark);

      return {
        bookmarks: newBookmarks,
        version: state.version
      };
    }),

  getBookmark: (mediaId) => get().bookmarks.get(mediaId),

  clearBookmark: (mediaId) =>
    set((state) => {
      if (!state.bookmarks.has(mediaId)) return {};
      const newBookmarks = new Map(state.bookmarks);
      newBookmarks.delete(mediaId);
      return { bookmarks: newBookmarks, version: state.version + 1 };
    }),

  clearAll: () =>
    set(() => ({ bookmarks: new Map(), version: 0 })),

  incrementVersion: () =>
    set((state) => ({ version: state.version + 1 })),
}));