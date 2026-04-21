import { Request, Response } from 'express';
import { BuyerService } from '../services/buyerService';
import { Buyer } from '../types/buyer';

const buyerService = new BuyerService();

export const createBuyer = async (req: Request, res: Response) => {
  try {
    const { user_id, region, province, city, barangay, street_address } = req.body;
    // Basic validation
    if (!user_id) {
      return res.status(400).json({ message: 'Missing required field: user_id' });
    }

    const newBuyer = await buyerService.createBuyer({ user_id, region, province, city, barangay, street_address });
    if (newBuyer) {
      res.status(201).json(newBuyer);
    } else {
      res.status(500).json({ message: 'Failed to create buyer' });
    }
  } catch (error) {
    console.error('Error in createBuyer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBuyerById = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      return res.status(400).json({ message: 'Buyer ID is required' });
    }
    const id = parseInt(idParam as string, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid buyer ID' });
    }

    const buyer = await buyerService.getBuyerById(id);
    if (buyer) {
      res.status(200).json(buyer);
    } else {
      res.status(404).json({ message: 'Buyer not found' });
    }
  } catch (error) {
    console.error('Error in getBuyerById:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBuyerByUserId = async (req: Request, res: Response) => {
  try {
    const userIdParam = req.params.userId;
    if (!userIdParam) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const userId = parseInt(userIdParam as string, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const buyer = await buyerService.getBuyerByUserId(userId);
    if (buyer) {
      res.status(200).json(buyer);
    } else {
      res.status(404).json({ message: 'Buyer not found for this user ID' });
    }
  } catch (error) {
    console.error('Error in getBuyerByUserId:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBuyer = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      return res.status(400).json({ message: 'Buyer ID is required' });
    }
    const id = parseInt(idParam as string, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid buyer ID' });
    }

    const updates: Partial<Omit<Buyer, 'id' | 'created_at'>> = req.body;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No update fields provided' });
    }

    const updatedBuyer = await buyerService.updateBuyer(id, updates);
    if (updatedBuyer) {
      res.status(200).json(updatedBuyer);
    } else {
      res.status(404).json({ message: 'Buyer not found or failed to update' });
    }
  } catch (error) {
      console.error('Error in updateBuyer:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteBuyer = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      return res.status(400).json({ message: 'Buyer ID is required' });
    }
    const id = parseInt(idParam as string, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid buyer ID' });
    }

    const success = await buyerService.deleteBuyer(id);
    if (success) {
      res.status(204).send(); // No content for successful deletion
    } else {
      res.status(404).json({ message: 'Buyer not found or failed to delete' });
    }
  } catch (error) {
    console.error('Error in deleteBuyer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllBuyers = async (req: Request, res: Response) => {
  try {
    const buyers = await buyerService.getAllBuyers();
    if (buyers) {
      res.status(200).json(buyers);
    } else {
      res.status(500).json({ message: 'Failed to retrieve buyers' });
    }
  } catch (error) {
    console.error('Error in getAllBuyers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
