<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Services\SupplierService;
use App\common\SupplierDto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Exception;

class SupplierController extends Controller
{
    protected SupplierService $supplierService;

    public function __construct(SupplierService $supplierService)
    {
        $this->supplierService = $supplierService;
    }

    /**
     * Display a listing of suppliers
     */
    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');

        try {
            if ($search) {
                $suppliers = $this->supplierService->searchByName($search, $perPage);
            } else {
                $suppliers = $this->supplierService->getAll($perPage);
            }

            return Inertia::render('Suppliers/Index', [
                'suppliers' => [
                    'data' => $suppliers->items(),
                    'meta' => [
                        'current_page' => $suppliers->currentPage(),
                        'from' => $suppliers->firstItem(),
                        'last_page' => $suppliers->lastPage(),
                        'per_page' => $suppliers->perPage(),
                        'to' => $suppliers->lastItem(),
                        'total' => $suppliers->total(),
                    ],
                    'links' => [
                        'first' => $suppliers->url(1),
                        'last' => $suppliers->url($suppliers->lastPage()),
                        'prev' => $suppliers->previousPageUrl(),
                        'next' => $suppliers->nextPageUrl(),
                    ]
                ],
                'filters' => [
                    'search' => $search,
                    'per_page' => $perPage,
                ]
            ]);
        } catch (Exception $e) {
            return Inertia::render('Suppliers/Index', [
                'suppliers' => ['data' => [], 'meta' => null, 'links' => null],
                'filters' => [
                    'search' => $search,
                    'per_page' => $perPage,
                ],
                'error' => 'Failed to retrieve suppliers: ' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * Store a newly created supplier
     */
    public function store(StoreSupplierRequest $request): RedirectResponse
    {
        try {
            $dto = SupplierDto::fromRequest($request);
            $this->supplierService->create($dto);

            return redirect()->route('suppliers.index')
                ->with('success', 'Supplier created successfully');
        } catch (Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create supplier: ' . $e->getMessage()]);
        }
    }
    
    /**
     * Update the specified supplier by ID
     */
    public function update(UpdateSupplierRequest $request, int $id): RedirectResponse
    {
        try {
            $dto = SupplierDto::fromRequest($request);
            $supplier = $this->supplierService->update($id, $dto);

            if (!$supplier) {
                return redirect()->back()
                    ->withErrors(['error' => 'Supplier not found']);
            }

            return redirect()->route('suppliers.index')
                ->with('success', 'Supplier updated successfully');
        } catch (Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update supplier: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified supplier by ID
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            $deleted = $this->supplierService->delete($id);

            if (!$deleted) {
                return redirect()->back()
                    ->withErrors(['error' => 'Supplier not found']);
            }

            return redirect()->route('suppliers.index')
                ->with('success', 'Supplier deleted successfully');
        } catch (Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Failed to delete supplier: ' . $e->getMessage()]);
        }
    }
}
