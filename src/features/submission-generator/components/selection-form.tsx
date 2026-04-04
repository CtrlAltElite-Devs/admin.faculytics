import { useState } from 'react'
import { AlertTriangle, Loader2, Sparkles, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useFacultyFilter,
  useCoursesFilter,
  useQuestionnaireTypesFilter,
  useVersionsFilter,
  useSubmissionStatus,
} from '../use-generator-filters'
import type { GeneratePreviewRequest } from '@/types/api'

interface SelectionFormProps {
  onGenerate: (request: GeneratePreviewRequest) => void
  isGenerating: boolean
}

export function SelectionForm({ onGenerate, isGenerating }: SelectionFormProps) {
  const [facultyUsername, setFacultyUsername] = useState<string>('')
  const [courseShortname, setCourseShortname] = useState<string>('')
  const [typeId, setTypeId] = useState<string>('')
  const [versionId, setVersionId] = useState<string>('')

  const facultyQuery = useFacultyFilter()
  const coursesQuery = useCoursesFilter(facultyUsername || undefined)
  const typesQuery = useQuestionnaireTypesFilter()
  const versionsQuery = useVersionsFilter(typeId || undefined)
  const statusQuery = useSubmissionStatus(
    versionId || undefined,
    facultyUsername || undefined,
    courseShortname || undefined,
  )

  const status = statusQuery.data
  const noAvailable = status?.availableStudents === 0
  const allFieldsSelected = !!facultyUsername && !!courseShortname && !!typeId && !!versionId

  const handleFacultyChange = (value: string) => {
    setFacultyUsername(value)
    setCourseShortname('')
  }

  const handleTypeChange = (value: string) => {
    setTypeId(value)
    setVersionId('')
  }

  const canGenerate = allFieldsSelected && !isGenerating && !noAvailable

  const handleGenerate = () => {
    onGenerate({ versionId, facultyUsername, courseShortname })
  }

  return (
    <div className="space-y-3">
      <Card className="panel-surface overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Step 1 — Target */}
            <div className="flex-1 p-6">
              <StepHeader
                number={1}
                title="Target Evaluation"
                subtitle="Who is being evaluated?"
              />
              <div className="mt-5 space-y-4">
                <FieldGroup label="Faculty Member">
                  <Select value={facultyUsername} onValueChange={handleFacultyChange}>
                    <SelectTrigger>
                      {facultyQuery.isLoading ? (
                        <LoadingOption label="Loading faculty…" />
                      ) : (
                        <SelectValue placeholder="Select faculty member" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {facultyQuery.data?.map((f) => (
                        <SelectItem key={f.id} value={f.username}>
                          <span>{f.fullName}</span>
                          <span className="ml-1.5 text-xs text-muted-foreground">
                            @{f.username}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldGroup>

                <FieldGroup label="Course">
                  <Select
                    value={courseShortname}
                    onValueChange={setCourseShortname}
                    disabled={!facultyUsername}
                  >
                    <SelectTrigger>
                      {coursesQuery.isLoading && facultyUsername ? (
                        <LoadingOption label="Loading courses…" />
                      ) : (
                        <SelectValue
                          placeholder={
                            facultyUsername ? 'Select course' : 'Select faculty first'
                          }
                        />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {coursesQuery.data?.map((c) => (
                        <SelectItem key={c.id} value={c.shortname}>
                          <span>{c.fullname}</span>
                          <span className="ml-1.5 text-xs text-muted-foreground">
                            ({c.shortname})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldGroup>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px self-stretch bg-border hidden md:block" />
            <Separator className="md:hidden" />

            {/* Step 2 — Instrument */}
            <div className="flex-1 p-6">
              <StepHeader
                number={2}
                title="Questionnaire Instrument"
                subtitle="Which form will be used?"
              />
              <div className="mt-5 space-y-4">
                <FieldGroup label="Questionnaire Type">
                  <Select value={typeId} onValueChange={handleTypeChange}>
                    <SelectTrigger>
                      {typesQuery.isLoading ? (
                        <LoadingOption label="Loading types…" />
                      ) : (
                        <SelectValue placeholder="Select questionnaire type" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {typesQuery.data?.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldGroup>

                <FieldGroup label="Version">
                  <Select value={versionId} onValueChange={setVersionId} disabled={!typeId}>
                    <SelectTrigger>
                      {versionsQuery.isLoading && typeId ? (
                        <LoadingOption label="Loading versions…" />
                      ) : (
                        <SelectValue
                          placeholder={typeId ? 'Select version' : 'Select type first'}
                        />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {versionsQuery.data?.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          <span className="font-mono">v{v.versionNumber}</span>
                          {v.isActive && (
                            <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                              · active
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldGroup>
              </div>
            </div>
          </div>

          {/* Availability strip — revealed when all 4 fields selected */}
          {allFieldsSelected && (
            <div className="animate-in fade-in slide-in-from-bottom-1 duration-200 border-t">
              {statusQuery.isLoading ? (
                <div className="flex items-center gap-2 bg-muted/30 px-6 py-3 text-sm text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Checking submission status…
                </div>
              ) : status ? (
                noAvailable ? (
                  <div className="flex items-center gap-3 bg-amber-50 px-6 py-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>
                      <span className="font-medium">Nothing to generate.</span>{' '}
                      All {status.totalEnrolled} enrolled students have already submitted.
                    </span>
                  </div>
                ) : (
                  <div
                    className={`flex items-center gap-6 px-6 py-3 ${
                      status.alreadySubmitted > 0
                        ? 'bg-amber-50/60 dark:bg-amber-950/20'
                        : 'bg-muted/20'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <Users className="size-3.5" />
                      Availability
                    </div>
                    <div className="flex gap-6">
                      <AvailabilityStat label="Enrolled" value={status.totalEnrolled} />
                      <AvailabilityStat
                        label="Submitted"
                        value={status.alreadySubmitted}
                        variant={status.alreadySubmitted > 0 ? 'warning' : 'neutral'}
                      />
                      <AvailabilityStat
                        label="Will Generate"
                        value={status.availableStudents}
                        variant="highlight"
                      />
                    </div>
                    {status.alreadySubmitted > 0 && (
                      <div className="ml-auto flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="size-3" />
                        Partial coverage
                      </div>
                    )}
                  </div>
                )
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className="h-11 w-full bg-brand-blue text-white hover:bg-brand-blue/90 disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Generating preview…
          </>
        ) : (
          <>
            <Sparkles className="mr-2 size-4" />
            Generate Preview
            {status && status.availableStudents > 0 && (
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
                {status.availableStudents} students
              </span>
            )}
          </>
        )}
      </Button>
    </div>
  )
}

function StepHeader({
  number,
  title,
  subtitle,
}: {
  number: number
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-xs font-bold text-brand-blue ring-1 ring-brand-blue/20">
        {number}
      </span>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  )
}

function LoadingOption({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="size-3.5 animate-spin" />
      {label}
    </span>
  )
}

function AvailabilityStat({
  label,
  value,
  variant = 'neutral',
}: {
  label: string
  value: number
  variant?: 'neutral' | 'warning' | 'highlight'
}) {
  return (
    <div className="flex flex-col">
      <span
        className={`text-base font-semibold tabular-nums leading-tight ${
          variant === 'highlight'
            ? 'text-brand-blue'
            : variant === 'warning'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-foreground'
        }`}
      >
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
