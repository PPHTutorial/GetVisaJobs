'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DataTable, Column, Action } from '@/components/ui/data-table'
import { FileText, Upload, Download, Trash2, Eye, File, Image as ImageIcon, Video, Archive } from 'lucide-react'
import toast from 'react-hot-toast'

interface FileItem {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  fileType: 'IMAGE' | 'DOCUMENT' | 'VIDEO'
  uploadedBy: string
  isPublic: boolean
  createdAt: string
  uploader: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const fetchFiles = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/files')
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files)
      }
    } catch (_error) {
      toast.error('Failed to fetch files')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        e.target.value = ''
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch('/api/dashboard/files', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        toast.success('File uploaded successfully')
        setIsUploadDialogOpen(false)
        setSelectedFile(null)
        setUploadProgress(0)
        fetchFiles()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to upload file')
      }
    } catch (_error) {
      toast.error('Failed to upload file')
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/dashboard/files/${fileId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('File deleted successfully')
        fetchFiles()
      } else {
        toast.error('Failed to delete file')
      }
    } catch (_error) {
      toast.error('Failed to delete file')
    }
  }

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
    if (fileType.startsWith('video/')) return <Video className="h-4 w-4" />
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return <Archive className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const imageCount = files.filter(file => file.fileType.startsWith('image/')).length
  const documentCount = files.filter(file => file.fileType.startsWith('application/')).length

  const columns: Column<FileItem>[] = [
    {
      key: 'filename',
      header: 'File',
      render: (_, file) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {file.fileType === 'IMAGE' && <ImageIcon className="h-8 w-8 text-blue-500" />}
            {file.fileType === 'VIDEO' && <Video className="h-8 w-8 text-red-500" />}
            {file.fileType === 'DOCUMENT' && <File className="h-8 w-8 text-green-500" />}
          </div>
          <div>
            <div className="font-medium max-w-xs truncate">{file.originalName}</div>
            <div className="text-sm text-muted-foreground">{file.filename}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'fileType',
      header: 'Type',
      render: (_, file) => (
        <Badge variant="secondary">
          {file.fileType}
        </Badge>
      ),
    },
    {
      key: 'size',
      header: 'Size',
      render: (_, file) => (
        <div className="text-sm">
          {formatFileSize(file.size)}
        </div>
      ),
    },
    {
      key: 'uploader',
      header: 'Uploaded By',
      render: (_, file) => (
        <div className="text-sm">
          <div className="font-medium">
            {file.uploader.firstName} {file.uploader.lastName}
          </div>
          <div className="text-muted-foreground">
            {file.uploader.email}
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Upload Date',
      render: (_, file) => (
        <div className="text-sm">
          {new Date(file.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'isPublic',
      header: 'Visibility',
      render: (_, file) => (
        <Badge variant={file.isPublic ? "default" : "secondary"}>
          {file.isPublic ? "Public" : "Private"}
        </Badge>
      ),
    },
  ]

  const actions: Action<FileItem>[] = [
    {
      label: 'View',
      icon: Eye,
      onClick: (file) => window.open(file.url, '_blank'),
    },
    {
      label: 'Download',
      icon: Download,
      onClick: (file) => {
        const link = document.createElement('a')
        link.href = file.url
        link.download = file.originalName
        link.click()
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: (file) => handleDeleteFile(file.id),
      variant: 'destructive',
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
          <h1 className="text-3xl font-bold">File Management</h1>
          <p className="text-muted-foreground">Upload, manage, and organize files for your platform</p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload New File</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar,.7z"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Supported formats: Images, videos, audio, documents (PDF, DOC, DOCX, TXT), archives (ZIP, RAR, 7Z). Max size: 10MB
                </p>
              </div>

              {selectedFile && (
                <div className="space-y-2">
                  <Label>File Details</Label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(selectedFile.type)}
                      <span className="font-medium">{selectedFile.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Size: {formatFileSize(selectedFile.size)} | Type: {selectedFile.type}
                    </div>
                  </div>
                </div>
              )}

              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <Label>Upload Progress</Label>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-center">{uploadProgress}%</p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!selectedFile}>
                  Upload File
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Images</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{imageCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <File className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Files</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={files}
            columns={columns}
            actions={actions}
            searchPlaceholder="Search files..."
          />
        </CardContent>
      </Card>
    </div>
  )
}