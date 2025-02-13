import { StyleSheet } from 'react-native';
import { colors } from './common';

// Apply this style to the root div element
export const globalStyles = `
  #root {
    background-color: ${colors.background.page} !important;
  }
  
  body {
    background-color: ${colors.background.page} !important;
  }
  
  .css-view-175oi2r.r-backgroundColor-1jh0li6.r-flex-13awgt0 {
    background-color: ${colors.background.page} !important;
  }

  /* Target all possible combinations */
  div[class*="css-view-175oi2r"][class*="r-backgroundColor-1jh0li6"] {
    background-color: ${colors.background.page} !important;
  }

  /* Override any inline styles */
  *[style*="background-color: rgb(255, 255, 255)"] {
    background-color: ${colors.background.page} !important;
  }
`; 