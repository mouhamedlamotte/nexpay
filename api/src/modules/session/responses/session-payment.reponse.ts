export const SessionPaymentResponse = {
  statusCode: 201,
  message: 'Payment session successfully initiated',
  data: {
    sessionId: 'cmhdpuj6m00069usa10370ldr',
    checkoutUrl: 'http://l........../checkout/cmhdpuj6m00069usa10370ldr',
    status: 'opened',
    expiresAt: '2025-10-30T18:46:25.053Z',
  },
};

export const SessionPaymentCheckoutResponse = {
  statusCode: 200,
  message: 'Payment data successfully fetched',
  data: {
    amount: 100800,
    provider: {
      id: 'cmhcd1cgp00009uwt65db09s9',
      name: 'Orange Money',
      code: 'om',
      logoUrl: 'http://l........../api/v1/media/images/logos/om.png',
    },
    currency: 'XOF',
    reference: 'NEXPAY_TX_EF0C40A32D9F4569',
    payer: {
      userId: '1f31dfd7-aec8-4adf-84ff-4a9c1981be2a',
      email: 'exemele@gmail.com',
      phone: '+22177123456',
      name: 'Exemple',
    },
    checkout_urls: [
      {
        name: 'MaxIt',
        url: 'https://sugu.orange-sonatel.com/mp/dmeCp-6U-RWDavRfM90v',
        thumb: 'http://l........../api/v1/media/images/thumbs/maxit.png',
      },
      {
        name: 'Orange Money',
        url: 'https://orange-money-prod-flowlinks.web.app/om/dmeCp-6U-RWDavRfM90v',
        thumb: 'http://l........../api/v1/media/images/thumbs/om.png',
      },
    ],
    qr_code: {
      data: 'iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAAAAACIM/FCAAAAAklEQVR4nGKkkSsAAAIFSURBVO3QQXLDMAxDUd//0ukqKxkwKDVTNvxceWSKxNP1+pK6/jrAbxWQbgWkWwHpVkC6FZBu9aWQK66bScVz9XczAxAgQAZD1NK1Jwcmk/cyvI+OhgCphUx6gCwhgTyHTHo0RIVU3/lqtWUvAxAgQIBUh/iTQhggQIAA+TDE91TPgQABAuQEomovQBJvLwMQIECAJFVFnT+C5wMBAmQmpFoqwEnPbpSz20CAyChnt4F8GLIuUkvV6kuU6kwmJHuBAAECZC/SyQTVk5wAAQJkJuSh2Z6vkZK/+befDAQIkMmQ9WISLC/1ICp88kRAgACZCVEXk4FVcvXvwxYgQICMhKiqcvIYnlAoIECAjISoRclSf9dj1QS192YCECBARkJU5atPHkGdJI8DBAiQmRAVTFXC8fMf4okJQIAAAeKX+gD+PJmjbqnwNxOAAAEyErJePzmJAsR/1UYgQIBMhqgraoXqSQJ7ZrIRCBAgQM4D5JHU5L3HAQIEyExItfxqf2udkHfe9AMBAmQkRAVTQ3yA9W8eWPXLhwICBMhgyE2b7VlXK3Ie2E8DAgQIkGqkHJiEUZ1qJhAgQIDsQfy3uuvj+TlAgAABcgLxt2622TmqP8kABAgQIH64ip0/hb+VbAcCBAiQdbUqHzWHJ2QgQIAAUZB/XEC6FZBuBaRbAelWQLoVkG71A20+/TrY0fkoAAAAAElFTkSuQmCC',
    },
    expiration: '2025-10-30T18:46:59.098Z',
  },
};

