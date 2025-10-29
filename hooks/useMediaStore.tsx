import { Media } from "@/types/media.t";
import { create } from "zustand";

interface MediaStore {
  media: Media | null;
  setMedia: (media: Media) => void;
}

interface RatingStore {
  rating: number;
  setRating: (rating: number) => void;
}

interface RatingsStore {
  ratings: Record<string, number>;
  setRating: (mediaId: string, rating: number) => void;
  getRating: (mediaId: string) => number | undefined;
  clearRating: (mediaId: string) => void;
  clearAll: () => void;
}

export const useMediaStore = create<MediaStore>((set) => ({
  media: null,
  setMedia: (media: Media) => set({ media }),
}));

export const useRatingStore = create<RatingStore>((set) => ({
  rating: 0,
  setRating: (rating: number) => set({ rating }),
}));

export const useMediaRatingsStore = create<RatingsStore>((set, get) => ({
  ratings: {},
  setRating: (mediaId, rating) =>
    set((state) => ({
      ratings: { ...state.ratings, [mediaId]: rating },
    })),
  getRating: (mediaId) => get().ratings[mediaId],
  clearRating: (mediaId) =>
    set((state) => {
      const newRatings = { ...state.ratings };
      delete newRatings[mediaId];
      return { ratings: newRatings };
    }),
  clearAll: () => set({ ratings: {} }),
}));