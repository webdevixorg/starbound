import React, { useState } from 'react';
import './Calendar.css';

const CustomCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const daysInMonth = endOfMonth.getDate();
  const startDayOfWeek = startOfMonth.getDay();
  const endDayOfWeek = endOfMonth.getDay();

  const days: (Date | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        -startDayOfWeek + i + 1
      )
    );
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }
  for (let i = 1; i < 7 - endDayOfWeek; i++) {
    days.push(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i)
    );
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const isCurrentMonth = (date: Date | null): boolean => {
    if (!date) return false; // Handle null case
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date | null): boolean => {
    if (!date) return false; // Handle null case
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="m-auto mx-0 mb-4">
      <div className="p-4 bg-white shadow-lg rounded-2xl dark:bg-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-bold text-left text-black dark:text-white">
            {currentDate.toLocaleString('default', { month: 'long' })}
            {currentDate.getFullYear()}
          </div>
          <div className="flex space-x-4">
            <button
              className="p-2 text-white bg-blue-500 rounded-full"
              onClick={goToPreviousMonth}
            >
              <svg
                width="15"
                height="15"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M13.83 19a1 1 0 0 1-.78-.37l-4.83-6a1 1 0 0 1 0-1.27l5-6a1 1 0 0 1 1.54 1.28L10.29 12l4.32 5.36a1 1 0 0 1-.78 1.64z"
                />
              </svg>
            </button>
            <button
              className="p-2 text-white bg-blue-500 rounded-full"
              onClick={goToNextMonth}
            >
              <svg
                width="15"
                height="15"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M10 19a1 1 0 0 1-.64-.23a1 1 0 0 1-.13-1.41L13.71 12L9.39 6.63a1 1 0 0 1 .15-1.41a1 1 0 0 1 1.46.15l4.83 6a1 1 0 0 1 0 1.27l-5 6A1 1 0 0 1 10 19z"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="-mx-2">
          <table className="w-full dark:text-white">
            <thead>
              <tr>
                <th className="px-2 py-3 md:px-3 font-bold">S</th>
                <th className="px-2 py-3 md:px-3 font-bold">M</th>
                <th className="px-2 py-3 md:px-3 font-bold">T</th>
                <th className="px-2 py-3 md:px-3 font-bold">W</th>
                <th className="px-2 py-3 md:px-3 font-bold">T</th>
                <th className="px-2 py-3 md:px-3 font-bold">F</th>
                <th className="px-2 py-3 md:px-3 font-bold">S</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.ceil(days.length / 7) }).map(
                (_, weekIndex) => (
                  <tr key={weekIndex}>
                    {days
                      .slice(weekIndex * 7, weekIndex * 7 + 7)
                      .map((date, dayIndex) => (
                        <td
                          key={dayIndex}
                          className={`px-2 py-3 text-center cursor-pointer md:px-3 hover:text-blue-500 ${
                            date && !isCurrentMonth(date)
                              ? 'text-gray-400 dark:text-gray-500 wh-45'
                              : ''
                          } ${date ? '' : 'text-gray-300 dark:text-gray-500'} ${
                            isToday(date)
                              ? 'bg-blue-500 text-white rounded-full wh-45'
                              : ''
                          } ${
                            selectedDate?.getTime() === date?.getTime()
                              ? 'bg-blue-500 text-white rounded-full wh-45'
                              : ''
                          }`}
                          onClick={() => date && handleDateClick(date)}
                        >
                          {date && date.getDate()}
                        </td>
                      ))}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomCalendar;
