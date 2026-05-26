<?php

namespace App\Actions\Meta;

use App\Models\Integracion;
use FacebookAds\Api;
use FacebookAds\Object\ServerSide\CustomData;
use FacebookAds\Object\ServerSide\Event;
use FacebookAds\Object\ServerSide\EventRequest;
use FacebookAds\Object\ServerSide\UserData;
use Illuminate\Support\Facades\Log;

/**
 * Cliente síncrono de Conversions API de Meta — implementado con el Business SDK
 * oficial (facebook/php-business-sdk).
 *
 * Espera datos PII ya hasheados SHA-256 (lo hace el controller para no exponer
 * texto plano en la cola serializada). El SDK detecta el hash y NO lo re-hashea.
 *
 * Se invoca SIEMPRE desde el job — nunca en el request principal — para no
 * bloquear UX si Meta tarda en responder o se cae.
 *
 * Ref:
 * - https://developers.facebook.com/docs/marketing-api/conversions-api
 * - https://github.com/facebook/facebook-php-business-sdk
 */
class EnviarEventoMeta
{
    public function execute(
        string $eventName,
        string $eventId,
        int $eventTime,
        string $eventSourceUrl,
        array $userData,
        array $customData = [],
        ?string $testEventCode = null,
    ): bool {
        $pixelId = Integracion::get('fb_pixel_id');
        $token   = Integracion::get('fb_access_token');

        if (! $pixelId || ! $token) {
            return false;
        }

        try {
            Api::init(null, null, $token);

            $userDataObj = $this->construirUserData($userData);
            $customDataObj = $this->construirCustomData($customData);

            $event = (new Event())
                ->setEventName($eventName)
                ->setEventId($eventId)
                ->setEventTime($eventTime)
                ->setEventSourceUrl($eventSourceUrl)
                ->setActionSource('website')
                ->setUserData($userDataObj)
                ->setCustomData($customDataObj);

            $request = (new EventRequest($pixelId))
                ->setEvents([$event]);

            if ($testEventCode) {
                $request->setTestEventCode($testEventCode);
            }

            $response = $request->execute();

            // El SDK lanza excepción en HTTP error, así que si llegamos acá es 2xx.
            // events_received > 0 confirma que Meta lo procesó.
            return $response->getEventsReceived() > 0;
        } catch (\Throwable $e) {
            Log::warning('Meta CAPI falló', [
                'event'   => $eventName,
                'message' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Setea los campos de UserData usando los setters que aceptan valores ya
     * hasheados (`setEmails`, `setPhones`, etc.). El SDK guarda el array tal
     * cual sin re-hashear cuando detecta formato SHA-256.
     */
    private function construirUserData(array $data): UserData
    {
        $u = new UserData();

        if (! empty($data['em'])) $u->setEmails([$data['em']]);
        if (! empty($data['ph'])) $u->setPhones([$data['ph']]);
        if (! empty($data['fn'])) $u->setFirstNames([$data['fn']]);
        if (! empty($data['ln'])) $u->setLastNames([$data['ln']]);
        if (! empty($data['external_id'])) $u->setExternalIds([$data['external_id']]);
        if (! empty($data['client_ip_address'])) $u->setClientIpAddress($data['client_ip_address']);
        if (! empty($data['client_user_agent'])) $u->setClientUserAgent($data['client_user_agent']);
        if (! empty($data['fbp'])) $u->setFbp($data['fbp']);
        if (! empty($data['fbc'])) $u->setFbc($data['fbc']);

        return $u;
    }

    private function construirCustomData(array $data): CustomData
    {
        $c = new CustomData();

        if (isset($data['value']))        $c->setValue((float) $data['value']);
        if (! empty($data['currency']))   $c->setCurrency($data['currency']);
        if (! empty($data['content_ids']))  $c->setContentIds(array_values($data['content_ids']));
        if (! empty($data['content_name'])) $c->setContentName($data['content_name']);
        if (! empty($data['content_type'])) $c->setContentType($data['content_type']);
        if (isset($data['num_items']))    $c->setNumItems((int) $data['num_items']);
        if (! empty($data['order_id']))   $c->setOrderId($data['order_id']);

        return $c;
    }
}
