<?php

namespace App\Support\VistaEnVivo;

/**
 * DTO mutable que representa un visitante activo. Se serializa hacia/desde
 * Redis como JSON. Acumula el `recorrido` de secciones durante toda la
 * sesion para persistirlo al disconnect (analisis de funnel posterior).
 */
class Visitante
{
    public function __construct(
        public string  $identificador,
        public string  $paginaEntrada,
        public string  $paginaActual,
        public ?string $seccion,
        public string  $dispositivo,
        public string  $origen,
        public int     $iniciadoEn,
        public ?string $ciudad,
        public ?string $pais,
        /** @var array<array{s:string,t:int}> */
        public array   $recorrido  = [],
        // Atribución de campaña — capturada del URL al primer hit. Inmutable
        // durante la sesión: si el visitante navega a otra URL sin UTMs, no
        // se pierde la atribución original.
        public ?string $utmSource  = null,
        public ?string $utmMedium  = null,
        public ?string $utmCampaign = null,
        public ?string $utmContent = null,
        public ?string $utmTerm    = null,
        public ?string $landingPath = null,
    ) {}

    public static function identificadorDe(string $sessionId): string
    {
        return 'Visit-' . strtoupper(substr(hash('sha256', $sessionId), 0, 4));
    }

    /**
     * Construye un visitante desde el body del primer heartbeat.
     */
    public static function nuevo(
        string  $sessionId,
        string  $pagina,
        ?string $seccion,
        string  $dispositivo,
        string  $origen,
        int     $iniciadoEn,
        ?string $ciudad,
        ?string $pais,
        ?string $utmSource   = null,
        ?string $utmMedium   = null,
        ?string $utmCampaign = null,
        ?string $utmContent  = null,
        ?string $utmTerm     = null,
        ?string $landingPath = null,
    ): self {
        $disp   = in_array($dispositivo, ['movil', 'desktop', 'tablet'], true) ? $dispositivo : 'desktop';
        $org    = in_array($origen, ['facebook', 'instagram', 'google', 'direct', 'otros'], true) ? $origen : 'otros';
        $pagina = substr($pagina, 0, 200);

        $recorrido = [];
        if ($seccion) {
            $recorrido[] = ['s' => substr($seccion, 0, 60), 't' => 0];
        }

        return new self(
            identificador: self::identificadorDe($sessionId),
            paginaEntrada: $pagina,
            paginaActual:  $pagina,
            seccion:       $seccion ? substr($seccion, 0, 60) : null,
            dispositivo:   $disp,
            origen:        $org,
            iniciadoEn:    $iniciadoEn,
            ciudad:        $ciudad,
            pais:          $pais,
            recorrido:     $recorrido,
            utmSource:     $utmSource,
            utmMedium:     $utmMedium,
            utmCampaign:   $utmCampaign,
            utmContent:    $utmContent,
            utmTerm:       $utmTerm,
            landingPath:   $landingPath ?: $pagina,
        );
    }

    /**
     * Aplica updates desde el heartbeat actual al visitante existente.
     * Agrega la seccion al recorrido si es distinta de la ultima vista.
     */
    public function actualizar(string $pagina, ?string $seccion, ?string $ciudad, ?string $pais): void
    {
        $this->paginaActual = substr($pagina, 0, 200);

        if ($seccion) {
            $seccion = substr($seccion, 0, 60);
            $ultima  = end($this->recorrido) ?: null;
            $cambio  = ! $ultima || ($ultima['s'] ?? null) !== $seccion;

            if ($cambio) {
                $this->recorrido[] = [
                    's' => $seccion,
                    't' => max(0, time() - $this->iniciadoEn),
                ];
                // Limit defensivo — un visitante no deberia tener mas de 50
                // secciones distintas; si scrollea muy rapido entre todas,
                // cortamos para no inflar el JSON.
                if (count($this->recorrido) > 50) {
                    $this->recorrido = array_slice($this->recorrido, -50);
                }
            }
            $this->seccion = $seccion;
        } else {
            $this->seccion = null;
        }

        if ($ciudad) $this->ciudad = $ciudad;
        if ($pais)   $this->pais   = $pais;
    }

    public function toJson(): string
    {
        return json_encode([
            'identificador'   => $this->identificador,
            'pagina_entrada'  => $this->paginaEntrada,
            'pagina_actual'   => $this->paginaActual,
            'seccion'         => $this->seccion,
            'dispositivo'     => $this->dispositivo,
            'origen'          => $this->origen,
            'iniciado_en'     => $this->iniciadoEn,
            'ciudad'          => $this->ciudad,
            'pais'            => $this->pais,
            'recorrido'       => $this->recorrido,
            'utm_source'      => $this->utmSource,
            'utm_medium'      => $this->utmMedium,
            'utm_campaign'    => $this->utmCampaign,
            'utm_content'     => $this->utmContent,
            'utm_term'        => $this->utmTerm,
            'landing_path'    => $this->landingPath,
        ]);
    }

    public static function fromJson(string $json): ?self
    {
        $d = json_decode($json, true);
        if (! is_array($d)) return null;

        return new self(
            identificador: (string) ($d['identificador'] ?? 'Visit-????'),
            paginaEntrada: (string) ($d['pagina_entrada'] ?? ($d['pagina'] ?? '/')),
            paginaActual:  (string) ($d['pagina_actual']  ?? ($d['pagina'] ?? '/')),
            seccion:       $d['seccion'] ?? null,
            dispositivo:   (string) ($d['dispositivo'] ?? 'desktop'),
            origen:        (string) ($d['origen'] ?? 'otros'),
            iniciadoEn:    (int)    ($d['iniciado_en'] ?? time()),
            ciudad:        $d['ciudad'] ?? null,
            pais:          $d['pais']   ?? null,
            recorrido:     is_array($d['recorrido'] ?? null) ? $d['recorrido'] : [],
            utmSource:     $d['utm_source']   ?? null,
            utmMedium:     $d['utm_medium']   ?? null,
            utmCampaign:   $d['utm_campaign'] ?? null,
            utmContent:    $d['utm_content']  ?? null,
            utmTerm:       $d['utm_term']     ?? null,
            landingPath:   $d['landing_path'] ?? null,
        );
    }

    /**
     * Shape para el frontend de la tabla. La columna 'pagina' usa la
     * pagina_actual (lo que el visitante esta viendo ahora mismo).
     */
    public function toArray(): array
    {
        return [
            'identificador' => $this->identificador,
            'pagina'        => $this->paginaActual,
            'seccion'       => $this->seccion,
            'dispositivo'   => $this->dispositivo,
            'origen'        => $this->origen,
            'iniciado_en'   => $this->iniciadoEn,
            'ciudad'        => $this->ciudad,
        ];
    }
}
