<?php

namespace Tests\Feature;

use App\Jobs\PrepareResearchBrief;
use App\Models\Brand;
use App\Models\ProductionRun;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class TopicIntakeTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_research_or_submit_topics(): void
    {
        $this->get('/research')->assertRedirect('/login');
        $this->post('/research/topics', ['title' => 'Something interesting'])->assertRedirect('/login');
    }

    public function test_admin_can_create_and_queue_topic_intake(): void
    {
        Queue::fake();
        $user = User::create(['name' => 'Editor', 'email' => 'editor@example.test', 'password' => 'very-long-test-password']);
        $brand = Brand::create(['slug' => 'toolpilot-daily', 'name' => 'ToolPilot Daily']);

        $this->actingAs($user)->post('/research/topics', [
            'brand_id' => $brand->id,
            'title' => 'AI tools for meeting notes',
            'reference_url' => 'https://example.org/tools',
        ])->assertRedirect('/research');

        $topic = Topic::firstOrFail();
        $this->assertSame('draft', $topic->status);

        $this->actingAs($user)->post('/research/topics/'.$topic->id.'/intake')
            ->assertRedirect('/research');

        $this->assertSame('queued', $topic->fresh()->status);
        Queue::assertPushed(PrepareResearchBrief::class);
    }

    public function test_intake_creates_a_brief_but_does_not_claim_research_is_complete(): void
    {
        $brand = Brand::create(['slug' => 'toolpilot-daily', 'name' => 'ToolPilot Daily']);
        $topic = Topic::create(['brand_id' => $brand->id, 'title' => 'AI tool roundup', 'status' => 'queued']);

        (new PrepareResearchBrief($topic->id))->handle();

        $this->assertSame('needs_research', $topic->fresh()->status);
        $run = ProductionRun::firstOrFail();
        $this->assertSame('completed', $run->status);
        $this->assertFalse($run->payload['is_researched']);
        $this->assertTrue($run->payload['needs_source_verification']);

        (new PrepareResearchBrief($topic->id))->handle();
        $this->assertSame(1, ProductionRun::count());
    }
}
