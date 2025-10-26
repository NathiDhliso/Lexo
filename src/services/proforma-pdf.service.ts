import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Database } from '../../types/database';
import { PDFTemplateService } from './pdf-template.service';
import { supabase } from '../lib/supabase';
import type { PDFFooterConfig } from '../types/pdf-template.types';

type ProFormaRequest = Database['public']['Tables']['proforma_requests']['Row'];

interface ProFormaService {
  id: string;
  name?: string;
  service_name?: string;
  description?: string;
  service_description?: string;
  pricing_type: 'hourly' | 'fixed';
  hourly_rate?: number;
  fixed_fee?: number;
  estimated_hours?: number;
  quantity?: number;
}

export class ProFormaPDFService {
  private static instance: ProFormaPDFService;
  private pdfTemplateService: PDFTemplateService;

  constructor() {
    this.pdfTemplateService = PDFTemplateService.getInstance();
  }

  public static getInstance(): ProFormaPDFService {
    if (!ProFormaPDFService.instance) {
      ProFormaPDFService.instance = new ProFormaPDFService();
    }
    return ProFormaPDFService.instance;
  }

  async generateProFormaPDF(
    proforma: ProFormaRequest,
    advocateInfo: {
      full_name: string;
      practice_number: string;
      email?: string;
      phone?: string;
    },
    options?: {
      documentType?: 'proforma' | 'invoice';
    }
  ): Promise<Blob> {
    // Debug logging
    console.log('🔍 ProForma Data:', proforma);
    console.log('🔍 Metadata:', proforma.metadata);
    console.log('🔍 Services:', (proforma.metadata as any)?.services);
    console.log('🔍 Advocate Info:', advocateInfo);

    // Get current user's PDF template
    const { data: { user } } = await supabase.auth.getUser();
    const template = user ? await this.pdfTemplateService.getDefaultTemplate(user.id) : null;
    
    console.log('📄 Template loaded:', template);

    // Use template colors or fallback to gold theme
    const primaryColor = template?.colorScheme?.primary ? this.hexToRgb(template.colorScheme.primary) : [218, 165, 32];
    const secondaryColor = template?.colorScheme?.secondary ? this.hexToRgb(template.colorScheme.secondary) : [100, 100, 100];
    const accentColor = template?.colorScheme?.accent ? this.hexToRgb(template.colorScheme.accent) : [218, 165, 32];
    const backgroundColor = template?.colorScheme?.background ? this.hexToRgb(template.colorScheme.background) : [255, 255, 255];
    
    console.log('🎨 Colors:', { primaryColor, secondaryColor, accentColor, backgroundColor });

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Apply page margins from template
    const margins = template?.pageMargins || { top: 20, right: 20, bottom: 20, left: 20 };
    const contentWidth = pageWidth - margins.left - margins.right;
    
    let yPosition = margins.top;

    // Apply background color if not white
    if (template?.colorScheme?.background && template.colorScheme.background !== '#FFFFFF') {
      doc.setFillColor(backgroundColor[0], backgroundColor[1], backgroundColor[2]);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    }

    // HEADER SECTION
    const titleFontSize = template?.header?.titleStyle?.fontSize || 28;
    const titleFontFamily = template?.header?.titleStyle?.fontFamily || 'helvetica';
    const titleFontWeight = template?.header?.titleStyle?.fontWeight || 'bold';
    const titleAlignment = template?.header?.titleStyle?.alignment || 'center';
    const titleColor = template?.header?.titleStyle?.color ? this.hexToRgb(template.header.titleStyle.color) : primaryColor;

    // Logo handling (if enabled)
    if (template?.header?.showLogo && template?.header?.logoUrl) {
      const logoPlacement = template.header.logoPlacement || 'center';
      const logoWidth = template.header.logoWidth || 50;
      const logoHeight = template.header.logoHeight || 50;
      
      try {
        let logoX = margins.left;
        if (logoPlacement === 'center') {
          logoX = (pageWidth - logoWidth) / 2;
        } else if (logoPlacement === 'right') {
          logoX = pageWidth - margins.right - logoWidth;
        }
        
        doc.addImage(template.header.logoUrl, 'PNG', logoX, yPosition, logoWidth, logoHeight);
        yPosition += logoHeight + 10;
      } catch (error) {
        console.warn('Failed to add logo:', error);
      }
    }

    // Title - Dynamically set based on document type
    doc.setFontSize(titleFontSize);
    doc.setFont(titleFontFamily, titleFontWeight);
    doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
    
    // Dynamic title: Use template title if set, otherwise determine based on document type
    const documentType = options?.documentType || 'proforma';
    const defaultTitle = documentType === 'invoice' ? 'INVOICE' : 'PRO FORMA INVOICE';
    const titleText = template?.header?.title || defaultTitle;
    
    if (titleAlignment === 'center') {
      doc.text(titleText, pageWidth / 2, yPosition, { align: 'center' });
    } else if (titleAlignment === 'right') {
      doc.text(titleText, pageWidth - margins.right, yPosition, { align: 'right' });
    } else {
      doc.text(titleText, margins.left, yPosition);
    }

    yPosition += 10;

    // Subtitle (if exists)
    if (template?.header?.subtitle && template?.header?.subtitleStyle) {
      const subtitleFontSize = template.header.subtitleStyle.fontSize || 11;
      const subtitleFontFamily = template.header.subtitleStyle.fontFamily || 'helvetica';
      const subtitleColor = template.header.subtitleStyle.color ? this.hexToRgb(template.header.subtitleStyle.color) : primaryColor;
      
      doc.setFontSize(subtitleFontSize);
      doc.setFont(subtitleFontFamily, 'normal');
      doc.setTextColor(subtitleColor[0], subtitleColor[1], subtitleColor[2]);
      
      if (titleAlignment === 'center') {
        doc.text(template.header.subtitle, pageWidth / 2, yPosition, { align: 'center' });
      } else if (titleAlignment === 'right') {
        doc.text(template.header.subtitle, pageWidth - margins.right, yPosition, { align: 'right' });
      } else {
        doc.text(template.header.subtitle, margins.left, yPosition);
      }
      
      yPosition += 8;
    }

    // Header border
    if (template?.header?.showBorder) {
      const borderColor = template.header.borderColor ? this.hexToRgb(template.header.borderColor) : primaryColor;
      const borderWidth = template.header.borderWidth || 1;
      
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(borderWidth);
      doc.line(margins.left, yPosition, pageWidth - margins.right, yPosition);
      yPosition += 5;
    }

    yPosition += 10;

    // FROM and TO sections
    const sectionLayout = template?.sectionLayout || 'horizontal';
    const fromSectionStyle = template?.sections?.fromSection || {
      titleStyle: { fontSize: 11, fontFamily: 'helvetica', fontWeight: 'bold', color: '#000000' },
      contentStyle: { fontSize: 10, fontFamily: 'helvetica', color: '#000000' }
    };
    const toSectionStyle = template?.sections?.toSection || {
      titleStyle: { fontSize: 11, fontFamily: 'helvetica', fontWeight: 'bold', color: '#000000' },
      contentStyle: { fontSize: 10, fontFamily: 'helvetica', color: '#000000' }
    };

    if (sectionLayout === 'horizontal') {
      // Side by side layout with better spacing
      const columnWidth = (contentWidth - 20) / 2; // Leave 20px gap between columns
      const lineHeight = 6; // Consistent line height
      
      // Store starting Y position
      const sectionStartY = yPosition;
      
      // FROM section (left)
      doc.setFontSize(fromSectionStyle.titleStyle.fontSize);
      doc.setFont(fromSectionStyle.titleStyle.fontFamily, fromSectionStyle.titleStyle.fontWeight);
      const fromTitleColor = this.hexToRgb(fromSectionStyle.titleStyle.color);
      doc.setTextColor(fromTitleColor[0], fromTitleColor[1], fromTitleColor[2]);
      doc.text('FROM:', margins.left, yPosition);
      
      let fromY = yPosition + 8;
      doc.setFont(fromSectionStyle.contentStyle.fontFamily, 'normal');
      doc.setFontSize(fromSectionStyle.contentStyle.fontSize);
      const fromContentColor = this.hexToRgb(fromSectionStyle.contentStyle.color);
      doc.setTextColor(fromContentColor[0], fromContentColor[1], fromContentColor[2]);
      
      // Wrap text if too long
      const fromNameLines = doc.splitTextToSize(advocateInfo.full_name, columnWidth - 5);
      doc.text(fromNameLines, margins.left, fromY);
      fromY += fromNameLines.length * lineHeight;
      
      doc.text(`Practice Number: ${advocateInfo.practice_number}`, margins.left, fromY);
      fromY += lineHeight;
      
      if (advocateInfo.email) {
        const emailLines = doc.splitTextToSize(`Email: ${advocateInfo.email}`, columnWidth - 5);
        doc.text(emailLines, margins.left, fromY);
        fromY += emailLines.length * lineHeight;
      }
      if (advocateInfo.phone) {
        doc.text(`Phone: ${advocateInfo.phone}`, margins.left, fromY);
        fromY += lineHeight;
      }

      // TO section (right) - align with FROM section top
      const rightColumnX = margins.left + columnWidth + 20;
      doc.setFontSize(toSectionStyle.titleStyle.fontSize);
      doc.setFont(toSectionStyle.titleStyle.fontFamily, toSectionStyle.titleStyle.fontWeight);
      const toTitleColor = this.hexToRgb(toSectionStyle.titleStyle.color);
      doc.setTextColor(toTitleColor[0], toTitleColor[1], toTitleColor[2]);
      doc.text('TO:', rightColumnX, sectionStartY);
      
      let toY = sectionStartY + 8;
      doc.setFont(toSectionStyle.contentStyle.fontFamily, 'normal');
      doc.setFontSize(toSectionStyle.contentStyle.fontSize);
      const toContentColor = this.hexToRgb(toSectionStyle.contentStyle.color);
      doc.setTextColor(toContentColor[0], toContentColor[1], toContentColor[2]);
      
      if (proforma.instructing_attorney_name) {
        const nameLines = doc.splitTextToSize(proforma.instructing_attorney_name, columnWidth - 5);
        doc.text(nameLines, rightColumnX, toY);
        toY += nameLines.length * lineHeight;
      }
      if (proforma.instructing_firm) {
        const firmLines = doc.splitTextToSize(proforma.instructing_firm, columnWidth - 5);
        doc.text(firmLines, rightColumnX, toY);
        toY += firmLines.length * lineHeight;
      }
      if (proforma.instructing_attorney_email) {
        const emailLines = doc.splitTextToSize(proforma.instructing_attorney_email, columnWidth - 5);
        doc.text(emailLines, rightColumnX, toY);
        toY += emailLines.length * lineHeight;
      }
      if (proforma.instructing_attorney_phone) {
        doc.text(proforma.instructing_attorney_phone, rightColumnX, toY);
        toY += lineHeight;
      }
      
      yPosition = Math.max(fromY, toY) + 8;
    } else {
      // Vertical/stacked layout with better spacing
      const lineHeight = 6;
      
      // FROM section
      doc.setFontSize(fromSectionStyle.titleStyle.fontSize);
      doc.setFont(fromSectionStyle.titleStyle.fontFamily, fromSectionStyle.titleStyle.fontWeight);
      const fromTitleColor = this.hexToRgb(fromSectionStyle.titleStyle.color);
      doc.setTextColor(fromTitleColor[0], fromTitleColor[1], fromTitleColor[2]);
      doc.text('FROM:', margins.left, yPosition);
      
      yPosition += 8;
      doc.setFont(fromSectionStyle.contentStyle.fontFamily, 'normal');
      doc.setFontSize(fromSectionStyle.contentStyle.fontSize);
      const fromContentColor = this.hexToRgb(fromSectionStyle.contentStyle.color);
      doc.setTextColor(fromContentColor[0], fromContentColor[1], fromContentColor[2]);
      
      const fromNameLines = doc.splitTextToSize(advocateInfo.full_name, contentWidth - 10);
      doc.text(fromNameLines, margins.left, yPosition);
      yPosition += fromNameLines.length * lineHeight;
      
      doc.text(`Practice Number: ${advocateInfo.practice_number}`, margins.left, yPosition);
      yPosition += lineHeight;
      
      if (advocateInfo.email) {
        const emailLines = doc.splitTextToSize(`Email: ${advocateInfo.email}`, contentWidth - 10);
        doc.text(emailLines, margins.left, yPosition);
        yPosition += emailLines.length * lineHeight;
      }
      if (advocateInfo.phone) {
        doc.text(`Phone: ${advocateInfo.phone}`, margins.left, yPosition);
        yPosition += lineHeight;
      }
      
      yPosition += 10;
      
      // TO section
      doc.setFontSize(toSectionStyle.titleStyle.fontSize);
      doc.setFont(toSectionStyle.titleStyle.fontFamily, toSectionStyle.titleStyle.fontWeight);
      const toTitleColor = this.hexToRgb(toSectionStyle.titleStyle.color);
      doc.setTextColor(toTitleColor[0], toTitleColor[1], toTitleColor[2]);
      doc.text('TO:', margins.left, yPosition);
      
      yPosition += 8;
      doc.setFont(toSectionStyle.contentStyle.fontFamily, 'normal');
      doc.setFontSize(toSectionStyle.contentStyle.fontSize);
      const toContentColor = this.hexToRgb(toSectionStyle.contentStyle.color);
      doc.setTextColor(toContentColor[0], toContentColor[1], toContentColor[2]);
      
      if (proforma.instructing_attorney_name) {
        const nameLines = doc.splitTextToSize(proforma.instructing_attorney_name, contentWidth - 10);
        doc.text(nameLines, margins.left, yPosition);
        yPosition += nameLines.length * lineHeight;
      }
      if (proforma.instructing_firm) {
        const firmLines = doc.splitTextToSize(proforma.instructing_firm, contentWidth - 10);
        doc.text(firmLines, margins.left, yPosition);
        yPosition += firmLines.length * lineHeight;
      }
      if (proforma.instructing_attorney_email) {
        const emailLines = doc.splitTextToSize(proforma.instructing_attorney_email, contentWidth - 10);
        doc.text(emailLines, margins.left, yPosition);
        yPosition += emailLines.length * lineHeight;
      }
      if (proforma.instructing_attorney_phone) {
        doc.text(proforma.instructing_attorney_phone, margins.left, yPosition);
        yPosition += lineHeight;
      }
      
      yPosition += 5;
    }

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margins.left, yPosition, pageWidth - margins.right, yPosition);

