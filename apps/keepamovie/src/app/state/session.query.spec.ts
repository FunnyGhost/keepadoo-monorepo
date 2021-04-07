import { testUser } from '../../test-utilities/test-objects';
import { createInitialState } from './models/session-state';
import { SessionQuery } from './session.query';
import { SessionStore } from './session.store';

describe('SessionQuery', () => {
  let query: SessionQuery;
  let store: SessionStore;

  beforeEach(() => {
    store = new SessionStore();
    query = new SessionQuery(store);
  });

  test('should create an instance', () => {
    expect(query).toBeTruthy();
  });

  describe('isLoggedIn$', () => {
    test('should return true if there is a user', () => {
      store.update({ user: testUser });

      let isLoggedIn = false;
      query.isLoggedIn$.subscribe((data: boolean) => (isLoggedIn = data));

      expect(isLoggedIn).toEqual(true);
    });

    test('should return false if there is no user', () => {
      store.update({ user: null });

      let isLoggedIn = true;
      query.isLoggedIn$.subscribe((data: boolean) => (isLoggedIn = data));

      expect(isLoggedIn).toEqual(false);
    });
  });

  describe('loggedInUser$', () => {
    test('should return the logged in user display name', () => {
      store.update({ user: testUser });

      let user = '';
      query.loggedInUser$.subscribe((data: string) => (user = data));

      expect(user).toBe(`${testUser.displayName}`);
    });
  });

  describe('userId$', () => {
    test('should return the logged in userId', () => {
      store.update({ user: testUser });

      let userId = '';
      query.userId$.subscribe((data: string) => (userId = data));

      expect(userId).toBe(`${testUser.userId}`);
    });
  });

  describe('isLoggedIn', () => {
    test('should return true if the user is logged in', () => {
      store.update({ user: testUser });

      const result = query.isLoggedIn();

      expect(result).toBe(true);
    });

    test('should return false if the user is not logged in', () => {
      store.update({ user: null });

      const result = query.isLoggedIn();

      expect(result).toBe(false);
    });
  });

  describe('redirectUrl', () => {
    test('should return the redirectUrl', () => {
      const inputRedirectUrl = 'home';
      store.update({ redirectUrl: inputRedirectUrl });

      const result = query.redirectUrl();

      expect(result).toBe(inputRedirectUrl);
    });

    test('should return empty string if the redirectUrl was not set', () => {
      store.update(createInitialState());

      const result = query.redirectUrl();

      expect(result).toBe('');
    });
  });

  describe('userId', () => {
    test('should return the current user id', () => {
      store.update({ user: testUser });

      const result = query.userId();

      expect(result).toBe(testUser.userId);
    });

    test('should throw if the user is not logged in', () => {
      store.update(createInitialState());

      expect(() => query.userId()).toThrow();
    });
  });
});
