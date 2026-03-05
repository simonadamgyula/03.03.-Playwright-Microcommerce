import { test, expect, Page } from '@playwright/test';
import { env } from 'node:process';

test.describe('Cart modal', ()=>{
    test.beforeEach(async ({page}) => {
        expect(env.URL!).toBeDefined();
        const response = await page.goto((env.URL!).toString());
        expect(response?.status()).toBe(200);
    });

    test('Open Cart', async ({page}) =>{
        await page.locator(".product-card .info-wrap > h2").filter({hasText: 'Prova 3'}).click();
        await page.locator(".add-to-cart-btn").click();
        await page.locator(".p-small.reset-btn.close-btn").click();

        await page.locator(".cart-btn").click();
        await expect(page.locator(".checkout-flow")).toBeVisible();

        await expect(page.locator(".cart-item")).toBeVisible();
        await expect(page.locator(".summary-row > .h1")).toBeVisible();
    });

    test('Increase item count in cart', async ({page}) =>{
        await page.locator(".product-card .info-wrap > h2").filter({hasText: 'Prova 3'}).click();
        const productPrice = await getPriceFromEuro(page, ".product-details-view .current-price");
        for(let i = 0; i < 4; i++){
            await page.locator("button[aria-label='Aumenta quantità']").click();
        }
        await page.locator(".add-to-cart-btn").click();
        await page.locator(".p-small.reset-btn.close-btn").click();
        await page.locator(".cart-btn").click();

        const oldTotal = await getPriceFromEuro(page);
        await page.locator("button[aria-label='Aumenta quantità']").click();
        expect(await getPriceFromEuro(page)).toBe(oldTotal + productPrice);
    });

    test('Remove item', async ({page}) => {
        await page.locator(".product-card").first().click();
        await page.locator(".add-to-cart-btn").click();
        await page.locator(".p-small.reset-btn.close-btn").click();

        await page.locator(".product-card .info-wrap > h2").filter({hasText: 'Prova 3'}).click();
        const productPrice = await getPriceFromEuro(page, ".product-details-view .current-price");
        await page.locator(".add-to-cart-btn").click();
        await page.locator(".p-small.reset-btn.close-btn").click();

        await page.locator(".cart-btn").click();
        const oldTotal = await getPriceFromEuro(page);

        await page.locator(".cart-item").filter({has: page.getByText('Prova 3')}).getByRole('button', {name: 'Rimuovi'}).click();

        expect(await getPriceFromEuro(page)).toBe(oldTotal-productPrice);
    });

    test('Minimum order validation', async ({page}) =>{
        await page.locator(".product-card").first().click();
        await page.locator(".add-to-cart-btn").click();
        await page.locator(".p-small.reset-btn.close-btn").click();
        await page.locator(".cart-btn").click();

        await expect(page.locator(".missing-minimum-text")).toBeVisible();
        await expect(page.locator(".summary .action-btn")).toBeDisabled();
    });

    test('Checkout window', async ({page}) => {
        await page.locator(".product-card .info-wrap > h2").filter({hasText: 'Prova 3'}).click();
        for(let i = 0; i < 5; i++){
            await page.locator("button[aria-label='Aumenta quantità']").click();
        }
        await page.locator(".add-to-cart-btn").click();
        await page.locator(".p-small.reset-btn.close-btn").click();
        await page.locator(".cart-btn").click();
        await page.locator(".summary .action-btn").click();

        await expect(page.locator(".checkout-flow")).toBeVisible();
    });
});

async function getPriceFromEuro(page: Page, selector: string = ".summary-row > .h1"){
    return Number(((await page.locator(selector).textContent())?.split('€')[0])?.trim());
}