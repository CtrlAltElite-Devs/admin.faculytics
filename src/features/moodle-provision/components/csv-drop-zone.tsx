import { useCallback, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CsvDropZoneProps {
  onFileSelect: (file: File | null) => void
  file: File | null
}

export function CsvDropZone({ onFileSelect, file }: CsvDropZoneProps) {
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const dropped = e.dataTransfer.files[0]
      if (dropped?.name.toLowerCase().endsWith('.csv')) {
        onFileSelect(dropped)
      }
    },
    [onFileSelect],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0] ?? null
      onFileSelect(selected)
      e.target.value = ''
    },
    [onFileSelect],
  )

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-border bg-muted/50 px-4 py-3">
        <Upload className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1 text-sm">
          <span className="font-medium">{file.name}</span>
          <span className="ml-2 text-muted-foreground">
            ({(file.size / 1024).toFixed(1)} KB)
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onFileSelect(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <label
      className={`flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed px-6 py-8 text-center transition-colors ${
        dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
      }`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <Upload className="h-8 w-8 text-muted-foreground" />
      <div className="text-sm text-muted-foreground">
        Drop a CSV file here or <span className="text-primary underline">browse</span>
      </div>
      <input
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileInput}
      />
    </label>
  )
}
