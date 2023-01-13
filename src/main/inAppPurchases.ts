import { inAppPurchase } from 'electron'
import { platform } from 'os'
import { getLogger } from '../shared/logger'

const log = getLogger('main/inAppDonations')

// Listen for transactions as soon as possible.
inAppPurchase.on(
  'transactions-updated',
  async (_event: any, transactions: Electron.Transaction[]) => {
    if (!Array.isArray(transactions)) {
      log.info('No Transactions to process')
      return
    }

    // Check each transaction.
    transactions.forEach(transaction => {
      const payment = transaction.payment

      switch (transaction.transactionState) {
        case 'purchasing':
          log.info(`Purchasing ${payment.productIdentifier}...`)
          break

        case 'purchased': {
          log.info(`${payment.productIdentifier} purchased.`)

          // Get the receipt url.
          const receiptURL = inAppPurchase.getReceiptURL()

          log.info(`Receipt URL: ${receiptURL}`)

          // just assume that the receipt is valid, there is no reason to fake it.

          // TODO try to load product information if not loaded yet, if not availible and failed return and let app try again later

          // TODO send thank you device message over jsonrpc -> to active account

          // Finish the transaction.
          inAppPurchase.finishTransactionByDate(transaction.transactionDate)

          break
        }

        case 'failed':
          log.info(`Failed to purchase ${payment.productIdentifier}.`)

          // Finish the transaction.
          inAppPurchase.finishTransactionByDate(transaction.transactionDate)

          break
        case 'restored':
          log.info(
            `The purchase of ${payment.productIdentifier} has been restored.`
          )

          break
        case 'deferred':
          log.info(
            `The purchase of ${payment.productIdentifier} has been deferred.`
          )

          break
        default:
          break
      }
    })
  }
)

const PRODUCT_IDS = ['donation.small', 'default.monthly']

let loaded_products: Electron.Product[] | null = null

async function loadProducts(): Promise<Electron.Product[]> {
  if (!loaded_products) {
    // Retrieve and display the product descriptions.
    const products = await inAppPurchase.getProducts(PRODUCT_IDS)

    // Check the parameters.
    if (!Array.isArray(products) || products.length <= 0) {
      throw new Error('Unable to retrieve the product informations.')
    }

    products.forEach(product => {
      log.info(
        `The price of ${product.localizedTitle} is ${product.formattedPrice}.`
      )
      product.subscriptionPeriod
    })

    loaded_products = products
    return products
  } else {
    return loaded_products
  }
}

async function setupInAppPurchases(): Promise<
  | { inAppDonationAvailible: false }
  | { inAppDonationAvailible: true; paymentsAllowed: false }
  | { inAppDonationAvailible: true; paymentsAllowed: true; error: string }
  | {
      inAppDonationAvailible: true
      paymentsAllowed: true
    }
> {
  // TODO check if appstore build
  if (platform() !== 'darwin') {
    // if not mac or not appstore build
    return {
      inAppDonationAvailible: false,
    }
  }
  if (!inAppPurchase.canMakePayments()) {
    return {
      inAppDonationAvailible: true,
      paymentsAllowed: false,
    }
  } else {
    return {
      inAppDonationAvailible: true,
      paymentsAllowed: true,
    }
  }
}

async function purchaseSingle(
  productIdentifier: Electron.Product['productIdentifier']
) {
  if (await inAppPurchase.purchaseProduct(productIdentifier, 1)) {
    log.info('The payment has been added to the payment queue.')
  } else {
    log.info('The product is not valid:', { productIdentifier })
    throw new Error('The product is not valid.')
  }
}

// TODO:
// - get availible products
// - show thank you device message you when done

const THANK_YOU_MESSAGE = 'Thank you for donating $1!'
const THANK_YOU_MESSAGE_SUBSCRIPTION =
  'Thank you for your monthly support of $1.\n\n Remember that you can cancel anytime on https://apps.apple.com/account/subscriptions'

const FAILED_MESSAGE = 'Your donation of $1 failed. :('



loadProducts().then(console.log)
setupInAppPurchases().then(console.log)