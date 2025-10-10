import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Database } from '../../types/database';
import { pdfTemplateService } from './pdf-template.service';
import { PDFTemplate } from '../types/pdf-template.types';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type TimeEntry = Database['public']['Tables']['time_entries']['Row'];
type Expense = Database['public']['Tables']['expenses']['Row'];
type MatterService = Database['public']['Tables']['matter_services']['Row'];

interface InvoiceWithDetails extends Invoice {
  matter?: {
    title: string;
    client_name: string;
    reference_number?: string;
  };
  time_entries?: TimeEntry[];
  expenses?: Expense[];
  services?: MatterService[];
}

export class InvoicePDFService {
  private static instance: InvoicePDFService;

  public static getInstance(): InvoicePDFService {
    if (!InvoicePDFService.instance) {
      InvoicePDFService.instance = new InvoicePDFService();
    }
    return InvoicePDFService.instance;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  async generateInvoicePDF(
    invoice: InvoiceWithDetails,
    advocateInfo: {
      full_name: string;
      practice_number: string;
      email?: string;
      phone?: string;
      advocate_id?: string;
    },
    template?: PDFTemplate
  ): Promise<Blob> {
    let pdfTemplate = template;
    if (!pdfTemplate && advocateInfo.advocate_id) {
      try {
        pdfTemplate = await pdfTemplateService.getDefaultTemplate(advocateInfo.advocate_id);
      } catch (error) {
        console.warn('Failed to load custom template, using default');
      }
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margins = pdfTemplate?.pageMargins || { top: 20, right: 20, bottom: 20, left: 20 };
    let yPosition = margins.top;

    const primaryColor = pdfTemplate?.colorScheme?.primary || '#2962FF';
    const primaryRgb = this.hexToRgb(primaryColor);
    const isVerticalTitle = pdfTemplate?.header?.titleOrientation === 'vertical';

    const leftContentMargin = isVerticalTitle ? margins.left + 40 : margins.left;

    if (isVerticalTitle) {
      const titleText = pdfTemplate?.header?.title || 'INVOICE';
      doc.setFontSize(pdfTemplate?.header?.titleStyle?.fontSize || 28);
      doc.setFont(
        pdfTemplate?.header?.titleStyle?.fontFamily || 'helvetica',
        pdfTemplate?.header?.titleStyle?.fontWeight || 'bold'
      );
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      
      const xPos = margins.left + 5;
      const yPos = margins.top + 30;
      
      doc.text(titleText, xPos, yPos, {
        angle: 270,
        baseline: 'top'
      });
      
      yPosition = margins.top;
    } else {
      doc.setFontSize(pdfTemplate?.header?.titleStyle?.fontSize || 28);
      doc.setFont(
        pdfTemplate?.header?.titleStyle?.fontFamily || 'helvetica',
        pdfTemplate?.header?.titleStyle?.fontWeight || 'bold'
      );
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.text(pdfTemplate?.header?.title || 'INVOICE', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 12;
    }
    
    if (!isVerticalTitle) {
      doc.setFontSize(10);
      const statusText = invoice.status === 'paid' ? 'PAID' : invoice.status === 'overdue' ? 'OVERDUE' : 'DUE';
      const statusColor = invoice.status === 'paid' ? [34, 197, 94] : invoice.status === 'overdue' ? [239, 68, 68] : [251, 146, 60];
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(statusText, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
    }
    
    if (pdfTemplate?.header?.showBorder) {
      const borderColor = pdfTemplate.header.borderColor || primaryColor;
      const borderRgb = this.hexToRgb(borderColor);
      doc.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b);
      doc.setLineWidth(pdfTemplate.header.borderWidth || 0.5);
      doc.line(leftContentMargin, yPosition, pageWidth - margins.right, yPosition);
    }

    yPosition += 10;

    const isVerticalLayout = pdfTemplate?.sectionLayout === 'vertical';
    const sectionTitleStyle = pdfTemplate?.sections?.fromSection?.titleStyle;
    doc.setFontSize(sectionTitleStyle?.fontSize || 11);
    doc.setFont(
      sectionTitleStyle?.fontFamily || 'helvetica',
      sectionTitleStyle?.fontWeight || 'bold'
    );
    doc.setTextColor(0, 0, 0);
    doc.text(pdfTemplate?.sections?.fromSection?.title || 'FROM:', leftContentMargin, yPosition);
    
    yPosition += 7;
    const contentStyle = pdfTemplate?.sections?.fromSection?.contentStyle;
    doc.setFont(
      contentStyle?.fontFamily || 'helvetica',
      contentStyle?.fontWeight || 'normal'
    );
    doc.setFontSize(contentStyle?.fontSize || 10);
    doc.text(advocateInfo.full_name, leftContentMargin, yPosition);
    yPosition += 5;
    doc.text(`Practice Number: ${advocateInfo.practice_number}`, leftContentMargin, yPosition);
    if (advocateInfo.email) {
      yPosition += 5;
      doc.text(`Email: ${advocateInfo.email}`, leftContentMargin, yPosition);
    }
    if (advocateInfo.phone) {
      yPosition += 5;
      doc.text(`Phone: ${advocateInfo.phone}`, leftContentMargin, yPosition);
    }

    let rightYPosition: number;
    const rightColumnX = pageWidth - 80;
    
    if (isVerticalLayout) {
      yPosition += 15;
      rightYPosition = yPosition;
    } else {
      rightYPosition = yPosition - (advocateInfo.phone ? 22 : advocateInfo.email ? 17 : 12);
    }
    
    const toSectionTitleStyle = pdfTemplate?.sections?.toSection?.titleStyle;
    doc.setFont(
      toSectionTitleStyle?.fontFamily || 'helvetica',
      toSectionTitleStyle?.fontWeight || 'bold'
    );
    doc.setFontSize(toSectionTitleStyle?.fontSize || 11);
    doc.text(pdfTemplate?.sections?.toSection?.title || 'BILL TO:', isVerticalLayout ? leftContentMargin : rightColumnX, rightYPosition);
    
    rightYPosition += 7;
    const toContentStyle = pdfTemplate?.sections?.toSection?.contentStyle;
    doc.setFont(
      toContentStyle?.fontFamily || 'helvetica',
      toContentStyle?.fontWeight || 'normal'
    );
    doc.setFontSize(toContentStyle?.fontSize || 10);
    if (invoice.matter?.client_name) {
      doc.text(invoice.matter.client_name, isVerticalLayout ? leftContentMargin : rightColumnX, rightYPosition);
      rightYPosition += 5;
    }
    if ((invoice as any).client_email) {
      doc.text((invoice as any).client_email, isVerticalLayout ? leftContentMargin : rightColumnX, rightYPosition);
      rightYPosition += 5;
    }
    if ((invoice as any).client_phone) {
      doc.text((invoice as any).client_phone, isVerticalLayout ? leftContentMargin : rightColumnX, rightYPosition);
    }

    yPosition = isVerticalLayout ? rightYPosition + 10 : yPosition + 15;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(leftContentMargin, yPosition, pageWidth - margins.right, yPosition);

    yPosition += 10;

    const leftColX = leftContentMargin;
    const rightColX = pageWidth / 2 + 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Invoice Number:', leftColX, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.invoice_number || 'N/A', leftColX + 35, yPosition);

    doc.setFont('helvetica', 'bold');
    doc.text('Matter:', rightColX, yPosition);
    doc.setFont('helvetica', 'normal');
    const matterText = invoice.matter?.title || 'N/A';
    doc.text(matterText.length > 30 ? matterText.substring(0, 27) + '...' : matterText, rightColX + 20, yPosition);

    yPosition += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Date:', leftColX, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(invoice.invoice_date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }), leftColX + 35, yPosition);

    doc.setFont('helvetica', 'bold');
    doc.text('Reference:', rightColX, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.matter?.reference_number || 'N/A', rightColX + 20, yPosition);

    yPosition += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Due Date:', leftColX, yPosition);
    doc.setFont('helvetica', 'normal');
    const dueDate = new Date(invoice.due_date);
    const isOverdue = invoice.status !== 'paid' && dueDate < new Date();
    if (isOverdue) {
      doc.setTextColor(239, 68, 68);
    }
    doc.text(dueDate.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }), leftColX + 35, yPosition);
    doc.setTextColor(0, 0, 0);

    if ((invoice as any).date_paid) {
      doc.setFont('helvetica', 'bold');
      doc.text('Date Paid:', rightColX, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(34, 197, 94);
      doc.text(new Date((invoice as any).date_paid).toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }), rightColX + 20, yPosition);
      doc.setTextColor(0, 0, 0);
    }

    yPosition += 15;

    if (invoice.fee_narrative) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(41, 98, 255);
      doc.text('Fee Narrative:', leftContentMargin, yPosition);
      yPosition += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const narrativeLines = doc.splitTextToSize(invoice.fee_narrative, pageWidth - leftContentMargin - margins.right);
      doc.text(narrativeLines, leftContentMargin, yPosition);
      yPosition += narrativeLines.length * 5 + 10;
    }

