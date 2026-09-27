import {
  createDefaultProfile,
  getInitials,
  mergeProfile,
  profilesEqual,
  validateProfile,
} from '@/utils/profile';
import type { UserProfile } from '@/types';

const base: UserProfile = {
  firstName: 'Tilly',
  lastName: 'Doe',
  email: 'tilly@doe.com',
  phoneNumber: '(217) 555-0113',
  avatarUri: null,
  notifications: {
    orderStatuses: true,
    passwordChanges: true,
    specialOffers: true,
    newsletter: true,
  },
};

describe('getInitials', () => {
  it('returns two initials from first and last name', () => {
    expect(getInitials('Tilly', 'Doe')).toBe('TD');
  });

  it('returns one initial when only first name is present', () => {
    expect(getInitials('Tilly', '')).toBe('T');
  });

  it('handles empty and whitespace values safely', () => {
    expect(getInitials('   ', '   ')).toBe('');
    expect(getInitials(' tilly ', ' doe ')).toBe('TD');
  });
});

describe('validateProfile', () => {
  it('passes for a valid profile', () => {
    expect(validateProfile(base)).toEqual({});
  });

  it('requires a non-whitespace first name', () => {
    expect(validateProfile({ ...base, firstName: '   ' }).firstName).toBeDefined();
  });

  it('requires a valid email', () => {
    expect(validateProfile({ ...base, email: '' }).email).toBeDefined();
    expect(validateProfile({ ...base, email: 'not-an-email' }).email).toBeDefined();
  });

  it('accepts an empty (optional) phone number', () => {
    expect(validateProfile({ ...base, phoneNumber: '' }).phoneNumber).toBeUndefined();
  });

  it('rejects an incomplete phone number', () => {
    expect(validateProfile({ ...base, phoneNumber: '(217) 555' }).phoneNumber).toBeDefined();
  });
});

describe('mergeProfile', () => {
  it('uses onboarding data when no profile is saved', () => {
    const merged = mergeProfile(null, { firstName: 'Tilly', email: 'tilly@doe.com' });
    expect(merged.firstName).toBe('Tilly');
    expect(merged.email).toBe('tilly@doe.com');
    expect(merged.lastName).toBe('');
  });

  it('prefers saved values over onboarding', () => {
    const saved = { ...base, firstName: 'Saved', email: 'saved@x.com' };
    const merged = mergeProfile(saved, { firstName: 'Tilly', email: 'tilly@doe.com' });
    expect(merged.firstName).toBe('Saved');
    expect(merged.email).toBe('saved@x.com');
    expect(merged.notifications).toEqual(saved.notifications);
  });

  it('falls back to onboarding when a saved field is empty', () => {
    const saved = { ...base, firstName: '', email: '' };
    const merged = mergeProfile(saved, { firstName: 'Tilly', email: 'tilly@doe.com' });
    expect(merged.firstName).toBe('Tilly');
    expect(merged.email).toBe('tilly@doe.com');
  });
});

describe('profilesEqual', () => {
  it('is true for identical profiles', () => {
    expect(profilesEqual(base, { ...base })).toBe(true);
  });

  it('is false when a field differs', () => {
    expect(profilesEqual(base, { ...base, lastName: 'Smith' })).toBe(false);
  });

  it('is false when a notification differs', () => {
    expect(
      profilesEqual(base, {
        ...base,
        notifications: { ...base.notifications, newsletter: false },
      }),
    ).toBe(false);
  });
});

describe('createDefaultProfile', () => {
  it('seeds an empty profile with notifications on', () => {
    const created = createDefaultProfile(null);
    expect(created.avatarUri).toBeNull();
    expect(created.firstName).toBe('');
    expect(created.notifications.orderStatuses).toBe(true);
  });
});
