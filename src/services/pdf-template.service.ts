import { supabase } from '../lib/supabase';
import { PDFTemplate, createDefaultTemplate } from '../types/pdf-template.types';
import { toast } from 'react-hot-toast';

export class PDFTemplateService {
  private static instance: PDFTemplateService;

  public static getInstance(): PDFTemplateService {
    if (!PDFTemplateService.instance) {
      PDFTemplateService.instance = new PDFTemplateService();
    }
    return PDFTemplateService.instance;
  }

  async getTemplates(advocateId: string): Promise<PDFTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('pdf_templates')
        .select('*')
        .eq('advocate_id', advocateId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        ...item,
        colorScheme: item.color_scheme,
        pageMargins: item.page_margins,
      })) as PDFTemplate[];
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [createDefaultTemplate()];
    }
  }

  async getDefaultTemplate(advocateId: string): Promise<PDFTemplate> {
    try {
      const { data, error } = await supabase
        .from('pdf_templates')
        .select('*')
        .eq('advocate_id', advocateId)
        .eq('is_default', true)
        .single();

      if (error || !data) {
        return createDefaultTemplate();
      }

      return {
        ...data,
        colorScheme: data.color_scheme,
        pageMargins: data.page_margins,
      } as PDFTemplate;
    } catch (error) {
      console.error('Error fetching default template:', error);
      return createDefaultTemplate();
    }
  }

  async saveTemplate(advocateId: string, template: PDFTemplate): Promise<PDFTemplate> {
    try {
      const templateData = {
        id: template.id === 'default' ? undefined : template.id,
        advocate_id: advocateId,
        name: template.name,
        description: template.description,
        color_scheme: template.colorScheme,
        header: template.header,
        footer: template.footer,
        sections: template.sections,
        table: template.table,
        page_margins: template.pageMargins,
        is_default: template.is_default || false,
        updated_at: new Date().toISOString(),
      };

      if (template.is_default) {
        await supabase
          .from('pdf_templates')
          .update({ is_default: false })
          .eq('advocate_id', advocateId);
      }

      const { data, error } = await supabase
        .from('pdf_templates')
        .upsert(templateData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Template saved successfully');
      return {
        ...data,
        colorScheme: data.color_scheme,
        pageMargins: data.page_margins,
      } as PDFTemplate;
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
      throw error;
    }
  }

  async deleteTemplate(templateId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('pdf_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
      throw error;
    }
  }

  async uploadLogo(advocateId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${advocateId}/logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('pdf-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('pdf-assets')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
      throw error;
    }
  }

  async deleteLogo(logoUrl: string): Promise<void> {
    try {
      const path = logoUrl.split('/pdf-assets/')[1];
      if (!path) return;

      const { error } = await supabase.storage
        .from('pdf-assets')
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting logo:', error);
    }
  }
}

export const pdfTemplateService = PDFTemplateService.getInstance();
