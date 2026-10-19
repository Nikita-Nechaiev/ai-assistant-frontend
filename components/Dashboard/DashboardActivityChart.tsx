'use client';

import { useId, useState } from 'react';

import { FiActivity } from 'react-icons/fi';

import { Card } from '@/components/ui/card';
import { DashboardStatisticsData } from '@/services/StatisticsApi';

const series = [
  { key: 'documentsCreated' as const, label: 'Documents created', stroke: 'stroke-primary', dot: 'bg-primary' },
  { key: 'aiRequests' as const, label: 'AI requests', stroke: 'stroke-violet-500', dot: 'bg-violet-500' },
];

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`),
  );

export default function DashboardActivityChart({ activity }: { activity: DashboardStatisticsData['activity'] }) {
  const titleId = useId();
  const instructionsId = useId();
  const [selectedIndex, setSelectedIndex] = useState(activity.days.length - 1);
  const selectedDay = activity.days[Math.min(selectedIndex, activity.days.length - 1)];
  const numberFormat = new Intl.NumberFormat('en-US');
  const width = 640;
  const height = 260;
  const left = 44;
  const right = 20;
  const top = 20;
  const bottom = 42;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const tickStep = Math.max(1, Math.ceil(activity.maxDailyCount / 4));
  const ceiling = tickStep * 4;
  const x = (index: number) => left + (index / Math.max(1, activity.days.length - 1)) * plotWidth;
  const y = (count: number) => top + plotHeight - (count / ceiling) * plotHeight;

  return (
    <Card className='flex h-full min-w-0 flex-col overflow-hidden border-border shadow-card'>
      <div className='flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4'>
        <div>
          <h3 id={titleId} className='text-xl font-semibold'>
            Activity over the last 30 days
          </h3>
          <p className='mt-2 max-w-[680px] text-sm leading-6 text-muted-foreground'>
            Documents created in sessions you can access and your AI requests.
          </p>
        </div>
        <p className='text-sm text-muted-foreground'>
          {formatDate(activity.startDate)} – {formatDate(activity.endDate)} · UTC
        </p>
      </div>
      <div className='grid grid-cols-2 gap-4 px-5 pt-4'>
        {series.map(({ key, label, dot }) => (
          <div key={key} className='flex items-center gap-2.5 text-sm'>
            <span aria-hidden='true' className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
            <span className='text-muted-foreground'>{label}</span>
            <span className='ml-auto font-semibold tabular-nums'>{numberFormat.format(activity.totals[key])}</span>
          </div>
        ))}
      </div>
      <p id={instructionsId} className='sr-only'>
        Use the left and right arrow keys to inspect each day in the chart.
      </p>
      {activity.maxDailyCount > 0 ? (
        <>
          <div
            role='group'
            aria-labelledby={titleId}
            aria-describedby={instructionsId}
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                setSelectedIndex((index) =>
                  Math.max(0, Math.min(activity.days.length - 1, index + (event.key === 'ArrowLeft' ? -1 : 1))),
                );
              }
            }}
            className='mx-4 mt-4 min-h-0 flex-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            <svg viewBox={`0 0 ${width} ${height}`} className='block h-auto w-full' aria-hidden='true'>
              {[0, 1, 2, 3, 4].map((tick) => (
                <g key={tick}>
                  <line
                    x1={left}
                    x2={width - right}
                    y1={y(tick * tickStep)}
                    y2={y(tick * tickStep)}
                    className='stroke-border'
                  />
                  <text
                    x={left - 12}
                    y={y(tick * tickStep) + 5}
                    textAnchor='end'
                    fontSize={15}
                    className='fill-muted-foreground'
                  >
                    {tick * tickStep}
                  </text>
                </g>
              ))}
              <line
                x1={x(selectedIndex)}
                x2={x(selectedIndex)}
                y1={top}
                y2={top + plotHeight}
                className='stroke-border'
                strokeDasharray='4 4'
              />
              {series.map(({ key, stroke }) => (
                <g key={key}>
                  <polyline
                    points={activity.days.map((day, index) => `${x(index)},${y(day[key])}`).join(' ')}
                    fill='none'
                    strokeWidth={2.5}
                    strokeLinejoin='round'
                    strokeLinecap='round'
                    className={stroke}
                  />
                  {selectedDay && (
                    <circle
                      cx={x(selectedIndex)}
                      cy={y(selectedDay[key])}
                      r={4}
                      className={`fill-white ${stroke}`}
                      strokeWidth={2.5}
                    />
                  )}
                </g>
              ))}
              {activity.days.map((day, index) => (
                <g key={day.date}>
                  <rect
                    x={x(index) - plotWidth / Math.max(1, activity.days.length - 1) / 2}
                    y={top}
                    width={plotWidth / Math.max(1, activity.days.length - 1)}
                    height={plotHeight}
                    fill='transparent'
                    onMouseEnter={() => setSelectedIndex(index)}
                    onPointerDown={() => setSelectedIndex(index)}
                  />
                  {(index === 0 ||
                    index === activity.days.length - 1 ||
                    (index % 7 === 0 && index < activity.days.length - 3)) && (
                    <text
                      x={x(index)}
                      y={height - 12}
                      textAnchor={index === 0 ? 'start' : index === activity.days.length - 1 ? 'end' : 'middle'}
                      fontSize={15}
                      className='fill-muted-foreground'
                    >
                      {formatDate(day.date)}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>
          {selectedDay && (
            <p role='status' aria-live='polite' className='px-6 pb-4 text-sm leading-6 text-muted-foreground'>
              <span className='font-medium text-foreground'>{formatDate(selectedDay.date)}:</span>{' '}
              {selectedDay.documentsCreated} documents · {selectedDay.aiRequests} AI requests
            </p>
          )}
        </>
      ) : (
        <div className='flex min-h-[220px] flex-1 flex-col items-center justify-center gap-3 px-6 py-8 text-center'>
          <FiActivity size={26} className='text-primary' aria-hidden='true' />
          <p className='text-base font-medium'>No recorded activity in this period</p>
          <p className='text-sm text-muted-foreground'>New documents and AI requests will appear here.</p>
        </div>
      )}
    </Card>
  );
}
