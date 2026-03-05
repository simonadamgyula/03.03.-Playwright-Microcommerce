import { test, expect } from '@playwright/test';
import { env } from 'node:process';

test.describe('Product Catalog-List', ()=>{
    test.beforeEach(async ({page}) =>{
        expect(env.URL).toBeDefined();
        const response = await page.goto((env.URL!).toString());
        expect(response?.status()).toBe(200);
    });

    test('Products on page', async ({page}) =>{
        const firstProduct = page.locator(".product-card").first();
        await expect(firstProduct.locator(".img-wrap > picture")).toBeVisible();
        await expect(firstProduct.locator(".info-wrap > h2")).toBeVisible();
        await expect(firstProduct.locator(".current-price")).toBeVisible();

        await expect(page.locator(".cart-btn .badge")).toBeVisible();
    });

    test('Product modal', async({page}) =>{
        const product = await page.locator(".product-card .info-wrap > h2").filter({hasText: 'Prova 3'});
        await product.click();

        await expect(page.locator(".product-details-view img")).toBeVisible();
        await expect(page.locator(".product-details-view h2")).toBeVisible();
        await expect(page.locator(".product-details-view .current-price")).toBeVisible();
        await expect(page.locator(".product-details-view .description")).toBeVisible();
    });

    test('Modal closing', async({page}) =>{
        await page.locator(".product-card").first().click();
        
        await page.locator(".p-small.reset-btn.close-btn").click();
        await expect(page.locator(".product-details-view")).not.toBeVisible();
    })
})