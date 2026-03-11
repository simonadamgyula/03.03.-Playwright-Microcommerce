# EasyLab Microcommerce - Playwright Automated Test

This repository contains automaded test for the [EasyLab Microcommerce](https://easylab-wp.im-media.it/shop/). 
The project uses Playwright and contains test for the e-commerce website's products page, cart, checkout, payment with Stripe and some edge cases.

## Setup

1. Install [NodeJS](https://nodejs.org/en/download).
2. Clone the repository.
3. Install node modules.  
   ```npm install```
4. Install playwright and playwright dependencies  
   ```npx playwright install --with-deps```

## Setup environment variables
The tests need one environment variable to run, the website url ```URL```.

### Using ```.env```
```URL={website url}```

### Using CLI
Setting environment variables varies for each CLI environment. Make sure you use the appropriate one.

## Running the tests
Run the test with the ```npx playwright run``` command from you CLI.

## Test structure

#### ```product-list.spec.ts```
The tests in this file test the integrity of the products catalog. 
Verifies the products list, check if the product detail modal successfully opens and closes.

#### ```product-detail.spec.ts```
This file tests the integrity of the product detail modal and the cart operations.
It verifies the ability to add one or multiple products to the cart, verifies the maximum quantity and the functionality of the "Go to cart" toast.

#### ```cart-modal.spec.ts```
It tests the functionality of the cart modal. We test the ability to open the cart modal, 
modify the quantity of products or remove them from the cart, we test the minimum order limit and the ability to access the checkout modal.

#### ```checkout-modal.spec.ts```
This file contains the test for the checkout modal. It test the required field validation, 
the format validation (for email, ZIP, phone), and the order summary at checkout.

#### ```payment.spec.ts```
This file verifies the behaviour of the payment process using Stripe. 
It check if the user is able to complete payment using Stripe and if the fail and success states are handled correctly.

#### ```extra.spec.ts```
This file verifies some edge cases, like cart persistance when navigating pages and the modal responsiveness when using a phone to view the website.
