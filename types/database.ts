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
      advocates_deprecated: {
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
      attorney_matter_access: {
        Row: {
          access_level: string
          attorney_user_id: string
          created_at: string
          granted_at: string
          granted_by: string | null
          id: string
          matter_id: string
          revoked_at: string | null
          revoked_by: string | null
          revoked_reason: string | null
          updated_at: string
        }
        Insert: {
          access_level?: string
          attorney_user_id: string
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          matter_id: string
          revoked_at?: string | null
          revoked_by?: string | null
          revoked_reason?: string | null
          updated_at?: string
        }
        Update: {
          access_level?: string
          attorney_user_id?: string
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          matter_id?: string
          revoked_at?: string | null
          revoked_by?: string | null
          revoked_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attorney_matter_access_attorney_user_id_fkey"
            columns: ["attorney_user_id"]
            isOneToOne: false
            referencedRelation: "attorney_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attorney_matter_access_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "advocates_deprecated"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attorney_matter_access_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attorney_matter_access_revoked_by_fkey"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "advocates_deprecated"
            referencedColumns: ["id"]
          },
        ]
      }
      attorney_users: {
        Row: {
          attorney_name: string
          created_at: string
          deleted_at: string | null
          email: string
          firm_name: string
          id: string
          last_login_at: string | null
          notification_preferences: Json | null
          password_hash: string
          phone_number: string | null
          practice_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attorney_name: string
          created_at?: string
          deleted_at?: string | null
          email: string
          firm_name: string
          id?: string
          last_login_at?: string | null
          notification_preferences?: Json | null
          password_hash: string
          phone_number?: string | null
          practice_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attorney_name?: string
          created_at?: string
          deleted_at?: string | null
          email?: string
          firm_name?: string
          id?: string
          last_login_at?: string | null
          notification_preferences?: Json | null
          password_hash?: string
          phone_number?: string | null
          practice_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          changes: Json | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_email: string | null
          user_id: string
          user_type: string
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_email?: string | null
          user_id: string
          user_type: string
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      cloud_storage_connections: {
        Row: {
          access_token: string
          advocate_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          last_sync_at: string | null
          provider: string
          provider_account_email: string | null
          provider_account_id: string
          provider_account_name: string | null
          refresh_token: string | null
          root_folder_id: string | null
          root_folder_path: string | null
          sync_error: string | null
          sync_status: string | null
          token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          access_token: string
          advocate_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_sync_at?: string | null
          provider: string
          provider_account_email?: string | null
          provider_account_id: string
          provider_account_name?: string | null
          refresh_token?: string | null
          root_folder_id?: string | null
          root_folder_path?: string | null
          sync_error?: string | null
          sync_status?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          advocate_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_sync_at?: string | null
          provider?: string
          provider_account_email?: string | null
          provider_account_id?: string
          provider_account_name?: string | null
          refresh_token?: string | null
          root_folder_id?: string | null
          root_folder_path?: string | null
          sync_error?: string | null
          sync_status?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cloud_storage_connections_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "advocates_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cloud_storage_connections_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cloud_storage_sync_log: {
        Row: {
          completed_at: string | null
          connection_id: string
          error_message: string | null
          file_size_bytes: number | null
          id: string
          local_document_id: string | null
          provider_file_id: string | null
          provider_file_path: string | null
          started_at: string | null
          status: string
          sync_duration_ms: number | null
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          connection_id: string
          error_message?: string | null
          file_size_bytes?: number | null
          id?: string
          local_document_id?: string | null
          provider_file_id?: string | null
          provider_file_path?: string | null
          started_at?: string | null
          status: string
          sync_duration_ms?: number | null
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          connection_id?: string
          error_message?: string | null
          file_size_bytes?: number | null
          id?: string
          local_document_id?: string | null
          provider_file_id?: string | null
          provider_file_path?: string | null
          started_at?: string | null
          status?: string
          sync_duration_ms?: number | null
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "cloud_storage_sync_log_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "cloud_storage_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cloud_storage_sync_log_local_document_id_fkey"
            columns: ["local_document_id"]
            isOneToOne: false
            referencedRelation: "document_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_notes: {
        Row: {
          advocate_id: string
          amount: number
          applied_at: string | null
          created_at: string
          credit_note_number: string
          deleted_at: string | null
          dispute_id: string | null
          id: string
          invoice_id: string
          issued_at: string | null
          reason: string
          reason_category: string | null
          status: string
          updated_at: string
        }
        Insert: {
          advocate_id: string
          amount: number
          applied_at?: string | null
          created_at?: string
          credit_note_number: string
          deleted_at?: string | null
          dispute_id?: string | null
          id?: string
          invoice_id: string
          issued_at?: string | null
          reason: string
          reason_category?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          advocate_id?: string
          amount?: number
          applied_at?: string | null
          created_at?: string
          credit_note_number?: string
          deleted_at?: string | null
          dispute_id?: string | null
          id?: string
          invoice_id?: string
          issued_at?: string | null
          reason?: string
          reason_category?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_notes_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "advocates_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "credit_notes_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "payment_disputes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      document_cloud_storage: {
        Row: {
          connection_id: string
          created_at: string | null
          document_upload_id: string
          id: string
          is_synced: boolean | null
          last_synced_at: string | null
          local_hash: string | null
          provider_download_url: string | null
          provider_file_id: string
          provider_file_path: string
          provider_hash: string | null
          provider_web_url: string | null
          updated_at: string | null
        }
        Insert: {
          connection_id: string
          created_at?: string | null
          document_upload_id: string
          id?: string
          is_synced?: boolean | null
          last_synced_at?: string | null
          local_hash?: string | null
          provider_download_url?: string | null
          provider_file_id: string
          provider_file_path: string
          provider_hash?: string | null
          provider_web_url?: string | null
          updated_at?: string | null
        }
        Update: {
          connection_id?: string
          created_at?: string | null
          document_upload_id?: string
          id?: string
          is_synced?: boolean | null
          last_synced_at?: string | null
          local_hash?: string | null
          provider_download_url?: string | null
          provider_file_id?: string
          provider_file_path?: string
          provider_hash?: string | null
          provider_web_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_cloud_storage_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "cloud_storage_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_cloud_storage_document_upload_id_fkey"
            columns: ["document_upload_id"]
            isOneToOne: false
            referencedRelation: "document_uploads"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "advocates_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_uploads_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      engagement_agreements: {
        Row: {
          advocate_id: string
          advocate_signature_data: string | null
          client_email: string | null
          client_name: string
          client_signature_data: string | null
          created_at: string
          deleted_at: string | null
          document_url: string | null
          fee_structure: string | null
          id: string
          link_sent_at: string | null
          link_sent_to: string | null
          matter_id: string | null
          proforma_request_id: string | null
          public_token: string | null
          scope_of_work: string | null
          signed_at: string | null
          status: string
          terms_and_conditions: string | null
          updated_at: string
        }
        Insert: {
          advocate_id: string
          advocate_signature_data?: string | null
          client_email?: string | null
          client_name: string
          client_signature_data?: string | null
          created_at?: string
          deleted_at?: string | null
          document_url?: string | null
          fee_structure?: string | null
          id?: string
          link_sent_at?: string | null
          link_sent_to?: string | null
          matter_id?: string | null
          proforma_request_id?: string | null
          public_token?: string | null
          scope_of_work?: string | null
          signed_at?: string | null
          status?: string
          terms_and_conditions?: string | null
          updated_at?: string
        }
        Update: {
          advocate_id?: string
          advocate_signature_data?: string | null
          client_email?: string | null
          client_name?: string
          client_signature_data?: string | null
          created_at?: string
          deleted_at?: string | null
          document_url?: string | null
          fee_structure?: string | null
          id?: string
          link_sent_at?: string | null
          link_sent_to?: string | null
          matter_id?: string | null
          proforma_request_id?: string | null
          public_token?: string | null
          scope_of_work?: string | null
          signed_at?: string | null
          status?: string
          terms_and_conditions?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "engagement_agreements_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "advocates_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engagement_agreements_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "engagement_agreements_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engagement_agreements_proforma_request_id_fkey"
            columns: ["proforma_request_id"]
            isOneToOne: false
            referencedRelation: "proforma_requests"
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
            referencedRelation: "advocates_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
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
          bar: Database["public"]["Enums"]["bar_association"] | null
          billing_period_end: string | null
          billing_period_start: string | null
          created_at: string | null
          deleted_at: string | null
          disbursements_amount: number | null
          due_date: string
          fee_narrative: string | null
          fees_amount: number | null
          id: string
          internal_notes: string | null
          invoice_date: string
          invoice_number: string | null
          invoice_sequence: number | null
          invoice_type: string | null
          is_pro_forma: boolean | null
          matter_id: string | null
          milestone_description: string | null
          paid_at: string | null
          partner_approved_at: string | null
          partner_approved_by: string | null
          payment_status: string | null
          reminder_history: Json | null
          reminders_sent: number | null
          sent_at: string | null
          source_proforma_id: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          subtotal: number | null
          total_amount: number | null
          updated_at: string | null
          vat_amount: number | null
          vat_rate: number | null
          written_off_amount: number | null
          written_off_at: string | null
          written_off_by: string | null
        }
        Insert: {
          advocate_id: string
          amount_paid?: number | null
          balance_due?: number | null
          bar?: Database["public"]["Enums"]["bar_association"] | null
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string | null
          deleted_at?: string | null
          disbursements_amount?: number | null
          due_date: string
          fee_narrative?: string | null
          fees_amount?: number | null
          id?: string
          internal_notes?: string | null
          invoice_date?: string
          invoice_number?: string | null
          invoice_sequence?: number | null
          invoice_type?: string | null
          is_pro_forma?: boolean | null
          matter_id?: string | null
          milestone_description?: string | null
          paid_at?: string | null
          partner_approved_at?: string | null
          partner_approved_by?: string | null
          payment_status?: string | null
          reminder_history?: Json | null
          reminders_sent?: number | null
          sent_at?: string | null
          source_proforma_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number | null
          total_amount?: number | null
          updated_at?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
          written_off_amount?: number | null
          written_off_at?: string | null
          written_off_by?: string | null
        }
        Update: {
          advocate_id?: string
          amount_paid?: number | null
          balance_due?: number | null
          bar?: Database["public"]["Enums"]["bar_association"] | null
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string | null
          deleted_at?: string | null
          disbursements_amount?: number | null
          due_date?: string
          fee_narrative?: string | null
          fees_amount?: number | null
          id?: string
          internal_notes?: string | null
          invoice_date?: string
          invoice_number?: string | null
          invoice_sequence?: number | null
          invoice_type?: string | null
          is_pro_forma?: boolean | null
          matter_id?: string | null
          milestone_description?: string | null
          paid_at?: string | null
          partner_approved_at?: string | null
          partner_approved_by?: string | null
          payment_status?: string | null
          reminder_history?: Json | null
          reminders_sent?: number | null
          sent_at?: string | null
          source_proforma_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number | null
          total_amount?: number | null
          updated_at?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
          written_off_amount?: number | null
          written_off_at?: string | null
          written_off_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "advocates_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "invoices_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_partner_approved_by_fkey"
            columns: ["partner_approved_by"]
            isOneToOne: false
            referencedRelation: "advocates_deprecated"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_source_proforma_id_fkey"
            columns: ["source_proforma_id"]
            isOneToOne: false
            referencedRelation: "proforma_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_written_off_by_fkey"
            columns: ["written_off_by"]
            isOneToOne: false
            referencedRelation: "advocates_deprecated"
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
          agreed_fee_cap: number | null
          agreed_hourly_rate: number | null
          agreed_timeline_days: number | null
          billing_ready_at: string | null
          billing_review_notes: string | null
          billing_status: string | null
          client_address: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          client_type: Database["public"]["Enums"]["client_type"] | null
          closed_at: string | null
          completion_status: string | null
          court_case_number: string | null
          court_date: string | null
          created_at: string | null
          date_instructed: string
          deleted_at: string | null
          description: string | null
          engagement_agreement_id: string | null
          estimated_fee: number | null
          estimated_total: number | null
          expected_completion_date: string | null
          fee_cap: number | null
          fee_type: Database["public"]["Enums"]["fee_type"] | null
          id: string
          instructing_attorney: string
          instructing_attorney_email: string | null
          instructing_attorney_phone: string | null
          instructing_attorney_user_id: string | null
          instructing_firm: string | null
          instructing_firm_ref: string | null
          is_prepopulated: boolean | null
          is_urgent: boolean | null
          matter_type: string | null
          partner_approved_at: string | null
          partner_approved_by: string | null
          paused_at: string | null
          paused_reason: string | null
          pro_forma_waived: boolean | null
          reference_number: string | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          settlement_probability: number | null
          source_proforma_id: string | null
          state: string | null
          status: Database["public"]["Enums"]["matter_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          urgency_reason: string | null
          user_id: string | null
          wip_value: number | null
        }
        Insert: {
          advocate_id: string
          agreed_fee_cap?: number | null
          agreed_hourly_rate?: number | null
          agreed_timeline_days?: number | null
          billing_ready_at?: string | null
          billing_review_notes?: string | null
          billing_status?: string | null
          client_address?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          client_type?: Database["public"]["Enums"]["client_type"] | null
          closed_at?: string | null
          completion_status?: string | null
          court_case_number?: string | null
          court_date?: string | null
          created_at?: string | null
          date_instructed?: string
          deleted_at?: string | null
          description?: string | null
          engagement_agreement_id?: string | null
          estimated_fee?: number | null
          estimated_total?: number | null
          expected_completion_date?: string | null
          fee_cap?: number | null
          fee_type?: Database["public"]["Enums"]["fee_type"] | null
          id?: string
          instructing_attorney: string
          instructing_attorney_email?: string | null
          instructing_attorney_phone?: string | null
          instructing_attorney_user_id?: string | null
          instructing_firm?: string | null
          instructing_firm_ref?: string | null
          is_prepopulated?: boolean | null
          is_urgent?: boolean | null
          matter_type?: string | null
          partner_approved_at?: string | null
          partner_approved_by?: string | null
          paused_at?: string | null
          paused_reason?: string | null
          pro_forma_waived?: boolean | null
          reference_number?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          settlement_probability?: number | null
          source_proforma_id?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["matter_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          urgency_reason?: string | null
          user_id?: string | null
          wip_value?: number | null
        }
        Update: {
          advocate_id?: string
          agreed_fee_cap?: number | null
          agreed_hourly_rate?: number | null
          agreed_timeline_days?: number | null
          billing_ready_at?: string | null
          billing_review_notes?: string | null
          billing_status?: string | null
          client_address?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          client_type?: Database["public"]["Enums"]["client_type"] | null
          closed_at?: string | null
          completion_status?: string | null
          court_case_number?: string | null
          court_date?: string | null
          created_at?: string | null
          date_instructed?: string
          deleted_at?: string | null
          description?: string | null
          engagement_agreement_id?: string | null
          estimated_fee?: number | null
          estimated_total?: number | null
          expected_completion_date?: string | null
          fee_cap?: number | null
          fee_type?: Database["public"]["Enums"]["fee_type"] | null
          id?: string
          instructing_attorney?: string
          instructing_attorney_email?: string | null
          instructing_attorney_phone?: string | null
          instructing_attorney_user_id?: string | null
          instructing_firm?: string | null
          instructing_firm_ref?: string | null
          is_prepopulated?: boolean | null
          is_urgent?: boolean | null
          matter_type?: string | null
          partner_approved_at?: string | null
          partner_approved_by?: string | null
          paused_at?: string | null
          paused_reason?: string | null
          pro_forma_waived?: boolean | null
          reference_number?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          settlement_probability?: number | null
          source_proforma_id?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["matter_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          urgency_reason?: string | null
          user_id?: string | null
          wip_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matters_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "advocates_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matters_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "matters_engagement_agreement_id_fkey"
            columns: ["engagement_agreement_id"]
            isOneToOne: false
            referencedRelation: "engagement_agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matters_instructing_attorney_user_id_fkey"
            columns: ["instructing_attorney_user_id"]
            isOneToOne: false
            referencedRelation: "attorney_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matters_partner_approved_by_fkey"
            columns: ["partner_approved_by"]
            isOneToOne: false
            referencedRelation: "advocates_deprecated"
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
      notifications: {
        Row: {
          channels: Json | null
          created_at: string
          email_sent: boolean | null
          email_sent_at: string | null
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          read_at: string | null
          recipient_id: string
          recipient_type: string
          related_invoice_id: string | null
          related_matter_id: string | null
          related_proforma_id: string | null
          sent_at: string | null
          sms_sent: boolean | null
          sms_sent_at: string | null
          title: string
        }
        Insert: {
          channels?: Json | null
          created_at?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          read_at?: string | null
          recipient_id: string
          recipient_type: string
          related_invoice_id?: string | null
          related_matter_id?: string | null
          related_proforma_id?: string | null
          sent_at?: string | null
          sms_sent?: boolean | null
          sms_sent_at?: string | null
          title: string
        }
        Update: {
          channels?: Json | null
          created_at?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          recipient_id?: string
          recipient_type?: string
          related_invoice_id?: string | null
          related_matter_id?: string | null
          related_proforma_id?: string | null
          sent_at?: string | null
          sms_sent?: boolean | null
          sms_sent_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_invoice_id_fkey"
            columns: ["related_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_matter_id_fkey"
            columns: ["related_matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_proforma_id_fkey"
            columns: ["related_proforma_id"]
            isOneToOne: false
            referencedRelation: "proforma_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_approvals: {
        Row: {
          approved_at: string | null
          checklist: Json | null
          comments: string | null
          created_at: string | null
          id: string
          matter_id: string
          partner_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          checklist?: Json | null
          comments?: string | null
          created_at?: string | null
          id?: string
          matter_id: string
          partner_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          checklist?: Json | null
          comments?: string | null
          created_at?: string | null
          id?: string
          matter_id?: string
          partner_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_approvals_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_disputes: {
        Row: {
          advocate_id: string
          advocate_response: string | null
          client_notes: string | null
          created_at: string
          deleted_at: string | null
          dispute_reason: string
          dispute_type: string
          disputed_amount: number | null
          evidence_urls: string[] | null
          id: string
          invoice_id: string
          resolution_notes: string | null
          resolution_type: string | null
          resolved_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          advocate_id: string
          advocate_response?: string | null
          client_notes?: string | null
          created_at?: string
          deleted_at?: string | null
          dispute_reason: string
          dispute_type: string
          disputed_amount?: number | null
          evidence_urls?: string[] | null
          id?: string
          invoice_id: string
          resolution_notes?: string | null
          resolution_type?: string | null
          resolved_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          advocate_id?: string
          advocate_response?: string | null
          client_notes?: string | null
          created_at?: string
          deleted_at?: string | null
          dispute_reason?: string
          dispute_type?: string
          disputed_amount?: number | null
          evidence_urls?: string[] | null
          id?: string
          invoice_id?: string
          resolution_notes?: string | null
          resolution_type?: string | null
          resolved_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_disputes_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "advocates_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_disputes_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payment_disputes_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          gateway_reference: string | null
          gateway_transaction_id: string | null
          id: string
          metadata: Json | null
          payment_gateway: Database["public"]["Enums"]["payment_gateway"]
          status: Database["public"]["Enums"]["payment_status"]
          subscription_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          gateway_reference?: string | null
          gateway_transaction_id?: string | null
          id?: string
          metadata?: Json | null
          payment_gateway: Database["public"]["Enums"]["payment_gateway"]
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          gateway_reference?: string | null
          gateway_transaction_id?: string | null
          id?: string
          metadata?: Json | null
          payment_gateway?: Database["public"]["Enums"]["payment_gateway"]
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
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
      pdf_templates: {
        Row: {
          advocate_id: string
          color_scheme: Json
          created_at: string | null
          description: string | null
          footer: Json
          header: Json
          id: string
          is_default: boolean | null
          name: string
          page_margins: Json
          sections: Json
          table: Json
          updated_at: string | null
        }
        Insert: {
          advocate_id: string
          color_scheme: Json
          created_at?: string | null
          description?: string | null
          footer: Json
          header: Json
          id?: string
          is_default?: boolean | null
          name: string
          page_margins: Json
          sections: Json
          table: Json
          updated_at?: string | null
        }
        Update: {
          advocate_id?: string
          color_scheme?: Json
          created_at?: string | null
          description?: string | null
          footer?: Json
          header?: Json
          id?: string
          is_default?: boolean | null
          name?: string
          page_margins?: Json
          sections?: Json
          table?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pdf_templates_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "advocates_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdf_templates_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      proforma_requests: {
        Row: {
          advocate_id: string
          client_response_status: string | null
          converted_matter_id: string | null
          created_at: string | null
          deleted_at: string | null
          estimated_amount: number | null
          estimated_total: number | null
          expires_at: string | null
          id: string
          instructing_attorney_email: string | null
          instructing_attorney_name: string | null
          instructing_attorney_phone: string | null
          instructing_firm: string | null
          link_sent_at: string | null
          link_sent_to: string | null
          metadata: Json | null
          negotiation_history: Json | null
          public_token: string | null
          quote_number: string | null
          rate_card_id: string | null
          rejection_date: string | null
          rejection_reason: string | null
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
          client_response_status?: string | null
          converted_matter_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          estimated_amount?: number | null
          estimated_total?: number | null
          expires_at?: string | null
          id?: string
          instructing_attorney_email?: string | null
          instructing_attorney_name?: string | null
          instructing_attorney_phone?: string | null
          instructing_firm?: string | null
          link_sent_at?: string | null
          link_sent_to?: string | null
          metadata?: Json | null
          negotiation_history?: Json | null
          public_token?: string | null
          quote_number?: string | null
          rate_card_id?: string | null
          rejection_date?: string | null
          rejection_reason?: string | null
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
          client_response_status?: string | null
          converted_matter_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          estimated_amount?: number | null
          estimated_total?: number | null
          expires_at?: string | null
          id?: string
          instructing_attorney_email?: string | null
          instructing_attorney_name?: string | null
          instructing_attorney_phone?: string | null
          instructing_firm?: string | null
          link_sent_at?: string | null
          link_sent_to?: string | null
          metadata?: Json | null
          negotiation_history?: Json | null
          public_token?: string | null
          quote_number?: string | null
          rate_card_id?: string | null
          rejection_date?: string | null
          rejection_reason?: string | null
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
            referencedRelation: "advocates_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proforma_requests_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "proforma_requests_rate_card_id_fkey"
            columns: ["rate_card_id"]
            isOneToOne: false
            referencedRelation: "rate_cards"
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
            referencedRelation: "advocates_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_cards_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      retainer_agreements: {
        Row: {
          advocate_id: string
          auto_renew: boolean | null
          billing_period: string | null
          can_fund_multiple_matters: boolean | null
          client_id: string | null
          created_at: string
          deleted_at: string | null
          end_date: string | null
          engagement_agreement_id: string | null
          id: string
          low_balance_alert_sent: boolean | null
          low_balance_threshold: number | null
          matter_id: string | null
          retainer_amount: number
          retainer_type: string
          start_date: string
          status: string
          total_deposited: number | null
          total_drawn: number | null
          trust_account_balance: number | null
          updated_at: string
        }
        Insert: {
          advocate_id: string
          auto_renew?: boolean | null
          billing_period?: string | null
          can_fund_multiple_matters?: boolean | null
          client_id?: string | null
          created_at?: string
          deleted_at?: string | null
          end_date?: string | null
          engagement_agreement_id?: string | null
          id?: string
          low_balance_alert_sent?: boolean | null
          low_balance_threshold?: number | null
          matter_id?: string | null
          retainer_amount: number
          retainer_type: string
          start_date: string
          status?: string
          total_deposited?: number | null
          total_drawn?: number | null
          trust_account_balance?: number | null
          updated_at?: string
        }
        Update: {
          advocate_id?: string
          auto_renew?: boolean | null
          billing_period?: string | null
          can_fund_multiple_matters?: boolean | null
          client_id?: string | null
          created_at?: string
          deleted_at?: string | null
          end_date?: string | null
          engagement_agreement_id?: string | null
          id?: string
          low_balance_alert_sent?: boolean | null
          low_balance_threshold?: number | null
          matter_id?: string | null
          retainer_amount?: number
          retainer_type?: string
          start_date?: string
          status?: string
          total_deposited?: number | null
          total_drawn?: number | null
          trust_account_balance?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retainer_agreements_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "advocates_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retainer_agreements_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "retainer_agreements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "attorney_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retainer_agreements_engagement_agreement_id_fkey"
            columns: ["engagement_agreement_id"]
            isOneToOne: false
            referencedRelation: "engagement_agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retainer_agreements_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
        ]
      }
      scope_amendments: {
        Row: {
          advocate_id: string
          amendment_type: string
          approved_at: string | null
          client_approved_at: string | null
          client_notified_at: string | null
          client_rejection_reason: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          engagement_agreement_id: string | null
          id: string
          matter_id: string
          new_estimate: number | null
          original_estimate: number | null
          reason: string
          rejected_at: string | null
          requested_at: string
          status: string
          updated_at: string
          variance_amount: number | null
          variance_percentage: number | null
        }
        Insert: {
          advocate_id: string
          amendment_type: string
          approved_at?: string | null
          client_approved_at?: string | null
          client_notified_at?: string | null
          client_rejection_reason?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          engagement_agreement_id?: string | null
          id?: string
          matter_id: string
          new_estimate?: number | null
          original_estimate?: number | null
          reason: string
          rejected_at?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          variance_amount?: number | null
          variance_percentage?: number | null
        }
        Update: {
          advocate_id?: string
          amendment_type?: string
          approved_at?: string | null
          client_approved_at?: string | null
          client_notified_at?: string | null
          client_rejection_reason?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          engagement_agreement_id?: string | null
          id?: string
          matter_id?: string
          new_estimate?: number | null
          original_estimate?: number | null
          reason?: string
          rejected_at?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          variance_amount?: number | null
          variance_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scope_amendments_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "advocates_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scope_amendments_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "scope_amendments_engagement_agreement_id_fkey"
            columns: ["engagement_agreement_id"]
            isOneToOne: false
            referencedRelation: "engagement_agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scope_amendments_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
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
      subscription_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          reason: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          subscription_id: string
          tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          reason?: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          subscription_id: string
          tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          subscription_id?: string
          tier?: Database["public"]["Enums"]["subscription_tier"]
        }
        Relationships: [
          {
            foreignKeyName: "subscription_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          additional_users: number
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string
          current_period_start: string
          gateway_customer_id: string | null
          gateway_subscription_id: string | null
          id: string
          payment_gateway: Database["public"]["Enums"]["payment_gateway"] | null
          status: Database["public"]["Enums"]["subscription_status"]
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_users?: number
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          gateway_customer_id?: string | null
          gateway_subscription_id?: string | null
          id?: string
          payment_gateway?:
            | Database["public"]["Enums"]["payment_gateway"]
            | null
          status?: Database["public"]["Enums"]["subscription_status"]
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_users?: number
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          gateway_customer_id?: string | null
          gateway_subscription_id?: string | null
          id?: string
          payment_gateway?:
            | Database["public"]["Enums"]["payment_gateway"]
            | null
          status?: Database["public"]["Enums"]["subscription_status"]
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          invited_at: string
          invited_by: string
          last_name: string
          organization_id: string
          role: Database["public"]["Enums"]["team_member_role"]
          status: Database["public"]["Enums"]["team_member_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          invited_at?: string
          invited_by: string
          last_name: string
          organization_id: string
          role?: Database["public"]["Enums"]["team_member_role"]
          status?: Database["public"]["Enums"]["team_member_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          invited_at?: string
          invited_by?: string
          last_name?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["team_member_role"]
          status?: Database["public"]["Enums"]["team_member_status"]
          updated_at?: string
          user_id?: string | null
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
            referencedRelation: "advocates_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
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
      trust_transactions: {
        Row: {
          advocate_id: string
          amount: number
          balance_after: number
          balance_before: number
          created_at: string
          deleted_at: string | null
          description: string
          id: string
          reference: string | null
          related_expense_id: string | null
          related_invoice_id: string | null
          related_time_entry_id: string | null
          retainer_agreement_id: string
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          advocate_id: string
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string
          deleted_at?: string | null
          description: string
          id?: string
          reference?: string | null
          related_expense_id?: string | null
          related_invoice_id?: string | null
          related_time_entry_id?: string | null
          retainer_agreement_id: string
          transaction_date?: string
          transaction_type: string
        }
        Update: {
          advocate_id?: string
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: string
          reference?: string | null
          related_expense_id?: string | null
          related_invoice_id?: string | null
          related_time_entry_id?: string | null
          retainer_agreement_id?: string
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "trust_transactions_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "advocates_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_transactions_advocate_id_fkey"
            columns: ["advocate_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "trust_transactions_related_expense_id_fkey"
            columns: ["related_expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_transactions_related_invoice_id_fkey"
            columns: ["related_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_transactions_related_time_entry_id_fkey"
            columns: ["related_time_entry_id"]
            isOneToOne: false
            referencedRelation: "time_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_transactions_retainer_agreement_id_fkey"
            columns: ["retainer_agreement_id"]
            isOneToOne: false
            referencedRelation: "retainer_agreements"
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
            referencedRelation: "advocates_deprecated"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          banking_details: Json | null
          bar: Database["public"]["Enums"]["bar_association"] | null
          chambers_address: string | null
          city: string | null
          contingency_rate: number | null
          created_at: string
          email: string | null
          firm_logo_url: string | null
          firm_name: string | null
          firm_tagline: string | null
          first_name: string | null
          hourly_rate: number | null
          id: string
          initials: string | null
          invoice_settings: Json | null
          is_active: boolean | null
          last_login_at: string | null
          last_name: string | null
          notification_preferences: Json | null
          phone: string | null
          postal_address: string | null
          postal_code: string | null
          practice_name: string | null
          practice_number: string | null
          province: string | null
          success_fee_rate: number | null
          updated_at: string
          user_id: string
          user_role: Database["public"]["Enums"]["user_role"] | null
          vat_number: string | null
          year_admitted: number | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          banking_details?: Json | null
          bar?: Database["public"]["Enums"]["bar_association"] | null
          chambers_address?: string | null
          city?: string | null
          contingency_rate?: number | null
          created_at?: string
          email?: string | null
          firm_logo_url?: string | null
          firm_name?: string | null
          firm_tagline?: string | null
          first_name?: string | null
          hourly_rate?: number | null
          id?: string
          initials?: string | null
          invoice_settings?: Json | null
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          postal_address?: string | null
          postal_code?: string | null
          practice_name?: string | null
          practice_number?: string | null
          province?: string | null
          success_fee_rate?: number | null
          updated_at?: string
          user_id: string
          user_role?: Database["public"]["Enums"]["user_role"] | null
          vat_number?: string | null
          year_admitted?: number | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          banking_details?: Json | null
          bar?: Database["public"]["Enums"]["bar_association"] | null
          chambers_address?: string | null
          city?: string | null
          contingency_rate?: number | null
          created_at?: string
          email?: string | null
          firm_logo_url?: string | null
          firm_name?: string | null
          firm_tagline?: string | null
          first_name?: string | null
          hourly_rate?: number | null
          id?: string
          initials?: string | null
          invoice_settings?: Json | null
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          postal_address?: string | null
          postal_code?: string | null
          practice_name?: string | null
          practice_number?: string | null
          province?: string | null
          success_fee_rate?: number | null
          updated_at?: string
          user_id?: string
          user_role?: Database["public"]["Enums"]["user_role"] | null
          vat_number?: string | null
          year_admitted?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      advocates_view: {
        Row: {
          bar: Database["public"]["Enums"]["bar_association"] | null
          chambers_address: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          hourly_rate: number | null
          id: string | null
          initials: string | null
          is_active: boolean | null
          last_login_at: string | null
          phone_number: string | null
          postal_address: string | null
          practice_number: string | null
          updated_at: string | null
          user_role: Database["public"]["Enums"]["user_role"] | null
          year_admitted: number | null
        }
        Insert: {
          bar?: Database["public"]["Enums"]["bar_association"] | null
          chambers_address?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: never
          hourly_rate?: number | null
          id?: string | null
          initials?: string | null
          is_active?: boolean | null
          last_login_at?: string | null
          phone_number?: string | null
          postal_address?: string | null
          practice_number?: string | null
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
          year_admitted?: number | null
        }
        Update: {
          bar?: Database["public"]["Enums"]["bar_association"] | null
          chambers_address?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: never
          hourly_rate?: number | null
          id?: string | null
          initials?: string | null
          is_active?: boolean | null
          last_login_at?: string | null
          phone_number?: string | null
          postal_address?: string | null
          practice_number?: string | null
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
          year_admitted?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_subscription_limits: {
        Args: { p_action: string; p_user_id: string }
        Returns: boolean
      }
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
      regenerate_public_token: {
        Args: { record_id: string; table_name: string }
        Returns: string
      }
    }
    Enums: {
      bar_association: "johannesburg" | "cape_town"
      client_type: "individual" | "corporate" | "government" | "ngo"
      fee_type: "hourly" | "fixed" | "contingency" | "hybrid"
      invoice_status:
        | "draft"
        | "sent"
        | "paid"
        | "overdue"
        | "cancelled"
        | "pro_forma"
      matter_status: "active" | "inactive" | "closed" | "on_hold"
      payment_gateway: "paystack" | "payfast"
      payment_status: "pending" | "completed" | "failed" | "refunded"
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
      subscription_status:
        | "active"
        | "cancelled"
        | "past_due"
        | "trialing"
        | "expired"
      subscription_tier: "admission" | "advocate" | "senior_counsel"
      team_member_role: "admin" | "advocate" | "secretary"
      team_member_status: "active" | "pending" | "inactive"
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
      invoice_status: [
        "draft",
        "sent",
        "paid",
        "overdue",
        "cancelled",
        "pro_forma",
      ],
      matter_status: ["active", "inactive", "closed", "on_hold"],
      payment_gateway: ["paystack", "payfast"],
      payment_status: ["pending", "completed", "failed", "refunded"],
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
      subscription_status: [
        "active",
        "cancelled",
        "past_due",
        "trialing",
        "expired",
      ],
      subscription_tier: ["admission", "advocate", "senior_counsel"],
      team_member_role: ["admin", "advocate", "secretary"],
      team_member_status: ["active", "pending", "inactive"],
      user_role: ["junior_advocate", "senior_advocate", "chambers_admin"],
    },
  },
} as const
