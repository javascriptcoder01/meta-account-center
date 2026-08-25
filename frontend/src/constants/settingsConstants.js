
export const VISIBILITY_OPTIONS = Object.freeze({
  PUBLIC: 'PUBLIC',
  FRIENDS: 'FRIENDS',
  PRIVATE: 'PRIVATE',
});

export const ALLOWED_VISIBILITIES = Object.freeze(Object.values(VISIBILITY_OPTIONS));

export const TWO_FACTOR_METHODS = Object.freeze({
  SMS: 'SMS',
  AUTHENTICATOR_APP: 'AUTHENTICATOR_APP',
  EMAIL: 'EMAIL',
});

export const ALLOWED_TWO_FACTOR_METHODS = Object.freeze(Object.values(TWO_FACTOR_METHODS));
