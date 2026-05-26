<?php

namespace Tests\Unit\Meta;

use App\Support\Meta\MetaHashHelper;
use PHPUnit\Framework\TestCase;

class MetaHashHelperTest extends TestCase
{
    public function test_email_normaliza_y_hashea(): void
    {
        $hash = MetaHashHelper::email('  Test@Example.com  ');
        $this->assertSame(hash('sha256', 'test@example.com'), $hash);
    }

    public function test_email_invalido_devuelve_null(): void
    {
        $this->assertNull(MetaHashHelper::email('no-es-email'));
        $this->assertNull(MetaHashHelper::email(''));
        $this->assertNull(MetaHashHelper::email(null));
    }

    public function test_phone_remueve_no_digitos_y_hashea(): void
    {
        $hash = MetaHashHelper::phone('+57 300 123 4567');
        $this->assertSame(hash('sha256', '573001234567'), $hash);
    }

    public function test_phone_sin_codigo_pais_asume_colombia(): void
    {
        $hash = MetaHashHelper::phone('3001234567');
        $this->assertSame(hash('sha256', '573001234567'), $hash);
    }

    public function test_phone_con_codigo_pais_no_lo_duplica(): void
    {
        $hash = MetaHashHelper::phone('+1 555 123 4567');
        $this->assertSame(hash('sha256', '15551234567'), $hash);
    }

    public function test_phone_vacio_devuelve_null(): void
    {
        $this->assertNull(MetaHashHelper::phone(null));
        $this->assertNull(MetaHashHelper::phone(''));
        $this->assertNull(MetaHashHelper::phone('---'));
    }

    public function test_nombre_normaliza_lowercase(): void
    {
        $hash = MetaHashHelper::nombre('Juan');
        $this->assertSame(hash('sha256', 'juan'), $hash);
    }

    public function test_external_id_hashea_directo(): void
    {
        $hash = MetaHashHelper::externalId('42');
        $this->assertSame(hash('sha256', '42'), $hash);
    }
}
