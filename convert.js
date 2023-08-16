import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from './src/App.js'; 

const html = ReactDOMServer.renderToStaticMarkup(<App />);

console.log(html);
