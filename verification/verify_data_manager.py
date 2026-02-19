from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    print("Navigating to dashboard...")
    # Wait for server to start
    try:
        page.goto("http://localhost:5173", timeout=30000)
    except Exception as e:
        print(f"Failed to load page: {e}")
        browser.close()
        return

    # Navigate to Data section
    print("Clicking Data menu...")

    try:
        # Check if mobile menu button is visible (small screen) or just try to find the button
        # The sidebar might be hidden on small screens, but headless usually defaults to 1280x720
        page.get_by_role("button", name="Data").click()

        # Wait for Data Manager to load
        print("Waiting for Data Management header...")
        page.wait_for_selector("h2:has-text('Data Management')")

        # Take screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification/data_manager.png")
        print("Screenshot saved to verification/data_manager.png")
    except Exception as e:
        print(f"Error during verification: {e}")
        page.screenshot(path="verification/error.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
