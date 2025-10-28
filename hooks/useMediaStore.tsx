import { Media } from "@/types/media.t";
import { create } from "zustand";

interface MediaStore {
  media: Media | null;
  setMedia: (media: Media) => void;
}

export const useMediaStore = create<MediaStore>((set) => ({
  media: null,
  setMedia: (media: Media) => set({ media }),
}));