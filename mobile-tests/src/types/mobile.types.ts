export interface UserCredentials {
  username: string;
  password: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export type SwipeDirection = 'up' | 'down' | 'left' | 'right';
