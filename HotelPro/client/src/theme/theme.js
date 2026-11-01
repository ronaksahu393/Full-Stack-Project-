import { createTheme } from "@mui/material/styles";

export const hotelProTheme = createTheme({
  palette: {
    primary: {
      main: "#173F35", // Forest Green
      light: "#2A5A4E",
      dark: "#102E28",
      contrastText: "#FFFFFF"
    },
    secondary: {
      main: "#C4A46B", // Muted Gold
      light: "#D8BF8F",
      dark: "#9E8047",
      contrastText: "#173F35"
    },
    background: {
      default: "#F8F6F0", // Warm Ivory
      paper: "#FFFFFF"
    },
    text: {
      primary: "#252923", // Deep Charcoal
      secondary: "#72776F", // Refined Muted Gray
      disabled: "#A4A8A0"
    },
    divider: "#E7E3D9",
    success: {
      main: "#287A55",
      light: "#E8F5EE",
      contrastText: "#FFFFFF"
    },
    warning: {
      main: "#B77924",
      light: "#FEF8EE",
      contrastText: "#FFFFFF"
    },
    error: {
      main: "#B83D3D",
      light: "#FDEDED",
      contrastText: "#FFFFFF"
    },
    info: {
      main: "#2B5C6E",
      light: "#EBF3F5",
      contrastText: "#FFFFFF"
    }
  },
  typography: {
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 600,
      letterSpacing: "-0.02em",
      color: "#173F35"
    },
    h2: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 500,
      letterSpacing: "-0.015em",
      color: "#173F35"
    },
    h3: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 500,
      letterSpacing: "-0.01em",
      color: "#173F35"
    },
    h4: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 500,
      color: "#173F35"
    },
    h5: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 500,
      color: "#173F35"
    },
    h6: {
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "#173F35",
      fontSize: "0.875rem"
    },
    subtitle1: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "1rem",
      color: "#252923",
      fontWeight: 400
    },
    subtitle2: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "0.875rem",
      color: "#72776F",
      fontWeight: 500
    },
    body1: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "0.9375rem",
      lineHeight: 1.6,
      color: "#252923"
    },
    body2: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "0.8125rem",
      lineHeight: 1.5,
      color: "#72776F"
    },
    button: {
      fontFamily: "'DM Sans', sans-serif",
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      fontWeight: 600,
      fontSize: "0.8125rem"
    },
    caption: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "0.75rem",
      color: "#72776F",
      letterSpacing: "0.04em"
    },
    overline: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "0.6875rem",
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      fontWeight: 700,
      color: "#C4A46B"
    }
  },
  shape: {
    borderRadius: 0 // Clean, refined architectural boutique aesthetic
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: "10px 24px",
          transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
          "&:hover": {
            transform: "translateY(-1px)"
          }
        },
        containedPrimary: {
          backgroundColor: "#173F35",
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#102E28",
            boxShadow: "0 6px 18px rgba(23, 63, 53, 0.22)"
          }
        },
        containedSecondary: {
          backgroundColor: "#C4A46B",
          color: "#173F35",
          fontWeight: 700,
          "&:hover": {
            backgroundColor: "#B39155",
            boxShadow: "0 6px 18px rgba(196, 164, 107, 0.3)"
          }
        },
        outlinedPrimary: {
          borderColor: "#173F35",
          color: "#173F35",
          "&:hover": {
            backgroundColor: "rgba(23, 63, 53, 0.04)",
            borderColor: "#102E28"
          }
        },
        outlinedSecondary: {
          borderColor: "#C4A46B",
          color: "#C4A46B",
          "&:hover": {
            backgroundColor: "rgba(196, 164, 107, 0.08)",
            borderColor: "#9E8047"
          }
        }
      }
    },
    MuiCard: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: "1px solid #E7E3D9",
          backgroundColor: "#FFFFFF",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          "&:hover": {
            boxShadow: "0 12px 32px rgba(23, 63, 53, 0.09)",
            borderColor: "rgba(196, 164, 107, 0.6)"
          }
        }
      }
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        root: {
          borderRadius: 0
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: "#FFFFFF",
          "& fieldset": {
            borderColor: "#E7E3D9",
            transition: "border-color 0.2s ease"
          },
          "&:hover fieldset": {
            borderColor: "#C4A46B"
          },
          "&.Mui-focused fieldset": {
            borderColor: "#173F35",
            borderWidth: "1.5px"
          }
        },
        input: {
          padding: "12px 14px",
          fontSize: "0.875rem"
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.875rem",
          color: "#72776F",
          "&.Mui-focused": {
            color: "#173F35"
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          fontWeight: 500,
          fontSize: "0.75rem",
          letterSpacing: "0.03em"
        },
        filled: {
          backgroundColor: "#F8F6F0",
          color: "#173F35",
          border: "1px solid #E7E3D9"
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          border: "1px solid #E7E3D9",
          boxShadow: "0 24px 60px rgba(23, 63, 53, 0.18)"
        }
      }
    },
    MuiRating: {
      styleOverrides: {
        iconFilled: {
          color: "#C4A46B"
        },
        iconEmpty: {
          color: "#D8D2C4"
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#E7E3D9"
        }
      }
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: "#173F35"
        },
        thumb: {
          borderRadius: 0,
          width: 14,
          height: 14,
          backgroundColor: "#C4A46B",
          border: "2px solid #FFFFFF",
          "&:hover, &.Mui-focusVisible": {
            boxShadow: "0 0 0 8px rgba(196, 164, 107, 0.16)"
          }
        },
        track: {
          backgroundColor: "#173F35"
        },
        rail: {
          backgroundColor: "#E7E3D9",
          opacity: 1
        }
      }
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          "&.Mui-selected": {
            backgroundColor: "#173F35",
            color: "#FFFFFF",
            "&:hover": {
              backgroundColor: "#102E28"
            }
          }
        }
      }
    }
  }
});
