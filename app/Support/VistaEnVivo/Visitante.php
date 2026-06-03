<?php

namespace App\Support\VistaEnVivo;

/**
 * DTO inmutable que representa un visitante activo de la tienda publica.
 * Se serializa hacia/desde Redis como JSON.
 *
 * El identificador anonimo se deriva del session ID via hash corto SHA256.
 */
class Visitante
{
    public function __construct(
        public readonly string  $identificador,    // 'Visit-A4F2'
        public readonly string  $pagina,           // '/productos/melatonina'
        public readonly ?string $seccion,          // 'como_funciona' o null
        public readonly string  $dispositivo,      // 'movil' | 'desktop' | 'tablet'
        public readonly string  $origen,           // 'facebook' | 'instagram' | 'google' | 'direct' | 'otros'
        public readonly int     $iniciadoEn,       // unix timestamp del primer hit
        public readonly ?string $ciudad,
    ) {}

    /**
     * Calcula el identificador anonimo a partir del session ID.
     * Hash SHA256 truncado a 4 chars hex en mayuscula -> Visit-A4F2.
     */
    public static function identificadorDe(string $sessionId): string
    {
        return 'Visit-' . strtoupper(substr(hash('sha256', $sessionId), 0, 4));
    }

    /**
     * Construye desde el shape recibido en el body del heartbeat + extras
     * resueltos server-side (sessionId, ciudad).
     */
    public static function desdeRequest(
        string  $sessionId,
        string  $pagina,
        ?string $seccion,
        string  $dispositivo,
        string  $origen,
        int     $iniciadoEn,
        ?string $ciudad,
    ): self {
        return new self(
            identificador: self::identificadorDe($sessionId),
            pagina:        substr($pagina, 0, 200),
            seccion:       $seccion ? substr($seccion, 0, 60) : null,
            dispositivo:   in_array($dispositivo, ['movil', 'desktop', 'tablet'], true) ? $dispositivo : 'desktop',
            origen:        in_array($origen, ['facebook', 'instagram', 'google', 'direct', 'otros'], true) ? $origen : 'otros',
            iniciadoEn:    $iniciadoEn,
            ciudad:        $ciudad,
        );
    }

    /**
     * Para serializar a Redis (hash value JSON).
     */
    public function toJson(): string
    {
        return json_encode([
            'identificador' => $this->identificador,
            'pagina'        => $this->pagina,
            'seccion'       => $this->seccion,
            'dispositivo'   => $this->dispositivo,
            'origen'        => $this->origen,
            'iniciado_en'   => $this->iniciadoEn,
            'ciudad'        => $this->ciudad,
        ]);
    }

    /**
     * Para deserializar desde Redis.
     */
    public static function fromJson(string $json): ?self
    {
        $data = json_decode($json, true);
        if (! is_array($data)) return null;

        return new self(
            identificador: (string) ($data['identificador'] ?? 'Visit-????'),
            pagina:        (string) ($data['pagina'] ?? '/'),
            seccion:       $data['seccion'] ?? null,
            dispositivo:   (string) ($data['dispositivo'] ?? 'desktop'),
            origen:        (string) ($data['origen'] ?? 'otros'),
            iniciadoEn:    (int)    ($data['iniciado_en'] ?? time()),
            ciudad:        $data['ciudad'] ?? null,
        );
    }

    /**
     * Shape para el payload Inertia / Ably.
     */
    public function toArray(): array
    {
        return [
            'identificador' => $this->identificador,
            'pagina'        => $this->pagina,
            'seccion'       => $this->seccion,
            'dispositivo'   => $this->dispositivo,
            'origen'        => $this->origen,
            'iniciado_en'   => $this->iniciadoEn,
            'ciudad'        => $this->ciudad,
        ];
    }
}
