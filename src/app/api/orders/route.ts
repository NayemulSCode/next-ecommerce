import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      tax,
      shipping,
      total,
      notes,
      guestEmail,
      userId
    } = body

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        userId,
        guestEmail,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod,
        subtotal,
        tax,
        shipping,
        total,
        notes,
        addressId: shippingAddress.id
      },
      include: {
        items: true,
        address: true
      }
    })

    // Create order items
    for (const item of items) {
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

    // Send confirmation email using ZAI
    try {
      const zai = await ZAI.create()
      
      const emailContent = `
        Order Confirmation - ${orderNumber}
        
        Thank you for your order!
        
        Order Details:
        - Order Number: ${orderNumber}
        - Total: $${total}
        - Payment Method: ${paymentMethod}
        - Shipping Address: ${shippingAddress.address1}, ${shippingAddress.city}, ${shippingAddress.province}
        
        Items:
        ${items.map(item => `- ${item.name} x${item.quantity} - $${item.price}`).join('\n')}
        
        We'll send you another email when your order ships.
        
        Thank you for shopping with us!
      `

      // In a real implementation, you would use ZAI to send this email
      console.log('Email content generated:', emailContent)
      
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the order if email fails
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
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where = userId ? { userId } : {}

    const orders = await db.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true
              }
            }
          }
        },
        address: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    const total = await db.order.count({ where })

    // Transform orders to include parsed images
    const transformedOrders = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          images: item.product.images ? JSON.parse(item.product.images) : []
        }
      }))
    }))

    return NextResponse.json({
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}