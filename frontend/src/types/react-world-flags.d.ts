declare module 'react-world-flags' {
  import * as React from 'react';

  interface FlagProps {
    code: string;
    style?: React.CSSProperties;
    className?: string;
  }

  const Flag: React.FC<FlagProps>;

  export default Flag;
}
