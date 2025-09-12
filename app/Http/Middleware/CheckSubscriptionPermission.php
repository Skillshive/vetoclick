<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\FeatureGateService;
use Illuminate\Support\Facades\Auth;

class CheckSubscriptionPermission
{
    protected $featureGate;

    public function __construct(FeatureGateService $featureGate)
    {
        $this->featureGate = $featureGate;
    }

    /**
     * Handle an incoming request.
     * 
     * Usage: middleware:subscription.permission:create_user,users.create
     * First parameter: subscription action
     * Second parameter: required permission (optional)
     */
    public function handle(Request $request, Closure $next, string $subscriptionAction, string $permission = null): Response
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        // Check permission first (if specified)
        if ($permission && !$user->can($permission)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Insufficient permissions',
                    'message' => 'You do not have permission to perform this action.',
                    'required_permission' => $permission
                ], 403);
            }
            
            return redirect()->back()->with('error', 'You do not have permission to perform this action.');
        }

        // Check subscription limits
        $contextArray = $this->buildContext($request);
        
        if (!$this->featureGate->can($user, $subscriptionAction, $contextArray)) {
            $reason = $this->featureGate->getRestrictionReason($user, $subscriptionAction, $contextArray);
            
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Subscription limit reached',
                    'message' => $reason,
                    'subscription_action' => $subscriptionAction,
                    'upgrade_required' => true
                ], 403);
            }
            
            return redirect()->back()->with('error', $reason);
        }

        return $next($request);
    }

    /**
     * Build context array from request
     */
    private function buildContext(Request $request): array
    {
        return [
            'clinic_id' => $request->user()->clinic_id ?? null,
            'month' => now()->month,
            'year' => now()->year,
        ];
    }
}
