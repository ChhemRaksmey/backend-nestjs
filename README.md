# NestJS Customer Desk

A class-based NestJS starter with EJS pages, reusable layouts/partials, and PostgreSQL-backed customer CRUD.

## Requirements

- Node.js 20+
- Docker Desktop (or a local PostgreSQL 16 instance)

## Run locally

1. Copy the example environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Install dependencies:

   ```powershell
   npm install
   ```

3. Start PostgreSQL:

   ```powershell
   docker compose up -d
   ```

4. Start NestJS:

   ```powershell
   npm run start:dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

The customer table is synchronized automatically when `DB_SYNC=true`. Keep `DB_SYNC=false` in production and use database migrations instead.
The customer list displays 10 records per page. Visit `/validation-example` for a non-persisting form that demonstrates string length, integer, decimal, date, time, and unique customer name/email validation.
Customer names are checked for duplicates by the service; the existing database contains duplicate names, so no database unique index is added.

## Project structure

- `src/controllers` — dashboard and customer page routes
- `src/services` — customer CRUD and persistence logic
- `src/models` — TypeORM entities
- `src/dto` — validated create/update request classes
- `src/config` — PostgreSQL configuration
- `src/middleware` — shared EJS view locals
- `src/routes` — customer route constants
- `src/utils` — shared pagination and formatting helpers
- `src/views` — EJS pages, layout, partials, and form component
- `public/styles` and `public/scripts` — custom frontend assets

The shared `PaginationUtil` builds page metadata and combines it with fetched records. Controllers can add any extra view values alongside the pagination result:

```ts
return {
  ...result,
  title: this.pageTitle,
  pageDscr: this.pageDscr,
};
```
