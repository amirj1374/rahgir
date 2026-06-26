# بیزنس‌کور (BusinessCore)

سیستم یکپارچه مدیریت کسب‌وکار (ERP) با رابط کاربری فارسی و راست‌به‌چپ.
شامل ماژول‌های اطلاعات پایه، فروش، انبارداری، CRM، حسابداری، گزارشات و تامین‌کنندگان.

## معماری

```
rahgir/
├── backend/    Spring Boot 3.3 · Java 21 · JPA · PostgreSQL  (REST API)
└── frontend/   React 19 · Vite 8 · TypeScript 6 · TanStack Query  (SPA)
```

### بک‌اند
معماری لایه‌ای تمیز:

```
Controller  →  Service  →  Repository  →  PostgreSQL
   (REST)      (business)    (JPA)
```

- **DTO** با record‌های جاوا ۲۱ و اعتبارسنجی (`@Valid` / Bean Validation)
- **پاسخ یکپارچه** در قالب `ApiResponse<T>` → `{ success, data, message }`
- **مدیریت خطای سراسری** با `@RestControllerAdvice` (۴۰۴ / ۴۰۰ / ۵۰۰)
- **Seed خودکار** داده‌های اولیه در اولین اجرا (`DataSeeder`)

### فرانت‌اند
- **TanStack Query** برای دیتافچینگ، کش و هم‌گام‌سازی خودکار
- **Code splitting**: هر ماژول به‌صورت `lazy` و chunk جدا بارگذاری می‌شود
- **Axios interceptor** که envelope بک‌اند را باز می‌کند
- سیستم طراحی مشترک (`styles/tokens.ts`، `components/ui/*`)

## راه‌اندازی

### پیش‌نیازها
- Java 21، Maven
- Node.js 22+
- PostgreSQL (دیتابیسی به نام `businesscore`)

### بک‌اند
```bash
cd backend
# متغیرهای محیطی (اختیاری، پیش‌فرض postgres/postgres):
export DB_USER=postgres DB_PASS=postgres
mvn spring-boot:run        # روی http://localhost:8080
```

### فرانت‌اند
```bash
cd frontend
npm install
npm run dev                # روی http://localhost:5173 (پراکسی /api → :8080)
```

## تست

```bash
# بک‌اند (JUnit + MockMvc روی H2)
cd backend && mvn test

# فرانت‌اند (Vitest + Testing Library)
cd frontend && npm test
```

## اسکریپت‌های فرانت‌اند

| دستور | کار |
|-------|-----|
| `npm run dev` | سرور توسعه |
| `npm run build` | بیلد production (`tsc -b && vite build`) |
| `npm run lint` | بررسی کد با oxlint |
| `npm test` | اجرای تست‌ها |
| `npm run preview` | پیش‌نمایش بیلد |

## CI

در هر push و pull request، گردش‌کار `.github/workflows/ci.yml`:
- **بک‌اند**: `mvn verify`
- **فرانت‌اند**: `lint` → `test` → `build`

## نقشه راه

- [ ] احراز هویت (Spring Security + JWT) و صفحه ورود
- [ ] تکمیل CRUD فرانت (ویرایش/حذف برای همه‌ی موجودیت‌ها)
- [ ] صفحه‌بندی (pagination) سمت سرور
- [ ] پیاده‌سازی بک‌اند ماژول‌های فروش، انبار، حسابداری و...
- [ ] اتصال واقعی ووکامرس
