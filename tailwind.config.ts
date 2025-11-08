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
				quiz: {
					primary: 'hsl(var(--quiz-primary))',
					accent: 'hsl(var(--quiz-accent))',
					'category-bg': 'hsl(var(--quiz-category-bg))',
					'category-text': 'hsl(var(--quiz-category-text))',
					background: 'hsl(var(--quiz-background))',
					surface: 'hsl(var(--quiz-surface))',
					'card-bg': 'hsl(var(--quiz-card-bg))',
					'fuck-bg': 'hsl(var(--quiz-fuck-bg))',
					'fuck-text': 'hsl(var(--quiz-fuck-text))',
					'fuck-neon': 'hsl(var(--quiz-fuck-neon))',
					'friends-bg': 'hsl(var(--quiz-friends-bg))',
					'friends-text': 'hsl(var(--quiz-friends-text))',
					'friends-neon': 'hsl(var(--quiz-friends-neon))',
					'self-reflection-bg': 'hsl(var(--quiz-self-reflection-bg))',
					'self-reflection-text': 'hsl(var(--quiz-self-reflection-text))',
					'self-reflection-neon': 'hsl(var(--quiz-self-reflection-neon))',
					'party-bg': 'hsl(var(--quiz-party-bg))',
					'party-text': 'hsl(var(--quiz-party-text))',
					'party-neon': 'hsl(var(--quiz-party-neon))',
					'family-bg': 'hsl(var(--quiz-family-bg))',
					'family-text': 'hsl(var(--quiz-family-text))',
					'family-neon': 'hsl(var(--quiz-family-neon))',
					'connection-bg': 'hsl(var(--quiz-connection-bg))',
					'connection-text': 'hsl(var(--quiz-connection-text))',
					'connection-neon': 'hsl(var(--quiz-connection-neon))',
					'identity-bg': 'hsl(var(--quiz-identity-bg))',
					'identity-text': 'hsl(var(--quiz-identity-text))',
					'identity-neon': 'hsl(var(--quiz-identity-neon))',
					'career-bg': 'hsl(var(--quiz-career-bg))',
					'career-text': 'hsl(var(--quiz-career-text))',
					'career-neon': 'hsl(var(--quiz-career-neon))',
					'travel-bg': 'hsl(var(--quiz-travel-bg))',
					'travel-text': 'hsl(var(--quiz-travel-text))',
					'travel-neon': 'hsl(var(--quiz-travel-neon))',
					'health-bg': 'hsl(var(--quiz-health-bg))',
					'health-text': 'hsl(var(--quiz-health-text))',
					'health-neon': 'hsl(var(--quiz-health-neon))',
					'money-bg': 'hsl(var(--quiz-money-bg))',
					'money-text': 'hsl(var(--quiz-money-text))',
					'money-neon': 'hsl(var(--quiz-money-neon))',
					'love-bg': 'hsl(var(--quiz-love-bg))',
					'love-text': 'hsl(var(--quiz-love-text))',
					'love-neon': 'hsl(var(--quiz-love-neon))',
					'hobby-bg': 'hsl(var(--quiz-hobby-bg))',
					'hobby-text': 'hsl(var(--quiz-hobby-text))',
					'hobby-neon': 'hsl(var(--quiz-hobby-neon))',
					'dreams-bg': 'hsl(var(--quiz-dreams-bg))',
					'dreams-text': 'hsl(var(--quiz-dreams-text))',
					'dreams-neon': 'hsl(var(--quiz-dreams-neon))',
					'fear-bg': 'hsl(var(--quiz-fear-bg))',
					'fear-text': 'hsl(var(--quiz-fear-text))',
					'fear-neon': 'hsl(var(--quiz-fear-neon))',
					'wisdom-bg': 'hsl(var(--quiz-wisdom-bg))',
					'wisdom-text': 'hsl(var(--quiz-wisdom-text))',
					'wisdom-neon': 'hsl(var(--quiz-wisdom-neon))',
					'future-bg': 'hsl(var(--quiz-future-bg))',
					'future-text': 'hsl(var(--quiz-future-text))',
					'future-neon': 'hsl(var(--quiz-future-neon))',
					'fuck-strip': 'hsl(var(--quiz-fuck-strip))',
					'connection-strip': 'hsl(var(--quiz-connection-strip))',
					'identity-strip': 'hsl(var(--quiz-identity-strip))',
					'party-strip': 'hsl(var(--quiz-party-strip))',
					'friends-strip': 'hsl(var(--quiz-friends-strip))',
					'self-reflection-strip': 'hsl(var(--quiz-self-reflection-strip))',
					'family-strip': 'hsl(var(--quiz-family-strip))',
					'career-strip': 'hsl(var(--quiz-career-strip))',
					'travel-strip': 'hsl(var(--quiz-travel-strip))',
					'health-strip': 'hsl(var(--quiz-health-strip))',
					'money-strip': 'hsl(var(--quiz-money-strip))',
					'love-strip': 'hsl(var(--quiz-love-strip))',
					'hobby-strip': 'hsl(var(--quiz-hobby-strip))',
					'dreams-strip': 'hsl(var(--quiz-dreams-strip))',
					'fear-strip': 'hsl(var(--quiz-fear-strip))',
					'wisdom-strip': 'hsl(var(--quiz-wisdom-strip))',
					'future-strip': 'hsl(var(--quiz-future-strip))',
					'fuck-card': 'hsl(var(--quiz-fuck-card))',
					'connection-card': 'hsl(var(--quiz-connection-card))',
					'identity-card': 'hsl(var(--quiz-identity-card))',
					'party-card': 'hsl(var(--quiz-party-card))',
					'friends-card': 'hsl(var(--quiz-friends-card))',
					'self-reflection-card': 'hsl(var(--quiz-self-reflection-card))',
					'family-card': 'hsl(var(--quiz-family-card))',
					'career-card': 'hsl(var(--quiz-career-card))',
					'travel-card': 'hsl(var(--quiz-travel-card))',
					'health-card': 'hsl(var(--quiz-health-card))',
					'money-card': 'hsl(var(--quiz-money-card))',
					'love-card': 'hsl(var(--quiz-love-card))',
					'hobby-card': 'hsl(var(--quiz-hobby-card))',
					'dreams-card': 'hsl(var(--quiz-dreams-card))',
					'fear-card': 'hsl(var(--quiz-fear-card))',
					'wisdom-card': 'hsl(var(--quiz-wisdom-card))',
					'future-card': 'hsl(var(--quiz-future-card))'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-surface': 'var(--gradient-surface)'
			},
			boxShadow: {
				'glow': 'var(--shadow-glow)',
				'card': 'var(--shadow-card)'
			},
			transitionProperty: {
				'smooth': 'var(--transition-smooth)',
				'quick': 'var(--transition-quick)'
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
				'slide-in-left': {
					'0%': { transform: 'translateX(-100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'slide-out-left': {
					'0%': { transform: 'translateX(0)', opacity: '1' },
					'100%': { transform: 'translateX(-100%)', opacity: '0' }
				},
				'slide-out-right': {
					'0%': { transform: 'translateX(0)', opacity: '1' },
					'100%': { transform: 'translateX(100%)', opacity: '0' }
				},
				'glow-pulse': {
					'0%, 100%': { boxShadow: '0 0 20px hsl(280 100% 70% / 0.3)' },
					'50%': { boxShadow: '0 0 40px hsl(280 100% 70% / 0.6)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'slide-in-left': 'slide-in-left 0.5s ease-out',
				'slide-in-right': 'slide-in-right 0.5s ease-out',
				'slide-out-left': 'slide-out-left 0.3s ease-in',
				'slide-out-right': 'slide-out-right 0.3s ease-in',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
