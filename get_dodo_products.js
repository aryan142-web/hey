import fs from 'fs';

const API_KEY = 'KzYB3Wr77b8QjWzY.n6cvLW2RudnI3BjMYzB-SLqxYe-9n3S_OLwmtMLZosO0q6Ff';

async function getProducts() {
    try {
        console.log('Fetching products from Live...');
        const response = await fetch('https://live.dodopayments.com/products', {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        const data = await response.json();
        fs.writeFileSync('products_detailed.json', JSON.stringify(data, null, 2));
        console.log('Saved to products_detailed.json');
    } catch (error) {
        console.error('Error:', error);
    }
}

getProducts();
