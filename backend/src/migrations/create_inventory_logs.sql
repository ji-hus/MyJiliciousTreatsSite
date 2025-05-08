-- Create inventory_logs table
CREATE TABLE IF NOT EXISTS inventory_logs (
    id SERIAL PRIMARY KEY,
    menu_item_id INTEGER REFERENCES menu_items(id),
    quantity_change INTEGER NOT NULL,
    reason TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
); 