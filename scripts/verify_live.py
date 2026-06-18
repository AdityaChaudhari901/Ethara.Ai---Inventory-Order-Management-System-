"""Load the deployed Vercel frontend and confirm it successfully calls the
Render backend (correct VITE_API_URL + working CORS)."""
from playwright.sync_api import sync_playwright

FRONTEND = "https://ethara-inventory-lyart.vercel.app/"
BACKEND_HOST = "inventory-api-lyf9.onrender.com"
OUT = "/tmp/ui/live-dashboard.png"

api_calls = []
console_errors = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})

    page.on(
        "response",
        lambda r: api_calls.append((r.status, r.url)) if BACKEND_HOST in r.url else None,
    )
    page.on(
        "console",
        lambda m: console_errors.append(m.text) if m.type == "error" else None,
    )

    page.goto(FRONTEND, wait_until="networkidle", timeout=90000)
    # Backend may be cold-starting; give the dashboard fetch time to resolve.
    page.wait_for_timeout(8000)
    page.screenshot(path=OUT, full_page=True)

    body = page.inner_text("body")
    browser.close()

print("=== backend API calls made by the live frontend ===")
for status, url in api_calls:
    print(f"  {status}  {url}")
if not api_calls:
    print("  (none — VITE_API_URL may be wrong)")

print("\n=== console errors (CORS shows up here) ===")
for e in console_errors:
    print(" ", e)
if not console_errors:
    print("  (none)")

print("\n=== dashboard shows the error state? ===")
print("  ", "YES — 'Couldn't load' present" if "Couldn't load" in body else "NO — rendered cleanly")
print("\nscreenshot:", OUT)
