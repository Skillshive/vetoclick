<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\FeatureGateService;
use Illuminate\Support\Facades\Auth;

class CheckSubscriptionFeature
{
    protected $featureGate;

    public function __construct(FeatureGateService $featureGate)
    {
        $this->featureGate = $featureGate;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $feature, ...$context): Response
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $contextArray = $this->buildContext($request, $context);
        
        if (!$this->featureGate->can($user, $feature, $contextArray)) {
            $reason = $this->featureGate->getRestrictionReason($user, $feature, $contextArray);
            
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Feature not available',
                    'message' => $reason,
                    'feature' => $feature,
                    'upgrade_required' => true
                ], 403);
            }
            
            return redirect()->back()->with('error', $reason);
        }

        return $next($request);
    }

    /**
     * Build context array from request and parameters
     */
    private function buildContext(Request $request, array $context): array
    {
        $contextArray = [];
        
        // Add common context
        $contextArray['clinic_id'] = $request->user()->clinic_id ?? null;
        $contextArray['month'] = now()->month;
        
        // Add any additional context from middleware parameters
        foreach ($context as $key => $value) {
            $contextArray[$key] = $value;
        }
        
        return $contextArray;
    }
}
