import { extendTheme } from "@mui/joy/styles";

declare module "@mui/joy/styles" {
  interface Palette {
    link: string;
  }
  interface TypographySystemOverrides {
    helper: true;
  }
  interface AvatarPropsSizeOverrides {
    xs: true;
  }
}

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        link: "#0B6BCB",
        primary: {
          "50": "#dbeafe",
          "100": "#dbeafe",
          "200": "#bfdbfe",
          "300": "#93c5fd",
          "400": "#4393E4",
          "500": "#0B6EF9",
          "600": "#2563eb",
          "700": "#1d4ed8",
          "800": "#1e40af",
          "900": "#12467B"
        }
      }
    },
    dark: {
      palette: {}
    }
  },
  typography: {
    helper: {
      color: "var(--joy-palette-neutral-600)",
      fontSize: "var(--joy-fontSize-sm)",
      fontFamily: `var(--joy-fontFamily-body, "Inter", var(--joy-fontFamily-fallback, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"))`
    }
  },
  components: {
    JoyListItemButton: {
      styleOverrides: {
        root: props => ({
          ".MuiTypography-root": {
            fontWeight: theme.typography["title-lg"].fontWeight,
            color: props.theme.palette.neutral[700]
          },
          ".MuiSvgIcon-root": {
            color: props.theme.palette.neutral[700]
          }
        })
      }
    },
    JoyCard: {
      styleOverrides: {
        root: props => ({
          backgroundColor: props.theme.palette.primary[50],
          ".MuiTypography-root": {
            color: props.theme.palette.primary[400]
          }
        })
      }
    },
    JoySkeleton: {
      defaultProps: {
        animation: "wave"
      }
    },
    JoyTabs: {
      styleOverrides: {
        root: props => ({
          flexGrow: 1
        })
      }
    },
    JoyTab: {
      defaultProps: {
        variant: "plain"
      },
      styleOverrides: {
        root: props => ({
          backgroundColor: `${props.theme.palette.background.body} !important`,
          "&::after": {
            backgroundColor: props.ownerState.selected ? props.theme.palette.primary[500] : undefined
          }
        })
      }
    },
    JoyTabPanel: {
      styleOverrides: {
        root: props => ({
          backgroundColor: props.theme.palette.background.body,
          display: props.ownerState.hidden ? "none" : "flex",
          flexGrow: 1,
          flexDirection: "column",
          padding: 0
        })
      }
    },
    JoyMenu: {
      styleOverrides: {
        root: props => ({
          zIndex: props.ownerState.open ? 1300 : undefined
        })
      }
    },
    JoyTypography: {
      styleOverrides: {
        root: props => ({
          a: {
            color: props.theme.palette.link,
            textDecoration: "none",
            fontWeight: "500",
            "&:hover": {
              textDecoration: "underline"
            }
          }
        })
      }
    }
  }
});

export default theme;
