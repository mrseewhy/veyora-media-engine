<?php

namespace App\Http\Controllers;

use App\Models\ProductionRun;
use App\Models\Topic;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController
{
    public function __invoke(): Response
    {
        return Inertia::render('Dashboard', [
            'stats' => [
                'topics' => Topic::count(),
                'awaitingResearch' => Topic::where('status', 'needs_research')->count(),
                'queued' => Topic::where('status', 'queued')->count(),
                'failedRuns' => ProductionRun::where('status', 'failed')->count(),
            ],
            'recentTopics' => Topic::query()
                ->latest()
                ->limit(6)
                ->get(['id', 'title', 'status', 'created_at']),
        ]);
    }
}
