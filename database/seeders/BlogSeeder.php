<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Blog;
use App\Models\CategoryBlog;
use App\Models\Image;

class BlogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = CategoryBlog::all();
        $images = Image::all();

        if ($categories->isEmpty()) {
            $this->command->warn('No categories found. Please seed CategoryBlog first.');
            return;
        }

        $blogData = [
            [
                'title' => 'Essential Pet Vaccinations: A Complete Guide',
                'body' => 'Learn about the importance of keeping your pets vaccinated. We\'ll cover core vaccines, non-core vaccines, vaccination schedules, and potential side effects. Regular vaccinations are crucial for preventing serious diseases and protecting your pet\'s health throughout their life.',
                'caption' => 'Understanding pet vaccinations and immunization schedules',
                'meta_title' => 'Pet Vaccinations Guide | Veterinary Health Tips',
                'meta_desc' => 'Complete guide to pet vaccinations including core vaccines, schedules, and safety. Get expert veterinary advice on keeping your pet protected.',
                'meta_keywords' => 'pet vaccinations, immunizations, veterinary care, vaccine schedule, pet health',
                'tags' => json_encode(['vaccinations', 'pet-health', 'preventive-care', 'immunization']),
            ],
            [
                'title' => 'Signs Your Dog Needs Dental Care',
                'body' => 'Dental health is often overlooked in pets. Discover the warning signs that indicate your dog needs professional dental care, including bad breath, tartar buildup, and tooth loss. Learn about prevention tips and professional cleaning procedures recommended by veterinarians.',
                'caption' => 'Recognizing dental problems in your canine companion',
                'meta_title' => 'Dog Dental Care | Signs & Prevention Tips',
                'meta_desc' => 'Identify signs of dental disease in dogs. Learn about professional cleaning, prevention, and why dental health matters for your pet.',
                'meta_keywords' => 'dog dental care, pet dentistry, bad breath, tartar, tooth cleaning',
                'tags' => json_encode(['dental-health', 'dogs', 'preventive-care', 'oral-health']),
            ],
            [
                'title' => 'Nutrition Guide for Senior Cats',
                'body' => 'Senior cats have unique nutritional needs that differ from younger felines. This comprehensive guide covers protein requirements, joint support, kidney health, and choosing the right diet for aging cats. Proper nutrition can extend your senior cat\'s quality of life.',
                'caption' => 'Optimizing diet and nutrition for aging feline friends',
                'meta_title' => 'Senior Cat Nutrition | Dietary Guidelines',
                'meta_desc' => 'Expert guide to nutrition for senior cats. Learn about dietary needs, supplements, and feeding strategies for aging cats.',
                'meta_keywords' => 'senior cat nutrition, aging cats, diet, feline health, supplements',
                'tags' => json_encode(['nutrition', 'cats', 'senior-pets', 'diet']),
            ],
            [
                'title' => 'Common Behavioral Issues in Rabbits and Solutions',
                'body' => 'Rabbits are wonderful pets but can develop behavioral problems. Learn about common issues like aggression, chewing, and excessive digging. Understand the causes and discover practical solutions to ensure a happy, well-adjusted rabbit.',
                'caption' => 'Understanding and addressing rabbit behavioral challenges',
                'meta_title' => 'Rabbit Behavior Problems | Veterinary Solutions',
                'meta_desc' => 'Solve common rabbit behavioral issues. Get expert tips on aggression, destructive chewing, litter training, and rabbit care.',
                'meta_keywords' => 'rabbit behavior, pet rabbits, behavioral problems, rabbit training, bunny care',
                'tags' => json_encode(['behavior', 'rabbits', 'pet-training', 'animal-care']),
            ],
            [
                'title' => 'Emergency First Aid for Pets: What You Need to Know',
                'body' => 'Emergencies can happen to any pet owner. This guide covers essential first aid techniques including CPR, wound care, choking response, and recognizing signs of distress. Learn when to seek immediate veterinary care and how to stabilize your pet during emergencies.',
                'caption' => 'Critical first aid knowledge every pet owner should have',
                'meta_title' => 'Pet Emergency First Aid | Veterinary Guide',
                'meta_desc' => 'Learn essential pet first aid techniques, CPR, and emergency response. Know when to seek veterinary care and how to help your pet.',
                'meta_keywords' => 'pet first aid, emergency care, CPR, pet safety, veterinary emergency',
                'tags' => json_encode(['emergency-care', 'first-aid', 'pet-safety', 'health']),
            ],
            [
                'title' => 'Understanding Pet Allergies and Treatment Options',
                'body' => 'Pet allergies affect millions of animals worldwide. Explore common allergens, symptoms of allergic reactions, diagnostic procedures, and treatment options including medications and dietary changes. Learn how to identify and manage your pet\'s allergies effectively.',
                'caption' => 'Diagnosing and managing allergies in your beloved pets',
                'meta_title' => 'Pet Allergies | Symptoms & Treatment Options',
                'meta_desc' => 'Understand pet allergies: causes, symptoms, and treatments. Get veterinary advice on managing allergic reactions in dogs and cats.',
                'meta_keywords' => 'pet allergies, allergic reactions, animal dermatology, allergy treatment, itchy pets',
                'tags' => json_encode(['allergies', 'health', 'dermatology', 'treatment']),
            ],
            [
                'title' => 'Creating a Safe and Enriching Environment for Indoor Pets',
                'body' => 'Indoor pets require proper environmental enrichment to thrive. Discover how to create stimulating spaces with toys, scratching posts, climbing structures, and hiding spots. Learn about hazardous household items and best practices for pet safety.',
                'caption' => 'Designing the perfect home environment for indoor animals',
                'meta_title' => 'Indoor Pet Environment | Enrichment & Safety Guide',
                'meta_desc' => 'Create a safe, enriching home for indoor pets. Learn about hazards, enrichment toys, and environmental design for pet wellness.',
                'meta_keywords' => 'indoor pets, pet environment, enrichment, pet safety, pet care',
                'tags' => json_encode(['housing', 'enrichment', 'pet-safety', 'indoor-pets']),
            ],
            [
                'title' => 'Weight Management in Pets: A Veterinary Perspective',
                'body' => 'Obesity is a growing concern in pets affecting their health and longevity. This article discusses causes of weight gain, health risks associated with obesity, and effective weight management strategies. Learn how diet, exercise, and behavioral changes can help your pet achieve a healthy weight.',
                'caption' => 'Achieving and maintaining optimal weight for your pet',
                'meta_title' => 'Pet Weight Management | Diet & Exercise Tips',
                'meta_desc' => 'Combat pet obesity with expert weight management strategies. Learn about diet, exercise, and veterinary approaches to pet fitness.',
                'meta_keywords' => 'pet weight loss, obesity, pet diet, exercise, pet fitness, healthy weight',
                'tags' => json_encode(['weight-management', 'nutrition', 'exercise', 'obesity']),
            ],
        ];

        foreach ($blogData as $blog) {
            Blog::create([
                'uuid' => Str::uuid(),
                'title' => $blog['title'],
                'body' => $blog['body'],
                'caption' => $blog['caption'],
                'image_id' => $images->isNotEmpty() ? $images->random()->id : null,
                'meta_title' => $blog['meta_title'],
                'meta_desc' => $blog['meta_desc'],
                'meta_keywords' => $blog['meta_keywords'],
                'category_blog_id' => $categories->random()->id,
                'tags' => $blog['tags'],
            ]);
        }

        $this->command->info('Blog posts created successfully!');
    }
}