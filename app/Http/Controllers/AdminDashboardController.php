<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\Pet;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\Veterinary;
use App\Models\Consultation;
use App\Enums\OrderStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class AdminDashboardController extends Controller
{
    /**
     * Display the admin dashboard
     */
    public function index(): Response
    {
        // Check if user has admin role
        $user = Auth::user();
     //   if (!$user || !$user->hasRole('admin')) {
       //     abort(403, 'Unauthorized access. Admin role required.');
       // }
        // System-wide statistics
        $stats = [
            // User statistics
            'totalUsers' => User::count(),
            'newUsersThisMonth' => User::whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->count(),
            'totalVeterinarians' => Veterinary::count(),
            'activeVeterinarians' => Veterinary::whereHas('user')->count(),
            
            // Appointment statistics
            'totalAppointments' => Appointment::count(),
            'todayAppointments' => Appointment::whereDate('appointment_date', Carbon::today())->count(),
            'pendingAppointments' => Appointment::where('status', 'scheduled')->count(),
            'completedAppointments' => Appointment::where('status', 'completed')->count(),
            'thisMonthAppointments' => Appointment::whereMonth('appointment_date', Carbon::now()->month)
                ->whereYear('appointment_date', Carbon::now()->year)
                ->count(),
            
            // Client and Pet statistics
            'totalClients' => Client::count(),
            'newClientsThisMonth' => Client::whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->count(),
            'totalPets' => Pet::count(),
            'newPetsThisMonth' => Pet::whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->count(),
            
            // Product and Order statistics
            'totalProducts' => Product::count(),
            'totalOrders' => Order::count(),
            'pendingOrders' => Order::where('status', 'pending')->count(),
            'completedOrders' => Order::where('status', 'completed')->count(),
            'thisMonthOrders' => Order::whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->count(),
            
            // Consultation statistics
            'totalConsultations' => Consultation::count(),
            'todayConsultations' => Consultation::whereDate('created_at', Carbon::today())->count(),
        ];

        $financialStats = [
            'totalRevenue' => (float) Order::whereIn('status', [
                    OrderStatus::CONFIRMED->value,
                    OrderStatus::SHIPPED->value,
                    OrderStatus::RECEIVED->value,
                ])->sum('total_amount'),
            'pendingRevenue' => (float) Order::whereIn('status', [
                    OrderStatus::DRAFT->value,
                    OrderStatus::PENDING->value,
                ])->sum('total_amount'),
            'averageOrderValue' => (float) Order::avg('total_amount') ?? 0,
            'monthlyRevenue' => Order::select(
                    DB::raw('DATE_FORMAT(order_date, "%Y-%m") as month'),
                    DB::raw('SUM(total_amount) as total')
                )
                ->where('order_date', '>=', Carbon::now()->subMonths(5)->startOfMonth())
                ->groupBy('month')
                ->orderBy('month')
                ->get()
                ->map(function ($item) {
                    return [
                        'month' => $item->month,
                        'total' => (float) $item->total,
                    ];
                }),
            'revenueByStatus' => Order::select('status', DB::raw('SUM(total_amount) as total'))
                ->groupBy('status')
                ->get()
                ->map(function ($item) {
                    return [
                        'status' => OrderStatus::from((int) $item->status)->text(),
                        'total' => (float) $item->total,
                    ];
                }),
        ];

        $topSoldPacks = OrderProduct::select('product_id', DB::raw('SUM(quantity) as total_quantity'))
            ->whereYear('created_at', Carbon::now()->year)
            ->groupBy('product_id')
            ->orderByDesc('total_quantity')
            ->with('product')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->product?->name ?? 'Unknown',
                    'quantity' => (int) $item->total_quantity,
                ];
            });

        $rawYearlyRevenue = Order::select(
                DB::raw('MONTH(order_date) as month'),
                DB::raw('SUM(total_amount) as total')
            )
            ->whereYear('order_date', Carbon::now()->year)
            ->whereIn('status', [
                OrderStatus::CONFIRMED->value,
                OrderStatus::SHIPPED->value,
                OrderStatus::RECEIVED->value,
            ])
            ->groupBy('month')
            ->pluck('total', 'month')
            ->toArray();

        $yearlyRevenue = collect(range(1, 12))->map(function ($month) use ($rawYearlyRevenue) {
            return [
                'month' => $month,
                'total' => isset($rawYearlyRevenue[$month]) ? (float) $rawYearlyRevenue[$month] : 0.0,
            ];
        });

        // Get monthly revenue for the current month (for monthly view)
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;
        $monthlyRevenue = Order::select(
                DB::raw('DAY(order_date) as day'),
                DB::raw('SUM(total_amount) as total')
            )
            ->whereMonth('order_date', $currentMonth)
            ->whereYear('order_date', $currentYear)
            ->whereIn('status', [
                OrderStatus::CONFIRMED->value,
                OrderStatus::SHIPPED->value,
                OrderStatus::RECEIVED->value,
            ])
            ->groupBy('day')
            ->pluck('total', 'day')
            ->toArray();

        // Get top 3 active veterinarians (by number of appointments)
        $topVeterinarians = Veterinary::with('user')
            ->select('veterinarians.*')
            ->selectRaw('COUNT(CASE WHEN appointments.status != "cancelled" OR appointments.status IS NULL THEN 1 END) as appointments_count')
            ->leftJoin('appointments', function($join) {
                $join->on('appointments.veterinarian_id', '=', 'veterinarians.id');
            })
            ->groupBy(
                'veterinarians.id',
                'veterinarians.uuid',
                'veterinarians.license_number',
                'veterinarians.specialization',
                'veterinarians.years_experience',
                'veterinarians.clinic_name',
                'veterinarians.profile_img',
                'veterinarians.address',
                'veterinarians.city',
                'veterinarians.consultation_price',
                'veterinarians.subscription_plan_id',
                'veterinarians.subscription_status',
                'veterinarians.subscription_start_date',
                'veterinarians.subscription_end_date',
                'veterinarians.user_id',
                'veterinarians.created_at',
                'veterinarians.updated_at'
            )
            ->orderByDesc('appointments_count')
            ->limit(3)
            ->get()
            ->map(function ($vet) {
                $appointmentsCount = (int) ($vet->appointments_count ?? 0);
                $clientsCount = $vet->clients()->count();
                $petsCount = Pet::whereHas('client', function ($q) use ($vet) {
                    $q->whereHas('veterinarians', function ($q2) use ($vet) {
                        $q2->where('veterinarians.id', $vet->id);
                    });
                })->count();
                
                // Calculate progress based on appointments (max 100%)
                $maxAppointments = max($appointmentsCount, 10);
                $progress = min(100, ($appointmentsCount / $maxAppointments) * 100);
                
                return [
                    'id' => $vet->id,
                    'name' => $vet->user ? $vet->user->firstname . ' ' . $vet->user->lastname : 'Unknown',
                    'avatar' => $vet->user?->image?->url ?? null,
                    'appointments' => $appointmentsCount,
                    'clients' => $clientsCount,
                    'pets' => $petsCount,
                    'progress' => round($progress, 2),
                ];
            });

        return Inertia::render('Dashboards/Admin/index', [
            'stats' => $stats,
            'financialStats' => $financialStats,
            'topSoldPacks' => $topSoldPacks,
            'yearlyRevenue' => $yearlyRevenue,
            'monthlyRevenue' => $monthlyRevenue,
            'topVeterinarians' => $topVeterinarians,
        ]);
    }
}

