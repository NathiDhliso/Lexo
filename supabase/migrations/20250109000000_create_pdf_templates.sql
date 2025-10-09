-- Create PDF templates table
CREATE TABLE IF NOT EXISTS pdf_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color_scheme JSONB NOT NULL,
  header JSONB NOT NULL,
  footer JSONB NOT NULL,
  sections JSONB NOT NULL,
  "table" JSONB NOT NULL,
  page_margins JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_pdf_templates_advocate_id ON pdf_templates(advocate_id);
CREATE INDEX idx_pdf_templates_is_default ON pdf_templates(advocate_id, is_default) WHERE is_default = true;

-- Enable RLS
ALTER TABLE pdf_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Advocates can view their own templates"
  ON pdf_templates FOR SELECT
  USING (advocate_id = auth.uid());

CREATE POLICY "Advocates can create their own templates"
  ON pdf_templates FOR INSERT
  WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Advocates can update their own templates"
  ON pdf_templates FOR UPDATE
  USING (advocate_id = auth.uid())
  WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Advocates can delete their own templates"
  ON pdf_templates FOR DELETE
  USING (advocate_id = auth.uid());

-- Create storage bucket for PDF assets (logos, images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdf-assets', 'pdf-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for pdf-assets bucket
CREATE POLICY "Advocates can upload their own assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pdf-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view pdf assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pdf-assets');

CREATE POLICY "Advocates can update their own assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'pdf-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Advocates can delete their own assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pdf-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pdf_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pdf_templates_updated_at
  BEFORE UPDATE ON pdf_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_pdf_templates_updated_at();

-- Add comments
COMMENT ON TABLE pdf_templates IS 'Stores custom PDF templates for invoices and pro forma documents';
COMMENT ON COLUMN pdf_templates.advocate_id IS 'Reference to the advocate who owns this template';
COMMENT ON COLUMN pdf_templates.color_scheme IS 'JSON object containing color definitions for the template';
COMMENT ON COLUMN pdf_templates.header IS 'JSON object containing header configuration including logo settings';
COMMENT ON COLUMN pdf_templates.footer IS 'JSON object containing footer configuration';
COMMENT ON COLUMN pdf_templates.sections IS 'JSON object containing styling for different document sections';
COMMENT ON COLUMN pdf_templates."table" IS 'JSON object containing table styling configuration';
COMMENT ON COLUMN pdf_templates.page_margins IS 'JSON object containing page margin settings';
COMMENT ON COLUMN pdf_templates.is_default IS 'Whether this is the default template for the advocate';
