import React from 'react';

import { render, screen } from '@testing-library/react';

import AIStatistics from '../AIStatistics';

describe('AIStatistics', () => {
  const firstDate = new Date('2024-03-15T12:00:00Z');
  const totalRequests = 123;
  const totalWordCount = 4567;
  const mostUsedTool = 'Summarizer';

  it('renders all statistics values correctly', () => {
    render(
      <AIStatistics
        firstRequestDate={firstDate}
        totalRequests={totalRequests}
        totalWordCount={totalWordCount}
        mostUsedTool={mostUsedTool}
      />,
    );

    const dateString = firstDate.toLocaleDateString();

    expect(screen.getByText(dateString)).toBeInTheDocument();
    expect(screen.getByText(String(totalRequests))).toBeInTheDocument();
    expect(screen.getByText(String(totalWordCount))).toBeInTheDocument();
    expect(screen.getByText(mostUsedTool)).toBeInTheDocument();
  });
});
