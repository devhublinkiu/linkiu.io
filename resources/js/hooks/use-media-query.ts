import { useState, useEffect } from "react"

function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState<boolean>(
        () => typeof window !== "undefined" && window.matchMedia(query).matches
    )

    useEffect(() => {
        if (typeof window === "undefined") return
        const mediaQuery = window.matchMedia(query)
        const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
        mediaQuery.addEventListener("change", handler)
        return () => mediaQuery.removeEventListener("change", handler)
    }, [query])

    return matches
}

export { useMediaQuery }
