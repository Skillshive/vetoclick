<?php

namespace Database\Seeders;

use App\Models\Holiday;
use App\Models\Veterinary;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class MoroccoHolidaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $veterinarians = Veterinary::all();

        if ($veterinarians->isEmpty()) {
            $this->command->warn('No veterinarians found. Please seed veterinarians first.');
            return;
        }

        $currentYear = Carbon::now()->year;
        
        // Moroccan holidays with French names
        // Fixed holidays (same date every year)
        $fixedHolidays = [
            [
                'start_date' => $currentYear . '-01-01',
                'end_date' => $currentYear . '-01-01',
                'reason' => 'Nouvel An',
            ],
            [
                'start_date' => $currentYear . '-01-11',
                'end_date' => $currentYear . '-01-11',
                'reason' => 'Manifeste de l\'Indépendance',
            ],
            [
                'start_date' => $currentYear . '-01-14',
                'end_date' => $currentYear . '-01-14',
                'reason' => 'Nouvel An amazigh',
            ],
            [
                'start_date' => $currentYear . '-05-01',
                'end_date' => $currentYear . '-05-01',
                'reason' => 'Fête du Travail',
            ],
            [
                'start_date' => $currentYear . '-07-30',
                'end_date' => $currentYear . '-07-30',
                'reason' => 'Fête du Trône',
            ],
            [
                'start_date' => $currentYear . '-08-14',
                'end_date' => $currentYear . '-08-14',
                'reason' => 'Récupération de Oued Eddahab',
            ],
            [
                'start_date' => $currentYear . '-08-20',
                'end_date' => $currentYear . '-08-20',
                'reason' => 'Révolution du Roi et du Peuple',
            ],
            [
                'start_date' => $currentYear . '-08-21',
                'end_date' => $currentYear . '-08-21',
                'reason' => 'Fête de la Jeunesse',
            ],
            [
                'start_date' => $currentYear . '-11-06',
                'end_date' => $currentYear . '-11-06',
                'reason' => 'Marche Verte',
            ],
            [
                'start_date' => $currentYear . '-11-18',
                'end_date' => $currentYear . '-11-18',
                'reason' => 'Fête de l\'Indépendance',
            ],
        ];

        // Variable holidays (Islamic calendar - using 2025 dates as example)
        // Note: These dates change each year based on the lunar calendar
        $variableHolidays = [
            // Aïd al-Fitr (2 days) - approximate dates for 2025
            [
                'start_date' => $currentYear . '-03-31',
                'end_date' => $currentYear . '-04-01',
                'reason' => 'Aïd al-Fitr',
            ],
            // Aïd al-Adha (2 days) - approximate dates for 2025
            [
                'start_date' => $currentYear . '-06-07',
                'end_date' => $currentYear . '-06-08',
                'reason' => 'Aïd al-Adha',
            ],
            // 1er Moharram (Islamic New Year) - approximate date for 2025
            [
                'start_date' => $currentYear . '-06-27',
                'end_date' => $currentYear . '-06-27',
                'reason' => '1er Moharram (Nouvel An islamique)',
            ],
            // Aïd al-Mawlid (Prophet's Birthday) - approximate date for 2025
            [
                'start_date' => $currentYear . '-09-05',
                'end_date' => $currentYear . '-09-05',
                'reason' => 'Aïd al-Mawlid (Naissance du Prophète)',
            ],
        ];

        $allHolidays = array_merge($fixedHolidays, $variableHolidays);

        $this->command->info('Seeding Moroccan holidays for ' . $veterinarians->count() . ' veterinarian(s)...');

        $totalCreated = 0;

        foreach ($veterinarians as $veterinarian) {
            foreach ($allHolidays as $holidayData) {
                // Check if holiday already exists for this veterinarian
                $exists = Holiday::where('veterinarian_id', $veterinarian->id)
                    ->where('start_date', $holidayData['start_date'])
                    ->where('end_date', $holidayData['end_date'])
                    ->exists();

                if (!$exists) {
                    Holiday::create([
                        'veterinarian_id' => $veterinarian->id,
                        'start_date' => $holidayData['start_date'],
                        'end_date' => $holidayData['end_date'],
                        'reason' => $holidayData['reason'],
                    ]);
                    $totalCreated++;
                }
            }
        }

        $this->command->info("Successfully created {$totalCreated} Moroccan holiday entries!");
        $this->command->warn('Note: Variable holidays (Islamic calendar) need to be updated each year based on the lunar calendar.');
    }
}

