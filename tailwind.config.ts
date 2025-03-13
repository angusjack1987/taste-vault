
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
			colors: {
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
				},
				// Updated vibrant color palette
				sunshine: {
					50: '#FFFDF5',
					100: '#FFFAEB',
					200: '#FFF5D6',
					300: '#FFF0C2',
					400: '#FFE69A',
					500: '#FFDC72',
					600: '#FFCE3A',
					700: '#FFBD00',
					800: '#CC9700',
					900: '#513C06',
				},
				charcoal: {
					50: '#F5F5F5',
					100: '#E6E6E6',
					500: '#333333',
					600: '#242424',
					700: '#1A1A1A',
					800: '#121212',
					900: '#0A0A0A',
				},
				citrus: {
					50: '#FFFDE7',
					100: '#FFF9C4',
					300: '#FFF176',
					500: '#FFEB3B',
					600: '#FDD835',
					700: '#FBC02D',
					800: '#F9A825',
					900: '#F57F17',
				},
				seafoam: {
					50: '#E8F5E9',
					100: '#C8E6C9',
					300: '#81C784',
					500: '#4CAF50',
					600: '#3D8B40',
					700: '#388E3C',
					900: '#1B5E20',
				},
				berry: {
					50: '#F8E0EB',
					100: '#F1C1D7',
					300: '#E684AF',
					500: '#E91E63',
					600: '#D81B60',
					700: '#C2185B',
					900: '#880E4F',
				},
				ocean: {
					50: '#E3F2FD',
					100: '#BBDEFB',
					300: '#64B5F6',
					500: '#2196F3',
					600: '#1E88E5',
					700: '#1976D2',
					900: '#0D47A1',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'vibrant': '0 4px 14px -4px rgba(255, 220, 72, 0.6)',
				'neo': '8px 8px 0 0 #000',
				'playful': '0 10px 25px -5px rgba(255, 189, 0, 0.25)',
				'glow': '0 0 15px rgba(255, 220, 72, 0.5)',
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
				'pulse-shadow': {
					'0%, 100%': {
						boxShadow: '0 0 0 0 rgba(255, 220, 72, 0.4)'
					},
					'50%': {
						boxShadow: '0 0 0 15px rgba(255, 220, 72, 0)'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'bounce-light': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-shadow': 'pulse-shadow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'float': 'float 5s ease-in-out infinite',
				'bounce-light': 'bounce-light 2s ease-in-out infinite'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-sunshine': 'linear-gradient(135deg, #FFFDF5 0%, #FFDC72 100%)',
				'gradient-citrus': 'linear-gradient(135deg, #FFFDE7 0%, #FFEB3B 100%)',
				'gradient-seafoam': 'linear-gradient(135deg, #E8F5E9 0%, #4CAF50 100%)',
				'gradient-ocean': 'linear-gradient(135deg, #E3F2FD 0%, #2196F3 100%)',
				'gradient-berry': 'linear-gradient(135deg, #F8E0EB 0%, #E91E63 100%)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
