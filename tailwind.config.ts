import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				rubik: ['Rubik', 'sans-serif'],
			},
			colors: {
				// CloudSnap color palette
				'surface-light': '#F7F8FA',
				'surface-dark': '#1D1F23',
				'accent-primary': '#0A84FF',
				'accent-success': '#34C759',
				'separator': '#E5E8EB',
				
				// Keep existing shadcn colors
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'photo-drift': {
					'0%': { 
						transform: 'translateX(0px) translateY(0px) rotate(0deg)',
						opacity: '0.3'
					},
					'25%': { 
						transform: 'translateX(20px) translateY(-15px) rotate(2deg)',
						opacity: '0.7'
					},
					'50%': { 
						transform: 'translateX(-10px) translateY(-25px) rotate(-1deg)',
						opacity: '0.9'
					},
					'75%': { 
						transform: 'translateX(-20px) translateY(-10px) rotate(1deg)',
						opacity: '0.6'
					},
					'100%': { 
						transform: 'translateX(0px) translateY(0px) rotate(0deg)',
						opacity: '0.3'
					}
				},
				'bubble-enter': {
					'0%': { 
						opacity: '0',
						transform: 'translateY(20px) scale(0.95)'
					},
					'100%': { 
						opacity: '1',
						transform: 'translateY(0px) scale(1)'
					}
				},
				'pulse-button': {
					'0%': { 
						transform: 'scale(1)'
					},
					'50%': { 
						transform: 'scale(1.05)'
					},
					'100%': { 
						transform: 'scale(1)'
					}
				},
				'typing-dots': {
					'0%, 60%, 100%': { 
						transform: 'translateY(0px)',
						opacity: '0.4'
					},
					'30%': { 
						transform: 'translateY(-4px)',
						opacity: '1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'photo-drift': 'photo-drift 18s ease-in-out infinite',
				'bubble-enter': 'bubble-enter 0.35s ease-out',
				'pulse-button': 'pulse-button 2s ease-in-out',
				'typing-dots': 'typing-dots 1.4s infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
