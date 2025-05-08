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
            <p><strong>Pickup Date:</strong> {{pickup_date}}</p>
            <p><strong>Pickup Time:</strong> {{pickup_time}}</p>
            <p><strong>Special Instructions:</strong> {{special_instructions}}</p>
        </div>

        <div class="items-list">
            <h2>Order Items</h2>
            <pre>{{order_items}}</pre>
        </div>

        <div class="total">
            <p>Total Amount: {{total_amount}}</p>
        </div>
    </div>
</body>
</html>
`;

export const bulkOrderEmailTemplate = `
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
        .customer-info {
            margin-bottom: 20px;
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
        <h1>New Bulk Order Inquiry</h1>
    </div>
    <div class="content">
        <div class="customer-info">
            <h2>Customer Information</h2>
            <p><strong>Name:</strong> {{from_name}}</p>
            <p><strong>Email:</strong> {{from_email}}</p>
            <p><strong>Phone:</strong> {{phone}}</p>
            <p><strong>Company:</strong> {{company}}</p>
        </div>
        
        <div class="order-details">
            <h2>Order Details</h2>
            <p><strong>Event Date:</strong> {{event_date}}</p>
            <p><strong>Quantity:</strong> {{quantity}}</p>
            <p><strong>Items Needed:</strong></p>
            <pre>{{items}}</pre>
            <p><strong>Special Requirements:</strong></p>
            <pre>{{special_requirements}}</pre>
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
    </style>
</head>
<body>
    <div class="header">
        <h1>New Contact Form Submission</h1>
    </div>
    <div class="content">
        <div class="customer-info">
            <h2>Contact Information</h2>
            <p><strong>Name:</strong> {{from_name}}</p>
            <p><strong>Email:</strong> {{from_email}}</p>
        </div>
        
        <div class="message-content">
            <h2>Message</h2>
            <p>{{message}}</p>
        </div>
    </div>
</body>
</html>
`; 