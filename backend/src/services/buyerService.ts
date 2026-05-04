import { supabase } from '../SupabaseClient';
import { Buyer } from '../types/buyer';

export class BuyerService {
  /**
   * Creates a new buyer profile.
   * @param buyerData - The data for the new buyer, excluding id and created_at.
   * @returns The created Buyer object or null if an error occurred.
   */
  async createBuyer(buyerData: Omit<Buyer, 'id' | 'created_at'>): Promise<Buyer | null> {
    const { data, error } = await supabase
      .from('buyer')
      .insert([buyerData])
      .select()
      .single();

    if (error) {
      console.error('Error creating buyer:', error);
      return null;
    }
    return data;
  }

  /**
   * Retrieves a buyer profile by its ID.
   * @param id - The ID of the buyer.
   * @returns The Buyer object or null if not found or an error occurred.
   */
  async getBuyerById(id: number): Promise<Buyer | null> {
    const { data, error } = await supabase
      .from('buyer')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching buyer by ID:', error);
      return null;
    }
    return data;
  }

  /**
   * Retrieves a buyer profile by the associated user ID.
   * @param userId - The user ID associated with the buyer.
   * @returns The Buyer object or null if not found or an error occurred.
   */
  async getBuyerByUserId(userId: number): Promise<Buyer | null> {
    const { data, error } = await supabase
      .from('buyer')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching buyer by user ID:', error);
      return null;
    }
    return data;
  }

  /**
   * Updates an existing buyer profile.
   * @param id - The ID of the buyer to update.
   * @param updates - The fields to update.
   * @returns The updated Buyer object or null if not found or an error occurred.
   */
  async updateBuyer(id: number, updates: Partial<Omit<Buyer, 'id' | 'created_at'>>): Promise<Buyer | null> {
    const { data, error } = await supabase
      .from('buyer')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating buyer:', error);
      return null;
    }
    return data;
  }

  /**
   * Deletes a buyer profile by its ID.
   * @param id - The ID of the buyer to delete.
   * @returns True if deletion was successful, false otherwise.
   */
  async deleteBuyer(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('buyer')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting buyer:', error);
      return false;
    }
    return true;
  }

  /**
   * Retrieves all buyer profiles.
   * @returns An array of Buyer objects or null if an error occurred.
   */
  async getAllBuyers(): Promise<Buyer[] | null> {
    const { data, error } = await supabase
      .from('buyer')
      .select('*');

    if (error) {
      console.error('Error fetching all buyers:', error);
      return null;
    }
    return data;
  }
}
