<?php


use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::post('uploads/images/upload', function (Request $request) {
    $image = app(ImageService::class)->saveImage($request->file('upload'), 'files/');
    $fullPath = stream_image_from_uploads($image->getPath());
    return response()->json([
        'filename' => basename($fullPath),
        'uploaded' => 1,
        'url' => $fullPath,
    ]);
})->name('uploads.images');

Route::get('download/{path?}', function ($path) {
    $filePath = storage_path('app/export/' . $path);

    if (!file_exists($filePath)) {
        abort(404, 'File not found: ' . $path);
    }

    return response()->download($filePath);
})
->where('path', '.*')
->name('download.files');

Route::get('storage/uploads/images/{path?}', function (Request $request, ImageService $imageService, $path = 'path') {
    return $imageService->streamImageFromStorage($path, $request->get('default'));
})
    ->where('path', '.*')
    ->name('stream.image_from_upload');

// Serve blog images through Laravel (avoids 403 when public/storage symlink is not followed by PHP built-in server)
Route::get('storage/blogs/{path}', function (string $path) {
    $fullPath = 'blogs/' . $path;
    if (!Storage::disk('public')->exists($fullPath)) {
        abort(404);
    }
    $file = Storage::disk('public')->get($fullPath);
    $mime = Storage::disk('public')->mimeType($fullPath) ?: 'image/png';

    return response($file, 200, [
        'Content-Type' => $mime,
        'Cache-Control' => 'public, max-age=31536000',
    ]);
})->where('path', '.*')->name('storage.blogs');
