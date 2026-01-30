import { useState, ReactNode } from 'react';
import { Vetoclick_COLORS } from '@/constants/colors';
import { PlusIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Input, Button } from '@/components/ui';
import { GenericCard } from '@/components/ui/GenericCard';
import React from 'react';

interface CrudSectionProps<T> {
  items: T[];
  onAdd: () => void;
  renderItem?: (item: T) => React.ReactNode;
  searchPlaceholder?: string;
  filterFn?: (item: T, query: string) => boolean;
  toolbar?: React.ReactNode;
  addButtonLabel?: string;
  avatarField?: keyof T;
  titleField?: keyof T;
  subtitleField?: keyof T;
  createdAtField?: keyof T;
  descField?: keyof T;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  paginationMeta?: {
    current_page: number;
    last_page: number;
  };
  paginationLinks?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  onPageChange?: (page: number) => void;
  onSearch?: (value: string) => void;
  searchValue?: string;
}

export function CrudSection<T>({
  items,
  onAdd,
  renderItem,
  searchPlaceholder = 'Rechercher...',
  filterFn,
  toolbar,
  addButtonLabel = 'Ajouter',
  avatarField,
  titleField,
  subtitleField,
  createdAtField,
  descField,
  onEdit,
  onDelete,
  paginationMeta,
  paginationLinks,
  onPageChange,
  onSearch,
  searchValue,
}: CrudSectionProps<T>) {
  const [query, setQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const searchInputValue = typeof searchValue === 'string' ? searchValue : query;
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearch) {
      onSearch(e.target.value);
    } else {
      setQuery(e.target.value);
    }
  };

  const filteredItems = searchInputValue.trim()
    ? (filterFn
        ? items.filter(item => filterFn(item, searchInputValue))
        : items.filter(item => {
            if (typeof item === 'object' && item !== null) {
              return Object.values(item).some(val =>
                typeof val === 'string' && val.toLowerCase().includes(searchInputValue.toLowerCase())
              );
            }
            return false;
          })
      )
    : items;

  const getDefaultCard = (item: T) => {
    if (!avatarField || !titleField) return null;
    const avatarValue = String(item[avatarField] ?? '').charAt(0).toUpperCase();
    const titleValue = String(item[titleField] ?? '');
    let subtitleValue = subtitleField ? String(item[subtitleField] ?? '') : undefined;
    const descriptionValue = descField ? String(item[descField] ?? '') : undefined;
    if (createdAtField && item[createdAtField]) {
      const date = item[createdAtField];
      subtitleValue = typeof date === 'string' || date instanceof Date
        ? `Créé le : ${new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}`
        : subtitleValue;
    }
    return (
      <GenericCard
        avatarInitial={avatarValue}
        avatarColor={Vetoclick_COLORS.primary}
        avatarTextColor={Vetoclick_COLORS.white}
        title={titleValue}
        subtitle={subtitleValue}
        description={descriptionValue}
        onEdit={onEdit ? () => onEdit(item) : undefined}
        onDelete={onDelete ? () => onDelete(item) : undefined}
      />
    );
  };

  return (
    <div>
      {toolbar || (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <Input
            classNames={{
              root: "max-w-xs rounded-full",
              input: "text-xs-plus h-9",
            }}
            value={searchInputValue || ""}
            onChange={handleInputChange}
            placeholder={searchPlaceholder}
            className=""
            prefix={<MagnifyingGlassIcon className="size-4.5" />}
            suffix={
              searchInputValue ? (
                <Button
                  variant="flat"
                  className="pointer-events-auto size-6 shrink-0 rounded-full p-0"
                  onClick={() => {
                    if (onSearch) {
                      onSearch("");
                    } else {
                      setQuery("");
                    }
                    setShowMobileSearch(false);
                  }}
                >
                  <XMarkIcon className="dark:text-dark-200 size-4.5 text-gray-500" />
                </Button>
              ) : null
            }
          />
          <button
            type="button"
            onClick={onAdd}
            style={{
              backgroundColor: Vetoclick_COLORS.primary,
              color: Vetoclick_COLORS.white,
              height: '2.25rem', // h-9
              padding: '0 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
            className="rounded-full"
          >
            <PlusIcon className="w-5 h-5" />
            {addButtonLabel}
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
        {filteredItems.map((item, idx) => (
          <div key={idx}>
            {renderItem
              ? renderItem(item)
              : getDefaultCard(item)}
          </div>
        ))}
      </div>
      {paginationMeta && paginationMeta.last_page > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            className="px-3 py-1 rounded-full border text-sm disabled:opacity-50"
            onClick={() => onPageChange && onPageChange(paginationMeta.current_page - 1)}
            disabled={paginationMeta.current_page === 1}
            aria-label="Précédent"
          >
            &lt;
          </button>
          {/* Page Numbers with Ellipsis */}
          {(() => {
            const pages = [];
            const total = paginationMeta.last_page;
            const current = paginationMeta.current_page;
            const delta = 2; 
            const left = current - delta;
            const right = current + delta;
            const range = [];
            let l: number | undefined;
            for (let i = 1; i <= total; i++) {
              if (i === 1 || i === total || (i >= left && i <= right)) {
                range.push(i);
              }
            }
            for (const i of range) {
              if (l !== undefined) {
                if (i - l === 2) {
                  pages.push(
                    <button
                      key={l + 1}
                      className={`px-3 py-1 rounded-full border text-sm ${current === l + 1 ? 'bg-primary text-white' : ''}`}
                      style={current === l + 1 ? { backgroundColor: Vetoclick_COLORS.primary, color: Vetoclick_COLORS.white } : {}}
                      onClick={() => onPageChange && onPageChange(l + 1)}
                    >
                      {l + 1}
                    </button>
                  );
                } else if (i - l > 2) {
                  pages.push(<span key={l + 'ellipsis'} className="px-2">...</span>);
                }
              }
              pages.push(
                <button
                  key={i}
                  className={`px-3 py-1 rounded-full border text-sm ${current === i ? 'bg-primary text-white' : ''}`}
                  style={current === i ? { backgroundColor: Vetoclick_COLORS.primary, color: Vetoclick_COLORS.white } : {}}
                  onClick={() => onPageChange && onPageChange(i)}
                  disabled={current === i}
                >
                  {i}
                </button>
              );
              l = i;
            }
            return pages;
          })()}
          {/* Next Arrow */}
          <button
            className="px-3 py-1 rounded-full border text-sm disabled:opacity-50"
            onClick={() => onPageChange && onPageChange(paginationMeta.current_page + 1)}
            disabled={paginationMeta.current_page === paginationMeta.last_page}
            aria-label="Suivant"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
} 