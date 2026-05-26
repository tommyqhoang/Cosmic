import { redirect } from 'next/navigation'

// Character search was merged into the Rankings page. Preserve any existing
// search query and redirect old /characters links to /rankings.
export default async function CharactersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  redirect(q ? `/rankings?q=${encodeURIComponent(q)}` : '/rankings')
}
