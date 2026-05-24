<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IntegracionAudit extends Model
{
    protected $table = 'integraciones_audit';

    public const UPDATED_AT = null;
    public $timestamps = true;

    protected $fillable = [
        'clave',
        'was_set',
        'is_set',
        'user_id',
        'ip',
    ];

    protected $casts = [
        'was_set' => 'boolean',
        'is_set'  => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
