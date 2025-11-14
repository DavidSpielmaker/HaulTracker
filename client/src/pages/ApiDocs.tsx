import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Code, Key, Webhook, BookOpen } from "lucide-react";

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">HaulTracker API Documentation</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Integrate HaulTracker with your website to accept dumpster rental bookings
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="authentication">Authentication</TabsTrigger>
              <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>
                    Learn how to integrate HaulTracker with your website
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">What is the HaulTracker API?</h3>
                    <p className="text-muted-foreground">
                      The HaulTracker API allows you to create and manage dumpster rental bookings from your own website.
                      Instead of redirecting customers to a third-party booking platform, you can keep them on your site
                      while HaulTracker handles all the backend management.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Base URL</h3>
                    <code className="block bg-muted p-3 rounded text-sm">
                      {window.location.origin}/api/v1
                    </code>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Quick Start</h3>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Generate an API key from your Settings page</li>
                      <li>Store the API key securely on your server (never expose it in client-side code)</li>
                      <li>Use the API key to authenticate requests to create bookings</li>
                      <li>Optionally configure webhooks to receive real-time notifications</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Authentication Tab */}
            <TabsContent value="authentication" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    <CardTitle>API Key Authentication</CardTitle>
                  </div>
                  <CardDescription>
                    All API requests must be authenticated using an API key
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Obtaining an API Key</h3>
                    <p className="text-muted-foreground">
                      Navigate to Settings → API & Integrations in your HaulTracker dashboard and click "Create API Key".
                      The key will be shown only once, so make sure to copy it immediately.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Using the API Key</h3>
                    <p className="text-muted-foreground">
                      Include your API key in the <code className="bg-muted px-1 py-0.5 rounded">X-API-Key</code> header
                      of every request:
                    </p>
                    <pre className="bg-muted p-4 rounded overflow-x-auto">
                      <code>{`curl -X POST ${window.location.origin}/api/v1/bookings \\
  -H "X-API-Key: htk_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{ ... }'`}</code>
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Security Best Practices</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Never expose your API key in client-side JavaScript code</li>
                      <li>Always make API requests from your server backend</li>
                      <li>Store API keys in environment variables, not in your code</li>
                      <li>Rotate API keys periodically for enhanced security</li>
                      <li>Use HTTPS for all API requests</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Endpoints Tab */}
            <TabsContent value="endpoints" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    <CardTitle>Create Booking</CardTitle>
                  </div>
                  <CardDescription>
                    <Badge variant="default" className="mr-2">POST</Badge>
                    <code>/api/v1/bookings</code>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Request Headers</h3>
                    <pre className="bg-muted p-4 rounded overflow-x-auto">
                      <code>{`X-API-Key: htk_your_api_key_here
Content-Type: application/json`}</code>
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Request Body</h3>
                    <pre className="bg-muted p-4 rounded overflow-x-auto text-sm">
                      <code>{`{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "555-1234",
  "deliveryAddress": "123 Main St",
  "deliveryCity": "Springfield",
  "deliveryState": "IL",
  "deliveryZipCode": "62701",
  "deliveryDate": "2024-03-15T09:00:00Z",
  "pickupDate": "2024-03-20T09:00:00Z",
  "dumpsterTypeId": "uuid-of-dumpster-type",
  "notes": "Please place in driveway"
}`}</code>
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Field Descriptions</h3>
                    <div className="space-y-2">
                      <div className="border-l-2 border-primary pl-4">
                        <p className="font-medium">customerName <Badge variant="outline">required</Badge></p>
                        <p className="text-sm text-muted-foreground">Full name of the customer</p>
                      </div>
                      <div className="border-l-2 border-primary pl-4">
                        <p className="font-medium">customerEmail <Badge variant="outline">required</Badge></p>
                        <p className="text-sm text-muted-foreground">Customer's email address</p>
                      </div>
                      <div className="border-l-2 border-primary pl-4">
                        <p className="font-medium">customerPhone <Badge variant="outline">required</Badge></p>
                        <p className="text-sm text-muted-foreground">Customer's phone number</p>
                      </div>
                      <div className="border-l-2 border-primary pl-4">
                        <p className="font-medium">deliveryAddress <Badge variant="outline">required</Badge></p>
                        <p className="text-sm text-muted-foreground">Street address for dumpster delivery</p>
                      </div>
                      <div className="border-l-2 border-primary pl-4">
                        <p className="font-medium">deliveryCity <Badge variant="outline">required</Badge></p>
                        <p className="text-sm text-muted-foreground">City for delivery</p>
                      </div>
                      <div className="border-l-2 border-primary pl-4">
                        <p className="font-medium">deliveryState <Badge variant="outline">required</Badge></p>
                        <p className="text-sm text-muted-foreground">State abbreviation (e.g., "IL")</p>
                      </div>
                      <div className="border-l-2 border-primary pl-4">
                        <p className="font-medium">deliveryZipCode <Badge variant="outline">required</Badge></p>
                        <p className="text-sm text-muted-foreground">ZIP code for delivery location</p>
                      </div>
                      <div className="border-l-2 border-primary pl-4">
                        <p className="font-medium">deliveryDate <Badge variant="outline">required</Badge></p>
                        <p className="text-sm text-muted-foreground">ISO 8601 datetime for delivery</p>
                      </div>
                      <div className="border-l-2 border-primary pl-4">
                        <p className="font-medium">pickupDate <Badge variant="outline">required</Badge></p>
                        <p className="text-sm text-muted-foreground">ISO 8601 datetime for pickup</p>
                      </div>
                      <div className="border-l-2 border-primary pl-4">
                        <p className="font-medium">dumpsterTypeId <Badge variant="outline">required</Badge></p>
                        <p className="text-sm text-muted-foreground">UUID of the dumpster type being rented</p>
                      </div>
                      <div className="border-l-2 border-muted pl-4">
                        <p className="font-medium">notes <Badge variant="secondary">optional</Badge></p>
                        <p className="text-sm text-muted-foreground">Additional instructions or notes</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Success Response</h3>
                    <p className="text-sm text-muted-foreground">
                      <Badge variant="default">201 Created</Badge>
                    </p>
                    <pre className="bg-muted p-4 rounded overflow-x-auto text-sm">
                      <code>{`{
  "id": "booking-uuid",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "555-1234",
  "deliveryAddress": "123 Main St",
  "deliveryCity": "Springfield",
  "deliveryState": "IL",
  "deliveryZipCode": "62701",
  "deliveryDate": "2024-03-15T09:00:00.000Z",
  "pickupDate": "2024-03-20T09:00:00.000Z",
  "status": "pending",
  "totalAmount": "350.00",
  "createdAt": "2024-03-01T10:30:00.000Z",
  ...
}`}</code>
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Error Responses</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <Badge variant="destructive">401 Unauthorized</Badge>
                        </p>
                        <pre className="bg-muted p-3 rounded text-sm">
                          <code>{`{ "error": "Invalid API key" }`}</code>
                        </pre>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <Badge variant="destructive">400 Bad Request</Badge>
                        </p>
                        <pre className="bg-muted p-3 rounded text-sm">
                          <code>{`{ "error": "Validation failed", "details": [...] }`}</code>
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Example Code</h3>
                    <Tabs defaultValue="javascript" className="w-full">
                      <TabsList>
                        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                        <TabsTrigger value="python">Python</TabsTrigger>
                        <TabsTrigger value="php">PHP</TabsTrigger>
                      </TabsList>
                      <TabsContent value="javascript">
                        <pre className="bg-muted p-4 rounded overflow-x-auto text-sm">
                          <code>{`const response = await fetch('${window.location.origin}/api/v1/bookings', {
  method: 'POST',
  headers: {
    'X-API-Key': process.env.HAULTRACKER_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '555-1234',
    deliveryAddress: '123 Main St',
    deliveryCity: 'Springfield',
    deliveryState: 'IL',
    deliveryZipCode: '62701',
    deliveryDate: '2024-03-15T09:00:00Z',
    pickupDate: '2024-03-20T09:00:00Z',
    dumpsterTypeId: 'uuid-here',
    notes: 'Please place in driveway'
  })
});

const booking = await response.json();
console.log('Booking created:', booking);`}</code>
                        </pre>
                      </TabsContent>
                      <TabsContent value="python">
                        <pre className="bg-muted p-4 rounded overflow-x-auto text-sm">
                          <code>{`import requests
import os

response = requests.post(
    '${window.location.origin}/api/v1/bookings',
    headers={
        'X-API-Key': os.environ['HAULTRACKER_API_KEY'],
        'Content-Type': 'application/json'
    },
    json={
        'customerName': 'John Doe',
        'customerEmail': 'john@example.com',
        'customerPhone': '555-1234',
        'deliveryAddress': '123 Main St',
        'deliveryCity': 'Springfield',
        'deliveryState': 'IL',
        'deliveryZipCode': '62701',
        'deliveryDate': '2024-03-15T09:00:00Z',
        'pickupDate': '2024-03-20T09:00:00Z',
        'dumpsterTypeId': 'uuid-here',
        'notes': 'Please place in driveway'
    }
)

booking = response.json()
print('Booking created:', booking)`}</code>
                        </pre>
                      </TabsContent>
                      <TabsContent value="php">
                        <pre className="bg-muted p-4 rounded overflow-x-auto text-sm">
                          <code>{`<?php
$ch = curl_init('${window.location.origin}/api/v1/bookings');

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'X-API-Key: ' . getenv('HAULTRACKER_API_KEY'),
        'Content-Type: application/json'
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'customerName' => 'John Doe',
        'customerEmail' => 'john@example.com',
        'customerPhone' => '555-1234',
        'deliveryAddress' => '123 Main St',
        'deliveryCity' => 'Springfield',
        'deliveryState' => 'IL',
        'deliveryZipCode' => '62701',
        'deliveryDate' => '2024-03-15T09:00:00Z',
        'pickupDate' => '2024-03-20T09:00:00Z',
        'dumpsterTypeId' => 'uuid-here',
        'notes' => 'Please place in driveway'
    ])
]);

$response = curl_exec($ch);
$booking = json_decode($response);
echo 'Booking created: ' . print_r($booking, true);
?>`}</code>
                        </pre>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Webhooks Tab */}
            <TabsContent value="webhooks" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Webhook className="h-5 w-5" />
                    <CardTitle>Webhook Events</CardTitle>
                  </div>
                  <CardDescription>
                    Receive real-time notifications when events occur
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Setting Up Webhooks</h3>
                    <p className="text-muted-foreground">
                      Configure webhook endpoints in Settings → API & Integrations to receive POST requests
                      when specific events occur in your HaulTracker account.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Available Events</h3>
                    <div className="space-y-3">
                      <div className="border-l-2 border-primary pl-4">
                        <p className="font-medium">booking.created</p>
                        <p className="text-sm text-muted-foreground">Triggered when a new booking is created</p>
                      </div>
                      <div className="border-l-2 border-primary pl-4">
                        <p className="font-medium">booking.updated</p>
                        <p className="text-sm text-muted-foreground">Triggered when a booking is updated</p>
                      </div>
                      <div className="border-l-2 border-primary pl-4">
                        <p className="font-medium">booking.cancelled</p>
                        <p className="text-sm text-muted-foreground">Triggered when a booking is cancelled</p>
                      </div>
                      <div className="border-l-2 border-primary pl-4">
                        <p className="font-medium">booking.completed</p>
                        <p className="text-sm text-muted-foreground">Triggered when a booking is marked as completed</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Webhook Payload</h3>
                    <p className="text-muted-foreground mb-2">
                      All webhook requests include the following structure:
                    </p>
                    <pre className="bg-muted p-4 rounded overflow-x-auto text-sm">
                      <code>{`{
  "event": "booking.created",
  "timestamp": "2024-03-01T10:30:00.000Z",
  "data": {
    "id": "booking-uuid",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "status": "pending",
    "deliveryDate": "2024-03-15T09:00:00.000Z",
    "pickupDate": "2024-03-20T09:00:00.000Z",
    ...
  }
}`}</code>
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Security</h3>
                    <p className="text-muted-foreground">
                      Each webhook includes a signature in the <code className="bg-muted px-1 py-0.5 rounded">X-Webhook-Signature</code> header
                      that you can use to verify the request authenticity. The signature is generated using HMAC-SHA256
                      with your webhook secret (shown when you create the webhook).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Example Webhook Handler</h3>
                    <pre className="bg-muted p-4 rounded overflow-x-auto text-sm">
                      <code>{`// Express.js example
app.post('/webhooks/haultracker', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);

  // Verify signature (recommended)
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).send('Invalid signature');
  }

  // Process the event
  const { event, data } = req.body;

  switch (event) {
    case 'booking.created':
      // Handle new booking
      console.log('New booking:', data.id);
      break;
    case 'booking.updated':
      // Handle booking update
      console.log('Booking updated:', data.id);
      break;
    // ... handle other events
  }

  res.status(200).send('OK');
});`}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
