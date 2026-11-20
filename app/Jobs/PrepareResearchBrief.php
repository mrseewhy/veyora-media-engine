<?php

namespace App\Jobs;

use App\Models\ProductionRun;
use App\Models\Topic;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Throwable;

class PrepareResearchBrief implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $timeout = 45;

    public function __construct(public readonly int $topicId)
    {
    }

    public function handle(): void
    {
        DB::transaction(function (): void {
            $topic = Topic::query()->lockForUpdate()->findOrFail($this->topicId);

            if ($topic->status === 'needs_research') {
                return;
            }

            if ($topic->status !== 'queued') {
                return;
            }

            // This is a genuine intake brief, NOT sourced research or AI generation.
            ProductionRun::updateOrCreate(
                ['topic_id' => $topic->id, 'stage' => 'intake'],
                [
                    'status' => 'completed',
                    'payload' => [
                        'search_query' => $topic->title,
                        'source_hint' => $topic->reference_url,
                        'needs_source_verification' => true,
                        'is_researched' => false,
                    ],
                ]
            );

            $topic->update(['status' => 'needs_research']);
        });
    }

    public function failed(?Throwable $exception): void
    {
        ProductionRun::updateOrCreate(
            ['topic_id' => $this->topicId, 'stage' => 'intake'],
            ['status' => 'failed', 'error' => $exception?->getMessage()]
        );
        Topic::query()->whereKey($this->topicId)->update(['status' => 'failed']);
    }
}
