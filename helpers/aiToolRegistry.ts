import { IconType } from 'react-icons';
import {
  FiCheckCircle,
  FiMessageCircle,
  FiAlignLeft,
  FiEdit3,
  FiGlobe,
  FiKey,
  FiFeather,
  FiBookOpen,
  FiType,
} from 'react-icons/fi';

import { AITool } from '@/models/models';

export type AiToolCategory = 'Writing' | 'Analysis' | 'Translation';
export interface AiToolDefinition extends AITool {
  title: string;
  description: string;
  category: AiToolCategory;
  placeholder: string;
  Icon: IconType;
}

export const aiTools: AiToolDefinition[] = [
  {
    id: 'grammar-check',
    name: 'Grammar and Spelling Check',
    endpoint: 'grammar-check',
    bodyField: 'text',
    title: 'Grammar & spelling',
    description: 'Catch mistakes and give every sentence a clean finish.',
    category: 'Writing',
    placeholder: 'Paste the text you would like to proofread…',
    Icon: FiCheckCircle,
  },
  {
    id: 'tone-analysis',
    name: 'Tone Analysis',
    endpoint: 'tone-analysis',
    bodyField: 'text',
    title: 'Tone analysis',
    description: 'Understand how your writing comes across to others.',
    category: 'Analysis',
    placeholder: 'Paste your text to explore its tone…',
    Icon: FiMessageCircle,
  },
  {
    id: 'text-summarization',
    name: 'Text Summarization',
    endpoint: 'summarization',
    bodyField: 'text',
    title: 'Summarize text',
    description: 'Find the key points without the long read.',
    category: 'Analysis',
    placeholder: 'Paste an article, a report, or anything you would like to summarize…',
    Icon: FiAlignLeft,
  },
  {
    id: 'rephrase',
    name: 'Text Rephrasing',
    endpoint: 'rephrase',
    bodyField: 'text',
    title: 'Rephrase text',
    description: 'Find a clearer, more natural way to say it.',
    category: 'Writing',
    placeholder: 'Paste the text you would like to rephrase…',
    Icon: FiEdit3,
  },
  {
    id: 'translation',
    name: 'Text Translation',
    endpoint: 'translation',
    bodyField: 'text',
    requiresTargetLanguage: true,
    title: 'Translate text',
    description: 'Bring your ideas to another language.',
    category: 'Translation',
    placeholder: 'Paste the text you would like to translate…',
    Icon: FiGlobe,
  },
  {
    id: 'keyword-extraction',
    name: 'Keyword Extraction',
    endpoint: 'keyword-extraction',
    bodyField: 'text',
    title: 'Extract keywords',
    description: 'Surface the terms and themes that matter most.',
    category: 'Analysis',
    placeholder: 'Paste your text to find its key words and phrases…',
    Icon: FiKey,
  },
  {
    id: 'text-generation',
    name: 'Text Generation',
    endpoint: 'text-generation',
    bodyField: 'text',
    title: 'Generate text',
    description: 'Turn a thoughtful prompt into a useful first draft.',
    category: 'Writing',
    placeholder: 'Describe what you want to write. Include your topic, audience, and preferred tone…',
    Icon: FiFeather,
  },
  {
    id: 'readability-analysis',
    name: 'Readability Analysis',
    endpoint: 'readability-analysis',
    bodyField: 'text',
    title: 'Readability analysis',
    description: 'See how easy your writing is to understand.',
    category: 'Analysis',
    placeholder: 'Paste your text to explore its readability…',
    Icon: FiBookOpen,
  },
  {
    id: 'title-generation',
    name: 'Title Generation',
    endpoint: 'title-generation',
    bodyField: 'text',
    title: 'Generate a title',
    description: 'Give your next piece the right opening.',
    category: 'Writing',
    placeholder: 'Paste your content, or describe what it is about…',
    Icon: FiType,
  },
];

export const findAiTool = (name: string) =>
  aiTools.find((tool) => tool.id === name || tool.endpoint === name || tool.name === name);