    yPosition += 8;

    // Quote details with consistent spacing
    const detailsLineHeight = 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Quote Number:', margins.left, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(proforma.quote_number || 'N/A', margins.left + 40, yPosition);

    yPosition += detailsLineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', margins.left, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(proforma.created_at || '').toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }), margins.left + 40, yPosition);

    if (proforma.expires_at) {
      yPosition += detailsLineHeight;
      doc.setFont('helvetica', 'bold');
      doc.text('Valid Until:', margins.left, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(proforma.expires_at).toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }), margins.left + 40, yPosition);
    }

    yPosition += 12;

    // Matter section
    if (proforma.work_title) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text('Matter:', margins.left, yPosition);
      yPosition += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const titleLines = doc.splitTextToSize(proforma.work_title, contentWidth);
      doc.text(titleLines, margins.left, yPosition);
      yPosition += titleLines.length * 5 + 3;
    }

    yPosition += 3;

    // Services table
    const services = (proforma.metadata as any)?.services || [];
    console.log('📋 Services to render:', services.length, services);

    if (services.length > 0) {
      const itemsSectionStyle = template?.sections?.itemsSection || {
        titleStyle: { fontSize: 11, fontFamily: 'helvetica', fontWeight: 'bold', color: '#DAA520' }
      };
      
      doc.setFont(itemsSectionStyle.titleStyle.fontFamily, itemsSectionStyle.titleStyle.fontWeight);
      doc.setFontSize(itemsSectionStyle.titleStyle.fontSize);
      const itemsTitleColor = this.hexToRgb(itemsSectionStyle.titleStyle.color);
      doc.setTextColor(itemsTitleColor[0], itemsTitleColor[1], itemsTitleColor[2]);
      doc.text('Services & Pricing:', margins.left, yPosition);
      yPosition += 8;

      const tableData = services.map((service: ProFormaService) => {
        const quantity = service.quantity || 1;
        const hours = service.estimated_hours || 0;

        let rate = 0;
        let amount = 0;

        if (service.pricing_type === 'hourly') {
          rate = service.hourly_rate || 0;
          amount = rate * hours * quantity;
        } else {
          rate = service.fixed_fee || 0;
          amount = rate * quantity;
        }

        return [
          service.name || service.service_name || 'Service',
          service.description || service.service_description || '',
          service.pricing_type === 'hourly' ? `R${rate.toFixed(2)}` : `R${rate.toFixed(2)}`,
          quantity.toString(),
          `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ];
      });

      console.log('📊 Table data prepared:', tableData);

      // Apply table styling from template
      const primaryColorHex = template?.colorScheme?.primary || '#DAA520';
      const tableStyle = template?.table || {
        headerBackgroundColor: primaryColorHex,
        headerTextColor: '#FFFFFF',
        rowBackgroundColor: '#FFFFFF',
        alternateRowColor: '#FAFAFA',
        showBorders: true,
        borderColor: '#C8C8C8',
        borderStyle: 'solid'
      };

      const headerBgColor = this.hexToRgb(tableStyle.headerBackgroundColor || primaryColorHex);
      const headerTextColor = this.hexToRgb(tableStyle.headerTextColor || '#FFFFFF');
      const rowBgColor = this.hexToRgb(tableStyle.rowBackgroundColor || '#FFFFFF');
      const altRowColor = this.hexToRgb(tableStyle.alternateRowColor || '#FAFAFA');
      const borderColor = this.hexToRgb(tableStyle.borderColor || '#C8C8C8');

      autoTable(doc, {
        startY: yPosition,
        head: [['Service', 'Description', 'Rate', 'Qty', 'Amount']],
        body: tableData,
        theme: tableStyle.showBorders ? 'grid' : 'plain',
        headStyles: {
          fillColor: headerBgColor as [number, number, number],
          textColor: headerTextColor as [number, number, number],
          fontStyle: 'bold',
          fontSize: template?.table?.headerStyle?.fontSize || 10,
          halign: 'left',
          lineColor: tableStyle.showBorders ? borderColor as [number, number, number] : undefined,
          lineWidth: tableStyle.showBorders ? 0.1 : 0
        },
        bodyStyles: {
          fontSize: template?.table?.cellStyle?.fontSize || 9,
          textColor: [0, 0, 0],
          lineColor: tableStyle.showBorders ? borderColor as [number, number, number] : [200, 200, 200],
          lineWidth: tableStyle.showBorders ? 0.1 : 0.05
        },
        alternateRowStyles: {
          fillColor: altRowColor as [number, number, number]
        },
        columnStyles: {
          0: { cellWidth: 40, fontStyle: 'bold' },
          1: { cellWidth: 60 },
          2: { cellWidth: 30, halign: 'right' },
          3: { cellWidth: 15, halign: 'center' },
          4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: margins.left, right: margins.right },
        didDrawPage: (data) => {
          yPosition = data.cursor?.y || yPosition;
        }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = margins.top;
    }

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margins.left, yPosition, pageWidth - margins.right, yPosition);

    yPosition += 10;

    // Summary section with totals
    if (proforma.estimated_amount) {
      console.log('💰 Estimated amount:', proforma.estimated_amount);
      
      const subtotal = proforma.estimated_amount;
      const vatRate = 0.15;
      const vatAmount = subtotal * vatRate;
      const total = subtotal + vatAmount;

      const summaryStyle = template?.sections?.summarySection || {
        titleStyle: { fontSize: 12, fontFamily: 'helvetica', fontWeight: 'bold', color: '#DAA520' },
        contentStyle: { fontSize: 10, fontFamily: 'helvetica', color: '#000000' }
      };

      doc.setFont(summaryStyle.contentStyle.fontFamily, 'normal');
      doc.setFontSize(summaryStyle.contentStyle.fontSize);
      doc.setTextColor(0, 0, 0);

      doc.text('Subtotal:', pageWidth - margins.right - 70, yPosition);
      doc.text(`R ${subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - margins.right, yPosition, { align: 'right' });

      yPosition += 6;
      doc.text('VAT (15%):', pageWidth - margins.right - 70, yPosition);
      doc.text(`R ${vatAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - margins.right, yPosition, { align: 'right' });

      yPosition += 8;
      doc.setFontSize(summaryStyle.titleStyle.fontSize);
      doc.setFont(summaryStyle.titleStyle.fontFamily, summaryStyle.titleStyle.fontWeight);
      const summaryTitleColor = this.hexToRgb(summaryStyle.titleStyle.color);
      doc.setTextColor(summaryTitleColor[0], summaryTitleColor[1], summaryTitleColor[2]);
      doc.text('TOTAL ESTIMATE:', pageWidth - margins.right - 70, yPosition);
      doc.text(`R ${total.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - margins.right, yPosition, { align: 'right' });
    } else {
      console.warn('⚠️ No estimated_amount found in proforma');
    }

    yPosition += 20;

    // Check if we need a new page for footer content
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margins.top;
    }

    // Important Notes section
    doc.setFillColor(245, 247, 250);
    doc.rect(margins.left, yPosition, contentWidth, 30, 'F');

    yPosition += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Important Notes:', margins.left + 5, yPosition);

    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text('• This is an estimate only and not a final invoice', margins.left + 5, yPosition);
    yPosition += 5;
    doc.text('• Actual fees may vary based on the complexity and time required', margins.left + 5, yPosition);
    yPosition += 5;
    doc.text('• All amounts are in South African Rand (ZAR)', margins.left + 5, yPosition);
    yPosition += 5;
    doc.text('• Please contact us if you have any questions about this estimate', margins.left + 5, yPosition);

    yPosition += 15;

    // Footer sections
    const footerStyle: PDFFooterConfig = template?.footer || {
      showFooter: true,
      showTimestamp: true,
      showPageNumbers: false,
      text: '',
      showThankYouNote: false,
      thankYouText: '',
      textStyle: { fontSize: 8, fontFamily: 'helvetica', fontWeight: 'normal', color: '#969696' }
    };

    // Thank You Note
    if (footerStyle.showThankYouNote && footerStyle.thankYouText) {
      yPosition += 5;
      doc.setFont(footerStyle.textStyle?.fontFamily || 'helvetica', 'bold');
      doc.setFontSize((footerStyle.textStyle?.fontSize || 8) + 2);
      const thankYouColor = footerStyle.textStyle?.color ? this.hexToRgb(footerStyle.textStyle.color) : [100, 100, 100];
      doc.setTextColor(thankYouColor[0], thankYouColor[1], thankYouColor[2]);
      doc.text(footerStyle.thankYouText, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
    }

    // Bank Details
    if (footerStyle.showBankDetails) {
      yPosition += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text('PAYMENT DETAILS', margins.left, yPosition);
      yPosition += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text('Bank: Standard Bank', margins.left, yPosition);
      yPosition += 4;
      doc.text('Account Name: Your Law Firm', margins.left, yPosition);
      yPosition += 4;
      doc.text('Account Number: 123-456-7890', margins.left, yPosition);
      yPosition += 4;
      doc.text('Branch Code: 051001', margins.left, yPosition);
      yPosition += 10;
    }

    // Terms & Conditions
    if (footerStyle.showLegalDisclaimer && footerStyle.disclaimerText) {
      yPosition += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text('TERMS & CONDITIONS', margins.left, yPosition);
      yPosition += 6;
      
      doc.setFont(footerStyle.textStyle?.fontFamily || 'helvetica', 'normal');
      doc.setFontSize(footerStyle.textStyle?.fontSize || 8);
      const disclaimerColor = footerStyle.textStyle?.color ? this.hexToRgb(footerStyle.textStyle.color) : [80, 80, 80];
      doc.setTextColor(disclaimerColor[0], disclaimerColor[1], disclaimerColor[2]);
      
      const disclaimerLines = doc.splitTextToSize(footerStyle.disclaimerText, contentWidth);
      doc.text(disclaimerLines, margins.left, yPosition);
      yPosition += disclaimerLines.length * 4 + 5;
    }

    // Standard Footer
    if (footerStyle.showFooter) {
      const footerTextColor = footerStyle.textStyle?.color ? this.hexToRgb(footerStyle.textStyle.color) : [150, 150, 150];
      doc.setFontSize(footerStyle.textStyle?.fontSize || 8);
      doc.setFont(footerStyle.textStyle?.fontFamily || 'helvetica', 'normal');
      doc.setTextColor(footerTextColor[0], footerTextColor[1], footerTextColor[2]);

      if (footerStyle.text) {
        doc.text(footerStyle.text, pageWidth / 2, pageHeight - 15, { align: 'center' });
      }

      if (footerStyle.showTimestamp) {
        doc.text(
          `Generated on ${new Date().toLocaleDateString('en-ZA')} at ${new Date().toLocaleTimeString('en-ZA')}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
    }

    console.log('✅ PDF generation complete');
    return doc.output('blob');
  }

  /**
   * Convert hex color to RGB array
   */
  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [41, 98, 255]; // Default blue
  }

  async downloadProFormaPDF(
    proforma: ProFormaRequest,
    advocateInfo: {
      full_name: string;
      practice_number: string;
      email?: string;
      phone?: string;
    },
    options?: {
      documentType?: 'proforma' | 'invoice';
    }
  ): Promise<void> {
    const blob = await this.generateProFormaPDF(proforma, advocateInfo, options);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Dynamic filename based on document type
    const documentType = options?.documentType || 'proforma';
    const prefix = documentType === 'invoice' ? 'Invoice' : 'ProForma';
    link.download = `${prefix}_${proforma.quote_number || 'Estimate'}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async getProFormaPDFDataUrl(
    proforma: ProFormaRequest,
    advocateInfo: {
      full_name: string;
      practice_number: string;
      email?: string;
      phone?: string;
    },
    options?: {
      documentType?: 'proforma' | 'invoice';
    }
  ): Promise<string> {
    const blob = await this.generateProFormaPDF(proforma, advocateInfo, options);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const proFormaPDFService = ProFormaPDFService.getInstance();