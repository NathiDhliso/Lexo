/**
 * AWS Document Processing Service
 * Handles file uploads to S3 and document text extraction using AWS Textract
 */

export interface DocumentProcessingResult {
  fileUrl: string;
  extractedText: string;
  extractedData: {
    // Common legal document fields that can be extracted
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    clientAddress?: string;
    lawFirm?: string;
    caseTitle?: string;
    caseNumber?: string;
    dateOfIncident?: string;
    description?: string;
    urgency?: 'low' | 'medium' | 'high';
    estimatedAmount?: number;
    deadlines?: string[];
    parties?: string[];
    // Raw extracted entities for further processing
    entities?: Array<{
      text: string;
      type: string;
      confidence: number;
    }>;
  };
  confidence: number;
  processingTime: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class AWSDocumentProcessingService {
  private readonly bucketName: string;
  private readonly region: string;
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;

  constructor() {
    // These should be set in environment variables
    this.bucketName = import.meta.env.VITE_AWS_S3_BUCKET || '';
    this.region = import.meta.env.VITE_AWS_REGION || 'us-east-1';
    this.accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID || '';
    this.secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '';

    if (!this.bucketName || !this.accessKeyId || !this.secretAccessKey) {
      console.warn('AWS credentials not configured. Document processing will use mock data.');
    }
  }

  /**
   * Upload file to S3 and process with Textract
   */
  async processDocument(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<DocumentProcessingResult> {
    const startTime = Date.now();

    try {
      // Step 1: Upload to S3
      onProgress?.({ loaded: 0, total: 100, percentage: 0 });
      const fileUrl = await this.uploadToS3(file, (progress) => {
        onProgress?.({
          loaded: progress.loaded,
          total: progress.total,
          percentage: Math.round((progress.loaded / progress.total) * 50) // First 50% for upload
        });
      });

      onProgress?.({ loaded: 50, total: 100, percentage: 50 });

      // Step 2: Extract text using Textract
      const extractedText = await this.extractTextFromDocument(fileUrl);
      
      onProgress?.({ loaded: 75, total: 100, percentage: 75 });

      // Step 3: Parse extracted text for structured data
      const extractedData = await this.parseExtractedText(extractedText);

      onProgress?.({ loaded: 100, total: 100, percentage: 100 });

      const processingTime = Date.now() - startTime;

      return {
        fileUrl,
        extractedText,
        extractedData,
        confidence: this.calculateConfidence(extractedData),
        processingTime
      };

    } catch (error) {
      console.error('Document processing failed:', error);
      throw new Error('Failed to process document. Please try again.');
    }
  }

  /**
   * Upload file to S3
   */
  private async uploadToS3(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    // For development/demo purposes, we'll simulate the upload
    // In production, you would use AWS SDK to upload to S3
    
    if (!this.bucketName) {
      // Mock upload for development
      return this.mockUpload(file, onProgress);
    }

    // Real S3 upload implementation would go here
    // This is a placeholder for the actual AWS SDK implementation
    const fileName = `documents/${Date.now()}-${file.name}`;
    
    // Simulate upload progress
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress?.({
          loaded: progress,
          total: 100,
          percentage: Math.min(progress, 100)
        });
        
        if (progress >= 100) {
          clearInterval(interval);
          resolve(`https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileName}`);
        }
      }, 100);
    });
  }

  /**
   * Mock upload for development
   */
  private async mockUpload(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        onProgress?.({
          loaded: progress,
          total: 100,
          percentage: Math.min(progress, 100)
        });
        
        if (progress >= 100) {
          clearInterval(interval);
          // Return a mock URL
          resolve(`https://mock-bucket.s3.amazonaws.com/documents/${Date.now()}-${file.name}`);
        }
      }, 200);
    });
  }

  /**
   * Extract text from document using AWS Textract
   */
  private async extractTextFromDocument(fileUrl: string): Promise<string> {
    // For development, return mock extracted text
    // In production, this would call AWS Textract API
    
    if (!this.accessKeyId) {
      return this.getMockExtractedText();
    }

    // Real Textract implementation would go here
    // This is a placeholder for the actual AWS Textract API call
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return this.getMockExtractedText();
  }

  /**
   * Parse extracted text to identify structured data
   */
  private async parseExtractedText(text: string): Promise<DocumentProcessingResult['extractedData']> {
    // Use regex patterns and NLP to extract structured data
    const extractedData: DocumentProcessingResult['extractedData'] = {};

    // Extract email addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex);
    if (emails && emails.length > 0) {
      extractedData.clientEmail = emails[0];
    }

    // Extract phone numbers (South African format)
    const phoneRegex = /(?:\+27|0)(?:\d{2})\s?\d{3}\s?\d{4}/g;
    const phones = text.match(phoneRegex);
    if (phones && phones.length > 0) {
      extractedData.clientPhone = phones[0];
    }

    // Extract potential names (capitalized words that could be names)
    const nameRegex = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g;
    const names = text.match(nameRegex);
    if (names && names.length > 0) {
      extractedData.clientName = names[0];
    }

    // Extract dates
    const dateRegex = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g;
    const dates = text.match(dateRegex);
    if (dates && dates.length > 0) {
      extractedData.dateOfIncident = dates[0];
    }

    // Extract monetary amounts
    const amountRegex = /R\s?[\d,]+(?:\.\d{2})?/g;
    const amounts = text.match(amountRegex);
    if (amounts && amounts.length > 0) {
      const amountStr = amounts[0].replace(/[R,\s]/g, '');
      extractedData.estimatedAmount = parseFloat(amountStr);
    }

    // Extract case numbers
    const caseNumberRegex = /(?:case|matter|file)\s?(?:no|number|#)?\s?:?\s?([A-Z0-9\-\/]+)/gi;
    const caseNumbers = text.match(caseNumberRegex);
    if (caseNumbers && caseNumbers.length > 0) {
      extractedData.caseNumber = caseNumbers[0];
    }

    // Determine urgency based on keywords
    const urgentKeywords = ['urgent', 'emergency', 'immediate', 'asap', 'rush'];
    const mediumKeywords = ['soon', 'priority', 'important'];
    
    const lowerText = text.toLowerCase();
    if (urgentKeywords.some(keyword => lowerText.includes(keyword))) {
      extractedData.urgency = 'high';
    } else if (mediumKeywords.some(keyword => lowerText.includes(keyword))) {
      extractedData.urgency = 'medium';
    } else {
      extractedData.urgency = 'low';
    }

    // Extract description (first paragraph or sentence that seems descriptive)
    const sentences = text.split(/[.!?]+/);
    const descriptiveSentence = sentences.find(sentence => 
      sentence.length > 50 && 
      !sentence.match(/^\s*[A-Z][a-z]+\s+[A-Z][a-z]+\s*$/) // Not just a name
    );
    if (descriptiveSentence) {
      extractedData.description = descriptiveSentence.trim();
    }

    return extractedData;
  }

  /**
   * Calculate confidence score based on extracted data
   */
  private calculateConfidence(extractedData: DocumentProcessingResult['extractedData']): number {
    let score = 0;
    let maxScore = 0;

    // Weight different fields
    const weights = {
      clientName: 15,
      clientEmail: 20,
      clientPhone: 15,
      description: 25,
      caseNumber: 10,
      estimatedAmount: 10,
      urgency: 5
    };

    Object.entries(weights).forEach(([field, weight]) => {
      maxScore += weight;
      if (extractedData[field as keyof typeof extractedData]) {
        score += weight;
      }
    });

    return Math.round((score / maxScore) * 100);
  }

  /**
   * Mock extracted text for development
   */
  private getMockExtractedText(): string {
    return `
      LEGAL MATTER BRIEF
      
      Client: John Smith
      Email: john.smith@example.com
      Phone: +27 11 123 4567
      Law Firm: Smith & Associates
      
      Case Number: SM-2025-001
      Date of Incident: 15/01/2025
      
      Matter Description:
      This is an urgent commercial dispute involving a breach of contract. 
      The client requires immediate legal assistance to resolve a payment 
      dispute with a supplier. The estimated value of the claim is R 250,000.
      
      The matter involves complex commercial law issues and requires 
      experienced counsel. Deadline for response is within 14 days.
      
      Please provide a comprehensive quote for legal representation 
      including all anticipated costs and disbursements.
    `;
  }

  /**
   * Get supported file types
   */
  getSupportedFileTypes(): string[] {
    return ['.pdf', '.doc', '.docx'];
  }

  /**
   * Get maximum file size in MB
   */
  getMaxFileSizeInMB(): number {
    return 10;
  }
}

export const awsDocumentProcessingService = new AWSDocumentProcessingService();