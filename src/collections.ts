export type Artist = {};

export type Label = {};

export interface ArtistName {
  name: string;
  originalName: string;
  nameIndex: number;
}

export interface ArtistRef extends ArtistName {
  id: number;
  anv: Array<ArtistName>;
  join?: string;
  role?: string;
  tracks?: string;
}

export interface Video {
  title?: string;
  description?: string;
  duration?: number;
  originalDuration?: string;
  src: string;
}

export interface Master {
  mainRelease: number;
  artists: Array<ArtistRef>;
  styles: Array<string>;
  genres: Array<string>;
  videos: Array<Video>;
  title: string;
  id: number;
  year?: number;
  dataQuality?: string;
  notes?: string;
}

export interface Release {}

export interface CollectionItems {
  artists: Artist;
  labels: Label;
  masters: Master;
  releases: Release;
}

export type CollectionType = keyof CollectionItems;
