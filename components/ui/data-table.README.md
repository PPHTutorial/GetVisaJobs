# DataTable Component

A comprehensive, reusable table component with advanced features for dashboard pages.

## Features

- ✅ **Pagination** - Navigate through large datasets
- ✅ **Sorting** - Click column headers to sort data
- ✅ **Search** - Global search across all columns
- ✅ **Filtering** - Column-specific filters (planned)
- ✅ **Responsive** - Mobile-friendly design
- ✅ **Actions** - Dropdown menus for row actions
- ✅ **Loading States** - Built-in loading indicators
- ✅ **Empty States** - Customizable empty messages
- ✅ **TypeScript** - Full type safety

## Basic Usage

```tsx
import { DataTable, Column, Action } from '@/components/ui/data-table'

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch data
  useEffect(() => {
    fetchUsers()
  }, [])

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (value) => <Badge>{value}</Badge>,
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ]

  const actions: Action<User>[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (user) => router.push(`/users/${user.id}`),
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (user) => router.push(`/users/${user.id}/edit`),
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: handleDelete,
      variant: 'destructive',
    },
  ]

  return (
    <DataTable
      data={users}
      columns={columns}
      actions={actions}
      loading={loading}
      searchPlaceholder="Search users..."
      emptyMessage="No users found"
      pageSize={10}
      defaultSort={{ key: 'createdAt', direction: 'desc' }}
    />
  )
}
```

## Props

### DataTableProps<T>

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | - | Array of data items |
| `columns` | `Column<T>[]` | - | Column definitions |
| `actions` | `Action<T>[]` | `[]` | Row action buttons |
| `loading` | `boolean` | `false` | Show loading state |
| `searchPlaceholder` | `string` | `'Search...'` | Search input placeholder |
| `emptyMessage` | `string` | `'No data found'` | Message when no data |
| `pageSize` | `number` | `10` | Items per page |
| `className` | `string` | - | Additional CSS classes |
| `onRowClick` | `(item: T) => void` | - | Row click handler |
| `defaultSort` | `{key: string, direction: 'asc' \| 'desc'}` | - | Initial sort configuration |

### Column<T>

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `key` | `keyof T \| string` | - | Data key or custom identifier |
| `header` | `string` | - | Column header text |
| `sortable` | `boolean` | `false` | Enable column sorting |
| `filterable` | `boolean` | `false` | Enable column filtering |
| `render` | `(value: any, item: T) => ReactNode` | - | Custom cell renderer |
| `className` | `string` | - | Column CSS classes |
| `hidden` | `boolean` | `false` | Hide column on small screens |

### Action<T>

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Action button text |
| `icon` | `React.ComponentType` | - | Action icon component |
| `onClick` | `(item: T) => void` | - | Action click handler |
| `variant` | `'default' \| 'destructive'` | `'default'` | Button variant |
| `disabled` | `(item: T) => boolean` | - | Disable action condition |

## Advanced Features

### Custom Cell Rendering

```tsx
{
  key: 'status',
  header: 'Status',
  render: (value, item) => (
    <Badge variant={value ? 'success' : 'error'}>
      {value ? 'Active' : 'Inactive'}
    </Badge>
  ),
}
```

### Conditional Actions

```tsx
const actions: Action<User>[] = [
  {
    label: 'Activate',
    icon: UserCheck,
    onClick: (user) => activateUser(user.id),
    disabled: (user) => user.isActive, // Only show for inactive users
  },
  {
    label: 'Deactivate',
    icon: UserX,
    onClick: (user) => deactivateUser(user.id),
    disabled: (user) => !user.isActive, // Only show for active users
  },
]
```

### Responsive Design

Columns can be hidden on smaller screens:

```tsx
{
  key: 'createdAt',
  header: 'Created',
  hidden: true, // Hidden on mobile
}
```

### Row Click Handling

```tsx
<DataTable
  data={items}
  columns={columns}
  onRowClick={(item) => router.push(`/items/${item.id}`)}
/>
```

## Migration Guide

### From Basic Table

Replace your existing table implementation:

```tsx
// Before
<div className="space-y-4">
  <Input placeholder="Search..." />
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map(item => (
        <TableRow key={item.id}>
          <TableCell>{item.name}</TableCell>
          <TableCell>{item.email}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>

// After
<DataTable
  data={data}
  columns={[
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
  ]}
  searchPlaceholder="Search users..."
/>
```

## Examples

See the following implementations:
- `app/dashboard/jobs/components/jobs-table.tsx` - Jobs table
- `app/dashboard/users/components/users-table-new.tsx` - Users table example