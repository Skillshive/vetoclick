<?php

namespace App\Services;

use App\Models\Client;
use App\common\ClientDTO;
use App\Interfaces\ServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

class ClientService implements ServiceInterface
{
    /**
     * Get all clients as a collection
     */
    public function getAllClients(): Collection
    {
        $query = Client::with('user');
        $user = Auth::user();

        if ($user) {
            if (!$user->relationLoaded('veterinary')) {
                $user->load('veterinary');
            }
            
            $isVeterinarian = $user->hasRole('veterinarian') || $user->veterinary;
            
            if ($isVeterinarian && $user->veterinary) {
                $veterinarianId = $user->veterinary->id;
                
               $query->where(function($q) use ($veterinarianId) {
                    $q->where('veterinarian_id', $veterinarianId)
                      ->orWhereHas('pets', function($petQuery) use ($veterinarianId) {
                          $petQuery->whereHas('consultations', function($consultationQuery) use ($veterinarianId) {
                              $consultationQuery->where('veterinarian_id', $veterinarianId);
                          });
                      })
                      ->orWhereHas('appointments', function($appointmentQuery) use ($veterinarianId) {
                          $appointmentQuery->whereHas('consultation', function($consultationQuery) use ($veterinarianId) {
                              $consultationQuery->where('veterinarian_id', $veterinarianId);
                          });
                      })
                      ->orWhereIn('id', function($subquery) use ($veterinarianId) {
                          $subquery->select('client_id')
                                   ->from('consultations')
                                   ->where('veterinarian_id', $veterinarianId)
                                   ->whereNotNull('client_id');
                      });
                });
            }
        }

        return $query->get();
    }

    /**
     * Get all clients with optional pagination
     */
    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return Client::with(['user', 'pets'])->paginate($perPage);
    }

    /**
     * Get client by ID
     */
    public function getById(int $id): ?Client
    {
        return Client::with(['user', 'pets'])->find($id);
    }

    /**
     * Get client by UUID
     */
    public function getByUuid(string $uuid): ?Client
    {
        return Client::with(['user', 'pets'])->where('uuid', $uuid)->first();
    }

    /**
     * Create new client from DTO
     */
    public function create(ClientDTO $dto): Client
    {
        try {
            $client = Client::create($dto->toCreateArray());
            return $client->load(['user', 'pets']);
        } catch (Exception $e) {
            throw new Exception("Failed to create client: " . $e->getMessage());
        }
    }

    /**
     * Update client by UUID from DTO
     */
    public function update(string $uuid, ClientDTO $dto): ?Client
    {
        try {
            $client = $this->getByUuid($uuid);

            if (!$client) {
                return null;
            }

            $updateData = $dto->toUpdateArray();

            if (empty($updateData)) {
                return $client;
            }

            $client->update($updateData);
            return $client->fresh(['user', 'pets']);
        } catch (Exception $e) {
            throw new Exception("Failed to update client: " . $e->getMessage());
        }
    }

    /**
     * Delete client by UUID
     */
    public function delete(string $uuid): bool
    {
        try {
            $client = $this->getByUuid($uuid);

            if (!$client) {
                return false;
            }

            return $client->delete();
        } catch (Exception $e) {
            throw new Exception("Failed to delete client: " . $e->getMessage());
        }
    }

    /**
     * Search clients by user name or email
     */
    public function searchByUser(string $search, int $perPage = 15): LengthAwarePaginator
    {
        return Client::with(['user', 'pets'])
            ->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            })
            ->paginate($perPage);
    }

    /**
     * Get clients by city
     */
    public function getByCity(string $city, int $perPage = 15): LengthAwarePaginator
    {
        return Client::with(['user', 'pets'])
            ->where('city', 'LIKE', "%{$city}%")
            ->paginate($perPage);
    }
}
