export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const response = await fetch('https://live.dodopayments.com/checkouts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.VITE_DODO_PAYMENTS_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();

        if (response.ok) {
            // If the Dodo API call was successful, return its data to the client.
            // The client-side code will then handle the `checkout_url` redirection.
            return res.status(200).json(data);
        } else {
            // If the Dodo API returned an error, log it and return the error details to the client.
            console.error('Dodo API Error:', data);
            // Attempt to extract more specific error details from the Dodo API response
            const errorDetails = data.error || (data.errors && JSON.stringify(data.errors)) || data.message || 'Unknown Dodo API error';
            return res.status(response.status).json({
                error: 'Dodo API Error',
                details: errorDetails,
                fullResponse: data // Include full response for debugging
            });
        }
    } catch (error) {
        // This catch block handles network errors or issues before/during the fetch call.
        console.error('Backend Network/Integration Error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            details: error.message || 'An unexpected error occurred during the API call.'
        });
    }
}
