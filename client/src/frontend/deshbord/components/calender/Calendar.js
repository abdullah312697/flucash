// src/Calendar.js
import React, { useState, useEffect } from 'react';
import './Calendar.css';
import {ToggleCalener} from '../../../../js/main';

const Calendar = ({onDateSelect}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = [];
  for (let i = currentYear - 50; i <= currentYear + 50; i++) {
    years.push(i);
  }

  useEffect(() => {
    setCurrentDate(new Date(currentYear, currentMonth));
  }, [currentMonth, currentYear]);

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };
  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const calendarDays = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<td key={`empty-${i}`}></td>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === selectedDate.getDate() &&
                      currentMonth === selectedDate.getMonth() &&
                      currentYear === selectedDate.getFullYear();
      calendarDays.push(
        <td 
          key={day} 
          className={isToday ? 'current-date' : ''} 
          onClick={(event) => handleDateClick(day, event)}
        >
          {day}
        </td>
      );
    }

    const rows = [];
    let cells = [];

    calendarDays.forEach((day, index) => {
      if (index % 7 !== 0) {
        cells.push(day);
      } else {
        rows.push(cells);
        cells = [];
        cells.push(day);
      }
      if (index === calendarDays.length - 1) {
        rows.push(cells);
      }
    });

    return rows.map((row, index) => <tr key={index}>{row}</tr>);
  };

  const handleDateClick = (day, e) => {
    const selected = new Date(currentYear, currentMonth, day);
    setSelectedDate(selected);
    if (onDateSelect) {
      onDateSelect(selected);
    }
    ToggleCalener(e);
  };

  const handleMonthChange = (month) => {
    setCurrentMonth(month);
    setShowMonthDropdown(false);
  };

  const handleYearChange = (year) => {
    setCurrentYear(year);
    setShowYearDropdown(false);
  };

  const toggleMonthDropdown = () => {
    setShowMonthDropdown(!showMonthDropdown);
    setShowYearDropdown(false);
  };

  const toggleYearDropdown = () => {
    setShowYearDropdown(!showYearDropdown);
    setShowMonthDropdown(false);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="calendar">
      <div className="month">
        <div className='nextpreveContainer'>
          <span className="prev" onClick={handlePrevMonth}>&#10094;</span>
          <span className="next" onClick={handleNextMonth}>&#10095;</span>
        </div>
        <div className='currentDateShowing'>
          <span className="month-name" onClick={toggleMonthDropdown}>{months[currentMonth]}</span>
          <span className="year-name" onClick={toggleYearDropdown}>{currentYear}</span>
        </div>
      </div>
      {showMonthDropdown && (
        <div className="dropdown">
          {months.map((month, index) => (
            <div key={index} onClick={() => handleMonthChange(index)}>
              {month}
            </div>
          ))}
        </div>
      )}
      {showYearDropdown && (
        <div className="dropdown dropdownYear">
          {years.map((year, index) => (
            <div key={index} onClick={() => handleYearChange(year)}>
              {year}
            </div>
          ))}
        </div>
      )}
      <table className="calendar-table">
        <thead>
          <tr>
            <th>Sun</th>
            <th>Mon</th>
            <th>Tue</th>
            <th>Wed</th>
            <th>Thu</th>
            <th>Fri</th>
            <th>Sat</th>
          </tr>
        </thead>
        <tbody>
          {generateCalendar()}
        </tbody>
      </table>
    </div>
  );
};

export default Calendar;
