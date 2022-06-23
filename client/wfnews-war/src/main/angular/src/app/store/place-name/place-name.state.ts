export interface PlaceData {
  name: string;
  type: string;
  dist?: number;
  direction?: string;
  loc: [number, number];
//   centreType?: string;
//   distance?: number;
  isAnchor?: boolean;
}

export interface RoadData {
  name: string;
  dist: number;
  direction: string;
  loc: [number, number];
  isAnchor?: boolean;
}

export interface PlaceNameResults {
  places: PlaceData[];
  roads: RoadData[];
  intersections: RoadData[];
}

export interface PlaceNameState {
  places: PlaceData[];
  roads: RoadData[];
  intersections: RoadData[];
  listeningForResults: boolean;
  loading: boolean;
  error: string;
}

export const initialPlaceNameState: PlaceNameState = {
  places: [],
  roads: [],
  intersections: [],
  listeningForResults: false,
  loading: false,
  error: null
};
