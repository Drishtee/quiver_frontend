/**
 * Placeholder AI service for voice agent field extraction
 * To be replaced with actual AI implementation later
 */

import {
  formFieldMappings,
  findFieldByAlias,
  findOptionByAlias,
  getFieldsForScreen,
  type ScreenType,
  type FieldMapping
} from '../config/formFieldMappings';

export type SupportedLanguage = 'en' | 'hi' | 'as';

export interface ExtractedField {
  fieldKey: string;
  value: string | string[];
  confidence: number;
}

export interface AIResponse {
  extractedFields: ExtractedField[];
  spokenResponse: string;
  language: SupportedLanguage;
}

// Response templates in different languages
const responseTemplates = {
  en: {
    fieldExtracted: (fieldName: string, value: string) =>
      `I've noted your ${fieldName} as "${value}".`,
    multipleFieldsExtracted: (count: number) =>
      `I've recorded ${count} pieces of information.`,
    askForMore: 'What else would you like to tell me?',
    didNotUnderstand: "I didn't quite understand that. Could you please repeat?",
    confirmValue: (fieldName: string, value: string) =>
      `Did you say your ${fieldName} is "${value}"?`,
    greeting: 'Hello! I am here to help you fill this form. Just speak naturally and I will record your information.',
    thankYou: 'Thank you for the information!',
    screenComplete: 'Great! All the required fields for this section are filled.',
    askField: (fieldName: string) => `What is your ${fieldName}?`
  },
  hi: {
    fieldExtracted: (fieldName: string, value: string) =>
      `मैंने आपका ${fieldName} "${value}" नोट कर लिया है।`,
    multipleFieldsExtracted: (count: number) =>
      `मैंने ${count} जानकारियाँ दर्ज कर ली हैं।`,
    askForMore: 'और कुछ बताना चाहेंगे?',
    didNotUnderstand: 'मुझे समझ नहीं आया। कृपया दोबारा बोलें।',
    confirmValue: (fieldName: string, value: string) =>
      `क्या आपका ${fieldName} "${value}" है?`,
    greeting: 'नमस्ते! मैं आपकी फॉर्म भरने में मदद करने के लिए यहाँ हूँ। बस स्वाभाविक रूप से बोलें।',
    thankYou: 'जानकारी के लिए धन्यवाद!',
    screenComplete: 'बहुत अच्छा! इस सेक्शन के सभी ज़रूरी फ़ील्ड भर गए हैं।',
    askField: (fieldName: string) => `आपका ${fieldName} क्या है?`
  },
  as: {
    fieldExtracted: (fieldName: string, value: string) =>
      `মই আপোনাৰ ${fieldName} "${value}" লিখি লৈছো।`,
    multipleFieldsExtracted: (count: number) =>
      `মই ${count} টা তথ্য লিপিবদ্ধ কৰিছো।`,
    askForMore: 'আৰু কিবা ক\'ব বিচাৰে?',
    didNotUnderstand: 'মই বুজি নাপালো। অনুগ্ৰহ কৰি পুনৰ কওক।',
    confirmValue: (fieldName: string, value: string) =>
      `আপোনাৰ ${fieldName} "${value}" নেকি?`,
    greeting: 'নমস্কাৰ! মই আপোনাক ফৰ্ম পূৰণ কৰাত সহায় কৰিবলৈ আছো।',
    thankYou: 'তথ্যৰ বাবে ধন্যবাদ!',
    screenComplete: 'বহুত ভাল! এই শাখাৰ সকলো প্ৰয়োজনীয় ক্ষেত্ৰ পূৰণ হৈছে।',
    askField: (fieldName: string) => `আপোনাৰ ${fieldName} কি?`
  }
};

// Field name translations for natural responses
const fieldNameTranslations: Record<string, Record<SupportedLanguage, string>> = {
  fullName: { en: 'name', hi: 'नाम', as: 'নাম' },
  email: { en: 'email', hi: 'ईमेल', as: 'ইমেইল' },
  gender: { en: 'gender', hi: 'लिंग', as: 'লিংগ' },
  age: { en: 'age', hi: 'उम्र', as: 'বয়স' },
  education: { en: 'education', hi: 'शिक्षा', as: 'শিক্ষা' },
  state: { en: 'state', hi: 'राज्य', as: 'ৰাজ্য' },
  district: { en: 'district', hi: 'जिला', as: 'জিলা' },
  businessName: { en: 'business name', hi: 'व्यवसाय का नाम', as: 'ব্যৱসায়ৰ নাম' },
  sector: { en: 'sector', hi: 'क्षेत्र', as: 'ক্ষেত্ৰ' },
  yearStarted: { en: 'year started', hi: 'शुरू करने का साल', as: 'আৰম্ভ কৰাৰ বছৰ' },
  ownershipType: { en: 'ownership type', hi: 'स्वामित्व', as: 'মালিকানা' },
  role: { en: 'role', hi: 'भूमिका', as: 'ভূমিকা' },
  monthlyRevenue: { en: 'monthly revenue', hi: 'मासिक आय', as: 'মাহিলী উপাৰ্জন' },
  monthlyExpenses: { en: 'monthly expenses', hi: 'मासिक खर्च', as: 'মাহিলী খৰচ' },
  openToEquity: { en: 'equity preference', hi: 'साझेदारी की पसंद', as: 'অংশীদাৰিত্বৰ পছন্দ' }
};

