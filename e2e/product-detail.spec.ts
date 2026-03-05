import { test, expect, Page } from '@playwright/test';
import { env } from 'node:process';

test.describe('Product details and cart', ()=>{
    test.beforeEach(async ({page}) =>{
        expect(env.URL).toBeDefined();
        const response = await page.goto((env.URL!).toString());
        expect(response?.status()).toBe(200);
    });

    test('Add product to cart', async ({page}) => {

        const oldCart = await getCartNmbr(page);
        await page.locator(".product-card .info-wrap > h2").filter({hasText: 'Prova 3'}).click();
        await page.locator(".add-to-cart-btn").click();
        await expect(page.locator(".notice-toast")).toBeVisible();

        expect(await getCartNmbr(page)).toBeGreaterThan(oldCart);
    });

    test('Custom quantity', async({page}) => {
        const oldCartCount = await getCartNmbr(page);
        await page.locator(".product-card .info-wrap > h2").filter({hasText: 'Prova 3'}).click();
        await page.locator("button[aria-label='Aumenta quantità']").dblclick();
        await page.locator(".add-to-cart-btn").click();
        expect(await getCartNmbr(page)).toBe(oldCartCount+3);
    });

    test('Maximum quantity', async ({page}) => {
        //Quantity limited at 8 on website?
        await page.locator(".product-card .info-wrap > h2").filter({hasText: 'Prova 3'}).click();
        await page.locator("#qty").fill('15');
        page.keyboard.press('Enter');
        await expect(page.locator("#qty")).toHaveValue('10');
    });

    test('Cart modal from toast', async ({page}) => {
        await page.locator(".product-card .info-wrap > h2").filter({hasText: 'Prova 3'}).click();
        await page.locator(".add-to-cart-btn").click();
        await page.locator(".btn-base.notice-cart-btn").click();
        await expect(page.locator(".checkout-flow")).toBeVisible();
    });
});

async function getCartNmbr(page: Page, selector: string = ".cart-btn .badge"){
    const numberText = await page.locator(selector).textContent();
    const regex = /([1-9][0-9]*).*/;
    const match = numberText?.match(regex);
    if(match){
        return Number(match[1]);
    }

    return Number((await page.locator(selector).textContent())?.split('p')[0])
}