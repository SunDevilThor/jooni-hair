# jooni.hair

Production website for Joon, an alternative hair stylist working out of
The Parlour SCV in Santa Clarita Valley, California.

Live: https://sundevilthor.github.io/jooni-hair/

## Build

Fully custom code. No framework, no template, no build step, no
dependencies. Plain HTML, hand written CSS and vanilla JavaScript,
deployed as static files.

```
index.html      Home
services.html   Service list, no prices until the client supplies them
gallery.html    Filterable gallery with a keyboard accessible lightbox
book.html       Booking flow, DM message composer, deposit slot
about.html      About Joon, products, custom colour work
404.html
css/style.css   All styling, mobile first
css/fonts.css   Self hosted Syne and Inter, no third party font request
js/main.js      All behaviour, one file, guarded per page
assets/         Self hosted images, video and fonts
```

## Media

Every image and clip is self hosted from Joon's own posts. There are no
Instagram embeds anywhere on the site, by standing instruction.
Photos are served as WebP with a JPEG fallback through `<picture>`, with
a 600w and 1100w pair per image and lazy loading below the fold.

## Two things to change when the client sends them

**1. A payment link.** Open `js/main.js` and paste her Square or Stripe
URL into `CONFIG.DEPOSIT_URL`. The deposit button on the booking page
appears automatically and the Instagram DM button steps down to
secondary. Leave it empty and the site stays on the DM only flow.

**2. Prices.** Every row in `services.html` has an empty
`<span class="menu__price" data-price="">`. Put the price inside the
span and it renders. Empty spans stay hidden, so no invented numbers
ever appear.

## Custom domain

Add a `CNAME` file containing the domain, then point the registrar's DNS
at GitHub Pages. Update the `canonical` and `og:url` tags in the five
HTML files, plus `robots.txt` and `sitemap.xml`, from the
github.io address to the new domain at the same time.

---
Built by [BUILDS By Thor](https://buildsbythor.com).
