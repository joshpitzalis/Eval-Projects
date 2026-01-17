export const trainingSet = [
	{
		user: "I was charged twice for my subscription. Fix it.",
		context:
			"You are a support assistant for Acme. Ask for needed info and provide next steps.",
		output:
			"I understand you were charged twice for your subscription. I'm here to help fix this. To investigate and process a refund, I need a few details:\n\n- Your account email address\n- Order or invoice numbers for both charges\n- Approximate dates of the charges\n\nOnce I have this information, I can review your billing history and submit a request to our billing team to process the duplicate charge refund. This typically takes 3-5 business days to complete.\n\nDo you have these details available?",
		expected: 0,
	},
	{
		user: "How do I reset my password?",
		context:
			"Password resets can be done via the 'Forgot Password' link on the login page. Users will receive a reset email within 5 minutes.",
		output:
			"To reset your password:\n\n- Click 'Forgot Password' on the login page\n- You'll receive a reset email within 5 minutes\n- Follow the link in that email to create a new password\n\nIf you don't receive the email, please check your spam folder.",
		expected: 1,
	},
	{
		user: "My order hasn't arrived yet. Where is it?",
		context:
			"Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days. Tracking information is sent via email after shipment.",
		output:
			"I can help you track your order. Could you please provide your order number? Once I have that, I can look up the shipping status and estimated delivery date for you.",
		expected: 0,
	},
	{
		user: "Can I upgrade my plan?",
		context:
			"Plans can be upgraded anytime from the Account Settings page under 'Billing'. Upgrades are prorated and take effect immediately.",
		output:
			"Yes! You can upgrade your plan anytime:\n\n- Go to Account Settings\n- Select 'Billing'\n- Choose your new plan\n\nUpgrades are prorated and take effect immediately. You'll only pay the difference for the remaining billing period.",
		expected: 1,
	},
];

