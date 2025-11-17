import { Role } from "./role";

export interface User {
  id?: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles?: Role[];
  isActive?: boolean;
  password?: string;
}