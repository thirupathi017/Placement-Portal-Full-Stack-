import React from 'react';

const JobTypeBadge = ({ type }) => {
  const styles = {
    FULL_TIME: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    INTERNSHIP: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    CONTRACT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[type] || styles.FULL_TIME}`}>
      {type?.replace('_', ' ')}
    </span>
  );
};

export default JobTypeBadge;
