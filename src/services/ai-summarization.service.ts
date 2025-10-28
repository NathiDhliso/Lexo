/**
 * AI Summarization Service
 * 
 * Formats matter descriptions according to South African legal standards
 * Uses AWS Bedrock (Claude) to reformat transcriptions into structured legal descriptions
 * 
 * Critical Rules:
 * - Never hallucinate or fabricate information
 * - Use [Placeholder] tags for missing required information
 * - Apply matter-type specific formatting (litigation, conveyancing, etc.)
 * - Follow SA legal conventions and terminology
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { toast } from 'react-hot-toast';

const AWS_REGION = import.meta.env.VITE_AWS_BEDROCK_REGION || 'us-east-1';
const MODEL_ID = import.meta.env.VITE_AWS_BEDROCK_MODEL_ID || 'anthropic.claude-3-5-sonnet-20241022-v2:0';

// AWS credentials from environment
const bedrockClient = new BedrockRuntimeClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
  }
});

export type MatterType = 
  | 'litigation'
  | 'conveyancing'
  | 'commercial'
  | 'family_law'
  | 'criminal'
  | 'labour'
  | 'administrative'
  | 'other';

interface SummarizationOptions {
  transcript: string;
  matterType: MatterType;
  additionalContext?: string;
}

interface SummarizationResult {
  formattedDescription: string;
  placeholderCount: number;
  confidence: number;
}

/**
 * System prompts for different matter types
 * Each includes SA-specific requirements and formatting
 */
const MATTER_TYPE_PROMPTS: Record<MatterType, string> = {
  litigation: `You are formatting a litigation matter description for a South African advocate. Structure the description to include:

- PARTIES: Plaintiff and Defendant (use [Placeholder] if not mentioned)
- CAUSE OF ACTION: Brief description of the legal claim
- RELIEF SOUGHT: What the plaintiff is seeking
- JURISDICTION: Court or tribunal (High Court, Magistrates' Court, etc.)
- KEY FACTS: Chronological summary of relevant events
- DATE OF INCIDENT: When the cause of action arose
- ESTIMATED VALUE: Monetary value if applicable

Use South African legal terminology. DO NOT fabricate any information. If a field is not mentioned in the transcript, mark it as [Placeholder - Description of what's missing].`,

  conveyancing: `You are formatting a conveyancing matter description for a South African property lawyer. Structure the description to include:

- PROPERTY DESCRIPTION: Physical address and erf number
- PARTIES: Seller and Purchaser (use [Placeholder] if not mentioned)
- PURCHASE PRICE: Sale amount
- BOND AMOUNT: If applicable
- TRANSFER TYPE: Ordinary transfer, bond registration, etc.
- DEEDS OFFICE: Which Deeds Office will handle the registration
- CONDITIONS: Special conditions or suspensive conditions
- DATES: Agreement date, transfer date, occupation date

Use South African conveyancing terminology. DO NOT fabricate any information. Mark missing fields as [Placeholder].`,

  commercial: `You are formatting a commercial law matter description for a South African commercial lawyer. Structure the description to include:

- PARTIES: All parties to the agreement/dispute
- SUBJECT MATTER: What the matter concerns (contract, company law, compliance, etc.)
- KEY TERMS: Important contractual or commercial terms
- VALUE: Monetary value if applicable
- JURISDICTION: Governing law and dispute resolution forum
- DATES: Relevant dates (agreement date, breach date, deadlines)
- REGULATORY CONSIDERATIONS: Licenses, compliance requirements, etc.

Use South African commercial law terminology. DO NOT fabricate information. Use [Placeholder] for missing details.`,

  family_law: `You are formatting a family law matter description for a South African family lawyer. Structure the description to include:

- PARTIES: Husband/Wife, Parent/Child relationships
- MATTER TYPE: Divorce, maintenance, custody, contact, etc.
- MARITAL REGIME: In/out of community of property, accrual system
- CHILDREN: Names, ages, current arrangements (use [Placeholder] if not mentioned)
- RELIEF SOUGHT: What the client is seeking (divorce, maintenance amount, custody, etc.)
- JURISDICTION: Which court (High Court, Magistrates' Court, Maintenance Court)
- FINANCIAL DETAILS: Income, expenses, assets, debts
- DATES: Marriage date, separation date, relevant incidents

Use South African family law terminology. DO NOT fabricate information. Use [Placeholder] for sensitive or missing information.`,

  criminal: `You are formatting a criminal law matter description for a South African criminal defense attorney. Structure the description to include:

- ACCUSED: Name and personal details (use [Placeholder] if confidential)
- CHARGES: Specific criminal charges (with statutory reference if known)
- INCIDENT DATE: When the alleged offense occurred
- INCIDENT LOCATION: Where it occurred
- BRIEF FACTS: What allegedly happened (as told by client)
- POLICE STATION: Where case is being investigated
- CASE NUMBER: SAP or CAS number
- COURT: Which criminal court
- BAIL STATUS: Released on bail, in custody, bail amount
- NEXT COURT DATE: If known

Use South African criminal law terminology. DO NOT fabricate information. Use [Placeholder] for missing details.`,

  labour: `You are formatting a labour law matter description for a South African labour lawyer. Structure the description to include:

- PARTIES: Employee/Employer, union if applicable
- MATTER TYPE: Unfair dismissal, CCMA dispute, Labour Court application, etc.
- NATURE OF DISPUTE: What the dispute is about
- DATES: Employment start date, dismissal/incident date, referral date
- RELIEF SOUGHT: Reinstatement, compensation, other remedies
- JURISDICTION: CCMA, Bargaining Council, Labour Court, Labour Appeal Court
- CASE NUMBER: CCMA or court case number if available
- RELEVANT FACTS: Chronological summary

Use South African labour law terminology (LRA, BCEA, EEA, etc.). DO NOT fabricate information. Use [Placeholder] for missing details.`,

  administrative: `You are formatting an administrative law matter description for a South African administrative lawyer. Structure the description to include:

- PARTIES: Applicant, Respondent (government department/official)
- MATTER TYPE: Judicial review, PAJA application, internal appeal, etc.
- ADMINISTRATIVE DECISION: What decision is being challenged
- DECISION MAKER: Which official/body made the decision
- DATE OF DECISION: When the decision was made
- GROUNDS FOR REVIEW: Why the decision is being challenged
- RELIEF SOUGHT: Setting aside, remittal, substitution, damages
- JURISDICTION: High Court, specific division
- URGENCY: Is urgent relief needed?

Use South African administrative law terminology (PAJA, Promotion of Administrative Justice Act). DO NOT fabricate information. Use [Placeholder] for missing details.`,

  other: `You are formatting a legal matter description for a South African advocate. Structure the description to include:

- PARTIES: All relevant parties
- NATURE OF MATTER: What type of legal matter this is
- KEY FACTS: Chronological summary of relevant events
- JURISDICTION: Which court, tribunal, or forum
- DATES: Relevant dates
- RELIEF SOUGHT: What outcome is desired
- VALUE: Monetary value if applicable

Use South African legal terminology. DO NOT fabricate any information. Mark missing fields as [Placeholder].`
};

