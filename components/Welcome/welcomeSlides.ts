export type WelcomeSlideId = 'dashboard' | 'editor' | 'ai' | 'versions' | 'chat';

export interface WelcomeSlide {
  id: WelcomeSlideId;
  title: string;
  description: string;
  src?: string;
  alt: string;
}

// Add a public image path to src to replace a slide's illustration with a screenshot.
export const welcomeSlides: WelcomeSlide[] = [
  {
    id: 'dashboard',
    title: 'A clear home for your work.',
    description: 'Keep your sessions, documents, and next steps together in one focused workspace.',
    alt: 'Dashboard with a workspace overview and a list of collaborative sessions',
  },
  {
    id: 'ai',
    title: 'Find the words you were looking for.',
    description: 'Refine, translate, summarize, and explore your writing with nine purpose-built AI tools.',
    alt: 'AI Assistance workspace with a writing tool, input text, and a refined result',
  },
  {
    id: 'versions',
    title: 'Move forward. Keep your earlier thinking.',
    description: 'Preview saved versions and restore a previous draft whenever you need a different direction.',
    alt: 'Document version history with a draft preview and a timeline of saved versions',
  },
];
