<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class Order extends Model
{
    public const CACHE_COUNT_PENDIENTES         = 'orders:count:pendientes';
    public const CACHE_COUNT_REVISION_PENDIENTE = 'orders:count:revision-pendiente';


    protected $fillable = [
        'codigo',
        'acceso_token',
        'client_id',
        'estado',
        'metodo_pago',
        'subtotal',
        'costo_envio',
        'recargo',
        'descuento_metodo_pago',
        'descuento_metodo_tipo',
        'descuento_metodo_valor',
        'total',
        'nombre',
        'apellido',
        'email',
        'telefono',
        'departamento',
        'ciudad',
        'direccion',
        'apartamento',
        'notas',
        'comprobante_path',
        'numero_guia',
        'transportadora',
        'notas_internas',
        'motivo_cancelacion',
        'mp_payment_id',
        'mp_status',
        'mp_status_detail',
        'mp_notificado_at',
        'bold_payment_id',
        'bold_status',
        'bold_link_id',
        'bold_notificado_at',
        'revision_estado',
        'revision_motivos',
        'revision_revisada_por',
        'revision_revisada_at',
        'revision_comentario',
        'confirmacion_solicitada_at',
        'confirmacion_reenviada',
        'confirmacion_respondida_at',
        'confirmacion_respuesta',
    ];

    protected $casts = [
        'subtotal'                   => 'integer',
        'costo_envio'                => 'integer',
        'recargo'                    => 'integer',
        'descuento_metodo_pago'      => 'integer',
        'descuento_metodo_valor'     => 'decimal:2',
        'total'                      => 'integer',
        'mp_notificado_at'           => 'datetime',
        'bold_notificado_at'         => 'datetime',
        'revision_motivos'           => 'array',
        'revision_revisada_at'       => 'datetime',
        'confirmacion_solicitada_at' => 'datetime',
        'confirmacion_reenviada'     => 'boolean',
        'confirmacion_respondida_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        // Garantiza que toda orden nueva tenga acceso_token, aunque la creación
        // no lo setee explícitamente.
        static::creating(function (Order $order) {
            if (empty($order->acceso_token)) {
                // 16 chars: ~95 bits de entropía — más que suficiente para acceso
                // por link no público sin descuidar seguridad. Antes era 40
                // (overkill) y la URL salía muy larga en WhatsApp.
                $order->acceso_token = Str::random(16);
            }
        });

        // Código correlativo LNK-000001 derivado del id ya asignado.
        // No usa random_int: cero race conditions y crece monotónico.
        static::created(function (Order $order) {
            if (empty($order->codigo)) {
                $order->update([
                    'codigo' => 'LNK-' . str_pad((string) $order->id, 6, '0', STR_PAD_LEFT),
                ]);
            }
        });

        // Cualquier cambio en orders invalida el cache del contador de
        // pendientes que se muestra en el header del listado admin, y los
        // agregados cacheados del cliente dueño de la orden (Show admin).
        $invalidar = function (Order $order) {
            Cache::forget(self::CACHE_COUNT_PENDIENTES);
            Cache::forget(self::CACHE_COUNT_REVISION_PENDIENTE);
            if ($order->client_id) {
                Cache::forget(Client::cacheKeyStats($order->client_id));
            }
        };
        static::saved($invalidar);
        static::deleted($invalidar);
    }

    /**
     * Cuenta de órdenes pendientes cacheada. Cualquier saved/deleted la invalida.
     */
    public static function countPendientes(): int
    {
        return Cache::rememberForever(
            self::CACHE_COUNT_PENDIENTES,
            fn () => self::where('estado', 'pendiente')->count(),
        );
    }

    /**
     * Cuenta de órdenes bajo revisión antifraude (revision_estado=pendiente).
     * Independiente de countPendientes — son ejes ortogonales.
     */
    public static function countRevisionPendiente(): int
    {
        return Cache::rememberForever(
            self::CACHE_COUNT_REVISION_PENDIENTE,
            fn () => self::where('revision_estado', 'pendiente')->count(),
        );
    }

    public function scopeEnRevision($query)
    {
        return $query->where('revision_estado', 'pendiente');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