// Patterns for extracting "my X is Y" statements
const extractionPatterns = {
  en: [
    /my\s+(\w+(?:\s+\w+)?)\s+is\s+(.+)/i,
    /i\s+am\s+(.+)/i,
    /i\s+am\s+a\s+(.+)/i,
    /i\s+am\s+from\s+(.+)/i,
    /i\s+have\s+(.+)/i,
    /it\s+is\s+(.+)/i,
    /(\d+)\s*(?:years?\s+old|rupees?|employees?|workers?|customers?|hours?)/i
  ],
  hi: [
    /मेरा\s+(.+)\s+(.+)\s+है/i,
    /मेरी\s+(.+)\s+(.+)\s+है/i,
    /मैं\s+(.+)\s+हूँ/i,
    /मैं\s+(.+)\s+से\s+हूँ/i,
    /(\d+)\s*(?:साल|रुपये|कर्मचारी|ग्राहक|घंटे)/i
  ],
  as: [
    /মোৰ\s+(.+)\s+(.+)\s+হয়/i,
    /মই\s+(.+)/i,
    /(\d+)\s*(?:বছৰ|টকা|কৰ্মচাৰী|গ্ৰাহক|ঘণ্টা)/i
  ]
};

// Detect language from text
function detectLanguage(text: string): SupportedLanguage {
  // Check for Hindi characters (Devanagari)
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hi';
  }
  // Check for Assamese/Bengali characters
  if (/[\u0980-\u09FF]/.test(text)) {
    return 'as';
  }
  return 'en';
}

// Get translated field name
function getFieldName(fieldKey: string, language: SupportedLanguage): string {
  return fieldNameTranslations[fieldKey]?.[language] || fieldKey;
}

// Extract number from text
function extractNumber(text: string): string | null {
  // Match various number formats including words
  const numberWords: Record<string, number> = {
    // English
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    twenty: 20, thirty: 30, forty: 40, fifty: 50,
    hundred: 100, thousand: 1000, lakh: 100000, lakhs: 100000,
    crore: 10000000, crores: 10000000,
    // Hindi numbers
    'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पाँच': 5,
    'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
    'बीस': 20, 'तीस': 30, 'चालीस': 40, 'पचास': 50,
    'सौ': 100, 'हज़ार': 1000, 'लाख': 100000, 'करोड़': 10000000
  };

  // First try to extract direct numbers
  const directMatch = text.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);
  if (directMatch) {
    return directMatch[1].replace(/,/g, '');
  }

  // Try to parse word-based numbers
  let total = 0;
  let current = 0;
  const words = text.toLowerCase().split(/\s+/);

  for (const word of words) {
    if (numberWords[word] !== undefined) {
      const val = numberWords[word];
      if (val === 100) {
        current = current === 0 ? val : current * val;
      } else if (val >= 1000) {
        current = (current === 0 ? 1 : current) * val;
        total += current;
        current = 0;
      } else {
        current += val;
      }
    }
  }
  total += current;

  return total > 0 ? total.toString() : null;
}

// Process transcript and extract fields
export function processTranscript(
  transcript: string,
  currentScreen: ScreenType,
  language: SupportedLanguage = 'en'
): AIResponse {
  const detectedLanguage = detectLanguage(transcript);
  const effectiveLanguage = detectedLanguage !== 'en' ? detectedLanguage : language;

  const extractedFields: ExtractedField[] = [];
  const screenFields = getFieldsForScreen(currentScreen);
  const lowerTranscript = transcript.toLowerCase();

  // Try to match transcript against field aliases
  for (const field of screenFields) {
    // Check if any alias matches
    const allAliases = [
      ...field.aliases.en.map(a => a.toLowerCase()),
      ...field.aliases.hi,
      ...field.aliases.as
    ];

    let fieldMatched = false;
    for (const alias of allAliases) {
      if (lowerTranscript.includes(alias) || transcript.includes(alias)) {
        fieldMatched = true;
        break;
      }
    }

    if (fieldMatched) {
      // Extract value based on field type
      let extractedValue: string | string[] | null = null;

      if (field.type === 'number') {
        extractedValue = extractNumber(transcript);
      } else if (field.options) {
        // Try to match options
        const optionValue = findOptionByAlias(field, transcript);
        if (optionValue) {
          extractedValue = optionValue;
        }
      } else {
        // For text fields, try to extract the value after keywords
        extractedValue = extractTextValue(transcript, field, effectiveLanguage);
      }

      if (extractedValue) {
        extractedFields.push({
          fieldKey: field.fieldKey,
          value: extractedValue,
          confidence: 0.8
        });
      }
    }
  }

  // If no specific field matched, try pattern-based extraction
  if (extractedFields.length === 0) {
    const patternExtracted = extractUsingPatterns(transcript, screenFields, effectiveLanguage);
    extractedFields.push(...patternExtracted);
  }

  // Generate response
  const templates = responseTemplates[effectiveLanguage];
  let spokenResponse: string;

  if (extractedFields.length === 0) {
    spokenResponse = templates.didNotUnderstand;
  } else if (extractedFields.length === 1) {
    const field = extractedFields[0];
    const fieldName = getFieldName(field.fieldKey, effectiveLanguage);
    const valueStr = Array.isArray(field.value) ? field.value.join(', ') : field.value;
    spokenResponse = templates.fieldExtracted(fieldName, valueStr);
  } else {
    spokenResponse = templates.multipleFieldsExtracted(extractedFields.length);
  }

  // Add follow-up
  if (extractedFields.length > 0) {
    spokenResponse += ' ' + templates.askForMore;
  }

  return {
    extractedFields,
    spokenResponse,
    language: effectiveLanguage
  };
}

