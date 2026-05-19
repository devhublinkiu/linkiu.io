/// <reference types="vite/client" />

import * as Ably from 'ably'

// Singleton — se conecta una vez por sesión de browser
let _client: Ably.Realtime | null = null

export function getAblyClient(): Ably.Realtime {
    if (!_client) {
        _client = new Ably.Realtime({ key: import.meta.env.VITE_ABLY_KEY as string })
    }
    return _client
}
