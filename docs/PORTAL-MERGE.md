# Add the Square migration status to ClientPortal

The package includes:

```text
components/SquareRentalStatus.jsx
```

During the migration, leave the existing Stripe portal panels intact.

In:

```text
pages/ClientPortal.jsx
```

add:

```js
import SquareRentalStatus from "../components/SquareRentalStatus";
```

Then, inside the signed-in portal layout, after the tab buttons and before the
tab-specific panels, add:

```jsx
<SquareRentalStatus accessToken={session.access_token} />
```

This deliberately shows a separate Square status card while both payment
providers coexist.

Once Square passes production testing and Stripe is retired, the Square fields
should be folded directly into the existing Payments/Documents UI and the
temporary migration component can be removed.
