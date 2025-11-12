<?php

namespace App\Http\Controllers;

use App\DTOs\Orders\OrderDto;
use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentMethod;
use App\Http\Requests\Orders\OrderRequest;
use App\Http\Resources\Orders\OrderResource;
use App\Models\Supplier;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService,
    ) {
    }

    public function index(Request $request): Response
    {
        $perPage = (int) $request->get('per_page', 10);
        $filters = [
            'search' => $request->get('search'),
            'status' => $request->get('status'),
            'order_type' => $request->get('order_type'),
            'supplier_ids' => $request->get('supplier_ids'),
            'sort_by' => $request->get('sort_by'),
            'sort_direction' => $request->get('sort_direction'),
        ];

        $orders = $this->orderService->paginate($perPage, $filters);

        return Inertia::render('Orders/Index', [
            'orders' => [
                'data' => OrderResource::collection($orders->items()),
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
                ],
            ],
            'filters' => array_merge($filters, [
                'per_page' => $perPage,
            ]),
            'dictionaries' => [
                'order_statuses' => OrderStatus::toArray(),
                'order_types' => OrderType::toArray(),
                'payment_methods' => PaymentMethod::toArray(),
                'suppliers' => Supplier::select('id', 'uuid', 'name')
                    ->orderBy('name')
                    ->get(),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Orders/Create', [
            'dictionaries' => [
                'order_statuses' => OrderStatus::toArray(),
                'order_types' => OrderType::toArray(),
                'payment_methods' => PaymentMethod::toArray(),
                'suppliers' => Supplier::select('id', 'uuid', 'name')
                    ->orderBy('name')
                    ->get(),
            ],
            'defaults' => [
                'status' => OrderStatus::DRAFT->value,
                'order_type' => OrderType::REGULAR->value,
                'payment_method' => PaymentMethod::CASH->value,
            ],
            'old' => $request->old(),
        ]);
    }

    public function store(OrderRequest $request): RedirectResponse
    {
        $dto = OrderDto::fromRequest($request, requestedBy: $request->user()?->id);
        $this->orderService->create($dto);

        return redirect()
            ->route('orders.index')
            ->with('success', __('common.order_created_success'));
    }

    public function edit(string $order): Response
    {
        $orderModel = $this->orderService->getByUuid($order);

        abort_if(!$orderModel, 404, __('common.order_not_found'));

        return Inertia::render('Orders/Edit', [
            'order' => new OrderResource($orderModel),
            'dictionaries' => [
                'order_statuses' => OrderStatus::toArray(),
                'order_types' => OrderType::toArray(),
                'payment_methods' => PaymentMethod::toArray(),
                'suppliers' => Supplier::select('id', 'uuid', 'name')
                    ->orderBy('name')
                    ->get(),
            ],
        ]);
    }

    public function update(OrderRequest $request, string $order): RedirectResponse
    {
        $dto = OrderDto::fromRequest($request);
        $updatedOrder = $this->orderService->update($order, $dto);

        if (!$updatedOrder) {
            return redirect()
                ->back()
                ->withErrors(['error' => __('common.order_not_found')]);
        }

        return redirect()
            ->route('orders.index')
            ->with('success', __('common.order_updated_success'));
    }

    public function destroy(string $order): RedirectResponse
    {
        $deleted = $this->orderService->delete($order);

        if (!$deleted) {
            return redirect()
                ->back()
                ->withErrors(['error' => __('common.order_not_found')]);
        }

        return redirect()
            ->route('orders.index')
            ->with('success', __('common.order_deleted_success'));
    }
}

