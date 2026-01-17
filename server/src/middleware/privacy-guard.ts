/**
 * Privacy Guard Middleware
 * Ensures no PII (Personally Identifiable Information) is sent to external LLM APIs
 * Satisfies the 'Regulatory Force' constraint (COPPA, FERPA, etc.)
 */

import type { SanitizedContent } from '../types/ai.js';

/**
 * Common PII patterns to detect and remove
 */
const PII_PATTERNS = {
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  
  // Phone numbers (various formats)
  phone: /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
  
  // Social Security Numbers (US)
  ssn: /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/g,
  
  // Credit card numbers
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  
  // Dates of birth (various formats)
  dob: /\b(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12][0-9]|3[01])[\/\-](19|20)\d{2}\b/g,
  
  // Addresses (basic patterns)
  streetAddress: /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct)\b/gi,
  
  // ZIP codes (US)
  zipCode: /\b\d{5}(?:-\d{4})?\b/g,
};

/**
 * Common student/teacher name patterns that might appear in text
 * Note: This is a heuristic - true name detection requires NLP
 */
const NAME_INDICATORS = [
  /\b(Student|Pupil|Child)\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/gi,
  /\bMr\.?\s+[A-Z][a-z]+\b/gi,
  /\bMrs\.?\s+[A-Z][a-z]+\b/gi,
  /\bMs\.?\s+[A-Z][a-z]+\b/gi,
  /\bDr\.?\s+[A-Z][a-z]+\b/gi,
];

/**
 * School-specific identifiers that might be PII
 */
const SCHOOL_IDENTIFIERS = [
  /\b(Student|Teacher)\s+ID[:\s]+[\w-]+\b/gi,
  /\b(School|District)\s+ID[:\s]+[\w-]+\b/gi,
];

interface PIIReplacement {
  original: string;
  replacement: string;
  type: string;
}

/**
 * Sanitizes content by removing or masking PII
 * @param content - The content to sanitize
 * @param options - Sanitization options
 * @returns Sanitized content and list of removed fields
 */
export function sanitizePII(
  content: string | Record<string, any>,
  options: {
    mask?: boolean; // If true, replace with [REDACTED], if false, remove completely
    preserveContext?: boolean; // Keep placeholder context for better LLM understanding
    customPatterns?: Record<string, RegExp>; // Additional custom patterns
  } = {}
): SanitizedContent {
  const { mask = true, preserveContext = true, customPatterns = {} } = options;
  
  // Convert object to string if needed
  let textContent: string;
  const removedFields: string[] = [];
  
  if (typeof content === 'object') {
    // For objects, recursively sanitize and track removed fields
    const sanitized = sanitizeObject(content, removedFields, mask, preserveContext);
    textContent = JSON.stringify(sanitized);
  } else {
    textContent = content;
  }
  
  const replacements: PIIReplacement[] = [];
  
  // Check all PII patterns
  const allPatterns = { ...PII_PATTERNS, ...customPatterns };
  
  for (const [type, pattern] of Object.entries(allPatterns)) {
    const matches = textContent.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        if (!replacements.find((r) => r.original === match)) {
          let replacement: string;
          if (mask) {
            if (preserveContext) {
              // Preserve context for better LLM understanding
              replacement = `[${type.toUpperCase()}_REDACTED]`;
            } else {
              replacement = '[REDACTED]';
            }
          } else {
            replacement = '';
          }
          replacements.push({ original: match, replacement, type });
          removedFields.push(type);
        }
      });
    }
  }
  
  // Check name indicators
  for (const pattern of NAME_INDICATORS) {
    const matches = textContent.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        if (!replacements.find((r) => r.original === match)) {
          const replacement = mask ? (preserveContext ? '[NAME_REDACTED]' : '[REDACTED]') : '';
          replacements.push({ original: match, replacement, type: 'name' });
          if (!removedFields.includes('name')) {
            removedFields.push('name');
          }
        }
      });
    }
  }
  
  // Check school identifiers
  for (const pattern of SCHOOL_IDENTIFIERS) {
    const matches = textContent.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        if (!replacements.find((r) => r.original === match)) {
          const replacement = mask ? (preserveContext ? '[SCHOOL_ID_REDACTED]' : '[REDACTED]') : '';
          replacements.push({ original: match, replacement, type: 'school_identifier' });
          if (!removedFields.includes('school_identifier')) {
            removedFields.push('school_identifier');
          }
        }
      });
    }
  }
  
  // Apply replacements
  let sanitized = textContent;
  for (const { original, replacement } of replacements) {
    sanitized = sanitized.replace(original, replacement);
  }
  
  return {
    sanitized,
    removedFields: [...new Set(removedFields)], // Remove duplicates
  };
}

/**
 * Recursively sanitize objects, removing PII fields
 */
function sanitizeObject(
  obj: Record<string, any>,
  removedFields: string[],
  mask: boolean,
  preserveContext: boolean
): Record<string, any> {
  const sanitized: Record<string, any> = {};
  const piiFields = ['email', 'phone', 'ssn', 'dateOfBirth', 'address', 'zipCode', 'studentId', 'teacherId', 'parentEmail', 'firstName', 'lastName'];
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    // Check if field name suggests PII
    if (piiFields.some((field) => lowerKey.includes(field))) {
      removedFields.push(key);
      if (mask) {
        sanitized[key] = preserveContext ? `[${key.toUpperCase()}_REDACTED]` : '[REDACTED]';
      }
      // If mask is false, skip the field entirely
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeObject(value, removedFields, mask, preserveContext);
    } else if (typeof value === 'string') {
      // Sanitize string values
      const sanitizedString = sanitizePII(value, { mask, preserveContext });
      if (sanitizedString.removedFields.length > 0) {
        removedFields.push(...sanitizedString.removedFields);
        sanitized[key] = sanitizedString.sanitized;
      } else {
        sanitized[key] = value;
      }
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Middleware function to sanitize content before LLM API calls
 */
export function privacyGuard() {
  return (content: string | Record<string, any>) => {
    return sanitizePII(content, {
      mask: true,
      preserveContext: true, // Preserve context for better LLM understanding
    });
  };
}

/**
 * Validate that content is safe to send to external APIs
 */
export function validateNoPII(content: string): { safe: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    if (pattern.test(content)) {
      warnings.push(`Potential ${type} detected`);
    }
  }
  
  return {
    safe: warnings.length === 0,
    warnings,
  };
}
