import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { useTranslation } from '../hooks/useTranslation';

const LanguageSwitcher = ({ className = '' }) => {
    const { t, getCurrentLocale, getAvailableLocales, isRTL } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    
    const currentLocale = getCurrentLocale();
    const availableLocales = getAvailableLocales();
    const currentLanguage = availableLocales[currentLocale];

    const handleLanguageChange = (locale) => {
        router.get(`/language/switch/${locale}`, {}, {
            preserveState: false,
            preserveScroll: true,
        });
        setIsOpen(false);
    };

    return (
        <div className={`relative inline-block text-left ${className}`}>
            <div>
                <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded="true"
                    aria-haspopup="true"
                >
                    <span className="flex items-center">
                        <span className={`${isRTL() ? 'ml-2' : 'mr-2'}`}>
                            {currentLanguage?.native || currentLanguage?.name || 'English'}
                        </span>
                        <svg 
                            className={`-mr-1 ml-2 h-5 w-5 ${isRTL() ? 'rotate-180' : ''}`} 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 20 20" 
                            fill="currentColor" 
                            aria-hidden="true"
                        >
                            <path 
                                fillRule="evenodd" 
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                                clipRule="evenodd" 
                            />
                        </svg>
                    </span>
                </button>
            </div>

            {isOpen && (
                <div className={`origin-top-${isRTL() ? 'left' : 'right'} absolute ${isRTL() ? 'left-0' : 'right-0'} mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50`}>
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        {Object.values(availableLocales).map((language) => (
                            <button
                                key={language.code}
                                onClick={() => handleLanguageChange(language.code)}
                                className={`${
                                    currentLocale === language.code
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-700'
                                } group flex items-center px-4 py-2 text-sm w-full text-${isRTL() ? 'right' : 'left'} hover:bg-gray-100 hover:text-gray-900`}
                                role="menuitem"
                            >
                                <span className={`flex items-center ${language.rtl ? 'flex-row-reverse' : ''}`}>
                                    <span className={`${isRTL() ? 'ml-3' : 'mr-3'} font-medium`}>
                                        {language.native}
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                        {language.name}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;