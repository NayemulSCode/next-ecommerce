from playwright.sync_api import Page, expect, sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3000")

    expect(page.get_by_role("navigation")).to_be_visible()
    expect(page.get_by_role("contentinfo")).to_be_visible()

    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
