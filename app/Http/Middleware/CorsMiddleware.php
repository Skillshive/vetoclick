<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    { 
        $allowedOrigins = env('FRONTEND_URL', 'http://localhost:3000,http://localhost:3001');
        
        $origins = array_map('trim', explode(',', $allowedOrigins));
        
        $origin = $request->headers->get('Origin');
        
        $allowedOrigin = null;
        
        if ($origin) {
            // In development, allow any localhost origin for easier development
            if (app()->environment('local')) {
                $parsedOrigin = parse_url($origin);
                if ($parsedOrigin && isset($parsedOrigin['host']) && 
                    ($parsedOrigin['host'] === 'localhost' || $parsedOrigin['host'] === '127.0.0.1' || $parsedOrigin['host'] === '::1')) {
                    $allowedOrigin = $origin;
                } elseif (in_array($origin, $origins)) {
                    $allowedOrigin = $origin;
                } else {
                    // If origin is provided but not in list, allow it in development
                    $allowedOrigin = $origin;
                }
            } else {
                // In production, only allow configured origins
                $allowedOrigin = in_array($origin, $origins) ? $origin : null;
            }
        }

        
        if (!$allowedOrigin && !empty($origins)) {
            $allowedOrigin = $origins[0];
        }


        // If still no origin, don't set CORS headers (same-origin request)
        if (!$allowedOrigin) {
            return $next($request);
        }
        
        // Handle preflight OPTIONS requests
        if ($request->isMethod('OPTIONS')) {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', $allowedOrigin) // FIXED: was $origins (array), now $allowedOrigin (string)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, X-CSRF-TOKEN, X-XSRF-TOKEN')
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Max-Age', '86400');
        }

        $response = $next($request);

        // Ensure response is a response object
        if (!$response instanceof \Symfony\Component\HttpFoundation\Response) {
            $response = response($response);
        }

        // Add CORS headers to the response - CRITICAL: Use specific origin, never '*'
        $response->headers->set('Access-Control-Allow-Origin', $allowedOrigin, true);
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS', true);
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, X-CSRF-TOKEN, X-XSRF-TOKEN', true);
        $response->headers->set('Access-Control-Allow-Credentials', 'true', true);
        $response->headers->set('Vary', 'Origin', false);

        return $response;
    }
}
