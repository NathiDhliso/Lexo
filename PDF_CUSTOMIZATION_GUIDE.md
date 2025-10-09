# PDF Template Customization System

## Overview
A comprehensive PDF customization system that allows you to personalize invoices and pro forma documents with your branding, color schemes, and formatting preferences.

## Features

### 1. **Color Scheme Selection**
- **5 Pre-built Themes:**
  - Professional Blue (Default)
  - Elegant Purple
  - Modern Green
  - Classic Black
  - Gold Luxury

- **Custom Color Editor:**
  - Primary color
  - Secondary color
  - Accent color
  - Text color
  - Background color
  - Success/Warning/Error colors
  - Live color picker with hex input

### 2. **Logo Upload & Management**
- Upload your firm's logo
- Adjust logo size (width & height)
- Position control
- Automatic image optimization
- Support for PNG, JPG, SVG formats
- Logo preview before saving

### 3. **Header Customization**
- **Title Settings:**
  - Custom title text (e.g., "INVOICE", "TAX INVOICE")
  - Font family (Helvetica, Times, Courier)
  - Font size (adjustable)
  - Font weight (Normal/Bold)
  - Text color
  - Alignment (Left/Center/Right)

- **Subtitle Settings:**
  - Optional subtitle text
  - Independent font styling
  - Color customization

- **Border Options:**
  - Show/hide header border
  - Custom border color
  - Border thickness

### 4. **Section Styling**
Each section can be customized independently:

- **From Section** (Your details)
- **To Section** (Client details)
- **Details Section** (Invoice/Quote info)
- **Items Section** (Services/Products)
- **Summary Section** (Totals)
- **Notes Section** (Terms & conditions)

**Per-Section Controls:**
- Title text and styling
- Content font styling
- Background color
- Border visibility and color
- Padding adjustments

### 5. **Table Customization**
- **Header Styling:**
  - Background color
  - Text color
  - Font family and size
  - Font weight

- **Row Styling:**
  - Row background color
  - Alternate row color (striped effect)
  - Border color
  - Show/hide borders
  - Cell text styling

### 6. **Footer Customization**
- **Options:**
  - Show/hide footer
  - Custom footer text
  - Page numbers
  - Timestamp
  - Font styling
  - Alignment

### 7. **Text Formatting Options**
For every text element:
- **Font Family:** Helvetica, Times, Courier
- **Font Size:** Adjustable (8-32pt)
- **Font Weight:** Normal or Bold
- **Color:** Full color picker
- **Alignment:** Left, Center, Right

### 8. **Page Layout**
- **Margins:**
  - Top margin
  - Right margin
  - Bottom margin
  - Left margin
- Adjustable spacing between sections

## How to Use

### Accessing the Template Editor

1. Navigate to **Settings** → **PDF Templates**
2. Or click **Customize PDF** from the invoices page

### Creating a Custom Template

#### Step 1: Choose Color Scheme
1. Select from 5 pre-built themes, or
2. Create custom colors using the color picker
3. Colors automatically apply to:
   - Headers
   - Tables
   - Borders
   - Status indicators

#### Step 2: Upload Logo
1. Click **"Choose File"** in the Header & Logo tab
2. Select your logo image
3. Adjust width and height (recommended: 50x50px)
4. Preview appears instantly
5. Toggle "Show Logo" to enable/disable

#### Step 3: Customize Header
1. Set title text (e.g., "INVOICE", "TAX INVOICE")
2. Choose font family
3. Adjust font size (recommended: 24-32pt)
4. Select title color
5. Add optional subtitle
6. Enable/disable header border

#### Step 4: Style Sections
1. Navigate to **Sections** tab
2. For each section:
   - Adjust title font size
   - Change title color
   - Set background color
   - Enable/disable borders
   - Adjust padding

#### Step 5: Configure Tables
1. Go to **Tables** tab
2. Set header colors
3. Choose row colors
4. Enable alternate row coloring
5. Configure borders

