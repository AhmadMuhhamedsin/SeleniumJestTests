const {Builder, By} = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
require('chromedriver')

const TIMEOUT = 50000
let searchCountNum

describe('Add products to cart', () => {
    let driver

    beforeAll(async () => {
        driver = await new Builder()
        .forBrowser('chrome')
        // If you dont want to open browser, uncomment following row
        .setChromeOptions(new chrome.Options().addArguments('--headless'))
        .build()
        driver.manage().setTimeouts({implicit: TIMEOUT, pageLoad: TIMEOUT, script: TIMEOUT})
        driver.manage().window().maximize()

        await driver.get('https://www.bookdepository.com/')
        await driver.findElement(By.css('div.cookie-consent > div.cookie-consent-buttons > button.btn.btn-sm.btn-yes')).click()
    })
    
    afterAll(async () => {
        await driver.quit()
    })

    test('Test Open Web Page', async () => {
        //Verify that the web page has a Book Depository title.
        const pageTitle = await driver.findElement(By.xpath('//h1/a[@class="brand-link"]/img')).getAttribute('alt')
        expect(pageTitle).toContain('Bookdepository.com')
    })
    test('Test Search by Keyword', async () => {
        const searchField = await driver.findElement(By.css('#book-search-form > div > input[name="searchTerm"]'))
        searchField.click()
        searchField.sendKeys('Harry Potter')
        await driver.findElement(By.className('header-search-btn')).click()

        const searchResultTitle = await driver.findElement(By.css('div.main-content.search-page > h1')).getText()
        expect(searchResultTitle).toContain('Search results for Harry Potter')

        const searchCount = await driver.findElement(By.className('search-count')).getText()
        searchCountNum = parseInt(searchCount.replace(',', ''))

        //Verify that there are more than 1 products found.
        expect(searchCountNum).toBeGreaterThan(1)
        //Verify that products can be added to cart.
        const addToBasket = await driver.findElement(By.xpath("//div[@class='item-info']//a[@class='btn btn-primary btn-add-to-basket']")).click()
        await driver.wait(until.elementLocated(By.css('div.notification-container')), TIMEOUT);
        const notificationText = await driver.findElement(By.css('div.notification-container > div.notification-text')).getText();
        expect(notificationText).toContain('added to basket');

        //Verify user is taken back to product items
        await driver.findElement(By.css('.breadcrumb > li:nth-child(2) > a')).click()
        expect(await driver.findElement(By.css('div.main-content.search-page > h1')).getText())
            .toContain('Search results for Harry Potter')

        //Select another item, add it to the cart
        await driver.findElement(By.css('.book-item:nth-child(2) div.item-info a')).click()
        await driver.findElement(By.css('div.item-actions > div > a.btn.btn-sm.btn-primary.add-to-basket')).click()
        expect(await driver.findElement(By.className('add-to-basket-message')).getText())
            .toContain('Item added to basket')

        //Click Basket/Checkout button
        await driver.findElement(By.css('.basket-container a.btn-primary')).click()
        expect(await driver.findElement(By.css('.basket-container h1')).getText())
            .toContain('Your shopping basket')

        //Verify that cart has 2 items
        const cartItems = await driver.findElements(By.css('tr.basket-item'))
        expect(cartItems.length).toEqual(2)

        //Remove first product from the cart
        await driver.findElement(By.css('tr.basket-item:first-child button.btn-remove')).click()
        expect(await driver.findElements(By.css('tr.basket-item')))
            .toHaveLength(1)
    })
})