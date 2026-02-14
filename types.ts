
export interface CoffeeLog {
  id: string;
  name: string;
  origin: string;
  roaster: string;
  year: number;
  rating: number;
  notes: string;
  recipe?: string;
  isFavorite: boolean;
  date: string;
  imageUrl?: string;
  aiInsights?: string;
}

export type SortOption = 'newest' | 'oldest' | 'rating' | 'name';

export interface FilterState {
  search: string;
  origin: string;
  roaster: string;
  year: string;
}
