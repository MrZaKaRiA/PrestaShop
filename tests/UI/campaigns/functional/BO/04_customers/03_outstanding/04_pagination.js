require('module-alias/register');

const {expect} = require('chai');

// Import utils
const helper = require('@utils/helpers');

// Import common tests
const {enableB2BTest, disableB2BTest} = require('@commonTests/BO/shopParameters/enableDisableB2B');
const {createOrderByCustomerTest} = require('@commonTests/FO/createOrder');

// Import data
const {DefaultCustomer} = require('@data/demo/customer');
const {PaymentMethods} = require('@data/demo/paymentMethods');
const {Statuses} = require('@data/demo/orderStatuses');

// Import test context
const testContext = require('@utils/testContext');

// Import login steps
const loginCommon = require('@commonTests/BO/loginBO');

// Import pages
const dashboardPage = require('@pages/BO/dashboard');
const outstandingPage = require('@pages/BO/customers/outstanding');
const ordersPage = require('@pages/BO/orders');

const baseContext = 'functional_BO_customers_outstanding_pagination';

let browserContext;
let page;

// Variable used to get the number of outstanding
let numberOutstanding;

// Const used to get the least number of outstanding to display pagination


const orderByCustomerData = {
  customer: DefaultCustomer,
  product: 1,
  productQuantity: 1,
  paymentMethod: PaymentMethods.wirePayment.moduleName,
};

describe('BO - Customers - Outstanding : Pagination of the outstanding page', async () => {
  // Pre-Condition : Enable B2B
  enableB2BTest(baseContext);

  // before and after functions
  before(async function () {
    browserContext = await helper.createBrowserContext(this.browser);
    page = await helper.newTab(browserContext);
  });

  after(async () => {
    await helper.closeBrowserContext(browserContext);
  });
  describe('Pagination next and previous', async () => {
    it('should login to BO', async function () {
      await loginCommon.loginBO(this, page);
    });

    it('should go to BO > Customers > Outstanding page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToOutstandingPage', baseContext);

      await dashboardPage.goToSubMenu(
        page,
        dashboardPage.customersParentLink,
        dashboardPage.outstandingLink,
      );
    });

    it('should reset all filters and get the number of outstanding', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'resetFilterAndGetNumberOfOutstanding');

      await outstandingPage.resetFilter(page);

      numberOutstanding = await outstandingPage.getNumberOutstanding(page);
      // console.log(numberOutstanding, firstPagination, firstPagination - numberOutstanding);
      await expect(numberOutstanding).to.be.above(0);
    });

    const firstPagination = 11;
    if (numberOutstanding < firstPagination) {
      console.log(numberOutstanding, firstPagination, firstPagination - numberOutstanding);
      for (let i = 1; i <= firstPagination - numberOutstanding; i++) {
        createOrderByCustomerTest(orderByCustomerData, `${baseContext}_preTest_${i}`);

        // Pre-condition: Update order status to payment accepted
        describe(`PRE-TEST_${i}: Update order status to payment accepted`, async () => {
          it(`should go to 'Orders > Orders' page ${i}`, async function () {
            await testContext.addContextItem(this, 'testIdentifier', 'goToOrdersPage', baseContext);

            await dashboardPage.goToSubMenu(
              page,
              dashboardPage.ordersParentLink,
              dashboardPage.ordersLink,
            );

            const pageTitle = await ordersPage.getPageTitle(page);
            await expect(pageTitle).to.contains(ordersPage.pageTitle);
          });

          it('should update order status', async function () {
            await testContext.addContextItem(this, 'testIdentifier', 'updateOrderStatus', baseContext);

            const textResult = await ordersPage.setOrderStatus(page, 1, Statuses.paymentAccepted);
            await expect(textResult).to.equal(ordersPage.successfulUpdateMessage);
          });

          it('should check that the status is updated successfully', async function () {
            await testContext.addContextItem(this, 'testIdentifier', 'checkStatusBO', baseContext);

            const orderStatus = await ordersPage.getTextColumn(page, 'osname', 1);
            await expect(orderStatus, 'Order status was not updated').to.equal(Statuses.paymentAccepted.status);
          });
        });
      }
    }
    it('should change the items number to 10 per page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'changeItemsNumberTo10', baseContext);

      const paginationNumber = await outstandingPage.selectPaginationLimit(page, '10');
      expect(paginationNumber, `Number of pages is not correct (page 1 / ${Math.ceil(numberOutstanding / 10)})`)
        .to.contains(`(page 1 / ${Math.ceil(numberOutstanding / 10)})`);
    });

    it('should click on next', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'clickOnNext', baseContext);

      const paginationNumber = await outstandingPage.paginationNext(page);
      expect(paginationNumber, `Number of pages is not (page 2 / ${Math.ceil(numberOutstanding / 10)})`)
        .to.contains(`(page 2 / ${Math.ceil(numberOutstanding / 10)})`);
    });

    it('should click on previous', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'clickOnPrevious', baseContext);

      const paginationNumber = await outstandingPage.paginationPrevious(page);
      expect(paginationNumber, `Number of pages is not (page 1 / ${Math.ceil(numberOutstanding / 10)})`)
        .to.contains(`(page 1 / ${Math.ceil(numberOutstanding / 10)})`);
    });

    it('should change the items number to 50 per page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'changeItemsNumberTo50', baseContext);

      const paginationNumber = await outstandingPage.selectPaginationLimit(page, '50');
      expect(paginationNumber, 'Number of pages is not correct').to.contains('(page 1 / 1)');
    });
  });
});
