import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Database } from '../../types/database';
import { pdfTemplateService } from './pdf-template.service';
import { PDFTemplate, PDFFooterConfig } from '../types/pdf-template.types';

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

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  }

  async generateInvoicePDF(
    invoice: InvoiceWithDetails,
    advocateInfo: {
      full_name: string;
      practice_number: string;
      email?: string;
      phone?: string;
      advocate_id?: string;
      vat_number?: string;
      vat_registered?: boolean;
      address?: string;
    },
    template?: PDFTemplate
  ): Promise<Blob> {
    console.log('🔍 Invoice Data:', invoice);
    console.log('🔍 Advocate Info:', advocateInfo);

    let pdfTemplate = template;
    if (!pdfTemplate && advocateInfo.advocate_id) {
      try {
        pdfTemplate = await pdfTemplateService.getDefaultTemplate(advocateInfo.advocate_id);
        console.log('📄 Template loaded:', pdfTemplate);
      } catch (_error) {
        console.warn('Failed to load custom template, using default');
      }
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margins = pdfTemplate?.pageMargins || { top: 20, right: 20, bottom: 20, left: 20 };
    const contentWidth = pageWidth - margins.left - margins.right;
    let yPosition = margins.top;

    const primaryColor = pdfTemplate?.colorScheme?.primary ? this.hexToRgb(pdfTemplate.colorScheme.primary) : [41, 98, 255];
    const accentColor = pdfTemplate?.colorScheme?.accent ? this.hexToRgb(pdfTemplate.colorScheme.accent) : [41, 98, 255];
    const backgroundColor = pdfTemplate?.colorScheme?.background ? this.hexToRgb(pdfTemplate.colorScheme.background) : [255, 255, 255];

    // Apply background color if not white
    if (pdfTemplate?.colorScheme?.background && pdfTemplate.colorScheme.background !== '#FFFFFF') {
      doc.setFillColor(backgroundColor[0], backgroundColor[1], backgroundColor[2]);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    }

    const isVerticalTitle = pdfTemplate?.header?.titleOrientation === 'vertical';
    const leftContentMargin = isVerticalTitle ? margins.left + 40 : margins.left;

    // HEADER - Vertical Title Support
    if (isVerticalTitle) {
      const titleText = pdfTemplate?.header?.title || 'INVOICE';
      doc.setFontSize(pdfTemplate?.header?.titleStyle?.fontSize || 28);
      doc.setFont(
        pdfTemplate?.header?.titleStyle?.fontFamily || 'helvetica',
        pdfTemplate?.header?.titleStyle?.fontWeight || 'bold'
      );
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);

      const xPos = margins.left + 5;
      const yPos = margins.top + 30;

      doc.text(titleText, xPos, yPos, {
        angle: 270,
        baseline: 'top'
      });

      yPosition = margins.top;
    } else {
      // Standard horizontal title
      const titleFontSize = pdfTemplate?.header?.titleStyle?.fontSize || 28;
      const titleFontFamily = pdfTemplate?.header?.titleStyle?.fontFamily || 'helvetica';
      const titleFontWeight = pdfTemplate?.header?.titleStyle?.fontWeight || 'bold';
      const titleAlignment = pdfTemplate?.header?.titleStyle?.alignment || 'center';

      doc.setFontSize(titleFontSize);
      doc.setFont(titleFontFamily, titleFontWeight);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);

      // Requirement 3.5: Add "TAX INVOICE" header if VAT registered
      const titleText = advocateInfo.vat_registered 
        ? 'TAX INVOICE' 
        : (pdfTemplate?.header?.title || 'INVOICE');
      
      if (titleAlignment === 'center') {
        doc.text(titleText, pageWidth / 2, yPosition, { align: 'center' });
      } else if (titleAlignment === 'right') {
        doc.text(titleText, pageWidth - margins.right, yPosition, { align: 'right' });
      } else {
        doc.text(titleText, leftContentMargin, yPosition);
      }

      yPosition += 12;
    }

    // Status badge
    if (!isVerticalTitle) {
      doc.setFontSize(10);
      const statusText = invoice.status === 'paid' ? 'PAID' : invoice.status === 'overdue' ? 'OVERDUE' : 'DUE';
      const statusColor = invoice.status === 'paid' ? [34, 197, 94] : invoice.status === 'overdue' ? [239, 68, 68] : [251, 146, 60];
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(statusText, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
    }

    // Header border
    if (pdfTemplate?.header?.showBorder) {
      const borderColor = pdfTemplate.header.borderColor ? this.hexToRgb(pdfTemplate.header.borderColor) : primaryColor;
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(pdfTemplate.header.borderWidth || 1);
      doc.line(leftContentMargin, yPosition, pageWidth - margins.right, yPosition);
      yPosition += 5;
    }

    yPosition += 10;

    // FROM and TO sections with improved spacing
    const sectionLayout = pdfTemplate?.sectionLayout || 'horizontal';
    const lineHeight = 6;

    const fromSectionStyle = pdfTemplate?.sections?.fromSection || {
      titleStyle: { fontSize: 11, fontFamily: 'helvetica', fontWeight: 'bold', color: '#000000' },
      contentStyle: { fontSize: 10, fontFamily: 'helvetica', color: '#000000' }
    };
    const toSectionStyle = pdfTemplate?.sections?.toSection || {
      titleStyle: { fontSize: 11, fontFamily: 'helvetica', fontWeight: 'bold', color: '#000000' },
      contentStyle: { fontSize: 10, fontFamily: 'helvetica', color: '#000000' }
    };

    if (sectionLayout === 'horizontal') {
      // Side by side layout
      const columnWidth = (contentWidth - 20) / 2;
      const sectionStartY = yPosition;

      // FROM section (left)
      doc.setFontSize(fromSectionStyle.titleStyle.fontSize);
      doc.setFont(fromSectionStyle.titleStyle.fontFamily, fromSectionStyle.titleStyle.fontWeight);
      const fromTitleColor = this.hexToRgb(fromSectionStyle.titleStyle.color);
      doc.setTextColor(fromTitleColor[0], fromTitleColor[1], fromTitleColor[2]);
      doc.text('FROM:', leftContentMargin, yPosition);

      let fromY = yPosition + 8;
      doc.setFont(fromSectionStyle.contentStyle.fontFamily, 'normal');
      doc.setFontSize(fromSectionStyle.contentStyle.fontSize);
      const fromContentColor = this.hexToRgb(fromSectionStyle.contentStyle.color);
      doc.setTextColor(fromContentColor[0], fromContentColor[1], fromContentColor[2]);

      const fromNameLines = doc.splitTextToSize(advocateInfo.full_name, columnWidth - 5);
      doc.text(fromNameLines, leftContentMargin, fromY);
      fromY += fromNameLines.length * lineHeight;

      doc.text(`Practice Number: ${advocateInfo.practice_number}`, leftContentMargin, fromY);
      fromY += lineHeight;

      // Requirement 3.5: Display VAT number prominently if VAT registered
      if (advocateInfo.vat_registered && advocateInfo.vat_number) {
        doc.setFont(fromSectionStyle.contentStyle.fontFamily, 'bold');
        doc.text(`VAT Number: ${advocateInfo.vat_number}`, leftContentMargin, fromY);
        doc.setFont(fromSectionStyle.contentStyle.fontFamily, 'normal');
        fromY += lineHeight;
      }

      // Requirement 3.5: Show advocate address for tax invoices
      if (advocateInfo.address) {
        const addressLines = doc.splitTextToSize(advocateInfo.address, columnWidth - 5);
        doc.text(addressLines, leftContentMargin, fromY);
        fromY += addressLines.length * lineHeight;
      }

      if (advocateInfo.email) {
        const emailLines = doc.splitTextToSize(`Email: ${advocateInfo.email}`, columnWidth - 5);
        doc.text(emailLines, leftContentMargin, fromY);
        fromY += emailLines.length * lineHeight;
      }
      if (advocateInfo.phone) {
        doc.text(`Phone: ${advocateInfo.phone}`, leftContentMargin, fromY);
        fromY += lineHeight;
      }

      // TO section (right)
      const rightColumnX = leftContentMargin + columnWidth + 20;
      doc.setFontSize(toSectionStyle.titleStyle.fontSize);
      doc.setFont(toSectionStyle.titleStyle.fontFamily, toSectionStyle.titleStyle.fontWeight);
      const toTitleColor = this.hexToRgb(toSectionStyle.titleStyle.color);
      doc.setTextColor(toTitleColor[0], toTitleColor[1], toTitleColor[2]);
      doc.text('BILL TO:', rightColumnX, sectionStartY);

      let toY = sectionStartY + 8;
      doc.setFont(toSectionStyle.contentStyle.fontFamily, 'normal');
      doc.setFontSize(toSectionStyle.contentStyle.fontSize);
      const toContentColor = this.hexToRgb(toSectionStyle.contentStyle.color);
      doc.setTextColor(toContentColor[0], toContentColor[1], toContentColor[2]);

      if (invoice.matter?.client_name) {
        const nameLines = doc.splitTextToSize(invoice.matter.client_name, columnWidth - 5);
        doc.text(nameLines, rightColumnX, toY);
        toY += nameLines.length * lineHeight;
      }
      
      // Requirement 3.5: Include customer VAT number if available
      if ((invoice as any).client_vat_number) {
        doc.text(`VAT Number: ${(invoice as any).client_vat_number}`, rightColumnX, toY);
        toY += lineHeight;
      }
      
      if ((invoice as any).client_email) {
        const emailLines = doc.splitTextToSize((invoice as any).client_email, columnWidth - 5);
        doc.text(emailLines, rightColumnX, toY);
        toY += emailLines.length * lineHeight;
      }
      if ((invoice as any).client_phone) {
        doc.text((invoice as any).client_phone, rightColumnX, toY);
        toY += lineHeight;
      }

      yPosition = Math.max(fromY, toY) + 8;
    } else {
      // Vertical layout
      // FROM section
      doc.setFontSize(fromSectionStyle.titleStyle.fontSize);
      doc.setFont(fromSectionStyle.titleStyle.fontFamily, fromSectionStyle.titleStyle.fontWeight);
      const fromTitleColor = this.hexToRgb(fromSectionStyle.titleStyle.color);
      doc.setTextColor(fromTitleColor[0], fromTitleColor[1], fromTitleColor[2]);
      doc.text('FROM:', leftContentMargin, yPosition);

      yPosition += 8;
      doc.setFont(fromSectionStyle.contentStyle.fontFamily, 'normal');
      doc.setFontSize(fromSectionStyle.contentStyle.fontSize);
      const fromContentColor = this.hexToRgb(fromSectionStyle.contentStyle.color);
      doc.setTextColor(fromContentColor[0], fromContentColor[1], fromContentColor[2]);

      const fromNameLines = doc.splitTextToSize(advocateInfo.full_name, contentWidth - 10);
      doc.text(fromNameLines, leftContentMargin, yPosition);
      yPosition += fromNameLines.length * lineHeight;

      doc.text(`Practice Number: ${advocateInfo.practice_number}`, leftContentMargin, yPosition);
      yPosition += lineHeight;

      if (advocateInfo.email) {
        const emailLines = doc.splitTextToSize(`Email: ${advocateInfo.email}`, contentWidth - 10);
        doc.text(emailLines, leftContentMargin, yPosition);
        yPosition += emailLines.length * lineHeight;
      }
      if (advocateInfo.phone) {
        doc.text(`Phone: ${advocateInfo.phone}`, leftContentMargin, yPosition);
        yPosition += lineHeight;
      }

      yPosition += 10;

      // TO section
      doc.setFontSize(toSectionStyle.titleStyle.fontSize);
      doc.setFont(toSectionStyle.titleStyle.fontFamily, toSectionStyle.titleStyle.fontWeight);
      const toTitleColor = this.hexToRgb(toSectionStyle.titleStyle.color);
      doc.setTextColor(toTitleColor[0], toTitleColor[1], toTitleColor[2]);
      doc.text('BILL TO:', leftContentMargin, yPosition);

      yPosition += 8;
      doc.setFont(toSectionStyle.contentStyle.fontFamily, 'normal');
      doc.setFontSize(toSectionStyle.contentStyle.fontSize);
      const toContentColor = this.hexToRgb(toSectionStyle.contentStyle.color);
      doc.setTextColor(toContentColor[0], toContentColor[1], toContentColor[2]);

      if (invoice.matter?.client_name) {
        const nameLines = doc.splitTextToSize(invoice.matter.client_name, contentWidth - 10);
        doc.text(nameLines, leftContentMargin, yPosition);
        yPosition += nameLines.length * lineHeight;
      }
      if ((invoice as any).client_email) {
        const emailLines = doc.splitTextToSize((invoice as any).client_email, contentWidth - 10);
        doc.text(emailLines, leftContentMargin, yPosition);
        yPosition += emailLines.length * lineHeight;
      }
      if ((invoice as any).client_phone) {
        doc.text((invoice as any).client_phone, leftContentMargin, yPosition);
        yPosition += lineHeight;
      }

      yPosition += 5;
    }

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(leftContentMargin, yPosition, pageWidth - margins.right, yPosition);

    yPosition += 8;

    // Invoice details with consistent spacing
    const detailsLineHeight = 6;
    const leftColX = leftContentMargin;
    const rightColX = leftContentMargin + (contentWidth / 2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Invoice Number:', leftColX, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.invoice_number || 'N/A', leftColX + 40, yPosition);

    doc.setFont('helvetica', 'bold');
    doc.text('Matter:', rightColX, yPosition);
    doc.setFont('helvetica', 'normal');
    const matterText = invoice.matter?.title || 'N/A';
    const matterLines = doc.splitTextToSize(matterText, (contentWidth / 2) - 25);
    doc.text(matterLines[0], rightColX + 20, yPosition);

    yPosition += detailsLineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Date:', leftColX, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(invoice.invoice_date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }), leftColX + 40, yPosition);

    doc.setFont('helvetica', 'bold');
    doc.text('Reference:', rightColX, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.matter?.reference_number || 'N/A', rightColX + 20, yPosition);

    yPosition += detailsLineHeight;
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
    }), leftColX + 40, yPosition);
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

    yPosition += 12;

    // Fee Narrative
    if (invoice.fee_narrative) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text('Fee Narrative:', leftContentMargin, yPosition);
      yPosition += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const narrativeLines = doc.splitTextToSize(invoice.fee_narrative, contentWidth - 10);
      doc.text(narrativeLines, leftContentMargin, yPosition);
      yPosition += narrativeLines.length * 5 + 10;
    }

    // Time Entries Table
    if (invoice.time_entries && invoice.time_entries.length > 0) {
      const itemsSectionStyle = pdfTemplate?.sections?.itemsSection || {
        titleStyle: { fontSize: 11, fontFamily: 'helvetica', fontWeight: 'bold', color: '#2962FF' }
      };

      doc.setFont(itemsSectionStyle.titleStyle.fontFamily, itemsSectionStyle.titleStyle.fontWeight);
      doc.setFontSize(itemsSectionStyle.titleStyle.fontSize);
      const itemsTitleColor = this.hexToRgb(itemsSectionStyle.titleStyle.color);
      doc.setTextColor(itemsTitleColor[0], itemsTitleColor[1], itemsTitleColor[2]);
      doc.text('Time Entries:', leftContentMargin, yPosition);
      yPosition += 8;

      const timeTableData = invoice.time_entries.map((entry: TimeEntry) => {
        const hours = entry.hours || 0;
        const rate = entry.hourly_rate || 0;
        const amount = hours * rate;

        return [
          new Date(entry.entry_date).toLocaleDateString('en-ZA'),
          entry.description || '',
          `${hours.toFixed(2)}h`,
          `R${rate.toFixed(2)}`,
          `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ];
      });

      const tableHeaderBg = pdfTemplate?.table?.headerBackgroundColor ? this.hexToRgb(pdfTemplate.table.headerBackgroundColor) : primaryColor;
      const tableHeaderText = pdfTemplate?.table?.headerTextColor ? this.hexToRgb(pdfTemplate.table.headerTextColor) : [255, 255, 255];
      const altRowColor = pdfTemplate?.table?.alternateRowColor ? this.hexToRgb(pdfTemplate.table.alternateRowColor) : [250, 250, 250];

      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Description', 'Hours', 'Rate', 'Amount']],
        body: timeTableData,
        theme: pdfTemplate?.table?.showBorders ? 'grid' : 'striped',
        headStyles: {
          fillColor: tableHeaderBg as [number, number, number],
          textColor: tableHeaderText as [number, number, number],
          fontStyle: pdfTemplate?.table?.headerStyle?.fontWeight || 'bold',
          fontSize: pdfTemplate?.table?.headerStyle?.fontSize || 10
        },
        bodyStyles: {
          fontSize: pdfTemplate?.table?.cellStyle?.fontSize || 9,
          textColor: [50, 50, 50]
        },
        alternateRowStyles: {
          fillColor: altRowColor as [number, number, number]
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

    // Services Table
    if ((invoice as any).services && (invoice as any).services.length > 0) {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = margins.top;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text('Services:', leftContentMargin, yPosition);
      yPosition += 8;

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
          `R ${totalAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ];
      });

      const tableHeaderBg = pdfTemplate?.table?.headerBackgroundColor ? this.hexToRgb(pdfTemplate.table.headerBackgroundColor) : primaryColor;
      const tableHeaderText = pdfTemplate?.table?.headerTextColor ? this.hexToRgb(pdfTemplate.table.headerTextColor) : [255, 255, 255];

      autoTable(doc, {
        startY: yPosition,
        head: [['Service', 'Description', 'Qty', 'Unit Price', 'Amount']],
        body: servicesTableData,
        theme: pdfTemplate?.table?.showBorders ? 'grid' : 'striped',
        headStyles: {
          fillColor: tableHeaderBg as [number, number, number],
          textColor: tableHeaderText as [number, number, number],
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

    // Expenses Table - Separated by VAT Treatment
    // Requirement 6.6, 6.7: Separate VAT-inclusive and VAT-exempt disbursements
    if (invoice.expenses && invoice.expenses.length > 0) {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = margins.top;
      }

      // Separate expenses by VAT treatment
      const vatInclusiveExpenses = invoice.expenses.filter((expense: Expense) => 
        (expense as any).vat_applicable !== false
      );
      const vatExemptExpenses = invoice.expenses.filter((expense: Expense) => 
        (expense as any).vat_applicable === false
      );

      const tableHeaderBg = pdfTemplate?.table?.headerBackgroundColor ? this.hexToRgb(pdfTemplate.table.headerBackgroundColor) : primaryColor;
      const tableHeaderText = pdfTemplate?.table?.headerTextColor ? this.hexToRgb(pdfTemplate.table.headerTextColor) : [255, 255, 255];

      // VAT-Inclusive Disbursements Section
      if (vatInclusiveExpenses.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text('Disbursements (VAT Inclusive):', leftContentMargin, yPosition);
        yPosition += 8;

        const vatInclusiveData = vatInclusiveExpenses.map((expense: Expense) => {
          const amount = expense.amount || 0;
          const vatRate = (expense as any).vat_rate || 0.15;
          const amountExclVat = amount / (1 + vatRate);
          const vatAmount = amount - amountExclVat;

          return [
            new Date(expense.expense_date).toLocaleDateString('en-ZA'),
            expense.description || '',
            expense.category || '',
            `R ${amountExclVat.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            `R ${vatAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          ];
        });

        autoTable(doc, {
          startY: yPosition,
          head: [['Date', 'Description', 'Category', 'Excl. VAT', 'VAT', 'Incl. VAT']],
          body: vatInclusiveData,
          theme: pdfTemplate?.table?.showBorders ? 'grid' : 'striped',
          headStyles: {
            fillColor: tableHeaderBg as [number, number, number],
            textColor: tableHeaderText as [number, number, number],
            fontStyle: 'bold',
            fontSize: 10
          },
          bodyStyles: {
            fontSize: 9,
            textColor: [50, 50, 50]
          },
          columnStyles: {
            0: { cellWidth: 22 },
            1: { cellWidth: 60 },
            2: { cellWidth: 25 },
            3: { cellWidth: 25, halign: 'right' },
            4: { cellWidth: 20, halign: 'right' },
            5: { cellWidth: 25, halign: 'right' }
          },
          margin: { left: leftContentMargin, right: margins.right },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 5;

        // VAT-Inclusive Subtotal
        const vatInclusiveTotal = vatInclusiveExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const vatInclusiveTotalExclVat = vatInclusiveTotal / 1.15;
        const vatInclusiveTotalVat = vatInclusiveTotal - vatInclusiveTotalExclVat;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(50, 50, 50);
        const subtotalX = pageWidth - margins.right;
        doc.text('Subtotal (Excl. VAT):', subtotalX - 50, yPosition, { align: 'right' });
        doc.text(`R ${vatInclusiveTotalExclVat.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, subtotalX, yPosition, { align: 'right' });
        yPosition += 5;
        doc.text('VAT (15%):', subtotalX - 50, yPosition, { align: 'right' });
        doc.text(`R ${vatInclusiveTotalVat.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, subtotalX, yPosition, { align: 'right' });
        yPosition += 5;
        doc.setFontSize(10);
        doc.text('Total:', subtotalX - 50, yPosition, { align: 'right' });
        doc.text(`R ${vatInclusiveTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, subtotalX, yPosition, { align: 'right' });
        yPosition += 15;
      }

      // VAT-Exempt Disbursements Section
      if (vatExemptExpenses.length > 0) {
        if (yPosition > pageHeight - 80) {
          doc.addPage();
          yPosition = margins.top;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text('Disbursements (VAT Exempt):', leftContentMargin, yPosition);
        
        // Add explanation for exempt items
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('(These items are exempt from VAT per SARS regulations)', leftContentMargin, yPosition + 4);
        yPosition += 12;

        const vatExemptData = vatExemptExpenses.map((expense: Expense) => {
          return [
            new Date(expense.expense_date).toLocaleDateString('en-ZA'),
            expense.description || '',
            expense.category || '',
            `R ${(expense.amount || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          ];
        });

        autoTable(doc, {
          startY: yPosition,
          head: [['Date', 'Description', 'Category', 'Amount']],
          body: vatExemptData,
          theme: pdfTemplate?.table?.showBorders ? 'grid' : 'striped',
          headStyles: {
            fillColor: [200, 200, 200] as [number, number, number],
            textColor: [50, 50, 50] as [number, number, number],
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

        yPosition = (doc as any).lastAutoTable.finalY + 5;

        // VAT-Exempt Subtotal
        const vatExemptTotal = vatExemptExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        const subtotalX = pageWidth - margins.right;
        doc.text('Total (VAT Exempt):', subtotalX - 50, yPosition, { align: 'right' });
        doc.text(`R ${vatExemptTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, subtotalX, yPosition, { align: 'right' });
        yPosition += 10;
      }
    }

    // Check page space before totals
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = margins.top;
    }

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(leftContentMargin, yPosition, pageWidth - margins.right, yPosition);

    yPosition += 10;

    // Summary/Totals section
    const feesAmount = invoice.fees_amount || 0;
    const disbursementsAmount = invoice.disbursements_amount || 0;
    const subtotal = invoice.subtotal || (feesAmount + disbursementsAmount);
    const vatAmount = invoice.vat_amount || 0;
    const total = invoice.total_amount || (subtotal + vatAmount);

    const summaryStyle = pdfTemplate?.sections?.summarySection || {
      titleStyle: { fontSize: 12, fontFamily: 'helvetica', fontWeight: 'bold', color: '#2962FF' },
      contentStyle: { fontSize: 10, fontFamily: 'helvetica', color: '#000000' }
    };

    const summaryLabelX = pageWidth - margins.right - 70;
    const summaryValueX = pageWidth - margins.right;

    doc.setFont(summaryStyle.contentStyle.fontFamily, 'normal');
    doc.setFontSize(summaryStyle.contentStyle.fontSize);
    doc.setTextColor(0, 0, 0);

    doc.text('Professional Fees:', summaryLabelX, yPosition);
    doc.text(`R ${feesAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, summaryValueX, yPosition, { align: 'right' });

    if (disbursementsAmount > 0) {
      yPosition += 6;
      doc.text('Disbursements:', summaryLabelX, yPosition);
      doc.text(`R ${disbursementsAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, summaryValueX, yPosition, { align: 'right' });
    }

    yPosition += 6;
    doc.setFont(summaryStyle.contentStyle.fontFamily, 'bold');
    doc.text('Subtotal:', summaryLabelX, yPosition);
    doc.text(`R ${subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, summaryValueX, yPosition, { align: 'right' });

    yPosition += 6;
    // Requirement 3.5: Format amounts with clear VAT breakdown
    // Make VAT line bold for tax invoices
    if (advocateInfo.vat_registered) {
      doc.setFont(summaryStyle.contentStyle.fontFamily, 'bold');
    } else {
      doc.setFont(summaryStyle.contentStyle.fontFamily, 'normal');
    }
    doc.text(`VAT (${((invoice.vat_rate || 0.15) * 100).toFixed(0)}%):`, summaryLabelX, yPosition);
    doc.text(`R ${vatAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, summaryValueX, yPosition, { align: 'right' });

    yPosition += 10;
    doc.setFontSize(summaryStyle.titleStyle.fontSize);
    doc.setFont(summaryStyle.titleStyle.fontFamily, summaryStyle.titleStyle.fontWeight);
    const summaryTitleColor = this.hexToRgb(summaryStyle.titleStyle.color);
    doc.setTextColor(summaryTitleColor[0], summaryTitleColor[1], summaryTitleColor[2]);
    doc.text('TOTAL AMOUNT DUE:', summaryLabelX, yPosition);
    doc.setFontSize(14);
    const totalText = `R ${total.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    doc.text(totalText, summaryValueX, yPosition, { align: 'right' });

    yPosition += 15;

    // Check page space before footer
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margins.top;
    }

    // Banking Details
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

    // Thank You Note
    if (pdfTemplate?.footer?.showThankYouNote && pdfTemplate.footer.thankYouText) {
      yPosition += 5;
      doc.setFont(pdfTemplate.footer.textStyle?.fontFamily || 'helvetica', 'bold');
      doc.setFontSize((pdfTemplate.footer.textStyle?.fontSize || 8) + 2);
      const thankYouColor = pdfTemplate.footer.textStyle?.color ? this.hexToRgb(pdfTemplate.footer.textStyle.color) : [100, 100, 100];
      doc.setTextColor(thankYouColor[0], thankYouColor[1], thankYouColor[2]);
      doc.text(pdfTemplate.footer.thankYouText, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
    }

    // Terms & Conditions
    if (pdfTemplate?.footer?.showLegalDisclaimer && pdfTemplate.footer.disclaimerText) {
      yPosition += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text('TERMS & CONDITIONS', leftContentMargin, yPosition);
      yPosition += 6;

      doc.setFont(pdfTemplate.footer.textStyle?.fontFamily || 'helvetica', 'normal');
      doc.setFontSize(pdfTemplate.footer.textStyle?.fontSize || 8);
      const disclaimerColor = pdfTemplate.footer.textStyle?.color ? this.hexToRgb(pdfTemplate.footer.textStyle.color) : [80, 80, 80];
      doc.setTextColor(disclaimerColor[0], disclaimerColor[1], disclaimerColor[2]);

      const disclaimerLines = doc.splitTextToSize(pdfTemplate.footer.disclaimerText, contentWidth - 10);
      doc.text(disclaimerLines, leftContentMargin, yPosition);
      yPosition += disclaimerLines.length * 4 + 5;
    }

    // Payment Information Box
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

    // Additional Notes
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
      const notesLines = doc.splitTextToSize((invoice as any).notes, contentWidth - 10);
      doc.text(notesLines, leftContentMargin, yPosition);
    }

    // Footer timestamp
    const footerStyle: PDFFooterConfig = pdfTemplate?.footer || {
      showFooter: true,
      showTimestamp: true,
      text: '',
      textStyle: { fontSize: 8, fontFamily: 'helvetica', fontWeight: 'normal', color: '#969696' }
    };

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

    console.log('✅ Invoice PDF generation complete');
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