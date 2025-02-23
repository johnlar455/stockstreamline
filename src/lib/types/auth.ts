
export type UserRole = 'admin' | 'manager' | 'staff';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  updated_at: string;
}

export interface UserWithRole {
  id: string;
  email: string;
  profile: Profile;
  roles: UserRole[];
}
