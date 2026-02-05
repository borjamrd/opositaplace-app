# Opositaplace

```shell
pnpm install
pnpm dev
```

## Variables de Entorno (Simulación UNIR)

Crea un archivo `.env` en la raíz del proyecto con los siguientes valores de ejemplo. Las claves de STRIPE son de un sandbox, por lo que se pueden simular pagos de suscripciones.

[Enlace a variables de entorno](https://docs.google.com/document/d/1mbrx6U6hvvjeje5-B8wpeR4swZO6ncVksj6lIqIgvnE/edit?usp=sharing)

### Pruebas de Pago (Simulación UNIR)

Para realizar pruebas de pago en el entorno de simulación, utiliza la siguiente tarjeta de prueba de Stripe:

| Marca | Número                | CVC                  | Fecha                  |
| :---- | :-------------------- | :------------------- | :--------------------- |
| Visa  | `4242 4242 4242 4242` | 3 dígitos aleatorios | Cualquier fecha futura |
