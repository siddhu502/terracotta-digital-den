# Fix checkout and add admin pricing controls

## What will change
- Remove Google sign-in and keep email/password sign-in only.
- Remove the visible “प्रशासन” link from the public header; admin remains available at `/admin` after sign-in.
- Restrict admin access to the supplied admin email using server-verified identity, not a client-side password check.
- Add a clear Free/Paid selector to the admin product form. Paid items keep an editable INR price; free items use ₹0.
- Make free items create a library purchase record without Razorpay, then generate the personalized PDF. Paid items must create and complete a Razorpay order before download.
- Improve checkout error handling so configuration or gateway failures are shown clearly instead of silently downloading.
- Verify sign-in, free product delivery, paid checkout opening, and responsive UI.

## Technical details
- Add a protected server function for claiming free products and reuse the existing purchase/library pipeline.
- Enforce admin authorization for product/category mutations and the admin route using the authenticated email.
- Keep Razorpay credentials server-side and confirm both required secrets are configured.
- Update Marathi labels and price formatting for the new pricing states.
