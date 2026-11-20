<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('production_runs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('topic_id')->constrained()->cascadeOnDelete();
            $table->string('stage', 40);
            $table->string('status', 32)->index();
            $table->json('payload')->nullable();
            $table->text('error')->nullable();
            $table->timestamps();
            $table->unique(['topic_id', 'stage']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('production_runs');
    }
};
