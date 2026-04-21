import { User } from './user';

export interface Seller {
  id: number;
  created_at: string; // or Date, depending on how Supabase returns it
  user_id: number | null; // Corresponds to User.id
  rating: number | null;
  branch: string;
}

// Optional: If you need to fetch seller with user details
export interface SellerWithUser extends Seller {
  user: User;
}
