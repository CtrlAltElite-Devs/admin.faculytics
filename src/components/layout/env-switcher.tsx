import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEnvStore } from '@/stores/env-store'

export function EnvSwitcher() {
  const environments = useEnvStore((s) => s.environments)
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const setActiveEnv = useEnvStore((s) => s.setActiveEnv)

  if (environments.length === 0) return null

  return (
    <Select value={activeEnvId ?? ''} onValueChange={setActiveEnv}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select environment" />
      </SelectTrigger>
      <SelectContent>
        {environments.map((env) => (
          <SelectItem key={env.id} value={env.id}>
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: env.color }}
              />
              {env.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
