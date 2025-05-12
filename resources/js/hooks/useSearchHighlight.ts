export function useSearchHighlight() {
    const highlightAnimationStyle = `
    @keyframes highlightPulse {
      0% { opacity: 0.8; }
      50% { opacity: 1; }
      100% { opacity: 0.8; }
    }

    .highlight-animation {
      animation: highlightPulse 2s ease-in-out 1;
      display: inline;
      white-space: nowrap;
      vertical-align: baseline;
    }

    mark {
      box-decoration-break: clone;
      -webkit-box-decoration-break: clone;
    }
  `;

    const highlightSearchTerm = (text: string, searchTerm: string) => {
        if (!searchTerm || searchTerm.trim() === '' || !text) return text;

        try {
            const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');

            return text.replace(
                regex,
                '<mark class="bg-yellow-200 dark:bg-amber-700 text-black dark:text-white highlight-animation" style="padding: 0; margin: 0; border-radius: 2px;">$1</mark>',
            );
        } catch {
            return text;
        }
    };

    return {
        highlightSearchTerm,
        highlightAnimationStyle,
    };
}
