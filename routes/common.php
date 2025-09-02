<?php


use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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
