export const LoginLocators = {
  loginMenu:            '~Login',
  usernameField:        '~input-email',
  passwordField:        '~input-password',
  loginButton:          '~button-LOGIN',
  emailErrorMessage:    '//*[@text="Please enter a valid email address"]',
  passwordErrorMessage: '//*[@text="Please enter at least 8 characters"]',

  successContainer:     'id=com.wdiodemoapp:id/parentPanel',
  successTextElement:   'android.widget.TextView',
} as const;
