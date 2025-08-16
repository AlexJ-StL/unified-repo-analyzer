
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Repository {
  id: string;
  name: string;
  description?: string;
  language: string;
  stars: number;
}
  