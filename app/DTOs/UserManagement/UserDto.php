<?php

namespace App\DTOs\UserManagement;

use App\common\DTO;
use App\Interfaces\DTOInterface;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;

class UserDto extends DTO implements DTOInterface
{
    public function __construct(
        public string $firstname = '',
        public string $lastname = '',
        public string $phone = '',
        public string $password = '',
        public string $email = '',
        public ?UploadedFile $image_file = null,
        public ?string $role = null,
    ) {
    }

    public static function fromRequest(Request $request): self
    {
        return new self(
            firstname: $request->input('firstname', ''),
            lastname: $request->input('lastname', ''),
            phone: $request->input('phone', ''),
            password: $request->input('password', ''),
            email: $request->input('email', ''),
            image_file: $request->file('image'), // This will return null if no file is uploaded
            role: $request->input('role'),
        );
    }
}
