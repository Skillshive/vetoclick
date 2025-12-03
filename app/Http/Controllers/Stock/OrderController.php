<?php

namespace App\Http\Controllers\Stock;

use App\Http\Controllers\Controller;
use App\Services\OrderService;
use App\DTOs\Stock\OrderDto;
use App\Http\Requests\Stock\OrderRequest;
use Illuminate\Http\Request;
use Exception;
use App\Models\Supplier;
use App\Http\Resources\Stock\SupplierResource;
use App\Http\Resources\Stock\OrderResource;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\Product\ProductApiResource;
use App\Models\Product;
class OrderController extends Controller
{
    protected OrderService $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    /**
     * Get all orders
     */
    public function index(Request $request): Response
    {
        try {
            $perPage = $request->input('per_page', 8);
            $search = $request->input('search');
            $status = $request->input('status');
            $supplier = $request->input('supplier');

            // Get orders with filters
            $orders = $this->orderService->getFiltered([
                'search' => $search,
                'status' => $status,
                'supplier' => $supplier,
                'per_page' => $perPage,
            ]);

            // Get suppliers for filters
            $suppliers = Supplier::all();

            $suppliersResource = SupplierResource::collection($suppliers);
            
            // Get statistics
            $statistics = $this->orderService->getStatistics();
            
            return Inertia::render('Orders/Index', [
                'orders' => [
                    'data' => OrderResource::collection($orders->items())->toArray(request()),
                    'meta' => [
                        'current_page' => $orders->currentPage(),
                        'from' => $orders->firstItem(),
                        'last_page' => $orders->lastPage(),
                        'per_page' => $orders->perPage(),
                        'to' => $orders->lastItem(),
                        'total' => $orders->total(),
                    ],
                    'links' => [
                        'first' => $orders->url(1),
                        'last' => $orders->url($orders->lastPage()),
                        'prev' => $orders->previousPageUrl(),
                        'next' => $orders->nextPageUrl(),
                    ]
                ],
                'suppliers' => $suppliersResource->toArray(request()),
                'statistics' => $statistics,
                'filters' => [
                    'search' => $search,
                    'per_page' => $perPage,
                    'status' => $status,
                    'supplier' => $supplier,
                ]
            ]);
        } catch (Exception $e) {
            return Inertia::render('Orders/Index', [
                'error' => __('common.order_retrieve_error'),
                'orders' => null,
                'suppliers' => [],
                'filters' => []
            ]);
        }
    }

    public function create(): Response
    {
        // Get suppliers for the form
        $suppliers = Supplier::all();
        
        // Get products for the form
        $products = Product::all();
        $productsResource = ProductApiResource::collection($products);
        
        $suppliersResource = SupplierResource::collection($suppliers);
        return Inertia::render('Orders/Create', [
            'suppliers' => $suppliersResource->toArray(request()),
            'products' =>$productsResource->toArray(request())
        ]);
    }


    /**
     * Get order by UUID
     */
    public function show(string $uuid): Response
    {
        try {
            $order = $this->orderService->getByUuid($uuid);

            if (!$order) {
                return Inertia::render('Orders/Show', [
                    'error' => __('common.order_not_found')
                ]);
            }

            $orderResource = new OrderResource($order);
            return Inertia::render('Orders/Show', [
                'order' => $orderResource->toArray(request())
            ]);
        } catch (Exception $e) {
            return Inertia::render('Orders/Show', [
                'error' => __('common.order_retrieve_error')
            ]);
        }
    }

    /**
     * Show the form for editing the specified blog
     */
    public function edit(string $uuid): Response
    {
        try {
                $order = $this->orderService->getByUuid($uuid);

            if (!$order) {
                return Inertia::render('Orders/Edit', [
                    'error' => __('common.order_not_found')
                ]);
            }

            // Get suppliers for the form
            $suppliers = Supplier::all();
            $suppliersResource = SupplierResource::collection($suppliers);
            
            // Get products for the form
            $products = Product::all();
            $productsResource = ProductApiResource::collection($products);
            
            $orderResource = new OrderResource($order);
            return Inertia::render('Orders/Edit', [
                'order' => $orderResource->toArray(request()),
                'suppliers' => $suppliersResource->toArray(request()),
                'products' => $productsResource->toArray(request())
            ]);
        } catch (Exception $e) {
            return Inertia::render('Orders/Edit', [
                'error' => __('common.order_retrieve_error')
            ]);
        }
    }

    /**
     * Create a new blog
     */
    public function store(OrderRequest $request)
    {
        try {
            \Log::info('Order store method called', ['data' => $request->all()]);
            $dto = OrderDto::fromRequest($request);
            \Log::info('DTO created', ['dto' => $dto]);
            $order = $this->orderService->create($dto);
            \Log::info('Order created', ['order_id' => $order->id]);

            return redirect()->route('orders.index')->with('success', __('common.order_created_success'));

        } catch (Exception $e) {
            \Log::error('Order creation failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return back()->withErrors(['error' => __('common.order_create_error') . ': ' . $e->getMessage()]);
        }
    }

    /**
     * Update blog by UUID
     */
    public function update(OrderRequest $request, string $uuid)
    {
        try {
            $order = $this->orderService->getByUuid($uuid);

            if (!$order) {
                return back()->with('error', __('common.order_not_found'));
            }

            $dto = OrderDto::fromRequest($request);
            $updatedOrder = $this->orderService->update($uuid, $dto);

            return redirect()->route('orders.index')->with('success', __('common.order_updated_success'));

        } catch (Exception $e) {
                return back()->with('error', __('common.order_update_error'));
        }
    }

    /**
     * Delete blog by UUID
     */
    public function destroy(string $uuid)
    {
        try {
            $order = $this->orderService->getByUuid($uuid);

            if (!$order) {
                return back()->with('error', __('common.order_not_found'));
            }

            $this->orderService->delete($uuid);

            return redirect()->route('orders.index')->with('success', __('common.order_deleted_success'));

        } catch (Exception $e) {
            return back()->with('error', __('common.order_delete_error'));
        }
    }

    /**
     * Search orders by reference
     */
    public function search(Request $request): Response
    {
        try {
            $validator = Validator::make($request->all(), [
                    'reference' => 'required|string|min:1|max:255',
                'per_page' => 'nullable|integer|min:1|max:100'
            ]);

            if ($validator->fails()) {
                return Inertia::render('Orders/Index', [
                    'errors' => $validator->errors()
                ]);
            }

            $perPage = $request->input('per_page', 15);
            $orders = $this->orderService->searchByReference($request->reference, $perPage);

            // Get category blogs for filters
                    $suppliers = Supplier::all();
            $suppliersResource = SupplierResource::collection($suppliers);
            return Inertia::render('Orders/Index', [
                    'orders' => [
                    'data' => OrderResource::collection($orders->items())->toArray(request()),
                    'meta' => [
                        'current_page' => $orders->currentPage(),
                        'from' => $orders->firstItem(),
                        'last_page' => $orders->lastPage(),
                        'per_page' => $orders->perPage(),
                        'to' => $orders->lastItem(),
                        'total' => $orders->total(),
                    ],
                    'links' => [
                            'first' => $orders->url(1),
                        'last' => $orders->url($orders->lastPage()),
                        'prev' => $orders->previousPageUrl(),
                        'next' => $orders->nextPageUrl(),
                    ]
                ],
                'suppliers' => $suppliersResource->toArray(request()),
                'filters' => [
                    'search' => $request->reference
                ]
            ]);
        } catch (Exception $e) {
            return Inertia::render('Orders/Index', [
                'error' => __('common.order_search_error')
            ]);
        }
    }
}
