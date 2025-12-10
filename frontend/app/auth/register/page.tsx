import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
      <Header />
      <main className="flex-1 container py-12 md:py-20">
        <RegisterForm />
      </main>
      <Footer />
    </div>
  );
}


