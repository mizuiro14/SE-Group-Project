import { Request, Response } from 'express';
import { SellerService } from '../services/sellerService';
import { Seller } from '../types/seller';

const sellerService = new SellerService();

export const createSeller = async (req: Request, res: Response) => {
  try {
    const { user_id, rating, branch } = req.body;
    // Basic validation
    if (!user_id || !branch) {
      return res.status(400).json({ message: 'Missing required fields: user_id, branch' });
    }

    const newSeller = await sellerService.createSeller({ user_id, rating, branch });
    if (newSeller) {
      res.status(201).json(newSeller);
    } else {
      res.status(500).json({ message: 'Failed to create seller' });
    }
  } catch (error) {
    console.error('Error in createSeller:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSellerById = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      return res.status(400).json({ message: 'Seller ID is required' });
    }
    const id = parseInt(idParam as string, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid seller ID' });
    }

    const seller = await sellerService.getSellerById(id);
    if (seller) {
      res.status(200).json(seller);
    } else {
      res.status(404).json({ message: 'Seller not found' });
    }
  } catch (error) {
    console.error('Error in getSellerById:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSellerByUserId = async (req: Request, res: Response) => {
  try {
    const userIdParam = req.params.userId;
    if (!userIdParam) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const userId = parseInt(userIdParam as string, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const seller = await sellerService.getSellerByUserId(userId);
    if (seller) {
      res.status(200).json(seller);
    } else {
      res.status(404).json({ message: 'Seller not found for this user ID' });
    }
  } catch (error) {
    console.error('Error in getSellerByUserId:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSeller = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      return res.status(400).json({ message: 'Seller ID is required' });
    }
    const id = parseInt(idParam as string, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid seller ID' });
    }

    const updates: Partial<Omit<Seller, 'id' | 'created_at'>> = req.body;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No update fields provided' });
    }

    const updatedSeller = await sellerService.updateSeller(id, updates);
    if (updatedSeller) {
      res.status(200).json(updatedSeller);
    } else {
      res.status(404).json({ message: 'Seller not found or failed to update' });
    }
  } catch (error) {
    console.error('Error in updateSeller:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteSeller = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      return res.status(400).json({ message: 'Seller ID is required' });
    }
    const id = parseInt(idParam as string, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid seller ID' });
    }

    const success = await sellerService.deleteSeller(id);
    if (success) {
      res.status(204).send(); // No content for successful deletion
    } else {
      res.status(404).json({ message: 'Seller not found or failed to delete' });
    }
  } catch (error) {
    console.error('Error in deleteSeller:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllSellers = async (req: Request, res: Response) => {
  try {
    const sellers = await sellerService.getAllSellers();
    if (sellers) {
      res.status(200).json(sellers);
    } else {
      res.status(500).json({ message: 'Failed to retrieve sellers' });
    }
  } catch (error) {
    console.error('Error in getAllSellers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
