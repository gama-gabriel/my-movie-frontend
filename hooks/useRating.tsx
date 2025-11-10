import { useUser } from "@clerk/clerk-expo";
import { useMutation } from "@tanstack/react-query";
import { useToastVariant } from "./useToastVariant";

export const useRating = () => {

  const { user } = useUser();

  const toast = useToastVariant()

  const rateMutation = useMutation({
    mutationFn: async ({ mediaId, rating }: { mediaId: string; rating: number }) => {
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
    onSuccess: () => {
      toast.show("Avaliação realizada com sucesso!", "success")
    },
    onError: () => {
      toast.show("Erro ao realizar avaliação.", "error")
    }
  });

  const onRate = async (rating: number, media_id: string) => {
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
  };

  return { onRate }
}