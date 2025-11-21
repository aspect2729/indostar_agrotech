# 🎨 Color Palette Update

## New Nature-Inspired Green Theme

Your website has been updated with a beautiful nature-inspired green color palette.

### Color Palette

| Color | Hex Code | Usage |
|-------|----------|-------|
| Light Yellow | `#F0E491` | Accents, highlights, warnings |
| Light Green | `#BBC863` | Secondary actions, borders |
| Medium Green | `#658C58` | Success states, text secondary |
| Dark Green | `#31694E` | Primary actions, main brand color |

### CSS Variables Updated

```css
--primary-color: #31694E      /* Dark green - main brand */
--primary-dark: #1e4030       /* Darker green - hover states */
--primary-light: #658C58      /* Medium green - lighter elements */
--secondary-color: #BBC863    /* Light green - secondary actions */
--secondary-dark: #9aa84f     /* Darker light green */
--secondary-light: #F0E491    /* Light yellow - accents */
```

### What Changed

- **Primary buttons**: Now use dark green (#31694E)
- **Secondary buttons**: Now use light green (#BBC863)
- **Accents**: Light yellow (#F0E491) for highlights
- **Text colors**: Updated to match the green theme
- **Borders**: Light green for subtle separation

### Files Updated

- `frontend/src/styles/index.css` - Main color variables

### Next Steps

To see the changes:

1. The colors are now defined in CSS variables
2. All components using these variables will automatically update
3. Deploy to see changes live:
   ```bash
   vercel --prod
   ```

### Preview

The new color scheme creates a natural, organic feel perfect for an agrotech e-commerce platform:
- Warm yellow tones evoke sunshine and growth
- Green shades represent nature and agriculture
- Professional yet approachable aesthetic

---

**Note**: The changes are applied through CSS variables, so all existing components will automatically use the new colors!
