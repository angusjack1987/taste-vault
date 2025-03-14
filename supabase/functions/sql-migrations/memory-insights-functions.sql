
-- Create function to get latest memory insights
CREATE OR REPLACE FUNCTION public.get_latest_memory_insights(user_id_param UUID)
RETURNS TABLE (insights TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT ami.insights, ami.created_at
  FROM public.ai_memory_insights ami
  WHERE ami.user_id = user_id_param
  ORDER BY ami.created_at DESC
  LIMIT 1;
END;
$$;

-- Create function to store memory insights
CREATE OR REPLACE FUNCTION public.store_memory_insights(
  user_id_param UUID,
  insights_param TEXT,
  created_at_param TIMESTAMPTZ
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.ai_memory_insights (user_id, insights, created_at)
  VALUES (user_id_param, insights_param, created_at_param);
END;
$$;

-- Add RLS policy to the functions
GRANT EXECUTE ON FUNCTION public.get_latest_memory_insights TO authenticated;
GRANT EXECUTE ON FUNCTION public.store_memory_insights TO authenticated;
