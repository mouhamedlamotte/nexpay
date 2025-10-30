import { z } from "zod"

// Payer schema
export const PayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  userId: z.string(),
  metadata: z.record(z.any()).nullable(),
})

export const ProvidersSchema = z.object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
    logoUrl: z.string().optional(),
})

// Project schema
export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  isDefault: z.boolean(),
  description: z.string(),
  metadata: z.record(z.any()).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// Checkout session schema
export const CheckoutSessionSchema = z.object({
  id: z.string(),
  amount: z.string(),
  currency: z.string(),
  payerId: z.string(),
  clientReference: z.string(),
  projectId: z.string(),
  expiresAt: z.string(),
  status: z.enum(["opened", "pending", "completed", "failed", "expired"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  payer: PayerSchema,
  project: ProjectSchema,
  providers: ProvidersSchema.array(),
  checkoutUrl: z.string(),
})

// Payment initiate request schema
export const PaymentInitiateSchema = z.object({
  amount: z.number().positive(),
  userId: z.string(),
  name: z.string().min(1),
  phone: z.string().regex(/^\+\d{10,15}$/),
  email: z.string().email(),
  client_reference: z.string(),
  projectId: z.string(),
  provider: z.enum(["om", "wave", "free"]),
  currency: z.string().default("XOF"),
  metadata: z.record(z.any()).optional(),
})

// Checkout URL schema
export const CheckoutUrlSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  thumb: z.string().url().optional(),
})

// QR Code schema
export const QrCodeSchema = z.object({
  data: z.string(),
})

// Payment response schema
export const PaymentResponseSchema = z.object({
  amount: z.number(),
  currency: z.string(),
  reference: z.string(),
  payer: z.object({
    userId: z.string(),
    email: z.string().email(),
    phone: z.string(),
    name: z.string(),
  }),
  checkout_urls: z.array(CheckoutUrlSchema),
  qr_code: QrCodeSchema.optional(),
  expiration: z.string(),
})

// API Response wrapper
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    statusCode: z.number(),
    message: z.string(),
    data: dataSchema,
  })

// Export types
export type CheckoutSession = z.infer<typeof CheckoutSessionSchema>
export type PaymentInitiate = z.infer<typeof PaymentInitiateSchema>
export type PaymentResponse = z.infer<typeof PaymentResponseSchema>
export type CheckoutUrl = z.infer<typeof CheckoutUrlSchema>
export type Payer = z.infer<typeof PayerSchema>
export type Project = z.infer<typeof ProjectSchema>
export type Providers = z.infer<typeof ProvidersSchema>