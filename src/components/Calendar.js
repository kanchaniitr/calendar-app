import "./Calendar.css";
import React, { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameWeek, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

function isHoliday(day) {
    return day % 4 == 0;
}

const Calendar = () => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
  const quarterNames = [ "Jan_Mar", "Apr_Jun", "Jul_Sep", "Oct_Dec" ];

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [countryOptions, setCountryOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('');
  const [holidayValues, setHolidayValues] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [fetchingError, setFetchingError] = useState(null);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

   const getValidMonths = () => {
        let idx;
        let validMonths = [];
        if (selectedYear === "")
            return [];
        if (selectedMonth === "" && selectedQuarter === "")
            return [];
        if (selectedView === "Monthly" && selectedMonth !== "") {
            let som = new Date(selectedYear + "-" + monthNames[selectedMonth] + "-" + "01");
            validMonths = [som];
        } else if (selectedView === "Quarterly" && selectedQuarter !== "") {
            validMonths = Array(3).fill(null);
            let idx = selectedQuarter * 3;
            for (let i = idx; i < idx + 3; i++) {
                let som = new Date(selectedYear + "-" + monthNames[i] + "-" + "01");
                validMonths[i - idx ] = som;
            }
        }

        return validMonths;
    }

    useEffect(() => {
        console.log("Updated holidays : " + holidayValues);
    }, [holidayValues]);

    useEffect(() => {
    const fetchHolidays = async () => {
        let countryCode = selectedCountry;
        let validMonths = getValidMonths();
        let hdDateFormat = "yyyyMMdd";
        if (countryCode != "" && validMonths.length > 0) {
            let startDate = format(startOfWeek(validMonths[0]), hdDateFormat);
            let endDate = format(endOfWeek(endOfMonth(validMonths[validMonths.length - 1])), hdDateFormat);
            try {
                const response = await fetch(`http://localhost:8080/holidays?country=${selectedCountry}&countryCode=${countryCode}&startDate=${startDate}&endDate=${endDate}`);
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setHolidayValues(data);
            } catch (error) {
                setFetchingError(error);
            } finally {
                setFetching(false);
            }
        }
    };
    fetchHolidays();
    }, [selectedCountry, selectedView, selectedYear, selectedMonth, selectedQuarter]);

    useEffect(() => {
        const fetchCountries = async () => {
          try {
            const response = await fetch('http://localhost:8080/countries');
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCountryOptions(data);
          } catch (error) {
            setError(error);
          } finally {
            setLoading(false);
          }
        };

        fetchCountries();
      }, []);


  const renderCountries = () => {
    const handleCountryChange = (event) => {
      setSelectedCountry(event.target.value);
    };
    if (loading) return <div>Loading options...</div>;
    if (error) return <div>Error: {error.message}</div>;
    return ( <div className="selection-panel">
      <h3><label htmlFor="api-select">Select a Country :</label></h3>
      <select id="api-select" value={selectedCountry} onChange={handleCountryChange}>
        <option value=""></option>
        {countryOptions.map((item) => (
          <option key={item.countryCode} value={item.countryCode}>
            {item.countryName}
          </option>
        ))}
      </select>
    </div>);
  };

  const renderYearSelector = () => {
    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
      };

    let year = 2025;
    let yearOptions = [];
    while (year <= 2035)
        yearOptions.push(year++);
    return (
    <div className="selection-panel calendar-cell" key="yearSelector">
        <h3>Year :</h3>
        <select id="year-select" value={selectedYear} onChange={handleYearChange}>
            <option value=""></option>
            {yearOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
    </div>);
  };

  const renderMonthSelector= () => {
    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
      };

    return (
        <div className="selection-panel calendar-cell" key="monthSelector">
            <h3>Month :</h3>
            <select id="month-select" value={selectedMonth} onChange={handleMonthChange}>
                <option value=""></option>
                {monthNames.map((item, index) => (
                  <option key={item} value={index}>
                    {item}
                  </option>
                ))}
              </select>
        </div>);
  }

  const renderQuarterSelector = () => {
    const handleQuarterChange = (event) => {
        setSelectedQuarter(event.target.value);
      };

    return (
        <div className="selection-panel calendar-cell" key="quarterSelector">
            <h3>Quarter :</h3>
            <select id="quarter-select" value={selectedQuarter} onChange={handleQuarterChange}>
                <option value=""></option>
                {quarterNames.map((item, index) => (
                  <option key={item} value={index}>
                    {item}
                  </option>
                ))}
              </select>
        </div>);
  }

  const renderMonthRangeSelector = () => {
    return (
    <div>
    <div className="selection-panel grid grid-cols-2" key="monthRangeSelector">
      {renderYearSelector()}
      {renderMonthSelector()}
    </div>
      {selectedYear != "" && selectedMonth != "" && renderCalendarGrid()}
    </div>
  )};

const renderValidMonths = () => {
    <div className="selection-panel" key="validMonths">
        validMonths
    </div>
}
  const renderQuarterRangeSelector = () => (
    <div>
    <div className="selection-panel grid grid-cols-2" key="quarterRangeSelector">
      {renderYearSelector()}
      {renderQuarterSelector()}
    </div>
      {selectedYear != "" && selectedQuarter != "" && renderCalendarGrid()}
    </div>
  );

  const renderCalendarGrid = () => (
    <div>
        {renderDays()}
        {renderMonthCell()}
    </div>
  );

  const renderViewPanel = () => {
      const handleViewChange = (event) => {
        setSelectedView(event.target.value);
      };
      return (
      <div>
        <div className="selection-panel " key="view-selection-panel">
          <h3>View Type :</h3>
          <label>
            <input
              type="radio"
              value="Monthly"
              checked={selectedView === 'Monthly'}
              onChange={handleViewChange}
            />
            Monthly
          </label>
          <label>
            <input
              type="radio"
              value="Quarterly"
              checked={selectedView === 'Quarterly'}
              onChange={handleViewChange}
            />
            Quarterly
          </label>
        </div>
        {selectedView === "Monthly" && selectedCountry != "" && renderMonthRangeSelector()}
        {selectedView === "Quarterly" && selectedCountry != "" && renderQuarterRangeSelector()}
        </div>
      );
    };

  const renderDays = () => {
      const days = [];
      let idx = -1;
      if (selectedView === "Monthly")
        idx = selectedMonth;
      else
        idx = 3 * selectedQuarter;
      let startDate = startOfWeek(new Date(selectedYear + "-" + monthNames[idx] + "-" + "01"));
        days.push(
          <div className="calendar-days" key="daysName">
            {Array(7)
              .fill()
              .map((_, i) => (
                <div className="calendar-day-name" key={i}>
                  {format(addDays(startDate, i), "EEE")}
                </div>
              ))}
          </div>
        );
      return <div className="grid grid-cols-7">{days}</div>;
    };

  const weekCellColorMapFunc = (holidayValues) => {
    return new Map(holidayValues.map(holiday => [holiday.date, holiday.cellColorScheme]));
  }

  const holidayNameMapFunc = (holidayValues) => {
      let holidayList = new Map();
      for (let hdl of holidayValues.values()) {
          for (let hd of hdl.holidays) {
              holidayList.set(hd.date, hd.names);
          }
      }
      return holidayList;
  }

  const renderMonthCell = () => {
    const isValidDate = (day, validMonths) => {
        for (let i = 0; i < validMonths.length; i++) {
            if (isSameMonth(day, validMonths[i]))
                return true;
        }
        return false;
    };
    let validMonths = getValidMonths();
    let startDate = startOfWeek(validMonths[0]);
    let endDate = endOfWeek(endOfMonth(validMonths[validMonths.length - 1]));

    const dateFormat = "d";
    const hdFormat = "yyyyMMdd";
    const rows = [];

    let days = [];
    let day = startDate;
    let formattedDate = "";
    let hdFormattedDate = "";

    let weekCellColorMap = weekCellColorMapFunc(holidayValues);
    let holidayMapToPublish = holidayNameMapFunc(holidayValues);

    while (day <= endDate) {
      hdFormattedDate = format(day, hdFormat);
      let colorScheme = weekCellColorMap.has(hdFormattedDate) ? weekCellColorMap.get(hdFormattedDate) : "";
      let weekdays = [];
      for (let i = 0; i < 7; i++) {
        weekdays.push(day);
        day = addDays(day, 1);
      }
      for (let i = 0; i < 7; i++) {
        let nDay = weekdays[i];
        formattedDate = format(nDay, dateFormat);
        days.push(
          <div
            key={nDay}
            className={`calendar-cell ${colorScheme}
              ${!isValidDate(nDay, validMonths) ? "other-month" : ""}
            `}
          >
            {formattedDate}
          </div>
        );
      }
      rows.push(
        <div className="calendar-cells" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    // rendering holiday List
    const renderHDTable = () => {
        let hdRows = [];
        let hdNameLink = [];
        for(const [hdDate, hdNameWikiMap] of holidayMapToPublish) {
            let nameKey = "";
            let comma = "";
            for (let hdNameWiki of hdNameWikiMap) {
                let hdName = hdNameWiki.name;
                nameKey = nameKey + hdName;
                let wikiToken = hdNameWiki.wikiToken;
                hdNameLink.push( <ul><a href={`https://en.wikipedia.org/wiki/${wikiToken}`} target="_blank" rel="noopener noreferrer">
                  {hdName}
                </a></ul> )
                comma = ", ";
            }
            hdRows.push(
                <div className="holiday-cells">
                    <div className="calendar-cell" key={hdDate}>{hdDate}</div>
                    <div className="calendar-cell" key={nameKey}>{hdNameLink}</div>
                </div>
            )
            hdNameLink = [];
        }
        return (
            <>
                { hdRows.length > 0 ? (
                    <div>
                        <div className="holiday-header"><h3>List of Holidays</h3></div>
                        <div className="grid grid-cols-2" key="holidays list">{hdRows}</div>
                    </div>
                ) : (
                  <div></div>
                )}
            </>
        );
    }

    return (
        <div>
            <div className="grid grid-cols-7">{rows}</div>
            {renderHDTable()}
        </div>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-md mt-10 p-4 calendar-container">
      <div className="holiday-header"><h3>Vacation Calendar</h3></div>
      {renderCountries()}
      {renderViewPanel()}
    </div>
  );
};

export default Calendar;