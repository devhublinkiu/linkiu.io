import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans],
                dashboard: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            keyframes: {
                'caret-blink': {
                    '0%,70%,100%': { opacity: '1' },
                    '20%,50%':     { opacity: '0' },
                },
                'shake': {
                    '0%,100%': { transform: 'translateX(0)' },
                    '20%,60%': { transform: 'translateX(-5px)' },
                    '40%,80%': { transform: 'translateX(5px)' },
                },
            },
            animation: {
                'caret-blink': 'caret-blink 1.25s ease-out infinite',
                'shake':       'shake 0.4s ease-in-out',
            },
        },
    },

    plugins: [],
};