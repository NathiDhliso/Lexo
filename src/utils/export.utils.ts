/**
 * Export Utilities
 * Functions for exporting data to CSV and PDF
 */

/**
 * Convert data to CSV format and trigger download
 */
export const exportToCSV = (data: any[], filename: string = 'export'): void => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape values containing commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export data to PDF using jsPDF
 */
export const exportToPDF = async (data: any[], filename: string = 'export', title?: string): Promise<void> => {
  // Dynamically import jsPDF to avoid bundle size issues
  const jsPDF = (await import('jspdf')).default;
  const autoTable = (await import('jspdf-autotable')).default;
  
  const doc = new jsPDF() as any;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Add title
  if (title) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 20, { align: 'center' });
  }
  
  // Add generation date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: 'center' });
  
  if (data && data.length > 0) {
    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Prepare table data
    const tableData = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Format values
        if (typeof value === 'number') {
          return value.toLocaleString();
        }
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        return value?.toString() || '';
      })
    );
    
    // Add table using autoTable
    autoTable(doc, {
      head: [headers.map(h => h.replace(/_/g, ' ').toUpperCase())],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [30, 58, 138], // Judicial Blue
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 40, left: 10, right: 10 },
    });
  } else {
    doc.setFontSize(12);
    doc.text('No data available', pageWidth / 2, 50, { align: 'center' });
  }
  
  // Add footer with page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }
  
  // Save the PDF
  doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Format currency for export
 */
export const formatCurrency = (amount: number, currency: string = 'ZAR'): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format date for export
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-ZA');
};
