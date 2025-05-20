import React from 'react';

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  style?: React.CSSProperties;
}

const TruncatedText: React.FC<TruncatedTextProps> = ({ text, maxLength = 40, className = '', style = {} }) => {
  const isTruncated = text.length > maxLength;
  const displayedText = isTruncated ? `${text.slice(0, maxLength)}...` : text;

  return (
    <span
      className={`truncate ${className}`}
      style={{ ...style, display: 'inline-block', maxWidth: '100%' }}
      title={isTruncated ? text : undefined}
    >
      {displayedText}
    </span>
  );
};

export default TruncatedText;
