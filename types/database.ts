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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      advocates: {
        Row: {
          bar: Database["public"]["Enums"]["bar_association"]
          chambers_address: string | null
          created_at: string | null
          email: string
          full_name: string
          hourly_rate: number
          id: string
          initials: string
          is_active: boolean | null
          phone_number: string | null
          postal_address: string | null
          practice_number: string
          updated_at: string | null
          user_role: Database["public"]["Enums"]["user_role"] | null
          year_admitted: number
        }
        Insert: {
          bar: Database["public"]["Enums"]["bar_association"]
          chambers_address?: string | null
          created_at?: string | null
          email: string
          full_name: string
          hourly_rate?: number
          id?: string
          initials: string
          is_active?: boolean | null
          phone_number?: string | null
          postal_address?: string | null
          practice_number: string
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
          year_admitted: number
        }
        Update: {
          bar?: Database["public"]["Enums"]["bar_association"]
          chambers_address?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          hourly_rate?: number
          id?: string
          initials?: string
          is_active?: boolean | null
          phone_number?: string | null
          postal_address?: string | null
          practice_number?: string
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
          year_admitted?: number
        }
        Relationships: []
      }
      document_extracted_data: {
        Row: {
          case_number: string | null
          case_title: string | null
          client_address: string | null
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string | null
          date_of_incident: string | null
          deadlines: Json | null
          description: string | null
          document_upload_id: string
          entities: Json | null
          estimated_amount: number | null
          extraction_confidence: number | null
          id: string
          law_firm: string | null
          parties: Json | null
          updated_at: string | null
          urgency: string | null
        }
        Insert: {
          case_number?: string | null
          case_title?: string | null
          client_address?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string | null
          date_of_incident?: string | null
          deadlines?: Json | null
          description?: string | null
          document_upload_id: string
          entities?: Json | null
          estimated_amount?: number | null
          extraction_confidence?: number | null
          id?: string
          law_firm?: string | null
          parties?: Json | null
          updated_at?: string | null
          urgency?: string | null
        }
        Update: {
          case_number?: string | null
          case_title?: string | null
          client_address?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string | null
          date_of_incident?: string | null
          deadlines?: Json | null
          description?: string | null
          document_upload_id?: string
          entities?: Json | null
          estimated_amount?: number | null
          extraction_confidence?: number | null
          id?: string
          law_firm?: string | null
          parties?: Json | null
          updated_at?: string | null
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_extracted_data_document_upload_id_fkey"
            columns: ["document_upload_id"]
            isOneToOne: false
            referencedRelation: "document_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      document_uploads: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          extracted_text: string | null
          file_size_bytes: number
          file_type: string
          file_url: string
          id: string
          matter_id: string | null
          mime_type: string | null
          original_filename: string
          processing_completed_at: string | null
          processing_error: string | null
          processing_started_at: string | null
          processing_status: string | null
          proforma_request_id: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          extracted_text?: string | null
          file_size_bytes: number
          file_type: string
          file_url: string
          id?: string
          matter_id?: string | null
          mime_type?: string | null
          original_filename: string
          processing_completed_at?: string | null
          processing_error?: string | null
          processing_started_at?: string | null
          processing_status?: string | null
          proforma_request_id?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          extracted_text?: string | null
          file_size_bytes?: number
          file_type?: string
          file_url?: string
          id?: string
          matter_id?: string | null
          mime_type?: string | null
          original_filename?: string
          processing_completed_at?: string | null
          processing_error?: string | null
          processing_started_at?: string | null
          processing_status?: string | null
          proforma_request_id?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_uploads_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_uploads_proforma_request_id_fkey"
            columns: ["proforma_request_id"]
            isOneToOne: false
            referencedRelation: "proforma_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_uploads_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "advocates"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          advocate_id: string
          amount: number
          category: string | null
          created_at: string | null
          description: string
          expense_date: string
          id: string
          invoice_id: string | null
          is_billed: boolean | null
          matter_id: string
          receipt_url: string | null
          updated_at: string | null
        }
        Insert: {
          advocate_id: string
          amount: number
          category?: string | null
          created_at?: string | null
          description: string
          expense_date?: string
          id?: string
          invoice_id?: string | null
          is_billed?: boolean | null
          matter_id: string
          receipt_url?: string | null
          updated_at?: string | null
        }
        Update: {
          advocate_id?: string
          amount?: number
          category?: string | null
          created_at?: string | null
          description?: string
          expense_date?: string
          id?: string
          invoice_id?: string | null
          is_billed?: boolean | null
          matter_id?: string
          receipt_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "advocates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          advocate_id: string
          amount_paid: number | null
          balance_due: number | null
          created_at: string | null
          disbursements_amount: number | null
          due_date: string
          fee_narrative: string | null
          fees_amount: number | null
          id: string
          internal_notes: string | null
          invoice_date: string
          invoice_number: string | null
          is_pro_forma: boolean | null
          matter_id: string | null
          paid_at: string | null
          sent_at: string | null
          source_proforma_id: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          subtotal: number | null
          total_amount: number | null
          updated_at: string | null
          vat_amount: number | null
          vat_rate: number | null
        }
        Insert: {
          advocate_id: string
          amount_paid?: number | null
          balance_due?: number | null
          created_at?: string | null
          disbursements_amount?: number | null
          due_date: string
          fee_narrative?: string | null
          fees_amount?: number | null
          id?: string
          internal_notes?: string | null
          invoice_date?: string
          invoice_number?: string | null
          is_pro_forma?: boolean | null
          matter_id?: string | null
          paid_at?: string | null
          sent_at?: string | null
          source_proforma_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number | null
          total_amount?: number | null
          updated_at?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Update: {
          advocate_id?: string
          amount_paid?: number | null
          balance_due?: number | null
          created_at?: string | null
          disbursements_amount?: number | null
          due_date?: string
          fee_narrative?: string | null
          fees_amount?: number | null
          id?: string
          internal_notes?: string | null
          invoice_date?: string
          invoice_number?: string | null
          is_pro_forma?: boolean | null
          matter_id?: string | null
          paid_at?: string | null
          sent_at?: string | null
          source_proforma_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number | null
          total_amount?: number | null
          updated_at?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "advocates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_source_proforma_id_fkey"
            columns: ["source_proforma_id"]
            isOneToOne: false
            referencedRelation: "proforma_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      matter_services: {
        Row: {
          created_at: string | null
          matter_id: string
          service_id: string
        }
        Insert: {
          created_at?: string | null
          matter_id: string
          service_id: string
        }
        Update: {
          created_at?: string | null
          matter_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matter_services_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matter_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      matters: {
        Row: {
          advocate_id: string
          client_address: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          client_type: Database["public"]["Enums"]["client_type"] | null
          closed_at: string | null
          court_case_number: string | null
          created_at: string | null
          date_instructed: string
          description: string | null
          estimated_fee: number | null
          expected_completion_date: string | null
          fee_cap: number | null
          fee_type: Database["public"]["Enums"]["fee_type"] | null
          id: string
          instructing_attorney: string
          instructing_attorney_email: string | null
          instructing_attorney_phone: string | null
          instructing_firm: string | null
          instructing_firm_ref: string | null
          is_prepopulated: boolean | null
          matter_type: string | null
          reference_number: string | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          settlement_probability: number | null
          source_proforma_id: string | null
          status: Database["public"]["Enums"]["matter_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          wip_value: number | null
        }
        Insert: {
          advocate_id: string
          client_address?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          client_type?: Database["public"]["Enums"]["client_type"] | null
          closed_at?: string | null
          court_case_number?: string | null
          created_at?: string | null
          date_instructed?: string
          description?: string | null
          estimated_fee?: number | null
          expected_completion_date?: string | null
          fee_cap?: number | null
          fee_type?: Database["public"]["Enums"]["fee_type"] | null
          id?: string
          instructing_attorney: string
          instructing_attorney_email?: string | null
          instructing_attorney_phone?: string | null
          instructing_firm?: string | null
          instructing_firm_ref?: string | null
          is_prepopulated?: boolean | null
          matter_type?: string | null
          reference_number?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          settlement_probability?: number | null
          source_proforma_id?: string | null
          status?: Database["public"]["Enums"]["matter_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          wip_value?: number | null
        }
        Update: {
          advocate_id?: string
          client_address?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          client_type?: Database["public"]["Enums"]["client_type"] | null
          closed_at?: string | null
          court_case_number?: string | null
          created_at?: string | null
          date_instructed?: string
          description?: string | null
          estimated_fee?: number | null
          expected_completion_date?: string | null
          fee_cap?: number | null
          fee_type?: Database["public"]["Enums"]["fee_type"] | null
          id?: string
          instructing_attorney?: string
          instructing_attorney_email?: string | null
          instructing_attorney_phone?: string | null
          instructing_firm?: string | null
          instructing_firm_ref?: string | null
          is_prepopulated?: boolean | null
          matter_type?: string | null
          reference_number?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          settlement_probability?: number | null
          source_proforma_id?: string | null
          status?: Database["public"]["Enums"]["matter_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          wip_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matters_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "advocates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matters_source_proforma_id_fkey"
            columns: ["source_proforma_id"]
            isOneToOne: false
            referencedRelation: "proforma_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          reference_number: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          reference_number?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      proforma_requests: {
        Row: {
          advocate_id: string
          converted_matter_id: string | null
          created_at: string | null
          estimated_amount: number | null
          expires_at: string | null
          id: string
          instructing_attorney_email: string | null
          instructing_attorney_name: string | null
          instructing_attorney_phone: string | null
          instructing_firm: string | null
          metadata: Json | null
          quote_number: string | null
          responded_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["proforma_request_status"] | null
          token: string | null
          updated_at: string | null
          urgency: string | null
          work_description: string | null
          work_title: string | null
        }
        Insert: {
          advocate_id: string
          converted_matter_id?: string | null
          created_at?: string | null
          estimated_amount?: number | null
          expires_at?: string | null
          id?: string
          instructing_attorney_email?: string | null
          instructing_attorney_name?: string | null
          instructing_attorney_phone?: string | null
          instructing_firm?: string | null
          metadata?: Json | null
          quote_number?: string | null
          responded_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["proforma_request_status"] | null
          token?: string | null
          updated_at?: string | null
          urgency?: string | null
          work_description?: string | null
          work_title?: string | null
        }
        Update: {
          advocate_id?: string
          converted_matter_id?: string | null
          created_at?: string | null
          estimated_amount?: number | null
          expires_at?: string | null
          id?: string
          instructing_attorney_email?: string | null
          instructing_attorney_name?: string | null
          instructing_attorney_phone?: string | null
          instructing_firm?: string | null
          metadata?: Json | null
          quote_number?: string | null
          responded_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["proforma_request_status"] | null
          token?: string | null
          updated_at?: string | null
          urgency?: string | null
          work_description?: string | null
          work_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proforma_requests_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "advocates"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_cards: {
        Row: {
          advocate_id: string
          created_at: string | null
          estimated_hours_max: number | null
          estimated_hours_min: number | null
          fixed_fee: number | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          matter_type: string | null
          maximum_fee: number | null
          minimum_fee: number | null
          pricing_type: Database["public"]["Enums"]["pricing_type"]
          requires_approval: boolean | null
          service_category: Database["public"]["Enums"]["rate_card_category"]
          service_description: string | null
          service_name: string
          updated_at: string | null
        }
        Insert: {
          advocate_id: string
          created_at?: string | null
          estimated_hours_max?: number | null
          estimated_hours_min?: number | null
          fixed_fee?: number | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          matter_type?: string | null
          maximum_fee?: number | null
          minimum_fee?: number | null
          pricing_type?: Database["public"]["Enums"]["pricing_type"]
          requires_approval?: boolean | null
          service_category: Database["public"]["Enums"]["rate_card_category"]
          service_description?: string | null
          service_name: string
          updated_at?: string | null
        }
        Update: {
          advocate_id?: string
          created_at?: string | null
          estimated_hours_max?: number | null
          estimated_hours_min?: number | null
          fixed_fee?: number | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          matter_type?: string | null
          maximum_fee?: number | null
          minimum_fee?: number | null
          pricing_type?: Database["public"]["Enums"]["pricing_type"]
          requires_approval?: boolean | null
          service_category?: Database["public"]["Enums"]["rate_card_category"]
          service_description?: string | null
          service_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_cards_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "advocates"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      standard_service_templates: {
        Row: {
          bar_association: Database["public"]["Enums"]["bar_association"] | null
          created_at: string | null
          default_fixed_fee: number | null
          default_hourly_rate: number | null
          estimated_hours: number | null
          id: string
          is_system_template: boolean | null
          matter_types: string[] | null
          service_category: Database["public"]["Enums"]["rate_card_category"]
          template_description: string | null
          template_name: string
          updated_at: string | null
        }
        Insert: {
          bar_association?:
            | Database["public"]["Enums"]["bar_association"]
            | null
          created_at?: string | null
          default_fixed_fee?: number | null
          default_hourly_rate?: number | null
          estimated_hours?: number | null
          id?: string
          is_system_template?: boolean | null
          matter_types?: string[] | null
          service_category: Database["public"]["Enums"]["rate_card_category"]
          template_description?: string | null
          template_name: string
          updated_at?: string | null
        }
        Update: {
          bar_association?:
            | Database["public"]["Enums"]["bar_association"]
            | null
          created_at?: string | null
          default_fixed_fee?: number | null
          default_hourly_rate?: number | null
          estimated_hours?: number | null
          id?: string
          is_system_template?: boolean | null
          matter_types?: string[] | null
          service_category?: Database["public"]["Enums"]["rate_card_category"]
          template_description?: string | null
          template_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          advocate_id: string
          amount: number | null
          created_at: string | null
          description: string
          entry_date: string
          hourly_rate: number
          hours: number
          id: string
          invoice_id: string | null
          is_billed: boolean | null
          matter_id: string
          updated_at: string | null
        }
        Insert: {
          advocate_id: string
          amount?: number | null
          created_at?: string | null
          description: string
          entry_date?: string
          hourly_rate: number
          hours: number
          id?: string
          invoice_id?: string | null
          is_billed?: boolean | null
          matter_id: string
          updated_at?: string | null
        }
        Update: {
          advocate_id?: string
          amount?: number | null
          created_at?: string | null
          description?: string
          entry_date?: string
          hourly_rate?: number
          hours?: number
          id?: string
          invoice_id?: string | null
          is_billed?: boolean | null
          matter_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "advocates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          notifications_enabled: boolean | null
          preferences: Json | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          notifications_enabled?: boolean | null
          preferences?: Json | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          notifications_enabled?: boolean | null
          preferences?: Json | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "advocates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_matter_reference: {
        Args: { p_bar: Database["public"]["Enums"]["bar_association"] }
        Returns: string
      }
      generate_quote_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      bar_association: "johannesburg" | "cape_town"
      client_type: "individual" | "corporate" | "government" | "ngo"
      fee_type: "hourly" | "fixed" | "contingency" | "hybrid"
      invoice_status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
      matter_status: "active" | "inactive" | "closed" | "on_hold"
      pricing_type: "hourly" | "fixed" | "per_item" | "percentage"
      proforma_request_status:
        | "draft"
        | "sent"
        | "accepted"
        | "declined"
        | "expired"
        | "converted"
      rate_card_category:
        | "consultation"
        | "research"
        | "drafting"
        | "court_appearance"
        | "negotiation"
        | "document_review"
        | "correspondence"
        | "filing"
        | "travel"
        | "other"
      risk_level: "low" | "medium" | "high"
      service_category:
        | "consultation"
        | "research"
        | "drafting"
        | "court_appearance"
        | "negotiation"
        | "document_review"
        | "correspondence"
        | "filing"
        | "travel"
        | "other"
      user_role: "junior_advocate" | "senior_advocate" | "chambers_admin"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      bar_association: ["johannesburg", "cape_town"],
      client_type: ["individual", "corporate", "government", "ngo"],
      fee_type: ["hourly", "fixed", "contingency", "hybrid"],
      invoice_status: ["draft", "sent", "paid", "overdue", "cancelled"],
      matter_status: ["active", "inactive", "closed", "on_hold"],
      pricing_type: ["hourly", "fixed", "per_item", "percentage"],
      proforma_request_status: [
        "draft",
        "sent",
        "accepted",
        "declined",
        "expired",
        "converted",
      ],
      rate_card_category: [
        "consultation",
        "research",
        "drafting",
        "court_appearance",
        "negotiation",
        "document_review",
        "correspondence",
        "filing",
        "travel",
        "other",
      ],
      risk_level: ["low", "medium", "high"],
      service_category: [
        "consultation",
        "research",
        "drafting",
        "court_appearance",
        "negotiation",
        "document_review",
        "correspondence",
        "filing",
        "travel",
        "other",
      ],
      user_role: ["junior_advocate", "senior_advocate", "chambers_admin"],
    },
  },
} as const
