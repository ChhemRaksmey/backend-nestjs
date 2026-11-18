import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Response } from 'express';
import { ValidationExampleDto } from '../dto/validation-example.dto';
import { VALIDATION_EXAMPLE_ROUTE } from '../routes/validation-example.routes';
import { CustomersService } from '../services/customers.service';

type ValidationFormValues = {
  name: string;
  quantity: string;
  amount: string;
  date: string;
  time: string;
  email: string;
};

@Controller()
export class ValidationExampleController {
  constructor(private readonly customersService: CustomersService) {}

  @Get(VALIDATION_EXAMPLE_ROUTE)
  index(): {
    title: string;
    formAction: string;
    values: ValidationFormValues;
    errors: Record<string, string[]>;
    success: boolean;
  } {
    return {
      title: 'Validation examples',
      formAction: VALIDATION_EXAMPLE_ROUTE,
      values: this.emptyValues(),
      errors: {},
      success: false,
    };
  }

  @Post(VALIDATION_EXAMPLE_ROUTE)
  async submit(
    @Body() body: Record<string, unknown>,
    @Res() response: Response,
  ): Promise<void> {
    const values: ValidationFormValues = {
      name: this.formValue(body.name),
      quantity: this.formValue(body.quantity),
      amount: this.formValue(body.amount),
      date: this.formValue(body.date),
      time: this.formValue(body.time),
      email: this.formValue(body.email),
    };
    const dto = plainToInstance(ValidationExampleDto, values);
    const validationErrors = await validate(dto);
    const errors: Record<string, string[]> = {};

    for (const validationError of validationErrors) {
      errors[validationError.property] = Object.values(
        validationError.constraints ?? {},
      );
    }

    if (
      !errors.name &&
      !(await this.customersService.isNameAvailable(dto.name))
    ) {
      errors.name = ['This name already exists in customers.name.'];
    }

    if (
      !errors.email &&
      !(await this.customersService.isEmailAvailable(dto.email))
    ) {
      errors.email = ['This email already exists in customers.email.'];
    }

    const success = Object.keys(errors).length === 0;
    response.status(success ? 200 : 422).render('validation-example', {
      title: 'Validation examples',
      formAction: VALIDATION_EXAMPLE_ROUTE,
      values,
      errors,
      success,
    });
  }

  private emptyValues(): ValidationFormValues {
    return {
      name: '',
      quantity: '',
      amount: '',
      date: '',
      time: '',
      email: '',
    };
  }

  private formValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }
}
