import { useRef, useEffect } from 'react';
import { useAppState } from '../../hooks/useAppState';
import { useTypingPlaceholder } from '../../hooks/useTypingPlaceholder';
import styles from './InputScreen.module.css';

const EXAMPLE_PROMPTS = [
  {
    icon: '🎨',
    text: "Freelance designer — Acme homepage redesign due Friday, Harlow logo revision",
  },
  {
    icon: '⚙️',
    text: 'Contractor at Northwind, doing API code reviews and a database migration through Q3',
  },
  {
    icon: '📊',
    text: 'Marketing consultant — monthly reporting for Delta, plus a new SEO audit this week',
  },
];

const PLACEHOLDER_PROMPTS = [
  'Homepage redesign for Acme due Friday',
  'Northwind API reviews and Q3 migration',
  'Monthly Delta reports plus SEO audit',
];

export function InputScreen() {
  const { state, dispatch } = useAppState();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const showAnimatedPlaceholder = !state.inputText;
  const animatedPlaceholder = useTypingPlaceholder(PLACEHOLDER_PROMPTS, showAnimatedPlaceholder);

  const handleSubmit = () => {
    if (!state.inputText.trim()) return;
    dispatch({ type: 'START_DRAFT', payload: state.inputText.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(72, el.scrollHeight)}px`;
  }, [state.inputText]);

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <h1 className={styles.headline}>Hey Merve, tell us what you&apos;re working on</h1>
        <p className={styles.subheadline}>
          We&apos;ll set up your projects and tasks for you. You can edit everything before
          it&apos;s created.
        </p>

        <div className={styles.promptCard}>
          <div className={styles.promptBody}>
            <div className={styles.textareaWrap}>
              {showAnimatedPlaceholder && (
                <div className={styles.placeholderGhost} aria-hidden="true">
                  {animatedPlaceholder}
                  <span className={styles.placeholderCursor} />
                </div>
              )}
              <textarea
                ref={textareaRef}
                className={styles.textarea}
                placeholder=""
                value={state.inputText}
                rows={3}
                onChange={(e) => dispatch({ type: 'SET_INPUT', payload: e.target.value })}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <div className={styles.promptActions}>
            <button
              type="button"
              className={styles.submitBtn}
              disabled={!state.inputText.trim()}
              onClick={handleSubmit}
            >
              Generate my setup
              <span className={styles.submitIcon} aria-hidden="true">
                →
              </span>
            </button>
          </div>
        </div>

        <p className={styles.examplesLabel}>Or start with an example:</p>
        <div className={styles.chips}>
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt.text}
              type="button"
              className={styles.chip}
              title={prompt.text}
              onClick={() => dispatch({ type: 'SET_INPUT', payload: prompt.text })}
            >
              <span className={styles.chipIcon} aria-hidden="true">
                {prompt.icon}
              </span>
              <span className={styles.chipText}>{prompt.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
