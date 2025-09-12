<?php

namespace App\Http\Controllers;

use App\DTOs\RoleDto;
use App\Http\Requests\RoleRequest;
use App\Http\Resources\RoleResource;
use App\Http\Resources\PermissionResource;
use App\Services\RoleService;
use App\Services\PermissionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Exception;

class RoleController extends Controller
{
    protected RoleService $roleService;
    protected PermissionService $permissionService;

    public function __construct(RoleService $roleService, PermissionService $permissionService)
    {
        $this->roleService = $roleService;
        $this->permissionService = $permissionService;
    }

    /**
     * Display a listing of roles
     */
    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 8);
        $search = $request->get('search');
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $page = $request->get('page', 1);

        try {
            $query = $this->roleService->query()->with(['permissions', 'permissions.group']);
            if ($search) {
                $query = $this->roleService->search($query, $search);
            }

            $roles = $query->paginate($perPage, ['*'], 'page', $page);

            // Get all permissions for role form modal
            $allPermissions = $this->permissionService->query()->get();
            $permissionGroups = $this->permissionService->getPermissionGroups();

            return Inertia::render('Roles/Index', [
                'roles' => [
                    'data' => RoleResource::collection($roles->items()),
                    'meta' => [
                        'current_page' => $roles->currentPage(),
                        'from' => $roles->firstItem(),
                        'last_page' => $roles->lastPage(),
                        'per_page' => $roles->perPage(),
                        'to' => $roles->lastItem(),
                        'total' => $roles->total(),
                    ],
                    'links' => [
                        'first' => $roles->url(1),
                        'last' => $roles->url($roles->lastPage()),
                        'prev' => $roles->previousPageUrl(),
                        'next' => $roles->nextPageUrl(),
                    ]
                ],
                'permissions' => PermissionResource::collection($allPermissions)->resolve(),
                'permissionGroups' => $permissionGroups,
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
            return Inertia::render('Roles/Index', [
                'roles' => [
                    'data' => [],
                    'meta' => null,
                    'links' => null
                ],
                'permissions' => [],
                'permissionGroups' => [],
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
     * Store a newly created role
     */
    public function store(RoleRequest $request): mixed
    {
        try {
            $dto = RoleDto::fromRequest($request);
            $this->roleService->create($dto);

            return response()->json(['success' => true, 'message' => __('common.role_created')]);
        } catch (Exception $e) {
            return response()->json(['error' => __('common.error')], 500);
        }
    }

    /**
     * Update the specified role by UUID
     */
    public function update(RoleRequest $request, string $uuid): mixed
    {
        try {
            $dto = RoleDto::fromRequest($request);
            $role = $this->roleService->update($uuid, $dto);

            if (!$role) {
                return redirect()->back()
                    ->withErrors(['error' => __('common.role_not_found')]);
            }

            return redirect()->route('roles.index')
                ->with('success', __('common.role_updated'));
        } catch (Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => __('common.error')]);
        }
    }

    /**
     * Remove the specified role by UUID
     */
    public function destroy(string $uuid): RedirectResponse
    {
        try {
            $deleted = $this->roleService->delete($uuid);

            if (!$deleted) {
                return redirect()->back()
                    ->withErrors(['error' => __('common.role_not_found')]);
            }

            return redirect()->route('roles.index')
                ->with('success', __('common.role_deleted'));
        } catch (Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => __('common.error')]);
        }
    }

    /**
     * Assign permissions to role
     */
    public function assignPermissions(Request $request, string $uuid): mixed
    {
        try {
            $permissions = $request->input('permissions', []);
            $this->roleService->assignPermissions($uuid, $permissions);

            return response()->json(['success' => true, 'message' => __('common.permissions_assigned')]);
        } catch (Exception $e) {
            return response()->json(['error' => __('common.error')], 500);
        }
    }
}
