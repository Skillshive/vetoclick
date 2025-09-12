<?php

namespace App\Models;

use App\Traits\HasUuid;
use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    use HasUuid;

    protected $fillable = ['name', 'guard_name', 'uuid'];
    
    /**
     * Override the permissions relationship to use our custom Permission model
     */
    public function permissions(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(
            \App\Models\Permission::class,
            'role_has_permissions',
            'role_id',
            'permission_id'
        );
    }
}
