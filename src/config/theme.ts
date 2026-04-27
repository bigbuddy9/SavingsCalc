/**
 * Single source of truth for white-labeling.
 * Swap brand name, palette, and copy here without touching components.
 */
export const theme = {
  brand: {
    name: "Solar",
    productName: "Solar Savings Analysis",
    tagline: "Your 25-year financial picture, end-to-end.",
  },

  copy: {
    section1: {
      eyebrow: "Section 01 · The cost of doing nothing",
      title: "The real cost of your power.",
      tableNote:
        "Calculations compound at an indicative 8% annual price increase, based on industry forecasts for national electricity pricing and the past decade of recorded price rises.",
      closingTagline: "That's not a typo. That's the real cost of doing nothing.",
    },
    section2: {
      eyebrow: "Section 02 · Your custom system",
      title: "Your custom solar system.",
      chartTitle: "Estimated daily solar production by month",
      chartSubtitle:
        "Bars show daily production. The yellow line is your daily usage — green months cover it; amber months fall short.",
      closingTagline: "And that number grows every year as power prices rise.",
    },
    section3: {
      eyebrow: "Section 03 · Your investment, fully broken down",
      title: "Your investment breakdown.",
      stcNote:
        "STCs (Small-scale Technology Certificates) are the federal government solar rebate, deducted directly from your install price.",
    },
    section4: {
      eyebrow: "Section 04 · Your 25-year savings vs repayments",
      title: "Your 25-year savings story.",
      intro:
        "This is the real picture: your loan repayments versus the savings you'll make on your power bill, every year for the next 25 years.",
      chartTitle: "25-year cumulative savings vs repayments",
      chartSubtitle:
        "Orange = your total solar savings. Green = your loan repayments. Once the loan is paid off, savings keep growing — for free.",
      heroLabel: "You're cashflow positive from",
      heroSublabel:
        "From this year onwards, your solar savings exceed your loan repayments — every year.",
    },
    final: {
      title: "The final comparison.",
      withoutLabel: "Without solar (25 years)",
      withLabel: "With solar (25 years, net)",
      swingLabel: "Total lifetime difference",
      swingDesc: "in your favour by going solar.",
    },
  },
};

export type Theme = typeof theme;
