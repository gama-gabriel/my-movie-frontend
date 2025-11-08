export enum FilterField {
  GENERIC = "generic",
  TITLE = "title",
  RELEASE_DATE = "release_date",
  IS_MOVIE = "is_movie",
  GENRE_NAME = "genre.name",
  PEOPLE_NAME = "people.name",
  PEOPLE_CHARACTER = "people.character",
}

export enum FilterOperator {
  EQ = "eq",
  GT = "gt",
  GTE = "gte",
  LT = "lt",
  LTE = "lte",
  NEQ = "neq",
  LIKE = "like",
  IN = "in",
}

export interface FilterCondition {
  field: FilterField;
  operator: FilterOperator;
  value: string | boolean;
}

export interface BuscaRequest {
  filters: FilterCondition[];
  sort_by?: string;
  sort_order?: "asc" | "desc";
  limit: number;
  offset: number;
}