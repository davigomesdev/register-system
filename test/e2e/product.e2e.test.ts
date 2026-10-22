import assert from 'node:assert/strict';
import { describe, it, before, after, mock } from 'node:test';
import { Decimal } from 'decimal.js';

import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import { ProductGenderEnum } from '#src/domain/enums/product-gender-enum.js';
import { ProductEntity } from '#src/modules/product/domain/product-entity.js';
import { ProductSearchResult, ProductSearchParams } from '#src/modules/product/domain/product-repository.js';

import {
  buildTestApp,
  createMockJwtService,
  createMockEnvService,
  createMockPersistenceService,
  createMockHashProvider,
  createMockAuditLogProvider,
  authHeader,
} from '../helpers/build-test-app.js';

describe('E2E /api/v1/products', () => {
  const product = new ProductEntity({
    sku: 'SKU-001',
    name: 'Product',
    slug: 'product',
    description: 'desc',
    costPrice: new Decimal('10.50'),
    gender: ProductGenderEnum.MALE,
  });

  const productRepository = {
    get: mock.fn(async () => product),
    search: mock.fn(
      async () =>
        new ProductSearchResult([product], 1, new ProductSearchParams({ filter: { search: null, gender: null }, options: {} })),
    ),
    createTx: mock.fn(async () => undefined),
    updateTx: mock.fn(async () => undefined),
    softDeleteTx: mock.fn(async () => undefined),
  };

  const deps = {
    jwtService: createMockJwtService({ accessLevel: UserTypeEnum.MASTER }),
    envService: createMockEnvService(),
    persistenceService: createMockPersistenceService(),
    hashProvider: createMockHashProvider(),
    auditLogProvider: createMockAuditLogProvider(),
    userRepository: {} as never,
    sessionRepository: {} as never,
    customerRepository: {} as never,
    productRepository: productRepository as never,
    auditLogRepository: {} as never,
  };

  let app: Awaited<ReturnType<typeof buildTestApp>>;

  before(async () => {
    app = await buildTestApp(deps);
  });

  after(async () => {
    await app?.close();
  });

  it('GET /products without auth should return 401', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/products' });
    assert.equal(res.statusCode, 401);
  });

  it('GET /products should search', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/products',
      headers: authHeader(),
    });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { data: unknown[]; meta: { total: number } };
    assert.equal(body.meta.total, 1);
  });

  it('GET /products/:id should return product', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/products/${product.id}`,
      headers: authHeader(),
    });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { data: { sku: string } };
    assert.equal(body.data.sku, 'SKU-001');
  });

  it('POST /products should create', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/products',
      headers: authHeader(),
      payload: {
        sku: 'SKU-002',
        name: 'New Product',
        costPrice: '15.00',
        gender: ProductGenderEnum.FEMALE,
      },
    });
    assert.equal(res.statusCode, 201);
    const body = res.json() as { data: { sku: string } };
    assert.equal(body.data.sku, 'SKU-002');
  });

  it('POST /products with invalid body should return 422', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/products',
      headers: authHeader(),
      payload: { sku: '', name: '', costPrice: '-1', gender: 'INVALID' },
    });
    assert.equal(res.statusCode, 422);
  });

  it('PUT /products/:id should update', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/products/${product.id}`,
      headers: authHeader(),
      payload: {
        sku: 'SKU-001',
        name: 'Updated',
        costPrice: '20',
        gender: ProductGenderEnum.UNDEFINED,
      },
    });
    assert.equal(res.statusCode, 200);
  });

  it('DELETE /products/:id should soft delete', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/products/${product.id}`,
      headers: authHeader(),
    });
    assert.equal(res.statusCode, 204);
  });
});
