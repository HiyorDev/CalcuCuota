# CalcuCuota

Simulador de créditos de consumo para Chile. Calcula la cuota mensual, el costo total, el CAE y la tabla de amortización, compara bancos y genera un resumen en PDF.

> **Cómo se hizo:** este proyecto fue creado en conjunto con **Claude**, el asistente de IA de Anthropic, a través del chat de claude.ai. Las ideas, el diseño y las decisiones las fue guiando una persona; Claude investigó los datos, escribió el código y lo fue corrigiendo en cada paso. Conviene revisar el código y los datos antes de usarlo en algo serio.

## Qué hace

- Calcula la **cuota mensual** (sistema francés, cuota fija), el **total a pagar** y el **costo del crédito**.
- Calcula el **CAE** con el método oficial (tasa mensual que iguala lo que recibes con lo que pagas, multiplicada por 12).
- Considera **seguro de desgravamen**, **comisión inicial**, **gastos notariales**, **impuesto de timbres** y **meses de gracia** (primera cuota a 30, 60 o 90 días).
- **Compara bancos** con el mismo monto y plazo, ordenados por menor cuota o menor CAE.
- Muestra qué porcentaje de tu **sueldo** representa la cuota.
- Simula un **abono extra mensual** (cuántos meses antes terminas y cuánto ahorras).
- Avisa si tu tasa supera la **tasa máxima convencional** vigente.
- Dibuja un **gráfico del saldo** y una **tabla de amortización**.
- Descarga un **resumen en PDF**, generado dentro de la propia página.
- Modo claro y oscuro, y diseño adaptable a celulares.

## Estructura

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Estructura de la página y textos |
| `styles.css` | Diseño y adaptación a móviles |
| `app.js` | Cálculos, comparador, gráfico y generador de PDF |

Para usarlo, deja los tres archivos en la misma carpeta y abre `index.html` en el navegador. No necesita instalar nada ni conexión a internet.

## Bancos incluidos y de dónde sale cada tasa

Las tasas son **referenciales**. Cada banco fija la tasa real según tu perfil, monto y plazo.

| Banco | Tasa mensual usada | Origen del dato |
|---|---|---|
| Santander | 1,39% | Ejemplo de simulación publicado ($10.000.000 a 48 cuotas, CAE 17,38%), reproducido por Rankia y Autofact |
| BancoEstado | 2,19% | Ejemplo publicado (CAE 25,66%), reproducido por Autofact |
| BCI | 1,60% | **Estimación.** BCI muestra desde 0,89% mensual en ofertas online y ejemplos de hasta 2,96% |
| Banco de Chile | 1,50% | **Estimación.** No se encontró una tasa publicada reciente |
| Scotiabank | 1,45% | Comparador secundario (junio 2026) |
| Banco Internacional | 1,42% | Comparador secundario (junio 2026) |
| BICE | 1,56% | Comparador secundario (junio 2026). Un ejemplo del SERNAC (oct. 2025) mostraba 1,25% |
| Coopeuch | 1,29% | Comparador secundario (junio 2026). Cooperativa, para socios |

Para cambiar o agregar un banco, edita la lista `BANKS` al inicio de `app.js`:

```js
{n:"Nombre del banco", r:1.39, t:"De dónde sale la tasa"}
```

Agrega `e:1` si la tasa es una estimación, para que se marque como "(est.)".

## Datos oficiales usados (27 de octubre de 2026)

- **UF:** $41.226,39 (serie del SII).
- **Tasa máxima convencional** (CMF, certificado 10/2026, vigente desde el 15 de octubre de 2026), para créditos de 90 días o más: 41,02% anual hasta 50 UF, 34,02% hasta 200 UF y 30,03% hasta 5.000 UF.
- **Impuesto de timbres y estampillas:** 0,066% mensual sobre el monto, con tope de 0,8% (Decreto Ley 3.475).

Estos valores cambian con el tiempo. La UF cambia a diario, la tasa máxima convencional se publica cada mes y están escritos directamente en `app.js` (`UF` y `TMC`) y en los textos de `index.html`. Hay que actualizarlos a mano.

## Fórmulas principales

```
Monto bruto   Pb = (P · (1 + f) + G) / (1 − t)      t = mín(0,066% · n ; 0,8%)
Cuota base    C  = Pb · r / (1 − (1 + r)^−n)
Con gracia    Cg = C · (1 + r)^g
Cuota total   Cuota = Cg + Pb · s
CAE           P = Σ Pago_k / (1 + i)^k     →   CAE = i · 12
```

P es el monto que recibes, n las cuotas, r la tasa mensual, f la comisión, G los gastos notariales, s el seguro mensual y g los meses de gracia. La página tiene una sección "¿Cómo calculamos?" con todas las fórmulas y un ejemplo.

## Limitaciones

- No es una cotización ni una oferta de ningún banco. El CAE y la cuota que valen son los de tu cotización oficial.
- El seguro de desgravamen se calcula sobre el monto bruto, no sobre el saldo, y viene en 0% por defecto.
- Las tasas de varios bancos vienen de fuentes secundarias y dos son estimaciones.
- Solo cubre créditos de consumo en pesos. No incluye hipotecarios ni créditos en UF.
- CalcuCuota es independiente: no pertenece a ningún banco ni está afiliada a ellos.

## Dónde verificar

- [CMF](https://www.cmfchile.cl): tasas de interés corriente y máxima convencional.
- [SERNAC](https://www.sernac.cl): comparador de créditos y derechos del consumidor financiero.
- [SII](https://www.sii.cl/valores_y_fechas/uf/uf2026.htm): valor de la UF.

## Aviso

Herramienta informativa. No constituye asesoría financiera ni legal. Si piensas publicarla o usarla comercialmente, consulta con un abogado y define la licencia que prefieras.
