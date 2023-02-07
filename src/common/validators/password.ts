import { registerDecorator } from 'class-validator';

export function IsPassword() {
  return (object: unknown, propertyName: string): void => {
    registerDecorator({
      name: 'IsPassword',
      target: object.constructor,
      propertyName,
      options: {
        message:
          'password must contain at least 8 characters of which 1 number,\n  1 uppercase and 1 lowercase letter, as well as one of the characters (_@$!%*#?&.-)',
      },
      validator: {
        validate(value: unknown) {
          return (
            typeof value === 'string' &&
            value.length > 0 &&
            Boolean(
              value.match(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_@$!%*#?&.-])[A-Za-z0-9\d_@$!%*#?&.-]{8,}$/i,
              ),
            )
          );
        },
      },
    });
  };
}
