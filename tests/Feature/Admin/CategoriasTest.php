<?php

namespace Tests\Feature\Admin;

use App\Actions\Categorias\DeleteCategory;
use App\Actions\Categorias\UpdateCategory;
use App\Models\Category;
use App\Models\Producto;
use App\Models\User;
use Database\Seeders\PermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Tests críticos del módulo Categorías (CF0):
 *  C1 — Flash messages sin mojibake
 *  C2 — Ciclos en jerarquía bloqueados (auto-padre, transitivos)
 *  + delete bloquea con subcategorías/productos, elimina imagen S3
 */
class CategoriasTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
        $this->seed(PermissionsSeeder::class);
    }

    // ─────────────────────────────────────────────────────────────────
    // C1 — Flash messages sin mojibake
    // ─────────────────────────────────────────────────────────────────

    public function test_store_devuelve_flash_status_con_tilde_correcta(): void
    {
        Storage::fake('s3');
        $admin = $this->crearAdmin();

        $this->actingAs($admin)
            ->post(route('admin.categorias.store'), [
                'name'   => 'Ropa',
                'slug'   => 'ropa',
                'status' => 'activo',
            ])
            ->assertSessionHas('status', 'Categoría creada correctamente.');
    }

    public function test_update_devuelve_flash_status_con_tilde_correcta(): void
    {
        Storage::fake('s3');
        $admin = $this->crearAdmin();
        $cat = Category::create(['name' => 'X', 'slug' => 'x', 'status' => 'activo']);

        $this->actingAs($admin)
            ->post(route('admin.categorias.update', $cat->id), [
                'name'   => 'X actualizada',
                'slug'   => 'x-actualizada',
                'status' => 'activo',
            ])
            ->assertSessionHas('status', 'Categoría actualizada correctamente.');
    }

    public function test_destroy_devuelve_flash_status_con_tilde_correcta(): void
    {
        Storage::fake('s3');
        $admin = $this->crearAdmin();
        $cat = Category::create(['name' => 'X', 'slug' => 'x', 'status' => 'activo']);

        $this->actingAs($admin)
            ->delete(route('admin.categorias.destroy', $cat->id))
            ->assertSessionHas('status', 'Categoría eliminada correctamente.');
    }

    public function test_destroy_con_subcategorias_devuelve_error_sin_mojibake(): void
    {
        $admin = $this->crearAdmin();
        $padre = Category::create(['name' => 'Padre', 'slug' => 'padre', 'status' => 'activo']);
        Category::create(['name' => 'Hija', 'slug' => 'hija', 'parent_id' => $padre->id, 'status' => 'activo']);

        $this->actingAs($admin)
            ->from(route('admin.categorias.index'))
            ->delete(route('admin.categorias.destroy', $padre->id))
            ->assertSessionHasErrors(['general' => 'No se puede eliminar una categoría que tiene subcategorías.']);
    }

    // ─────────────────────────────────────────────────────────────────
    // C2 — Ciclos en jerarquía bloqueados
    // ─────────────────────────────────────────────────────────────────

    public function test_update_via_http_bloquea_auto_padre(): void
    {
        $admin = $this->crearAdmin();
        $cat = Category::create(['name' => 'X', 'slug' => 'x', 'status' => 'activo']);

        $this->actingAs($admin)
            ->from(route('admin.categorias.index'))
            ->post(route('admin.categorias.update', $cat->id), [
                'name'      => 'X',
                'slug'      => 'x',
                'status'    => 'activo',
                'parent_id' => $cat->id,  // auto-padre
            ])
            ->assertSessionHasErrors('parent_id');

        $this->assertNull($cat->fresh()->parent_id, 'parent_id no debe haberse modificado');
    }

    public function test_update_via_http_bloquea_ciclo_transitivo(): void
    {
        $admin = $this->crearAdmin();
        // Cadena: A → B → C (B es hija de A, C es hija de B)
        $a = Category::create(['name' => 'A', 'slug' => 'a',                          'status' => 'activo']);
        $b = Category::create(['name' => 'B', 'slug' => 'b', 'parent_id' => $a->id, 'status' => 'activo']);
        $c = Category::create(['name' => 'C', 'slug' => 'c', 'parent_id' => $b->id, 'status' => 'activo']);

        // Intentar A.parent_id = C crearía A → C → B → A (ciclo)
        $this->actingAs($admin)
            ->from(route('admin.categorias.index'))
            ->post(route('admin.categorias.update', $a->id), [
                'name'      => 'A',
                'slug'      => 'a',
                'status'    => 'activo',
                'parent_id' => $c->id,
            ])
            ->assertSessionHasErrors('parent_id');

        $this->assertNull($a->fresh()->parent_id);
    }

    public function test_action_directamente_tambien_bloquea_ciclo(): void
    {
        $a = Category::create(['name' => 'A', 'slug' => 'a',                          'status' => 'activo']);
        $b = Category::create(['name' => 'B', 'slug' => 'b', 'parent_id' => $a->id, 'status' => 'activo']);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('No se puede asignar como padre una subcategoría propia.');

        // Llamada directa sin FormRequest — debe protegerse igual
        app(UpdateCategory::class)->execute($a, [
            'name'      => 'A',
            'slug'      => 'a',
            'status'    => 'activo',
            'parent_id' => $b->id,
        ]);
    }

    public function test_update_permite_cambiar_padre_a_categoria_no_descendiente(): void
    {
        $admin = $this->crearAdmin();
        $a = Category::create(['name' => 'A', 'slug' => 'a', 'status' => 'activo']);
        $b = Category::create(['name' => 'B', 'slug' => 'b', 'status' => 'activo']);
        $c = Category::create(['name' => 'C', 'slug' => 'c', 'parent_id' => $a->id, 'status' => 'activo']);

        // C es hija de A, la cambiamos a hija de B → válido (no hay ciclo)
        $this->actingAs($admin)
            ->post(route('admin.categorias.update', $c->id), [
                'name'      => 'C',
                'slug'      => 'c',
                'status'    => 'activo',
                'parent_id' => $b->id,
            ])
            ->assertSessionHasNoErrors();

        $this->assertSame($b->id, $c->fresh()->parent_id);
    }

    // ─────────────────────────────────────────────────────────────────
    // Delete: protecciones existentes
    // ─────────────────────────────────────────────────────────────────

    public function test_delete_con_productos_devuelve_error(): void
    {
        $admin = $this->crearAdmin();
        $cat = Category::create(['name' => 'X', 'slug' => 'x', 'status' => 'activo']);
        Producto::create([
            'nombre' => 'Producto Test', 'slug' => 'producto-test',
            'sku' => 'SKU1', 'unidad' => 'u', 'status' => 'activo',
            'precio_base' => 1000, 'category_id' => $cat->id,
        ]);

        $resultado = app(DeleteCategory::class)->execute($cat);

        $this->assertSame(['error' => 'tiene_productos'], $resultado);
        $this->assertDatabaseHas('categories', ['id' => $cat->id]);
    }

    public function test_delete_elimina_imagen_de_s3(): void
    {
        Storage::fake('s3');
        $cat = Category::create([
            'name'   => 'X',
            'slug'   => 'x',
            'status' => 'activo',
            'image'  => 'categorias/test-imagen.jpg',
        ]);
        Storage::disk('s3')->put('categorias/test-imagen.jpg', 'fake content');

        app(DeleteCategory::class)->execute($cat);

        Storage::disk('s3')->assertMissing('categorias/test-imagen.jpg');
        $this->assertDatabaseMissing('categories', ['id' => $cat->id]);
    }

    // ─────────────────────────────────────────────────────────────────
    // Permisos
    // ─────────────────────────────────────────────────────────────────

    public function test_admin_sin_permiso_crear_recibe_403(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'email_verified_at' => now()]);
        // Sin role asignado → sin permiso

        $this->actingAs($admin)
            ->post(route('admin.categorias.store'), [
                'name' => 'X', 'slug' => 'x', 'status' => 'activo',
            ])
            ->assertStatus(403);
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────

    private function crearAdmin(): User
    {
        $admin = User::factory()->create([
            'role'              => 'admin',
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('super-admin');
        return $admin;
    }
}
