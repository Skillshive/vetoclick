import { useLocaleContext } from '@/contexts/locale/context';

// Fallback translations for when backend translations aren't available
const fallbackTranslations: Record<string, Record<string, string>> = {
  en: {
    'common.dashboard': 'Dashboard',
    'common.welcome': 'Welcome',
    'common.animals': 'Animals',
    'common.appointments': 'Appointments',
    'common.medical_records': 'Medical Records',
    'common.inventory': 'Inventory',
    'common.products': 'Products',
    'common.suppliers': 'Suppliers',
    'common.clients': 'Clients',
    'common.staff': 'Staff',
    'common.reports': 'Reports',
    'common.billing': 'Billing',
    'common.veterinary_clinic': 'Veterinary Clinic',
    'common.language': 'Language',
    'common.english': 'English',
    'common.arabic': 'Arabic',
    'common.french': 'French',
  },
  ar: {
    'common.dashboard': 'لوحة التحكم',
    'common.welcome': 'مرحباً',
    'common.animals': 'الحيوانات',
    'common.appointments': 'المواعيد',
    'common.medical_records': 'السجلات الطبية',
    'common.inventory': 'المخزون',
    'common.products': 'المنتجات',
    'common.suppliers': 'الموردون',
    'common.clients': 'العملاء',
    'common.staff': 'الموظفون',
    'common.reports': 'التقارير',
    'common.billing': 'الفواتير',
    'common.veterinary_clinic': 'العيادة البيطرية',
    'common.language': 'اللغة',
    'common.english': 'الإنجليزية',
    'common.arabic': 'العربية',
    'common.french': 'الفرنسية',
  },
  fr: {
    'common.dashboard': 'Tableau de bord',
    'common.welcome': 'Bienvenue',
    'common.animals': 'Animaux',
    'common.appointments': 'Rendez-vous',
    'common.medical_records': 'Dossiers médicaux',
    'common.inventory': 'Inventaire',
    'common.products': 'Produits',
    'common.suppliers': 'Fournisseurs',
    'common.clients': 'Clients',
    'common.staff': 'Personnel',
    'common.reports': 'Rapports',
    'common.billing': 'Facturation',
    'common.veterinary_clinic': 'Clinique vétérinaire',
    'common.language': 'Langue',
    'common.english': 'Anglais',
    'common.arabic': 'Arabe',
    'common.french': 'Français',
  },
};

export function useTranslation() {
  const { locale, isRtl } = useLocaleContext();

  const t = (key: string, replacements: Record<string, string | number> = {}): string => {
    // Get translation from fallback
    const translation = fallbackTranslations[locale]?.[key] || key;

    if (typeof translation === 'string') {
      // Replace placeholders like :name, :count, etc.
      return Object.keys(replacements).reduce((str, placeholder) => {
        const regex = new RegExp(`:${placeholder}\\b`, 'g');
        return str.replace(regex, String(replacements[placeholder]));
      }, translation);
    }

    return key;
  };

  const getCurrentLocale = () => {
    return locale;
  };

  const isCurrentLocaleRTL = () => {
    return isRtl;
  };

  return {
    t,
    locale,
    isRTL: isCurrentLocaleRTL,
    getCurrentLocale,
  };
}