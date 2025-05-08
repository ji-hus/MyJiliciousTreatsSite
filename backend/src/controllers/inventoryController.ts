import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Update stock levels for a menu item
export const updateStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    const { data, error } = await supabase
      .from('menu_items')
      .update({ stock, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
};

// Get low stock items (items with stock below threshold)
export const getLowStockItems = async (req: Request, res: Response) => {
  try {
    const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 5;

    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .lt('stock', threshold)
      .eq('is_made_to_order', false);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ error: 'Failed to fetch low stock items' });
  }
};

// Log inventory changes
export const logInventoryChange = async (req: Request, res: Response) => {
  try {
    const { menu_item_id, quantity_change, reason } = req.body;

    const { data, error } = await supabase
      .from('inventory_logs')
      .insert([{
        menu_item_id,
        quantity_change,
        reason,
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error logging inventory change:', error);
    res.status(500).json({ error: 'Failed to log inventory change' });
  }
}; 