import { useEffect, useState } from 'react';
import './App.css';
import Plot from 'react-plotly.js';

function App() {
  
  const F_API_KEY= '...';
  const ALP_API_KEY= '...';
  const [comapnName, setComapnName] = useState('');
  const [stockDatesXValues, setStockDatesXValues] = useState([]);
  const [stockYValues, setStockYValues] = useState([]);
  const [stockCloseValues, setCloseValues] = useState([]);
  const [symbols, setSymbols] = useState([]);

  useEffect(() => {

    const getSymbols = async () => {
      await fetch(`https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${F_API_KEY}`)
            .then((response) => response.json())
            .then((data) => {
              const sortedData = data.sort((a, b) => {return a.description > b.description ? 1: -1});
              const stockSymbols = sortedData.map((symbol) => ({
                description: symbol.description,
                symbol: symbol.symbol
              }))
              setSymbols(stockSymbols);
            })
    }
    getSymbols();

  }, []);

  const getCompanyInfo = async(e) => {
    
    setComapnName(`${e.target.options[e.target.selectedIndex].text} (${e.target.value})`)
    let getStockDatesValues = []; 
    let getStockOpenValues = [];
    let getStockCloseValues = []
    if (e.target.value !== '') {

        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${e.target.value}&outputsize=compact&apikey=${ALP_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data !=null ) {
            for (var key in data['Time Series (Daily)']) {
                getStockDatesValues.push(key);
                getStockOpenValues.push(data['Time Series (Daily)'][key]['1. open']);
                getStockCloseValues.push(data['Time Series (Daily)'][key]['4. close'])
              }
        }
        setStockDatesXValues(getStockDatesValues);
        setStockYValues(getStockOpenValues);
        setCloseValues(getStockCloseValues);
    }
  };

  return (
    <div className="app">
        <h3>US Stock Exchange</h3>
        <select className='app-company-ddl' onChange={getCompanyInfo}>
          <option>Select from US companies</option>
          {symbols.length > 0 && symbols.map((symbol, i) => (
             symbol.description.length > 0 && 
              <option key={i} value={symbol.symbol}>{symbol.description}</option>
          ))}
        </select>
        <div className="plotly-graph">
        {stockDatesXValues.length > 0 && (
          <Plot data={
              [
                  {
                      x: stockDatesXValues,
                      y: stockYValues,
                      type: 'scatter',
                      mode: 'lines',
                      name: 'Open',
                      line: {color: '#17BECF'}
                  },
                  {
                      x: stockDatesXValues,
                      y: stockCloseValues,
                      type: 'scatter',
                      mode: 'lines',
                      name: 'Close',
                      line: {color: '#7F7F7F'}
                  }
              ]}
              layout={ {width: 820, height: 520, title: `${comapnName}`} }
          />
          )}
        </div>

    </div>
  );
}

export default App;
