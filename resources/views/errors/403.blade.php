<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sin acceso — {{ config('app.name') }}</title>
    @vite(['resources/css/app.css'])
</head>
<body class="flex min-h-screen items-center justify-center bg-gray-50 font-sans antialiased">

    <div class="flex flex-col items-center gap-6 px-6 text-center">

        <img
            src="{{ asset('assets/errors_page_resources/img_error_403.svg') }}"
            alt="Sin acceso"
            class="w-72"
        />

        <div class="space-y-2">
            <h1 class="text-2xl font-bold text-slate-950">Sin acceso</h1>
            <p class="max-w-sm text-sm text-slate-500">
                No tienes permiso para ver esta página.
                Si crees que deberías tener acceso, contacta al administrador de tu cuenta.
            </p>
        </div>

        <div class="flex items-center gap-3">
            <a
                href="javascript:history.back()"
                class="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
            >
                Volver atrás
            </a>
            <a
                href="{{ route('admin.dashboard') }}"
                class="inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-slate-800"
            >
                Ir al dashboard
            </a>
        </div>

    </div>

</body>
</html>
