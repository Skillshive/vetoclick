<?php

namespace App\Services\UserManagement;

use App\DTOs\UserManagement\UserDto;
use App\Interfaces\ServiceInterface;
use App\Models\User;
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
            $user = User::create(
                [
                    'firstname' => $dto->firstname,
                    'lastname' => $dto->lastname,
                    'phone' => $dto->phone,
                    'password' => $dto->firstname."@".date("Y") ,
                    'email' => $dto->email,
                    'image_id' => $image_id,
                ]
            );

            return $user->load(['image']);
        } catch (Exception $e) {
            throw new Exception("Failed to create user");
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
            return $user->refresh();
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
