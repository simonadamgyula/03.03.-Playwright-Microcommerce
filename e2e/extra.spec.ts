import { test, expect, Page } from '@playwright/test';
import { env } from 'node:process';

test.describe('Product Catalog-List', ()=>{
    test.beforeEach(async ({page}) =>{
        expect(env.URL).toBeDefined();
        const response = await page.goto((env.URL!).toString());
        expect(response?.status()).toBe(200);
    });

    test('Cart on refresh', async ({page}) => {
        //Setting up items
        await page.locator(".product-card").nth(1).click();
        await page.locator("button[aria-label='Aumenta quantità']").click();
        await page.locator(".add-to-cart-btn").click();
        await page.locator(".p-small.reset-btn.close-btn").click();
        await page.locator(".product-card .info-wrap > h2").filter({hasText: 'Prova 3'}).click();
        await page.locator(".add-to-cart-btn").click();
        await page.locator(".p-small.reset-btn.close-btn").click();

        const productAmount = Number((await page.locator(".cart-btn .badge").textContent())?.at(0));
        await page.locator(".cart-btn").click();

        await page.waitForSelector(".item-info>h3", {state: 'visible'});
        const products = await page.locator(".item-info>h3").allTextContents();

        await page.reload();
        expect(Number((await page.locator(".cart-btn .badge").textContent())?.at(0))).toBe(productAmount);
        await page.locator(".cart-btn").click();

        expect(await page.locator(".item-info>h3").allTextContents()).toEqual(products);
    });

    test.skip('Direct access to checkout', async ({page}) =>{
        //Skipped because checkout is not accessed with link
    });

    test('Mobile viewport', async ({page}) => {
        await page.setViewportSize({width: 412, height: 914});
        await page.locator(".product-card").first().click();
        await page.locator(".add-to-cart-btn").click();
        const viewPort = page.viewportSize();

        //Product detail modal
        await checkMobileModal(page, viewPort, ".main-modal", ".description");
        await page.locator(".close-btn").first().click();

        //Getting products for cart check
        await setUpCart(page);
        await page.locator(".cart-btn").click();

        //Cart modal
        await checkMobileModal(page, viewPort, ".main-modal", ".list>.cart-item:last-of-type");
        await page.locator(".action-btn.p").click();

        //Checkout modal
        await checkMobileModal(page, viewPort, ".main-modal", ".pay-btn");
    });
});

async function setUpCart(page: Page){
    await page.locator(".product-card").nth(1).click();
    await page.locator(".add-to-cart-btn").click();
    await page.locator(".close-btn").first().click();

    await page.locator(".product-card").nth(2).click();
    await page.locator(".add-to-cart-btn").click();
    await page.locator(".close-btn").first().click();

    await page.locator(".product-card").nth(3).click();
    await page.locator(".add-to-cart-btn").click();
    await page.locator(".close-btn").first().click();
}

async function checkMobileModal(page: Page,
    viewPort: {width:number, height:number} | null,
    modalLocator:string,
    scrollItemLocator:string){
    let modal = page.locator(modalLocator);
    let box = await modal.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(viewPort!.width);
    expect(box!.height).toBeLessThanOrEqual(viewPort!.height);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    let hasHorizontalScroll = await modal.evaluate((el) => {
        return el.scrollWidth > el.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    await expect(modal).toHaveCSS('overflow-y', /auto|scroll/);
    const scrollItem = modal.locator(scrollItemLocator);
    await scrollItem.scrollIntoViewIfNeeded();
    await expect(scrollItem).toBeInViewport();
}