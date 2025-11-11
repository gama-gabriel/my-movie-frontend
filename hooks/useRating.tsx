import { useUser } from "@clerk/clerk-expo";
import { useMutation } from "@tanstack/react-query";
import { useToastVariant } from "./useToastVariant";
import { useCallback } from "react";

export const useRating = () => {

  const { user } = useUser();

  const toast = useToastVariant()

  const rateMutation = useMutation({
    mutationFn: async ({ mediaId, rating }: { mediaId: string; rating: number }) => {
      console.log("rating " + mediaId + "with " + rating)
      const response = await fetch('https://mymovie-nhhq.onrender.com/media/rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerk_id: user!.id,
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
    onSuccess: (data) => {
      console.log("data rating positive", data)
      if (data.ratings[0].score === 0) {
        toast.show("Ação realizada com sucesso", "success")
      } else {
        toast.show("Avaliação realizada com sucesso!", "success")
      }
    },
    onError: (data) => {
      console.log("data rating error", data)
      toast.show("Erro ao realizar avaliação.", "error")
    }
  });

  const deleteRatingMutation = useMutation({
    mutationFn: async ({ mediaId }: { mediaId: string }) => {
      const response = await fetch('https://mymovie-nhhq.onrender.com/media/rating', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerk_id: user!.id,
          media_id: mediaId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to rate media');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.show("Ação desfeita com sucesso", "success")
    },
    onError: () => {
      toast.show("Erro ao remover avaliação.", "error")
    }
  });

  const onRate = useCallback(async (rating: number, media_id: string) => {
    if (media_id) {
      try {
        await rateMutation.mutateAsync({
          mediaId: media_id,
          rating,
        });
        console.log(`Successfully rated ${media_id} with ${rating} stars`);
      } catch (error) {
        console.error('Error rating media:', error);
      }
    }
  }, [rateMutation]);

  const onDeleteRating = useCallback(async (media_id: string) => {
    if (media_id) {
      try {
        await deleteRatingMutation.mutateAsync({
          mediaId: media_id,
        });
        console.log(`Successfully deleted rating from ${media_id}`);
      } catch (error) {
        console.error('Error deleting rating from media:', error);
      }
    }
  }, [deleteRatingMutation]);

  return { onRate, onDeleteRating }
}