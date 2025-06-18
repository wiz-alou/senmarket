import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverProps {
  threshold?: number
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0%',
  freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}): [
  (node?: Element | null) => void,
  boolean,
  IntersectionObserverEntry | undefined
] {
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const [isVisible, setIsVisible] = useState(false)

  const frozen = freezeOnceVisible && isVisible

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry)
    setIsVisible(entry.isIntersecting)
  }

  const nodeRef = useRef<Element | null>(null)

  const setNodeRef = (node: Element | null) => {
    nodeRef.current = node
  }

  useEffect(() => {
    const node = nodeRef.current // DOM Ref
    const hasIOSupport = !!window.IntersectionObserver

    if (!hasIOSupport || frozen || !node) return

    const observerParams = { threshold, root, rootMargin }
    const observer = new IntersectionObserver(updateEntry, observerParams)

    observer.observe(node)

    return () => observer.disconnect()
  }, [threshold, root, rootMargin, frozen])

  return [setNodeRef, isVisible, entry]
}
