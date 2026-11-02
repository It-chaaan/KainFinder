<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthTest extends TestCase
{
    public function test_health_endpoint_returns_success_json(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertExactJson(['success' => true]);
    }

    public function test_local_frontend_origin_is_allowed(): void
    {
        $this->withHeaders([
            'Origin' => 'http://localhost:5173',
            'Access-Control-Request-Method' => 'GET',
        ])->options('/api/health')
            ->assertStatus(204)
            ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    }
}
