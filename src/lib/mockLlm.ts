import { createProject } from './draftIds';
import type { SetupDraft } from './types';

function matches(input: string, keywords: string[]): boolean {
  const lower = input.toLowerCase();
  return keywords.some((k) => lower.includes(k.toLowerCase()));
}

export function generateSetupDraft(input: string): SetupDraft {
  if (matches(input, ['acme', 'homepage', 'friday', 'harlow', 'logo', 'designer'])) {
    return {
      projects: [
        createProject('Acme Rebrand', [
          'Draft homepage wireframes',
          'Client kickoff call',
          'Style guide review',
        ]),
        createProject('Harlow Maintenance', ['Monthly bug triage', 'Report writeup']),
      ],
      suggestedFirstTask: {
        project: 'Acme Rebrand',
        task: 'Draft homepage wireframes',
        reason: "You mentioned Acme's deadline is this week",
      },
    };
  }

  if (matches(input, ['northwind', 'api', 'code review', 'migration', 'contractor', 'q3'])) {
    return {
      projects: [
        createProject('Northwind Contract', [
          'API code reviews',
          'Database migration planning',
          'Sprint sync with team',
        ]),
        createProject('Q3 Migration', [
          'Schema migration scripts',
          'Rollback testing',
          'Documentation update',
        ]),
      ],
      suggestedFirstTask: {
        project: 'Northwind Contract',
        task: 'API code reviews',
        reason: 'Code reviews are mentioned as ongoing work through Q3',
      },
    };
  }

  if (matches(input, ['delta', 'seo', 'reporting', 'marketing', 'consultant', 'audit'])) {
    return {
      projects: [
        createProject('Delta Reporting', [
          'Monthly performance report',
          'Stakeholder deck prep',
          'KPI dashboard update',
        ]),
        createProject('SEO Audit', [
          'Site crawl analysis',
          'Keyword gap report',
          'Recommendations doc',
        ]),
      ],
      suggestedFirstTask: {
        project: 'SEO Audit',
        task: 'Site crawl analysis',
        reason: 'You mentioned a new SEO audit this week',
      },
    };
  }

  const words = input
    .split(/[\s,.\-–—]+/)
    .filter((w) => w.length > 3)
    .slice(0, 4);

  const projectA = words[0]
    ? `${words[0].charAt(0).toUpperCase()}${words[0].slice(1)} Work`
    : 'Client work';
  const projectB = words[1]
    ? `${words[1].charAt(0).toUpperCase()}${words[1].slice(1)} Projects`
    : 'Internal projects';

  return {
    projects: [
      createProject(projectA, ['Kickoff and planning', 'Weekly status update']),
      createProject(projectB, ['Review deliverables', 'Team sync']),
    ],
    suggestedFirstTask: {
      project: projectA,
      task: 'Kickoff and planning',
      reason: 'First on your list',
      isNeutral: true,
    },
  };
}
