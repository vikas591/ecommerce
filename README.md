# Modern Streetwear Website

A premium, responsive e-commerce website with WhatsApp checkout integration.

## Features
- **Modern UI/UX**: Dark mode aesthetic, smooth animations, and responsive design.
- **WhatsApp Checkout**: Orders are formatted and sent directly to your WhatsApp business number.
- **User Accounts**: Profiles are saved locally (localStorage), so customers don't have to re-enter details.
- **Order History**: Customers can view their past orders.
- **Mobile Optimized**: Full mobile support with a hamburger menu and touch-friendly interface.

## Setup & Customization
1. **Open the Website**: Simply open `index.html` in any web browser.
2. **Set Your Number**:
   - Open `script.js` in a text editor (like VS Code or Notepad).
   - Find `const phoneNumber = ...` (around line 159).
   - Replace the number with your own WhatsApp Business number (include country code, omit `+` or spaces if needed by the API, but `wa.me` usually handles clean numbers well).
3. **Add Products**:
   - Open `script.js`.
   - Edit the `products` array at the top of the file to add your own items, prices, and image URLs.

## Files
- `index.html`: Main website structure.
- `style.css`: All styling and responsiveness.
- `script.js`: Logic for cart, profile, and checkout.
- `hero_banner.png`: Main banner image.

## Credits
Built with HTML5, CSS3, and Vanilla JavaScript.
