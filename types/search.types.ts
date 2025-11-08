export enum FilterField {
  GENERIC = "generic",
  TITLE = "title",
  RELEASE_DATE = "release_date",
  IS_MOVIE = "is_movie",
  GENRE_NAME = "genre.name",
  PEOPLE_NAME = "people.name",
  PEOPLE_CHARACTER = "people.character",
}

export interface FilterCondition {
  field: FilterField;
  value: string | boolean;
}

export interface BuscaRequest {
  filters: FilterCondition[];
  sort_by?: string;
  sort_order?: "asc" | "desc";
  limit: number;
  offset: number;
  clerk_id: string;
}
