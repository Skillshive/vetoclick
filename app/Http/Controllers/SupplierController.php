<?php

namespace App\Http\Controllers;

use App\Services\SupplierService;
use App\common\SupplierDto;
use App\Http\Requests\Stock\ImportSuppliersRequest;
use App\Http\Requests\SupplierRequest;
use App\Http\Resources\Stock\SupplierResource;
use App\Models\Supplier;
use App\Services\CsvService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Exception;
use Illuminate\Validation\Factory;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
        $perPage = $request->get('per_page', 10);
        $search = $request->get('search');
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $page = $request->get('page', 1);

        try {
            $query = $this->supplierService->query();

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('address', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ;
                });
            }

            $suppliers = $query->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);

            return Inertia::render('Suppliers/Index', [
                'suppliers' => [
                    'data' => SupplierResource::collection($suppliers->items()),
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
                    'sort_by' => $sortBy,
                    'sort_direction' => $sortDirection,
                ],
                'old' => $request->old(),
                'errors' => $request->session()->get('errors')
            ]);
        } catch (Exception $e) {

            return Inertia::render('Suppliers/Index', [
                'categoryBlogs' => [
                    'data' => ['data' => []],
                    'meta' => null,
                    'links' => null
                ],
                'filters' => [
                    'search' => $search,
                    'per_page' => $perPage,
                    'sort_by' => $sortBy,
                    'sort_direction' => $sortDirection,
                ],
                'error' => __('common.error')
            ]);
        }
    }
    /**
     * Store a newly created supplier
     */
    public function store(SupplierRequest $request): RedirectResponse
    {
        try {
            $dto = SupplierDto::fromRequest($request);
            $this->supplierService->create($dto);

            return redirect()->route('suppliers.index')
                ->with('success', 'Supplier created successfully');
        } catch (Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create supplier: ' ]);
        }
    }

    /**
     * Update the specified supplier by UUID
     */
    public function update(SupplierRequest $request, string $uuid): RedirectResponse
    {
        try {
            $dto = SupplierDto::fromRequest($request);
            $supplier = $this->supplierService->updateByUuid($uuid, $dto);

            if (!$supplier) {
                return redirect()->back()
                    ->withErrors(['error' => 'Supplier not found']);
            }

            return redirect()->route('suppliers.index')
                ->with('success', 'Supplier updated successfully');
        } catch (Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update supplier']);
        }
    }

    /**
     * Remove the specified supplier by ID
     */
    public function destroy(string $id): RedirectResponse
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
                ->withErrors(['error' => 'Failed to delete supplier']);
        }
    }

    /**
     * API: Get all suppliers with pagination
     */
    public function apiIndex(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');

        try {
            if ($search) {
                $suppliers = $this->supplierService->searchByName($search, $perPage);
            } else {
                $suppliers = $this->supplierService->getAll($perPage);
            }

            return response()->json([
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
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to retrieve suppliers'
            ], 500);
        }
    }

    /**
     * API: Search suppliers by name
     */
    public function searchByName(Request $request, string $name)
    {
        $perPage = $request->get('per_page', 15);

        try {
            $suppliers = $this->supplierService->searchByName($name, $perPage);

            return response()->json([
                'data' => $suppliers->items(),
                'meta' => [
                    'current_page' => $suppliers->currentPage(),
                    'from' => $suppliers->firstItem(),
                    'last_page' => $suppliers->lastPage(),
                    'per_page' => $suppliers->perPage(),
                    'to' => $suppliers->lastItem(),
                    'total' => $suppliers->total(),
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to search suppliers'
            ], 500);
        }
    }

      /**
     * Export category products to CSV
     */
    public function export(): StreamedResponse|RedirectResponse
    {
        try {
            $suppliers = Supplier::get();
            
            $records = $suppliers->map(function ($supplier) {
                return [
                    'Name' => $supplier->name,
                    'Address' => $supplier->address,
                    'Email' => $supplier->email,
                    'Phone' => $supplier->phone,
                ];
            })->toArray();

            dd($records);
            $csvService = new CsvService();
            return $csvService->export(
                [
                    'Name', 
            'Address', 
            'Email', 
            'Phone', 
                
                ],
                array_values($records), 
                'suppliers.csv'
            );
        } catch (Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => __('common.export_error')]);
        }
    }

    /**
     * Import category products from CSV
     */
    public function import(ImportSuppliersRequest $request): RedirectResponse
    {
        try {
            $file = $request->file('file');
            $csvService = new CsvService();

            // Validate CSV headers
            if (!$csvService->validateHeaders($file, ImportSuppliersRequest::getRequiredHeaders())) {
                $actualHeaders = $csvService->getHeaders($file);
                $message = 'Invalid CSV headers. Required: ' . implode(', ', ImportSuppliersRequest::getRequiredHeaders()) . 
                          '. Found: ' . implode(', ', $actualHeaders);
                throw new Exception($message);
            }

            // Import CSV data
            $records = $csvService->import($file, ImportSuppliersRequest::getHeaderMapping());
                // dd($records);
            $validator = app()->make(Factory::class);
            $rowNumber = 1;
            $successCount = 0;
            $errors = [];

            foreach ($records as $record) {
                $rowNumber++;
                
                // Prepare data for validation
                $data = [
                    'name' => $record['Name'],
                    'address' => $record['Address'],
                    'email' => $record['Email'],
                    'phone' => $record['Phone'],
                ];

                // Get validation rules from ImportSuppliersRequest
                $rules = ImportSuppliersRequest::getRowValidationRules();

                $validation = $validator->make($data, $rules);

                if ($validation->fails()) {
                    $rowErrors = $validation->errors()->all();
                    $errors[] = "Row {$rowNumber}: " . implode(', ', $rowErrors);
                    continue;
                }

                try {
                    $dto = new SupplierDto();
                    $dto->name = $data['name'];
                    $dto->address = $data['address'];
                    $dto->email = $data['email'];
                    $dto->phone = $data['phone'];
                    $this->supplierService->create($dto);
                    $successCount++;
                } catch (Exception $e) {
                    $errors[] = "Row {$rowNumber}: Failed to create category - " . $e->getMessage();
                }
            }

            // If there were any errors, throw an exception with details
            if (!empty($errors)) {
                $errorMessage = "Import completed with errors:\n" . implode("\n", $errors);
                if ($successCount > 0) {
                    $errorMessage .= "\n{$successCount} categories were imported successfully.";
                }
                throw new Exception($errorMessage);
            }

            return redirect()->back()
                ->with('success', __('common.import_success'));
        } catch (Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => __('common.import_error') . ': ' . $e->getMessage()]);
        }
    }
}
