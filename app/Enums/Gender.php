<?php

namespace App\Enums;

enum Gender: int
{
    case MAN =0;
    case WOMAN = 1;

    public  function text()
    {
        return match ($this) {
            self::MAN => 'male',
            self::WOMAN => 'female',
        };
    }
    
    public static function toArray(){
        return [
          self::MAN->value => self::MAN->text(),
          self::WOMAN->value => self::WOMAN->text(),
        ];
    }

}
