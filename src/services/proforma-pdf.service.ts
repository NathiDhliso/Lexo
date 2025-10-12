import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Database } from '../../types/database';
import { PDFTemplateService } from './pdf-template.service';
import { supabase } from '../lib/supabase';

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
    }
  ): Promise<Blob> {
    // Get current user's PDF template
    const { data: { user } } = await supabase.auth.getUser();
    const template = user ? await this.pdfTemplateService.getDefaultTemplate(user.id) : null;
    
    // Use template colors or fallback to defaults
    const primaryColor = template?.colorScheme?.primary ? this.hexToRgb(template.colorScheme.primary) : [41, 98, 255];
    const secondaryColor = template?.colorScheme?.secondary ? this.hexToRgb(template.colorScheme.secondary) : [100, 100, 100];
    const accentColor = template?.colorScheme?.accent ? this.hexToRgb(template.colorScheme.accent) : [41, 98, 255];
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header title - Changed to "INVOICE" and "Professional Legal Services"
    doc.setFontSize(template?.header?.titleStyle?.fontSize || 28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(218, 165, 32); // Gold color
    doc.text('INVOICE', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.setFontSize(template?.header?.subtitleStyle?.fontSize || 11);
    doc.setTextColor(218, 165, 32); // Gold color
    doc.text('Professional Legal Services', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 10;
    doc.setDrawColor(218, 165, 32); // Gold color
    doc.setLineWidth(1);
    doc.line(20, yPosition, pageWidth - 20, yPosition);

    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('FROM:', 20, yPosition);
    
    yPosition += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(advocateInfo.full_name, 20, yPosition);
    yPosition += 5;
    doc.text(`Practice Number: ${advocateInfo.practice_number}`, 20, yPosition);
    if (advocateInfo.email) {
      yPosition += 5;
      doc.text(`Email: ${advocateInfo.email}`, 20, yPosition);
    }
    if (advocateInfo.phone) {
      yPosition += 5;
      doc.text(`Phone: ${advocateInfo.phone}`, 20, yPosition);
    }

    const rightColumnX = pageWidth - 80;
    let rightYPosition = yPosition - (advocateInfo.phone ? 22 : advocateInfo.email ? 17 : 12);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TO:', rightColumnX, rightYPosition);
    
    rightYPosition += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    if (proforma.instructing_attorney_name) {
      doc.text(proforma.instructing_attorney_name, rightColumnX, rightYPosition);
      rightYPosition += 5;
    }
    if (proforma.instructing_firm) {
      doc.text(proforma.instructing_firm, rightColumnX, rightYPosition);
      rightYPosition += 5;
    }
    if (proforma.instructing_attorney_email) {
      doc.text(proforma.instructing_attorney_email, rightColumnX, rightYPosition);
      rightYPosition += 5;
    }
    if (proforma.instructing_attorney_phone) {
      doc.text(proforma.instructing_attorney_phone, rightColumnX, rightYPosition);
    }

    yPosition += 15;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(20, yPosition, pageWidth - 20, yPosition);

    yPosition += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Quote Number:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(proforma.quote_number || 'N/A', 60, yPosition);

    yPosition += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(proforma.created_at || '').toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }), 60, yPosition);

    if (proforma.expires_at) {
      yPosition += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('Valid Until:', 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(proforma.expires_at).toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }), 60, yPosition);
    }

    yPosition += 12;

    // Matter section with gold color
    if (proforma.work_title) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(218, 165, 32); // Gold color
      doc.text('Matter:', 20, yPosition);
      yPosition += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const titleLines = doc.splitTextToSize(proforma.work_title, pageWidth - 40);
      doc.text(titleLines, 20, yPosition);
      yPosition += titleLines.length * 5 + 3;
    }

    yPosition += 3;

    const services = (proforma.metadata as any)?.services || [];
    
    if (services.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(218, 165, 32); // Gold color
      doc.text('Services & Pricing:', 20, yPosition);
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

      autoTable(doc, {
        startY: yPosition,
        head: [['Service', 'Description', 'Rate', 'Qty', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [218, 165, 32] as [number, number, number], // Gold color
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'left'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [0, 0, 0],
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        columnStyles: {
          0: { cellWidth: 40, fontStyle: 'bold' },  // Service name
          1: { cellWidth: 60 },  // Description
          2: { cellWidth: 30, halign: 'right' },  // Rate
          3: { cellWidth: 15, halign: 'center' },  // Qty
          4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }    // Amount
        },
        margin: { left: 20, right: 20 },
        didDrawPage: (data) => {
          yPosition = data.cursor?.y || yPosition;
        }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(20, yPosition, pageWidth - 20, yPosition);

    yPosition += 10;

    if (proforma.estimated_amount) {
      const subtotal = proforma.estimated_amount;
      const vatRate = 0.15;
      const vatAmount = subtotal * vatRate;
      const total = subtotal + vatAmount;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      doc.text('Subtotal:', pageWidth - 90, yPosition);
      doc.text(`R ${subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 20, yPosition, { align: 'right' });
      
      yPosition += 6;
      doc.text('VAT (15%):', pageWidth - 90, yPosition);
      doc.text(`R ${vatAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 20, yPosition, { align: 'right' });
      
      yPosition += 8;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(218, 165, 32); // Gold color
      doc.text('TOTAL ESTIMATE:', pageWidth - 90, yPosition);
      doc.text(`R ${total.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 20, yPosition, { align: 'right' });
    }

    yPosition += 20;

    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFillColor(245, 247, 250);
    doc.rect(20, yPosition, pageWidth - 40, 30, 'F');
    
    yPosition += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Important Notes:', 25, yPosition);
    
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text('• This is an estimate only and not a final invoice', 25, yPosition);
    yPosition += 5;
    doc.text('• Actual fees may vary based on the complexity and time required', 25, yPosition);
    yPosition += 5;
    doc.text('• All amounts are in South African Rand (ZAR)', 25, yPosition);
    yPosition += 5;
    doc.text('• Please contact us if you have any questions about this estimate', 25, yPosition);

    // Footer with template settings
    doc.setFontSize(template?.footer?.textStyle?.fontSize || 8);
    doc.setTextColor(150, 150, 150);
    
    if (template?.footer?.text) {
      doc.text(template.footer.text, pageWidth / 2, pageHeight - 15, { align: 'center' });
    }
    
    if (template?.footer?.showTimestamp !== false) {
      doc.text(
        `Generated on ${new Date().toLocaleDateString('en-ZA')} at ${new Date().toLocaleTimeString('en-ZA')}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

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
    }
  ): Promise<void> {
    const blob = await this.generateProFormaPDF(proforma, advocateInfo);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ProForma_${proforma.quote_number || 'Estimate'}.pdf`;
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
    }
  ): Promise<string> {
    const blob = await this.generateProFormaPDF(proforma, advocateInfo);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const proFormaPDFService = ProFormaPDFService.getInstance();
