<?php

namespace App\DTO;

class DTO
{
    /***
     * @return array
     */
    public function toArray(): array
    {
        return array_filter(get_object_vars($this));
    }

}
