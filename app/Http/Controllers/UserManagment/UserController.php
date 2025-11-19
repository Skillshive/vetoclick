<?php

namespace App\Http\Controllers\UserManagment;

use App\DTOs\UserManagement\UserDto;
use App\Http\Controllers\Controller;
use App\Http\Requests\UserManagment\UserRequest;
use App\Http\Resources\UserManagment\UserResource;
use App\Services\UserManagement\UserService;
use App\Services\RoleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Exception;

class UserController extends Controller
{
    protected UserService $userService;
    protected RoleService $roleService;

    public function __construct(UserService $userService, RoleService $roleService)
    {
        $this->userService = $userService;
        $this->roleService = $roleService;
    }

    /**
     * Display a listing of category blogs
     */
    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 8);
        $search = $request->get('search');
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $page = $request->get('page', 1);

        try {
            $query = $this->userService->query()
                ->where('id', '!=', auth()->id())
                ->with(['roles']);

            if ($search) {
                $query->search($search);
            }

            $users = $query->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);

            // Get all roles for the form
            $allRoles = $this->roleService->query()->get();

            return Inertia::render('Users/Index', [
                'users' => [
                    'data' => UserResource::collection($users->items()),
                    'meta' => [
                        'current_page' => $users->currentPage(),
                        'from' => $users->firstItem(),
                        'last_page' => $users->lastPage(),
                        'per_page' => $users->perPage(),
                        'to' => $users->lastItem(),
                        'total' => $users->total(),
                    ],
                    'links' => [
                        'first' => $users->url(1),
                        'last' => $users->url($users->lastPage()),
                        'prev' => $users->previousPageUrl(),
                        'next' => $users->nextPageUrl(),
                    ]
                ],
                'roles' => $allRoles->map(function ($role) {
                    return [
                        'uuid' => $role->uuid,
                        'name' => $role->name,
                        'display_name' => $role->localized_name,
                        'guard_name' => $role->guard_name,
                        'created_at' => $role->created_at,
                    ];
                }),
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
            return Inertia::render('Users/Index', [
                'users' => [
                    'data' => ['data' => []],
                    'meta' => null,
                    'links' => null
                ],
                'roles' => [],
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
     * Store a newly created category blog
     */
    public function store(UserRequest $request): mixed
    {
        try {
            $dto = UserDto::fromRequest($request);
            $this->userService->create($dto);

            return response()->json(['success' => true, 'message' => __('common.user_created')]);
        } catch (Exception $e) {
            return response()->json(['error' => __('common.error') ], 500);
        }
    }

    /**
     * Update the specified category blog by UUID
     */
    public function update(UserRequest $request, string $uuid): mixed
    {
        try {
            $dto = UserDto::fromRequest($request);
            $user = $this->userService->update($uuid, $dto);

            if (!$user) {
                return redirect()->back()
                    ->withErrors(['error' => __('common.hnot_found')]);
            }

            return redirect()->route('users.index')
                ->with('success', __('common.user_updated'));
        } catch (Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => __('common.error')]);
        }
    }

    /**
     * Remove the specified category blog by UUID
     */
    public function destroy(string $uuid): RedirectResponse
    {
        try {
            $deleted = $this->userService->delete($uuid);

            if (!$deleted) {
                return redirect()->back()
                    ->withErrors(['error' => __('common.user_not_found')]);
            }

            return redirect()->route('users.index')
                ->with('success', __('common.user_deleted'));
        } catch (Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => __('common.error') ]);
        }
    }
}
