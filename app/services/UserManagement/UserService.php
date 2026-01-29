<?php

namespace App\Services\UserManagement;

use App\DTOs\UserManagement\UserDto;
use App\Interfaces\ServiceInterface;
use App\Models\User;
use App\Models\Receptionist;
use App\Models\Veterinary;
use App\Services\ImageService;
use Illuminate\Pagination\LengthAwarePaginator;
use Exception;
use Illuminate\Support\Facades\Auth;

class UserService implements ServiceInterface
{
    protected ImageService $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    public function query()
    {
        return User::query();
    }
    /**
     * Get all users with optional pagination
     */
    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
return User::where('id', '!=', Auth::id())
    ->with('image')
    ->orderBy('created_at', 'desc')
    ->paginate($perPage);
    }

    /**
     * Get user by ID
     */
    public function getById(int $id): ?User
    {
        return User::with(['image'])->find($id);
    }

    /**
     * Get user by UUID
     */
    public function getByUuid(string $uuid): ?User
    {
        return User::with(['image'])
                 ->where('uuid', $uuid)
                 ->first();
    }

    /**
     * Create new user from DTO
     */
    public function create(UserDto $dto): User
    {
        try {
            if ($dto->image_file) {
                $image = $this->imageService->saveImage($dto->image_file, 'users/');
                $image_id = $image->id;
            } else {
                $image_id = null;
            }

            // Generate password if not provided
            $password = $dto->password ?: $dto->lastname . "@" . date("Y");
            
            $user = User::create(
                [
                    'firstname' => $dto->firstname,
                    'lastname' => $dto->lastname,
                    'phone' => $dto->phone,
                    'password' => bcrypt($password), // Hash the password
                    'email' => $dto->email,
                    'image_id' => $image_id,
                ]
            );

            // Assign role if provided
            if ($dto->role) {
                $role = \Spatie\Permission\Models\Role::where('uuid', $dto->role)->first();
                if ($role) {
                    $user->assignRole($role);
                    
                    // If role is receptionist, create receptionist relationship
                    if ($role->name === 'receptionist' && $dto->veterinarian_id) {
                        $veterinary = Veterinary::where('uuid', $dto->veterinarian_id)->first();
                        if ($veterinary) {
                            Receptionist::create([
                                'user_id' => $user->id,
                                'veterinarian_id' => $veterinary->id,
                            ]);
                        }
                    }
                }
            }

            return $user->load(['image', 'roles', 'receptionist']);
        } catch (Exception $e) {
            throw new Exception("Failed to create user: " . $e->getMessage());
        }
    }

    /**
     * Update user by UUID from DTO
     */
    public function update(string $uuid, UserDto $dto): ?User
    {
        try {
            $user = $this->getByUuid($uuid);

            if (!$user) {
                return null;
            }

            if ($dto->image_file) {
                $image = $this->imageService->saveImage($dto->image_file, 'users/');
                $image_id = $image->id;
            } else {
                $image_id = null;
            }
            $user->update(
                [
                   'firstname' => $dto->firstname,
                    'lastname' => $dto->lastname,
                    'phone' => $dto->phone,
                    'email' => $dto->email,
                    'image_id' => $image_id,
                ]
            );

            // Sync role if provided
            if ($dto->role) {
                $role = \Spatie\Permission\Models\Role::where('uuid', $dto->role)->first();
                if ($role) {
                    $user->syncRoles([$role]);
                    
                    // Handle receptionist relationship
                    if ($role->name === 'receptionist' && $dto->veterinarian_id) {
                        $veterinary = Veterinary::where('uuid', $dto->veterinarian_id)->first();
                        if ($veterinary) {
                            // Update or create receptionist relationship
                            Receptionist::updateOrCreate(
                                ['user_id' => $user->id],
                                ['veterinarian_id' => $veterinary->id]
                            );
                        }
                    } else {
                        // Remove receptionist relationship if role changed from receptionist
                        $user->receptionist?->delete();
                    }
                }
            } else {
                // Remove all roles if no role is provided
                $user->syncRoles([]);
                // Also remove receptionist relationship
                $user->receptionist?->delete();
            }

            return $user->refresh()->load(['image', 'roles', 'receptionist']);
        } catch (Exception $e) {
            throw new Exception("Failed to update blog");
        }
    }

    /**
     * Delete user by UUID
     */
    public function delete(string $uuid): bool
    {
        try {
            $user = $this->getByUuid($uuid);

            if (!$user) {
                return false;
            }

            return $user->delete();
        } catch (Exception $e) {
            throw new Exception("Failed to delete blog");
        }
    }

    /**
     * Search users
     */
    public function search(string $search, int $perPage = 15): LengthAwarePaginator
    {
        return User::with(['image'])
            ->where('first_name', 'LIKE', "%{$search}%")
            ->orWhere('lastname', 'LIKE', "%{$search}%")
            ->orWhere('phone', 'LIKE', "%{$search}%")
            ->orWhere('email', 'LIKE', "%{$search}%")
            ->paginate($perPage);
    }
}
