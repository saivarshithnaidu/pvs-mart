export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto prose">
                <h1>Terms and Conditions</h1>
                <p className="lead">Welcome to PVS Mart.</p>
                <p>By accessing this website and purchasing products, you agree to these terms.</p>

                <h3>1. General</h3>
                <p>PVS Mart is a local grocery delivery service defined for specific regions. We reserve the right to cancel orders if the delivery address is outside our service area.</p>

                <h3>2. Products & Pricing</h3>
                <p>Prices are subject to change without notice. We strive for accuracy, but errors may occur. Images are for illustration only.</p>

                <h3>3. Orders</h3>
                <p>We reserve the right to limit quantities. Order confirmation does not signify acceptance; we may cancel orders for suspected fraud or stock issues.</p>
            </div>
        </div>
    );
}
