import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module.js';
import { AllExceptionFilter } from '../src/common/filters/allExceptions.filter.js';

describe('BookVault All Routes (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let userToken: string;
  let adminId: number;
  let userId: number;
  let bookId: number;
  let borrowId: number;

  const adminEmail = `admin_${Date.now()}@bookvault.org`;
  const userEmail = `reader_${Date.now()}@bookvault.org`;
  const testPassword = 'password123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Register an ADMIN user (POST /auth/register)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Curator Eleanor',
        email: adminEmail,
        password: testPassword,
        role: 'ADMIN',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('ADMIN');
    adminId = res.body.data.id;
  });

  it('2. Login as ADMIN (POST /auth/login)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminEmail,
        password: testPassword,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    adminToken = res.body.data.token;
  });

  it('3. Register a regular USER (POST /auth/register)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Scholar Julian',
        email: userEmail,
        password: testPassword,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('USER');
    userId = res.body.data.id;
  });

  it('4. Login as USER (POST /auth/login)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: userEmail,
        password: testPassword,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    userToken = res.body.data.token;
  });

  it('5. Verify profile with AuthGuard (GET /auth/me)', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(adminId);
    expect(res.body.data.name).toBe('Curator Eleanor');
  });

  it('6. Create a book as ADMIN (POST /books)', async () => {
    const res = await request(app.getHttpServer())
      .post('/books')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Codex Seraphinianus',
        author: 'Luigi Serafini',
        category: 'FANTASY',
        description: 'An imaginary encyclopedia written in an unknown language.',
        isbn: `ISBN-${Date.now()}`,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Codex Seraphinianus');
    expect(res.body.data.is_available).toBe(true);
    bookId = res.body.data.id;
  });

  it('7. Get all books with filters (GET /books)', async () => {
    const resAll = await request(app.getHttpServer()).get('/books');
    expect(resAll.status).toBe(200);
    expect(resAll.body.success).toBe(true);
    expect(resAll.body.count).toBeGreaterThanOrEqual(1);

    const resFiltered = await request(app.getHttpServer())
      .get('/books')
      .query({ category: 'FANTASY', search: 'Codex' });

    expect(resFiltered.status).toBe(200);
    expect(resFiltered.body.success).toBe(true);
    expect(resFiltered.body.data.length).toBeGreaterThanOrEqual(1);
    expect(resFiltered.body.data[0].title).toBe('Codex Seraphinianus');
  });

  it('8. Get book by ID (GET /books/:id)', async () => {
    const res = await request(app.getHttpServer()).get(`/books/${bookId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(bookId);
    expect(res.body.data.is_available).toBe(true);
  });

  it('9. Update book as ADMIN (PATCH /books/:id)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/books/${bookId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        description: 'Updated archival description of the encyclopedia.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.description).toBe(
      'Updated archival description of the encyclopedia.',
    );
  });

  it('10. Borrow book as USER (POST /borrows)', async () => {
    const res = await request(app.getHttpServer())
      .post('/borrows')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        book_id: bookId,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.book_id).toBe(bookId);
    expect(res.body.data.status).toBe('BORROWED');
    borrowId = res.body.data.id;

    // Check book is now marked unavailable
    const bookCheck = await request(app.getHttpServer()).get(`/books/${bookId}`);
    expect(bookCheck.body.data.is_available).toBe(false);
  });

  it('11. Get current user borrows (GET /borrows/my)', async () => {
    const res = await request(app.getHttpServer())
      .get('/borrows/my')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].book_id).toBe(bookId);
  });

  it('12. Return book as USER (PATCH /borrows/:id/return)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/borrows/${borrowId}/return`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('RETURNED');

    // Check book availability restored to true
    const bookCheck = await request(app.getHttpServer()).get(`/books/${bookId}`);
    expect(bookCheck.body.data.is_available).toBe(true);
  });

  it('13. Leave a review (POST /reviews)', async () => {
    const res = await request(app.getHttpServer())
      .post('/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        book_id: bookId,
        rating: 5,
        comment: 'A masterpiece of surreal iconography and calligraphy.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rating).toBe(5);
  });

  it('14. Get reviews for a book (GET /reviews/book/:bookId)', async () => {
    const res = await request(app.getHttpServer()).get(`/reviews/book/${bookId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
    expect(res.body.average_rating).toBe(5);
    expect(res.body.data[0].reviewer_name).toBe('Scholar Julian');
  });

  it('15. Admin views all users (GET /users)', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('16. Admin updates user role (PATCH /users/:id/role)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/users/${userId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        role: 'ADMIN',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.new_role).toBe('ADMIN');

    // Revert role back to USER for clean state
    await request(app.getHttpServer())
      .patch(`/users/${userId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'USER' });
  });

  it('17. User views dashboard (GET /users/me/dashboard)', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me/dashboard')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe('Scholar Julian');
    expect(res.body.data.stats.total_borrows).toBe(1);
    expect(res.body.data.stats.currently_borrowed).toBe(0);
    expect(res.body.data.stats.average_rating_given).toBe(5);
    expect(res.body.data.recent_borrows.length).toBe(1);
  });

  it('18. Admin deletes a book (DELETE /books/:id)', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/books/${bookId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const checkRes = await request(app.getHttpServer()).get(`/books/${bookId}`);
    expect(checkRes.status).toBe(404);
  });
});
