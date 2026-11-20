<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Topic extends Model
{
    protected $fillable = ['brand_id', 'title', 'description', 'reference_url', 'status'];

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function productionRuns(): HasMany
    {
        return $this->hasMany(ProductionRun::class);
    }
}
