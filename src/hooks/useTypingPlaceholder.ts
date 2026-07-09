import { useEffect, useState } from 'react';

export function useTypingPlaceholder(prompts: string[], active: boolean): string {
  const [text, setText] = useState('');

  useEffect(() => {
    if (!active || prompts.length === 0) {
      setText('');
      return;
    }

    let promptIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeoutId = 0;

    const schedule = (delay: number) => {
      timeoutId = window.setTimeout(tick, delay);
    };

    const tick = () => {
      const current = prompts[promptIndex] ?? '';

      if (!deleting) {
        charIndex += 1;
        setText(current.slice(0, charIndex));

        if (charIndex >= current.length) {
          deleting = true;
          schedule(1800);
          return;
        }

        schedule(42);
        return;
      }

      charIndex -= 1;
      setText(current.slice(0, charIndex));

      if (charIndex <= 0) {
        deleting = false;
        promptIndex = (promptIndex + 1) % prompts.length;
        schedule(320);
        return;
      }

      schedule(22);
    };

    schedule(400);

    return () => window.clearTimeout(timeoutId);
  }, [active, prompts]);

  return text;
}
