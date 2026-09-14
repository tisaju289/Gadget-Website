export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      banners: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          position: string
          sort_order: number
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          position?: string
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          position?: string
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_address: string
          customer_mobile: string
          customer_name: string
          delivery_fee: number
          delivery_option: string
          id: string
          items: Json
          note: string | null
          order_number: string
          payment_method: string
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_address: string
          customer_mobile: string
          customer_name: string
          delivery_fee?: number
          delivery_option?: string
          id?: string
          items?: Json
          note?: string | null
          order_number?: string
          payment_method?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_address?: string
          customer_mobile?: string
          customer_name?: string
          delivery_fee?: number
          delivery_option?: string
          id?: string
          items?: Json
          note?: string | null
          order_number?: string
          payment_method?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      preorders: {
        Row: {
          admin_note: string | null
          advance_paid: number
          budget: number | null
          created_at: string
          customer_address: string | null
          customer_mobile: string
          customer_name: string
          id: string
          note: string | null
          preorder_number: string
          product_image: string | null
          product_link: string | null
          product_name: string
          quantity: number
          status: string
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          advance_paid?: number
          budget?: number | null
          created_at?: string
          customer_address?: string | null
          customer_mobile: string
          customer_name: string
          id?: string
          note?: string | null
          preorder_number?: string
          product_image?: string | null
          product_link?: string | null
          product_name: string
          quantity?: number
          status?: string
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          advance_paid?: number
          budget?: number | null
          created_at?: string
          customer_address?: string | null
          customer_mobile?: string
          customer_name?: string
          id?: string
          note?: string | null
          preorder_number?: string
          product_image?: string | null
          product_link?: string | null
          product_name?: string
          quantity?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          brand: string | null
          category_id: string | null
          created_at: string
          description: string | null
          gallery: string[]
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          is_flash_sale: boolean
          is_new_arrival: boolean
          label: string | null
          name: string
          original_price: number | null
          price: number
          sku: string | null
          slug: string
          sort_order: number
          specifications: Json
          stock: number
          subcategory_id: string | null
          updated_at: string
          variations: Json
          warranty: string | null
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          gallery?: string[]
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_flash_sale?: boolean
          is_new_arrival?: boolean
          label?: string | null
          name: string
          original_price?: number | null
          price: number
          sku?: string | null
          slug: string
          sort_order?: number
          specifications?: Json
          stock?: number
          subcategory_id?: string | null
          updated_at?: string
          variations?: Json
          warranty?: string | null
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          gallery?: string[]
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_flash_sale?: boolean
          is_new_arrival?: boolean
          label?: string | null
          name?: string
          original_price?: number | null
          price?: number
          sku?: string | null
          slug?: string
          sort_order?: number
          specifications?: Json
          stock?: number
          subcategory_id?: string | null
          updated_at?: string
          variations?: Json
          warranty?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          auto_image_optimization: boolean
          bottom_nav_phone: string | null
          bottom_nav_whatsapp: string | null
          checkout_cod_label: string | null
          checkout_cod_note: string | null
          checkout_inside_fee: number | null
          checkout_inside_label: string | null
          checkout_inside_note: string | null
          checkout_outside_fee: number | null
          checkout_outside_label: string | null
          checkout_outside_note: string | null
          checkout_show_note_field: boolean
          checkout_success_message: string | null
          checkout_success_title: string | null
          checkout_terms_text: string | null
          checkout_title: string | null
          clarity_id: string | null
          custom_body_scripts: string | null
          custom_head_scripts: string | null
          favicon_url: string | null
          fb_capi_access_token: string | null
          fb_pixel_id: string | null
          fb_test_event_code: string | null
          footer_branches: Json
          footer_copyright: string | null
          footer_email: string | null
          footer_facebook: string | null
          footer_instagram: string | null
          footer_linkedin: string | null
          footer_tagline: string | null
          footer_youtube: string | null
          ga_api_secret: string | null
          ga_measurement_id: string | null
          google_ads_conversion_label: string | null
          google_ads_id: string | null
          gsc_verification: string | null
          gtm_id: string | null
          header_hotline: string | null
          home_best_selling_per_row: number
          home_brand_limit: number
          home_brand_per_row: number
          home_category_limit: number
          home_category_per_row: number
          home_featured_per_row: number
          home_new_arrivals_per_row: number
          hotjar_id: string | null
          id: string
          image_quality: number
          linkedin_partner_id: string | null
          logo_url: string | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          nav_category_links: Json
          nav_links: Json
          og_image_url: string | null
          pinterest_tag_id: string | null
          show_footer_branches: boolean
          show_footer_company: boolean
          show_footer_help: boolean
          show_footer_socials: boolean
          show_footer_terms: boolean
          show_header_search: boolean
          show_hotline: boolean
          show_megamenu: boolean
          show_mobile_bottom_nav: boolean
          show_nav_categories: boolean
          show_preorder_btn: boolean
          show_topbar: boolean
          singleton: boolean
          site_name: string
          snapchat_pixel_id: string | null
          tiktok_access_token: string | null
          tiktok_pixel_id: string | null
          topbar_links: Json
          topbar_phone: string | null
          twitter_pixel_id: string | null
          updated_at: string
        }
        Insert: {
          auto_image_optimization?: boolean
          bottom_nav_phone?: string | null
          bottom_nav_whatsapp?: string | null
          checkout_cod_label?: string | null
          checkout_cod_note?: string | null
          checkout_inside_fee?: number | null
          checkout_inside_label?: string | null
          checkout_inside_note?: string | null
          checkout_outside_fee?: number | null
          checkout_outside_label?: string | null
          checkout_outside_note?: string | null
          checkout_show_note_field?: boolean
          checkout_success_message?: string | null
          checkout_success_title?: string | null
          checkout_terms_text?: string | null
          checkout_title?: string | null
          clarity_id?: string | null
          custom_body_scripts?: string | null
          custom_head_scripts?: string | null
          favicon_url?: string | null
          fb_capi_access_token?: string | null
          fb_pixel_id?: string | null
          fb_test_event_code?: string | null
          footer_branches?: Json
          footer_copyright?: string | null
          footer_email?: string | null
          footer_facebook?: string | null
          footer_instagram?: string | null
          footer_linkedin?: string | null
          footer_tagline?: string | null
          footer_youtube?: string | null
          ga_api_secret?: string | null
          ga_measurement_id?: string | null
          google_ads_conversion_label?: string | null
          google_ads_id?: string | null
          gsc_verification?: string | null
          gtm_id?: string | null
          header_hotline?: string | null
          home_best_selling_per_row?: number
          home_brand_limit?: number
          home_brand_per_row?: number
          home_category_limit?: number
          home_category_per_row?: number
          home_featured_per_row?: number
          home_new_arrivals_per_row?: number
          hotjar_id?: string | null
          id?: string
          image_quality?: number
          linkedin_partner_id?: string | null
          logo_url?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          nav_category_links?: Json
          nav_links?: Json
          og_image_url?: string | null
          pinterest_tag_id?: string | null
          show_footer_branches?: boolean
          show_footer_company?: boolean
          show_footer_help?: boolean
          show_footer_socials?: boolean
          show_footer_terms?: boolean
          show_header_search?: boolean
          show_hotline?: boolean
          show_megamenu?: boolean
          show_mobile_bottom_nav?: boolean
          show_nav_categories?: boolean
          show_preorder_btn?: boolean
          show_topbar?: boolean
          singleton?: boolean
          site_name?: string
          snapchat_pixel_id?: string | null
          tiktok_access_token?: string | null
          tiktok_pixel_id?: string | null
          topbar_links?: Json
          topbar_phone?: string | null
          twitter_pixel_id?: string | null
          updated_at?: string
        }
        Update: {
          auto_image_optimization?: boolean
          bottom_nav_phone?: string | null
          bottom_nav_whatsapp?: string | null
          checkout_cod_label?: string | null
          checkout_cod_note?: string | null
          checkout_inside_fee?: number | null
          checkout_inside_label?: string | null
          checkout_inside_note?: string | null
          checkout_outside_fee?: number | null
          checkout_outside_label?: string | null
          checkout_outside_note?: string | null
          checkout_show_note_field?: boolean
          checkout_success_message?: string | null
          checkout_success_title?: string | null
          checkout_terms_text?: string | null
          checkout_title?: string | null
          clarity_id?: string | null
          custom_body_scripts?: string | null
          custom_head_scripts?: string | null
          favicon_url?: string | null
          fb_capi_access_token?: string | null
          fb_pixel_id?: string | null
          fb_test_event_code?: string | null
          footer_branches?: Json
          footer_copyright?: string | null
          footer_email?: string | null
          footer_facebook?: string | null
          footer_instagram?: string | null
          footer_linkedin?: string | null
          footer_tagline?: string | null
          footer_youtube?: string | null
          ga_api_secret?: string | null
          ga_measurement_id?: string | null
          google_ads_conversion_label?: string | null
          google_ads_id?: string | null
          gsc_verification?: string | null
          gtm_id?: string | null
          header_hotline?: string | null
          home_best_selling_per_row?: number
          home_brand_limit?: number
          home_brand_per_row?: number
          home_category_limit?: number
          home_category_per_row?: number
          home_featured_per_row?: number
          home_new_arrivals_per_row?: number
          hotjar_id?: string | null
          id?: string
          image_quality?: number
          linkedin_partner_id?: string | null
          logo_url?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          nav_category_links?: Json
          nav_links?: Json
          og_image_url?: string | null
          pinterest_tag_id?: string | null
          show_footer_branches?: boolean
          show_footer_company?: boolean
          show_footer_help?: boolean
          show_footer_socials?: boolean
          show_footer_terms?: boolean
          show_header_search?: boolean
          show_hotline?: boolean
          show_megamenu?: boolean
          show_mobile_bottom_nav?: boolean
          show_nav_categories?: boolean
          show_preorder_btn?: boolean
          show_topbar?: boolean
          singleton?: boolean
          site_name?: string
          snapchat_pixel_id?: string | null
          tiktok_access_token?: string | null
          tiktok_pixel_id?: string | null
          topbar_links?: Json
          topbar_phone?: string | null
          twitter_pixel_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
