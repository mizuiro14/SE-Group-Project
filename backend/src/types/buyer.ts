import { User } from './user';

export interface Buyer {
  id: number;
  created_at: string; // or Date
  user_id: number | null; // Corresponds to User.id
  region: string | null;
  province: string | null;
  city: string | null;
  barangay: string | null;
  street_address: string | null;
}

// Optional: If you need to fetch buyer with user details
export interface BuyerWithUser extends Buyer {
  user: User;
}