/**
 * Base system instruction (applied to all matter types)
 */
const BASE_SYSTEM_INSTRUCTION = `You are a South African legal secretary assistant formatting matter descriptions for advocates.

CRITICAL RULES:
1. NEVER fabricate, invent, or guess any information
2. If information is not explicitly stated in the transcript, use [Placeholder - brief description]
3. Use proper South African legal terminology and conventions
4. Structure the description clearly with headings and paragraphs
5. Preserve all factual information from the transcript
6. Format dates as DD/MM/YYYY
7. Use "R" for Rands (South African currency)
8. Be concise but complete
9. Use professional legal language
10. If you're unsure about something, mark it as [Placeholder] rather than guessing

The user will provide a voice transcript of a matter description. Your job is to reformat it into a professional, structured legal description without adding any information that wasn't provided.`;

/**
 * Format a matter description using AI
 */
export async function formatMatterDescription(
  options: SummarizationOptions
): Promise<SummarizationResult> {
  const { transcript, matterType, additionalContext } = options;

  try {
    // Construct the prompt
    const systemPrompt = `${BASE_SYSTEM_INSTRUCTION}\n\n${MATTER_TYPE_PROMPTS[matterType]}`;
    
    let userPrompt = `Please format the following matter description transcript:\n\n${transcript}`;
    
    if (additionalContext) {
      userPrompt += `\n\nAdditional Context: ${additionalContext}`;
    }

    // Call AWS Bedrock
    const response = await invokeClaude(systemPrompt, userPrompt);
    
    // Count placeholders
    const placeholderCount = countPlaceholders(response);
    
    // Calculate confidence based on placeholder density
    const words = response.split(/\s+/).length;
    const confidence = Math.max(0, Math.min(100, 100 - (placeholderCount / words) * 100));

    return {
      formattedDescription: response,
      placeholderCount,
      confidence
    };
  } catch (error) {
    console.error('AI Summarization error:', error);
    toast.error('Failed to format description with AI');
    throw error;
  }
}

/**
 * Invoke Claude model via AWS Bedrock
 */
async function invokeClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 2000,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: userPrompt
      }
    ],
    temperature: 0.3, // Lower temperature for more consistent, factual output
    top_p: 0.9
  };

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload)
  });

  try {
    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    if (responseBody.content && responseBody.content.length > 0) {
      return responseBody.content[0].text;
    }
    
    throw new Error('No content in response');
  } catch (error) {
    console.error('Bedrock invocation error:', error);
    throw new Error(`Failed to invoke Claude: ${error}`);
  }
}

/**
 * Count placeholder tags in text
 */
function countPlaceholders(text: string): number {
  const matches = text.match(/\[Placeholder[^\]]*\]/g);
  return matches ? matches.length : 0;
}

/**
 * Calculate what percentage of the text is placeholders
 */
export function calculatePlaceholderPercentage(text: string): number {
  const words = text.split(/\s+/).filter(w => w.trim()).length;
  const placeholders = countPlaceholders(text);
  
  if (words === 0) return 0;
  return Math.round((placeholders / words) * 100);
}

/**
 * Validate if description quality is acceptable
 */
export function validateDescriptionQuality(
  text: string,
  threshold: number = 30
): {
  isValid: boolean;
  placeholderPercentage: number;
  warning?: string;
} {
  const placeholderPercentage = calculatePlaceholderPercentage(text);
  const isValid = placeholderPercentage <= threshold;

  let warning: string | undefined;
  if (!isValid) {
    warning = `This description contains ${placeholderPercentage}% placeholders, which may indicate:
- Poor audio quality during recording
- Incomplete information provided
- Background noise interference

Consider re-recording or manually entering the missing information.`;
  }

  return {
    isValid,
    placeholderPercentage,
    warning
  };
}

export const aiSummarizationService = {
  formatMatterDescription,
  calculatePlaceholderPercentage,
  validateDescriptionQuality,
  countPlaceholders
};
