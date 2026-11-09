import os

os.makedirs('public/assets/badges', exist_ok=True)

badges = {
    'brilliant.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="100%" height="100%">
  <circle cx="20" cy="20" r="18" fill="#1baca6" stroke="#ffffff" stroke-width="2"/>
  <path d="M8 12 L9 9 L12 8 L9 7 L8 4 L7 7 L4 8 L7 9 Z" fill="#ffffff"/>
  <path d="M32 28 L33 26 L35 25 L33 24 L32 22 L31 24 L29 25 L31 26 Z" fill="#ffffff"/>
  <text x="20" y="26" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="18" fill="#ffffff" text-anchor="middle">!!</text>
</svg>''',

    'great.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="100%" height="100%">
  <circle cx="20" cy="20" r="18" fill="#457abb" stroke="#ffffff" stroke-width="2"/>
  <text x="20" y="27" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle">!</text>
</svg>''',

    'best.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="100%" height="100%">
  <circle cx="20" cy="20" r="18" fill="#81b64c" stroke="#ffffff" stroke-width="2"/>
  <polygon points="20,8 23.5,15.5 31.5,16.5 25.5,22 27.2,30 20,26 12.8,30 14.5,22 8.5,16.5 16.5,15.5" fill="#ffffff"/>
</svg>''',

    'excellent.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="100%" height="100%">
  <circle cx="20" cy="20" r="18" fill="#81b64c" stroke="#ffffff" stroke-width="2"/>
  <path d="M13 21 L18 26 L27 15" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>''',

    'good.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="100%" height="100%">
  <circle cx="20" cy="20" r="18" fill="#6f9943" stroke="#ffffff" stroke-width="2"/>
  <path d="M13 21 L18 26 L27 15" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>''',

    'book.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="100%" height="100%">
  <circle cx="20" cy="20" r="18" fill="#a88865" stroke="#ffffff" stroke-width="2"/>
  <path d="M11 15.5 C14 14.5 17 15 20 16.5 C23 15 26 14.5 29 15.5 L29 25.5 C26 24.5 23 25 20 26.5 C17 25 14 24.5 11 25.5 Z" fill="#ffffff"/>
  <line x1="20" y1="16.5" x2="20" y2="26.5" stroke="#a88865" stroke-width="1.5"/>
</svg>''',

    'inaccuracy.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="100%" height="100%">
  <circle cx="20" cy="20" r="18" fill="#f0c15c" stroke="#ffffff" stroke-width="2"/>
  <text x="20" y="26" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="18" fill="#ffffff" text-anchor="middle">?!</text>
</svg>''',

    'mistake.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="100%" height="100%">
  <circle cx="20" cy="20" r="18" fill="#e58f2a" stroke="#ffffff" stroke-width="2"/>
  <text x="20" y="27" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle">?</text>
</svg>''',

    'blunder.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="100%" height="100%">
  <circle cx="20" cy="20" r="18" fill="#ca3431" stroke="#ffffff" stroke-width="2"/>
  <text x="20" y="26" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="18" fill="#ffffff" text-anchor="middle">??</text>
</svg>''',

    'miss.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="100%" height="100%">
  <circle cx="20" cy="20" r="18" fill="#d04e4e" stroke="#ffffff" stroke-width="2"/>
  <path d="M14 14 L26 26 M26 14 L14 26" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
</svg>'''
}

for name, svg in badges.items():
    with open(os.path.join('public/assets/badges', name), 'w', encoding='utf-8') as f:
        f.write(svg)

print('Generated all 10 badges!')

