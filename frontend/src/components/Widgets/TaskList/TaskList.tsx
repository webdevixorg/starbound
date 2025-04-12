import React from 'react';

// Define reusable icon paths
const ICON_PATHS = {
  CIRCLE:
    'M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z',
  CHECK_CIRCLE:
    'M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 0 1-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8l157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z',
  COMMENTS:
    'M256 32C114.6 32 0 125.1 0 240c0 47.6 19.9 91.2 52.9 126.3C38 405.7 7 439.1 6.5 439.5c-6.6 7-8.4 17.2-4.6 26S14.4 480 24 480c61.5 0 110-25.7 139.1-46.3C192 442.8 223.2 448 256 448c141.4 0 256-93.1 256-208S397.4 32 256 32zm0 368c-26.7 0-53.1-4.1-78.4-12.1l-22.7-7.2l-19.5 13.8c-14.3 10.1-33.9 21.4-57.5 29c7.3-12.1 14.4-25.7 19.9-40.2l10.6-28.1l-20.6-21.8C69.7 314.1 48 282.2 48 240c0-88.2 93.3-160 208-160s208 71.8 208 160s-93.3 160-208 160z',
};

// TaskIcon Component
const TaskIcon: React.FC<{ className?: string; path: string }> = ({
  className,
  path,
}) => (
  <svg
    width="20"
    height="20"
    fill="currentColor"
    className={className}
    viewBox="0 0 1024 1024"
  >
    <path d={path}></path>
  </svg>
);

// TaskItem Component
interface TaskItemProps {
  number: string;
  description: string;
  iconPath: string;
  additionalContent?: React.ReactNode;
  completed?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  number,
  description,
  iconPath,
  additionalContent,
  completed,
}) => (
  <li className="flex items-center justify-between py-3 text-gray-600 border-b-2 border-gray-100 dark:text-gray-200 dark:border-gray-800">
    <div className="flex items-center justify-start text-sm">
      <span className="mx-4">{number}</span>
      <span className={completed ? 'line-through text-gray-400' : ''}>
        {description}
      </span>
      {additionalContent && (
        <span className="flex items-center ml-2 text-gray-400 lg:ml-6 dark:text-gray-300">
          {additionalContent}
        </span>
      )}
    </div>
    <TaskIcon
      className={`mx-4 text-gray-400 dark:text-gray-300 ${
        completed ? 'text-green-500' : ''
      }`}
      path={iconPath}
    />
  </li>
);

// TasksWidget Component
const TasksWidget: React.FC = () => {
  const tasks = [
    {
      number: '01',
      description: 'Create wireframe',
      iconPath: ICON_PATHS.CIRCLE,
    },
    {
      number: '02',
      description: 'Dashboard design',
      iconPath: ICON_PATHS.CIRCLE,
      additionalContent: (
        <>
          <span>3</span>
          <svg
            width="15"
            height="15"
            fill="currentColor"
            className="ml-1"
            viewBox="0 0 512 512"
          >
            <path d={ICON_PATHS.COMMENTS} />
          </svg>
        </>
      ),
    },
    {
      number: '03',
      description: 'Components card',
      iconPath: ICON_PATHS.CIRCLE,
    },
    {
      number: '04',
      description: 'Google logo design',
      iconPath: ICON_PATHS.CHECK_CIRCLE,
      completed: true,
    },
    {
      number: '05',
      description: 'Header navigation',
      iconPath: ICON_PATHS.CHECK_CIRCLE,
      completed: true,
    },
    {
      number: '06',
      description: 'International',
      iconPath: ICON_PATHS.CIRCLE,
      additionalContent: (
        <>
          <span>3</span>
          <svg
            width="15"
            height="15"
            fill="currentColor"
            className="ml-1"
            viewBox="0 0 512 512"
          >
            <path d={ICON_PATHS.COMMENTS} />
          </svg>
        </>
      ),
    },
    {
      number: '07',
      description: 'Production data',
      iconPath: ICON_PATHS.CIRCLE,
    },
  ];

  return (
    <div className="mb-4">
      <div className="w-full bg-white shadow-lg rounded-2xl dark:bg-gray-700">
        <p className="p-4 font-bold text-black text-md dark:text-white">
          My Tasks
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-300 dark:text-white">
            (07)
          </span>
        </p>
        <ul>
          {tasks.map((task) => (
            <TaskItem
              key={task.number}
              number={task.number}
              description={task.description}
              iconPath={task.iconPath}
              additionalContent={task.additionalContent}
              completed={task.completed}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TasksWidget;
