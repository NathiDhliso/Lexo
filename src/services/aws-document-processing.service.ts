import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

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
  private readonly bedrockRegion: string;
  private readonly bedrockModelId: string;
  private s3Client: S3Client | null = null;
  private bedrockClient: BedrockRuntimeClient | null = null;
  private readonly USE_MOCK_UPLOAD = false;

  constructor() {
    this.bucketName = import.meta.env.VITE_AWS_S3_BUCKET || '';
    this.region = import.meta.env.VITE_AWS_REGION || 'us-east-1';
    this.accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID || '';
    this.secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '';
    this.bedrockRegion = import.meta.env.VITE_AWS_BEDROCK_REGION || 'us-east-1';
    this.bedrockModelId = import.meta.env.VITE_AWS_BEDROCK_MODEL_ID || 'anthropic.claude-3-5-sonnet-20241022-v2:0';

    if (!this.bucketName || !this.accessKeyId || !this.secretAccessKey) {
      console.warn('⚠️ AWS credentials not configured. Document processing will use MOCK DATA for development.');
      return;
    }

    try {
      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: this.accessKeyId,
          secretAccessKey: this.secretAccessKey,
        },
      });

      this.bedrockClient = new BedrockRuntimeClient({
        region: this.bedrockRegion,
        credentials: {
          accessKeyId: this.accessKeyId,
          secretAccessKey: this.secretAccessKey,
        },
      });
      
      console.log('✅ AWS Document Processing Service initialized successfully');
      console.log('✅ AWS Bedrock configured with IAM credentials');
    } catch (error) {
      console.error('Failed to initialize AWS clients:', error);
      console.warn('Falling back to mock mode');
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
      onProgress?.({ loaded: 0, total: 100, percentage: 0 });
      const fileUrl = await this.uploadToS3(file, (progress) => {
        onProgress?.({
          loaded: progress.loaded,
          total: progress.total,
          percentage: Math.round((progress.loaded / progress.total) * 50)
        });
      });

      onProgress?.({ loaded: 50, total: 100, percentage: 50 });

      const useMock = fileUrl.includes('mock-bucket');
      let extractedText = '';
      let extractedData: DocumentProcessingResult['extractedData'] = {};

      if (this.bedrockClient && !useMock) {
        const result = await this.extractAndParseWithBedrock(file);
        extractedText = result.extractedText;
        extractedData = result.extractedData;
      } else {
        throw new Error('AWS Bedrock not configured. Please configure AWS services for document processing.');
      }
      
      onProgress?.({ loaded: 75, total: 100, percentage: 75 });

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

  private async uploadToS3(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    if (this.USE_MOCK_UPLOAD) {
      console.log('📄 Using mock upload (AWS CORS not configured - set USE_MOCK_UPLOAD = false when ready)');
      return this.mockUpload(file, onProgress);
    }

    if (!this.s3Client || !this.bucketName) {
      console.log('AWS not configured, using mock upload');
      return this.mockUpload(file, onProgress);
    }

    try {
      const fileName = `documents/${Date.now()}-${file.name}`;
      const fileBuffer = await file.arrayBuffer();

      const uploadParams: PutObjectCommandInput = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: new Uint8Array(fileBuffer),
        ContentType: file.type,
        Metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      };

      onProgress?.({
        loaded: 0,
        total: 100,
        percentage: 0
      });

      const command = new PutObjectCommand(uploadParams);
      await this.s3Client.send(command);

      onProgress?.({
        loaded: 100,
        total: 100,
        percentage: 100
      });

      const fileUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileName}`;
      return fileUrl;
    } catch (error) {
      console.error('S3 upload failed:', error);
      console.log('Falling back to mock upload due to AWS error');
      return this.mockUpload(file, onProgress);
    }
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

  private async extractAndParseWithBedrock(file: File): Promise<{
    extractedText: string;
    extractedData: DocumentProcessingResult['extractedData'];
  }> {
    try {
      const fileBuffer = await file.arrayBuffer();
      const base64Document = btoa(
        new Uint8Array(fileBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const mediaType = file.type === 'application/pdf' ? 'application/pdf' : 'image/jpeg';

      const prompt = `You are an AI assistant analyzing legal documents for South African advocates.

Extract ALL text from this document and then provide structured information.

Return a JSON object with this exact structure:
{
  "extractedText": "Full text content from the document",
  "clientName": "Full name of the client or null",
  "clientEmail": "Email address or null",
  "clientPhone": "Phone number (South African format) or null",
  "clientAddress": "Physical address or null",
  "lawFirm": "Name of the law firm or attorney or null",
  "caseTitle": "Title or name of the case/matter or null",
  "caseNumber": "Case or matter reference number or null",
  "dateOfIncident": "Date of incident or relevant date or null",
  "description": "Brief description of the matter (1-2 sentences) or null",
  "urgency": "low, medium, or high",
  "estimatedAmount": numeric value or null,
  "deadlines": ["Array of deadline dates"] or null,
  "parties": ["Array of involved parties"] or null
}

Return ONLY the JSON object, no additional text.`;

      const requestBody = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Document
                }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ],
        temperature: 0.1
      };

      const command = new InvokeModelCommand({
        modelId: this.bedrockModelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(requestBody)
      });

      const response = await this.bedrockClient!.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      console.log('Bedrock response:', responseBody);
      
      const aiResponse = responseBody.content[0].text;
      
      console.log('AI response text:', aiResponse);
      
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in response. Full response:', aiResponse);
        throw new Error('No JSON found in AI response');
      }
      
      const result = JSON.parse(jsonMatch[0]);
      
      console.log('✓ Parsed result:', result);
      console.log(`✓ Extracted ${result.extractedText?.length || 0} characters with Bedrock`);
      
      return {
        extractedText: result.extractedText || '',
        extractedData: {
          clientName: result.clientName || undefined,
          clientEmail: result.clientEmail || undefined,
          clientPhone: result.clientPhone || undefined,
          clientAddress: result.clientAddress || undefined,
          lawFirm: result.lawFirm || undefined,
          caseTitle: result.caseTitle || undefined,
          caseNumber: result.caseNumber || undefined,
          dateOfIncident: result.dateOfIncident || undefined,
          description: result.description || undefined,
          urgency: result.urgency || 'low',
          estimatedAmount: result.estimatedAmount || undefined,
          deadlines: result.deadlines || undefined,
          parties: result.parties || undefined
        }
      };
    } catch (error) {
      console.error('Bedrock document processing failed:', error);
      // TODO: Implement proper error handling instead of mock data fallback
      throw new Error('Document processing failed. Please check AWS configuration and try again.');
    }
  }


  private parseWithRegex(text: string): DocumentProcessingResult['extractedData'] {
    const extractedData: DocumentProcessingResult['extractedData'] = {};

    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex);
    if (emails && emails.length > 0) {
      extractedData.clientEmail = emails[0];
    }

    const phoneRegex = /(?:\+27|0)(?:\d{2})\s?\d{3}\s?\d{4}/g;
    const phones = text.match(phoneRegex);
    if (phones && phones.length > 0) {
      extractedData.clientPhone = phones[0];
    }

    const nameRegex = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g;
    const names = text.match(nameRegex);
    if (names && names.length > 0) {
      extractedData.clientName = names[0];
    }

    const dateRegex = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g;
    const dates = text.match(dateRegex);
    if (dates && dates.length > 0) {
      extractedData.dateOfIncident = dates[0];
    }

    const amountRegex = /R\s?[\d,]+(?:\.\d{2})?/g;
    const amounts = text.match(amountRegex);
    if (amounts && amounts.length > 0) {
      const amountStr = amounts[0].replace(/[R,\s]/g, '');
      extractedData.estimatedAmount = parseFloat(amountStr);
    }

    const caseNumberRegex = /(?:case|matter|file)\s?(?:no|number|#)?\s?:?\s?([A-Z0-9\-\/]+)/gi;
    const caseNumbers = text.match(caseNumberRegex);
    if (caseNumbers && caseNumbers.length > 0) {
      extractedData.caseNumber = caseNumbers[0];
    }

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

    const sentences = text.split(/[.!?]+/);
    const descriptiveSentence = sentences.find(sentence => 
      sentence.length > 50 && 
      !sentence.match(/^\s*[A-Z][a-z]+\s+[A-Z][a-z]+\s*$/)
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