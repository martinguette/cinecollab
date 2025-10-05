export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.4';
  };
  public: {
    Tables: {
      watchlists: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          created_at: string;
          invite_code: string | null;
          description: string | null;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          created_at?: string;
          invite_code?: string | null;
          description?: string | null;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          created_at?: string;
          invite_code?: string | null;
          description?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'watchlists_owner_id_fkey';
            columns: ['owner_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      watchlist_movies: {
        Row: {
          id: string;
          watchlist_id: string;
          media_id: number;
          media_type: 'movie' | 'tv';
          added_by: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          watchlist_id: string;
          media_id: number;
          media_type: 'movie' | 'tv';
          added_by: string;
          added_at?: string;
        };
        Update: {
          id?: string;
          watchlist_id?: string;
          media_id?: number;
          media_type?: 'movie' | 'tv';
          added_by?: string;
          added_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'watchlist_movies_watchlist_id_fkey';
            columns: ['watchlist_id'];
            referencedRelation: 'watchlists';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'watchlist_movies_added_by_fkey';
            columns: ['added_by'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      watchlist_members: {
        Row: {
          id: string;
          watchlist_id: string;
          user_id: string;
          joined_at: string;
          role: string | null;
        };
        Insert: {
          id?: string;
          watchlist_id: string;
          user_id: string;
          joined_at?: string;
          role?: string | null;
        };
        Update: {
          id?: string;
          watchlist_id?: string;
          user_id?: string;
          joined_at?: string;
          role?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'watchlist_members_watchlist_id_fkey';
            columns: ['watchlist_id'];
            referencedRelation: 'watchlists';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'watchlist_members_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      feedback: {
        Row: {
          id: string;
          user_id: string;
          type: 'bug' | 'suggestion' | 'feature' | 'compliment' | 'other';
          subject: string;
          message: string;
          language: 'en' | 'es';
          status:
            | 'pending'
            | 'reviewed'
            | 'in_progress'
            | 'resolved'
            | 'closed';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          created_at: string;
          updated_at: string;
          admin_notes: string | null;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'bug' | 'suggestion' | 'feature' | 'compliment' | 'other';
          subject: string;
          message: string;
          language: 'en' | 'es';
          status?:
            | 'pending'
            | 'reviewed'
            | 'in_progress'
            | 'resolved'
            | 'closed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          created_at?: string;
          updated_at?: string;
          admin_notes?: string | null;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'bug' | 'suggestion' | 'feature' | 'compliment' | 'other';
          subject?: string;
          message?: string;
          language?: 'en' | 'es';
          status?:
            | 'pending'
            | 'reviewed'
            | 'in_progress'
            | 'resolved'
            | 'closed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          created_at?: string;
          updated_at?: string;
          admin_notes?: string | null;
          resolved_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'feedback_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
      DefaultSchema['Views'])
  ? (DefaultSchema['Tables'] &
      DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
  ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
  ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
