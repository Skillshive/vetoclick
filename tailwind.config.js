/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';

export default {
  content: [
    "./resources/**/*.{js,jsx,ts,tsx}",
    "./resources/**/*.blade.php",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4DB9AD',
          light: '#F0FCFA',
          'dark-light': 'rgba(77,185,173,.15)',
        },
        secondary: {
          DEFAULT: '#1B2441',
          light: '#F0F2F5',
          'dark-light': 'rgba(27,36,65,.15)',
        },
        success: {
          DEFAULT: '#00ab55',
          light: '#ddf5f0',
          'dark-light': 'rgba(0,171,85,.15)',
        },
        danger: {
          DEFAULT: '#e7515a',
          light: '#fff5f5',
          'dark-light': 'rgba(231,81,90,.15)',
        },
        warning: {
          DEFAULT: '#e2a03f',
          light: '#fff9ed',
          'dark-light': 'rgba(226,160,63,.15)',
        },
        info: {
          DEFAULT: '#2196f3',
          light: '#e7f7ff',
          'dark-light': 'rgba(33,150,243,.15)',
        },
        dark: {
          DEFAULT: '#3b3f5c',
          light: '#eaeaec',
          'dark-light': 'rgba(59,63,92,.15)',
        },
        black: {
          DEFAULT: '#0e1726',
          light: '#e3e4eb',
          'dark-light': 'rgba(14,23,38,.15)',
        },
        white: {
          DEFAULT: '#ffffff',
          light: '#e0e6ed',
          dark: '#888ea8',
        },
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
        arabic: ['Noto Sans Arabic', 'sans-serif'],
      },
      spacing: {
        'rtl': '0 0 0 auto',
        'ltr': '0 auto 0 0',
      },
    },
  },
  plugins: [
    forms,
    function({ addUtilities }) {
      const newUtilities = {
        '.rtl': {
          direction: 'rtl',
        },
        '.ltr': {
          direction: 'ltr',
        },
        '.text-start': {
          'text-align': 'start',
        },
        '.text-end': {
          'text-align': 'end',
        },
        '.float-start': {
          float: 'inline-start',
        },
        '.float-end': {
          float: 'inline-end',
        },
        '.ms-auto': {
          'margin-inline-start': 'auto',
        },
        '.me-auto': {
          'margin-inline-end': 'auto',
        },
        '.ps-0': { 'padding-inline-start': '0' },
        '.ps-1': { 'padding-inline-start': '0.25rem' },
        '.ps-2': { 'padding-inline-start': '0.5rem' },
        '.ps-3': { 'padding-inline-start': '0.75rem' },
        '.ps-4': { 'padding-inline-start': '1rem' },
        '.ps-5': { 'padding-inline-start': '1.25rem' },
        '.ps-6': { 'padding-inline-start': '1.5rem' },
        '.pe-0': { 'padding-inline-end': '0' },
        '.pe-1': { 'padding-inline-end': '0.25rem' },
        '.pe-2': { 'padding-inline-end': '0.5rem' },
        '.pe-3': { 'padding-inline-end': '0.75rem' },
        '.pe-4': { 'padding-inline-end': '1rem' },
        '.pe-5': { 'padding-inline-end': '1.25rem' },
        '.pe-6': { 'padding-inline-end': '1.5rem' },
        '.ms-0': { 'margin-inline-start': '0' },
        '.ms-1': { 'margin-inline-start': '0.25rem' },
        '.ms-2': { 'margin-inline-start': '0.5rem' },
        '.ms-3': { 'margin-inline-start': '0.75rem' },
        '.ms-4': { 'margin-inline-start': '1rem' },
        '.ms-5': { 'margin-inline-start': '1.25rem' },
        '.ms-6': { 'margin-inline-start': '1.5rem' },
        '.me-0': { 'margin-inline-end': '0' },
        '.me-1': { 'margin-inline-end': '0.25rem' },
        '.me-2': { 'margin-inline-end': '0.5rem' },
        '.me-3': { 'margin-inline-end': '0.75rem' },
        '.me-4': { 'margin-inline-end': '1rem' },
        '.me-5': { 'margin-inline-end': '1.25rem' },
        '.me-6': { 'margin-inline-end': '1.5rem' },
      }
      addUtilities(newUtilities)
    }
  ],
}
