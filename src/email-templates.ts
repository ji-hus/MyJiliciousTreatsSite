export const orderEmailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #8B4513;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #fff;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 0 0 5px 5px;
        }
        .order-details {
            margin: 20px 0;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
        }
        .customer-info {
            margin-bottom: 20px;
        }
        .items-list {
            margin: 20px 0;
        }
        .total {
            font-weight: bold;
            text-align: right;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
        }
        .pickup-section {
            margin: 15px 0;
            padding: 15px;
            background-color: #f5f5f5;
            border-radius: 5px;
        }
        .pickup-section h3 {
            color: #8B4513;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>New Order Received</h1>
    </div>
    <div class="content">
        <div class="customer-info">
            <h2>Customer Information</h2>
            <p><strong>Name:</strong> {{from_name}}</p>
            <p><strong>Email:</strong> {{from_email}}</p>
            <p><strong>Phone:</strong> {{phone}}</p>
        </div>
        
        <div class="order-details">
            <h2>Order Details</h2>
            <div class="pickup-section">
                <h3>In-Stock Items Pickup</h3>
                <p><strong>Pickup Date:</strong> {{in_stock_pickup_date}}</p>
                <p><strong>Pickup Time:</strong> {{in_stock_pickup_time}}</p>
            </div>

            <div class="pickup-section">
                <h3>Made-to-Order Items Pickup</h3>
                <p><strong>Pickup Date:</strong> {{made_to_order_pickup_date}}</p>
                <p><strong>Pickup Time:</strong> {{made_to_order_pickup_time}}</p>
            </div>

            <p><strong>Special Instructions:</strong> {{special_instructions}}</p>
        </div>

        <div class="items-list">
            <h2>In-Stock Items</h2>
            <pre>{{in_stock_items}}</pre>

            <h2>Made-to-Order Items</h2>
            <pre>{{made_to_order_items}}</pre>
        </div>

        <div class="total">
            <p>Total Amount: {{total_amount}}</p>
        </div>
    </div>
</body>
</html>
`;

export const contactEmailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #8B4513;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #fff;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 0 0 5px 5px;
        }
        .message-content {
            margin: 20px 0;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
            white-space: pre-wrap;
        }
        .order-details {
            margin: 20px 0;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{type === 'bulk_order' ? 'New Bulk Order Request' : 'New Contact Form Submission'}}</h1>
    </div>
    <div class="content">
        <div class="customer-info">
            <h2>Contact Information</h2>
            <p><strong>Name:</strong> {{from_name}}</p>
            <p><strong>Email:</strong> {{from_email}}</p>
            {{#if phone}}<p><strong>Phone:</strong> {{phone}}</p>{{/if}}
            {{#if company}}<p><strong>Company:</strong> {{company}}</p>{{/if}}
        </div>
        
        {{#if type === 'bulk_order'}}
        <div class="order-details">
            <h2>Bulk Order Details</h2>
            <p><strong>Event Date:</strong> {{event_date}}</p>
            <p><strong>Quantity Needed:</strong> {{quantity}}</p>
            <p><strong>Items Needed:</strong></p>
            <pre>{{items}}</pre>
            <p><strong>Special Requirements:</strong></p>
            <pre>{{special_requirements}}</pre>
        </div>
        {{else}}
        <div class="message-content">
            <h2>Message</h2>
            <p>{{message}}</p>
        </div>
        {{/if}}
    </div>
</body>
</html>
`;

export const customerOrderEmailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #8B4513;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #fff;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 0 0 5px 5px;
        }
        .order-details {
            margin: 20px 0;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
        }
        .items-list {
            margin: 20px 0;
        }
        .total {
            font-weight: bold;
            text-align: right;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
        }
        .pickup-section {
            margin: 15px 0;
            padding: 15px;
            background-color: #f5f5f5;
            border-radius: 5px;
        }
        .pickup-section h3 {
            color: #8B4513;
            margin-bottom: 10px;
        }
        .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 0.9em;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Order Confirmation</h1>
    </div>
    <div class="content">
        <p>Dear {{customer_name}},</p>
        
        <p>Thank you for your order with Ji'licious Treats! We're excited to prepare your delicious treats.</p>
        
        <div class="order-details">
            <h2>Your Order Details</h2>
            <div class="items-list">
                <pre>{{order_details}}</pre>
            </div>
        </div>

        <div class="pickup-section">
            <h3>Pickup Information</h3>
            <pre>{{pickup_details}}</pre>
        </div>

        <div class="special-instructions">
            <h3>Special Instructions</h3>
            <p>{{special_instructions}}</p>
        </div>

        <div class="footer">
            <p>If you have any questions about your order, please contact us at:</p>
            <p>Phone: 248-403-0780</p>
            <p>Email: myjilicioustreats@gmail.com</p>
        </div>
    </div>
</body>
</html>
`; 