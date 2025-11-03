<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AddressValidationService
{
    protected string $baseUrl;
    protected string $userAgent;

    public function __construct()
    {
        $this->baseUrl = config('services.openstreetmap.nominatim_url', 'https://nominatim.openstreetmap.org/search');
        $this->userAgent = config('services.openstreetmap.user_agent', 'VetoClick/1.0 (Address Validation)');
    }

    /**
     * Validate if an address exists using OpenStreetMap Nominatim API
     *
     * @param string $address
     * @return array
     */
    public function validateAddress(string $address): array
    {
        if (empty(trim($address))) {
            return [
                'valid' => false,
                'error' => 'Empty address',
                'message' => 'Address cannot be empty.'
            ];
        }

        try {
            $response = Http::timeout(15)
                ->withHeaders([
                    'User-Agent' => $this->userAgent,
                ])
                ->get($this->baseUrl, [
                    'q' => $address,
                    'format' => 'json',
                    'addressdetails' => 1,
                    'limit' => 5,
                    'countrycodes' => '', // Search globally
                ]);

            if (!$response->successful()) {
                Log::error('OpenStreetMap Nominatim API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                return [
                    'valid' => false,
                    'error' => 'API request failed',
                    'message' => 'Unable to validate address at the moment. Please try again later.'
                ];
            }

            $data = $response->json();

            return $this->processNominatimResponse($data, $address);

        } catch (\Exception $e) {
            Log::error('Address validation error', [
                'address' => $address,
                'error' => $e->getMessage()
            ]);

            return [
                'valid' => false,
                'error' => 'Validation error',
                'message' => 'Unable to validate address. Please try again later.'
            ];
        }
    }

    /**
     * Process the Nominatim API response
     *
     * @param array $data
     * @param string $originalAddress
     * @return array
     */
    protected function processNominatimResponse(array $data, string $originalAddress): array
    {
        // Nominatim returns an array of results directly
        if (empty($data) || !is_array($data)) {
            // Try a simplified search for very detailed addresses
            return $this->trySimplifiedSearch($originalAddress);
        }

        $results = $data;
        $result = $results[0];

        // Check if we have a good match
        $importance = $result['importance'] ?? 0;
        $displayName = $result['display_name'] ?? '';
        $address = $result['address'] ?? [];

        // Determine if this is a good match based on importance and address details
        $isGoodMatch = $this->isGoodAddressMatch($result, $originalAddress);

        if (!$isGoodMatch) {
            // If we have multiple results, show suggestions
            if (count($results) > 1) {
                return [
                    'valid' => false,
                    'error' => 'Ambiguous address',
                    'message' => 'The address appears to be ambiguous. Please be more specific.',
                    'suggestions' => $this->extractNominatimSuggestions($results)
                ];
            }

            // Check if it's a very poor match (very low importance)
            if ($importance < 0.01) {
                // Try simplified search for detailed addresses
                return $this->trySimplifiedSearch($originalAddress);
            }

            return [
                'valid' => false,
                'error' => 'Poor match',
                'message' => 'The address could not be found or is too vague. Please provide a more specific address.'
            ];
        }

        return [
            'valid' => true,
            'message' => 'Address validated successfully.',
            'formatted_address' => $displayName,
            'location' => [
                'lat' => (float) $result['lat'],
                'lng' => (float) $result['lon']
            ],
            'place_id' => $result['place_id'] ?? null,
            'importance' => $importance
        ];
    }

    /**
     * Check if the address match is good enough
     *
     * @param array $result
     * @param string $originalAddress
     * @return bool
     */
    protected function isGoodAddressMatch(array $result, string $originalAddress): bool
    {
        $importance = $result['importance'] ?? 0;
        $displayName = $result['display_name'] ?? '';
        $address = $result['address'] ?? [];

        // Check importance threshold (lowered to 0.05 for more lenient matching)
        if ($importance < 0.05) {
            return false;
        }

        // Check if we have essential address components
        $hasStreet = !empty($address['road']) || !empty($address['street']);
        $hasCity = !empty($address['city']) || !empty($address['town']) || !empty($address['village']);
        $hasCountry = !empty($address['country']);
        $hasState = !empty($address['state']) || !empty($address['region']);

        // For a good match, we need at least:
        // 1. City and country, OR
        // 2. Street and city, OR  
        // 3. City and state (for some regions), OR
        // 4. Very high importance (0.3+) even without perfect components
        return ($hasCity && $hasCountry) || 
               ($hasStreet && $hasCity) || 
               ($hasCity && $hasState) ||
               ($importance >= 0.3);
    }

    /**
     * Extract address suggestions from Nominatim results
     *
     * @param array $results
     * @return array
     */
    protected function extractNominatimSuggestions(array $results): array
    {
        return array_map(function ($result) {
            return [
                'formatted_address' => $result['display_name'],
                'place_id' => $result['place_id'] ?? null,
                'importance' => $result['importance'] ?? 0
            ];
        }, array_slice($results, 0, 5)); // Limit to 5 suggestions
    }

    /**
     * Try a simplified search for detailed addresses
     *
     * @param string $originalAddress
     * @return array
     */
    protected function trySimplifiedSearch(string $originalAddress): array
    {
        // Extract key components from the address
        $simplifiedAddress = $this->simplifyAddress($originalAddress);
        
        if ($simplifiedAddress === $originalAddress) {
            // No simplification possible
            return [
                'valid' => false,
                'error' => 'No results found',
                'message' => 'The provided address could not be found on maps. Please check the spelling and try again.'
            ];
        }

        try {
            $response = Http::timeout(15)
                ->withHeaders([
                    'User-Agent' => $this->userAgent,
                ])
                ->get($this->baseUrl, [
                    'q' => $simplifiedAddress,
                    'format' => 'json',
                    'addressdetails' => 1,
                    'limit' => 3,
                    'countrycodes' => '', // Search globally
                ]);

            if (!$response->successful()) {
                return [
                    'valid' => false,
                    'error' => 'No results found',
                    'message' => 'The provided address could not be found on maps. Please check the spelling and try again.'
                ];
            }

            $data = $response->json();

            if (empty($data) || !is_array($data)) {
                return [
                    'valid' => false,
                    'error' => 'No results found',
                    'message' => 'The provided address could not be found on maps. Please check the spelling and try again.'
                ];
            }

            // If we found results with the simplified address, check if any are good matches
            $bestMatch = $data[0];
            $importance = $bestMatch['importance'] ?? 0;
            
            // If the simplified search found a good match, accept it
            if ($importance >= 0.05) {
                return [
                    'valid' => true,
                    'message' => 'Address validated successfully (simplified search).',
                    'formatted_address' => $bestMatch['display_name'],
                    'location' => [
                        'lat' => (float) $bestMatch['lat'],
                        'lng' => (float) $bestMatch['lon']
                    ],
                    'place_id' => $bestMatch['place_id'] ?? null,
                    'importance' => $importance,
                    'simplified_search' => $simplifiedAddress
                ];
            }
            
            // Otherwise show suggestions
            return [
                'valid' => false,
                'error' => 'Address too specific',
                'message' => 'The address is too specific for validation. Here are some suggestions for the general area:',
                'suggestions' => $this->extractNominatimSuggestions($data),
                'simplified_search' => $simplifiedAddress
            ];

        } catch (\Exception $e) {
            Log::error('Simplified address search error', [
                'original' => $originalAddress,
                'simplified' => $simplifiedAddress,
                'error' => $e->getMessage()
            ]);

            return [
                'valid' => false,
                'error' => 'No results found',
                'message' => 'The provided address could not be found on maps. Please check the spelling and try again.'
            ];
        }
    }

    /**
     * Simplify an address by extracting key components
     *
     * @param string $address
     * @return string
     */
    protected function simplifyAddress(string $address): string
    {
        // Split by commas to handle each part separately
        $parts = explode(',', $address);
        $simplifiedParts = [];
        
        foreach ($parts as $part) {
            $part = trim($part);
            
            // Skip parts that are only floor details or unit numbers
            if (preg_match('/^\d+[eèé]me?\s+ETAGE/i', $part) || preg_match('/^5éme/i', $part)) {
                continue; // Skip floor details
            }
            
            if (preg_match('/^N°?\s*\d+$/', $part)) {
                continue; // Skip unit numbers only
            }
            
            // Clean the part of any remaining specific details
            $cleanedPart = preg_replace('/\d+[eèé]me?\s+ETAGE[^,]*/i', '', $part);
            $cleanedPart = preg_replace('/N°?\s*\d+/i', '', $cleanedPart);
            $cleanedPart = preg_replace('/IMM\s+[A-Z]+/i', '', $cleanedPart);
            $cleanedPart = preg_replace('/ESPACE\s+[A-Z\s]+/i', '', $cleanedPart);
            $cleanedPart = preg_replace('/FES\s+[A-Z]+/i', '', $cleanedPart);
            $cleanedPart = preg_replace('/\s+/', ' ', $cleanedPart);
            $cleanedPart = trim($cleanedPart);
            
            if (!empty($cleanedPart)) {
                $simplifiedParts[] = $cleanedPart;
            }
        }
        
        $simplified = implode(', ', $simplifiedParts);
        
        // If we removed too much, try to keep at least the street and city
        if (strlen($simplified) < 10) {
            // Extract street name and city from original
            $originalParts = explode(',', $address);
            if (count($originalParts) >= 2) {
                $street = trim($originalParts[0]);
                $city = trim(end($originalParts));
                
                // Clean the street name more aggressively
                $street = preg_replace('/\d+[eèé]me?\s+ETAGE[^,]*/i', '', $street);
                $street = preg_replace('/N°?\s*\d+/i', '', $street);
                $street = preg_replace('/\s+/', ' ', $street);
                $street = trim($street);
                
                if (!empty($street) && !empty($city)) {
                    $simplified = $street . ', ' . $city;
                }
            }
        }

        return $simplified;
    }

    /**
     * Check if the service is available
     *
     * @return bool
     */
    public function isAvailable(): bool
    {
        // OpenStreetMap Nominatim is always available (no API key required)
        return true;
    }
}
