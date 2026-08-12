import { router } from '@inertiajs/react';
import { useEffect } from 'react';

const MESSAGE = 'You have unsaved changes. Leave this page and lose them?';

let bypassNextVisit = false;

/**
 * Let the next Inertia visit through without prompting. Call this right before
 * saving, so a form's own submit is not mistaken for navigating away.
 */
export function allowNextVisit(): void {
    bypassNextVisit = true;
}

/**
 * Warns before losing unsaved edits, covering both ways out of a page:
 * closing or reloading the tab, and navigating within the SPA.
 */
export function useUnsavedChanges(enabled: boolean): void {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        // Browsers ignore custom text here and show their own wording, but
        // preventDefault is still what triggers the prompt.
        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', onBeforeUnload);

        const stopListening = router.on('before', (event) => {
            if (bypassNextVisit) {
                bypassNextVisit = false;

                return;
            }

            if (!window.confirm(MESSAGE)) {
                event.preventDefault();
            }
        });

        return () => {
            window.removeEventListener('beforeunload', onBeforeUnload);
            stopListening();
        };
    }, [enabled]);
}
