import { api, ApiError } from './api.js'

export const PAGE_SIZE = 20
const MAX_OFFSET = 960

// Search is title-only. Prefixed searches ("author: ...", "books by ...") and ISBNs are
// recognised up front so the UI can ask for a title instead. The Edge Function repeats
// this check, catches plain author names, and flags searches that match no title.
export function isNonTitleQuery(query) {
  const q = query.trim()
  if (/^(isbn|author|inauthor|by|subject|keywords?|genre|publisher|inpublisher|lccn|oclc)\s*:/i.test(q)) return true
  if (/^((books?|novels?)\s+(written\s+)?|written\s+)by\s+\S/i.test(q)) return true
  const compact = q.replace(/[\s-]/g, '')
  return /^(isbn(1[03])?:?)?(\d{13}|\d{9}[\dxX])$/i.test(compact)
}

// Fill gaps (missing authors, synopsis, page count, year) so components can render any book.
function normalizeBook(b) {
  return {
    ...b,
    title: b.title || 'Untitled',
    authors: Array.isArray(b.authors) && b.authors.length ? b.authors : ['Unknown author'],
    synopsis: b.synopsis || 'No description available.',
    pageCount: Number.isFinite(b.pageCount) && b.pageCount > 0 ? b.pageCount : null,
    publishedYear: b.publishedYear || null,
    genre: b.genre ?? null,
  }
}

/**
 * Resolves one page of results from the books API.
 * `hint: 'title-only'` means the input looked like an author, ISBN or keyword.
 * `count` is the raw number of items returned (use it to advance `offset`);
 * `hasMore` is false once a short page comes back or the API's offset cap is reached.
 * Dev-only `fail` forces the error state.
 */
export async function fetchBooks({ genre, query, offset = 0, limit = PAGE_SIZE, fail = false }) {
  if (fail) throw new Error('The book catalogue could not be reached.')

  if (!genre && isNonTitleQuery(query ?? '')) {
    return { items: [], total: 0, hint: 'title-only', count: 0, hasMore: false }
  }

  const data = await api('/books', {
    params: genre ? { genre, offset, limit } : { query: (query ?? '').trim(), offset, limit },
  })
  const items = (data.items ?? []).map(normalizeBook)
  // Title searches drop non-title matches server-side, so page by what Google scanned.
  const scanned = Number.isInteger(data.scanned) ? data.scanned : items.length
  const hasMore = scanned >= limit && offset + scanned <= MAX_OFFSET
  return {
    items,
    total: hasMore ? Math.max(data.total ?? 0, offset + items.length + 1) : offset + items.length,
    hint: data.hint === 'title-only' ? 'title-only' : null,
    count: scanned,
    hasMore,
  }
}

/** Resolve one book by id, or null when it doesn't exist. */
export async function fetchBook(id, { fail = false } = {}) {
  if (fail) throw new Error('The book catalogue could not be reached.')
  try {
    const data = await api(`/books/${encodeURIComponent(id)}`)
    return data.book ? normalizeBook(data.book) : null
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

/**
 * Resolve many books in as few calls as possible (chunks of 40).
 * Returns { books, missing }: `missing` lists ids that failed or weren't found.
 * Rejects only when a whole call fails, e.g. the server can't be reached.
 */
export async function fetchBooksByIds(ids) {
  const unique = [...new Set(ids)]
  const chunks = []
  for (let i = 0; i < unique.length; i += 40) chunks.push(unique.slice(i, i + 40))
  const results = await Promise.all(chunks.map((chunk) => api('/books', { params: { ids: chunk.join(',') } })))
  return {
    books: results.flatMap((r) => (r.items ?? []).map(normalizeBook)),
    missing: results.flatMap((r) => r.missing ?? []),
  }
}
