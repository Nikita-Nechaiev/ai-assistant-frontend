import { IconType } from 'react-icons';
import { FiZap } from 'react-icons/fi';

import { AITool } from '@/models/models';

import { aiTools, findAiTool, AiToolCategory } from './aiToolRegistry';

export type { AiToolCategory } from './aiToolRegistry';

interface AiToolPresentation {
  title: string;
  description: string;
  category: AiToolCategory;
  placeholder: string;
  Icon: IconType;
}

export function getAiToolPresentation(tool: AITool): AiToolPresentation {
  return (
    aiTools.find((item) => item.id === tool.id) ?? {
      title: tool.name,
      description: 'A thoughtful assist for your next piece of writing.',
      category: 'Writing',
      placeholder: 'Enter your text here…',
      Icon: FiZap,
    }
  );
}

export function formatAiToolName(name: string) {
  const tool = findAiTool(name);

  return tool ? getAiToolPresentation(tool).title : name;
}
