<?php

namespace App\Models;

use App\Traits\HasUuid;
use Spatie\Permission\Models\Permission as SpatiePermission;

class Permission extends SpatiePermission
{
    use HasUuid;

    protected $fillable = ['name', 'guard_name', 'uuid',"grp_id"];
    
    public function group(){
        return $this->belongsTo(PermissionGroup::class, 'grp_id');
    }
}
