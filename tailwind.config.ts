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
					'fuck-card': 'hsl(var(--quiz-fuck-card))',
					'fuck-text': 'hsl(var(--quiz-fuck-text))',
					'fuck-strip': 'hsl(var(--quiz-fuck-strip))',
					'connection-card': 'hsl(var(--quiz-connection-card))',
					'connection-text': 'hsl(var(--quiz-connection-text))',
					'connection-strip': 'hsl(var(--quiz-connection-strip))',
					'identity-card': 'hsl(var(--quiz-identity-card))',
					'identity-text': 'hsl(var(--quiz-identity-text))',
					'identity-strip': 'hsl(var(--quiz-identity-strip))',
					'party-card': 'hsl(var(--quiz-party-card))',
					'party-text': 'hsl(var(--quiz-party-text))',
					'party-strip': 'hsl(var(--quiz-party-strip))',
					'friends-card': 'hsl(var(--quiz-friends-card))',
					'friends-text': 'hsl(var(--quiz-friends-text))',
					'friends-strip': 'hsl(var(--quiz-friends-strip))',
					'self-reflection-card': 'hsl(var(--quiz-self-reflection-card))',
					'self-reflection-text': 'hsl(var(--quiz-self-reflection-text))',
					'self-reflection-strip': 'hsl(var(--quiz-self-reflection-strip))',
					'family-card': 'hsl(var(--quiz-family-card))',
					'family-text': 'hsl(var(--quiz-family-text))',
					'family-strip': 'hsl(var(--quiz-family-strip))',
					'career-card': 'hsl(var(--quiz-career-card))',
					'career-text': 'hsl(var(--quiz-career-text))',
					'career-strip': 'hsl(var(--quiz-career-strip))',
					'travel-card': 'hsl(var(--quiz-travel-card))',
					'travel-text': 'hsl(var(--quiz-travel-text))',
					'travel-strip': 'hsl(var(--quiz-travel-strip))',
					'health-card': 'hsl(var(--quiz-health-card))',
					'health-text': 'hsl(var(--quiz-health-text))',
					'health-strip': 'hsl(var(--quiz-health-strip))',
					'money-card': 'hsl(var(--quiz-money-card))',
					'money-text': 'hsl(var(--quiz-money-text))',
					'money-strip': 'hsl(var(--quiz-money-strip))',
					'love-card': 'hsl(var(--quiz-love-card))',
					'love-text': 'hsl(var(--quiz-love-text))',
					'love-strip': 'hsl(var(--quiz-love-strip))',
					'hobby-card': 'hsl(var(--quiz-hobby-card))',
					'hobby-text': 'hsl(var(--quiz-hobby-text))',
					'hobby-strip': 'hsl(var(--quiz-hobby-strip))',
					'dreams-card': 'hsl(var(--quiz-dreams-card))',
					'dreams-text': 'hsl(var(--quiz-dreams-text))',
					'dreams-strip': 'hsl(var(--quiz-dreams-strip))',
					'fear-card': 'hsl(var(--quiz-fear-card))',
					'fear-text': 'hsl(var(--quiz-fear-text))',
					'fear-strip': 'hsl(var(--quiz-fear-strip))',
					'wisdom-card': 'hsl(var(--quiz-wisdom-card))',
					'wisdom-text': 'hsl(var(--quiz-wisdom-text))',
					'wisdom-strip': 'hsl(var(--quiz-wisdom-strip))',
					'future-card': 'hsl(var(--quiz-future-card))',
					'future-text': 'hsl(var(--quiz-future-text))',
					'future-strip': 'hsl(var(--quiz-future-strip))',
					'wer-aus-der-runde-card': 'hsl(var(--quiz-wer-aus-der-runde-card))',
					'wer-aus-der-runde-text': 'hsl(var(--quiz-wer-aus-der-runde-text))',
					'wer-aus-der-runde-strip': 'hsl(var(--quiz-wer-aus-der-runde-strip))'
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
