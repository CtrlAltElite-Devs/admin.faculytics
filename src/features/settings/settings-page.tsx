import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useEnvStore } from '@/stores/env-store'
import { useAuthStore } from '@/stores/auth-store'
import { ENV_COLORS } from '@/lib/constants'
import type { Environment } from '@/types/api'
import { SentimentConfigCard } from '@/features/sentiment-config/sentiment-config-card'

interface EnvFormData {
  label: string
  baseUrl: string
  color: string
}

const emptyForm: EnvFormData = { label: '', baseUrl: '', color: ENV_COLORS[0] }

export function SettingsPage() {
  const environments = useEnvStore((s) => s.environments)
  const addEnvironment = useEnvStore((s) => s.addEnvironment)
  const updateEnvironment = useEnvStore((s) => s.updateEnvironment)
  const removeEnvironment = useEnvStore((s) => s.removeEnvironment)
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const setActiveEnv = useEnvStore((s) => s.setActiveEnv)
  const clearSession = useAuthStore((s) => s.clearSession)

  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<EnvFormData>(emptyForm)

  const startAdd = () => {
    const nextColor = ENV_COLORS[environments.length % ENV_COLORS.length]
    setForm({ ...emptyForm, color: nextColor })
    setAdding(true)
    setEditingId(null)
  }

  const startEdit = (env: Environment) => {
    setForm({ label: env.label, baseUrl: env.baseUrl, color: env.color })
    setEditingId(env.id)
    setAdding(false)
  }

  const cancel = () => {
    setAdding(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSave = () => {
    if (!form.label.trim() || !form.baseUrl.trim()) return

    // Validate URL protocol — only allow http(s) to prevent javascript: / data: injection
    try {
      const parsed = new URL(form.baseUrl)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        toast.error('Only http and https URLs are allowed')
        return
      }
    } catch {
      toast.error('Invalid URL format')
      return
    }

    if (adding) {
      const id = addEnvironment(form)
      if (!activeEnvId) setActiveEnv(id)
      toast.success(`Added "${form.label}"`)
    } else if (editingId) {
      updateEnvironment(editingId, form)
      clearSession(editingId)
      toast.success(`Updated "${form.label}"`)
    }
    cancel()
  }

  const handleDelete = (env: Environment) => {
    removeEnvironment(env.id)
    clearSession(env.id)
    toast.success(`Removed "${env.label}"`)
  }

  const patch = (field: keyof EnvFormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  return (
    <div className="space-y-6 max-w-2xl dashboard-stagger">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Environments</CardTitle>
            <CardDescription>
              API instances this console can connect to
            </CardDescription>
          </div>
          <Button size="sm" onClick={startAdd} disabled={adding}>
            <Plus className="mr-1.5 size-4" />
            Add
          </Button>
        </CardHeader>

        <CardContent className="space-y-3">
          {environments.map((env) =>
            editingId === env.id ? (
              <EnvForm
                key={env.id}
                form={form}
                onPatch={patch}
                onSave={handleSave}
                onCancel={cancel}
              />
            ) : (
              <div
                key={env.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="size-3 rounded-full shrink-0"
                    style={{ backgroundColor: env.color }}
                  />
                  <div>
                    <p className="text-sm font-medium">{env.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {env.baseUrl}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEdit(env)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(env)}
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ),
          )}

          {adding && (
            <>
              {environments.length > 0 && <Separator />}
              <EnvForm
                form={form}
                onPatch={patch}
                onSave={handleSave}
                onCancel={cancel}
              />
            </>
          )}

          {environments.length === 0 && !adding && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No environments configured. Add one to get started.
            </p>
          )}
        </CardContent>
      </Card>

      <SentimentConfigCard />
    </div>
  )
}

function EnvForm({
  form,
  onPatch,
  onSave,
  onCancel,
}: {
  form: EnvFormData
  onPatch: (field: keyof EnvFormData, value: string) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="rounded-md border p-3 space-y-3 bg-muted/30">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Label</Label>
          <Input
            placeholder="Production"
            value={form.label}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onPatch('label', e.target.value)
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label>API Base URL</Label>
          <Input
            placeholder="https://api.example.com"
            value={form.baseUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onPatch('baseUrl', e.target.value)
            }
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Color</Label>
        <div className="flex gap-2">
          {ENV_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onPatch('color', c)}
              className="size-6 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                borderColor: form.color === c ? 'var(--foreground)' : 'transparent',
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="mr-1 size-3.5" />
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={!form.label.trim() || !form.baseUrl.trim()}
        >
          <Check className="mr-1 size-3.5" />
          Save
        </Button>
      </div>
    </div>
  )
}
