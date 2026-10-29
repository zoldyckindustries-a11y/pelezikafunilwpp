import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			inter: [
  				'var(--font-inter)',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				blue: '#00C4FF',
  				purple: '#C874FF',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			text: {
  				secondary: '#6b6b6b',
  				muted: '#4A4A4A'
  			},
  			border: 'hsl(var(--border))',
  			purple: {
  				'100': '#F3E8FF',
  				'200': '#E9D5FF',
  				'300': '#D8B4FE'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		backgroundImage: {
  			'primary-gradient': 'linear-gradient(135deg, #00C4FF 0%, #C874FF 100%)',
  			'gradient-radial': 'radial-gradient(circle, #FDF6FF, #FFFFFF)',
  			'gradient-radial-top-left': 'radial-gradient(circle at top left, #FDF6FF, #FFFFFF)',
  			'gradient-ethereal': 'linear-gradient(90deg, #C8B6FF, #F9C7F8)',
  			'border-gradient': 'linear-gradient(45deg, #F9C7F8, #C88FFF)'
  		},
  		backdropBlur: {
  			lg: '16px'
  		},
  		boxShadow: {
  			'purple-glow': '0 0 8px rgba(200, 143, 255, 0.5)',
  			'blue-glow': '0 4px 16px rgba(0, 196, 255, 0.3)',
  			'ethereal-glow': '0 12px 30px rgba(200, 143, 255, 0.15)',
  			'ethereal-hover': '0 0 20px rgba(200, 143, 255, 0.25)'
  		},
  		borderRadius: {
  			'3xl': '1.5rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontSize: {
  			xl: [
  				'1.25rem',
  				{
  					lineHeight: '1.3',
  					fontWeight: '700'
  				}
  			],
  			'2xl': [
  				'1.5rem',
  				{
  					lineHeight: '1.3',
  					fontWeight: '700'
  				}
  			]
  		},
  		fontWeight: {
  			normal: '400',
  			medium: '500',
  			semibold: '600',
  			bold: '700'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