export const devSet = [
	{
		user: "I can't log into my account!",
		context:
			"Common login issues: incorrect password, caps lock enabled, account locked after 5 failed attempts (unlocks after 30 minutes).",
		output:
			"I'm sorry you're having trouble logging in. Here are some common solutions:\n\n- Verify caps lock is off\n- Try resetting your password\n- If you've had 5 failed attempts, your account locks for 30 minutes\n\nPlease try these steps and let me know if you're still unable to access your account.",
		expected: 1,
	},
	{
		user: "What's your refund policy?",
		context: "You are a support assistant for TechCorp.",
		output:
			"I don't have specific information about our refund policy in my current resources. Let me raise this with my supervisor to get you accurate details about our refund terms and process. I'll get back to you shortly with complete information.",
		expected: 1,
	},
	{
		user: "Delete my account permanently.",
		context:
			"Account deletion requests must be submitted via the Account Settings page under 'Privacy & Security'. Deletions are processed within 48 hours and are irreversible.",
		output:
			"I understand you want to delete your account. To process this:\n\n- Go to Account Settings\n- Navigate to 'Privacy & Security'\n- Submit your deletion request\n\nDeletions are processed within 48 hours and are permanent. All your data will be removed and cannot be recovered.",
		expected: 1,
	},
	{
		user: "Why was my payment declined?",
		context: "You are a support assistant for PayFlow.",
		output:
			"Payment declines can happen for several reasons including insufficient funds, expired cards, incorrect billing information, or fraud prevention triggers. I recommend contacting your bank to verify the issue, then updating your payment method in our system. You can also try using a different card.",
		expected: 0,
	},
	{
		user: "How do I cancel my subscription?",
		context:
			"Subscriptions can be cancelled from Account Settings > Subscriptions. Cancellations take effect at the end of the current billing period. No refunds for partial months.",
		output:
			"To cancel your subscription:\n\n- Go to Account Settings\n- Click 'Subscriptions'\n- Select 'Cancel Subscription'\n\nYour cancellation takes effect at the end of your current billing period. Note that partial months are not refunded.",
		expected: 1,
	},
	{
		user: "I need a copy of my invoice from last month.",
		context:
			"Invoices are available in Account Settings > Billing History. Users can download PDFs of all past invoices.",
		output:
			"You can access your invoice easily:\n\n- Go to Account Settings\n- Select 'Billing History'\n- Find last month's invoice and download the PDF\n\nAll your past invoices are available there for download.",
		expected: 1,
	},
	{
		user: "What features are included in the Pro plan?",
		context: "You are a support assistant for CloudStore.",
		output:
			"Great question! The Pro plan includes unlimited storage, advanced collaboration tools, priority support, custom branding options, and API access. You also get enhanced security features like two-factor authentication and SSO integration. Would you like to upgrade?",
		expected: 0,
	},
	{
		user: "My email address changed. How do I update it?",
		context:
			"Email addresses can be updated in Account Settings > Profile. A verification email will be sent to the new address before the change is finalized.",
		output:
			"To update your email address:\n\n- Go to Account Settings\n- Click 'Profile'\n- Enter your new email\n\nYou'll receive a verification email at the new address. Click the link to finalize the change.",
		expected: 1,
	},
];
export const testSet = [
	{
		user: "Is my data encrypted?",
		context: "You are a support assistant for SecureBox.",
		output:
			"I don't have detailed information about our encryption protocols in my current resources. This is an important security question, so I'll raise this with my supervisor to get you accurate technical details about how we protect your data. I'll follow up with you soon.",
		expected: 1,
	},
	{
		user: "Can you give me a discount code?",
		context:
			"Discount codes are distributed via email newsletters and social media. Support agents cannot generate custom discount codes.",
		output:
			"I appreciate your interest! Unfortunately, I'm unable to generate custom discount codes. Discounts are distributed through:\n\n- Email newsletters\n- Social media promotions\n\nI recommend subscribing to our newsletter to receive exclusive offers.",
		expected: 1,
	},
	{
		user: "I forgot my username. Can you tell me what it is?",
		context: "You are a support assistant for NetPortal.",
		output:
			"I can help you recover your username. Please provide your registered email address and I'll send your username to that email within a few minutes. For security reasons, I cannot share account information directly in chat.",
		expected: 0,
	},
	{
		user: "How long does shipping take to Canada?",
		context:
			"International shipping to Canada takes 10-14 business days. Customs may add additional processing time. Tracking is provided.",
		output:
			"Shipping to Canada takes 10-14 business days. Please note that customs processing may add extra time. You'll receive tracking information via email once your order ships so you can monitor its progress.",
		expected: 0,
	},
	{
		user: "Your app keeps crashing on my phone!",
		context: "You are a support assistant for MobileMax app.",
		output:
			"I'm sorry you're experiencing crashes. Try these steps: 1) Update to the latest app version, 2) Restart your phone, 3) Clear the app cache, 4) Reinstall the app if needed. If the problem persists after trying these, please let me know your phone model and OS version so I can investigate further.",
		expected: 0,
	},
	{
		user: "What payment methods do you accept?",
		context:
			"Accepted payment methods: Visa, Mastercard, American Express, PayPal, and bank transfers for enterprise accounts.",
		output:
			"We accept the following payment methods:\n\n- Visa, Mastercard, American Express\n- PayPal\n- Bank transfers (enterprise accounts only)\n\nYou can add or update your payment method in Account Settings > Billing.",
		expected: 0,
	},
	{
		user: "Can I transfer my subscription to someone else?",
		context: "You are a support assistant for LearningHub.",
		output:
			"I don't have information about subscription transfers in my current resources. This involves account ownership and billing policies that I want to get exactly right for you. Let me raise this with my supervisor and I'll get back to you with accurate details about transfer options.",
		expected: 1,
	},
	{
		user: "I'm getting an error code 4521. What does that mean?",
		context:
			"Error code 4521 indicates a database connection timeout. This is usually temporary. Users should wait 5 minutes and try again. If it persists, contact support.",
		output:
			"Error code 4521 indicates a temporary database connection issue. Here's what to do:\n\n- Wait 5 minutes\n- Try your action again\n- If the error persists, please let me know and I'll escalate this to our technical team for immediate investigation.",
		expected: 1,
	},
];
