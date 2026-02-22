import { useEffect, useMemo, useRef, useState } from 'react'

import { FqIcon } from '@/shared/ui/primitives/FqIcon'
import type { FqBaseProps } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

type FqFileUploadProps = FqBaseProps & {
  label?: string
  helperText?: string
  errorMessage?: string
  accept?: string
  multiple?: boolean
  maxFiles?: number
  isDisabled?: boolean
  onFilesChange?: (files: File[]) => void
}

type PreviewItem = {
  file: File
  url: string
}

export function FqFileUpload({
  label,
  helperText,
  errorMessage,
  accept,
  multiple = true,
  maxFiles = 6,
  isDisabled = false,
  onFilesChange,
  className,
  
  testId,
}: FqFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])

  const previews = useMemo<PreviewItem[]>(() => {
    return files.map((file) => ({ file, url: URL.createObjectURL(file) }))
  }, [files])

  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        URL.revokeObjectURL(preview.url)
      })
    }
  }, [previews])

  const applyFiles = (nextFiles: FileList | null) => {
    if (!nextFiles) {
      return
    }

    const sliced = Array.from(nextFiles).slice(0, maxFiles)
    setFiles(sliced)
    onFilesChange?.(sliced)
  }

  return (
    <div className={cx('flex w-full flex-col gap-2', className)} data-testid={testId}>
      {label ? <span className="text-sm font-medium text-zinc-700">{label}</span> : null}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault()
          if (isDisabled) {
            return
          }
          setIsDragging(true)
        }}
        onDragOver={(event) => {
          event.preventDefault()
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          setIsDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          if (isDisabled) {
            return
          }
          applyFiles(event.dataTransfer.files)
        }}
        className={cx(
          'flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-zinc-600 transition',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          isDragging ? 'border-blue-500 bg-blue-50 text-blue-700' : null,
          isDisabled ? 'cursor-not-allowed opacity-60' : null,
          errorMessage ? 'border-rose-500 text-rose-600' : null,
        )}
        disabled={isDisabled}
      >
        <FqIcon name="upload" size={18} />
        <span className="text-sm font-medium">
          Solte arquivos aqui ou clique para selecionar
        </span>
        <span className="text-xs">Até {maxFiles} arquivos</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event) => {
          applyFiles(event.target.files)
        }}
        disabled={isDisabled}
      />
      {previews.length ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {previews.map((preview) => (
            <figure
              key={`${preview.file.name}-${preview.file.lastModified}`}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
            >
              {preview.file.type.startsWith('image/') ? (
                <img
                  src={preview.url}
                  alt={preview.file.name}
                  className="h-24 w-full object-cover"
                />
              ) : (
                <div className="flex h-24 items-center justify-center">
                  <FqIcon name="file" size={22} className="text-zinc-500" />
                </div>
              )}
              <figcaption className="truncate px-2 py-1 text-xs text-zinc-600">
                {preview.file.name}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}
      {errorMessage ? (
        <span className="text-xs text-rose-600">{errorMessage}</span>
      ) : helperText ? (
        <span className="text-xs text-zinc-500">{helperText}</span>
      ) : null}
    </div>
  )
}
