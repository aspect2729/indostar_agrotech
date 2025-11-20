# Backend Tests

This directory contains comprehensive tests for the Indostar E-commerce backend.

## Test Structure

- `conftest.py` - Pytest configuration and shared fixtures
- `test_token_service.py` - Unit tests for JWT token service
- `test_product_service.py` - Unit tests for product service
- `test_order_service.py` - Unit tests for order service
- `test_auth_endpoints.py` - Integration tests for authentication endpoints
- `test_product_endpoints.py` - Integration tests for product endpoints
- `test_order_endpoints.py` - Integration tests for order endpoints

## Running Tests

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run All Tests

```bash
pytest
```

### Run Specific Test File

```bash
pytest tests/test_token_service.py
```

### Run Tests with Coverage

```bash
pytest --cov=app --cov-report=html
```

### Run Only Unit Tests

```bash
pytest -m unit
```

### Run Only Integration Tests

```bash
pytest -m integration
```

## Test Coverage

The tests cover:

1. **Service Layer (Unit Tests)**
   - Token service: JWT creation, verification, and refresh
   - Product service: CRUD operations, search, and filtering
   - Order service: Order creation, pricing, inventory validation

2. **API Endpoints (Integration Tests)**
   - Authentication: Google OAuth flow, token refresh, logout
   - Products: CRUD operations with role-based access control
   - Orders: Order creation, retrieval, and status updates

3. **Authentication Flows**
   - Token generation and verification
   - Role-based authorization
   - Protected endpoint access

## Fixtures

Common fixtures available in `conftest.py`:

- `client` - Async HTTP client for API testing
- `sample_consumer_user` - Sample consumer user object
- `sample_owner_user` - Sample owner user object
- `sample_distributor_user` - Sample distributor user object
- `consumer_access_token` - JWT token for consumer
- `owner_access_token` - JWT token for owner
- `distributor_access_token` - JWT token for distributor
- `sample_product_data` - Sample product data
- `sample_address_data` - Sample address data

## Notes

- **MongoDB Required**: Most tests require a running MongoDB instance at `localhost:27017`
- Token service tests (unit tests) don't require MongoDB but the test setup tries to connect
- Some integration tests may require mocking external services (Google OAuth)
- Test database is cleaned up after test execution
- To run tests without MongoDB, you can skip the database setup fixture or run only token service tests

## Running Tests Without MongoDB

The token service tests are pure unit tests and don't require MongoDB. However, the current setup tries to connect to MongoDB for all tests. To run these tests:

1. Start MongoDB locally, or
2. Modify the `setup_database` fixture in `conftest.py` to skip connection for unit tests

## Test Results Summary

- **Token Service Tests**: 8 unit tests covering JWT token creation, verification, and refresh
- **Product Service Tests**: 9 tests covering CRUD operations, search, and filtering
- **Order Service Tests**: 6 tests covering order creation, pricing, and shipping calculations
- **Auth Endpoint Tests**: 6 integration tests for authentication flows
- **Product Endpoint Tests**: 10 integration tests for product API with role-based access
- **Order Endpoint Tests**: 9 integration tests for order API with authorization
