'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { Building2, Plus, Edit2 as Edit, Trash2, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { DataTable, Column, Action } from '@/components/ui/data-table'

interface Employer {
    id: string
    userId: string
    companyName: string
    companySize: string | null
    industry: string | null
    website: string | null
    description: string | null
    logo: string | null
    address: string | null
    verified: boolean
    createdAt: Date
    updatedAt: Date
    user: {
        id: string
        firstName: string
        lastName: string
        email: string
    }
    jobsCount: number

}

export default function EmployersPage() {
    const [employers, setEmployers] = useState<Employer[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [editingEmployer, setEditingEmployer] = useState<Employer | null>(null)
    const [formData, setFormData] = useState({
        companyName: '',
        companySize: '',
        industry: '',
        website: '',
        description: '',
        logo: '',
        address: '',
        verified: false,
    })

    const fetchEmployers = useCallback(async () => {
        try {
            const response = await fetch('/api/dashboard/employers')
            if (response.ok) {
                const data = await response.json()
                setEmployers(data.employers)
            }
        } catch (_error) {
            toast.error('Failed to fetch employers')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchEmployers()
    }, [fetchEmployers])

    const handleCreateEmployer = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await fetch('/api/dashboard/employers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                toast.success('Employer created successfully')
                setIsCreateDialogOpen(false)
                setFormData({
                    companyName: '',
                    companySize: '',
                    industry: '',
                    website: '',
                    description: '',
                    logo: '',
                    address: '',
                    verified: false,
                })
                fetchEmployers()
            } else {
                const error = await response.json()
                toast.error(error.error || 'Failed to create employer')
            }
        } catch (_error) {
            toast.error('Failed to create employer')
        }
    }

    const handleUpdateEmployer = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingEmployer) return

        try {
            const response = await fetch(`/api/dashboard/employers/${editingEmployer.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                toast.success('Employer updated successfully')
                setEditingEmployer(null)
                setFormData({
                    companyName: '',
                    companySize: '',
                    industry: '',
                    website: '',
                    description: '',
                    logo: '',
                    address: '',
                    verified: false,
                })
                fetchEmployers()
            } else {
                const error = await response.json()
                toast.error(error.error || 'Failed to update employer')
            }
        } catch (_error) {
            toast.error('Failed to update employer')
        }
    }

    const handleDeleteEmployer = async (employerId: string) => {
        if (!confirm('Are you sure you want to delete this employer? This action cannot be undone.')) return

        try {
            const response = await fetch(`/api/dashboard/employers/${employerId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                toast.success('Employer deleted successfully')
                fetchEmployers()
            } else {
                toast.error('Failed to delete employer')
            }
        } catch (_error) {
            toast.error('Failed to delete employer')
        }
    }

    const openEditDialog = (employer: Employer) => {
        setEditingEmployer(employer)
        setFormData({
            companyName: employer.companyName,
            companySize: employer.companySize || '',
            industry: employer.industry || '',
            website: employer.website || '',
            description: employer.description || '',
            logo: employer.logo || '',
            address: employer.address || '',
            verified: employer.verified,
        })
    }

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }

    const columns: Column<Employer>[] = [
        {
            key: 'company',
            header: 'Company',
            render: (_, employer) => (
                <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={employer.logo || undefined} alt={employer.companyName} />
                        <AvatarFallback>
                            {getInitials(employer.user.firstName, employer.user.lastName)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{employer.companyName}</div>
                        <div className="text-sm text-muted-foreground">
                            {employer.industry || 'No industry specified'}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'contact',
            header: 'Contact',
            render: (_, employer) => (
                <div className="flex items-center text-sm">
                    <Mail className="h-3 w-3 mr-1" />
                    {employer.user.email}
                </div>
            ),
        },
        {
            key: 'location',
            header: 'Location',
            render: (_, employer) => (
                <div className="text-sm">
                    {employer.address || 'Not specified'}
                </div>
            ),
        },
        {
            key: 'companySize',
            header: 'Size',
            render: (_, employer) => (
                <div className="text-sm">
                    {employer.companySize}
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (_, employer) => (
                <Badge variant={employer.verified ? "default" : "secondary"}>
                    {employer.verified ? "Verified" : "Unverified"}
                </Badge>
            ),
        },
    ]

    const actions: Action<Employer>[] = [
        {
            label: 'Edit',
            icon: Edit,
            onClick: (employer) => openEditDialog(employer),
        },
        {
            label: 'Delete',
            icon: Trash2,
            onClick: (employer) => handleDeleteEmployer(employer.id),
            variant: 'destructive',
            disabled: (employer) => employer.jobsCount > 0,
        },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Employers Management</h1>
                    <p className="text-muted-foreground">Manage employer accounts and company information</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Employer
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add New Employer</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateEmployer} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Company Name *</Label>
                                    <Input
                                        id="companyName"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="industry">Industry</Label>
                                    <Input
                                        id="industry"
                                        value={formData.industry}
                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Company Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        placeholder="https://company.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="logo">Logo URL</Label>
                                    <Input
                                        id="logo"
                                        type="url"
                                        value={formData.logo}
                                        onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                        placeholder="https://company.com/logo.png"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="companySize">Company Size</Label>
                                    <Input
                                        id="companySize"
                                        value={formData.companySize}
                                        onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                                        placeholder="1-10, 11-50, etc."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="London, UK"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="verified"
                                    checked={formData.verified}
                                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                                    className="rounded accent-accent"
                                />
                                <Label htmlFor="verified">Verified</Label>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Create Employer</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employers</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{employers.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Verified Employers</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {employers.filter(emp => emp.verified).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Employers</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={employers}
                        columns={columns}
                        actions={actions}
                        searchPlaceholder="Search employers..."
                        emptyMessage="No employers found"
                    />
                </CardContent>
            </Card>

            {/* Edit Employer Dialog */}
            <Dialog open={!!editingEmployer} onOpenChange={() => setEditingEmployer(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Employer</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateEmployer} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-companyName">Company Name *</Label>
                                <Input
                                    id="edit-companyName"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-industry">Industry</Label>
                                <Input
                                    id="edit-industry"
                                    value={formData.industry}
                                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Company Description</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-website">Website</Label>
                                <Input
                                    id="edit-website"
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="https://company.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-logo">Logo URL</Label>
                                <Input
                                    id="edit-logo"
                                    type="url"
                                    value={formData.logo}
                                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                    placeholder="https://company.com/logo.png"
                                />
                            </div>
                        </div>



                        <div className="space-y-2">
                            <Label htmlFor="edit-address">Location</Label>
                            <Input
                                id="edit-address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="London, UK"
                            />
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="edit-verified"
                                    checked={formData.verified}
                                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                                    className="rounded"
                                />
                                <Label htmlFor="edit-verified">Verified</Label>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setEditingEmployer(null)}>
                                Cancel
                            </Button>
                            <Button type="submit">Update Employer</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}