import { generateSetupDraft } from './mockLlm';
import type { StreamEvent } from './types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function* streamDraft(input: string): AsyncGenerator<StreamEvent> {
  const draft = generateSetupDraft(input);

  yield { type: 'suggested', data: draft.suggestedFirstTask };
  await delay(400);

  for (const project of draft.projects) {
    yield { type: 'project', data: project.name };
    await delay(300);

    for (const task of project.tasks) {
      yield { type: 'task', data: { project: project.name, task: task.name } };
      await delay(300);
    }
  }

  yield { type: 'complete', data: draft };
}
