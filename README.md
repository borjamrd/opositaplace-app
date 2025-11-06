# Opositaplace

```shell
npm install
npm run dev
```

## Levantar stripe localmente

```shell
stripe login
stripe listen --forward-to localhost:3000/api/webhooks
# Esto generará una secret key, añádela a tu archivo .env a STRIPE_WEBHOOK_SECRET

```
