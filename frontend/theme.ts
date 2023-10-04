import { extendTheme } from "@mui/joy/styles";

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          "50": "#fafafa",
          "100": "#f4f4f5",
          "200": "#e4e4e7",
          "300": "#d4d4d8",
          "400": "#a1a1aa",
          "500": "#18181b",
          "600": "#18181b",
          "700": "#18181b",
          "800": "#18181b",
          "900": "#18181b"
        }
      }
    },
    dark: {
      palette: {}
    }
  }
});

export default theme;
