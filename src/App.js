import React, { useEffect, useState } from 'react';
import './App.css';
import { Card, CardContent, FormControl, MenuItem, Select } from '@material-ui/core';
import Table from '../src/Table';
import InfoBox from './InfoBox';
import Map from '../src/Map';
import { sortData } from './util';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);


  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
      .then(res => res.json())
      .then(data => {
        setCountryInfo(data);
      })
  }, [])

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch('https://disease.sh/v3/covid-19/countries')
        .then(res => res.json())
        .then(data => {
          const countries = data.map(country => ({
            name: country.country,
            value: country.countryInfo.iso2
          }))
          const sortedData = sortData(data);
          setTableData(sortedData);
          setCountries(countries);
          setMapCountries(data);
        })
    }
    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
      .then(res => res.json())
      .then(data => {
        setCountry(countryCode);
        setCountryInfo(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      })
  }
  console.log(countryInfo)
  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select onChange={onCountryChange} variant="outlined" value={country}>
              <MenuItem value="worldwide">worldwide</MenuItem>
              {
                countries.map(country => {
                  return <MenuItem value={country.value}>{country.name}</MenuItem>
                })
              }
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox title="Coronavirus Cases" total={countryInfo.cases} cases={countryInfo.todayCases}></InfoBox>
          <InfoBox title="Recovered" total={countryInfo.recovered} cases={countryInfo.todayRecovered}></InfoBox>
          <InfoBox title="Death" total={countryInfo.deaths} cases={countryInfo.todayDeaths}></InfoBox>
        </div>
        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        ></Map>
      </div>
      <div className="app__right">
        <Card>
          <CardContent>
            <h3>Live cases by country</h3>
            <Table countries={tableData}></Table>
            <h3>Worldwide cases</h3>
            <LineGraph></LineGraph>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
