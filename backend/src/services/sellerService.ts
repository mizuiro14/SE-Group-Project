import { supabase } from '../SupabaseClient';
import { Seller } from '../types/seller';

export class SellerService {
  /**
   * Creates a new seller profile.
   * @param sellerData - The data for the new seller, excluding id and created_at.
   * @returns The created Seller object or null if an error occurred.
   */
  async createSeller(sellerData: Omit<Seller, 'id' | 'created_at'>): Promise<Seller | null> {
    const { data, error } = await supabase
      .from('seller')
      .insert([sellerData])
      .select()
      .single();

    if (error) {
      console.error('Error creating seller:', error);
      return null;
    }
    return data;
  }

  /**
   * Retrieves a seller profile by its ID.
   * @param id - The ID of the seller.
   * @returns The Seller object or null if not found or an error occurred.
   */
  async getSellerById(id: number): Promise<Seller | null> {
    const { data, error } = await supabase
      .from('seller')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching seller by ID:', error);
      return null;
    }
    return data;
  }

  /**
   * Retrieves a seller profile by the associated user ID.
   * @param userId - The user ID associated with the seller.
   * @returns The Seller object or null if not found or an error occurred.
   */
  async getSellerByUserId(userId: number): Promise<Seller | null> {
    const { data, error } = await supabase
      .from('seller')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching seller by user ID:', error);
      return null;
    }
    return data;
  }

  /**
   * Updates an existing seller profile.
   * @param id - The ID of the seller to update.
   * @param updates - The fields to update.
   * @returns The updated Seller object or null if not found or an error occurred.
   */
  async updateSeller(id: number, updates: Partial<Omit<Seller, 'id' | 'created_at'>>): Promise<Seller | null> {
    const { data, error } = await supabase
      .from('seller')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating seller:', error);
      return null;
    }
    return data;
  }

  /**
   * Deletes a seller profile by its ID.
   * @param id - The ID of the seller to delete.
   * @returns True if deletion was successful, false otherwise.
   */
  async deleteSeller(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('seller')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting seller:', error);
      return false;
    }
    return true;
  }

  /**
   * Retrieves all seller profiles.
   * @returns An array of Seller objects or null if an error occurred.
   */
  async getAllSellers(): Promise<Seller[] | null> {
    const { data, error } = await supabase
      .from('seller')
      .select('*');

    if (error) {
      console.error('Error fetching all sellers:', error);
      return null;
    }
    return data;
  }
}