#### Step 6: Setup Footer
1. Navigate to **Footer** tab
2. Enable footer display
3. Add custom footer text
4. Toggle page numbers
5. Toggle timestamp

#### Step 7: Save Template
1. Click **"Save Template"** button
2. Template saves to your account
3. Automatically applies to new PDFs

### Using Templates

Once saved, your template automatically applies to:
- **All new invoices**
- **All new pro forma documents**
- **Downloaded PDFs**

### Multiple Templates (Future)
- Save multiple templates
- Switch between templates
- Set default template
- Template per client/matter type

## File Structure

```
src/
├── types/
│   └── pdf-template.types.ts          # Template type definitions
├── services/
│   ├── pdf-template.service.ts        # Template CRUD operations
│   ├── invoice-pdf.service.ts         # Invoice PDF generation
│   └── proforma-pdf.service.ts        # Pro forma PDF generation
├── components/
│   └── settings/
│       └── PDFTemplateEditor.tsx      # Template editor UI
└── utils/
    └── pdf-template-helper.ts         # Template application helpers
```

## Database Schema

```sql
CREATE TABLE pdf_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advocate_id UUID REFERENCES advocates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color_scheme JSONB NOT NULL,
  header JSONB NOT NULL,
  footer JSONB NOT NULL,
  sections JSONB NOT NULL,
  table JSONB NOT NULL,
  page_margins JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pdf_assets (
  -- Supabase Storage bucket for logos and images
);
```

## Best Practices

### Logo Guidelines
- **Format:** PNG with transparent background (recommended)
- **Size:** 200x200px minimum, 500x500px maximum
- **File size:** Under 500KB
- **Aspect ratio:** Square or landscape

### Color Selection
- **Contrast:** Ensure text is readable on backgrounds
- **Branding:** Match your firm's brand colors
- **Professional:** Stick to 2-3 main colors
- **Accessibility:** Use high contrast for important text

### Font Choices
- **Helvetica:** Modern, clean, professional (recommended)
- **Times:** Traditional, formal, legal documents
- **Courier:** Monospace, technical documents

### Layout Tips
- **Margins:** 15-20mm for professional look
- **Spacing:** Consistent padding between sections
- **Headers:** Bold, larger font for hierarchy
- **Tables:** Use alternate row colors for readability

## Examples

### Professional Blue (Default)
- Primary: #2962FF (Blue)
- Accent: #FFC107 (Amber)
- Clean, modern appearance
- High contrast
- Suitable for all legal documents

### Elegant Purple
- Primary: #7C4DFF (Purple)
- Accent: #FFD740 (Gold)
- Sophisticated look
- Great for high-end clients
- Distinctive branding

### Gold Luxury
- Primary: #C9A227 (Gold)
- Background: #FFFEF7 (Cream)
- Premium appearance
- Excellent for luxury services
- Warm, inviting feel

## Troubleshooting

### Logo Not Showing
- Check file format (PNG, JPG supported)
- Verify file size (under 5MB)
- Ensure "Show Logo" is enabled
- Check logo dimensions are set

### Colors Not Applying
- Click "Save Template" after changes
- Refresh the page
- Check color format (hex codes)

### Text Overlapping
- Increase section padding
- Reduce font sizes
- Adjust page margins
- Check content length

## Future Enhancements

- [ ] Multiple template management
- [ ] Template marketplace
- [ ] Import/Export templates
- [ ] Template preview before save
- [ ] Client-specific templates
- [ ] Matter-type templates
- [ ] Advanced typography options
- [ ] Custom fonts upload
- [ ] Watermark support
- [ ] Digital signature placement

## Support

For assistance with PDF customization:
1. Check this guide
2. Review example templates
3. Contact support with template ID
4. Share screenshot of issue

---

**Last Updated:** January 2025
**Version:** 1.0.0
