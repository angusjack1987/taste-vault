
-- Function to get the latest memory insights for a user
CREATE OR REPLACE FUNCTION get_latest_memory_insights(user_id_param UUID)
RETURNS TABLE (
  insights TEXT,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ai_memory_insights.insights,
    ai_memory_insights.created_at
  FROM 
    ai_memory_insights
  WHERE 
    user_id = user_id_param
  ORDER BY 
    created_at DESC
  LIMIT 1;
END;
$$;

-- Function to store memory insights for a user
CREATE OR REPLACE FUNCTION store_memory_insights(
  user_id_param UUID,
  insights_param TEXT,
  created_at_param TIMESTAMPTZ
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO ai_memory_insights (user_id, insights, created_at)
  VALUES (user_id_param, insights_param, created_at_param);
END;
$$;
