export interface Media {
  id: string;
  title: string;
  description: string;
  release_date: string;
  poster_path: string;
  backdrop_path: string;
  is_movie: boolean;
  similarity_score: number;
  cast: CastMember[]
  genres: string[];
  bookmarked?: boolean
}

export interface MediaSearch extends Media {
  user_rating: number | null;
}

export interface ResponseMedia {
  media: Media[];
}

export interface ResponseMediaSearch {
  media: MediaSearch[];
}

export interface CastMember {
    role?: string;
    name?: string;
    character_name?: string;
    profile_path: string;
}
