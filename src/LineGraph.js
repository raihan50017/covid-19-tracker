import React, { useEffect, useState } from 'react';
import {Line} from 'react-chartjs-2';
import numeral from 'numeral';

const options = {
    legend: {
      display: false,
    },
    elements: {
      point: {
        radius: 0,
      },
    },
    maintainAspectRatio: false,
    tooltips: {
      mode: "index",
      intersect: false,
      callbacks: {
        label: function (tooltipItem, data) {
          return numeral(tooltipItem.value).format("+0,0");
        },
      },
    },
    scales: {
      xAxes: [
        {
          type: "time",
          time: {
            format: "MM/DD/YY",
            tooltipFormat: "ll",
          },
        },
      ],
      yAxes: [
        {
          gridLines: {
            display: false,
          },
          ticks: {
            callback: function (value, index, values) {
              return numeral(value).format("0a");
            },
          },
        },
      ],
    },
  };

const LineGraph = () => {
    const [data, setData] = useState({});
    useEffect(()=>{
        const fetchData = async () => {
            await fetch('https://disease.sh/v3/covid-19/historical/all?lastdays=120')
            .then(res => res.json())
            .then(data => {
            console.log("data",data);
            const chartData = buildChartData(data);
            setData(chartData);
          });
        };
        fetchData();
    },[])

    const buildChartData = (data, caseType='cases') =>{
        const chartData = [];
        let lastDataPoint;
            Object.keys(data[caseType]).forEach(date => {
                if(lastDataPoint){
                    let newDataPoint = {
                        x:date,
                        y:data[caseType][date] - lastDataPoint
                    }
                    chartData.push(newDataPoint);
                }
                lastDataPoint = data[caseType][date];
            })
        return chartData;
    }

    return (
        <div>
      {data?.length > 0 && (
        <Line
          data={{
            datasets: [
              {
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                borderColor: "#CC1034",
                data: data,
              },
            ],
          }}
          options={options}
        />
      )}
    </div>
    );
};

export default LineGraph;