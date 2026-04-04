import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { SelectionForm } from './components/selection-form'
import { PreviewPanel } from './components/preview-panel'
import { CommitResultDialog } from './components/commit-result-dialog'
import { useGeneratePreview } from './use-generate-submissions'
import { cn } from '@/lib/utils'
import type { CommitResult, GeneratePreviewRequest, GeneratePreviewResponse } from '@/types/api'

type ViewState = 'selection' | 'preview'

export function GeneratorPage() {
  const [view, setView] = useState<ViewState>('selection')
  const [previewData, setPreviewData] = useState<GeneratePreviewResponse | null>(null)
  const [previewVersionId, setPreviewVersionId] = useState<string>('')
  const [commitResult, setCommitResult] = useState<CommitResult | null>(null)
  const [resultDialogOpen, setResultDialogOpen] = useState(false)
  const generatePreview = useGeneratePreview()

  useEffect(() => {
    if (!generatePreview.isPending) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [generatePreview.isPending])

  const handleGenerate = (request: GeneratePreviewRequest) => {
    generatePreview.mutate(request, {
      onSuccess: (data) => {
        setPreviewData(data)
        setPreviewVersionId(request.versionId)
        setView('preview')
      },
    })
  }

  const handleBack = () => {
    setPreviewData(null)
    setPreviewVersionId('')
    setView('selection')
  }

  const handleCommitSuccess = (result: CommitResult) => {
    setCommitResult(result)
    setResultDialogOpen(true)
  }

  const handleGenerateMore = () => {
    setPreviewData(null)
    setPreviewVersionId('')
    setCommitResult(null)
    setResultDialogOpen(false)
    setView('selection')
  }

  const handleDone = () => {
    setResultDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Submission Generator</h1>
          <p className="text-sm text-muted-foreground">
            Generate test submissions for analytics testing
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex shrink-0 items-center gap-1.5 pt-1 text-xs">
          <StepDot
            number={1}
            label="Configure"
            active={view === 'selection'}
            done={view === 'preview'}
          />
          <ChevronRight className="size-3 text-muted-foreground/50" />
          <StepDot
            number={2}
            label="Preview & Commit"
            active={view === 'preview'}
            done={false}
          />
        </div>
      </div>

      {view === 'selection' && (
        <SelectionForm
          onGenerate={handleGenerate}
          isGenerating={generatePreview.isPending}
        />
      )}

      {view === 'preview' && previewData && (
        <PreviewPanel
          data={previewData}
          versionId={previewVersionId}
          committed={commitResult !== null}
          onBack={handleBack}
          onCommitSuccess={handleCommitSuccess}
        />
      )}

      <CommitResultDialog
        open={resultDialogOpen}
        result={commitResult}
        metadata={previewData?.metadata ?? null}
        onGenerateMore={handleGenerateMore}
        onDone={handleDone}
      />
    </div>
  )
}

function StepDot({
  number,
  label,
  active,
  done,
}: {
  number: number
  label: string
  active: boolean
  done: boolean
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          'flex size-4 items-center justify-center rounded-full text-[10px] font-bold transition-colors',
          active
            ? 'bg-brand-blue text-white'
            : done
              ? 'bg-brand-blue/20 text-brand-blue'
              : 'bg-muted text-muted-foreground',
        )}
      >
        {number}
      </span>
      <span
        className={cn(
          'transition-colors',
          active ? 'font-medium text-foreground' : 'text-muted-foreground',
        )}
      >
        {label}
      </span>
    </div>
  )
}
