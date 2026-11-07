# Mobile OTP sign-in setup

This Pages site needs Supabase Auth and an SMS provider for real OTP delivery. No
OTP is sent until the setup below is complete.

1. Create a Supabase project and enable **Phone** under Authentication → Sign In / Providers.
2. Configure an SMS provider in Supabase Authentication → SMS Provider. Use the provider's credentials in Supabase settings only.
3. Run `phone-auth.sql` once in the Supabase SQL Editor.
4. In Supabase Authentication → URL Configuration, add `https://codernil0.github.io/nca-technical/` as a redirect URL.
5. Put the project URL and **publishable** key in `auth-config.js`. Do not use a service-role or secret key in the browser.
6. Create/sign in with each administrator's phone, then promote those verified users in the SQL Editor using the statement at the bottom of `phone-auth.sql`.
7. Commit `auth-config.js` and deploy the site again.

User and administrator accounts both receive SMS OTPs. The database role controls
the administrator path; selecting “Admin” in the UI never grants that role.

