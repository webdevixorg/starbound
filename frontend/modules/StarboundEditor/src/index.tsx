import { render } from 'react-dom';

import App from './App';

const rootElement = document.getElementById('root');
render(
  <App
    value={''}
    onChange={function (): void {
      throw new Error('Function not implemented.');
    }}
  />,
  rootElement
);
