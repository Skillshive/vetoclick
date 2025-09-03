<?php

namespace App\common;

use App\Interfaces\DtoInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

abstract class DTO implements DtoInterface
{
    public static function fromJson($data)
    {
        if (is_string($data)) {
            $data = json_decode($data, true);
        }

        return static::fromArray($data);
    }

    public static function fromRequest(Request $request)
    {
        return static::fromArray($request->input());
    }

    public static function fromModel(Model $model)
    {
        return static::fromArray($model->toArray());
    }

    abstract protected static function fromArray(array $data);
}