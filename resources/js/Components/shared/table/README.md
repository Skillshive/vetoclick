# DataTable Component

A flexible, reusable data table component built with TanStack Table that supports extensive customization through slots.

## Features

- ✅ Generic TypeScript support for any data type
- ✅ Sorting, filtering, and pagination
- ✅ Row selection with bulk actions
- ✅ Fullscreen mode
- ✅ Customizable slots for toolbar, header, footer, empty state, and bulk actions
- ✅ Responsive design
- ✅ Accessibility support

## Basic Usage

```tsx
import { DataTable } from '@/components/shared/table/DataTable';

<DataTable<User>
  data={users}
  columns={userColumns}
  pagination={pagination}
  sorting={sorting}
  onSortingChange={setSorting}
  globalFilter={globalFilter}
  onGlobalFilterChange={setGlobalFilter}
  tableSettings={tableSettings}
/>
```

## Advanced Usage with Slots

```tsx
<DataTable<User>
  data={users}
  columns={userColumns}
  pagination={pagination}
  sorting={sorting}
  onSortingChange={setSorting}
  globalFilter={globalFilter}
  onGlobalFilterChange={setGlobalFilter}
  tableSettings={tableSettings}
  enableRowSelection={true}
  bulkActions={{
    onDelete: handleBulkDelete,
    deleteLabel: 'Delete Selected'
  }}
  slots={{
    toolbar: (table) => (
      <CustomToolbar
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
    ),
    header: (table) => (
      <CustomHeader title="Users Management" />
    ),
    empty: (table) => (
      <CustomEmptyState
        message="No users found"
        action={<AddUserButton />}
      />
    ),
    bulkActions: (table) => (
      <CustomBulkActions
        table={table}
        onDelete={handleBulkDelete}
        onExport={handleExport}
      />
    ),
    footer: (table) => (
      <CustomFooter
        table={table}
        total={pagination.total}
      />
    )
  }}
/>
```

## Reusable Toolbar Components

The package includes several reusable components for building toolbars:

### SearchInput

```tsx
import { SearchInput } from '@/components/shared/table';

<SearchInput
  value={globalFilter}
  onChange={setGlobalFilter}
  placeholder="Search users..."
/>
```

### ExportButton

```tsx
import { ExportButton } from '@/components/shared/table';

<ExportButton
  onExport={() => exportToCSV()}
  label="Export to CSV"
/>
```

### CreateButton

```tsx
import { CreateButton } from '@/components/shared/table';

<CreateButton
  onClick={() => openCreateModal()}
  label="Add User"
/>
```

### TableSettingsButton

```tsx
import { TableSettingsButton } from '@/components/shared/table';

<TableSettingsButton table={table} />
```

### Complete Toolbar Example

```tsx
import {
  SearchInput,
  ExportButton,
  CreateButton,
  TableSettingsButton
} from '@/components/shared/table';

const CustomToolbar = ({ table, globalFilter, setGlobalFilter }) => (
  <div className="flex justify-between gap-4">
    <div className="flex gap-2">
      <SearchInput
        value={globalFilter}
        onChange={setGlobalFilter}
        placeholder="Search..."
      />
    </div>
    <div className="flex gap-2">
      <ExportButton onExport={handleExport} />
      <CreateButton onClick={handleCreate} />
      <TableSettingsButton table={table} />
    </div>
  </div>
);
```

## Props

### Required Props

- `data: TData[]` - Array of data to display
- `columns: ColumnDef<TData>[]` - Column definitions
- `pagination` - Pagination configuration
- `sorting: SortingState` - Current sorting state
- `onSortingChange` - Sorting change handler
- `globalFilter: string` - Current filter value
- `onGlobalFilterChange` - Filter change handler
- `tableSettings: TableSettings` - Table configuration

### Optional Props

- `enableRowSelection?: boolean` - Enable row selection
- `onRowSelectionChange?` - Row selection change handler
- `bulkActions?` - Bulk action configuration
- `noDataMessage?: string` - Custom no data message
- `className?: string` - Additional CSS classes
- `slots?: DataTableSlots<TData>` - Custom slot components

## Slots

The DataTable supports the following customizable slots:

### `toolbar`
Renders above the table, typically contains search, filters, and action buttons.

### `header`
Renders between toolbar and table, useful for page titles or breadcrumbs.

### `empty`
Renders when there's no data, replaces the default empty state.

### `bulkActions`
Renders when rows are selected, replaces the default bulk actions UI.

### `footer`
Renders below the table, can replace or supplement the default pagination.

## Migration from renderToolbar

The `renderToolbar` prop is still supported for backward compatibility, but using `slots.toolbar` is recommended for new implementations.

```tsx
// Old way (still works)
<DataTable renderToolbar={(table) => <Toolbar table={table} />} />

// New way (recommended)
<DataTable slots={{ toolbar: (table) => <Toolbar table={table} /> }} />
```

## TypeScript Support

The component is fully typed with generics:

```tsx
interface User {
  id: number;
  name: string;
  email: string;
}

const MyComponent = () => {
  const [data, setData] = useState<User[]>([]);

  return (
    <DataTable<User>
      data={data}
      // ... other props
    />
  );
};
```

## Examples

See the CategoryBlogs implementation for a complete example of how to use all features.