import { useState } from 'react'
import { Loader2, Pencil, Save, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  useSentimentConfig,
  useUpdateSentimentConfig,
} from './use-sentiment-config'

export function SentimentConfigCard() {
  const { data, isLoading, isError } = useSentimentConfig()
  const updateConfig = useUpdateSentimentConfig()

  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [model, setModel] = useState('')
  const [enabled, setEnabled] = useState(false)

  const openDialog = () => {
    setUrl(data?.url ?? '')
    setModel(data?.model ?? '')
    setEnabled(Boolean(data?.enabled))
    setOpen(true)
  }

  const isValidUrl = (value: string): boolean => {
    try {
      const parsed = new URL(value)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      return false
    }
  }

  const urlError =
    url.length > 0 && !isValidUrl(url)
      ? 'URL must start with http:// or https://'
      : null
  const enableWithoutUrlError =
    enabled && url.trim().length === 0
      ? 'Provide a URL before enabling vLLM.'
      : null
  const modelError =
    enabled && model.trim().length === 0
      ? 'Provide a model name before enabling vLLM.'
      : null

  const formError = urlError ?? enableWithoutUrlError ?? modelError
  const nothingChanged =
    (data?.url ?? '') === url &&
    (data?.model ?? '') === model &&
    Boolean(data?.enabled) === enabled

  const handleSave = () => {
    if (formError) {
      toast.error(formError)
      return
    }
    updateConfig.mutate(
      { url, model, enabled },
      { onSuccess: () => setOpen(false) },
    )
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Sentiment vLLM Configuration</CardTitle>
          <CardDescription>
            Runtime-rotatable vLLM endpoint used as the primary sentiment
            classifier. Disabled or empty URL routes all traffic to OpenAI.
          </CardDescription>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={openDialog}
          disabled={isLoading || isError}
        >
          <Pencil className="mr-1.5 size-4" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading configuration…
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive">
            Failed to fetch vLLM configuration
          </p>
        )}

        {data && (
          <div className="space-y-2 rounded-md border p-3 text-sm">
            <Row label="Status">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles
                  className={
                    data.enabled
                      ? 'size-3.5 text-primary'
                      : 'size-3.5 text-muted-foreground'
                  }
                />
                <span
                  className={
                    data.enabled
                      ? 'font-semibold text-foreground'
                      : 'text-muted-foreground'
                  }
                >
                  {data.enabled ? 'Enabled' : 'Disabled (OpenAI-only)'}
                </span>
              </span>
            </Row>
            <Row label="URL">
              {data.url ? (
                <code className="text-xs font-mono break-all text-foreground/80">
                  {data.url}
                </code>
              ) : (
                <span className="text-muted-foreground">(not set)</span>
              )}
            </Row>
            <Row label="Model">
              {data.model ? (
                <code className="text-xs font-mono break-all text-foreground/80">
                  {data.model}
                </code>
              ) : (
                <span className="text-muted-foreground">(not set)</span>
              )}
            </Row>
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit vLLM Configuration</DialogTitle>
            <DialogDescription>
              Rotate the vLLM endpoint when the Thunder Compute URL cycles.
              New values apply to the next dispatched pipeline — no redeploy
              required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="vllm-url">vLLM URL</Label>
              <Input
                id="vllm-url"
                type="url"
                placeholder="https://nmn5qf9j-8000.thundercompute.net"
                value={url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setUrl(e.target.value)
                }
              />
              {urlError && (
                <p className="text-xs text-destructive">{urlError}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vllm-model">Model</Label>
              <Input
                id="vllm-model"
                placeholder="unsloth/gemma-4-26B-A4B-it"
                value={model}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setModel(e.target.value)
                }
              />
              {modelError && (
                <p className="text-xs text-destructive">{modelError}</p>
              )}
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label htmlFor="vllm-enabled" className="text-sm font-medium">
                  Enable vLLM-first dispatch
                </Label>
                <p className="text-xs text-muted-foreground">
                  When off, every chunk goes straight to OpenAI.
                </p>
              </div>
              <Switch
                id="vllm-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>
            {enableWithoutUrlError && (
              <p className="text-xs text-destructive">
                {enableWithoutUrlError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                updateConfig.isPending || Boolean(formError) || nothingChanged
              }
            >
              {updateConfig.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-right">{children}</span>
    </div>
  )
}
