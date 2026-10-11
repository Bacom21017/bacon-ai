Build the hostable Bacon AI website into web/ (static files only; no server code).

The website talks to YOUR controller (your PC or cloud PC) over HTTPS using the
address + pairing token you enter. Host web/ on GitHub Pages or Cloudflare Pages,
then add that site's origin to "allowed_origins" in config.json on the controller:
    python scripts/allow_website.py https://you.github.io
