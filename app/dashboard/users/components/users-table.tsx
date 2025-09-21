'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable, Column, Action } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Eye, Edit, Trash2, UserCheck, UserX } from 'lucide-react'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'USER' | 'EMPLOYER' | 'ADMIN'
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  avatar?: string | null
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/dashboard/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        // Fallback to mock data for demonstration
        setUsers([
          {
            id: '1',
            email: 'john.smith@example.com',
            firstName: 'John',
            lastName: 'Smith',
            role: 'USER',
            isActive: true,
            emailVerified: true,
            createdAt: '2024-01-15',
            avatar: null,
          },
          {
            id: '2',
            email: 'sarah.johnson@example.com',
            firstName: 'Sarah',
            lastName: 'Johnson',
            role: 'EMPLOYER',
            isActive: true,
            emailVerified: true,
            createdAt: '2024-01-20',
            avatar: null,
          },
          {
            id: '3',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
            isActive: true,
            emailVerified: true,
            createdAt: '2024-01-01',
            avatar: null,
          },
          {
            id: '4',
            email: 'mike.wilson@example.com',
            firstName: 'Mike',
            lastName: 'Wilson',
            role: 'USER',
            isActive: false,
            emailVerified: false,
            createdAt: '2024-01-25',
            avatar: null,
          },
        ])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      // Fallback to mock data
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (user: User) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/dashboard/users/${user.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setUsers(users.filter(u => u.id !== user.id))
      } else {
        alert('Failed to delete user')
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('Failed to delete user')
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive'
      case 'EMPLOYER':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const columns: Column<User>[] = [
    {
      key: 'firstName',
      header: 'User',
      sortable: true,
      render: (_, user) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || ''} alt={`${user.firstName} ${user.lastName}`} />
            <AvatarFallback>
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.firstName} {user.lastName}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (value) => (
        <Badge variant={getRoleBadgeVariant(value)}>
          {value}
        </Badge>
      ),
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
      key: 'emailVerified',
      header: 'Email Verified',
      sortable: true,
      render: (value) => (
        value ? (
          <UserCheck className="h-4 w-4 text-green-600" />
        ) : (
          <UserX className="h-4 w-4 text-red-600" />
        )
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
      onClick: (user) => router.push(`/dashboard/users/${user.id}`),
    },
    {
      label: 'Edit User',
      icon: Edit,
      onClick: (user) => router.push(`/dashboard/users/${user.id}/edit`),
    },
    {
      label: 'Delete User',
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