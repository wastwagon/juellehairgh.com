import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultContent = {
  TERMS_CONDITIONS: `
<h2>Terms & Conditions</h2>
<p><strong>Last updated: ${new Date().toLocaleDateString()}</strong></p>

<p>Welcome to Juelle Hair Ghana. These Terms and Conditions ("Terms") govern your use of our website and services. By accessing and using this website, you accept and agree to be bound by these Terms.</p>

<h3>1. Acceptance of Terms</h3>
<p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms, please do not use our website.</p>

<h3>2. Use License</h3>
<p>Permission is granted to temporarily download one copy of the materials on our website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
<ul>
  <li>Modify or copy the materials</li>
  <li>Use the materials for any commercial purpose or for any public display</li>
  <li>Attempt to decompile or reverse engineer any software contained on the website</li>
  <li>Remove any copyright or other proprietary notations from the materials</li>
</ul>

<h3>3. Product Information</h3>
<p>We strive to provide accurate product information, including descriptions, images, and pricing. However, we do not warrant that product descriptions or other content on this site is accurate, complete, reliable, current, or error-free. Product images are for illustrative purposes only and may not reflect the exact appearance of the product.</p>

<h3>4. Pricing and Payment</h3>
<p>All prices are in Ghana Cedis (GHS) unless otherwise stated. We reserve the right to change prices at any time without notice. Payment must be made at the time of purchase through our accepted payment methods (credit/debit cards, mobile money, bank transfers).</p>

<h3>5. Orders and Shipping</h3>
<p>When you place an order, you are making an offer to purchase products. We reserve the right to accept or reject your order. Shipping terms and delivery times are outlined in our Shipping Policy. Please review these policies before making a purchase.</p>

<h3>6. Returns and Refunds</h3>
<p>Our return and refund policy is detailed in our Return & Refund Policy section. Please review these terms before making a purchase. Items must be returned in their original condition with tags attached.</p>

<h3>7. Limitation of Liability</h3>
<p>In no event shall Juelle Hair Ghana or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage.</p>

<h3>8. Intellectual Property</h3>
<p>All content on this website, including text, graphics, logos, images, and software, is the property of Juelle Hair Ghana and is protected by copyright and trademark laws. You may not use our content without our express written permission.</p>

<h3>9. User Accounts</h3>
<p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>

<h3>10. Modifications</h3>
<p>We reserve the right to modify these Terms at any time. Your continued use of the website after any changes constitutes your acceptance of the new Terms.</p>

<h3>11. Contact Information</h3>
<p>If you have any questions about these Terms, please contact us at:</p>
<ul>
  <li>Email: sales@juellehairgh.com</li>
  <li>Phone: +233 539506949</li>
  <li>Address: Dansoman, Accra, Ghana</li>
</ul>
  `.trim(),

  PRIVACY_POLICY: `
<h2>Privacy Policy</h2>
<p><strong>Last updated: ${new Date().toLocaleDateString()}</strong></p>

<p>At Juelle Hair Ghana, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our website or make a purchase.</p>

<h3>1. Information We Collect</h3>
<p>We collect information that you provide directly to us, including:</p>
<ul>
  <li><strong>Personal Information:</strong> Name, email address, phone number, shipping and billing addresses</li>
  <li><strong>Payment Information:</strong> Credit/debit card details, mobile money information (processed securely through Paystack)</li>
  <li><strong>Order History:</strong> Products purchased, order dates, order amounts</li>
  <li><strong>Account Information:</strong> Username, password, preferences, wishlist items</li>
  <li><strong>Communication Data:</strong> Messages sent through our contact form, customer service inquiries</li>
</ul>

<h3>2. How We Use Your Information</h3>
<p>We use the information we collect to:</p>
<ul>
  <li>Process and fulfill your orders</li>
  <li>Communicate with you about your orders, products, and services</li>
  <li>Send you marketing communications (with your consent)</li>
  <li>Improve our website, products, and services</li>
  <li>Prevent fraud and ensure security</li>
  <li>Comply with legal obligations</li>
  <li>Respond to your inquiries and provide customer support</li>
</ul>

<h3>3. Information Sharing</h3>
<p>We do not sell, trade, or rent your personal information to third parties. We may share your information with:</p>
<ul>
  <li><strong>Service Providers:</strong> Payment processors (Paystack), shipping companies, email service providers</li>
  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
  <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
</ul>

<h3>4. Data Security</h3>
<p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:</p>
<ul>
  <li>SSL encryption for data transmission</li>
  <li>Secure payment processing through Paystack</li>
  <li>Regular security assessments and updates</li>
  <li>Limited access to personal information on a need-to-know basis</li>
</ul>

<h3>5. Cookies and Tracking</h3>
<p>We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and personalize content. You can control cookie preferences through your browser settings.</p>

<h3>6. Your Rights</h3>
<p>You have the right to:</p>
<ul>
  <li>Access your personal information</li>
  <li>Correct inaccurate information</li>
  <li>Request deletion of your information</li>
  <li>Opt-out of marketing communications</li>
  <li>Object to processing of your information</li>
</ul>

<h3>7. Data Retention</h3>
<p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.</p>

<h3>8. Children's Privacy</h3>
<p>Our website is not intended for children under 18 years of age. We do not knowingly collect personal information from children.</p>

<h3>9. Changes to This Policy</h3>
<p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>

<h3>10. Contact Us</h3>
<p>If you have any questions about this Privacy Policy or our data practices, please contact us at:</p>
<ul>
  <li>Email: sales@juellehairgh.com</li>
  <li>Phone: +233 539506949</li>
  <li>Address: Dansoman, Accra, Ghana</li>
</ul>
  `.trim(),

  ABOUT_US: `
<h2>About Juelle Hair Ghana</h2>

<p>Welcome to Juelle Hair Ghana, your premier destination for high-quality hair products and accessories. We are committed to providing our customers with the finest hair products, exceptional service, and an unforgettable shopping experience.</p>

<h3>Our Mission</h3>
<p>To empower individuals to express their unique style through premium hair products while maintaining the highest standards of quality and customer satisfaction. We believe that everyone deserves to look and feel their best, and we're here to make that possible.</p>

<h3>Our Story</h3>
<p>Founded with a passion for beauty and style, Juelle Hair Ghana began with a simple vision: to bring the finest hair products to customers across Ghana. What started as a small venture has grown into a trusted name in the hair products industry, serving thousands of satisfied customers.</p>

<p>We understand that hair is more than just a style choice—it's a form of self-expression. That's why we carefully curate our collection of wigs, braids, ponytails, clip-ins, and hair care products, ensuring that every item meets our high standards for quality and style.</p>

<h3>Our Values</h3>
<ul>
  <li><strong>Quality:</strong> We source only the best products from trusted suppliers, ensuring durability, natural appearance, and long-lasting beauty.</li>
  <li><strong>Customer First:</strong> Your satisfaction is our priority. We go above and beyond to ensure you have a positive shopping experience.</li>
  <li><strong>Innovation:</strong> We stay ahead of trends, constantly updating our collection with the latest styles and products.</li>
  <li><strong>Integrity:</strong> We conduct business with honesty and transparency, building trust with our customers through reliable service.</li>
  <li><strong>Accessibility:</strong> We believe everyone should have access to quality hair products, which is why we offer competitive pricing and flexible payment options.</li>
</ul>

<h3>What We Offer</h3>
<p>Our extensive collection includes:</p>
<ul>
  <li><strong>Lace Wigs:</strong> Natural-looking wigs with realistic hairlines</li>
  <li><strong>Braids:</strong> High-quality braiding hair in various textures and colors</li>
  <li><strong>Ponytails:</strong> Versatile ponytail extensions for quick style changes</li>
  <li><strong>Clip-ins:</strong> Easy-to-use clip-in extensions for added volume and length</li>
  <li><strong>Hair Growth Oils:</strong> Nourishing oils to promote healthy hair growth</li>
  <li><strong>Hair Care Products:</strong> Shampoos, conditioners, and styling products</li>
</ul>

<h3>Our Commitment</h3>
<p>We are committed to:</p>
<ul>
  <li>Providing exceptional customer service</li>
  <li>Offering competitive prices and regular promotions</li>
  <li>Ensuring fast and reliable shipping</li>
  <li>Maintaining the highest quality standards</li>
  <li>Supporting our customers throughout their hair journey</li>
</ul>

<h3>Why Choose Us?</h3>
<ul>
  <li>Wide selection of premium hair products</li>
  <li>Competitive pricing and regular sales</li>
  <li>Fast and reliable shipping across Ghana</li>
  <li>Secure payment options</li>
  <li>Excellent customer support</li>
  <li>Easy returns and exchanges</li>
</ul>

<h3>Contact Us</h3>
<p>We'd love to hear from you! Whether you have questions, feedback, or just want to say hello, we're here for you.</p>
<ul>
  <li>Email: sales@juellehairgh.com</li>
  <li>Phone: +233 539506949</li>
  <li>Address: Dansoman, Accra, Ghana</li>
  <li>Business Hours: Monday - Friday, 9:00 AM - 6:00 PM GMT</li>
</ul>

<p>Thank you for choosing Juelle Hair Ghana. We look forward to serving you!</p>
  `.trim(),

  SHIPPING_POLICY: `
<h2>Shipping Policy</h2>
<p><strong>Last updated: ${new Date().toLocaleDateString()}</strong></p>

<h3>Free Shipping</h3>
<p>Enjoy free shipping on all orders over <strong>GHS 950</strong> within Ghana. Orders below this amount will incur standard shipping charges.</p>

<h3>Shipping Methods</h3>

<h4>Standard Shipping</h4>
<p>Standard shipping typically takes <strong>3-7 business days</strong> for delivery within Ghana. Orders are processed within 1-2 business days after payment confirmation.</p>
<ul>
  <li>Processing Time: 1-2 business days</li>
  <li>Delivery Time: 3-7 business days</li>
  <li>Cost: Calculated at checkout (Free for orders over GHS 950)</li>
</ul>

<h4>Express Shipping</h4>
<p>Express shipping is available for faster delivery (1-3 business days). Additional charges apply. Contact us for express shipping rates and availability.</p>
<ul>
  <li>Processing Time: 1 business day</li>
  <li>Delivery Time: 1-3 business days</li>
  <li>Cost: Additional charges apply</li>
</ul>

<h3>Delivery Areas</h3>
<p>We currently ship to all regions within Ghana. Delivery times may vary based on location:</p>
<ul>
  <li><strong>Greater Accra Region:</strong> 2-4 business days</li>
  <li><strong>Other Regions:</strong> 3-7 business days</li>
  <li><strong>Remote Areas:</strong> 5-10 business days</li>
</ul>

<h3>Order Processing</h3>
<ul>
  <li><strong>Processing Time:</strong> Orders are typically processed within 1-2 business days after payment confirmation.</li>
  <li><strong>Tracking:</strong> Once your order ships, you'll receive a tracking number via email to monitor your package's delivery status.</li>
  <li><strong>Delivery Confirmation:</strong> You'll receive a notification when your order is delivered.</li>
</ul>

<h3>Shipping Costs</h3>
<p>Shipping costs are calculated at checkout based on:</p>
<ul>
  <li>Order weight and dimensions</li>
  <li>Delivery location</li>
  <li>Selected shipping method</li>
</ul>
<p>Free shipping applies automatically for orders over GHS 950.</p>

<h3>International Shipping</h3>
<p>Currently, we only ship within Ghana. We're working on expanding our shipping options to other countries in the future. Please check back for updates.</p>

<h3>Order Tracking</h3>
<p>Once your order ships, you'll receive:</p>
<ul>
  <li>Email notification with tracking number</li>
  <li>Link to track your package online</li>
  <li>Estimated delivery date</li>
</ul>
<p>You can track your order using the tracking number provided or by logging into your account.</p>

<h3>Delivery Issues</h3>
<p>If you experience any issues with delivery, please contact us immediately:</p>
<ul>
  <li>Email: sales@juellehairgh.com</li>
  <li>Phone: +233 539506949</li>
</ul>
<p>We'll work with the shipping carrier to resolve any delivery problems.</p>

<h3>Questions About Shipping?</h3>
<p>If you have any questions about shipping, delivery times, or tracking your order, please contact us:</p>
<ul>
  <li>Email: sales@juellehairgh.com</li>
  <li>Phone: +233 539506949</li>
  <li>Business Hours: Monday - Friday, 9:00 AM - 6:00 PM GMT</li>
</ul>
  `.trim(),

  RETURNS_POLICY: `
<h2>Return & Refund Policy</h2>
<p><strong>Last updated: ${new Date().toLocaleDateString()}</strong></p>

<h3>Return Period</h3>
<p>You have <strong>14 days</strong> from the date of delivery to return items for a refund or exchange.</p>

<h3>Return Conditions</h3>
<p>To be eligible for a return, items must meet the following conditions:</p>
<ul>
  <li>Items must be unused and in their original condition</li>
  <li>Items must be in original packaging with tags attached</li>
  <li>Items must not be damaged, worn, or altered</li>
  <li>Proof of purchase (order number or receipt) is required</li>
  <li>Hygiene products and personalized items are not eligible for return</li>
  <li>Items purchased during sales follow the same return policy</li>
</ul>

<h3>How to Return</h3>

<h4>Step 1: Contact Us</h4>
<p>Contact our customer service team to initiate a return. Provide your order number and reason for return. You can reach us at:</p>
<ul>
  <li>Email: sales@juellehairgh.com</li>
  <li>Phone: +233 539506949</li>
</ul>

<h4>Step 2: Package the Item</h4>
<p>Package the item securely in its original packaging. Include all original tags, labels, and accessories. We recommend using the original shipping box if possible.</p>

<h4>Step 3: Ship the Item</h4>
<p>Ship the item to the return address provided by our customer service team. We recommend using a trackable shipping method to ensure the item reaches us safely.</p>

<h4>Step 4: Receive Refund</h4>
<p>Once we receive and inspect the returned item, we'll process your refund within 5-7 business days.</p>

<h3>Refunds</h3>

<h4>Processing Time</h4>
<p>Refunds are processed within 5-7 business days after we receive and inspect the returned item.</p>

<h4>Refund Method</h4>
<p>Refunds will be issued to the original payment method used for the purchase:</p>
<ul>
  <li>Credit/Debit Cards: Refunded to the original card (may take 5-10 business days to appear)</li>
  <li>Mobile Money: Refunded to the original mobile money account</li>
  <li>Bank Transfer: Refunded to the original bank account</li>
</ul>

<h4>Shipping Costs</h4>
<p>Original shipping costs are non-refundable unless:</p>
<ul>
  <li>The item was defective or damaged</li>
  <li>We made an error (wrong item sent, etc.)</li>
  <li>The item doesn't match the description</li>
</ul>

<h3>Exchanges</h3>
<p>We currently do not offer direct exchanges. To exchange an item:</p>
<ol>
  <li>Return the original item following our return process</li>
  <li>Place a new order for the desired item</li>
  <li>Once your return is processed, you'll receive a refund for the original purchase</li>
</ol>

<h3>Damaged or Incorrect Items</h3>
<p>If you receive a damaged or incorrect item, please contact us immediately with photos of the issue. We'll arrange for a replacement or full refund at no cost to you, including return shipping.</p>

<h3>Non-Returnable Items</h3>
<p>The following items are not eligible for return:</p>
<ul>
  <li>Hygiene products (opened)</li>
  <li>Personalized or custom-made items</li>
  <li>Items damaged by misuse or normal wear</li>
  <li>Items without proof of purchase</li>
</ul>

<h3>Return Shipping</h3>
<p>Customers are responsible for return shipping costs unless:</p>
<ul>
  <li>The item was defective or damaged</li>
  <li>We sent the wrong item</li>
  <li>The item doesn't match the description</li>
</ul>
<p>We recommend using a trackable shipping method for returns.</p>

<h3>Need Help with Returns?</h3>
<p>If you have any questions about returns or need assistance, please contact us:</p>
<ul>
  <li>Email: sales@juellehairgh.com</li>
  <li>Phone: +233 539506949</li>
  <li>Business Hours: Monday - Friday, 9:00 AM - 6:00 PM GMT</li>
</ul>
<p>Our customer service team is here to help make the return process as smooth as possible.</p>
  `.trim(),

  FAQ_CONTENT: JSON.stringify([
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit/debit cards (Visa, Mastercard), mobile money (MTN, Vodafone, AirtelTigo), and bank transfers. All payments are processed securely through Paystack, ensuring your financial information is protected."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping typically takes 3-7 business days within Ghana. Express shipping (1-3 business days) is also available for an additional fee. Processing time is 1-2 business days after payment confirmation."
    },
    {
      question: "Do you offer free shipping?",
      answer: "Yes! We offer free shipping on all orders over GHS 950 within Ghana. Orders below this amount will incur standard shipping charges, which are calculated at checkout."
    },
    {
      question: "Can I return or exchange items?",
      answer: "Yes, you can return items within 14 days of delivery. Items must be unused, in original packaging with tags attached. Contact our customer service team to initiate a return. We currently don't offer direct exchanges, but you can return an item and place a new order."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email. You can use this tracking number to monitor your package's delivery status online or by logging into your account."
    },
    {
      question: "What if I receive a damaged or incorrect item?",
      answer: "If you receive a damaged or incorrect item, please contact us immediately with photos of the issue. We'll arrange for a replacement or full refund at no cost to you, including return shipping."
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, we only ship within Ghana. We're working on expanding our shipping options to other countries in the future. Please check back for updates or contact us for more information."
    },
    {
      question: "How do I care for my wig or hair extensions?",
      answer: "We provide care instructions with each product. Generally, use sulfate-free shampoos, avoid excessive heat, store on a wig stand, and follow the specific care guidelines for your product type. Proper care will extend the life of your hair products significantly."
    },
    {
      question: "Can I cancel my order?",
      answer: "You can cancel your order within 24 hours of placing it, provided it hasn't been shipped yet. Contact our customer service team to cancel your order. Once an order has shipped, you'll need to follow our return process."
    },
    {
      question: "Do you offer discounts or promotions?",
      answer: "Yes! We regularly offer promotions, flash sales, and discounts. Subscribe to our newsletter and follow us on social media to stay updated on the latest deals. We also offer special discounts for first-time customers."
    },
    {
      question: "What is your return policy for sale items?",
      answer: "Sale items follow the same return policy as regular items. They must be returned within 14 days in unused condition with original packaging and tags. All standard return conditions apply."
    },
    {
      question: "How do I contact customer service?",
      answer: "You can reach us via email at sales@juellehairgh.com, phone at +233 539506949, or through our contact page. We typically respond within 24 hours during business hours (Monday - Friday, 9:00 AM - 6:00 PM GMT)."
    },
    {
      question: "Are your products authentic?",
      answer: "Yes, all our products are 100% authentic and sourced directly from trusted suppliers. We guarantee the quality and authenticity of every item we sell. If you have any concerns about a product, please contact us immediately."
    },
    {
      question: "What is your privacy policy?",
      answer: "We take your privacy seriously. We collect only necessary information to process your orders and improve your shopping experience. We never sell your personal information to third parties. For more details, please review our Privacy Policy page."
    },
    {
      question: "How do I create an account?",
      answer: "You can create an account during checkout or by clicking 'Sign Up' in the top navigation. Having an account allows you to track orders, save addresses, manage wishlists, and receive exclusive offers."
    }
  ], null, 2),
};

async function seedPageContent() {
  console.log("🌱 Starting to seed page content...\n");

  try {
    for (const [key, content] of Object.entries(defaultContent)) {
      console.log(`📝 Seeding ${key}...`);
      
      await prisma.setting.upsert({
        where: { key },
        update: {
          value: content,
          category: "content",
          updatedAt: new Date(),
        },
        create: {
          key,
          value: content,
          category: "content",
        },
      });

      console.log(`✅ ${key} seeded successfully\n`);
    }

    console.log("🎉 All page content seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding page content:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connection established\n");
    
    await seedPageContent();
    console.log("\n✨ Seeding completed!");
  } catch (error) {
    console.error("\n💥 Seeding failed:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

