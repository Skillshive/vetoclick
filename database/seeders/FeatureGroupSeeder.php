<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\FeatureGroup;
use App\Models\Feature;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;

class FeatureGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding feature groups and features from JSON...');

        $jsonPath = database_path('data/features.json');

        if (!File::exists($jsonPath)) {
            $this->command->error("Features JSON file not found at: {$jsonPath}");
            return;
        }

        $featuresData = json_decode(File::get($jsonPath), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->command->error("Invalid JSON in features file: " . json_last_error_msg());
            return;
        }
        

        foreach ($featuresData as $groupData) {
            $features = $groupData['features'] ?? [];
            unset($groupData['features']);

            // Add UUID to group data
            $groupData['uuid'] = Str::uuid();

            $group = FeatureGroup::updateOrCreate(
                ['slug' => $groupData['slug']],
                $groupData
            );

            // Create features for this group
            foreach ($features as $featureData) {
                $featureData['uuid'] = Str::uuid();
                $featureData['group_id'] = $group->id;
                $featureData['sort_order'] = $featureData['sort_order'] ?? 0;

                Feature::updateOrCreate(
                    ['slug' => $featureData['slug']],
                    $featureData
                );
            }

            $this->command->info("Created group '{$group->slug}' with " . count($features) . " features");
        }

        $this->command->info('Feature groups and features seeded successfully from JSON!');
    }
}