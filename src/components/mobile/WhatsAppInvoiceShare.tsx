import React from 'react';
import { Share2, MessageCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Invoice } from '../../types/invoice.types';

interface WhatsAppInvoiceShareProps {
  invoice: Invoice;
  onShare?: (method: 'whatsapp' | 'link') => void;
}

export const WhatsAppInvoiceShare: React.FC<WhatsAppInvoiceShareProps> = ({
  invoice,
  onShare
}) => {
  const generateShareableLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/invoices/${invoice.id}/view?token=${invoice.shareToken}`;
  };

  const handleWhatsAppShare = () => {
    const shareLink = generateShareableLink();
    const message = `Invoice ${invoice.invoiceNumber} from ${invoice.advocateName}\n\nAmount: R${invoice.totalAmount.toFixed(2)}\nDue Date: ${new Date(invoice.dueDate).toLocaleDateString()}\n\nView invoice: ${shareLink}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    onShare?.('whatsapp');
    
    // Track in analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'invoice_shared', {
        method: 'whatsapp',
        invoice_id: invoice.id
      });
    }
  };

  const handleLinkShare = async () => {
    const shareLink = generateShareableLink();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${invoice.invoiceNumber}`,
          text: `Invoice from ${invoice.advocateName}`,
          url: shareLink
        });
        onShare?.('link');
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareLink);
        alert('Invoice link copied to clipboard');
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareLink);
      alert('Invoice link copied to clipboard');
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleWhatsAppShare}
        variant="outline"
        size="sm"
        className="flex-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        WhatsApp
      </Button>
      
      <Button
        onClick={handleLinkShare}
        variant="outline"
        size="sm"
        className="flex-1"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share Link
      </Button>
    </div>
  );
};