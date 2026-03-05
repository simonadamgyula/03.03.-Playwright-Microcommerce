import { test, expect } from '@playwright/test';
import { env } from 'node:process';

test.describe('Product details and cart', ()=>{
    test.beforeEach(async ({page}) =>{
        expect(env.URL).toBeDefined();
        const response = await page.goto((env.URL!).toString());
        expect(response?.status()).toBe(200);

        //Setting up for checkout
        await page.locator(".product-card").nth(1).click();
        await page.locator("button[aria-label='Aumenta quantità']").click();
        await page.locator(".add-to-cart-btn").click();
        await page.locator(".p-small.reset-btn.close-btn").click();

        //More items for last test
        await page.locator(".product-card .info-wrap > h2").filter({hasText: 'Prova 3'}).click();
        await page.locator(".add-to-cart-btn").click();
        await page.locator(".p-small.reset-btn.close-btn").click();

        await page.locator(".cart-btn").click();
        await page.locator(".summary .action-btn").click();

        await expect(page.locator(".checkout-flow")).toBeVisible();
    });

    //TODO: continue from 4.
    test('Checkout form display', async ({page}) => {
        await expect(page.locator("input[id='billing_info_customer_firstname']")).toBeVisible();
        await expect(page.locator("input[id='billing_info_customer_lastname']")).toBeVisible();
        await expect(page.locator("select[id='billing_info_country']")).toBeVisible();
        await expect(page.locator("input[id='billing_info_address']")).toBeVisible();
        await expect(page.locator("input[id='billing_info_postcode']")).toBeVisible();
        await expect(page.locator("input[id='billing_info_city']")).toBeVisible();
        await expect(page.locator("input[id='billing_info_province']")).toBeVisible();
        await expect(page.locator("input[id='billing_info_customer_email']")).toBeVisible();
        await expect(page.locator("input[id='billing_info_customer_phone_number']")).toBeVisible();
        await expect(page.locator("input[id='shipping-checkbox']")).toBeVisible();
    });

    test('Form validation', async ({page}) =>{
        await page.locator(".pay-btn").click();
        await expect(page.locator(".checkout-flow")).toBeVisible();
        await expect(page.locator('.error-msg')).toHaveCount(9);
    });

    test('Error message', async ({page}) => {
        await page.locator("input[id='billing_info_customer_firstname']").fill("Jakab");
        await page.locator("input[id='billing_info_customer_lastname']").fill("Gipsz");
        await page.locator("select[id='billing_info_country']").selectOption('Austria');
        await page.locator("input[id='billing_info_address']").fill("Test Street 21");
        await page.locator("input[id='billing_info_postcode']").fill("gfjd");
        await page.locator("input[id='billing_info_city']").fill("Wien");
        await page.locator("input[id='billing_info_province']").fill("-");
        await page.locator("input[id='billing_info_customer_email']").fill("notanemail");
        await page.locator("input[id='billing_info_customer_phone_number']").fill("notphonenumber");
        await page.locator(".pay-btn").click();
        
        const errorMsgs = page.locator(".error-msg");
        await expect(errorMsgs).toHaveCount(3); //ZIP and Phone number does not work
        for(let msg of await errorMsgs.elementHandles()){
            expect(await msg.textContent()).toContain("valid");
        }
    });

    test('Different shipping address', async ({page}) => {
        await page.locator("input[id='shipping-checkbox']").uncheck();
        await expect(page.locator(".shipping-fields")).toBeVisible();
    });

    test('Sees order summary', async ({page}) => {
        await expect(page.locator(".order-summary")).toBeVisible();
        await expect(page.locator(".summary-list")).toBeVisible();
        await expect(page.locator(".qty-badge").first()).toBeVisible();
        await expect(page.locator(".grand-total-row")).toBeVisible();
    })

    test('Back to cart', async ({page}) => {
        await page.waitForSelector("h4.item-name", {state: 'visible'});
        const prodNames = await page.locator("h4.item-name").allTextContents();
        let qtysLocator = page.locator(".qty-badge").all();
        const qtys = await Promise.all(
            (await qtysLocator).map(async value => (await value.textContent())?.at(1))
        );

        await page.locator(".back-btn").click();
        expect(await page.locator(".item-info>h3").allTextContents()).toEqual(prodNames);
        qtysLocator = page.locator(".qty-controls>input").all();
        const cartQtys = await Promise.all(
            (await qtysLocator).map(input => (input.inputValue()))
        )

        expect(cartQtys).toEqual(qtys);
    });

});