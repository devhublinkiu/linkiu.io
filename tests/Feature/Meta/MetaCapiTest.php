<?php

namespace Tests\Feature\Meta;

use App\Jobs\EnviarEventoMetaJob;
use App\Models\Integracion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MetaCapiTest extends TestCase
{
    use RefreshDatabase;

    public function test_dispatch_sin_config_responde_204(): void
    {
        $payload = $this->payloadValido();

        $res = $this->postJson('/api/meta/event', $payload);

        $res->assertStatus(204);
    }

    public function test_dispatch_con_config_despacha_job(): void
    {
        Bus::fake();
        Integracion::set('fb_pixel_id', '1234567890');
        Integracion::set('fb_access_token', 'EAATest123');

        $res = $this->postJson('/api/meta/event', $this->payloadValido());

        $res->assertOk()->assertJson(['sent' => true]);
        Bus::assertDispatched(EnviarEventoMetaJob::class);
    }

    public function test_dispatch_rechaza_evento_no_permitido(): void
    {
        Integracion::set('fb_pixel_id', '1234567890');
        Integracion::set('fb_access_token', 'EAATest123');

        $payload = $this->payloadValido();
        $payload['event_name'] = 'EventoInventado';

        $res = $this->postJson('/api/meta/event', $payload);

        $res->assertStatus(422);
    }

    public function test_dispatch_rechaza_event_id_malformado(): void
    {
        Integracion::set('fb_pixel_id', '1234567890');
        Integracion::set('fb_access_token', 'EAATest123');

        $payload = $this->payloadValido();
        $payload['event_id'] = 'no-uuid<script>';

        $res = $this->postJson('/api/meta/event', $payload);

        $res->assertStatus(422);
    }

    public function test_probar_conexion_requiere_permiso(): void
    {
        $res = $this->postJson('/api/meta/probar-conexion');
        $res->assertStatus(401);
    }

    public function test_probar_conexion_falla_sin_config(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('integraciones.editar');

        $res = $this->actingAs($user)->postJson('/api/meta/probar-conexion');

        $res->assertStatus(422)->assertJsonFragment(['ok' => false]);
    }

    public function test_probar_conexion_dispara_request_a_meta(): void
    {
        Integracion::set('fb_pixel_id', '1234567890');
        Integracion::set('fb_access_token', 'EAATest123');

        Http::fake([
            'graph.facebook.com/*' => Http::response(['events_received' => 1], 200),
        ]);

        $user = User::factory()->create();
        $user->givePermissionTo('integraciones.editar');

        $res = $this->actingAs($user)->postJson('/api/meta/probar-conexion');

        $res->assertOk()->assertJson(['ok' => true]);
        $this->assertStringStartsWith('TEST_', $res->json('test_code'));
        Http::assertSent(fn ($req) => str_contains($req->url(), '/1234567890/events'));
    }

    private function payloadValido(): array
    {
        return [
            'event_name'       => 'Purchase',
            'event_id'         => '12345678-1234-1234-1234-123456789abc',
            'event_source_url' => 'https://shop.example.com/orden/abc/gracias',
            'custom_data'      => ['value' => 100, 'currency' => 'COP'],
            'user_data'        => ['email' => 'test@example.com'],
        ];
    }
}