    if (invoice.time_entries && invoice.time_entries.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.text('Time Entries:', leftContentMargin, yPosition);
      yPosition += 10;

      const timeTableData = invoice.time_entries.map((entry: TimeEntry) => {
        const hours = entry.hours || 0;
        const rate = entry.hourly_rate || 0;
        const amount = hours * rate;

        return [
          new Date(entry.entry_date).toLocaleDateString('en-ZA'),
          entry.description || '',
          `${hours.toFixed(2)}h`,
          `R${rate.toFixed(2)}`,
          `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ];
      });

      const tableHeaderBg = pdfTemplate?.table?.headerBackgroundColor || '#2962FF';
      const tableHeaderRgb = this.hexToRgb(tableHeaderBg);
      const tableHeaderText = pdfTemplate?.table?.headerTextColor || '#FFFFFF';
      const tableHeaderTextRgb = this.hexToRgb(tableHeaderText);

      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Description', 'Hours', 'Rate', 'Amount']],
        body: timeTableData,
        theme: 'striped',
        headStyles: {
          fillColor: [tableHeaderRgb.r, tableHeaderRgb.g, tableHeaderRgb.b],
          textColor: [tableHeaderTextRgb.r, tableHeaderTextRgb.g, tableHeaderTextRgb.b],
          fontStyle: pdfTemplate?.table?.headerStyle?.fontWeight || 'bold',
          fontSize: pdfTemplate?.table?.headerStyle?.fontSize || 10
        },
        bodyStyles: {
          fontSize: pdfTemplate?.table?.cellStyle?.fontSize || 9,
          textColor: [50, 50, 50]
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 75 },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 25, halign: 'right' },
          4: { cellWidth: 30, halign: 'right' }
        },
        margin: { left: leftContentMargin, right: margins.right },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    if ((invoice as any).services && (invoice as any).services.length > 0) {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.text('Services:', leftContentMargin, yPosition);
      yPosition += 10;

      const servicesTableData = (invoice as any).services.map((matterService: any) => {
        const service = matterService.services;
        const quantity = 1;
        const unitPrice = service?.unit_price || 0;
        const totalAmount = unitPrice * quantity;
        
        return [
          service?.service_name || '',
          service?.description || '',
          quantity.toString(),
          `R${unitPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `R${totalAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ];
      });

      const tableHeaderBg = pdfTemplate?.table?.headerBackgroundColor || '#2962FF';
      const tableHeaderRgb = this.hexToRgb(tableHeaderBg);
      const tableHeaderText = pdfTemplate?.table?.headerTextColor || '#FFFFFF';
      const tableHeaderTextRgb = this.hexToRgb(tableHeaderText);

      autoTable(doc, {
        startY: yPosition,
        head: [['Service', 'Description', 'Qty', 'Unit Price', 'Amount']],
        body: servicesTableData,
        theme: 'striped',
        headStyles: {
          fillColor: [tableHeaderRgb.r, tableHeaderRgb.g, tableHeaderRgb.b],
          textColor: [tableHeaderTextRgb.r, tableHeaderTextRgb.g, tableHeaderTextRgb.b],
          fontStyle: pdfTemplate?.table?.headerStyle?.fontWeight || 'bold',
          fontSize: pdfTemplate?.table?.headerStyle?.fontSize || 10
        },
        bodyStyles: {
          fontSize: pdfTemplate?.table?.cellStyle?.fontSize || 9,
          textColor: [50, 50, 50]
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 60 },
          2: { cellWidth: 15, halign: 'center' },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 30, halign: 'right' }
        },
        margin: { left: leftContentMargin, right: margins.right },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    if (invoice.expenses && invoice.expenses.length > 0) {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.text('Disbursements & Expenses:', leftContentMargin, yPosition);
      yPosition += 10;

      const expenseTableData = invoice.expenses.map((expense: Expense) => {
        return [
          new Date(expense.expense_date).toLocaleDateString('en-ZA'),
          expense.description || '',
          expense.category || '',
          `R${(expense.amount || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ];
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Description', 'Category', 'Amount']],
        body: expenseTableData,
        theme: 'striped',
        headStyles: {
          fillColor: [41, 98, 255],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [50, 50, 50]
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 85 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30, halign: 'right' }
        },
        margin: { left: leftContentMargin, right: margins.right },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(leftContentMargin, yPosition, pageWidth - margins.right, yPosition);

    yPosition += 10;

    const feesAmount = invoice.fees_amount || 0;
    const disbursementsAmount = invoice.disbursements_amount || 0;
    const subtotal = invoice.subtotal || (feesAmount + disbursementsAmount);
    const vatAmount = invoice.vat_amount || 0;
    const total = invoice.total_amount || (subtotal + vatAmount);

    const summaryLabelX = pageWidth - 90;
    const summaryValueX = pageWidth - margins.right;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    doc.text('Professional Fees:', summaryLabelX, yPosition);
    doc.text(`R${feesAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, summaryValueX, yPosition, { align: 'right' });
    
    if (disbursementsAmount > 0) {
      yPosition += 6;
      doc.text('Disbursements:', summaryLabelX, yPosition);
      doc.text(`R${disbursementsAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, summaryValueX, yPosition, { align: 'right' });
    }
    
    yPosition += 6;
    doc.text('Subtotal:', summaryLabelX, yPosition);
    doc.text(`R${subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, summaryValueX, yPosition, { align: 'right' });
    
    yPosition += 6;
    doc.text(`VAT (${((invoice.vat_rate || 0.15) * 100).toFixed(0)}%):`, summaryLabelX, yPosition);
    doc.text(`R${vatAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, summaryValueX, yPosition, { align: 'right' });
    
    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text('TOTAL AMOUNT DUE:', summaryLabelX, yPosition);
    doc.setFontSize(14);
    const totalText = `R ${total.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    doc.text(totalText, summaryValueX, yPosition, { align: 'right' });

    yPosition += 15;

    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }

    if (pdfTemplate?.footer?.showBankDetails && pdfTemplate.footer.bankDetails) {
      doc.setFillColor(245, 247, 250);
      doc.rect(leftContentMargin, yPosition, pageWidth - leftContentMargin - margins.right, 45, 'F');
      
      yPosition += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('Banking Details:', leftContentMargin + 5, yPosition);
      
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      
      const bankDetails = pdfTemplate.footer.bankDetails;
      if (bankDetails.bankName) {
        doc.text(`Bank: ${bankDetails.bankName}`, leftContentMargin + 5, yPosition);
        yPosition += 5;
      }
      if (bankDetails.accountName) {
        doc.text(`Account Name: ${bankDetails.accountName}`, leftContentMargin + 5, yPosition);
        yPosition += 5;
      }
      if (bankDetails.accountNumber) {
        doc.text(`Account Number: ${bankDetails.accountNumber}`, leftContentMargin + 5, yPosition);
        yPosition += 5;
      }
      if (bankDetails.branchCode) {
        doc.text(`Branch Code: ${bankDetails.branchCode}`, leftContentMargin + 5, yPosition);
        yPosition += 5;
      }
      if (bankDetails.swiftCode) {
        doc.text(`SWIFT Code: ${bankDetails.swiftCode}`, leftContentMargin + 5, yPosition);
        yPosition += 5;
      }
      
      yPosition += 10;
    }

    doc.setFillColor(245, 247, 250);
    doc.rect(leftContentMargin, yPosition, pageWidth - leftContentMargin - margins.right, 35, 'F');
    
    yPosition += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Payment Information:', leftContentMargin + 5, yPosition);
    
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text('• Please make payment within the specified due date', leftContentMargin + 5, yPosition);
    yPosition += 5;
    doc.text('• Include invoice number as payment reference', leftContentMargin + 5, yPosition);
    yPosition += 5;
    doc.text('• All amounts are in South African Rand (ZAR)', leftContentMargin + 5, yPosition);
    yPosition += 5;
    doc.text('• Contact us immediately if you have any queries regarding this invoice', leftContentMargin + 5, yPosition);

    if ((invoice as any).notes) {
      yPosition += 15;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('Additional Notes:', leftContentMargin, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const notesLines = doc.splitTextToSize((invoice as any).notes, pageWidth - leftContentMargin - margins.right);
      doc.text(notesLines, leftContentMargin, yPosition);
    }

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated on ${new Date().toLocaleDateString('en-ZA')} at ${new Date().toLocaleTimeString('en-ZA')}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    return doc.output('blob');
  }

  async downloadInvoicePDF(
    invoice: InvoiceWithDetails,
    advocateInfo: {
      full_name: string;
      practice_number: string;
      email?: string;
      phone?: string;
      advocate_id?: string;
    },
    template?: PDFTemplate
  ): Promise<void> {
    const blob = await this.generateInvoicePDF(invoice, advocateInfo, template);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${invoice.invoice_number || 'Document'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async getInvoicePDFDataUrl(
    invoice: InvoiceWithDetails,
    advocateInfo: {
      full_name: string;
      practice_number: string;
      email?: string;
      phone?: string;
      advocate_id?: string;
    },
    template?: PDFTemplate
  ): Promise<string> {
    const blob = await this.generateInvoicePDF(invoice, advocateInfo, template);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const invoicePDFService = InvoicePDFService.getInstance();
