from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to http://localhost:5173/")
            page.goto("http://localhost:5173/", timeout=60000)

            # Wait for something recognizable on the dashboard
            print("Waiting for Dashboard to load...")
            # Dashboard text is in the sidebar and header
            page.wait_for_selector('h1:has-text("Dashboard")', timeout=30000)

            # Wait a bit for charts/data to render if any
            time.sleep(2)

            # Take screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification_screenshot.png", full_page=True)
            print("Screenshot saved to verification_screenshot.png")

        except Exception as e:
            print(f"Error: {e}")
            try:
                page.screenshot(path="error_screenshot.png")
                print("Error screenshot saved.")
            except:
                pass
        finally:
            browser.close()

if __name__ == "__main__":
    run()
