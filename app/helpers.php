<?php


use App\Models\Establishment;
use App\Services\SessionService;
use Illuminate\Support\Collection;
use App\Enums\NoData;

if (!function_exists('image')) {
    /**
     * Get image url by path
     *
     * @param $path
     *
     * @return string
     */
    function image($path)
    {
        return asset('assets/media/' . $path);
    }
}
if (!function_exists('isCleanArray')) {
    /**
     * Get image url by path
     *
     * @param $array
     *
     * @return bool|string
     */
    function isCleanArray($array): bool|string
    {
        if (isset($array)) {
            if (is_array($array)) {
                return count($array);
            }
            return $array instanceof Collection && $array->count();
        }
        return false;

    }
}

if (!function_exists('byteConvert')) {
    function byteConvert($bytes)
    {
        if ($bytes == 0)
            return "0.00 B";

        $s = array('B', 'KB', 'MB', 'GB', 'TB', 'PB');
        $e = floor(log($bytes, 1024));

        return round($bytes / pow(1024, $e), 2) . ' ' . $s[$e];
    }
}


if (!function_exists('cleanString')) {
    function cleanString($string): string
    {
        $string = str_replace(['[\', \']'], '', $string);
        $string = preg_replace('/\[.*\]/U', '', $string);
        $string = preg_replace('/&(amp;)?#?[a-z0-9]+;/i', '-', $string);
        $string = htmlentities($string, ENT_COMPAT, 'utf-8');
        $string = preg_replace('/&([a-z])(acute|uml|circ|grave|ring|cedil|slash|tilde|caron|lig|quot|rsquo);/i', '\\1', $string);
        $string = preg_replace(['/[^a-z0-9]/i', '/[-]+/'], '-', $string);
        return strtolower(trim($string, '-'));
    }
}


if (!function_exists('storage_private_path')) {
    function storage_private_path($path): string
    {
        return storage_path('app/private/' . $path);
    }
}

if (!function_exists('private_file')) {
    function private_file($path): string
    {
        return route('file.private.get', $path);
    }
}
if (!function_exists('convertDateToAdaDate')) {
    function convertDateToAdaDate($date): string
    {
        $date = \Carbon\Carbon::parse($date);
        if ($date->month > 1 && $date->month <= 8) {
            return $date->subYears()->format('Y') . '/' . $date->addYears()->format('Y');
        } else {
            return $date->format('Y') . '/' . $date->addYears()->format('Y');
        }
    }
}
if (!function_exists('getStartAdaDateFromDate')) {
    function getStartAdaDateFromDate($date)
    {
        $date = \Carbon\Carbon::parse($date);
        if ($date->month > 1 && $date->month <= 8) {
            return [$date->subYears()->year . '-01-01', $date->addYears()->toDateString()];
        } else {
            return [$date->toDateString(), $date->addYears()->year . '-09-01'];
        }

    }
}
if (!function_exists('pageJs')) {
    /***
     * @param $files
     * @return string|Array
     */
    function pageJs($files)
    {

        if (is_array($files)) {
            $paths = [];
            foreach ($files as $file) {
                $paths[] = 'resources/js/pages/' . str_replace('.', '/', $file) . '.js' ;
            }
            return $paths;
        } else {

            return 'resources/js/pages/' . str_replace('.', '/', $files). '.js';
        }

    }
}

if (!function_exists('stream_image_from_uploads')) {
    /***
     * @param $files
     * @return string|Array
     */
    function stream_image_from_uploads($path,$attr = [])
    {

        return route('stream.image_from_upload', [
            $path,
            ...$attr
        ]);
    }
}

if (!function_exists('getRelationValue')) {
    /**
     * Get value from model using dot notation for relationships
     * Returns NoData as a badge if value is empty
     *
     * @param mixed $model
     * @param string $key
     * @param bool $asHtml Whether to return badge HTML for empty values
     * @return mixed
     */
    function getRelationValue($model, $key, $asHtml = true)
    {
        // If key is empty, return NoData badge
        if (empty($key)) {
            return $asHtml ? '<span class="badge bg-secondary">' . NoData::NO_DATA->label() . '</span>' : NoData::NO_DATA->label();
        }
        
        // If the key contains a dot, it's a relation
        if (strpos($key, '.') !== false) {
            $keys = explode('.', $key);
            $value = $model;
            
            foreach ($keys as $nestedKey) {
                if (is_object($value) && isset($value->$nestedKey)) {
                    $value = $value->$nestedKey;
                } elseif (is_array($value) && isset($value[$nestedKey])) {
                    $value = $value[$nestedKey];
                } else {
                    return $asHtml ? '<span class="badge bg-secondary">' . NoData::NO_DATA->label() . '</span>' : NoData::NO_DATA->label();
                }
            }
            
            return empty($value) ? 
                ($asHtml ? '<span class="badge bg-secondary">' . NoData::NO_DATA->label() . '</span>' : NoData::NO_DATA->label()) : 
                $value;
        }
        
        // Otherwise get the direct attribute
        $value = $model->getRawOriginal($key);
        return empty($value) ? 
            ($asHtml ? '<span class="badge bg-secondary">' . NoData::NO_DATA->label() . '</span>' : NoData::NO_DATA->label()) : 
            $value;
    }
}



