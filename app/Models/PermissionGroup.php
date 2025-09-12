<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class PermissionGroup extends Model
{
    use HasUuid;

    protected $table = 'permission_groups';
    protected $fillable = ['name', 'uuid'];

    public function permissions()
    {
        return $this->hasMany(Permission::class, 'grp_id');
    }
}
