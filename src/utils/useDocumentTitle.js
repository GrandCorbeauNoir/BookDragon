import { useEffect } from 'react'

// Gives every route its own tab title so screen readers announce where you are.
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · BookDragon` : 'BookDragon'
  }, [title])
}
