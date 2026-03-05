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

        await page.locator(".cart-btn").click();
        await page.locator(".summary .action-btn").click();

        await expect(page.locator(".checkout-flow")).toBeVisible();

        //Filling datas
        await page.locator("input[id='billing_info_customer_firstname']").fill("Jakab");
        await page.locator("input[id='billing_info_customer_lastname']").fill("Gipsz");
        await page.locator("select[id='billing_info_country']").selectOption('Austria');
        await page.locator("input[id='billing_info_address']").fill("Test Street 21");
        await page.locator("input[id='billing_info_postcode']").fill("267");
        await page.locator("input[id='billing_info_city']").fill("Wien");
        await page.locator("input[id='billing_info_province']").fill("-");
        await page.locator("input[id='billing_info_customer_email']").fill("gipsz.jakab@example.at");
        await page.locator("input[id='billing_info_customer_phone_number']").fill("+3656123467");
        // await page.locator(".pay-btn").click();
    });

    test('Payment method Stripe', async ({page}) => {
        expect(await page.locator(".payment-option>span.method-name").allTextContents()).toContain('Stripe');
    });

    test('Proceed to stripe', async ({page}) => {
        //Total amount
        // const orderAmount = (((await page.locator(".grand-total-row").textContent())?.split('\n')[1])?.split(' ')[0])?.replace(',', '.');
        const totalText = await page.locator(".grand-total-row").textContent();
        const regexTotal = /(\d+,\d+)/;
        const match = totalText?.match(regexTotal);
        let orderAmount;
        if (match){
            orderAmount = match[1].replace(',', '.');
        }
        //button click
        await page.locator(".pay-btn").click();

        await page.waitForURL(url => url.href.includes("checkout.stripe.com"));
        expect(page.url()).toContain("checkout.stripe.com");

        expect(((await page.locator(".YGErOEoF__Subtotal .CurrencyAmount").textContent())?.split('€')[1])?.split(' ')[0]).toBe(orderAmount);
    });

    test('Successful payment', async ({page}) =>{
        await page.locator(".pay-btn").click();

        await page.locator("input#email").fill("gipszjakab@example.hu");
        await page.locator("input#cardNumber").fill("4242424242424242");
        await page.locator("input#cardExpiry").fill("02 / 28");
        await page.locator("input#cardCvc").fill("123");
        await page.locator("input#billingName").fill("Gipsz Jakab");
        await page.locator(".SubmitButton").click();

        // Wait for redirection
        await page.waitForURL(url => url.href.includes("https://easylab-wp.im-media.it/"));

        await expect(page.locator(".checkout-flow .thank-you-view")).toBeVisible();
    });

    test.skip('Failed payment', async ({page})=> {
        //Payment, dont have card details for card that throws back to main page
        await expect(page.locator(".status-dialog")).toBeVisible();
        expect(await page.locator(".status-dialog h3.h4").textContent()).toContain('Error');
    })
});