export type ListingCategory = 'Buy' | 'Rent' | 'Plot';
export type AreaUnit = 'Marla' | 'Sq Yd';

export interface Listing {
  id: string;
  title: string;
  location: string;
  neighborhood: string;
  category: ListingCategory;
  price: number | string;
  bedrooms: number;
  bathrooms: number;
  area: number | string;
  areaUnit?: string;
  latitude: number;
  longitude: number;
  images: string[];
  description: string;
  agent: {
    name: string;
  };
}

export type RootStackParamList = {
  Home: undefined;
  ListingDetails: {listingId: string};
  Admin: undefined;
};

export type MainTabParamList = {
  Explore: undefined;
  Saved: undefined;
  Chat: undefined;
  Profile: undefined;
};
