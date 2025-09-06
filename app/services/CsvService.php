<?php

namespace App\Services;

use League\Csv\Writer;
use League\Csv\Reader;
use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CsvService
{
    /**
     * Export data to CSV
     *
     * @param array $headers
     * @param array $records
     * @param string $filename
     * @return StreamedResponse
     */
    public function export(array $headers, array $records, string $filename): StreamedResponse
    {
        return response()->streamDownload(function () use ($headers, $records) {
            $csv = Writer::createFromString('');
            
            $csv->setDelimiter(',');
            $csv->setEnclosure('"'); 
            $csv->setOutputBOM(Writer::BOM_UTF8);
            
            $csv->insertOne($headers);
            $csv->insertAll($records);
            echo $csv->toString();
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Import data from CSV
     *
     * @param UploadedFile $file
     * @param array $headerMap Key-value pairs mapping CSV headers to database columns
     * @return array
     */
    public function import(UploadedFile $file, array $headerMap = []): array
    {
        $csv = Reader::createFromPath($file->getPathname());
        $csv->setHeaderOffset(0);
        
        $csv->setDelimiter(',');
        $csv->setEnclosure('"');
        $csv->setEscape('\\');
        
        $headers = array_map(function($header) {
            $header = str_replace("\xEF\xBB\xBF", '', $header);
            $header = trim($header);
            $header = trim($header, '"\'');
            return $header;
        }, $csv->getHeader());
        
        $headerIndexMap = array_change_key_case(array_flip($headers), CASE_LOWER);
        $headerMap = array_change_key_case($headerMap, CASE_LOWER);
        
        $records = $csv->getRecords();
        $data = [];
        
        foreach ($records as $record) {
            $mappedRecord = [];
            foreach ($headerMap as $csvHeader => $dbColumn) {
                $headerIndex = $headerIndexMap[strtolower($csvHeader)] ?? null;
                $actualHeader = $headerIndex !== null ? $headers[$headerIndex] : null;
                
                $value = $actualHeader !== null ? ($record[$actualHeader] ?? null) : null;
                if ($value !== null) {
                    $value = trim($value);
                    $value = trim($value, '"\'');
                }
                $mappedRecord[$dbColumn] = $value;
            }
            $data[] = $mappedRecord;
        }
        
        return $data;
    }

    /**
     * Validate CSV headers
     *
     * @param UploadedFile $file
     * @param array $requiredHeaders
     * @return bool
     */
    public function validateHeaders(UploadedFile $file, array $requiredHeaders): bool
    {
        try {
            $csv = Reader::createFromPath($file->getPathname());
            $csv->setHeaderOffset(0);
            
            $headers = $csv->getHeader();
            $headers = array_map(function($header) {
                $header = str_replace("\xEF\xBB\xBF", '', $header);
                $header = trim($header, '"\'');
                $header = trim($header);
                return $header;
            }, $headers);
            
            if (count($headers) === 1) {
                $headers = array_map('trim', explode(',', $headers[0]));
                $headers = array_map(function($header) {
                    return trim($header, '"\'');
                }, $headers);
            }
            
            $headers = array_map('strtolower', $headers);
            $requiredHeaders = array_map('strtolower', $requiredHeaders);
            
            $missingHeaders = array_diff($requiredHeaders, $headers);
            
            return empty($missingHeaders);
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get the actual headers from a CSV file
     * 
     * @param UploadedFile $file
     * @return array
     */
    public function getHeaders(UploadedFile $file): array
    {
        try {
            $csv = Reader::createFromPath($file->getPathname());
            $csv->setHeaderOffset(0);
            return array_map('trim', $csv->getHeader());
        } catch (\Exception $e) {
            return [];
        }
    }
}
