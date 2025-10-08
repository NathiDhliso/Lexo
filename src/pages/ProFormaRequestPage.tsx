import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Clock, AlertCircle, CheckCircle, Building, User, Mail, Phone, Upload } from 'lucide-react';
import { proformaRequestService } from '../services/api/proforma-request.service';
import { LoadingSpinner } from '../components/design-system/components';
import { Database } from '../../types/database';
import FileUpload from '../components/common/FileUpload';
import { awsDocumentProcessingService, DocumentProcessingResult } from '../services/aws-document-processing.service';

/**
 * Public-facing pro forma request page for attorneys.
 * Accessible via /pro-forma-request/:token without authentication.
 */

type ProFormaRequest = Database['public']['Tables']['proforma_requests']['Row'];

interface ProFormaRequestPageProps {
  token?: string;
}

const ProFormaRequestPage: React.FC<ProFormaRequestPageProps> = ({ token: tokenProp }) => {
  const params = useParams<{ token: string }>();
  const token = tokenProp || params.token;

  const [request, setRequest] = useState<ProFormaRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    instructing_attorney_name: '',
    instructing_attorney_email: '',
    instructing_attorney_phone: '',
    instructing_firm: '',
    work_description: '',
  });

  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingDocument, setIsProcessingDocument] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [documentProcessingError, setDocumentProcessingError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<DocumentProcessingResult | null>(null);
  const [showExtractedDataPreview, setShowExtractedDataPreview] = useState(false);

  useEffect(() => {
    const loadRequest = async () => {
      if (!token) {
        console.log('No token provided');
        setError('Invalid or missing token');
        setLoading(false);
        return;
      }

      console.log('Checking pro forma request with token:', token);
      setLoading(true);
      setError(null);

      try {
        const data = await proformaRequestService.getByToken(token);
        
        if (!data) {
          console.log('No data returned for token');
          setError('This pro forma request link is invalid or has expired.');
          return;
        }

        console.log('Pro forma request loaded:', data);
        setRequest(data);

        // Pre-fill form if data exists
        if (data.instructing_attorney_name) {
          setFormData({
            instructing_attorney_name: data.instructing_attorney_name || '',
            instructing_attorney_email: data.instructing_attorney_email || '',
            instructing_attorney_phone: data.instructing_attorney_phone || '',
            instructing_firm: data.instructing_firm || '',
            work_description: data.work_description || '',
          });
        }

        // Check if already submitted
        if (data.status === 'sent' || data.status === 'accepted') {
          setSubmitted(true);
        }

      } catch (error) {
        console.error('Error loading pro forma request:', error);
        setError('Failed to load pro forma request. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadRequest();
  }, [token]);

  // File upload handlers
  const handleFileSelect = async (file: File) => {
    setUploadedFile(file);
    setDocumentProcessingError(null);
    setIsProcessingDocument(true);
    setProcessingProgress(0);

    try {
      const result = await awsDocumentProcessingService.processDocument(
        file,
        (progress) => {
          setProcessingProgress(progress.percentage);
        }
      );

      setExtractedData(result);
      setIsProcessingDocument(false);
      setShowExtractedDataPreview(true);

      // Auto-populate form with extracted data if available
      if (result.extractedData) {
        setFormData(prev => ({
          ...prev,
          instructing_attorney_name: result.extractedData.clientName || prev.instructing_attorney_name,
          instructing_attorney_email: result.extractedData.clientEmail || prev.instructing_attorney_email,
          instructing_attorney_phone: result.extractedData.clientPhone || prev.instructing_attorney_phone,
          instructing_firm: result.extractedData.lawFirm || prev.instructing_firm,
          work_description: result.extractedData.description || prev.work_description,
        }));
      }

    } catch (error) {
      console.error('Document processing failed:', error);
      setDocumentProcessingError(error instanceof Error ? error.message : 'Failed to process document');
      setIsProcessingDocument(false);
    }
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
    setExtractedData(null);
    setDocumentProcessingError(null);
    setShowExtractedDataPreview(false);
    setProcessingProgress(0);
  };

  const applyExtractedData = () => {
    if (extractedData?.extractedData) {
      const data = extractedData.extractedData;
      setFormData(prev => ({
        ...prev,
        instructing_attorney_name: data.clientName || prev.instructing_attorney_name,
        instructing_attorney_email: data.clientEmail || prev.instructing_attorney_email,
        instructing_attorney_phone: data.clientPhone || prev.instructing_attorney_phone,
        instructing_firm: data.lawFirm || prev.instructing_firm,
        work_description: data.description || prev.work_description,
      }));
      setShowExtractedDataPreview(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !request) return;

    setSubmitting(true);
    setError(null);

    try {
      await proformaRequestService.submitByToken(token, formData);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting request:', error);
      setError('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `R ${amount.toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            This pro forma request link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Request Submitted</h1>
          <p className="text-gray-600 mb-6">
            Your pro forma request has been submitted successfully. The advocate will review your details and respond accordingly.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700">
              <strong>Work Title:</strong> {request?.work_title}
            </p>
            {request?.estimated_amount && (
              <p className="text-sm text-green-700 mt-1">
                <strong>Estimated Amount:</strong> {formatCurrency(request.estimated_amount)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pro Forma Request</h1>
              <p className="text-gray-600">Please provide your details for this legal matter</p>
            </div>
          </div>

          {request?.expires_at && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <Clock className="w-4 h-4" />
              <span>This link expires on {formatDate(request.expires_at)}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Request Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Work Title</label>
                  <p className="text-gray-900 font-medium">{request?.work_title}</p>
                </div>

                {request?.estimated_amount && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Estimated Amount</label>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(request.estimated_amount)}
                    </p>
                    {request?.services && request.services.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Based on selected rate card services
                      </p>
                    )}
                  </div>
                )}

                {request?.services && request.services.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Included Services</label>
                    <div className="mt-2 space-y-2">
                      {request.services.map((service: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">{service.name}</span>
                          <span className="font-medium text-gray-900">
                            {service.pricing_type === 'hourly' 
                              ? `R${service.hourly_rate}/hr`
                              : `R${service.fixed_fee}`
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {request?.urgency && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Urgency</label>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      request.urgency === 'high' ? 'bg-red-100 text-red-800' :
                      request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                    </span>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">Quote Number</label>
                  <p className="text-gray-600 font-mono text-sm">{request?.quote_number}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Information</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Attorney Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Attorney Details
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.instructing_attorney_name}
                      onChange={(e) =>
                        setFormData({ ...formData, instructing_attorney_name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          required
                          value={formData.instructing_attorney_email}
                          onChange={(e) =>
                            setFormData({ ...formData, instructing_attorney_email: e.target.value })
                          }
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.instructing_attorney_phone}
                          onChange={(e) =>
                            setFormData({ ...formData, instructing_attorney_phone: e.target.value })
                          }
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="+27 11 123 4567"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Law Firm / Organization
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.instructing_firm}
                        onChange={(e) =>
                          setFormData({ ...formData, instructing_firm: e.target.value })
                        }
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your law firm or organization"
                      />
                    </div>
                  </div>
                </div>

                {/* Document Upload */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Document Upload (Optional)
                  </h3>
                  
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    onFileRemove={handleFileRemove}
                    currentFile={uploadedFile}
                    isProcessing={isProcessingDocument}
                    processingProgress={processingProgress}
                    error={documentProcessingError}
                    label="Upload Legal Document"
                    description="Upload a PDF or Word document to automatically extract case details and populate the form"
                    acceptedTypes={awsDocumentProcessingService.getSupportedFileTypes()}
                    maxSizeInMB={awsDocumentProcessingService.getMaxFileSizeInMB()}
                  />

                  {/* Extracted Data Preview */}
                  {showExtractedDataPreview && extractedData && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-blue-900">Extracted Information</h4>
                          <p className="text-sm text-blue-700">
                            Confidence: {extractedData.confidence}% • Processing time: {(extractedData.processingTime / 1000).toFixed(1)}s
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={applyExtractedData}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Apply to Form
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowExtractedDataPreview(false)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {extractedData.extractedData.clientName && (
                          <div>
                            <span className="font-medium text-blue-900">Name:</span>
                            <span className="ml-2 text-blue-800">{extractedData.extractedData.clientName}</span>
                          </div>
                        )}
                        {extractedData.extractedData.clientEmail && (
                          <div>
                            <span className="font-medium text-blue-900">Email:</span>
                            <span className="ml-2 text-blue-800">{extractedData.extractedData.clientEmail}</span>
                          </div>
                        )}
                        {extractedData.extractedData.clientPhone && (
                          <div>
                            <span className="font-medium text-blue-900">Phone:</span>
                            <span className="ml-2 text-blue-800">{extractedData.extractedData.clientPhone}</span>
                          </div>
                        )}
                        {extractedData.extractedData.lawFirm && (
                          <div>
                            <span className="font-medium text-blue-900">Law Firm:</span>
                            <span className="ml-2 text-blue-800">{extractedData.extractedData.lawFirm}</span>
                          </div>
                        )}
                        {extractedData.extractedData.caseNumber && (
                          <div>
                            <span className="font-medium text-blue-900">Case Number:</span>
                            <span className="ml-2 text-blue-800">{extractedData.extractedData.caseNumber}</span>
                          </div>
                        )}
                        {extractedData.extractedData.urgency && (
                          <div>
                            <span className="font-medium text-blue-900">Urgency:</span>
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              extractedData.extractedData.urgency === 'high' ? 'bg-red-100 text-red-800' :
                              extractedData.extractedData.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {extractedData.extractedData.urgency}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {extractedData.extractedData.description && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <span className="font-medium text-blue-900">Description:</span>
                          <p className="mt-1 text-blue-800 text-sm">{extractedData.extractedData.description}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Case Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Case Details
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Detailed Description of Work Required
                    </label>
                    <textarea
                      value={formData.work_description}
                      onChange={(e) =>
                        setFormData({ ...formData, work_description: e.target.value })
                      }
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Please provide a detailed description of the legal work required, including any relevant background information, deadlines, and specific requirements..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      The more detail you provide, the better the advocate can prepare your quote.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Submit Pro Forma Request
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center mt-2">
                    By submitting this form, you agree to receive communication regarding this legal matter.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProFormaRequestPage;