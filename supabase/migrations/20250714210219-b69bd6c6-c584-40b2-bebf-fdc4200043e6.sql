-- Temporarily disable RLS on all tables to debug persistence issues
ALTER TABLE public.vineyards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.phenology_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_weather DISABLE ROW LEVEL SECURITY;