<?php

namespace App\Http\Controllers;

use App\Jobs\PrepareResearchBrief;
use App\Models\Brand;
use App\Models\Topic;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TopicController
{
    public function index(): Response
    {
        return Inertia::render('Research/Index', [
            'brands' => Brand::query()->orderBy('name')->get(['id', 'name']),
            'topics' => Topic::query()
                ->with('brand:id,name')
                ->latest()
                ->limit(100)
                ->get(['id', 'brand_id', 'title', 'description', 'reference_url', 'status', 'created_at']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'brand_id' => ['required', 'integer', Rule::exists('brands', 'id')],
            'title' => ['required', 'string', 'min:5', 'max:180'],
            'description' => ['nullable', 'string', 'max:2000'],
            'reference_url' => ['nullable', 'url:http,https', 'max:2048'],
        ]);

        Topic::create([...$data, 'status' => 'draft']);

        return redirect()->route('topics.index')->with('success', 'Topic saved.');
    }

    public function intake(Topic $topic): RedirectResponse
    {
        DB::transaction(function () use ($topic): void {
            $locked = Topic::query()->lockForUpdate()->findOrFail($topic->id);

            abort_unless($locked->status === 'draft', 409, 'Only draft topics can be queued for intake.');

            $locked->update(['status' => 'queued']);
            PrepareResearchBrief::dispatch($locked->id)->afterCommit();
        });

        return redirect()->route('topics.index')->with('success', 'Research brief intake queued.');
    }
}
