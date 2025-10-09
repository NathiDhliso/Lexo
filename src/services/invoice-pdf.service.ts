import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Database } from '../../types/database';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type TimeEntry = Database['public']['Tables']['time_entries']['Row'];
type Expense = Database['public']['Tables']['expenses']['Row'];

interface InvoiceWithDetails extends Invoice {
  matter?: {
    title: string;
    client_name: string;
    reference_number?: string;
  };
  time_entries?: TimeEntry[];
  expenses?: Expense[];
}

export class InvoicePDFService {
  private static instance: InvoicePDFService;

  public static getInstance(): InvoicePDFService {
    if (!InvoicePDFService.instance) {
      InvoicePDFService.instance = new InvoicePDFService();
    }
    return InvoicePDFService.instance;
  }

  async generateInvoicePDF(
    invoice: InvoiceWithDetails,
    advocateInfo: {
      full_name: string;
      practice_number: string;
      email?: string;
      phone?: string;
    }
  ): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 98, 255);
    doc.text('INVOICE', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const statusText = invoice.status === 'paid' ? 'PAID' : invoice.status === 'overdue' ? 'OVERDUE' : 'DUE';
    const statusColor = invoice.status === 'paid' ? [34, 197, 94] : invoice.status === 'overdue' ? [239, 68, 68] : [251, 146, 60];
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(statusText, pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 10;
    doc.setDrawColor(41, 98, 255);
    doc.setLineWidth(0.5);
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
    doc.text('BILL TO:', rightColumnX, rightYPosition);
    
    rightYPosition += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    if (invoice.matter?.client_name) {
      doc.text(invoice.matter.client_name, rightColumnX, rightYPosition);
      rightYPosition += 5;
    }
    if ((invoice as any).client_email) {
      doc.text((invoice as any).client_email, rightColumnX, rightYPosition);
      rightYPosition += 5;
    }
    if ((invoice as any).client_phone) {
      doc.text((invoice as any).client_phone, rightColumnX, rightYPosition);
    }

    yPosition += 15;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(20, yPosition, pageWidth - 20, yPosition);

    yPosition += 10;

    const leftColX = 20;
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
      doc.text('Fee Narrative:', 20, yPosition);
      yPosition += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const narrativeLines = doc.splitTextToSize(invoice.fee_narrative, pageWidth - 40);
      doc.text(narrativeLines, 20, yPosition);
      yPosition += narrativeLines.length * 5 + 10;
    }

    if (invoice.time_entries && invoice.time_entries.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(41, 98, 255);
      doc.text('Time Entries:', 20, yPosition);
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

      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Description', 'Hours', 'Rate', 'Amount']],
        body: timeTableData,
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
          1: { cellWidth: 75 },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 25, halign: 'right' },
          4: { cellWidth: 30, halign: 'right' }
        },
        margin: { left: 20, right: 20 },
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
      doc.setTextColor(41, 98, 255);
      doc.text('Disbursements & Expenses:', 20, yPosition);
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
        margin: { left: 20, right: 20 },
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

    const feesAmount = invoice.fees_amount || 0;
    const disbursementsAmount = invoice.disbursements_amount || 0;
    const subtotal = invoice.subtotal || (feesAmount + disbursementsAmount);
    const vatAmount = invoice.vat_amount || 0;
    const total = invoice.total_amount || (subtotal + vatAmount);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    
    doc.text('Professional Fees:', pageWidth - 80, yPosition);
    doc.text(`R${feesAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 20, yPosition, { align: 'right' });
    
    if (disbursementsAmount > 0) {
      yPosition += 7;
      doc.text('Disbursements:', pageWidth - 80, yPosition);
      doc.text(`R${disbursementsAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 20, yPosition, { align: 'right' });
    }
    
    yPosition += 7;
    doc.text('Subtotal:', pageWidth - 80, yPosition);
    doc.text(`R${subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 20, yPosition, { align: 'right' });
    
    yPosition += 7;
    doc.text(`VAT (${((invoice.vat_rate || 0.15) * 100).toFixed(0)}%):`, pageWidth - 80, yPosition);
    doc.text(`R${vatAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 20, yPosition, { align: 'right' });
    
    yPosition += 10;
    doc.setFontSize(14);
    doc.setTextColor(41, 98, 255);
    doc.text('TOTAL AMOUNT DUE:', pageWidth - 80, yPosition);
    doc.text(`R${total.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 20, yPosition, { align: 'right' });

    yPosition += 15;

    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFillColor(245, 247, 250);
    doc.rect(20, yPosition, pageWidth - 40, 35, 'F');
    
    yPosition += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Payment Information:', 25, yPosition);
    
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text('• Please make payment within the specified due date', 25, yPosition);
    yPosition += 5;
    doc.text('• Include invoice number as payment reference', 25, yPosition);
    yPosition += 5;
    doc.text('• All amounts are in South African Rand (ZAR)', 25, yPosition);
    yPosition += 5;
    doc.text('• Contact us immediately if you have any queries regarding this invoice', 25, yPosition);

    if ((invoice as any).notes) {
      yPosition += 15;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('Additional Notes:', 20, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const notesLines = doc.splitTextToSize((invoice as any).notes, pageWidth - 40);
      doc.text(notesLines, 20, yPosition);
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
    }
  ): Promise<void> {
    const blob = await this.generateInvoicePDF(invoice, advocateInfo);
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
    }
  ): Promise<string> {
    const blob = await this.generateInvoicePDF(invoice, advocateInfo);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const invoicePDFService = InvoicePDFService.getInstance();
