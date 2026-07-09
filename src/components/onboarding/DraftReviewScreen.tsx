import { useEffect } from 'react';
import { useAppState } from '../../hooks/useAppState';
import { streamDraft } from '../../lib/streamDraft';
import { ProjectTreeEditor } from './ProjectTreeEditor';
import styles from './DraftReviewScreen.module.css';

export function DraftReviewScreen() {
  const { state, dispatch, confirmDraft } = useAppState();
  const { visibleDraft, isStreaming, inputText } = state;

  useEffect(() => {
    let cancelled = false;

    async function runStream() {
      for await (const event of streamDraft(inputText)) {
        if (cancelled) return;
        dispatch({ type: 'APPEND_STREAMED_ITEM', payload: event });
        if (event.type === 'complete') {
          dispatch({ type: 'FINISH_STREAMING', payload: event.data });
        }
      }
    }

    runStream();
    return () => {
      cancelled = true;
    };
  }, [inputText, dispatch]);

  const draft = visibleDraft ?? {
    projects: [],
    suggestedFirstTask: { project: '', task: '', reason: '' },
  };

  const hasContent = draft.projects.length > 0;

  return (
    <div className={styles.container}>
      <div className={styles.scrollArea}>
        <div className={styles.inner}>
          <h1 className={styles.headline}>Review your setup</h1>

          {isStreaming && (
            <p className={styles.streamingHint}>
              <span className={styles.dot} />
              Building your projects and tasks...
            </p>
          )}

          {hasContent && (
            <ProjectTreeEditor
              draft={draft}
              onChange={(updated) => dispatch({ type: 'UPDATE_DRAFT', payload: updated })}
              isStreaming={isStreaming}
              onConfirm={confirmDraft}
              confirmDisabled={isStreaming || !state.draft}
            />
          )}
        </div>
      </div>
    </div>
  );
}
