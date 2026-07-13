/**
 * Supabase generated types placeholder.
 *
 * To generate the real types run:
 *   npx supabase gen types typescript --project-id <your-project-id> > types/supabase.ts
 *
 * Until then, this stub keeps TypeScript happy.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      tenants: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      team_members: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      client_users: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      clients: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      services: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      subscriptions: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      invoices: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      files: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      communications: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      email_templates: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      sequences: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      sequence_steps: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      affiliates: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      affiliate_clicks: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      affiliate_conversions: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      affiliate_commissions: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      affiliate_payouts: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      tickets: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      ticket_replies: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      ticket_status_log: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      ticket_attachments: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
