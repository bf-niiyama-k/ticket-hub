-- Add custom_order_id column to orders table
ALTER TABLE public.orders ADD COLUMN custom_order_id TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX idx_orders_custom_order_id ON public.orders(custom_order_id);