// Extract text value from transcript
function extractTextValue(
  transcript: string,
  field: FieldMapping,
  language: SupportedLanguage
): string | null {
  const patterns = extractionPatterns[language] || extractionPatterns.en;

  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match && match.length > 1) {
      // Get the captured group with the value
      const capturedValue = match[match.length - 1] || match[1];
      if (capturedValue) {
        return capturedValue.trim();
      }
    }
  }

  // Fallback: try to extract value after common keywords
  const keywords = {
    en: ['is', 'am', 'are', 'have', 'has'],
    hi: ['है', 'हूँ', 'हैं'],
    as: ['হয়', 'আছে']
  };

  const langKeywords = keywords[language] || keywords.en;
  for (const keyword of langKeywords) {
    const idx = transcript.toLowerCase().indexOf(keyword);
    if (idx !== -1) {
      const afterKeyword = transcript.substring(idx + keyword.length).trim();
      if (afterKeyword.length > 0) {
        // Clean up common trailing words
        const cleaned = afterKeyword
          .replace(/[.!?]$/g, '')
          .replace(/\s+(है|हूँ|हैं|হয়|আছে)$/g, '')
          .trim();
        if (cleaned.length > 0 && cleaned.length < 100) {
          return cleaned;
        }
      }
    }
  }

  return null;
}

// Extract using pattern matching
function extractUsingPatterns(
  transcript: string,
  screenFields: FieldMapping[],
  language: SupportedLanguage
): ExtractedField[] {
  const extracted: ExtractedField[] = [];
  const patterns = extractionPatterns[language] || extractionPatterns.en;

  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match) {
      // Try to identify which field this matches
      for (const field of screenFields) {
        const value = match[match.length - 1] || match[1];
        if (!value) continue;

        // For options-based fields, check if value matches an option
        if (field.options) {
          const optionValue = findOptionByAlias(field, value);
          if (optionValue) {
            extracted.push({
              fieldKey: field.fieldKey,
              value: optionValue,
              confidence: 0.7
            });
            break;
          }
        }

        // For number fields, check if value is a number
        if (field.type === 'number') {
          const numValue = extractNumber(value);
          if (numValue) {
            extracted.push({
              fieldKey: field.fieldKey,
              value: numValue,
              confidence: 0.6
            });
            break;
          }
        }
      }
    }
  }

  return extracted;
}

// Generate greeting message
export function getGreeting(language: SupportedLanguage = 'en'): string {
  return responseTemplates[language].greeting;
}

// Generate prompt for a specific field
export function getFieldPrompt(fieldKey: string, language: SupportedLanguage = 'en'): string {
  const templates = responseTemplates[language];
  const fieldName = getFieldName(fieldKey, language);
  return templates.askField(fieldName);
}

// Generate thank you message
export function getThankYou(language: SupportedLanguage = 'en'): string {
  return responseTemplates[language].thankYou;
}

// Check if all required fields for a screen are filled
export function checkScreenCompletion(
  screen: ScreenType,
  filledFields: Record<string, any>,
  language: SupportedLanguage = 'en'
): { isComplete: boolean; missingFields: string[]; message: string } {
  const screenFields = getFieldsForScreen(screen);
  const requiredFields = screenFields.filter(f =>
    // Consider fields required if they don't have 'optional' in their aliases
    !f.aliases.en.some(a => a.toLowerCase().includes('optional'))
  );

  const missingFields: string[] = [];
  for (const field of requiredFields) {
    if (!filledFields[field.fieldKey]) {
      missingFields.push(field.fieldKey);
    }
  }

  const isComplete = missingFields.length === 0;
  const templates = responseTemplates[language];

  let message: string;
  if (isComplete) {
    message = templates.screenComplete;
  } else {
    const firstMissing = missingFields[0];
    message = templates.askField(getFieldName(firstMissing, language));
  }

  return { isComplete, missingFields, message };
}
