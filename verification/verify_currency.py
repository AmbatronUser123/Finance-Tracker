
from playwright.sync_api import sync_playwright
import time

def verify_currency(page):
    # 1. Go to Dashboard (root)
    print("Navigating to Dashboard...")
    page.goto("http://localhost:5173/")
    page.wait_for_timeout(2000) # Wait for load

    # 2. Go to Categories
    print("Navigating to Categories...")

    page.goto("http://localhost:5173/categories")
    page.wait_for_timeout(2000)
    page.screenshot(path="/home/jules/verification/categories.png")
    print("Captured categories.png")

    # 3. Go to Goals
    print("Navigating to Goals...")
    page.goto("http://localhost:5173/goals")
    page.wait_for_timeout(2000)
    page.screenshot(path="/home/jules/verification/goals.png")
    print("Captured goals.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_currency(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
