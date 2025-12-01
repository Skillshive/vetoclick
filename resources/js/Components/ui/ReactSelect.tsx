import React, { ReactNode } from 'react';
import Select, { MultiValue, SingleValue, ActionMeta } from 'react-select';
import { useThemeContext } from '@/contexts/theme/context';

interface Option {
    value: string | number;
    label: string;
}

interface ReactSelectProps {
    isRequired?: boolean;
    id?: string;
    value?: Option | Option[] | null;
    onChange: (newValue: MultiValue<Option> | SingleValue<Option>, actionMeta: ActionMeta<Option>) => void;
    options: Option[];
    placeholder?: string;
    isDisabled?: boolean;
    isClearable?: boolean;
    isMulti?: boolean;
    className?: string;
    error?: boolean;
    label?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

const ReactSelect: React.FC<ReactSelectProps> = ({
    isRequired = false,
    id,
    value,
    onChange,
    options,
    placeholder = 'Select...',
    isDisabled = false,
    isClearable = false,
    isMulti = false,
    className = '',
    error = false,
    label,
    leftIcon,
    rightIcon,
}) => {
    const { themeMode } = useThemeContext();
    const isDark = themeMode === 'dark';

    const customStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            minHeight: '2.5rem',
            borderRadius: '0.375rem',
            paddingLeft: leftIcon ? '2rem' : provided.paddingLeft,
            paddingRight: rightIcon ? '2rem' : provided.paddingRight,
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
        multiValue: (provided: any) => ({
            ...provided,
            backgroundColor: isDark ? '#4B5675' : '#E5E7EB',
            borderRadius: '0.25rem',
            margin: '0.125rem',
        }),
        multiValueLabel: (provided: any) => ({
            ...provided,
            color: isDark ? '#FFFFFF' : '#000000',
            fontSize: '0.875rem',
            padding: '0.125rem 0.25rem',
        }),
        multiValueRemove: (provided: any) => ({
            ...provided,
            color: isDark ? '#9CA3AF' : '#6B7280',
            cursor: 'pointer',
            '&:hover': {
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
            },
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
            {label && (
                        <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5`}>
                    {label}
                    {isRequired && <span className="text-error mx-1">*</span>}

                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-0 top-0 flex h-full w-9 items-center justify-center pointer-events-none z-10 text-gray-400 dark:text-gray-500">
                        {leftIcon}
                    </div>
                )}
                <Select
                    id={id}
                    value={value}
                    onChange={onChange}
                    options={options}
                    placeholder={placeholder}
                    isDisabled={isDisabled}
                    isClearable={isClearable}
                    isMulti={isMulti}
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
                {rightIcon && (
                    <div className="absolute right-0 top-0 flex h-full w-9 items-center justify-center pointer-events-none z-10 text-gray-400 dark:text-gray-500">
                        {rightIcon}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReactSelect;