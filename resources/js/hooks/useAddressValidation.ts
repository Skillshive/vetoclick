import { useState, useCallback, useRef } from 'react';

interface AddressValidationResult {
  valid: boolean;
  message?: string;
  error?: string;
  suggestions?: Array<{
    formatted_address: string;
    place_id?: string;
  }>;
  formatted_address?: string;
  location?: {
    lat: number;
    lng: number;
  } | null;
  place_id?: string;
}

interface UseAddressValidationReturn {
  isValidating: boolean;
  validationResult: AddressValidationResult | null;
  validateAddress: (address: string, isFromMap?: boolean) => Promise<AddressValidationResult>;
  clearValidation: () => void;
}

export const useAddressValidation = (): UseAddressValidationReturn => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<AddressValidationResult | null>(null);
  const lastValidatedAddress = useRef<string>('');

  const validateAddress = useCallback(async (address: string, isFromMap: boolean = false): Promise<AddressValidationResult> => {
    // Clean the address - remove console logs and other noise
    const cleanAddress = address
      // Remove console log patterns
      .replace(/Download the React DevTools.*?$/gm, '')
      .replace(/Unchecked runtime\.lastError.*?$/gm, '')
      .replace(/Backend locale.*?$/gm, '')
      .replace(/Frontend locale.*?$/gm, '')
      .replace(/user Object.*?$/gm, '')
      .replace(/Container dimensions.*?$/gm, '')
      .replace(/Map resized.*?$/gm, '')
      .replace(/Map initialized.*?$/gm, '')
      .replace(/CSRF Token.*?$/gm, '')
      .replace(/Address to validate.*?$/gm, '')
      .replace(/Validation API result.*?$/gm, '')
      .replace(/API Success Response.*?$/gm, '')
      .replace(/Creating marker.*?$/gm, '')
      .replace(/Marker created.*?$/gm, '')
      .replace(/Successfully geocoded.*?$/gm, '')
      .replace(/Trying geocoding.*?$/gm, '')
      .replace(/Geocoding result.*?$/gm, '')
      .replace(/Skipping duplicate.*?$/gm, '')
      .replace(/Validation API failed.*?$/gm, '')
      .replace(/Trying direct geocoding.*?$/gm, '')
      .replace(/API Error Response.*?$/gm, '')
      .replace(/Address validation error.*?$/gm, '')
      .replace(/General\.tsx.*?$/gm, '')
      .replace(/InlineAddressMap\.tsx.*?$/gm, '')
      .replace(/useAddressValidation\.ts.*?$/gm, '')
      // Remove any remaining console log patterns
      .replace(/console\.log.*?$/gm, '')
      .replace(/console\.warn.*?$/gm, '')
      .replace(/console\.error.*?$/gm, '')
      .replace(/console\.info.*?$/gm, '')
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanAddress) {
      const result = { valid: true };
      setValidationResult(result);
      lastValidatedAddress.current = '';
      return result;
    }

    // Don't validate the same address twice
    if (lastValidatedAddress.current === cleanAddress) {
      return validationResult || { valid: true };
    }

    // Don't validate very short addresses
    if (cleanAddress.length < 5) {
      setValidationResult(null);
      return { valid: true };
    }

    // Don't validate addresses that are too long (likely corrupted)
    if (cleanAddress.length > 500) {
      const result = {
        valid: false,
        error: 'Address too long',
        message: 'The address is too long. Please enter a shorter, more specific address.',
      };
      setValidationResult(result);
      return result;
    }

    // For map-selected addresses, be more lenient
    if (isFromMap) {
      // If it's a coordinate-based address, accept it immediately
      if (/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(cleanAddress)) {
        const result = {
          valid: true,
          message: 'Location selected from map',
          location: {
            lat: parseFloat(cleanAddress.split(',')[0]),
            lng: parseFloat(cleanAddress.split(',')[1])
          }
        };
        setValidationResult(result);
        lastValidatedAddress.current = cleanAddress;
        return result;
      }
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      // Get CSRF token from meta tag or use a default
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || 
                       document.querySelector('meta[name="_token"]')?.getAttribute('content') ||
                       '';


      const response = await fetch('/validate-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({ address: cleanAddress }),
        credentials: 'same-origin', // Include cookies for CSRF
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        if (isFromMap) {
          const result = {
            valid: true,
            message: 'Location selected from map (validation service unavailable)',
            location: null // We'll use the coordinates from the map
          };
          setValidationResult(result);
          lastValidatedAddress.current = cleanAddress;
          return result;
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      if (isFromMap && !result.valid && (result.error === 'No results found' || result.message?.includes('could not be found'))) {
        const fallbackResult = {
          valid: true,
          message: 'Location selected from map (not found in validation database)',
          location: null // We'll use the coordinates from the map
        };
        setValidationResult(fallbackResult);
        lastValidatedAddress.current = cleanAddress;
        return fallbackResult;
      }
      
      setValidationResult(result);
      lastValidatedAddress.current = cleanAddress;
      return result;
    } catch (error) {
      
      // Check if it's a network error or server error
      const isNetworkError = error instanceof TypeError || (error as Error).message.includes('Failed to fetch');
      
      const result = {
        valid: false,
        error: isNetworkError ? 'Network error' : 'Server error',
        message: isNetworkError 
          ? 'Unable to validate address. Please check your connection and try again.'
          : 'Address validation service is temporarily unavailable. Please try again later.',
      };
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
    lastValidatedAddress.current = '';
  }, []);

  return {
    isValidating,
    validationResult,
    validateAddress,
    clearValidation,
  };
};
