import { Role } from './role';

export interface Admin {
  id: string;
  username: string;
  email: string;
  password: string;
  role: Role;
  fullName: string;
  employeeId?: string;
  department: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}
