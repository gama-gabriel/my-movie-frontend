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
}

export interface ResponseMedia {
  media: Media[];
}

export interface CastMember {
    role?: string;
    name?: string;
    character_name?: string;

}