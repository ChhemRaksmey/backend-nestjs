import { Controller, Get, Render } from '@nestjs/common';
import { CustomersService } from '../services/customers.service';

@Controller()
export class PublicController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @Render('dashboard')
  async dashboard(): Promise<{ title: string; customerCount: number }> {
    return {
      title: 'Overview',
      customerCount: await this.customersService.count(),
    };
  }
}
