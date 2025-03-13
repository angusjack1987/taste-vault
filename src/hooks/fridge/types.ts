
import { User } from "@supabase/supabase-js";

export interface FridgeItem {
  id: string;
  name: string;
  quantity?: string;
  category?: string;
  expiry_date?: string;
  always_available?: boolean;
  user_id: string;
  created_at: string;
}

export interface UseFridgeItemsResult {
  data: FridgeItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}
