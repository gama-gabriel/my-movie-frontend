import { useUser } from "@clerk/clerk-expo";
import { useMutation } from "@tanstack/react-query";
import { useToastVariant } from "./useToastVariant";
import { useMediaBookmarkStore } from "./useMediaStore";

export const useBookmark = () => {

  const { user } = useUser();

  const toast = useToastVariant()

  const incrementVersion = useMediaBookmarkStore((s) => s.incrementVersion);

  const bookmarkMutation = useMutation({
    mutationFn: async ({ mediaId }: { mediaId: string }) => {
      const response = await fetch('https://mymovie-nhhq.onrender.com/media/watch-later', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerk_id: user!.id,
          medias_id: [
            mediaId
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to bookmark media');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.show("Item adicionado a lista com sucesso!", "success")
    },
    onError: () => {
      toast.show("Erro ao adicionar item a lista.", "error")
    }
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: async ({ mediaId }: { mediaId: string }) => {
      const response = await fetch('https://mymovie-nhhq.onrender.com/media/watch-later', {
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
        throw new Error('Failed to remove bookmark from media');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.show("Item removido da lista com sucesso!", "success")
    },
    onError: () => {
      toast.show("Erro ao remover item da lista.", "error")
    }
  });

  const onBookmark = async (adicionar: boolean, media_id: string, mudarVersao: boolean = true) => {
    if (media_id) {
      if (adicionar) {
        try {
          await bookmarkMutation.mutateAsync({
            mediaId: media_id,
          });
          console.log(`Successfully bookmarked ${media_id}`);

          if (mudarVersao) {
            incrementVersion()
          }
        } catch (error) {
          console.error('Error bookmarking media:', error);
        }
      } else {
        try {
          await removeBookmarkMutation.mutateAsync({
            mediaId: media_id,
          });

          console.log(`Successfully removed bookmark from ${media_id}`);

          if (mudarVersao) {
            incrementVersion()
          }
        } catch (error) {
          console.error('Error removing bookmark from media:', error);
        }
      }
    }
  };

  return { onBookmark }
}