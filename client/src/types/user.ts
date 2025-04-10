// User type definition that matches the server response
export type User = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  phone: string | null;
  photoUrl?: string | null;
};