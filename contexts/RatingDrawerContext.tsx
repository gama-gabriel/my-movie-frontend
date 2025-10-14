import { useMutation } from '@tanstack/react-query';
import { createContext, useContext, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';

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
  isRating: boolean;
}

const RatingDrawerContext = createContext<RatingDrawerContextType | undefined>(undefined);

export function RatingDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Media | null>(null);
  const { user } = useUser();

  const rateMutation = useMutation({
    mutationFn: async ({ mediaId, rating }: { mediaId: number; rating: number }) => {
      const response = await fetch('https://mymovie-nhhq.onrender.com/media/rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerk_id: user?.id,
          ratings: [
            {
              media_id: mediaId,
              score: rating,
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to rate media');
      }

      return response.json();
    },
    onSuccess: () => {
      // // Invalidate and refetch the recommendations query
      // queryClient.invalidateQueries({ queryKey: ['images'] });
    },
  });

  const openDrawer = (movie: Media) => {
    setSelectedMovie(movie);
    setIsOpen(true);
  };

  const closeDrawer = () => {
    setIsOpen(false);
    setSelectedMovie(null);
  };

  const onRate = async (rating: number) => {
    if (selectedMovie && user) {
      try {
        await rateMutation.mutateAsync({
          mediaId: selectedMovie.id,
          rating,
        });
        console.log(`Successfully rated ${selectedMovie.title} with ${rating} stars`);
      } catch (error) {
        console.error('Error rating media:', error);
      }
    }
    closeDrawer();
  };

  return (
    <RatingDrawerContext.Provider
      value={{
        isOpen,
        selectedMovie,
        openDrawer,
        closeDrawer,
        onRate,
        isRating: rateMutation.isPending
      }}
    >
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