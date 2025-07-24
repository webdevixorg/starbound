declare module '@splidejs/react-splide' {
    import React from 'react';
    import { SplideOptions } from '@splidejs/splide';
  
    export interface SplideProps {
      options?: SplideOptions;
      children?: React.ReactNode;
    }
  
    export class Splide extends React.Component<SplideProps> {}
    export class SplideSlide extends React.Component<{ children?: React.ReactNode }> {}
  }
  