import React, { useState, useEffect } from 'react';
import "./CountriesDropDown.css"

function CountriesDropDown() {
  const [selectedValue, setSelectedValue] = useState('');
  const [dataOptions, setDataOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('http://localhost:8080/countries');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDataOptions(data); // Assuming data is an array of objects with label/value
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  const handleDropdownChange = (event) => {
    setSelectedValue(event.target.countryCode);
  };

  if (loading) return <div>Loading options...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="countries-dropdown-panel">
      <h3><label htmlFor="api-select">Select a Country :</label></h3>
      <select id="api-select" value={selectedValue} onChange={handleDropdownChange}>
        <option value="">-- Please choose an item --</option>
        {dataOptions.map((item) => (
          <option key={item.countryCode} value={item.countryCode}>
            {item.countryName}
          </option>
        ))}
      </select>
      {selectedValue && <p>You selected: {selectedValue}</p>}
    </div>
  );
}

export default CountriesDropDown;



import React, { useState } from 'react';

function App() {
  const [selectedOption, setSelectedOption] = useState('Monthly');

  const handleViewChange = (event) => {
    setSelectedViewOption(event.target.value);
  };

  return (
    <div>
      <h3>Select a framework:</h3>
      <label>
        <input
          type="radio"
          value="Monthly"
          checked={selectedOption === 'Monthly'}
          onChange={handleViewChange}
        />
        Monthly
      </label>
      <label>
        <input
          type="radio"
          value="Quarterly"
          checked={selectedOption === 'Quarterly'}
          onChange={handleViewChange}
        />
        Quarterly
      </label>
      <p>Selected: {selectedOption}</p>
    </div>
  );
}

export default App;