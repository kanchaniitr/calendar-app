import React, { useState } from "react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const renderHeader = () => (
    <div className="flex justify-between items-center py-4 px-6 bg-gray-200">
      <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}>‹</button>
      <h2 className="text-lg font-bold">{format(currentDate, "MMMM yyyy")}</h2>
      <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}>›</button>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const dateFormat = "EEE";

    const startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="text-center font-medium" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="grid grid-cols-7">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];

    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;

        days.push(
          <div
            className={`text-center py-2 border
              ${!isSameMonth(day, monthStart) ? "text-gray-400" : ""}
              ${isSameDay(day, selectedDate) ? "bg-blue-500 text-white rounded-full" : ""}
            `}
            key={day}
            onClick={() => setSelectedDate(cloneDay)}
          >
            {formattedDate}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day}>
          {days}
        </div>
      );
      days = [];
    }

    return <div>{rows}</div>;
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-md mt-10 p-4">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default Calendar;