import React, { useState } from 'react';

export default function ExpandableText({
  text,
  label = '',
  emptyText = '',
  limit = 96,
  className = '',
}) {
  const [expanded, setExpanded] = useState(false);
  const value = String(text || '').trim();
  const hasText = Boolean(value);
  const shouldCollapse = hasText && value.length > limit;
  const visibleText = !shouldCollapse || expanded
    ? value
    : `${value.slice(0, limit).trim()}...`;

  if (!hasText && !emptyText) return null;

  return (
    <span className={`expandable-text ${expanded ? 'expanded' : ''} ${className}`}>
      {label && <b>{label}</b>}
      <span className="expandable-text-value" title={value || emptyText}>
        {hasText ? visibleText : emptyText}
      </span>
      {shouldCollapse && (
        <button
          type="button"
          className="read-more-button"
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((current) => !current);
          }}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </span>
  );
}
