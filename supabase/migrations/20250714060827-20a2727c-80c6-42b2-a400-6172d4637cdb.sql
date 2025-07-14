
-- Add address field to vineyards table for better location management
ALTER TABLE vineyards ADD COLUMN IF NOT EXISTS address TEXT;

-- Update existing vineyards with addresses
UPDATE vineyards SET address = '1000 Fern Hollow Road, La Honda, CA' WHERE name = 'Clos de la Tech';
UPDATE vineyards SET address = '19501 Skyline Blvd, Woodside, CA 94062' WHERE name = 'Thomas Fogarty Winery';

-- Create index on vineyard name for faster lookups
CREATE INDEX IF NOT EXISTS idx_vineyards_name ON vineyards(name);

-- Create index on weather_data vineyard_id and date for better query performance
CREATE INDEX IF NOT EXISTS idx_weather_data_vineyard_date ON weather_data(vineyard_id, date);
