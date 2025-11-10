<?php

namespace App\Http\Controllers;

use App\Services\ClientService;
use Illuminate\Http\JsonResponse;
use Exception;

class ClientController extends Controller
{
    protected ClientService $clientService;

    public function __construct(ClientService $clientService)
    {
        $this->clientService = $clientService;
    }

    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function getAll(): JsonResponse
    {
        try {
            $clients = $this->clientService->getAllClients();
            return response()->json($clients);
        } catch (Exception $e) {
            return response()->json(['error' => 'Error retrieving clients: ' . $e->getMessage()], 500);
        }
    }
}
