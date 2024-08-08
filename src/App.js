import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './App.css';

// Simulated competitor data fetching
const fetchCompetitorPrice = (product) => {
  return product.PRICE_CURRENT * (Math.random() * 0.2 + 0.9);
};

// Calculate the season factor based on the current date
const calculateSeasonFactor = () => {
  const month = new Date().getMonth(); 
  if (month >= 11 || month <= 1) return 1.1; 
  if (month >= 5 && month <= 8) return 0.9; 
  return 1; 
};

// AI recommendation function
const getAIRecommendations = (product, competitorPrice, seasonFactor, currentSales, segment) => {
  if (!product) return 0;

  const basePrice = Number(product.PRICE_CURRENT);
  const predictedPrice = (basePrice + competitorPrice) / 2;

  return predictedPrice;
};

// Predict sales based on price
const predictSales = (price) => {
  return Math.max(0, 1000 - 10 * (price - 20)); // Example function: sales decrease as price increases
};

// Currency conversion rates (example rates)
const currencyRates = {
  'USD': 1, // Base currency
  'CAD': 1.36,
  'MXN': 17.17,
  'GBP': 0.79,
  'CNY': 7.15,
  'INR': 83.15,
  'BRL': 5.25,
  'JPY': 147.56,
  'ARS': 350.42,
  'ZAR': 19.03,
  'CLP': 822.10,
  'CRC': 539.37,
  'SVC': 8.75,
  'GTQ': 7.79,
  'HNL': 24.87,
  'NIO': 35.25,
  'KPW': 900.00,
  'KRW': 1355.98
};

// Currency symbols mapping
const currencySymbols = {
  'USD': '$',
  'CAD': 'C$',
  'MXN': 'MX$',
  'GBP': '£',
  'CNY': '¥',
  'INR': '₹',
  'BRL': 'R$',
  'JPY': '¥',
  'ARS': 'ARS$',
  'ZAR': 'R',
  'CLP': 'CLP$',
  'CRC': '₡',
  'SVC': '₡',
  'GTQ': 'Q',
  'HNL': 'L',
  'NIO': 'C$',
  'KPW': '₩',
  'KRW': '₩'
};

function App() {
  const [data, setData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [walmartPrice, setWalmartPrice] = useState(0);
  const [competitorPrice, setCompetitorPrice] = useState(0);
  const [predictedPrice, setPredictedPrice] = useState(0);
  const [segment, setSegment] = useState('new');
  const [currency, setCurrency] = useState('USD'); // Default currency

  useEffect(() => {
    Papa.parse('/walmart_products.csv', {
      download: true,
      header: true,
      complete: (result) => {
        setData(result.data);
      },
    });
  }, []);

  const updatePrices = () => {
    const product = data.find(item => item.PRODUCT_NAME === selectedProduct);
    if (product) {
      const newCompetitorPrice = fetchCompetitorPrice(product);
      setCompetitorPrice(newCompetitorPrice);
      setWalmartPrice(Number(product.PRICE_CURRENT)); 
      handlePriceAdjustment(product, newCompetitorPrice);
    }
  };

  const handlePriceAdjustment = (product, competitorPrice) => {
    const seasonFactor = calculateSeasonFactor();
    const currentSales = product.sales || 100; 

    const recommendedPrice = getAIRecommendations(product, competitorPrice, seasonFactor, currentSales, segment);
    setPredictedPrice(Number(recommendedPrice));
  };

  useEffect(() => {
    if (selectedProduct) {
      updatePrices();
    }
  }, [selectedProduct, selectedCategory, segment, currency]);

  const categories = [...new Set(data.map(item => item.CATEGORY))];
  const products = data.filter(item => item.CATEGORY === selectedCategory);

  const convertCurrency = (price) => {
    return price * (currencyRates[currency] || 1);
  };

  return (
    <div className="App">
      <h1>Walmart Dynamic Pricing Tool</h1>
      <div className="selector">
        <h2>Select Category:</h2>
        <select onChange={(e) => setSelectedCategory(e.target.value)} value={selectedCategory}>
          <option value="">Select a category</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <div className="selector">
        <h2>Select Product:</h2>
        <select onChange={(e) => setSelectedProduct(e.target.value)} value={selectedProduct}>
          <option value="">Select a product</option>
          {products.map((product, index) => (
            <option key={index} value={product.PRODUCT_NAME}>
              {product.PRODUCT_NAME}
            </option>
          ))}
        </select>
      </div>
      <div className="customer-segment">
        <h2>Select Customer Segment:</h2>
        <select onChange={(e) => setSegment(e.target.value)} value={segment}>
          <option value="new">New Customer</option>
          <option value="loyal">Loyal Customer</option>
          <option value="bulk">Bulk Buyer</option>
        </select>
      </div>
      <div className="currency-selector">
        <h2>Select Currency:</h2>
        <select onChange={(e) => setCurrency(e.target.value)} value={currency}>
          <option value="USD">USD</option>
          <option value="CAD">CAD</option>
          <option value="MXN">MXN</option>
          <option value="GBP">GBP</option>
          <option value="CNY">CNY</option>
          <option value="INR">INR</option>
          <option value="BRL">BRL</option>
          <option value="JPY">JPY</option>
          <option value="ARS">ARS</option>
          <option value="ZAR">ZAR</option>
          <option value="CLP">CLP</option>
          <option value="CRC">CRC</option>
          <option value="SVC">SVC</option>
          <option value="GTQ">GTQ</option>
          <option value="HNL">HNL</option>
          <option value="NIO">NIO</option>
          <option value="KPW">KPW</option>
          <option value="KRW">KRW</option>
        </select>
      </div>
      <div className="pricing-info">
        <h2>Product: {selectedProduct || 'Select a product'}</h2>
        <h2>Current Walmart Price: {currencySymbols[currency]}{convertCurrency(walmartPrice).toFixed(2)} {currency}</h2>
        <h2>Competitor Price: {currencySymbols[currency]}{convertCurrency(competitorPrice).toFixed(2)} {currency}</h2>
        <h2>Customer Segment: {segment}</h2>
        <h2>AI-Predicted Price: {currencySymbols[currency]}{convertCurrency(predictedPrice).toFixed(2)} {currency}</h2>
      </div>
    </div>
  );
}

export default App;