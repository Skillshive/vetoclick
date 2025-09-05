import React from 'react';
import Select from 'react-select';
import { useThemeContext } from '@/contexts/theme/context';

interface Option {
    value: string | number;
    label: string;
}

interface ReactSelectProps {
    id?: string;
    value?: Option | null;
    onChange: (option: Option | null) => void;
    options: Option[];
    placeholder?: string;
    isDisabled?: boolean;
    isClearable?: boolean;
    className?: string;
    error?: boolean;
}

const ReactSelect: React.FC<ReactSelectProps> = ({
    id,
    value,
    onChange,
    options,
    placeholder = 'Select...',
    isDisabled = false,
    isClearable = false,
    className = '',
    error = false,
}) => {
    const { themeMode } = useThemeContext();
    const isDark = themeMode === 'dark';

    const customStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            minHeight: '2.5rem',
            borderRadius: '0.375rem',
            border: error
                ? '1px solid #ef4444'
                : state.isFocused
                ? '1px solid #4DB9AD'
                : isDark
                ? '1px solid #4B5675'
                : '1px solid #D1D5DB',
            backgroundColor: isDark ? '#1F212A' : '#FFFFFF',
            color: isDark ? '#FFFFFF' : '#000000',
            boxShadow: state.isFocused ? '0 0 0 1px #4DB9AD' : 'none',
            '&:hover': {
                borderColor: state.isFocused ? '#4DB9AD' : (isDark ? '#636674' : '#9CA3AF'),
            },
            cursor: 'pointer',
        }),
        input: (provided: any) => ({
            ...provided,
            color: isDark ? '#FFFFFF' : '#000000',
        }),
        placeholder: (provided: any) => ({
            ...provided,
            color: isDark ? '#9CA3AF' : '#6B7280',
        }),
        singleValue: (provided: any) => ({
            ...provided,
            color: isDark ? '#FFFFFF' : '#000000',
        }),
        menu: (provided: any) => ({
            ...provided,
            backgroundColor: isDark ? '#1F212A' : '#FFFFFF',
            border: isDark ? '1px solid #4B5675' : '1px solid #D1D5DB',
            borderRadius: '0.375rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 9999,
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? '#4DB9AD'
                : state.isFocused
                ? isDark ? '#363843' : '#F3F4F6'
                : isDark ? '#1F212A' : '#FFFFFF',
            color: state.isSelected
                ? '#FFFFFF'
                : isDark ? '#FFFFFF' : '#000000',
            cursor: 'pointer',
            '&:active': {
                backgroundColor: '#4DB9AD',
                color: '#FFFFFF',
            },
        }),
        clearIndicator: (provided: any) => ({
            ...provided,
            color: isDark ? '#9CA3AF' : '#6B7280',
            cursor: 'pointer',
            '&:hover': {
                color: '#EF4444',
            },
        }),
        dropdownIndicator: (provided: any) => ({
            ...provided,
            color: isDark ? '#9CA3AF' : '#6B7280',
            cursor: 'pointer',
        }),
        indicatorSeparator: (provided: any) => ({
            ...provided,
            backgroundColor: isDark ? '#4B5675' : '#D1D5DB',
        }),
    };

    return (
        <div className={className}>
            <Select
                id={id}
                value={value}
                onChange={onChange}
                options={options}
                placeholder={placeholder}
                isDisabled={isDisabled}
                isClearable={isClearable}
                styles={customStyles}
                theme={(theme) => ({
                    ...theme,
                    colors: {
                        ...theme.colors,
                        primary: '#4DB9AD',
                        primary75: '#6FC9C0',
                        primary50: '#A1D9D4',
                        primary25: '#D0EBE9',
                    },
                })}
            />
        </div>
    );
};

export default ReactSelect;