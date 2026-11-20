<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductionRun extends Model
{
    protected $fillable = ['topic_id', 'stage', 'status', 'payload', 'error'];

    protected function casts(): array
    {
        return ['payload' => 'array'];
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }
}
