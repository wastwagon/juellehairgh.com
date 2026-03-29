import { redirect } from "next/navigation";

function pickRedirect(raw: string | string[] | undefined): string | undefined {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw) && raw[0]) return raw[0];
  return undefined;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string | string[] };
}) {
  const redirectParam = pickRedirect(searchParams.redirect);

  if (redirectParam) {
    redirect(`/auth/login?redirect=${encodeURIComponent(redirectParam)}`);
  }
  redirect("/auth/login");
}
