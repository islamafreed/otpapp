import RegistrationForm from "@/components/registration-form"
import { Toaster } from "@/components/ui/toaster"
import { AdminAuthProvider } from "@/contexts/admin-auth-context"

export default function Home() {
  return (
    <AdminAuthProvider>
      <RegistrationForm />
      <Toaster />
    </AdminAuthProvider>
  )
}