export const SessionPaymentDetailsResponse = {
  statusCode: 200,
  message: 'Payment session successfully initiated',
  data: {
    id: 'cmhdpuj6m00069usa10370ldr',
    amount: '100800',
    currency: 'XOF',
    payerId: 'cmhdpuj6m00079usatl3dynkh',
    clientReference: 'nexpay-ref-30-10-2025',
    projectId: 'cmhciopb000049ugoic8kqhyj',
    expiresAt: '2025-10-30T18:46:25.053Z',
    status: 'opened',
    createdAt: '2025-10-30T17:46:25.055Z',
    updatedAt: '2025-10-30T17:46:59.121Z',
    paymentData:
      '{"amount":100800,"provider":{"id":"cmhcd1cgp00009uwt65db09s9","name":"Orange Money","code":"om","logoUrl":"http://localhost:9090/api/v1/media/images/logos/om.png"},"currency":"XOF","reference":"NEXPAY_TX_EF0C40A32D9F4569","payer":{"userId":"1f31dfd7-aec8-4adf-84ff-4a9c1981be2a","email":"lamottelymouhamed@gmail.com","phone":"+22177123456","name":"Mouhamed  baba"},"checkout_urls":[{"name":"MaxIt","url":"https://sugu.orange-sonatel.com/mp/dmeCp-6U-RWDavRfM90v","thumb":"http://localhost:9090/api/v1/media/images/thumbs/maxit.png"},{"name":"Orange Money","url":"https://orange-money-prod-flowlinks.web.app/om/dmeCp-6U-RWDavRfM90v","thumb":"http://localhost:9090/api/v1/media/images/thumbs/om.png"}],"qr_code":{"data":"iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAAAAACIM/FCAAAAAklEQVR4nGKkkSsAAAIFSURBVO3QQXLDMAxDUd//0ukqKxkwKDVTNvxceWSKxNP1+pK6/jrAbxWQbgWkWwHpVkC6FZBu9aWQK66bScVz9XczAxAgQAZD1NK1Jwcmk/cyvI+OhgCphUx6gCwhgTyHTHo0RIVU3/lqtWUvAxAgQIBUh/iTQhggQIAA+TDE91TPgQABAuQEomovQBJvLwMQIECAJFVFnT+C5wMBAmQmpFoqwEnPbpSz20CAyChnt4F8GLIuUkvV6kuU6kwmJHuBAAECZC/SyQTVk5wAAQJkJuSh2Z6vkZK/+befDAQIkMmQ9WISLC/1ICp88kRAgACZCVEXk4FVcvXvwxYgQICMhKiqcvIYnlAoIECAjISoRclSf9dj1QS192YCECBARkJU5atPHkGdJI8DBAiQmRAVTFXC8fMf4okJQIAAAeKX+gD+PJmjbqnwNxOAAAEyErJePzmJAsR/1UYgQIBMhqgraoXqSQJ7ZrIRCBAgQM4D5JHU5L3HAQIEyExItfxqf2udkHfe9AMBAmQkRAVTQ3yA9W8eWPXLhwICBMhgyE2b7VlXK3Ie2E8DAgQIkGqkHJiEUZ1qJhAgQIDsQfy3uuvj+TlAgAABcgLxt2622TmqP8kABAgQIH64ip0/hb+VbAcCBAiQdbUqHzWHJ2QgQIAAUZB/XEC6FZBuBaRbAelWQLoVkG71A20+/TrY0fkoAAAAAElFTkSuQmCC"},"expiration":"2025-10-30T18:46:59.098Z"}',
    payer: {
      id: 'cmhdpuj6m00079usatl3dynkh',
      name: 'Mouhamed  baba',
      email: 'lamottelymouhamed@gmail.com',
      phone: '+22177123456',
      userId: '1f31dfd7-aec8-4adf-84ff-4a9c1981be2a',
      metadata: null,
    },
    project: {
      id: 'cmhciopb000049ugoic8kqhyj',
      name: 'Nexcom Payment',
      isDefault: true,
      description: 'Portail de paiement The nexcom',
      metadata: {
        key1: 'value1',
        key2: 'value2',
      },
      createdAt: '2025-10-29T21:38:09.564Z',
      updatedAt: '2025-10-30T04:08:51.276Z',
    },
    checkoutUrl: 'http://localhost:9090/checkout/cmhdpuj6m00069usa10370ldr',
    providers: [
      {
        id: 'cmhcd1cgp00009uwt65db09s9',
        name: 'Orange Money',
        code: 'om',
        logoUrl: 'http://localhost:9090/api/v1/media/images/logos/om.png',
      },
      {
        id: 'cmhcd1cgu00019uwtx4qu72ch',
        name: 'Wave',
        code: 'wave',
        logoUrl: 'http://localhost:9090/api/v1/media/images/logos/wave.png',
      },
    ],
  },
};
