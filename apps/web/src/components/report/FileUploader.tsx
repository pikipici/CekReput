import { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'

interface UploadedFile {
  url: string
  name: string
  mimeType: string
  sizeBytes: number
}

interface FileUploaderProps {
  files: UploadedFile[]
  onChange: (files: UploadedFile[]) => void
  maxFiles?: number
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export default function FileUploader({ files, onChange, maxFiles = 3 }: FileUploaderProps) {
  const { token } = useAuth()
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = async (selectedFiles: File[]) => {
    setError('')
    
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`Maksimal ${maxFiles} file yang diizinkan.`)
      return
    }

    if (!token) {
      setError('Anda harus masuk untuk mengunggah file.')
      return
    }

    setUploading(true)
    const newUploadedFiles: UploadedFile[] = []

    for (const file of selectedFiles) {
      // Validate type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4']
      if (!allowedTypes.includes(file.type)) {
        setError(`Tipe file ${file.name} tidak didukung.`)
        continue
      }
      // Validate size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(`File ${file.name} terlalu besar (Maks 5MB).`)
        continue
      }

      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await fetch(`${API_BASE}/api/upload/evidence`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })
        
        const data = await res.json()
        
        if (!res.ok) {
          setError(data.error || 'Gagal mengunggah file.')
        } else {
          newUploadedFiles.push(data.file)
        }
      } catch (err) {
        setError('Terjadi kesalahan jaringan saat mengunggah.')
      }
    }

    if (newUploadedFiles.length > 0) {
      onChange([...files, ...newUploadedFiles])
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemove = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    onChange(newFiles)
  }

  const formatSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${isDragging ? 'border-primary bg-primary/5' : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          className="hidden" 
          multiple 
          accept=".jpg,.jpeg,.png,.webp,.pdf,.mp4"
        />
        
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <span className="material-symbols-outlined text-3xl">cloud_upload</span>
        </div>
        
        <p className="text-slate-300 font-medium mb-1">Klik atau seret file ke sini untuk mengunggah</p>
        <p className="text-xs text-slate-500">Mendukung JPG, PNG, WEBP, PDF, dan MP4 (Maks. 5MB per file)</p>
      </div>

      {error && (
        <p className="text-danger text-sm flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">error</span> {error}
        </p>
      )}

      {uploading && (
        <p className="text-primary text-sm flex items-center gap-2 animate-pulse">
          <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
          Mengunggah file...
        </p>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">File Terlampir ({files.length}/{maxFiles})</p>
          {files.map((file, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/80 border border-slate-700/50 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="shrink-0 w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-slate-300">
                  <span className="material-symbols-outlined text-xl">
                    {file.mimeType.includes('image') ? 'image' : file.mimeType.includes('video') ? 'movie' : 'description'}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatSize(file.sizeBytes)}</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => handleRemove(i)}
                className="shrink-0 ml-4 p-2 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                title="Hapus lampiran"
              >
                <span className="material-symbols-outlined text-xl">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
