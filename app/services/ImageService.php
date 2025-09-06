<?php

namespace App\Services;

use App\Interfaces\ServiceInterface;
use App\Models\Image;
use App\Uploads\ImageStorage;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class ImageService  implements ServiceInterface
{

    /***
     * Supported image extension
     * @var array|string[]
     */
    protected static array $supportedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    private const DEFAULT_IMAGE_PLACEHOLDER = 'assets/images/default/image-placeholder.jpg';
    public const DEFAULT_PERSON = 1;
    public const DEFAULT_IMAGE = 0;
    private const DEFAULT_PERSON_PLACEHOLDER = 'assets/images/default/person-placeholder.jpg';


    public function __construct(private ImageStorage $storage)
    {
    }


    public function getDisk()
    {
        return $this->storage->getDisk();
    }

  


  public function getFullPath(Image $image)
    {
        return $this->storage->getDisk()->path($image->getPath());
    }


    /***
     * Check if the given image extension is supported
     * @param string $extension
     * @return bool
     */
    public
    static function isExtensionSupported(string $extension): bool
    {
        return in_array($extension, static::$supportedExtensions);
    }

    /***
     * Get Supported extensions
     * @param string $extension
     * @return array|string[]
     */
    public
    static function getExtensionSupported(string $extension): array
    {
        return self::$supportedExtensions;
    }

    /***
     * Clean up an image file name
     * @param string $name
     * @return string
     */
    public
    function cleanImageFileName(string $name = '')
    {
        //        $name = str_replace(' ', '-', $name);
        $nameParts = $this->separateFileNameAndExtension($name);
        $extension = array_pop($nameParts);
        //        $name = implode('-', $nameParts);
        $name = time();

        return $name . '.' . $extension;
    }


    /***
     * Get file name and extension as array
     * @param $fileName
     * @return array
     */
    public
    function separateFileNameAndExtension($fileName): array
    {
        return explode('.', $fileName);
    }


    /***
     * Save Image and associate it to a model
     * @param Model $model
     * @param UploadedFile $uploadedFile
     * @param string $column
     * @return void
     * @throws Exception
  
    public function save(Model $model, UploadedFile $uploadedFile, $column = "image_id")
    {
        try {
            $image = $this->saveImage($uploadedFile);
            
            // Directly set the attribute and save to ensure the relationship is properly updated
            $model->{$column} = $image->id;
            $model->save();
            
            // Log the update for debugging
            Log::info('Image association updated', [
                'model_type' => get_class($model),
                'model_id' => $model->id,
                'column' => $column,
                'image_id' => $image->id
            ]);
        } catch (\Exception $e) {
            Log::error('Error saving image: ' . $e->getMessage());
            throw $e;
        }
    }
   */
    /**
     * Save an image to storage and create a database record
     * @param UploadedFile $uploadedFile
     * @param string $folder
     * @return Image
     * @throws Exception
     */
    public function saveImage(UploadedFile $uploadedFile, $folder = 'uploads/')
    {
        $disk = $this->storage->getDisk();
        
        // Ensure folder has trailing slash
        if (!empty($folder) && !str_ends_with($folder, '/')) {
            $folder .= '/';
        }
        
        $imageName = $uploadedFile->getClientOriginalName();
        $imageData = file_get_contents($uploadedFile->getRealPath());
        $fileName = $this->cleanImageFileName($imageName);
        $fullPath = $folder . $fileName;

        try {
            $disk->put($fullPath, $imageData, true);
        } catch (Exception $e) {
            Log::error('Error when attempting image upload: ' . $e->getMessage());
            throw new Exception($e->getMessage());
        }
        
        return Image::query()->create([
            'name' => $imageName,
            'path' => $fullPath
        ]);
    }

    /**
     * Update image for a model
     * 
     * @param mixed $model
     * @param UploadedFile $file
     * @return mixed
     */

    /**
     * Delete file from storage without deleting database record
     * 
     * @param Image $image
     * @return bool
     */
   

 

    public
    function delete(Image $image)
    {
        $disk = $this->storage->getDisk();
        if ($disk->exists($image->path)) {
            $disk->delete($image->path);
        }
        $image->delete();
    }
}