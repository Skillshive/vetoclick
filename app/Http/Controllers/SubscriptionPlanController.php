<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionPlan;
use App\Models\FeatureGroup;
use App\Models\Feature;
use App\Services\SubscriptionPlanService;
use App\Http\Requests\SubscriptionPlanRequest;
use App\Http\Resources\SubscriptionPlanResource;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionPlanController extends Controller
{
    protected $subscriptionPlanService;

    public function __construct(SubscriptionPlanService $subscriptionPlanService)
    {
        $this->subscriptionPlanService = $subscriptionPlanService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $perPage = $request->get('per_page', 12);
        $page = $request->get('page', 1);

        $query = $this->subscriptionPlanService->query();
        
        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(name, '$.en')) LIKE ?", ["%{$search}%"])
                  ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(name, '$.ar')) LIKE ?", ["%{$search}%"])
                  ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(name, '$.fr')) LIKE ?", ["%{$search}%"])
                  ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(description, '$.en')) LIKE ?", ["%{$search}%"])
                  ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(description, '$.ar')) LIKE ?", ["%{$search}%"])
                  ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(description, '$.fr')) LIKE ?", ["%{$search}%"]);
            });
        }

        // Order by sort_order and created_at
        $query->orderBy('sort_order')->orderBy('created_at', 'desc');

        $plans = $query->with(['planFeatures.group'])->paginate($perPage, ['*'], 'page', $page);

        // Get feature groups and features for the form
        $featureGroups = FeatureGroup::with('features')->ordered()->get();
        $allFeatures = Feature::with('group')->ordered()->get();

        return Inertia::render('SubscriptionPlans/Index', [
            'subscriptionPlans' => [
                'data' => SubscriptionPlanResource::collection($plans->items()),
                'meta' => [
                    'current_page' => $plans->currentPage(),
                    'last_page' => $plans->lastPage(),
                    'per_page' => $plans->perPage(),
                    'total' => $plans->total(),
                ],
                'links' => [
                    'first' => $plans->url(1),
                    'last' => $plans->url($plans->lastPage()),
                    'prev' => $plans->previousPageUrl(),
                    'next' => $plans->nextPageUrl(),
                ],
            ],
            'featureGroups' => $featureGroups,
            'allFeatures' => $allFeatures,
            'filters' => [
                'search' => $search
            ],
            'old' => $request->old(),
            'errors' => $request->session()->get('errors'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('SubscriptionPlans/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SubscriptionPlanRequest $request)
    {
        try {
            $plan = $this->subscriptionPlanService->create($request->validated());

            return redirect()->route('subscription-plans.index')
                ->with('success', 'Subscription plan created successfully.');
        } catch (\Exception $e) {
            
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create subscription plan.']);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(SubscriptionPlan $subscriptionPlan)
    {
        $subscriptionPlan->load(['planFeatures.group']);
        
        return Inertia::render('SubscriptionPlans/Show', [
            'subscriptionPlan' => new SubscriptionPlanResource($subscriptionPlan),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SubscriptionPlan $subscriptionPlan)
    {
        $subscriptionPlan->load(['planFeatures.group']);
        
        // Get feature groups and features for the form
        $featureGroups = FeatureGroup::with('features')->ordered()->get();
        $allFeatures = Feature::with('group')->ordered()->get();
        
        return Inertia::render('SubscriptionPlans/Edit', [
            'subscriptionPlan' => new SubscriptionPlanResource($subscriptionPlan),
            'featureGroups' => $featureGroups,
            'allFeatures' => $allFeatures,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SubscriptionPlanRequest $request, SubscriptionPlan $subscriptionPlan)
    {
        try {
            $this->subscriptionPlanService->update($subscriptionPlan, $request->validated());
            
            return redirect()->route('subscription-plans.index')
                ->with('success', 'Subscription plan updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update subscription plan.']);
        }
    }

    /**
     * Toggle the active status of the subscription plan.
     */
    public function toggle(SubscriptionPlan $subscriptionPlan)
    {
        try {
            // Check if we're trying to activate and would exceed the limit
            if (!$subscriptionPlan->is_active) {
                $activeCount = SubscriptionPlan::where('is_active', true)->count();
                if ($activeCount >= 3) {
                    return redirect()->back()
                        ->withErrors(['message' => 'Maximum of 3 active subscription plans allowed.']);
                }
            }

            $subscriptionPlan->update(['is_active' => !$subscriptionPlan->is_active]);
            
            return redirect()->back()
                ->with('success', 'Subscription plan status updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['message' => 'Failed to update subscription plan status.']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SubscriptionPlan $subscriptionPlan)
    {
        try {
            $this->subscriptionPlanService->delete($subscriptionPlan);
            
            return redirect()->route('subscription-plans.index')
                ->with('success', 'Subscription plan deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Failed to delete subscription plan.']);
        }
    }
}
