export const paymentResponse = {
  statusCode: 201,
  message: 'Payment successfully initiated',
  data: {
    amount: 30000,
    provider: {
      id: 'cmhcd1cgp00009uwt65db09s9',
      name: 'Orange Money',
      code: 'om',
      logoUrl: 'http://.........../images/logos/om.png',
    },
    currency: 'XOF',
    reference: 'NEXPAY_TX_A819BE1284654995',
    payer: {
      userId: '1f31dfd7-aec8-4adf-84ff-4a9c1981be2a',
      email: 'exemple@email.com',
      phone: '+22177123456',
      name: 'Mouhamed  baba',
    },
    checkout_urls: [
      {
        name: 'MaxIt',
        url: 'https://sugu.orange-sonatel.com/mp/.......',
        thumb: 'http://.........../images/thumbs/maxit.png',
      },
      {
        name: 'Orange Money',
        url: 'https://orange-money-prod-flowlinks.web.app/om/dmeRybTTGJ0_cg7xDMoz',
        thumb: 'http://.........../images/thumbs/om.png',
      },
    ],
    qr_code: {
      data: 'iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAAAAACIM/FCAAAAAklEQVR4nGKkkSsAAAH3SURBVO3QUXYcIQwEwL3/pZMDYPU2O/ELNqWveYyQunj9+SX1+t8B/lWBnFYgpxXIaQVyWoGcVr8U8qrri0nL+dTZ3NrOAAICcjGkX52H94/wJAMICAhIDjl9N0unaXl+7gEBAQHZHZJPNsKAgICAfDMk9zR/p5kgICAgu5Cp+gA59nr+WQYQEBCQpp6geniTAQQE5GbIbk0BnvR8GuXZbRCQMcqz2yDfDFkXTUun1a+icvjcP5JBQECuhOQVeemTGNOtKc8Xc0BAQECK2Ls9E7D5frMdBATkSsh6ZTd8vjVFzeGbJwIBAbkTkldMw/vVGdjzv+CAgIBcDxmvDJ3NI+RgedebAgEBuRLSjF17mpDTSSY3G0FAQEDyovW7iZ1j5JO8FwQEBCRDpkjNuh4yFQgICMhn13chE7/pqeAgICBXQpoAOfwu8E28iAUBAQHJVyZmE3giN9NAQEBAJsi0LsfI5CnSFC/vnUeAgIDcCNmtntA/yzo/TwABAbkZsjZPlWPkeE3g9Xs6AQEBAemXNpGm/hx4nfAmGwgIyPWQacg6sF/XB56mjfNBQEBACkj+bmL3c948FAgICEgBmULmk2bOdgYQEJDrIU3UdcUUIMd48lAgICAgTeVIDa35m8kgICAgP7hATiuQ0wrktAI5rUBOK5DT6i9yn4y5velLFQAAAABJRU5ErkJggg==',
    },
    expiration: '2025-10-30T18:47:53.185Z',
  },
};
