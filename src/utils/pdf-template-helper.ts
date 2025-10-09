import jsPDF from 'jspdf';
import { PDFTemplate, PDFTextStyle } from '../types/pdf-template.types';

export class PDFTemplateHelper {
  static applyTextStyle(doc: jsPDF, style: PDFTextStyle): void {
    doc.setFont(style.fontFamily, style.fontWeight);
    doc.setFontSize(style.fontSize);
    
    const rgb = this.hexToRgb(style.color);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
  }

  static hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  static applyFillColor(doc: jsPDF, color: string): void {
    const rgb = this.hexToRgb(color);
    doc.setFillColor(rgb.r, rgb.g, rgb.b);
  }

  static applyDrawColor(doc: jsPDF, color: string): void {
    const rgb = this.hexToRgb(color);
    doc.setDrawColor(rgb.r, rgb.g, rgb.b);
  }

  static async loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  static drawHeader(
    doc: jsPDF,
    template: PDFTemplate,
    pageWidth: number,
    yPosition: number
  ): number {
    let currentY = yPosition;

    if (template.header.showLogo && template.header.logoUrl) {
      try {
        const logoWidth = template.header.logoWidth || 50;
        const logoHeight = template.header.logoHeight || 50;
        const logoX = (pageWidth - logoWidth) / 2;
        
        doc.addImage(
          template.header.logoUrl,
          'PNG',
          logoX,
          currentY,
          logoWidth,
          logoHeight
        );
        currentY += logoHeight + 10;
      } catch (error) {
        console.error('Error loading logo:', error);
      }
    }

    this.applyTextStyle(doc, template.header.titleStyle);
    doc.text(
      template.header.title,
      pageWidth / 2,
      currentY,
      { align: 'center' }
    );
    currentY += template.header.titleStyle.fontSize / 2 + 5;

    if (template.header.subtitle && template.header.subtitleStyle) {
      this.applyTextStyle(doc, template.header.subtitleStyle);
      doc.text(
        template.header.subtitle,
        pageWidth / 2,
        currentY,
        { align: 'center' }
      );
      currentY += template.header.subtitleStyle.fontSize / 2 + 5;
    }

    if (template.header.showBorder && template.header.borderColor) {
      this.applyDrawColor(doc, template.header.borderColor);
      doc.setLineWidth(0.5);
      doc.line(
        template.pageMargins.left,
        currentY,
        pageWidth - template.pageMargins.right,
        currentY
      );
      currentY += 10;
    }

    return currentY;
  }

  static drawFooter(
    doc: jsPDF,
    template: PDFTemplate,
    pageWidth: number,
    pageHeight: number,
    pageNumber: number
  ): void {
    if (!template.footer.showFooter) return;

    const footerY = pageHeight - template.pageMargins.bottom;

    if (template.footer.text && template.footer.textStyle) {
      this.applyTextStyle(doc, template.footer.textStyle);
      doc.text(
        template.footer.text,
        pageWidth / 2,
        footerY,
        { align: 'center' }
      );
    }

    if (template.footer.showPageNumbers) {
      this.applyTextStyle(doc, template.footer.textStyle || {
        fontFamily: 'helvetica',
        fontSize: 8,
        fontWeight: 'normal',
        color: '#999999',
      });
      doc.text(
        `Page ${pageNumber}`,
        pageWidth - template.pageMargins.right,
        footerY,
        { align: 'right' }
      );
    }

    if (template.footer.showTimestamp) {
      const timestamp = `Generated on ${new Date().toLocaleDateString('en-ZA')} at ${new Date().toLocaleTimeString('en-ZA')}`;
      this.applyTextStyle(doc, template.footer.textStyle || {
        fontFamily: 'helvetica',
        fontSize: 8,
        fontWeight: 'normal',
        color: '#999999',
      });
      doc.text(
        timestamp,
        pageWidth / 2,
        footerY + 5,
        { align: 'center' }
      );
    }
  }

  static drawSection(
    doc: jsPDF,
    template: PDFTemplate,
    sectionKey: keyof PDFTemplate['sections'],
    pageWidth: number,
    yPosition: number,
    content: () => number
  ): number {
    const section = template.sections[sectionKey];
    let currentY = yPosition;

    if (section.backgroundColor) {
      this.applyFillColor(doc, section.backgroundColor);
      doc.rect(
        template.pageMargins.left,
        currentY,
        pageWidth - template.pageMargins.left - template.pageMargins.right,
        section.padding * 2,
        'F'
      );
    }

    if (section.showBorder && section.borderColor) {
      this.applyDrawColor(doc, section.borderColor);
      doc.setLineWidth(0.3);
      doc.rect(
        template.pageMargins.left,
        currentY,
        pageWidth - template.pageMargins.left - template.pageMargins.right,
        section.padding * 2
      );
    }

    currentY += section.padding;

    this.applyTextStyle(doc, section.titleStyle);
    doc.text(section.title, template.pageMargins.left + 5, currentY);
    currentY += section.titleStyle.fontSize / 2 + 5;

    this.applyTextStyle(doc, section.contentStyle);
    currentY = content();

    currentY += section.padding;

    return currentY;
  }
}
