import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, orderData } = await request.json()

    // Retrieve payment intent to confirm it was successful
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not successful' },
        { status: 400 }
      )
    }

    // Create order in database
    const order = await db.order.create({
      data: {
        orderNumber: paymentIntent.metadata.orderNumber,
        userId: orderData.userId,
        guestEmail: orderData.guestEmail,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentMethod: 'STRIPE',
        currency: 'USD',
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        shipping: orderData.shipping,
        total: orderData.total,
        notes: orderData.notes,
        addressId: orderData.addressId,
      },
      include: {
        items: true,
        address: true
      }
    })

    // Create order items
    for (const item of orderData.items) {
      await db.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        }
      })

      // Update product stock
      await db.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity
          }
        }
      })
    }

    // Send confirmation email (using ZAI SDK)
    try {
      const ZAI = await import('z-ai-web-dev-sdk')
      // const zai = await ZAI.create()
      
      const emailContent = `
        Order Confirmation - ${order.orderNumber}
        
        Thank you for your order! Your payment has been successfully processed.
        
        Order Details:
        - Order Number: ${order.orderNumber}
        - Total: $${orderData.total}
        - Payment Method: Credit Card (Stripe)
        - Shipping Address: ${orderData.shippingAddress.address1}, ${orderData.shippingAddress.city}
        
        Items:
        ${orderData.items.map((item: any) => `- ${item.name} x${item.quantity} - $${item.price}`).join('\n')}
        
        We'll send you another email when your order ships.
        
        Thank you for shopping with us!
      `

      console.log('Email content generated:', emailContent)
      
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total
      }
    })
  } catch (error) {
    console.error('Confirm payment error:', error)
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}