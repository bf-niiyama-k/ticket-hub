-- Add venue and time columns to events table
ALTER TABLE public.events ADD COLUMN venue TEXT;
ALTER TABLE public.events ADD COLUMN time_start TIME;
ALTER TABLE public.events ADD COLUMN time_end TIME;

-- Create index for venue searches
CREATE INDEX idx_events_venue ON public.events(venue);
