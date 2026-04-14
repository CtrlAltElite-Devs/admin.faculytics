import { useState } from 'react'
import { Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useCampuses } from '@/features/admin/use-admin-filters'
import { useProvisionUser } from './use-provision-user'

const USERNAME_PATTERN = /^local-[a-z0-9][a-z0-9._-]*$/
const NO_CAMPUS_VALUE = '__none__'
const MIN_PASSWORD_LENGTH = 6

export function ProvisionUserForm() {
  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [campusId, setCampusId] = useState<string>(NO_CAMPUS_VALUE)
  const [defaultPasswordDialogOpen, setDefaultPasswordDialogOpen] =
    useState(false)

  const campusesQuery = useCampuses()
  const mutation = useProvisionUser()

  const usernameValid = USERNAME_PATTERN.test(username)
  const passwordsMatch = password === confirmPassword
  const passwordLongEnough =
    password === '' || password.length >= MIN_PASSWORD_LENGTH
  const canSubmit =
    usernameValid &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    passwordsMatch &&
    passwordLongEnough &&
    !mutation.isPending

  const resetForm = () => {
    setUsername('')
    setFirstName('')
    setLastName('')
    setPassword('')
    setConfirmPassword('')
    setCampusId(NO_CAMPUS_VALUE)
  }

  const performSubmit = () => {
    mutation.mutate(
      {
        username,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password: password === '' ? undefined : password,
        campusId: campusId === NO_CAMPUS_VALUE ? undefined : campusId,
      },
      {
        onSuccess: (result) => {
          if (result.defaultPasswordAssigned) {
            toast.success(
              `User ${result.username} created with default password Head123#`,
            )
          } else {
            toast.success(`User ${result.username} created`)
          }
          resetForm()
        },
      },
    )
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return

    if (password === '') {
      setDefaultPasswordDialogOpen(true)
      return
    }
    performSubmit()
  }

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="local-kmartinez"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">
            Must start with &quot;local-&quot; (e.g., local-kmartinez). Only
            lowercase letters, digits, dots, dashes, and underscores.
          </p>
          {username !== '' && !usernameValid && (
            <p className="text-xs text-destructive">
              Username must match{' '}
              <code className="font-mono">
                ^local-[a-z0-9][a-z0-9._-]*$
              </code>
              .
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Leave blank for default (Head123#)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            {!passwordLongEnough && (
              <p className="text-xs text-destructive">
                Password must be at least {MIN_PASSWORD_LENGTH} characters.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            {!passwordsMatch && (
              <p className="text-xs text-destructive">
                Passwords do not match.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="campus">Campus (optional)</Label>
          <Select value={campusId} onValueChange={setCampusId}>
            <SelectTrigger id="campus">
              <SelectValue placeholder="No campus assignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_CAMPUS_VALUE}>
                No campus assignment
              </SelectItem>
              {(campusesQuery.data ?? []).map((campus) => (
                <SelectItem key={campus.id} value={campus.id}>
                  {campus.code}
                  {campus.name ? ` — ${campus.name}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={!canSubmit}>
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )}
            Create user
          </Button>
          {mutation.isError && (
            <p className="text-sm text-destructive">
              Failed to create user. See toast for details.
            </p>
          )}
        </div>
      </form>

      <AlertDialog
        open={defaultPasswordDialogOpen}
        onOpenChange={setDefaultPasswordDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assign default password?</AlertDialogTitle>
            <AlertDialogDescription>
              Default password <code className="font-mono">Head123#</code> will
              be assigned. Please share it with the user securely and prompt
              them to change it on first login. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDefaultPasswordDialogOpen(false)
                performSubmit()
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
