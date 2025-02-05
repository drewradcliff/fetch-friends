export type SearchResult = {
  next: string;
  prev?: string;
  resultIds: string[];
  total: number;
};

export type Dog = {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
};

export type Match = {
  match: Dog;
};
