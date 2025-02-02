'use client';
import React from 'react';
import { TextStyle } from '@/models/models';

interface TextStylePanelProps {
  currentStyle: TextStyle;
  onStyleChange: (newStyle: Partial<TextStyle>) => void;
}

export default function TextStylePanel({
  currentStyle,
  onStyleChange,
}: TextStylePanelProps) {
  return (
    <div className='flex items-center space-x-4 p-2 bg-gray-100 rounded'>
      {/* Font Family */}
      <select
        value={currentStyle.fontFamily}
        onChange={(e) => onStyleChange({ fontFamily: e.target.value })}
        className='border p-1 rounded'
      >
        <option value='Arial'>Arial</option>
        <option value='Times New Roman'>Times New Roman</option>
        <option value='Courier New'>Courier New</option>
        <option value='Verdana'>Verdana</option>
      </select>

      {/* Font Size */}
      <input
        type='number'
        value={currentStyle.fontSize}
        min={10}
        max={72}
        onChange={(e) => onStyleChange({ fontSize: parseInt(e.target.value) })}
        className='border p-1 w-16 rounded'
        placeholder='Size'
      />

      {/* Font Weight */}
      <select
        value={currentStyle.fontWeight}
        onChange={(e) =>
          onStyleChange({ fontWeight: e.target.value as 'normal' | 'bold' })
        }
        className='border p-1 rounded'
      >
        <option value='normal'>Normal</option>
        <option value='bold'>Bold</option>
      </select>

      {/* Font Style */}
      <select
        value={currentStyle.fontStyle}
        onChange={(e) =>
          onStyleChange({ fontStyle: e.target.value as 'normal' | 'italic' })
        }
        className='border p-1 rounded'
      >
        <option value='normal'>Normal</option>
        <option value='italic'>Italic</option>
      </select>

      {/* Text Decoration */}
      <select
        value={currentStyle.textDecoration}
        onChange={(e) =>
          onStyleChange({
            textDecoration: e.target.value as 'none' | 'underline',
          })
        }
        className='border p-1 rounded'
      >
        <option value='none'>None</option>
        <option value='underline'>Underline</option>
      </select>

      {/* Text Align */}
      <select
        value={currentStyle.textAlign}
        onChange={(e) =>
          onStyleChange({
            textAlign: e.target.value as 'left' | 'center' | 'right',
          })
        }
        className='border p-1 rounded'
      >
        <option value='left'>Left</option>
        <option value='center'>Center</option>
        <option value='right'>Right</option>
      </select>

      {/* Text Color */}
      <input
        type='color'
        value={currentStyle.color}
        onChange={(e) => onStyleChange({ color: e.target.value })}
        className='w-8 h-8 border-0'
      />
    </div>
  );
}
