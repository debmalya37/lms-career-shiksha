// app/status/[id]/page.tsx
import dynamic from 'next/dynamic'

// dynamically load the client‐only page; SSR disabled
const StatusClient = dynamic(() => import('./StatusClient'), { ssr: false })

export default function StatusPageWrapper() {
  return <StatusClient />
}
 