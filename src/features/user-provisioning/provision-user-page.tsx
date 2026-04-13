import { ProvisionUserForm } from './provision-user-form'

export function ProvisionUserPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Provision User
        </h1>
        <p className="text-sm text-muted-foreground">
          Create a Faculytics-local user that authenticates with a bcrypt
          password (no Moodle account required). Usernames must start with the
          reserved <code className="font-mono">local-</code> prefix.
        </p>
      </header>

      <ProvisionUserForm />
    </div>
  )
}
