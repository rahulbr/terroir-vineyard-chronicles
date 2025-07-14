-- Add user_id columns to all tables to link data to authenticated users
ALTER TABLE public.vineyards ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.observations ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.tasks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.phenology_events ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies to ensure users only see their own data
DROP POLICY IF EXISTS "Allow all operations on vineyards" ON public.vineyards;
DROP POLICY IF EXISTS "Allow all operations on phenology_events" ON public.phenology_events;
DROP POLICY IF EXISTS "Allow all operations on weather_data" ON public.weather_data;
DROP POLICY IF EXISTS "Allow all operations on daily_weather" ON public.daily_weather;

-- Enable RLS on observations and tasks tables
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create user-specific RLS policies for vineyards
CREATE POLICY "Users can view their own vineyards" ON public.vineyards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vineyards" ON public.vineyards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vineyards" ON public.vineyards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vineyards" ON public.vineyards
  FOR DELETE USING (auth.uid() = user_id);

-- Create user-specific RLS policies for observations
CREATE POLICY "Users can view their own observations" ON public.observations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own observations" ON public.observations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own observations" ON public.observations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own observations" ON public.observations
  FOR DELETE USING (auth.uid() = user_id);

-- Create user-specific RLS policies for tasks
CREATE POLICY "Users can view their own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Create user-specific RLS policies for phenology_events
CREATE POLICY "Users can view their own phenology events" ON public.phenology_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own phenology events" ON public.phenology_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own phenology events" ON public.phenology_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own phenology events" ON public.phenology_events
  FOR DELETE USING (auth.uid() = user_id);

-- Weather data should be accessible by users who own the vineyard
CREATE POLICY "Users can view weather data for their vineyards" ON public.weather_data
  FOR SELECT USING (
    vineyard_id IN (SELECT id FROM public.vineyards WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert weather data for their vineyards" ON public.weather_data
  FOR INSERT WITH CHECK (
    vineyard_id IN (SELECT id FROM public.vineyards WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view daily weather for their vineyards" ON public.daily_weather
  FOR SELECT USING (
    vineyard_id IN (SELECT id FROM public.vineyards WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert daily weather for their vineyards" ON public.daily_weather
  FOR INSERT WITH CHECK (
    vineyard_id IN (SELECT id FROM public.vineyards WHERE user_id = auth.uid())
  );