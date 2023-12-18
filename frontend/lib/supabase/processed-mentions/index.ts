import { supabaseClientAdmin } from "..";
import { Database } from "../types";

export type SupabaseProcessedMention = Database["public"]["Tables"]["processed_mentions_dev"]["Row"];
export type SupabaseProcessedMentionInsert = Database["public"]["Tables"]["processed_mentions_dev"]["Insert"];

const envToTable = (tableName: string) => {
  switch (process.env.SUPABASE_ENV) {
    case "dev":
      return `${tableName}_dev`;
    case "production":
      return `${tableName}_prod`;
    default:
      return `${tableName}_dev`;
  }
};

export const insertProcessedMention = async (timestamp: Date) => {
  const { data, error } = await supabaseClientAdmin.from(envToTable("processed_mentions")).insert({
    last_timestamp: timestamp
  });
  if (error) {
    throw error;
  }
  return data;
};

export const getLastProcessedMentionTimestamp = async () => {
  const { data, error } = await supabaseClientAdmin
    .from(envToTable("processed_mentions"))
    .select("last_timestamp")
    .order("last_timestamp", { ascending: false })
    .limit(1)
    .single();
  if (error) {
    return null;
  }
  return data?.last_timestamp;
};
