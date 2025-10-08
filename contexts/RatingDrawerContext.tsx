import { createContext, useContext, useState } from 'react';

interface Media {
  id: number;
  title: string;
  description: string;
  release_date: string;
  poster_path: string;
  backdrop_path: string;
  is_movie: boolean;
}

interface RatingDrawerContextType {
  isOpen: boolean;
  selectedMovie: Media | null;
  openDrawer: (movie: Media) => void;
  closeDrawer: () => void;
  onRate: (rating: number) => void;
}

const RatingDrawerContext = createContext<RatingDrawerContextType | undefined>(undefined);

export function RatingDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Media | null>(null);

  const openDrawer = (movie: Media) => {
    setSelectedMovie(movie);
    setIsOpen(true);
  };

  const closeDrawer = () => {
    setIsOpen(false);
    setSelectedMovie(null);
  };

  const onRate = (rating: number) => {
    if (selectedMovie) {
      console.log(`Rating ${rating} stars for movie: ${selectedMovie.title}`);
    }
    closeDrawer();
  };

  return (
    <RatingDrawerContext.Provider value={{ isOpen, selectedMovie, openDrawer, closeDrawer, onRate }}>
      {children}
    </RatingDrawerContext.Provider>
  );
}

export function useRatingDrawer() {
  const context = useContext(RatingDrawerContext);
  if (context === undefined) {
    throw new Error('useRatingDrawer must be used within a RatingDrawerProvider');
  }
  return context;
}